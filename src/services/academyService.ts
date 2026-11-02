import type { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { NOVATEK_FLAGSHIP_CURRICULUM } from '../data/seedCurriculum';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  BLUEPRINT_LIMITS,
  clampInt,
  clampOptionalString,
  clampString,
  getLocationRequirementsForDesignation,
  getMissingRegistrationFields,
  isColleagueRegistrationComplete,
  isValidMobileNo,
  normalizeDesignationLabel,
  sanitizeEmployeeId,
  sanitizeId,
  sanitizeMobileNo,
  scoreWrittenResponseByRubric,
} from '../lib/validation';
import {
  NOVATEK_REGIONS,
  type ColleagueRegistrationInput,
  type ExamQuestion,
  type ExamResponseItem,
  type ExamSubmission,
  type LearningProgress,
  type LearningResource,
  type PrivateUserInfo,
  type ProductModule,
  type PublicationStatus,
  type PublicProfile,
  type QuestionType,
  type ResourceType,
  type TherapeuticClass,
} from '../types/models';

export class RegistrationIncompleteError extends Error {
  readonly missingFields: string[];

  constructor(missingFields: string[]) {
    super(
      `Complete required colleague information (${missingFields.join(', ')}) before submitting an exam.`
    );
    this.name = 'RegistrationIncompleteError';
    this.missingFields = missingFields;
  }
}

async function getFreshDoc<T = DocumentData>(
  ref: DocumentReference<T>
): Promise<DocumentSnapshot<T>> {
  try {
    return await getDocFromServer(ref);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('offline') || error.message.includes('Failed to get document'))
    ) {
      return await getDoc(ref);
    }
    throw error;
  }
}

function resolveUserEmail(explicitEmail?: string | null, user?: User | null): string {
  const activeUser = user ?? auth.currentUser;
  const candidate =
    explicitEmail ||
    activeUser?.email ||
    activeUser?.providerData?.find((p) => Boolean(p?.email))?.email ||
    '';
  return candidate.trim();
}

export async function checkUserIsAdmin(user: User): Promise<boolean> {
  if (user.emailVerified && user.email === BOOTSTRAPPED_ADMIN_EMAIL) {
    return true;
  }
  const adminPath = `admins/${user.uid}`;
  try {
    const snap = await getFreshDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, adminPath);
  }
}

export async function ensureUserProfile(
  user: User,
  isAdmin: boolean,
  pendingRegistration?: ColleagueRegistrationInput | null
): Promise<{ publicProfile: PublicProfile; privateInfo: PrivateUserInfo }> {
  const pubRef = doc(db, 'profiles', user.uid);
  const privRef = doc(db, 'users_private', user.uid);

  let publicProfile: PublicProfile | null = null;
  let privateInfo: PrivateUserInfo | null = null;

  try {
    const pubSnap = await getFreshDoc(pubRef);
    if (pubSnap.exists()) {
      publicProfile = pubSnap.data() as PublicProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `profiles/${user.uid}`);
  }

  try {
    const privSnap = await getFreshDoc(privRef);
    if (privSnap.exists()) {
      privateInfo = privSnap.data() as PrivateUserInfo;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users_private/${user.uid}`);
  }

  const defaultDesignation = isAdmin ? 'Regional Manager' : 'Medical Promotion Officer';
  const resolvedAuthEmail = resolveUserEmail(user.email, user);

  // If the colleague entered registration fields BEFORE clicking Google Sign-In, apply them immediately
  if (pendingRegistration && isValidMobileNo(pendingRegistration.mobileNo)) {
    const safeName = clampString(
      pendingRegistration.displayName,
      BLUEPRINT_LIMITS.DISPLAY_NAME_MIN,
      BLUEPRINT_LIMITS.DISPLAY_NAME_MAX,
      user.displayName || 'Novatek Colleague'
    );
    const safeEmpId = sanitizeEmployeeId(pendingRegistration.employeeId);
    const safeDesignation = clampString(
      normalizeDesignationLabel(pendingRegistration.designation) || defaultDesignation,
      BLUEPRINT_LIMITS.DESIGNATION_MIN,
      BLUEPRINT_LIMITS.DESIGNATION_MAX,
      defaultDesignation
    );
    const { territoryRequired, areaRequired } =
      getLocationRequirementsForDesignation(safeDesignation);

    const trimmedTerritory = pendingRegistration.territory.trim();
    const trimmedArea = pendingRegistration.area.trim();
    const locationValid =
      (!territoryRequired || trimmedTerritory.length >= BLUEPRINT_LIMITS.TERRITORY_MIN) &&
      (!areaRequired || trimmedArea.length >= BLUEPRINT_LIMITS.AREA_MIN) &&
      pendingRegistration.region.trim().length >= BLUEPRINT_LIMITS.REGION_MIN;

    const safeTerritory = territoryRequired
      ? clampString(
          trimmedTerritory,
          BLUEPRINT_LIMITS.TERRITORY_MIN,
          BLUEPRINT_LIMITS.TERRITORY_MAX
        )
      : clampOptionalString(trimmedTerritory, BLUEPRINT_LIMITS.TERRITORY_MAX);
    const safeArea = areaRequired
      ? clampString(trimmedArea, BLUEPRINT_LIMITS.AREA_MIN, BLUEPRINT_LIMITS.AREA_MAX)
      : clampOptionalString(trimmedArea, BLUEPRINT_LIMITS.AREA_MAX);
    const safeRegion = clampString(
      pendingRegistration.region,
      BLUEPRINT_LIMITS.REGION_MIN,
      BLUEPRINT_LIMITS.REGION_MAX,
      NOVATEK_REGIONS[0]
    );
    const safeMobile = sanitizeMobileNo(pendingRegistration.mobileNo);
    const safeEmail = clampString(
      resolvedAuthEmail || 'colleague@novatek.com',
      3,
      BLUEPRINT_LIMITS.EMAIL_MAX,
      'colleague@novatek.com'
    );

    if (safeEmpId.length >= BLUEPRINT_LIMITS.EMPLOYEE_CODE_MIN && locationValid) {
      if (!publicProfile) {
        const createdPub: Omit<PublicProfile, 'createdAt' | 'updatedAt'> = {
          uid: user.uid,
          displayName: safeName,
          designation: safeDesignation,
          employeeId: safeEmpId,
          territory: safeTerritory,
          area: safeArea,
          region: safeRegion,
          isRegistrationComplete: true,
          visibility: 'org',
        };
        try {
          await setDoc(pubRef, {
            ...createdPub,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          publicProfile = createdPub;
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `profiles/${user.uid}`);
        }
      } else if (
        !publicProfile.isRegistrationComplete ||
        !isColleagueRegistrationComplete(publicProfile, privateInfo)
      ) {
        try {
          await updateDoc(pubRef, {
            displayName: safeName,
            designation: safeDesignation,
            employeeId: safeEmpId,
            territory: safeTerritory,
            area: safeArea,
            region: safeRegion,
            isRegistrationComplete: true,
            updatedAt: serverTimestamp(),
          });
          publicProfile = {
            ...publicProfile,
            displayName: safeName,
            designation: safeDesignation,
            employeeId: safeEmpId,
            territory: safeTerritory,
            area: safeArea,
            region: safeRegion,
            isRegistrationComplete: true,
          };
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `profiles/${user.uid}`);
        }
      }

      if (resolvedAuthEmail) {
        if (!privateInfo) {
          const createdPriv: Omit<PrivateUserInfo, 'createdAt' | 'updatedAt'> = {
            uid: user.uid,
            email: safeEmail,
            employeeCode: safeEmpId,
            mobileNo: safeMobile,
          };
          try {
            await setDoc(privRef, {
              ...createdPriv,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            privateInfo = createdPriv;
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users_private/${user.uid}`);
          }
        } else if (
          !isValidMobileNo(privateInfo.mobileNo || '') ||
          sanitizeEmployeeId(privateInfo.employeeCode || '').length <
            BLUEPRINT_LIMITS.EMPLOYEE_CODE_MIN
        ) {
          try {
            await updateDoc(privRef, {
              email: safeEmail,
              employeeCode: safeEmpId,
              mobileNo: safeMobile,
              updatedAt: serverTimestamp(),
            });
            privateInfo = {
              ...privateInfo,
              email: safeEmail,
              employeeCode: safeEmpId,
              mobileNo: safeMobile,
            };
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users_private/${user.uid}`);
          }
        }
      }
    }
  }

  if (!publicProfile) {
    const defaultName = clampString(
      user.displayName || resolvedAuthEmail.split('@')[0] || 'Novatek Colleague',
      BLUEPRINT_LIMITS.DISPLAY_NAME_MIN,
      BLUEPRINT_LIMITS.DISPLAY_NAME_MAX,
      'Novatek Colleague'
    );
    const newPub: Omit<PublicProfile, 'createdAt' | 'updatedAt'> = {
      uid: user.uid,
      displayName: defaultName,
      designation: defaultDesignation,
      employeeId: '',
      territory: '',
      area: '',
      region: NOVATEK_REGIONS[0],
      isRegistrationComplete: false,
      visibility: 'org',
    };
    try {
      await setDoc(pubRef, {
        ...newPub,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      publicProfile = newPub;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `profiles/${user.uid}`);
    }
  }

  if (!privateInfo && resolvedAuthEmail) {
    const newPriv: Omit<PrivateUserInfo, 'createdAt' | 'updatedAt'> = {
      uid: user.uid,
      email: clampString(resolvedAuthEmail, 3, BLUEPRINT_LIMITS.EMAIL_MAX, resolvedAuthEmail),
      employeeCode: sanitizeEmployeeId(publicProfile?.employeeId || ''),
      mobileNo: '',
    };
    try {
      await setDoc(privRef, {
        ...newPriv,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      privateInfo = newPriv;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users_private/${user.uid}`);
    }
  }

  // Self-heal legacy profile/private employee ID desyncs on sign-in
  if (publicProfile && privateInfo) {
    const pubEmp = sanitizeEmployeeId(publicProfile.employeeId || '');
    const privEmp = sanitizeEmployeeId(privateInfo.employeeCode || '');
    const unifiedEmp = pubEmp || privEmp;

    if (
      unifiedEmp &&
      isColleagueRegistrationComplete(
        { ...publicProfile, employeeId: unifiedEmp },
        { ...privateInfo, employeeCode: unifiedEmp }
      )
    ) {
      if (!pubEmp || publicProfile.isRegistrationComplete !== true) {
        try {
          await updateDoc(pubRef, {
            employeeId: unifiedEmp,
            isRegistrationComplete: true,
            updatedAt: serverTimestamp(),
          });
          publicProfile = {
            ...publicProfile,
            employeeId: unifiedEmp,
            isRegistrationComplete: true,
          };
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `profiles/${user.uid}`);
        }
      }
      if (!privEmp && resolvedAuthEmail) {
        const safeEmail = clampString(
          resolvedAuthEmail,
          3,
          BLUEPRINT_LIMITS.EMAIL_MAX,
          resolvedAuthEmail
        );
        try {
          await updateDoc(privRef, {
            employeeCode: unifiedEmp,
            email: safeEmail,
            updatedAt: serverTimestamp(),
          });
          privateInfo = {
            ...privateInfo,
            employeeCode: unifiedEmp,
            email: safeEmail,
          };
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users_private/${user.uid}`);
        }
      }
    }
  }

  return {
    publicProfile: publicProfile!,
    privateInfo: privateInfo || {
      uid: user.uid,
      email: resolvedAuthEmail,
      employeeCode: '',
      mobileNo: '',
    },
  };
}

export async function updateColleagueProfile(
  uid: string,
  email: string,
  input: ColleagueRegistrationInput
): Promise<{
  publicFields: Pick<
    PublicProfile,
    'displayName' | 'designation' | 'employeeId' | 'territory' | 'area' | 'region' | 'isRegistrationComplete'
  >;
  privateFields: Pick<PrivateUserInfo, 'employeeCode' | 'mobileNo'>;
}> {
  const safeEmployeeId = sanitizeEmployeeId(input.employeeId);
  if (safeEmployeeId.length < BLUEPRINT_LIMITS.EMPLOYEE_CODE_MIN) {
    throw new Error('Please enter a valid Employee ID.');
  }

  if (!isValidMobileNo(input.mobileNo)) {
    throw new Error('Please enter a valid Mobile No (7 to 15 digits, e.g. +880 1711-223344).');
  }

  const safeMobileNo = sanitizeMobileNo(input.mobileNo);
  const safeDisplayName = clampString(
    input.displayName,
    BLUEPRINT_LIMITS.DISPLAY_NAME_MIN,
    BLUEPRINT_LIMITS.DISPLAY_NAME_MAX,
    'Novatek Colleague'
  );
  const safeDesignation = clampString(
    normalizeDesignationLabel(input.designation),
    BLUEPRINT_LIMITS.DESIGNATION_MIN,
    BLUEPRINT_LIMITS.DESIGNATION_MAX,
    'Medical Promotion Officer'
  );
  const { territoryRequired, areaRequired } =
    getLocationRequirementsForDesignation(safeDesignation);

  const trimmedTerritory = input.territory.trim();
  const trimmedArea = input.area.trim();
  const trimmedRegion = input.region.trim();

  if (territoryRequired && trimmedTerritory.length < BLUEPRINT_LIMITS.TERRITORY_MIN) {
    throw new Error('Please enter your assigned Territory.');
  }
  if (areaRequired && trimmedArea.length < BLUEPRINT_LIMITS.AREA_MIN) {
    throw new Error('Please enter your assigned Area.');
  }
  if (trimmedRegion.length < BLUEPRINT_LIMITS.REGION_MIN) {
    throw new Error('Please enter or select your assigned Region.');
  }

  const safeTerritory = territoryRequired
    ? clampString(trimmedTerritory, BLUEPRINT_LIMITS.TERRITORY_MIN, BLUEPRINT_LIMITS.TERRITORY_MAX)
    : clampOptionalString(trimmedTerritory, BLUEPRINT_LIMITS.TERRITORY_MAX);
  const safeArea = areaRequired
    ? clampString(trimmedArea, BLUEPRINT_LIMITS.AREA_MIN, BLUEPRINT_LIMITS.AREA_MAX)
    : clampOptionalString(trimmedArea, BLUEPRINT_LIMITS.AREA_MAX);
  const safeRegion = clampString(
    trimmedRegion,
    BLUEPRINT_LIMITS.REGION_MIN,
    BLUEPRINT_LIMITS.REGION_MAX,
    NOVATEK_REGIONS[0]
  );

  const pubRef = doc(db, 'profiles', uid);
  const privRef = doc(db, 'users_private', uid);

  let pubExists = false;
  try {
    const pubSnap = await getFreshDoc(pubRef);
    pubExists = pubSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `profiles/${uid}`);
  }

  try {
    if (pubExists) {
      await updateDoc(pubRef, {
        displayName: safeDisplayName,
        designation: safeDesignation,
        employeeId: safeEmployeeId,
        territory: safeTerritory,
        area: safeArea,
        region: safeRegion,
        isRegistrationComplete: true,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(pubRef, {
        uid,
        displayName: safeDisplayName,
        designation: safeDesignation,
        employeeId: safeEmployeeId,
        territory: safeTerritory,
        area: safeArea,
        region: safeRegion,
        isRegistrationComplete: true,
        visibility: 'org',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      pubExists ? OperationType.UPDATE : OperationType.CREATE,
      `profiles/${uid}`
    );
  }

  const resolvedEmail = resolveUserEmail(email);
  if (!resolvedEmail) {
    throw new Error('Your verified Google email could not be read. Please sign out and sign in again.');
  }

  const safeEmail = clampString(resolvedEmail, 3, BLUEPRINT_LIMITS.EMAIL_MAX, resolvedEmail);
  let privExists = false;
  try {
    const snap = await getFreshDoc(privRef);
    privExists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users_private/${uid}`);
  }

  try {
    if (privExists) {
      await updateDoc(privRef, {
        employeeCode: safeEmployeeId,
        mobileNo: safeMobileNo,
        email: safeEmail,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(privRef, {
        uid,
        email: safeEmail,
        employeeCode: safeEmployeeId,
        mobileNo: safeMobileNo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      privExists ? OperationType.UPDATE : OperationType.CREATE,
      `users_private/${uid}`
    );
  }

  return {
    publicFields: {
      displayName: safeDisplayName,
      designation: safeDesignation,
      employeeId: safeEmployeeId,
      territory: safeTerritory,
      area: safeArea,
      region: safeRegion,
      isRegistrationComplete: true,
    },
    privateFields: {
      employeeCode: safeEmployeeId,
      mobileNo: safeMobileNo,
    },
  };
}

export async function fetchColleaguePrivateInfoForAdmin(
  targetUid: string
): Promise<PrivateUserInfo | null> {
  const path = `users_private/${targetUid}`;
  try {
    const snap = await getDoc(doc(db, 'users_private', targetUid));
    return snap.exists() ? (snap.data() as PrivateUserInfo) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

const SUBCOLLECTION_BATCH_CHUNK = 8;

export async function seedFlagshipCurriculum(authorUid: string): Promise<string[]> {
  const seededIds: string[] = [];

  for (const bundle of NOVATEK_FLAGSHIP_CURRICULUM) {
    const prodRef = doc(db, 'products', bundle.product.id);
    let alreadyExists = false;
    try {
      const existingSnap = await getDoc(prodRef);
      alreadyExists = existingSnap.exists();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `products/${bundle.product.id}`);
    }
    if (alreadyExists) {
      continue;
    }

    try {
      await setDoc(prodRef, {
        ...bundle.product,
        examEnabled: true,
        allowRetakes: true,
        authorId: authorUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `products/${bundle.product.id}`);
    }

    const subcollectionOps: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];

    for (const res of bundle.resources) {
      const resRef = doc(db, 'products', bundle.product.id, 'resources', res.id);
      subcollectionOps.push((batch) => {
        batch.set(resRef, {
          ...res,
          authorId: authorUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    for (const q of bundle.questions) {
      const qRef = doc(db, 'products', bundle.product.id, 'questions', q.id);
      subcollectionOps.push((batch) => {
        batch.set(qRef, {
          ...q,
          authorId: authorUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    for (let i = 0; i < subcollectionOps.length; i += SUBCOLLECTION_BATCH_CHUNK) {
      const chunk = subcollectionOps.slice(i, i + SUBCOLLECTION_BATCH_CHUNK);
      const batch = writeBatch(db);
      for (const applyOp of chunk) {
        applyOp(batch);
      }
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `products/${bundle.product.id}`);
      }
    }

    seededIds.push(bundle.product.id);
  }

  return seededIds;
}

export async function fetchProductSubcollections(
  productId: string,
  productStatus: PublicationStatus,
  authorId?: string
): Promise<{ resources: LearningResource[]; questions: ExamQuestion[] }> {
  const resPath = `products/${productId}/resources`;
  const qPath = `products/${productId}/questions`;
  const isBootstrapped =
    auth.currentUser?.emailVerified && auth.currentUser?.email === BOOTSTRAPPED_ADMIN_EMAIL;

  let resources: LearningResource[] = [];
  let questions: ExamQuestion[] = [];

  try {
    const resQuery =
      productStatus === 'published'
        ? query(collection(db, resPath), where('productStatus', '==', 'published'))
        : isBootstrapped
        ? query(collection(db, resPath), where('productStatus', '==', 'draft'))
        : query(collection(db, resPath), where('authorId', '==', auth.currentUser?.uid || authorId || ''));
    const resSnap = await getDocs(resQuery);
    resources = resSnap.docs
      .map((d) => d.data() as LearningResource)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, resPath);
  }

  try {
    const qQuery =
      productStatus === 'published'
        ? query(collection(db, qPath), where('productStatus', '==', 'published'))
        : isBootstrapped
        ? query(collection(db, qPath), where('productStatus', '==', 'draft'))
        : query(collection(db, qPath), where('authorId', '==', auth.currentUser?.uid || authorId || ''));
    const qSnap = await getDocs(qQuery);
    questions = qSnap.docs
      .map((d) => d.data() as ExamQuestion)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, qPath);
  }

  return { resources, questions };
}

export async function markStudyResourceCompleted(
  userId: string,
  productId: string,
  resourceId: string,
  allResourceIds: string[],
  existingProgress?: LearningProgress
): Promise<void> {
  const progressId = `${userId}_${productId}`;
  const progressRef = doc(db, 'learning_progress', progressId);

  const currentSet = new Set(existingProgress?.completedResourceIds || []);
  currentSet.add(resourceId);
  const completedList = Array.from(currentSet).slice(0, 50);

  const allCompleted =
    allResourceIds.length > 0 && allResourceIds.every((id) => completedList.includes(id));
  const nextIsCompleted = Boolean(existingProgress?.isModuleCompleted || allCompleted);

  if (!existingProgress) {
    let existsOnServer = false;
    try {
      const snap = await getFreshDoc(progressRef);
      existsOnServer = snap.exists();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `learning_progress/${progressId}`);
    }

    if (!existsOnServer) {
      try {
        await setDoc(progressRef, {
          userId,
          productId,
          completedResourceIds: completedList,
          isModuleCompleted: nextIsCompleted,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `learning_progress/${progressId}`);
      }
    }
  }

  try {
    await updateDoc(progressRef, {
      completedResourceIds: completedList,
      isModuleCompleted: nextIsCompleted,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `learning_progress/${progressId}`);
  }
}

export async function submitProductExam(params: {
  userProfile: PublicProfile;
  privateInfo?: PrivateUserInfo | null;
  product: ProductModule;
  questions: ExamQuestion[];
  mcqSelections: Record<string, number>;
  textResponses: Record<string, string>;
  durationSeconds: number;
}): Promise<ExamSubmission> {
  const {
    userProfile,
    privateInfo,
    product,
    questions,
    mcqSelections,
    textResponses,
    durationSeconds,
  } = params;

  const activeUser = auth.currentUser;
  if (!activeUser) {
    throw new Error('Your sign-in session expired. Please sign in again to submit your exam.');
  }
  if (!activeUser.emailVerified) {
    throw new Error('A verified Google email account is required to submit certification exams.');
  }
  if (questions.length === 0) {
    throw new Error('This product exam does not contain any questions yet.');
  }

  const uid = activeUser.uid;
  const pubRef = doc(db, 'profiles', uid);
  const privRef = doc(db, 'users_private', uid);
  const prodRef = doc(db, 'products', product.id);
  const leaderboardId = `${uid}_${product.id}`;
  const leaderboardRef = doc(db, 'leaderboard', leaderboardId);

  // 1. Pre-flight fresh server reads so we never rely on stale cached state
  let serverPub: PublicProfile | null = null;
  let serverPriv: PrivateUserInfo | null = null;
  let serverProd: ProductModule | null = null;
  let leaderboardExists = false;
  let existingBestPercentage = -1;
  let existingLbSubmissionId = '';

  try {
    const snap = await getFreshDoc(pubRef);
    if (snap.exists()) {
      serverPub = snap.data() as PublicProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `profiles/${uid}`);
  }

  try {
    const snap = await getFreshDoc(privRef);
    if (snap.exists()) {
      serverPriv = snap.data() as PrivateUserInfo;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users_private/${uid}`);
  }

  try {
    const snap = await getFreshDoc(prodRef);
    if (snap.exists()) {
      serverProd = snap.data() as ProductModule;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `products/${product.id}`);
  }

  try {
    const lbSnap = await getFreshDoc(leaderboardRef);
    if (lbSnap.exists()) {
      leaderboardExists = true;
      const lbData = lbSnap.data() as { percentage?: number; submissionId?: string };
      existingBestPercentage = lbData.percentage ?? -1;
      existingLbSubmissionId = lbData.submissionId || '';
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `leaderboard/${leaderboardId}`);
  }

  // 2. Reconcile & self-heal profile + private info on Firestore if client has valid fields
  const mergedEmpId = sanitizeEmployeeId(
    serverPub?.employeeId ||
      serverPriv?.employeeCode ||
      userProfile.employeeId ||
      privateInfo?.employeeCode ||
      ''
  );
  const mergedMobileNo = sanitizeMobileNo(
    (serverPriv?.mobileNo && isValidMobileNo(serverPriv.mobileNo) ? serverPriv.mobileNo : '') ||
      privateInfo?.mobileNo ||
      ''
  );
  const mergedDisplayName = clampString(
    serverPub?.displayName || userProfile.displayName || activeUser.displayName || 'Novatek Colleague',
    BLUEPRINT_LIMITS.DISPLAY_NAME_MIN,
    BLUEPRINT_LIMITS.DISPLAY_NAME_MAX,
    'Novatek Colleague'
  );
  const mergedDesignation = clampString(
    normalizeDesignationLabel(serverPub?.designation || userProfile.designation) ||
      'Medical Promotion Officer',
    BLUEPRINT_LIMITS.DESIGNATION_MIN,
    BLUEPRINT_LIMITS.DESIGNATION_MAX,
    'Medical Promotion Officer'
  );
  const mergedTerritory = clampOptionalString(
    serverPub?.territory || userProfile.territory || '',
    BLUEPRINT_LIMITS.TERRITORY_MAX
  );
  const mergedArea = clampOptionalString(
    serverPub?.area || userProfile.area || '',
    BLUEPRINT_LIMITS.AREA_MAX
  );
  const mergedRegion = clampString(
    serverPub?.region || userProfile.region || NOVATEK_REGIONS[0],
    BLUEPRINT_LIMITS.REGION_MIN,
    BLUEPRINT_LIMITS.REGION_MAX,
    NOVATEK_REGIONS[0]
  );
  const resolvedEmail = resolveUserEmail(serverPriv?.email || privateInfo?.email, activeUser);

  const effectiveProfile: PublicProfile = {
    uid,
    displayName: mergedDisplayName,
    designation: mergedDesignation,
    employeeId: mergedEmpId,
    territory: mergedTerritory,
    area: mergedArea,
    region: mergedRegion,
    isRegistrationComplete: true,
    visibility: 'org',
  };
  const effectivePrivate: PrivateUserInfo = {
    uid,
    email: resolvedEmail,
    employeeCode: mergedEmpId,
    mobileNo: mergedMobileNo,
  };

  const missingFields = getMissingRegistrationFields(effectiveProfile, effectivePrivate);
  if (missingFields.length > 0) {
    throw new RegistrationIncompleteError(missingFields);
  }

  // Ensure server-side profiles/{uid} and users_private/{uid} match effective registration before batch commit
  const serverNeedsProfileSync =
    !serverPub ||
    serverPub.isRegistrationComplete !== true ||
    sanitizeEmployeeId(serverPub.employeeId || '') !== mergedEmpId ||
    (serverPub.region || '').trim() !== mergedRegion ||
    (serverPub.area || '').trim() !== mergedArea ||
    (serverPub.territory || '').trim() !== mergedTerritory;

  if (serverNeedsProfileSync) {
    try {
      if (serverPub) {
        await updateDoc(pubRef, {
          displayName: mergedDisplayName,
          designation: mergedDesignation,
          employeeId: mergedEmpId,
          territory: mergedTerritory,
          area: mergedArea,
          region: mergedRegion,
          isRegistrationComplete: true,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(pubRef, {
          ...effectiveProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        serverPub ? OperationType.UPDATE : OperationType.CREATE,
        `profiles/${uid}`
      );
    }
  }

  const serverNeedsPrivateSync =
    !serverPriv ||
    sanitizeEmployeeId(serverPriv.employeeCode || '') !== mergedEmpId ||
    !isValidMobileNo(serverPriv.mobileNo || '');

  if (serverNeedsPrivateSync && resolvedEmail) {
    const safeEmail = clampString(resolvedEmail, 3, BLUEPRINT_LIMITS.EMAIL_MAX, resolvedEmail);
    try {
      if (serverPriv) {
        await updateDoc(privRef, {
          employeeCode: mergedEmpId,
          mobileNo: mergedMobileNo,
          email: safeEmail,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(privRef, {
          uid,
          email: safeEmail,
          employeeCode: mergedEmpId,
          mobileNo: mergedMobileNo,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        serverPriv ? OperationType.UPDATE : OperationType.CREATE,
        `users_private/${uid}`
      );
    }
  }

  // 3. Validate live product module availability & retake rules
  const liveProduct = serverProd || product;
  if (!serverProd) {
    throw new Error('This product module is no longer available on the server.');
  }
  if (liveProduct.status !== 'published') {
    const userIsAdmin = await checkUserIsAdmin(activeUser);
    if (!userIsAdmin) {
      throw new Error('This product module is currently unpublished and cannot accept submissions.');
    }
  }
  if (liveProduct.examEnabled === false) {
    throw new Error(
      `The certification exam for ${liveProduct.brandName} has been paused by an Administrator.`
    );
  }
  if (liveProduct.allowRetakes === false && leaderboardExists) {
    throw new Error(
      `Retakes are disabled for ${liveProduct.brandName}, and your official attempt has already been recorded.`
    );
  }

  const submissionId = sanitizeId(`sub_${uid.slice(0, 10)}_${Date.now()}`);

  let awardedScore = 0;
  let maxScore = 0;
  let hasTextQuestions = false;

  const responses: ExamResponseItem[] = questions.slice(0, 50).map((q) => {
    const pts = clampInt(q.points, 1, 100);
    maxScore += pts;

    if (q.questionType === 'mcq') {
      const selected =
        typeof mcqSelections[q.id] === 'number' ? clampInt(mcqSelections[q.id], -1, 10) : -1;
      const earned = selected >= 0 && selected === q.correctOptionIndex ? pts : 0;
      awardedScore += earned;
      return {
        questionId: sanitizeId(q.id),
        questionPrompt: clampString(q.prompt, 1, BLUEPRINT_LIMITS.QUESTION_PROMPT_MAX),
        questionType: 'mcq',
        selectedOptionIndex: selected,
        textAnswer: '',
        awardedPoints: earned,
        maxPoints: pts,
      };
    } else {
      hasTextQuestions = true;
      const written = clampOptionalString(
        textResponses[q.id] || '',
        BLUEPRINT_LIMITS.TEXT_ANSWER_MAX
      );
      const rubricEarned = scoreWrittenResponseByRubric(written, q.rubricKeywords, pts);
      awardedScore += rubricEarned;
      return {
        questionId: sanitizeId(q.id),
        questionPrompt: clampString(q.prompt, 1, BLUEPRINT_LIMITS.QUESTION_PROMPT_MAX),
        questionType: 'text',
        selectedOptionIndex: -1,
        textAnswer: written,
        awardedPoints: rubricEarned,
        maxPoints: pts,
      };
    }
  });

  const safeMaxScore = Math.max(1, maxScore);
  const safeAwardedScore = clampInt(awardedScore, 0, safeMaxScore);
  const percentage = clampInt((safeAwardedScore / safeMaxScore) * 100, 0, 100);
  const passed = percentage >= liveProduct.passingPercentage;
  const gradingStatus = hasTextQuestions ? 'pending_review' : 'finalized';
  const safeDuration = clampInt(durationSeconds, 0, 86400);
  const safeAuthorId = sanitizeId(liveProduct.authorId || product.authorId || uid);

  const submissionPayload: Omit<ExamSubmission, 'createdAt' | 'updatedAt'> = {
    id: submissionId,
    userId: uid,
    userName: mergedDisplayName,
    userRegion: mergedRegion,
    userDesignation: mergedDesignation,
    userEmployeeId: mergedEmpId,
    userTerritory: mergedTerritory,
    userArea: mergedArea,
    productId: sanitizeId(liveProduct.id),
    productName: clampString(
      liveProduct.brandName,
      BLUEPRINT_LIMITS.BRAND_NAME_MIN,
      BLUEPRINT_LIMITS.BRAND_NAME_MAX
    ),
    productAuthorId: safeAuthorId,
    responses,
    awardedScore: safeAwardedScore,
    maxScore: safeMaxScore,
    percentage,
    passed,
    hasTextQuestions,
    gradingStatus,
    managerFeedback: '',
    durationSeconds: safeDuration,
    visibility: 'org',
  };

  // Check if a previously linked best submission was deleted by Admin
  let previousBestSubmissionMissing = false;
  if (leaderboardExists && percentage < existingBestPercentage && existingLbSubmissionId) {
    try {
      const prevSubSnap = await getFreshDoc(doc(db, 'exam_submissions', existingLbSubmissionId));
      previousBestSubmissionMissing = !prevSubSnap.exists();
    } catch {
      // Colleague owns their own exam_submissions; if unreadable/missing, replace cleanly
      previousBestSubmissionMissing = true;
    }
  }

  const batch = writeBatch(db);
  const submissionRef = doc(db, 'exam_submissions', submissionId);

  batch.set(submissionRef, {
    ...submissionPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (!leaderboardExists) {
    batch.set(leaderboardRef, {
      userId: submissionPayload.userId,
      userName: submissionPayload.userName,
      userRegion: submissionPayload.userRegion,
      userDesignation: submissionPayload.userDesignation,
      userEmployeeId: mergedEmpId,
      userTerritory: mergedTerritory,
      userArea: mergedArea,
      productId: submissionPayload.productId,
      productName: submissionPayload.productName,
      submissionId,
      score: safeAwardedScore,
      maxScore: safeMaxScore,
      percentage,
      passed,
      durationSeconds: safeDuration,
      gradingStatus,
      visibility: 'org',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else if (percentage >= existingBestPercentage || previousBestSubmissionMissing) {
    batch.update(leaderboardRef, {
      submissionId,
      score: safeAwardedScore,
      maxScore: safeMaxScore,
      percentage,
      passed,
      durationSeconds: safeDuration,
      gradingStatus,
      userName: submissionPayload.userName,
      userRegion: submissionPayload.userRegion,
      userDesignation: submissionPayload.userDesignation,
      userEmployeeId: mergedEmpId,
      userTerritory: mergedTerritory,
      userArea: mergedArea,
      productName: submissionPayload.productName,
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.update(leaderboardRef, {
      userName: submissionPayload.userName,
      userRegion: submissionPayload.userRegion,
      userDesignation: submissionPayload.userDesignation,
      userEmployeeId: mergedEmpId,
      userTerritory: mergedTerritory,
      userArea: mergedArea,
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `exam_submissions/${submissionId}`);
  }

  return submissionPayload;
}

export async function finalizeSubmissionReview(params: {
  submission: ExamSubmission;
  passingPercentage: number;
  adjustedPointsByQuestionId: Record<string, number>;
  managerFeedback: string;
}): Promise<void> {
  const { submission, passingPercentage, adjustedPointsByQuestionId, managerFeedback } = params;

  let totalAwarded = 0;
  const updatedResponses: ExamResponseItem[] = submission.responses.map((resp) => {
    const nextPts =
      resp.questionType === 'text' && typeof adjustedPointsByQuestionId[resp.questionId] === 'number'
        ? clampInt(adjustedPointsByQuestionId[resp.questionId], 0, resp.maxPoints)
        : resp.awardedPoints;
    totalAwarded += nextPts;
    return {
      ...resp,
      awardedPoints: nextPts,
    };
  });

  const safeAwarded = clampInt(totalAwarded, 0, submission.maxScore);
  const percentage = clampInt((safeAwarded / Math.max(1, submission.maxScore)) * 100, 0, 100);
  const passed = percentage >= passingPercentage;
  const safeFeedback = clampOptionalString(
    managerFeedback,
    BLUEPRINT_LIMITS.MANAGER_FEEDBACK_MAX
  );

  const subRef = doc(db, 'exam_submissions', submission.id);
  const lbId = `${submission.userId}_${submission.productId}`;
  const lbRef = doc(db, 'leaderboard', lbId);

  let shouldSyncLeaderboard = false;
  try {
    const lbSnap = await getDoc(lbRef);
    if (lbSnap.exists()) {
      const lbData = lbSnap.data() as { submissionId?: string; percentage?: number };
      if (lbData.submissionId === submission.id || percentage >= (lbData.percentage ?? 0)) {
        shouldSyncLeaderboard = true;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `leaderboard/${lbId}`);
  }

  const batch = writeBatch(db);
  batch.update(subRef, {
    responses: updatedResponses,
    awardedScore: safeAwarded,
    percentage,
    passed,
    gradingStatus: 'finalized',
    managerFeedback: safeFeedback,
    updatedAt: serverTimestamp(),
  });

  if (shouldSyncLeaderboard) {
    batch.update(lbRef, {
      score: safeAwarded,
      percentage,
      passed,
      gradingStatus: 'finalized',
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `exam_submissions/${submission.id}`);
  }
}

export async function resetColleagueSubmissionAttempt(
  submission: ExamSubmission
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'exam_submissions', submission.id));

  const lbId = `${submission.userId}_${submission.productId}`;
  const lbRef = doc(db, 'leaderboard', lbId);
  try {
    const lbSnap = await getDoc(lbRef);
    if (lbSnap.exists()) {
      const lbData = lbSnap.data() as { submissionId?: string };
      if (lbData.submissionId === submission.id) {
        batch.delete(lbRef);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `leaderboard/${lbId}`);
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `exam_submissions/${submission.id}`);
  }
}

export async function createProductModule(
  authorUid: string,
  input: {
    brandName: string;
    genericComposition: string;
    therapeuticClass: TherapeuticClass;
    summary: string;
    indications: string;
    dosageGuidance: string;
    keySellingPoints: string;
    coverImageKey: string;
    passingPercentage: number;
    examDurationMinutes: number;
    examEnabled?: boolean;
    allowRetakes?: boolean;
    status?: PublicationStatus;
  }
): Promise<string> {
  const slug = sanitizeId(
    `prod_${input.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()
      .toString()
      .slice(-4)}`
  );

  const payload = {
    id: slug,
    brandName: clampString(
      input.brandName,
      BLUEPRINT_LIMITS.BRAND_NAME_MIN,
      BLUEPRINT_LIMITS.BRAND_NAME_MAX
    ),
    genericComposition: clampString(
      input.genericComposition,
      BLUEPRINT_LIMITS.GENERIC_MIN,
      BLUEPRINT_LIMITS.GENERIC_MAX
    ),
    therapeuticClass: input.therapeuticClass,
    summary: clampString(
      input.summary,
      BLUEPRINT_LIMITS.SUMMARY_MIN,
      BLUEPRINT_LIMITS.SUMMARY_MAX
    ),
    indications: clampString(
      input.indications,
      BLUEPRINT_LIMITS.INDICATIONS_MIN,
      BLUEPRINT_LIMITS.INDICATIONS_MAX
    ),
    dosageGuidance: clampString(
      input.dosageGuidance,
      BLUEPRINT_LIMITS.DOSAGE_MIN,
      BLUEPRINT_LIMITS.DOSAGE_MAX
    ),
    keySellingPoints: clampString(
      input.keySellingPoints,
      BLUEPRINT_LIMITS.SELLING_POINTS_MIN,
      BLUEPRINT_LIMITS.SELLING_POINTS_MAX
    ),
    coverImageKey: clampString(
      input.coverImageKey || 'cardionova',
      2,
      BLUEPRINT_LIMITS.COVER_IMAGE_MAX,
      'cardionova'
    ),
    passingPercentage: clampInt(input.passingPercentage, 50, 100),
    examDurationMinutes: clampInt(input.examDurationMinutes, 1, 180),
    examEnabled: input.examEnabled ?? true,
    allowRetakes: input.allowRetakes ?? true,
    resourceCount: 0,
    questionCount: 0,
    status: input.status ?? ('published' as const),
    authorId: authorUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'products', slug), payload);
    return slug;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `products/${slug}`);
  }
}

export async function updateProductModuleAdminControls(
  product: ProductModule,
  resources: LearningResource[],
  questions: ExamQuestion[],
  updates: {
    brandName?: string;
    genericComposition?: string;
    therapeuticClass?: TherapeuticClass;
    summary?: string;
    indications?: string;
    dosageGuidance?: string;
    keySellingPoints?: string;
    coverImageKey?: string;
    passingPercentage?: number;
    examDurationMinutes?: number;
    examEnabled?: boolean;
    allowRetakes?: boolean;
    status?: PublicationStatus;
  }
): Promise<void> {
  const nextStatus = updates.status ?? product.status;

  try {
    await updateDoc(doc(db, 'products', product.id), {
      brandName: clampString(
        updates.brandName ?? product.brandName,
        BLUEPRINT_LIMITS.BRAND_NAME_MIN,
        BLUEPRINT_LIMITS.BRAND_NAME_MAX
      ),
      genericComposition: clampString(
        updates.genericComposition ?? product.genericComposition,
        BLUEPRINT_LIMITS.GENERIC_MIN,
        BLUEPRINT_LIMITS.GENERIC_MAX
      ),
      therapeuticClass: updates.therapeuticClass ?? product.therapeuticClass,
      summary: clampString(
        updates.summary ?? product.summary,
        BLUEPRINT_LIMITS.SUMMARY_MIN,
        BLUEPRINT_LIMITS.SUMMARY_MAX
      ),
      indications: clampString(
        updates.indications ?? product.indications,
        BLUEPRINT_LIMITS.INDICATIONS_MIN,
        BLUEPRINT_LIMITS.INDICATIONS_MAX
      ),
      dosageGuidance: clampString(
        updates.dosageGuidance ?? product.dosageGuidance,
        BLUEPRINT_LIMITS.DOSAGE_MIN,
        BLUEPRINT_LIMITS.DOSAGE_MAX
      ),
      keySellingPoints: clampString(
        updates.keySellingPoints ?? product.keySellingPoints,
        BLUEPRINT_LIMITS.SELLING_POINTS_MIN,
        BLUEPRINT_LIMITS.SELLING_POINTS_MAX
      ),
      coverImageKey: clampString(
        updates.coverImageKey ?? product.coverImageKey,
        2,
        BLUEPRINT_LIMITS.COVER_IMAGE_MAX,
        'cardionova'
      ),
      passingPercentage: clampInt(
        updates.passingPercentage ?? product.passingPercentage,
        50,
        100
      ),
      examDurationMinutes: clampInt(
        updates.examDurationMinutes ?? product.examDurationMinutes,
        1,
        180
      ),
      examEnabled: updates.examEnabled ?? product.examEnabled ?? true,
      allowRetakes: updates.allowRetakes ?? product.allowRetakes ?? true,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${product.id}`);
  }

  if (nextStatus !== product.status) {
    const statusOps: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];
    for (const r of resources) {
      const rRef = doc(db, 'products', product.id, 'resources', r.id);
      statusOps.push((batch) => {
        batch.update(rRef, {
          productStatus: nextStatus,
          updatedAt: serverTimestamp(),
        });
      });
    }
    for (const q of questions) {
      const qRef = doc(db, 'products', product.id, 'questions', q.id);
      statusOps.push((batch) => {
        batch.update(qRef, {
          productStatus: nextStatus,
          updatedAt: serverTimestamp(),
        });
      });
    }

    for (let i = 0; i < statusOps.length; i += SUBCOLLECTION_BATCH_CHUNK) {
      const chunk = statusOps.slice(i, i + SUBCOLLECTION_BATCH_CHUNK);
      const batch = writeBatch(db);
      for (const applyOp of chunk) {
        applyOp(batch);
      }
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `products/${product.id}`);
      }
    }
  }
}

export async function addLearningResourceToProduct(
  authorUid: string,
  product: ProductModule,
  currentCount: number,
  input: {
    resourceType: ResourceType;
    title: string;
    estimatedMinutes: number;
    bodyText: string;
    mediaUrl: string;
    mediaCaption: string;
    clinicalTakeaway: string;
  }
): Promise<void> {
  if (currentCount >= 50) {
    throw new Error('Maximum of 50 learning resources reached for this product module.');
  }
  const resourceId = sanitizeId(`res_${Date.now()}`);
  const batch = writeBatch(db);

  batch.set(doc(db, 'products', product.id, 'resources', resourceId), {
    id: resourceId,
    productId: product.id,
    authorId: authorUid,
    productStatus: product.status,
    orderIndex: clampInt(currentCount, 0, 50),
    resourceType: input.resourceType,
    title: clampString(
      input.title,
      BLUEPRINT_LIMITS.RESOURCE_TITLE_MIN,
      BLUEPRINT_LIMITS.RESOURCE_TITLE_MAX
    ),
    estimatedMinutes: clampInt(input.estimatedMinutes, 1, 90),
    bodyText: clampString(
      input.bodyText,
      BLUEPRINT_LIMITS.RESOURCE_BODY_MIN,
      BLUEPRINT_LIMITS.RESOURCE_BODY_MAX
    ),
    mediaUrl: clampOptionalString(input.mediaUrl, BLUEPRINT_LIMITS.MEDIA_URL_MAX),
    mediaCaption: clampOptionalString(input.mediaCaption, BLUEPRINT_LIMITS.MEDIA_CAPTION_MAX),
    clinicalTakeaway: clampString(
      input.clinicalTakeaway,
      BLUEPRINT_LIMITS.CLINICAL_TAKEAWAY_MIN,
      BLUEPRINT_LIMITS.CLINICAL_TAKEAWAY_MAX
    ),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.update(doc(db, 'products', product.id), {
    resourceCount: clampInt(currentCount + 1, 0, 50),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `products/${product.id}/resources/${resourceId}`);
  }
}

export async function updateLearningResource(
  productId: string,
  resourceId: string,
  input: {
    resourceType: ResourceType;
    title: string;
    estimatedMinutes: number;
    bodyText: string;
    mediaUrl: string;
    mediaCaption: string;
    clinicalTakeaway: string;
  }
): Promise<void> {
  const path = `products/${productId}/resources/${resourceId}`;
  try {
    await updateDoc(doc(db, 'products', productId, 'resources', resourceId), {
      resourceType: input.resourceType,
      title: clampString(
        input.title,
        BLUEPRINT_LIMITS.RESOURCE_TITLE_MIN,
        BLUEPRINT_LIMITS.RESOURCE_TITLE_MAX
      ),
      estimatedMinutes: clampInt(input.estimatedMinutes, 1, 90),
      bodyText: clampString(
        input.bodyText,
        BLUEPRINT_LIMITS.RESOURCE_BODY_MIN,
        BLUEPRINT_LIMITS.RESOURCE_BODY_MAX
      ),
      mediaUrl: clampOptionalString(input.mediaUrl, BLUEPRINT_LIMITS.MEDIA_URL_MAX),
      mediaCaption: clampOptionalString(input.mediaCaption, BLUEPRINT_LIMITS.MEDIA_CAPTION_MAX),
      clinicalTakeaway: clampString(
        input.clinicalTakeaway,
        BLUEPRINT_LIMITS.CLINICAL_TAKEAWAY_MIN,
        BLUEPRINT_LIMITS.CLINICAL_TAKEAWAY_MAX
      ),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function swapLearningResourceOrder(
  productId: string,
  first: LearningResource,
  second: LearningResource,
  indexA: number,
  indexB: number
): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'products', productId, 'resources', first.id), {
    orderIndex: clampInt(indexB, 0, 50),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'products', productId, 'resources', second.id), {
    orderIndex: clampInt(indexA, 0, 50),
    updatedAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${productId}/resources`);
  }
}

export async function removeLearningResource(
  product: ProductModule,
  resourceId: string,
  currentCount: number
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'products', product.id, 'resources', resourceId));
  batch.update(doc(db, 'products', product.id), {
    resourceCount: clampInt(Math.max(0, currentCount - 1), 0, 50),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${product.id}/resources/${resourceId}`);
  }
}

export async function addExamQuestionToProduct(
  authorUid: string,
  product: ProductModule,
  currentCount: number,
  input: {
    questionType: QuestionType;
    prompt: string;
    points: number;
    options: string[];
    correctOptionIndex: number;
    rubricKeywords: string[];
    modelAnswer: string;
  }
): Promise<void> {
  if (currentCount >= 50) {
    throw new Error('Maximum of 50 exam questions reached for this product module.');
  }
  const questionId = sanitizeId(`q_${Date.now()}`);
  const safeOptions =
    input.questionType === 'mcq'
      ? input.options
          .map((o) => o.trim())
          .filter((o) => o.length > 0)
          .slice(0, 6)
          .map((o) => clampString(o, 1, BLUEPRINT_LIMITS.OPTION_MAX))
      : [];

  const safeKeywords =
    input.questionType === 'text'
      ? input.rubricKeywords
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
          .slice(0, 8)
          .map((k) => clampString(k, 1, BLUEPRINT_LIMITS.KEYWORD_MAX))
      : [];

  const safeCorrectIdx =
    input.questionType === 'mcq'
      ? clampInt(input.correctOptionIndex, 0, Math.max(0, safeOptions.length - 1))
      : -1;

  const batch = writeBatch(db);
  batch.set(doc(db, 'products', product.id, 'questions', questionId), {
    id: questionId,
    productId: product.id,
    authorId: authorUid,
    productStatus: product.status,
    orderIndex: clampInt(currentCount, 0, 50),
    questionType: input.questionType,
    prompt: clampString(
      input.prompt,
      BLUEPRINT_LIMITS.QUESTION_PROMPT_MIN,
      BLUEPRINT_LIMITS.QUESTION_PROMPT_MAX
    ),
    points: clampInt(input.points, 1, 100),
    options: safeOptions,
    correctOptionIndex: safeCorrectIdx,
    rubricKeywords: safeKeywords,
    modelAnswer: clampString(
      input.modelAnswer,
      BLUEPRINT_LIMITS.MODEL_ANSWER_MIN,
      BLUEPRINT_LIMITS.MODEL_ANSWER_MAX
    ),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.update(doc(db, 'products', product.id), {
    questionCount: clampInt(currentCount + 1, 0, 50),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `products/${product.id}/questions/${questionId}`);
  }
}

export async function updateExamQuestion(
  productId: string,
  questionId: string,
  input: {
    questionType: QuestionType;
    prompt: string;
    points: number;
    options: string[];
    correctOptionIndex: number;
    rubricKeywords: string[];
    modelAnswer: string;
  }
): Promise<void> {
  const safeOptions =
    input.questionType === 'mcq'
      ? input.options
          .map((o) => o.trim())
          .filter((o) => o.length > 0)
          .slice(0, 6)
          .map((o) => clampString(o, 1, BLUEPRINT_LIMITS.OPTION_MAX))
      : [];

  const safeKeywords =
    input.questionType === 'text'
      ? input.rubricKeywords
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
          .slice(0, 8)
          .map((k) => clampString(k, 1, BLUEPRINT_LIMITS.KEYWORD_MAX))
      : [];

  const safeCorrectIdx =
    input.questionType === 'mcq'
      ? clampInt(input.correctOptionIndex, 0, Math.max(0, safeOptions.length - 1))
      : -1;

  const path = `products/${productId}/questions/${questionId}`;
  try {
    await updateDoc(doc(db, 'products', productId, 'questions', questionId), {
      questionType: input.questionType,
      prompt: clampString(
        input.prompt,
        BLUEPRINT_LIMITS.QUESTION_PROMPT_MIN,
        BLUEPRINT_LIMITS.QUESTION_PROMPT_MAX
      ),
      points: clampInt(input.points, 1, 100),
      options: safeOptions,
      correctOptionIndex: safeCorrectIdx,
      rubricKeywords: safeKeywords,
      modelAnswer: clampString(
        input.modelAnswer,
        BLUEPRINT_LIMITS.MODEL_ANSWER_MIN,
        BLUEPRINT_LIMITS.MODEL_ANSWER_MAX
      ),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function swapExamQuestionOrder(
  productId: string,
  first: ExamQuestion,
  second: ExamQuestion,
  indexA: number,
  indexB: number
): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'products', productId, 'questions', first.id), {
    orderIndex: clampInt(indexB, 0, 50),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'products', productId, 'questions', second.id), {
    orderIndex: clampInt(indexA, 0, 50),
    updatedAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${productId}/questions`);
  }
}

export async function removeExamQuestion(
  product: ProductModule,
  questionId: string,
  currentCount: number
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'products', product.id, 'questions', questionId));
  batch.update(doc(db, 'products', product.id), {
    questionCount: clampInt(Math.max(0, currentCount - 1), 0, 50),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${product.id}/questions/${questionId}`);
  }
}

export async function grantColleagueAdminAccess(
  granterUid: string,
  targetUid: string,
  region: string
): Promise<void> {
  const cleanUid = sanitizeId(targetUid);
  const path = `admins/${cleanUid}`;
  try {
    await setDoc(doc(db, 'admins', cleanUid), {
      uid: cleanUid,
      grantedBy: granterUid,
      region: clampString(region, BLUEPRINT_LIMITS.REGION_MIN, BLUEPRINT_LIMITS.REGION_MAX, 'Dhaka North'),
      visibility: 'org',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function revokeColleagueAdminAccess(targetUid: string): Promise<void> {
  const cleanUid = sanitizeId(targetUid);
  const path = `admins/${cleanUid}`;
  try {
    await deleteDoc(doc(db, 'admins', cleanUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteProductModule(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}
