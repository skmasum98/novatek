/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Link2,
  Lock,
  Search,
  Settings,
  UserCheck,
} from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExamWorkspace } from './components/ExamWorkspace';
import { LeaderboardView } from './components/LeaderboardView';
import { ManagerStudio } from './components/ManagerStudio';
import { ProfileModal } from './components/ProfileModal';
import { ResilientImage } from './components/ResilientImage';
import { StudyWorkspace } from './components/StudyWorkspace';
import { TranscriptsView } from './components/TranscriptsView';
import {
  buildShareableExamUrl,
  clearExamParamFromUrl,
  copyTextToClipboard,
  readExamIdFromUrl,
  readStoredPendingExamId,
  setExamParamInUrl,
  writeStoredPendingExamId,
} from './lib/examLinks';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import {
  BLUEPRINT_LIMITS,
  getMissingRegistrationFields,
  isColleagueRegistrationComplete,
  isValidMobileNo,
  sanitizeEmployeeId,
} from './lib/validation';
import {
  checkUserIsAdmin,
  ensureUserProfile,
  fetchProductSubcollections,
  markStudyResourceCompleted,
  seedFlagshipCurriculum,
  submitProductExam,
  updateColleagueProfile,
} from './services/academyService';
import { NOVATEK_FLAGSHIP_CURRICULUM } from './data/seedCurriculum';
import {
  NOVATEK_DESIGNATIONS,
  NOVATEK_REGIONS,
  THERAPEUTIC_CLASSES,
  type AdminRecord,
  type ColleagueRegistrationInput,
  type ExamQuestion,
  type ExamSubmission,
  type LeaderboardEntry,
  type LearningProgress,
  type LearningResource,
  type PrivateUserInfo,
  type ProductModule,
  type PublicProfile,
} from './types/models';

type ActiveRoute = 'catalog' | 'study' | 'exam' | 'leaderboard' | 'transcripts' | 'admin';

function sortPortfolioProducts(a: ProductModule, b: ProductModule): number {
  if (a.id === 'prod_gaprito_50' && b.id !== 'prod_gaprito_50') return -1;
  if (b.id === 'prod_gaprito_50' && a.id !== 'prod_gaprito_50') return 1;
  return a.brandName.localeCompare(b.brandName);
}

const PENDING_REGISTRATION_STORAGE_KEY = 'novatek_pending_colleague_registration';

function readPendingRegistration(): ColleagueRegistrationInput | null {
  try {
    const raw = window.sessionStorage.getItem(PENDING_REGISTRATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ColleagueRegistrationInput>;
    if (
      typeof parsed.displayName === 'string' &&
      typeof parsed.employeeId === 'string' &&
      typeof parsed.territory === 'string' &&
      typeof parsed.area === 'string' &&
      typeof parsed.region === 'string' &&
      typeof parsed.mobileNo === 'string'
    ) {
      return {
        displayName: parsed.displayName,
        employeeId: parsed.employeeId,
        designation:
          typeof parsed.designation === 'string' && parsed.designation.trim()
            ? parsed.designation
            : NOVATEK_DESIGNATIONS[0],
        territory: parsed.territory,
        area: parsed.area,
        region: parsed.region,
        mobileNo: parsed.mobileNo,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function writePendingRegistration(data: ColleagueRegistrationInput | null): void {
  try {
    if (!data) {
      window.sessionStorage.removeItem(PENDING_REGISTRATION_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(PENDING_REGISTRATION_STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // Ignore storage unavailability in restricted contexts
  }
}

function NovatekAcademyPortal() {
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [privateInfo, setPrivateInfo] = useState<PrivateUserInfo | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Pre-Sign-In ("Before Registration") Landing Form State
  const [landingAuthTab, setLandingAuthTab] = useState<'register' | 'signin'>('register');
  const [preName, setPreName] = useState('');
  const [preEmployeeId, setPreEmployeeId] = useState('');
  const [preDesignation, setPreDesignation] = useState<string>(NOVATEK_DESIGNATIONS[0]);
  const [preTerritory, setPreTerritory] = useState('');
  const [preArea, setPreArea] = useState('');
  const [preRegion, setPreRegion] = useState<string>(NOVATEK_REGIONS[0]);
  const [preMobileNo, setPreMobileNo] = useState('');
  const pendingRegRef = useRef<ColleagueRegistrationInput | null>(null);
  const explicitSignInTriggeredRef = useRef(false);

  // Navigation & Modal State
  const [route, setRoute] = useState<ActiveRoute>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [adminTargetProductId, setAdminTargetProductId] = useState<string | null>(null);
  const [leaderboardFilterId, setLeaderboardFilterId] = useState<string>('overall');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [onboardingPromptMode, setOnboardingPromptMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCardExamId, setCopiedCardExamId] = useState<string | null>(null);

  // Shareable Direct Exam Link & Post-Profile Exam Launch State
  const [pendingSharedExamId, setPendingSharedExamId] = useState<string | null>(() => {
    const fromUrl = readExamIdFromUrl();
    if (fromUrl) {
      writeStoredPendingExamId(fromUrl);
      return fromUrl;
    }
    return readStoredPendingExamId();
  });
  const [pendingExamAfterProfileId, setPendingExamAfterProfileId] = useState<string | null>(null);

  // Real-Time Firestore Collections
  const [publishedProducts, setPublishedProducts] = useState<ProductModule[]>([]);
  const [draftProducts, setDraftProducts] = useState<ProductModule[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [leaderboardLoaded, setLeaderboardLoaded] = useState(false);
  const [progressByProduct, setProgressByProduct] = useState<Record<string, LearningProgress>>({});
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [mySubmissions, setMySubmissions] = useState<ExamSubmission[]>([]);
  const [managerSubmissions, setManagerSubmissions] = useState<ExamSubmission[]>([]);
  const [colleagueProfiles, setColleagueProfiles] = useState<PublicProfile[]>([]);
  const [adminRecords, setAdminRecords] = useState<AdminRecord[]>([]);

  // Active Product Subcollections (Study & Exam)
  const [activeResources, setActiveResources] = useState<LearningResource[]>([]);
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [loadedSubcollectionProductId, setLoadedSubcollectionProductId] = useState<string | null>(
    null
  );
  const [loadingSubcollections, setLoadingSubcollections] = useState(false);

  // Catalog Filters
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [seedingBusy, setSeedingBusy] = useState(false);
  const autoSeededOnceRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const navigateAwayFromExam = (nextRoute: Exclude<ActiveRoute, 'exam'>) => {
    clearExamParamFromUrl();
    setRoute(nextRoute);
  };

  useEffect(() => {
    const handlePopState = () => {
      const urlExamId = readExamIdFromUrl();
      if (urlExamId) {
        writeStoredPendingExamId(urlExamId);
        setPendingSharedExamId(urlExamId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const registrationComplete = useMemo(
    () => isColleagueRegistrationComplete(publicProfile, privateInfo),
    [publicProfile, privateInfo]
  );

  const missingRegistrationFields = useMemo(
    () => getMissingRegistrationFields(publicProfile, privateInfo),
    [publicProfile, privateInfo]
  );

  const sharedExamPreviewTitle = useMemo(() => {
    if (!pendingSharedExamId) return null;
    const match = NOVATEK_FLAGSHIP_CURRICULUM.find(
      (b) => b.product.id === pendingSharedExamId
    );
    return match ? match.product.brandName : 'Invited Product Certification Exam';
  }, [pendingSharedExamId]);

  // 1. Auth Listener & Profile Bootstrap (applies Pre-Sign-In Registration if provided)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setIsAdmin(false);
        setPublicProfile(null);
        setPrivateInfo(null);
        setProfileLoaded(false);
        setAuthReady(true);
        return;
      }

      setProfileLoaded(false);
      try {
        const adminStatus = await checkUserIsAdmin(user);
        setIsAdmin(adminStatus);
        const pendingReg = pendingRegRef.current || readPendingRegistration();
        const { publicProfile: pub, privateInfo: priv } = await ensureUserProfile(
          user,
          adminStatus,
          pendingReg
        );
        if (pendingReg) {
          pendingRegRef.current = null;
          writePendingRegistration(null);
        }
        setPublicProfile(pub);
        setPrivateInfo(priv);

        // Post-Sign-In ("After Registration"): if user just signed in and any of the 6 fields are missing, prompt immediately
        if (explicitSignInTriggeredRef.current && !isColleagueRegistrationComplete(pub, priv)) {
          setOnboardingPromptMode(true);
          setProfileModalOpen(true);
        }
        explicitSignInTriggeredRef.current = false;
      } catch (err) {
        console.error('Profile initialization failed:', err);
      } finally {
        setProfileLoaded(true);
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // 2. Real-Time Firestore Subscriptions
  useEffect(() => {
    if (!authReady || !currentUser) {
      setPublishedProducts([]);
      setDraftProducts([]);
      setProductsLoaded(false);
      setLeaderboardLoaded(false);
      setProgressByProduct({});
      setLeaderboardEntries([]);
      setMySubmissions([]);
      setManagerSubmissions([]);
      setColleagueProfiles([]);
      setAdminRecords([]);
      return;
    }

    const unsubs: Array<() => void> = [];

    // Live Own Public Profile Watcher (/profiles/{uid})
    unsubs.push(
      onSnapshot(
        doc(db, 'profiles', currentUser.uid),
        (snap) => {
          if (snap.exists()) {
            setPublicProfile(snap.data() as PublicProfile);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, `profiles/${currentUser.uid}`)
      )
    );

    // Live Own Private Info Watcher (/users_private/{uid})
    unsubs.push(
      onSnapshot(
        doc(db, 'users_private', currentUser.uid),
        (snap) => {
          if (snap.exists()) {
            setPrivateInfo(snap.data() as PrivateUserInfo);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, `users_private/${currentUser.uid}`)
      )
    );

    // Published Products (visible to all signed-in colleagues)
    const productsQuery = query(collection(db, 'products'), where('status', '==', 'published'));
    unsubs.push(
      onSnapshot(
        productsQuery,
        (snap) => {
          const list = snap.docs
            .map((d) => d.data() as ProductModule)
            .sort(sortPortfolioProducts);
          setPublishedProducts(list);
          setProductsLoaded(true);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'products')
      )
    );

    // Live Admin Status Watcher on own /admins/{uid} document (single-doc get, no collection scan)
    unsubs.push(
      onSnapshot(
        doc(db, 'admins', currentUser.uid),
        (snap) => {
          const isBootstrapped =
            currentUser.emailVerified && currentUser.email === BOOTSTRAPPED_ADMIN_EMAIL;
          setIsAdmin(isBootstrapped || snap.exists());
        },
        (err) => handleFirestoreError(err, OperationType.GET, `admins/${currentUser.uid}`)
      )
    );

    // Colleague's Own Learning Progress
    const progressQuery = query(
      collection(db, 'learning_progress'),
      where('userId', '==', currentUser.uid)
    );
    unsubs.push(
      onSnapshot(
        progressQuery,
        (snap) => {
          const map: Record<string, LearningProgress> = {};
          for (const d of snap.docs) {
            const data = d.data() as LearningProgress;
            map[data.productId] = data;
          }
          setProgressByProduct(map);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'learning_progress')
      )
    );

    // Organization Leaderboard
    const lbQuery = query(collection(db, 'leaderboard'), where('visibility', '==', 'org'));
    unsubs.push(
      onSnapshot(
        lbQuery,
        (snap) => {
          setLeaderboardEntries(snap.docs.map((d) => d.data() as LeaderboardEntry));
          setLeaderboardLoaded(true);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'leaderboard')
      )
    );

    // Own Exam Submissions (Transcripts)
    const mySubQuery = query(
      collection(db, 'exam_submissions'),
      where('userId', '==', currentUser.uid)
    );
    unsubs.push(
      onSnapshot(
        mySubQuery,
        (snap) => {
          const list = snap.docs
            .map((d) => d.data() as ExamSubmission)
            .sort((a, b) => {
              const ta = a.createdAt?.toMillis?.() ?? 0;
              const tb = b.createdAt?.toMillis?.() ?? 0;
              return tb - ta;
            });
          setMySubmissions(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'exam_submissions')
      )
    );

    // Admin-Specific Subscriptions (Draft Products, All Submissions, Colleague Directory)
    if (isAdmin) {
      const isBootstrapped =
        currentUser.emailVerified && currentUser.email === BOOTSTRAPPED_ADMIN_EMAIL;

      const draftsQuery = isBootstrapped
        ? query(collection(db, 'products'), where('status', '==', 'draft'))
        : query(collection(db, 'products'), where('authorId', '==', currentUser.uid));

      unsubs.push(
        onSnapshot(
          draftsQuery,
          (snap) => {
            const drafts = snap.docs
              .map((d) => d.data() as ProductModule)
              .filter((p) => p.status === 'draft');
            setDraftProducts(drafts);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'products')
        )
      );

      const mgrSubQuery = isBootstrapped
        ? query(collection(db, 'exam_submissions'), where('visibility', '==', 'org'))
        : query(
            collection(db, 'exam_submissions'),
            where('productAuthorId', '==', currentUser.uid)
          );

      unsubs.push(
        onSnapshot(
          mgrSubQuery,
          (snap) => {
            const list = snap.docs
              .map((d) => d.data() as ExamSubmission)
              .sort((a, b) => {
                const ta = a.createdAt?.toMillis?.() ?? 0;
                const tb = b.createdAt?.toMillis?.() ?? 0;
                return tb - ta;
              });
            setManagerSubmissions(list);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'exam_submissions')
        )
      );

      const profilesQuery = query(collection(db, 'profiles'), where('visibility', '==', 'org'));
      unsubs.push(
        onSnapshot(
          profilesQuery,
          (snap) => {
            setColleagueProfiles(snap.docs.map((d) => d.data() as PublicProfile));
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'profiles')
        )
      );

      let orgAdmins: AdminRecord[] = [];
      let grantedByMeAdmins: AdminRecord[] = [];
      const syncMergedAdmins = () => {
        const merged = new Map<string, AdminRecord>();
        for (const a of orgAdmins) merged.set(a.uid, a);
        for (const a of grantedByMeAdmins) merged.set(a.uid, a);
        setAdminRecords(Array.from(merged.values()));
      };

      unsubs.push(
        onSnapshot(
          query(collection(db, 'admins'), where('visibility', '==', 'org')),
          (snap) => {
            orgAdmins = snap.docs.map((d) => d.data() as AdminRecord);
            syncMergedAdmins();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'admins')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'admins'), where('grantedBy', '==', currentUser.uid)),
          (snap) => {
            grantedByMeAdmins = snap.docs.map((d) => d.data() as AdminRecord);
            syncMergedAdmins();
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'admins')
        )
      );
    } else {
      setDraftProducts([]);
      setAdminRecords([]);
    }

    return () => {
      for (const fn of unsubs) fn();
    };
  }, [authReady, currentUser, isAdmin]);

  const allAdminProducts = useMemo(() => {
    const map = new Map<string, ProductModule>();
    for (const p of publishedProducts) map.set(p.id, p);
    for (const d of draftProducts) map.set(d.id, d);
    return Array.from(map.values()).sort(sortPortfolioProducts);
  }, [publishedProducts, draftProducts]);

  const hasMissingFlagshipModule = useMemo(
    () =>
      NOVATEK_FLAGSHIP_CURRICULUM.some(
        (bundle) => !allAdminProducts.some((p) => p.id === bundle.product.id)
      ),
    [allAdminProducts]
  );

  // Auto-seed any missing flagship portfolio module (e.g. Gaprito 50 mg) on Admin session
  useEffect(() => {
    if (
      authReady &&
      currentUser &&
      isAdmin &&
      productsLoaded &&
      hasMissingFlagshipModule &&
      !autoSeededOnceRef.current
    ) {
      autoSeededOnceRef.current = true;
      setSeedingBusy(true);
      seedFlagshipCurriculum(currentUser.uid)
        .then((seededIds) => {
          if (seededIds.includes('prod_gaprito_50')) {
            showToast(
              'Gaprito (গ্যাপ্রিটো ৫০ মি.গ্রা.) বাংলা ট্রেনিং শিট ও ১০০ নম্বরের পরীক্ষা যুক্ত হয়েছে।'
            );
          } else if (seededIds.length > 0) {
            showToast('Initialized Novatek flagship pharmaceutical modules.');
          }
        })
        .catch((err) => {
          console.error('Initial curriculum seed skipped:', err);
        })
        .finally(() => {
          setSeedingBusy(false);
        });
    }
  }, [authReady, currentUser, isAdmin, productsLoaded, hasMissingFlagshipModule]);

  const selectedProduct = useMemo(
    () => allAdminProducts.find((p) => p.id === selectedProductId) || null,
    [allAdminProducts, selectedProductId]
  );

  // Load Resources & Questions when opening Study or Exam view
  useEffect(() => {
    if (!selectedProduct || (route !== 'study' && route !== 'exam')) return;
    let cancelled = false;
    setLoadingSubcollections(true);
    fetchProductSubcollections(
      selectedProduct.id,
      selectedProduct.status,
      selectedProduct.authorId
    )
      .then(({ resources, questions }) => {
        if (!cancelled) {
          setActiveResources(resources);
          setActiveQuestions(questions);
          setLoadedSubcollectionProductId(selectedProduct.id);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSubcollections(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProduct?.id, selectedProduct?.resourceCount, selectedProduct?.questionCount, route]);

  const handleDirectGoogleSignIn = async () => {
    setAuthBusy(true);
    setAuthError(null);
    explicitSignInTriggeredRef.current = true;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      explicitSignInTriggeredRef.current = false;
      const msg = err instanceof Error ? err.message : 'Google Sign-In was cancelled.';
      setAuthError(msg);
    } finally {
      setAuthBusy(false);
    }
  };

  const handlePreRegisterAndSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (preName.trim().length < BLUEPRINT_LIMITS.DISPLAY_NAME_MIN) {
      setAuthError('Please enter your full Name (at least 2 characters).');
      return;
    }
    const cleanEmpId = sanitizeEmployeeId(preEmployeeId);
    if (cleanEmpId.length < BLUEPRINT_LIMITS.EMPLOYEE_CODE_MIN) {
      setAuthError('Please enter your official Novatek Employee ID.');
      return;
    }
    if (preTerritory.trim().length < BLUEPRINT_LIMITS.TERRITORY_MIN) {
      setAuthError('Please enter your assigned Territory.');
      return;
    }
    if (preArea.trim().length < BLUEPRINT_LIMITS.AREA_MIN) {
      setAuthError('Please enter your assigned Area.');
      return;
    }
    if (preRegion.trim().length < BLUEPRINT_LIMITS.REGION_MIN) {
      setAuthError('Please select your assigned Region.');
      return;
    }
    if (!isValidMobileNo(preMobileNo)) {
      setAuthError('Please enter a valid Mobile No (7 to 15 digits, e.g. 01711-223344).');
      return;
    }

    const payload: ColleagueRegistrationInput = {
      displayName: preName.trim(),
      employeeId: cleanEmpId,
      designation: preDesignation,
      territory: preTerritory.trim(),
      area: preArea.trim(),
      region: preRegion.trim(),
      mobileNo: preMobileNo.trim(),
    };

    pendingRegRef.current = payload;
    writePendingRegistration(payload);
    explicitSignInTriggeredRef.current = true;

    setAuthBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      explicitSignInTriggeredRef.current = false;
      const msg = err instanceof Error ? err.message : 'Google Sign-In was cancelled.';
      setAuthError(msg);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleOpenRegistrationModal = (asOnboarding = false) => {
    setOnboardingPromptMode(asOnboarding);
    setProfileModalOpen(true);
  };

  const launchDirectExamForProduct = (prod: ProductModule) => {
    const alreadyAttempted = leaderboardEntries.some(
      (e) => e.userId === currentUser?.uid && e.productId === prod.id
    );

    if (prod.examEnabled === false) {
      clearExamParamFromUrl();
      setSelectedProductId(prod.id);
      setRoute('study');
      showToast(`Exam for ${prod.brandName} is currently paused by an Administrator.`);
      return;
    }

    if (prod.allowRetakes === false && alreadyAttempted) {
      clearExamParamFromUrl();
      setSelectedProductId(prod.id);
      setRoute('study');
      showToast(`You have already completed the single-attempt exam for ${prod.brandName}.`);
      return;
    }

    if (!registrationComplete) {
      setSelectedProductId(prod.id);
      setPendingExamAfterProfileId(prod.id);
      setExamParamInUrl(prod.id);
      showToast(
        `Complete required information (${missingRegistrationFields.join(', ')}) to start ${
          prod.brandName
        } exam.`
      );
      handleOpenRegistrationModal(true);
      return;
    }

    setPendingExamAfterProfileId(null);
    setSelectedProductId(prod.id);
    setExamParamInUrl(prod.id);
    setRoute('exam');
  };

  const handleRequestStartExam = () => {
    if (!selectedProduct) return;
    launchDirectExamForProduct(selectedProduct);
  };

  // Resolve shared ?exam=<productId> link automatically once user & products are ready
  useEffect(() => {
    if (
      !pendingSharedExamId ||
      !authReady ||
      !currentUser ||
      !profileLoaded ||
      !productsLoaded ||
      !leaderboardLoaded ||
      seedingBusy
    ) {
      return;
    }
    if (isAdmin && hasMissingFlagshipModule && !autoSeededOnceRef.current) {
      return;
    }

    const targetId = pendingSharedExamId;
    setPendingSharedExamId(null);
    writeStoredPendingExamId(null);

    const targetProd = publishedProducts.find((p) => p.id === targetId);
    if (targetProd) {
      launchDirectExamForProduct(targetProd);
    } else {
      clearExamParamFromUrl();
      showToast('The shared exam link could not be found or is currently unpublished.');
    }
  }, [
    pendingSharedExamId,
    authReady,
    currentUser,
    profileLoaded,
    productsLoaded,
    leaderboardLoaded,
    seedingBusy,
    isAdmin,
    hasMissingFlagshipModule,
    publishedProducts,
    leaderboardEntries,
    registrationComplete,
  ]);

  const handleCopyCardExamLink = async (prod: ProductModule) => {
    const ok = await copyTextToClipboard(buildShareableExamUrl(prod.id));
    if (ok) {
      setCopiedCardExamId(prod.id);
      showToast(`Copied direct exam link for ${prod.brandName}.`);
      window.setTimeout(() => {
        setCopiedCardExamId((prev) => (prev === prod.id ? null : prev));
      }, 2500);
    }
  };

  const handleSignOut = async () => {
    setProfileModalOpen(false);
    setOnboardingPromptMode(false);
    setPendingExamAfterProfileId(null);
    clearExamParamFromUrl();
    await signOut(auth);
    setRoute('catalog');
    setSelectedProductId(null);
  };

  const filteredProducts = useMemo(() => {
    return publishedProducts.filter((p) => {
      if (divisionFilter !== 'ALL' && p.therapeuticClass !== divisionFilter) return false;
      if (catalogSearch.trim()) {
        const q = catalogSearch.trim().toLowerCase();
        return (
          p.brandName.toLowerCase().includes(q) ||
          p.genericComposition.toLowerCase().includes(q) ||
          p.therapeuticClass.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [publishedProducts, divisionFilter, catalogSearch]);

  const completedModulesCount = useMemo(
    () => publishedProducts.filter((p) => progressByProduct[p.id]?.isModuleCompleted).length,
    [publishedProducts, progressByProduct]
  );

  const myCertifiedCount = useMemo(
    () =>
      leaderboardEntries.filter((e) => e.userId === currentUser?.uid && e.passed).length,
    [leaderboardEntries, currentUser?.uid]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => navigateAwayFromExam('catalog')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Novatek Academy
          </button>

          {/* Zone 2: 4 concise single-line text navigation links */}
          {currentUser ? (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button
                type="button"
                onClick={() => navigateAwayFromExam('catalog')}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  route === 'catalog' || route === 'study' || route === 'exam'
                    ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-teal-700'
                    : 'hover:text-slate-900'
                }`}
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => {
                  setLeaderboardFilterId('overall');
                  navigateAwayFromExam('leaderboard');
                }}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  route === 'leaderboard'
                    ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-teal-700'
                    : 'hover:text-slate-900'
                }`}
              >
                Leaderboard
              </button>
              <button
                type="button"
                onClick={() => navigateAwayFromExam('transcripts')}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  route === 'transcripts'
                    ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-teal-700'
                    : 'hover:text-slate-900'
                }`}
              >
                My Transcripts
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminTargetProductId(selectedProductId);
                  navigateAwayFromExam('admin');
                }}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  route === 'admin'
                    ? 'text-slate-900 underline underline-offset-8 decoration-2 decoration-teal-700'
                    : 'hover:text-slate-900'
                }`}
              >
                Admin Panel
              </button>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a
                href="#workflow"
                className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Learning Workflow
              </a>
              <a
                href="#divisions"
                className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Divisions
              </a>
              <a
                href="#assessment"
                className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Certification
              </a>
              <a
                href="#leaderboard-info"
                className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Standings
              </a>
            </nav>
          )}

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            {currentUser && publicProfile ? (
              <button
                type="button"
                onClick={() => handleOpenRegistrationModal(!registrationComplete)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer truncate max-w-[220px] ${
                  registrationComplete
                    ? 'text-slate-800 bg-slate-100 hover:bg-slate-200'
                    : 'text-amber-950 bg-amber-100 hover:bg-amber-200'
                }`}
              >
                {registrationComplete
                  ? publicProfile.displayName
                  : `Complete Info · ${publicProfile.displayName}`}
              </button>
            ) : (
              <button
                type="button"
                disabled={authBusy}
                onClick={() => {
                  setLandingAuthTab('signin');
                  void handleDirectGoogleSignIn();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {authBusy ? 'Signing In...' : 'Colleague Sign In'}
              </button>
            )}
          </div>
        </div>

        {/* Compact Mobile Secondary Nav Row */}
        {currentUser && (
          <div className="flex md:hidden items-center gap-5 px-6 py-2.5 border-t border-slate-100 overflow-x-auto text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => navigateAwayFromExam('catalog')}
              className={`whitespace-nowrap shrink-0 ${
                route === 'catalog' ? 'text-teal-700 font-semibold' : ''
              }`}
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => navigateAwayFromExam('leaderboard')}
              className={`whitespace-nowrap shrink-0 ${
                route === 'leaderboard' ? 'text-teal-700 font-semibold' : ''
              }`}
            >
              Leaderboard
            </button>
            <button
              type="button"
              onClick={() => navigateAwayFromExam('transcripts')}
              className={`whitespace-nowrap shrink-0 ${
                route === 'transcripts' ? 'text-teal-700 font-semibold' : ''
              }`}
            >
              My Transcripts
            </button>
            <button
              type="button"
              onClick={() => navigateAwayFromExam('admin')}
              className={`whitespace-nowrap shrink-0 ${
                route === 'admin' ? 'text-teal-700 font-semibold' : ''
              }`}
            >
              Admin Panel
            </button>
          </div>
        )}
      </header>

      {/* Post-Registration Mandatory Information Banner (shown across authenticated views until all 6 fields are completed) */}
      {authReady && currentUser && publicProfile && !registrationComplete && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-2.5 text-xs text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
              <p>
                <span className="font-semibold">Exam Access Locked:</span> Complete mandatory
                colleague registration ({missingRegistrationFields.join(', ')}) before taking any
                product certification exam.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenRegistrationModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 rounded-lg hover:bg-amber-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Complete Colleague Info
            </button>
          </div>
        </div>
      )}

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1">
        {!authReady ? (
          <div className="max-w-7xl mx-auto px-6 py-20 space-y-6">
            <div className="h-8 w-72 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : !currentUser ? (
          <div>
            <section className="max-w-7xl mx-auto px-6 py-10 md:py-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Column: Brand Value Proposition + Visual Anchor */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Novatek Pharmaceutical Limited</span>
                    <span aria-hidden="true">·</span>
                    <span>Commercial &amp; Medical Field Training</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-slate-900 leading-[1.15] tracking-tight max-w-xl">
                    Product Mastery, Clinical Certification &amp; Regional Standings
                  </h1>

                  <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                    Equip colleagues across every territory with structured clinical monographs,
                    video briefings, and visual detailing aids—followed by timed MCQ and written
                    product exams with live regional leaderboards.
                  </p>

                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[16/10]">
                    <ResilientImage
                      srcKeyOrUrl="hero_lab"
                      alt="Novatek Pharmaceutical quality control and formulation laboratory"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
                      <p className="text-xs text-slate-200">
                        Formulation &amp; Medical Affairs Training Division · Mandatory Colleague
                        Verification Enabled
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Text, Video &amp; Visual Study Units</span>
                    <span aria-hidden="true">·</span>
                    <span>Timed MCQ &amp; Written Exams</span>
                    <span aria-hidden="true">·</span>
                    <span>Live Regional Leaderboard</span>
                  </div>
                </div>

                {/* Right Column: Before-Registration Colleague Form & Returning Sign-In */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5">
                  {pendingSharedExamId && (
                    <div className="bg-teal-50/70 border border-teal-200 rounded-lg px-4 py-3 space-y-1">
                      <p className="text-xs font-semibold text-teal-900">
                        Direct Certification Exam Link · {sharedExamPreviewTitle}
                      </p>
                      <p className="text-xs text-teal-800 leading-relaxed">
                        Register below or sign in as a returning colleague to open this exam
                        immediately—no prior study module completion required.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Colleague Registration &amp; Portal Entry
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Name, Employee ID, Territory, Area, Region, and Mobile No are mandatory
                        before taking any exam.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setLandingAuthTab('register');
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          landingAuthTab === 'register'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        New Registration
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setLandingAuthTab('signin');
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          landingAuthTab === 'signin'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Returning Colleague
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {landingAuthTab === 'register' ? (
                    <form onSubmit={handlePreRegisterAndSignIn} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-700">
                            Full Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            minLength={BLUEPRINT_LIMITS.DISPLAY_NAME_MIN}
                            maxLength={BLUEPRINT_LIMITS.DISPLAY_NAME_MAX}
                            value={preName}
                            onChange={(e) => setPreName(e.target.value)}
                            placeholder="e.g. Tanvir Ahmed"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-700">
                            Employee ID <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            minLength={BLUEPRINT_LIMITS.EMPLOYEE_CODE_MIN}
                            maxLength={BLUEPRINT_LIMITS.EMPLOYEE_CODE_MAX}
                            value={preEmployeeId}
                            onChange={(e) => setPreEmployeeId(e.target.value)}
                            placeholder="e.g. NVT-4082"
                            className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-700">
                            Territory <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            minLength={BLUEPRINT_LIMITS.TERRITORY_MIN}
                            maxLength={BLUEPRINT_LIMITS.TERRITORY_MAX}
                            value={preTerritory}
                            onChange={(e) => setPreTerritory(e.target.value)}
                            placeholder="e.g. Uttara Sector 7"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-700">
                            Area <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            minLength={BLUEPRINT_LIMITS.AREA_MIN}
                            maxLength={BLUEPRINT_LIMITS.AREA_MAX}
                            value={preArea}
                            onChange={(e) => setPreArea(e.target.value)}
                            placeholder="e.g. Uttara West Area"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-700">
                            Region <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={preRegion}
                            onChange={(e) => setPreRegion(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-teal-700"
                          >
                            {NOVATEK_REGIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-700">
                            Mobile No <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            minLength={BLUEPRINT_LIMITS.MOBILE_NO_MIN}
                            maxLength={BLUEPRINT_LIMITS.MOBILE_NO_MAX}
                            value={preMobileNo}
                            onChange={(e) => setPreMobileNo(e.target.value)}
                            placeholder="e.g. 01711-223344"
                            className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">
                          Designation
                        </label>
                        <select
                          value={preDesignation}
                          onChange={(e) => setPreDesignation(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-teal-700"
                        >
                          {NOVATEK_DESIGNATIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={authBusy}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                      >
                        {authBusy
                          ? 'Connecting Google Account...'
                          : 'Register & Continue with Google'}
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Your Mobile No is stored privately and visible only to you and authorized
                        Novatek Administrators.
                      </p>
                    </form>
                  ) : (
                    <div className="space-y-5 py-3">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Already registered with Novatek Academy? Sign in with your Google account.
                        If any required field (Name, Employee ID, Territory, Area, Region, or Mobile
                        No) is still missing on your profile, you will be prompted to complete it
                        after sign-in before taking an exam.
                      </p>

                      <button
                        type="button"
                        disabled={authBusy}
                        onClick={() => void handleDirectGoogleSignIn()}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                      >
                        {authBusy ? 'Signing In...' : 'Sign In with Google to Enter Portal'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div
                id="workflow"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-10 border-t border-slate-200"
              >
                <div id="divisions" className="space-y-2">
                  <p className="text-xs font-mono font-semibold text-teal-700">01. Study</p>
                  <h2 className="text-base font-semibold text-slate-900">
                    Multimedia Teaching Materials
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Learn approved indications, mechanisms, and dosing via clinical monographs,
                    guided video briefings, and high-resolution visual aids.
                  </p>
                </div>
                <div id="assessment" className="space-y-2">
                  <p className="text-xs font-mono font-semibold text-teal-700">02. Certify</p>
                  <h2 className="text-base font-semibold text-slate-900">
                    Verified Colleague MCQ &amp; Written Exams
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Verified colleagues with complete territory, area, region, employee ID, and
                    mobile details take timed certification exams controlled by Administrators.
                  </p>
                </div>
                <div id="leaderboard-info" className="space-y-2">
                  <p className="text-xs font-mono font-semibold text-teal-700">03. Benchmark</p>
                  <h2 className="text-base font-semibold text-slate-900">
                    Transparent Regional Leaderboard
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Celebrate top-performing colleagues across Dhaka, Chattogram, Sylhet, Rajshahi,
                    and Khulna territories immediately upon exam completion.
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : route === 'study' && selectedProduct ? (
          <StudyWorkspace
            product={selectedProduct}
            resources={activeResources}
            questions={activeQuestions}
            progress={progressByProduct[selectedProduct.id]}
            hasExistingAttempt={leaderboardEntries.some(
              (e) => e.userId === currentUser.uid && e.productId === selectedProduct.id
            )}
            isRegistrationComplete={registrationComplete}
            missingRegistrationFields={missingRegistrationFields}
            isAdmin={isAdmin}
            isLoadingSubcollections={loadingSubcollections}
            onBack={() => navigateAwayFromExam('catalog')}
            onMarkResourceCompleted={async (resourceId) => {
              await markStudyResourceCompleted(
                currentUser.uid,
                selectedProduct.id,
                resourceId,
                activeResources.map((r) => r.id),
                progressByProduct[selectedProduct.id]
              );
              showToast('Study unit progress saved.');
            }}
            onStartExam={handleRequestStartExam}
            onOpenRegistrationModal={() => {
              setPendingExamAfterProfileId(selectedProduct.id);
              handleOpenRegistrationModal(true);
            }}
            onOpenAdminForProduct={() => {
              setAdminTargetProductId(selectedProduct.id);
              navigateAwayFromExam('admin');
            }}
            onNotify={showToast}
          />
        ) : route === 'exam' && selectedProduct && publicProfile && registrationComplete ? (
          loadingSubcollections || loadedSubcollectionProductId !== selectedProduct.id ? (
            <div className="max-w-4xl mx-auto px-6 py-16 space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-4">
                <p className="text-xs font-mono text-teal-700">
                  Loading Direct Certification Exam...
                </p>
                <h1 className="text-xl font-bold text-slate-900">{selectedProduct.brandName}</h1>
                <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
                <div className="h-32 w-full bg-slate-100 rounded-lg animate-pulse" />
              </div>
            </div>
          ) : activeQuestions.length === 0 ? (
            <div className="max-w-3xl mx-auto px-6 py-16">
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
                <h1 className="text-lg font-bold text-slate-900">
                  No Exam Questions Published for {selectedProduct.brandName}
                </h1>
                <p className="text-sm text-slate-600">
                  An Administrator has not added questions to this certification exam yet.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigateAwayFromExam('study')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 cursor-pointer"
                  >
                    Open Study Material
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateAwayFromExam('catalog')}
                    className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ExamWorkspace
              product={selectedProduct}
              questions={activeQuestions}
              userProfile={publicProfile}
              onCancelExam={() => navigateAwayFromExam('study')}
              onExitToCatalog={() => navigateAwayFromExam('catalog')}
              onSubmitExam={async ({ mcqSelections, textResponses, durationSeconds }) => {
                const sub = await submitProductExam({
                  userProfile: publicProfile,
                  privateInfo,
                  product: selectedProduct,
                  questions: activeQuestions,
                  mcqSelections,
                  textResponses,
                  durationSeconds,
                });
                clearExamParamFromUrl();
                showToast('Exam submitted and leaderboard updated.');
                return sub;
              }}
              onOpenLeaderboard={(prodId) => {
                setLeaderboardFilterId(prodId);
                navigateAwayFromExam('leaderboard');
              }}
            />
          )
        ) : route === 'leaderboard' ? (
          <LeaderboardView
            entries={leaderboardEntries}
            products={publishedProducts}
            currentUserId={currentUser.uid}
            initialProductFilter={leaderboardFilterId}
          />
        ) : route === 'transcripts' ? (
          <TranscriptsView
            submissions={mySubmissions}
            onGoToProducts={() => navigateAwayFromExam('catalog')}
          />
        ) : route === 'admin' ? (
          <ManagerStudio
            currentUserUid={currentUser.uid}
            currentUserEmail={currentUser.email || ''}
            isAdmin={isAdmin}
            products={allAdminProducts}
            initialSelectedProductId={adminTargetProductId}
            allSubmissions={managerSubmissions}
            colleagueProfiles={colleagueProfiles}
            adminRecords={adminRecords}
            onNotify={showToast}
            onReturnToCatalog={() => setRoute('catalog')}
          />
        ) : (
          /* AUTHENTICATED PRODUCT PORTFOLIO CATALOG */
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-slate-200">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>Novatek Pharmaceutical Limited</span>
                  {publicProfile?.employeeId && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{publicProfile.employeeId}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>
                    {[publicProfile?.territory, publicProfile?.area, publicProfile?.region]
                      .filter(Boolean)
                      .join(' · ') || 'All Regions'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{publicProfile?.designation || 'Colleague'}</span>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => handleOpenRegistrationModal(!registrationComplete)}
                    className="text-slate-700 font-medium hover:text-teal-700 hover:underline cursor-pointer"
                  >
                    {registrationComplete ? 'Edit Colleague Info' : 'Complete Colleague Info'}
                  </button>
                  {isAdmin && (
                    <>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => setRoute('admin')}
                        className="text-teal-700 font-semibold hover:underline cursor-pointer"
                      >
                        Open Admin Panel
                      </button>
                    </>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Pharmaceutical Product Learning Portfolio
                </h1>
              </div>

              <div className="flex items-center gap-8 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Study Completed</p>
                  <p className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {completedModulesCount} / {publishedProducts.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Exams Certified</p>
                  <p className="text-xl font-mono font-bold text-teal-700 tabular-nums">
                    {myCertifiedCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Therapeutic Division Filter & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDivisionFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    divisionFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Divisions
                </button>
                {THERAPEUTIC_CLASSES.slice(0, 4).map((tc) => (
                  <button
                    key={tc}
                    type="button"
                    onClick={() => setDivisionFilter(tc)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      divisionFilter === tc
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tc}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search brand or generic..."
                  className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 w-56"
                />
              </div>
            </div>

            {/* Product Module Cards Grid */}
            {!productsLoaded || seedingBusy ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-96 bg-white border border-slate-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl py-16 px-6 text-center space-y-3">
                <p className="text-base font-medium text-slate-900">
                  No published pharmaceutical modules match the current filter.
                </p>
                {isAdmin && allAdminProducts.length === 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      setSeedingBusy(true);
                      try {
                        await seedFlagshipCurriculum(currentUser.uid);
                        showToast('Loaded Novatek flagship curriculum.');
                      } finally {
                        setSeedingBusy(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 cursor-pointer"
                  >
                    <Database className="w-4 h-4" />
                    Load Flagship Curriculum
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const prog = progressByProduct[prod.id];
                  const doneUnits = prog?.completedResourceIds.length ?? 0;
                  const bestStanding = leaderboardEntries.find(
                    (e) => e.userId === currentUser.uid && e.productId === prod.id
                  );
                  const examPaused = prod.examEnabled === false;
                  const singleAttemptUsed = prod.allowRetakes === false && Boolean(bestStanding);
                  const examActionDisabled = examPaused || singleAttemptUsed;

                  return (
                    <article
                      key={prod.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="aspect-[4/3] w-full bg-slate-100 border-b border-slate-100 overflow-hidden">
                          <ResilientImage
                            srcKeyOrUrl={prod.coverImageKey}
                            alt={`${prod.brandName} pharmaceutical packaging`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="p-6 space-y-3">
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                            <span>{prod.therapeuticClass}</span>
                            <span className="font-mono tabular-nums">
                              {bestStanding
                                ? bestStanding.passed
                                  ? `✓ Certified ${bestStanding.percentage}%`
                                  : `Best: ${bestStanding.percentage}%`
                                : examPaused
                                ? '▲ Exam Paused'
                                : doneUnits > 0
                                ? `${doneUnits}/${prod.resourceCount} Units · Direct Exam`
                                : 'Direct Exam Open'}
                            </span>
                          </div>

                          <div>
                            <h2 className="text-lg font-bold text-slate-900">{prod.brandName}</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {prod.genericComposition}
                            </p>
                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                            {prod.summary}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 tabular-nums">
                          <span>
                            {prod.id === 'prod_gaprito_50'
                              ? `${prod.resourceCount} Units + বাংলা শিট`
                              : `${prod.resourceCount} Units · ${prod.questionCount} Qs`}
                          </span>
                          {isAdmin ? (
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => void handleCopyCardExamLink(prod)}
                                className="inline-flex items-center gap-1 text-slate-700 font-medium hover:text-teal-700 hover:underline cursor-pointer"
                              >
                                {copiedCardExamId === prod.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Link2 className="w-3 h-3 text-teal-700" />
                                )}
                                {copiedCardExamId === prod.id ? 'Copied Link' : 'Share Exam Link'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminTargetProductId(prod.id);
                                  navigateAwayFromExam('admin');
                                }}
                                className="inline-flex items-center gap-1 text-teal-700 font-medium hover:underline cursor-pointer"
                              >
                                <Settings className="w-3 h-3" />
                                Admin
                              </button>
                            </div>
                          ) : (
                            <span>
                              {prod.id === 'prod_gaprito_50'
                                ? `${prod.questionCount} Qs · 100 Marks (${prod.examDurationMinutes}m)`
                                : `${prod.questionCount} Exam Qs (${prod.examDurationMinutes} min)`}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductId(prod.id);
                              navigateAwayFromExam('study');
                            }}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            Study Material
                          </button>

                          <button
                            type="button"
                            disabled={examActionDisabled}
                            onClick={() => launchDirectExamForProduct(prod)}
                            className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                              examActionDisabled
                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                : 'text-white bg-teal-700 hover:bg-teal-800 cursor-pointer'
                            }`}
                          >
                            {examActionDisabled ? (
                              <Lock className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                            )}
                            {examPaused
                              ? 'Exam Paused'
                              : singleAttemptUsed
                              ? 'Attempt Used'
                              : bestStanding
                              ? 'Retake Exam'
                              : 'Take Exam'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Quiet Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} Novatek Pharmaceutical Limited · Commercial &amp; Medical
            Training Portal
          </span>
          <span>For internal colleague education and product certification only.</span>
        </div>
      </footer>

      {/* Colleague Registration & Profile Modal */}
      {profileModalOpen && publicProfile && privateInfo && (
        <ProfileModal
          profile={publicProfile}
          privateInfo={privateInfo}
          isAdmin={isAdmin}
          isOnboardingPrompt={onboardingPromptMode}
          onClose={() => {
            setProfileModalOpen(false);
            setOnboardingPromptMode(false);
          }}
          onSave={async (input) => {
            if (!currentUser) return;
            const { publicFields, privateFields } = await updateColleagueProfile(
              currentUser.uid,
              currentUser.email || '',
              input
            );
            setPublicProfile((prev) => (prev ? { ...prev, ...publicFields } : prev));
            setPrivateInfo((prev) => (prev ? { ...prev, ...privateFields } : prev));
            setOnboardingPromptMode(false);

            const targetExamId = pendingExamAfterProfileId;
            if (targetExamId) {
              setPendingExamAfterProfileId(null);
              const targetProd = publishedProducts.find((p) => p.id === targetExamId);
              if (targetProd && targetProd.examEnabled !== false) {
                setSelectedProductId(targetProd.id);
                setExamParamInUrl(targetProd.id);
                setRoute('exam');
                showToast(`Profile completed — starting ${targetProd.brandName} exam.`);
                return;
              }
            }
            showToast('Saved colleague registration details. Exam access unlocked.');
          }}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <NovatekAcademyPortal />
    </ErrorBoundary>
  );
}
