import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Database,
  Edit3,
  Eye,
  Link2,
  Lock,
  Phone,
  Plus,
  RotateCcw,
  Settings2,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import {
  buildShareableExamInviteText,
  buildShareableExamUrl,
  copyTextToClipboard,
} from '../lib/examLinks';
import { BOOTSTRAPPED_ADMIN_EMAIL } from '../lib/firebase';
import {
  addExamQuestionToProduct,
  addLearningResourceToProduct,
  createProductModule,
  deleteProductModule,
  fetchColleaguePrivateInfoForAdmin,
  fetchProductSubcollections,
  finalizeSubmissionReview,
  grantColleagueAdminAccess,
  removeExamQuestion,
  removeLearningResource,
  resetColleagueSubmissionAttempt,
  revokeColleagueAdminAccess,
  seedFlagshipCurriculum,
  swapExamQuestionOrder,
  swapLearningResourceOrder,
  updateExamQuestion,
  updateLearningResource,
  updateProductModuleAdminControls,
} from '../services/academyService';
import {
  NOVATEK_REGIONS,
  THERAPEUTIC_CLASSES,
  type AdminRecord,
  type ExamQuestion,
  type ExamSubmission,
  type LearningResource,
  type PrivateUserInfo,
  type ProductModule,
  type PublicationStatus,
  type PublicProfile,
  type QuestionType,
  type ResourceType,
  type TherapeuticClass,
} from '../types/models';
import { ClinicalVideoPlayer } from './ClinicalVideoPlayer';
import { ResilientImage } from './ResilientImage';

interface ManagerStudioProps {
  currentUserUid: string;
  currentUserEmail: string;
  isAdmin: boolean;
  products: ProductModule[];
  initialSelectedProductId?: string | null;
  allSubmissions: ExamSubmission[];
  colleagueProfiles: PublicProfile[];
  adminRecords: AdminRecord[];
  onNotify: (msg: string) => void;
  onReturnToCatalog: () => void;
}

export const ManagerStudio: React.FC<ManagerStudioProps> = ({
  currentUserUid,
  currentUserEmail,
  isAdmin,
  products,
  initialSelectedProductId,
  allSubmissions,
  colleagueProfiles,
  adminRecords,
  onNotify,
  onReturnToCatalog,
}) => {
  const [studioTab, setStudioTab] = useState<'materials' | 'exams' | 'grading' | 'admins'>(
    'materials'
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialSelectedProductId || products[0]?.id || ''
  );
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [confirmResetSubId, setConfirmResetSubId] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedShareMode, setCopiedShareMode] = useState<'none' | 'link' | 'invite'>('none');

  // Create / Edit Product Modal State
  const [productEditorMode, setProductEditorMode] = useState<'none' | 'create' | 'edit'>('none');
  const [brandName, setBrandName] = useState('');
  const [genericComposition, setGenericComposition] = useState('');
  const [therapeuticClass, setTherapeuticClass] = useState<TherapeuticClass>('Cardiovascular');
  const [summary, setSummary] = useState('');
  const [indications, setIndications] = useState('');
  const [dosageGuidance, setDosageGuidance] = useState('');
  const [keySellingPoints, setKeySellingPoints] = useState('');
  const [coverImageKey, setCoverImageKey] = useState('cardionova');
  const [moduleStatus, setModuleStatus] = useState<PublicationStatus>('published');
  const [passingPercentage, setPassingPercentage] = useState(75);
  const [examDurationMinutes, setExamDurationMinutes] = useState(12);

  // Dedicated Exam Control State for Active Product
  const [ctrlExamEnabled, setCtrlExamEnabled] = useState(true);
  const [ctrlAllowRetakes, setCtrlAllowRetakes] = useState(true);
  const [ctrlPassingPct, setCtrlPassingPct] = useState(75);
  const [ctrlDurationMin, setCtrlDurationMin] = useState(12);

  // Teaching Material Create / Edit State
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [previewResourceEditor, setPreviewResourceEditor] = useState(false);
  const [resourceType, setResourceType] = useState<ResourceType>('text');
  const [resTitle, setResTitle] = useState('');
  const [resMinutes, setResMinutes] = useState(5);
  const [resBody, setResBody] = useState('');
  const [resMediaUrl, setResMediaUrl] = useState('');
  const [resMediaCaption, setResMediaCaption] = useState('');
  const [resTakeaway, setResTakeaway] = useState('');

  // Exam Question Create / Edit State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [qPrompt, setQPrompt] = useState('');
  const [qPoints, setQPoints] = useState(25);
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectIdx, setQCorrectIdx] = useState(0);
  const [qKeywordsRaw, setQKeywordsRaw] = useState('');
  const [qModelAnswer, setQModelAnswer] = useState('');

  // Submissions & Grading Filter State
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<
    'all' | 'pending_review' | 'finalized'
  >('all');
  const [submissionProductFilter, setSubmissionProductFilter] = useState<string>('ALL');
  const [activeSubmissionId, setActiveSubmissionId] = useState<string>('');
  const [adjustedScores, setAdjustedScores] = useState<Record<string, number>>({});
  const [managerFeedback, setManagerFeedback] = useState<string>('');

  // Admin Role Grant State
  const [coManagerUid, setCoManagerUid] = useState('');
  const [coManagerRegion, setCoManagerRegion] = useState(NOVATEK_REGIONS[0]);

  useEffect(() => {
    if (initialSelectedProductId) {
      setSelectedProductId(initialSelectedProductId);
    }
  }, [initialSelectedProductId]);

  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  // Sync Exam Control fields whenever selectedProduct updates
  useEffect(() => {
    if (selectedProduct) {
      setCtrlExamEnabled(selectedProduct.examEnabled !== false);
      setCtrlAllowRetakes(selectedProduct.allowRetakes !== false);
      setCtrlPassingPct(selectedProduct.passingPercentage);
      setCtrlDurationMin(selectedProduct.examDurationMinutes);
    }
  }, [
    selectedProduct?.id,
    selectedProduct?.examEnabled,
    selectedProduct?.allowRetakes,
    selectedProduct?.passingPercentage,
    selectedProduct?.examDurationMinutes,
  ]);

  const reloadSubcollections = async (prod: ProductModule) => {
    setLoadingSub(true);
    try {
      const data = await fetchProductSubcollections(prod.id, prod.status, prod.authorId);
      setResources(data.resources);
      setQuestions(data.questions);
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    setCopiedShareMode('none');
    if (isAdmin && selectedProduct) {
      resetResourceForm();
      resetQuestionForm();
      void reloadSubcollections(selectedProduct);
    } else {
      setResources([]);
      setQuestions([]);
    }
  }, [isAdmin, selectedProduct?.id]);

  const handleCopyProductExamLink = async (prod: ProductModule, mode: 'link' | 'invite') => {
    const text =
      mode === 'invite'
        ? buildShareableExamInviteText(prod)
        : buildShareableExamUrl(prod.id);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedShareMode(mode);
      onNotify(
        mode === 'invite'
          ? `Copied exam invitation message & link for ${prod.brandName}.`
          : `Copied direct exam link for ${prod.brandName}.`
      );
      window.setTimeout(() => setCopiedShareMode('none'), 2500);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return allSubmissions.filter((s) => {
      if (submissionStatusFilter !== 'all' && s.gradingStatus !== submissionStatusFilter) {
        return false;
      }
      if (submissionProductFilter !== 'ALL' && s.productId !== submissionProductFilter) {
        return false;
      }
      return true;
    });
  }, [allSubmissions, submissionStatusFilter, submissionProductFilter]);

  const activeSubmission =
    filteredSubmissions.find((s) => s.id === activeSubmissionId) ||
    filteredSubmissions[0] ||
    null;

  const [privateContactByUid, setPrivateContactByUid] = useState<
    Record<string, PrivateUserInfo | null>
  >({});
  const [loadingContactUid, setLoadingContactUid] = useState<string | null>(null);

  const handleLoadPrivateContact = async (uid: string) => {
    if (loadingContactUid === uid) return;
    setLoadingContactUid(uid);
    try {
      const info = await fetchColleaguePrivateInfoForAdmin(uid);
      setPrivateContactByUid((prev) => ({ ...prev, [uid]: info }));
    } finally {
      setLoadingContactUid(null);
    }
  };

  useEffect(() => {
    if (activeSubmission) {
      const initialPts: Record<string, number> = {};
      for (const r of activeSubmission.responses) {
        initialPts[r.questionId] = r.awardedPoints;
      }
      setAdjustedScores(initialPts);
      setManagerFeedback(activeSubmission.managerFeedback || '');
    }
  }, [activeSubmission?.id]);

  // Non-Admin Colleague Informative Role Screen
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Administrator Access Required</h1>
              <p className="text-xs text-slate-500">
                Teaching material authoring and exam controls are restricted to authorized Novatek
                Administrators.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            You are currently signed in as <span className="font-medium text-slate-900">{currentUserEmail}</span>.
            To manage teaching materials or exam settings, ask the Regional Manager Administrator to
            grant Admin privileges to your Colleague UID below in the <strong>Admin Roles</strong>{' '}
            tab.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Your Account UID</p>
              <p className="text-sm font-mono font-medium text-slate-900 truncate">
                {currentUserUid}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(currentUserUid);
                setCopiedUid(true);
                window.setTimeout(() => setCopiedUid(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
            >
              {copiedUid ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedUid ? 'Copied UID' : 'Copy UID'}
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onReturnToCatalog}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer"
            >
              Back to Product Learning Modules
            </button>
          </div>
        </div>
      </div>
    );
  }

  function resetResourceForm() {
    setEditingResourceId(null);
    setPreviewResourceEditor(false);
    setResourceType('text');
    setResTitle('');
    setResMinutes(5);
    setResBody('');
    setResMediaUrl('');
    setResMediaCaption('');
    setResTakeaway('');
  }

  function loadResourceIntoEditor(res: LearningResource) {
    setEditingResourceId(res.id);
    setResourceType(res.resourceType);
    setResTitle(res.title);
    setResMinutes(res.estimatedMinutes);
    setResBody(res.bodyText);
    setResMediaUrl(res.mediaUrl);
    setResMediaCaption(res.mediaCaption);
    setResTakeaway(res.clinicalTakeaway);
  }

  function resetQuestionForm() {
    setEditingQuestionId(null);
    setQuestionType('mcq');
    setQPrompt('');
    setQPoints(25);
    setQOptions(['', '', '', '']);
    setQCorrectIdx(0);
    setQKeywordsRaw('');
    setQModelAnswer('');
  }

  function loadQuestionIntoEditor(q: ExamQuestion) {
    setEditingQuestionId(q.id);
    setQuestionType(q.questionType);
    setQPrompt(q.prompt);
    setQPoints(q.points);
    setQOptions(q.options.length >= 2 ? [...q.options] : ['', '', '', '']);
    setQCorrectIdx(q.correctOptionIndex >= 0 ? q.correctOptionIndex : 0);
    setQKeywordsRaw(q.rubricKeywords.join(', '));
    setQModelAnswer(q.modelAnswer);
  }

  function openCreateProductForm() {
    setBrandName('');
    setGenericComposition('');
    setTherapeuticClass('Cardiovascular');
    setSummary('');
    setIndications('');
    setDosageGuidance('');
    setKeySellingPoints('');
    setCoverImageKey('cardionova');
    setModuleStatus('published');
    setPassingPercentage(75);
    setExamDurationMinutes(12);
    setProductEditorMode('create');
  }

  function openEditProductForm(prod: ProductModule) {
    setBrandName(prod.brandName);
    setGenericComposition(prod.genericComposition);
    setTherapeuticClass(prod.therapeuticClass);
    setSummary(prod.summary);
    setIndications(prod.indications);
    setDosageGuidance(prod.dosageGuidance);
    setKeySellingPoints(prod.keySellingPoints);
    setCoverImageKey(prod.coverImageKey);
    setModuleStatus(prod.status);
    setPassingPercentage(prod.passingPercentage);
    setExamDurationMinutes(prod.examDurationMinutes);
    setProductEditorMode('edit');
  }

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName.trim().length < 2 || summary.trim().length < 10) return;
    setBusyAction(true);
    try {
      if (productEditorMode === 'create') {
        const newId = await createProductModule(currentUserUid, {
          brandName,
          genericComposition,
          therapeuticClass,
          summary,
          indications,
          dosageGuidance,
          keySellingPoints,
          coverImageKey,
          passingPercentage,
          examDurationMinutes,
          examEnabled: true,
          allowRetakes: true,
          status: moduleStatus,
        });
        setSelectedProductId(newId);
        onNotify(`Created product module "${brandName}".`);
      } else if (productEditorMode === 'edit' && selectedProduct) {
        await updateProductModuleAdminControls(selectedProduct, resources, questions, {
          brandName,
          genericComposition,
          therapeuticClass,
          summary,
          indications,
          dosageGuidance,
          keySellingPoints,
          coverImageKey,
          passingPercentage,
          examDurationMinutes,
          status: moduleStatus,
        });
        await reloadSubcollections({
          ...selectedProduct,
          status: moduleStatus,
        });
        onNotify(`Updated module "${brandName}".`);
      }
      setProductEditorMode('none');
    } finally {
      setBusyAction(false);
    }
  };

  const handleQuickToggleVisibility = async (prod: ProductModule) => {
    const nextStatus: PublicationStatus = prod.status === 'published' ? 'draft' : 'published';
    setBusyAction(true);
    try {
      await updateProductModuleAdminControls(prod, resources, questions, {
        status: nextStatus,
      });
      await reloadSubcollections({ ...prod, status: nextStatus });
      onNotify(
        nextStatus === 'published'
          ? `${prod.brandName} is now Published to colleagues.`
          : `${prod.brandName} moved to Draft (hidden from colleagues).`
      );
    } finally {
      setBusyAction(false);
    }
  };

  const handleSaveExamGovernance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setBusyAction(true);
    try {
      await updateProductModuleAdminControls(selectedProduct, resources, questions, {
        examEnabled: ctrlExamEnabled,
        allowRetakes: ctrlAllowRetakes,
        passingPercentage: ctrlPassingPct,
        examDurationMinutes: ctrlDurationMin,
      });
      onNotify(`Saved exam controls for ${selectedProduct.brandName}.`);
    } finally {
      setBusyAction(false);
    }
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || resTitle.trim().length < 3 || resBody.trim().length < 10) return;
    setBusyAction(true);
    const resolvedMedia =
      resourceType === 'video' && !resMediaUrl.trim()
        ? 'novatek-briefing://cardionova-pk'
        : resourceType === 'image' && !resMediaUrl.trim()
        ? 'diagram_pharmacokinetics'
        : resourceType === 'text'
        ? ''
        : resMediaUrl;

    try {
      if (editingResourceId) {
        await updateLearningResource(selectedProduct.id, editingResourceId, {
          resourceType,
          title: resTitle,
          estimatedMinutes: resMinutes,
          bodyText: resBody,
          mediaUrl: resolvedMedia,
          mediaCaption: resMediaCaption,
          clinicalTakeaway: resTakeaway || 'Communicate approved clinical benefits accurately.',
        });
        onNotify('Updated teaching material.');
      } else {
        await addLearningResourceToProduct(currentUserUid, selectedProduct, resources.length, {
          resourceType,
          title: resTitle,
          estimatedMinutes: resMinutes,
          bodyText: resBody,
          mediaUrl: resolvedMedia,
          mediaCaption: resMediaCaption,
          clinicalTakeaway: resTakeaway || 'Communicate approved clinical benefits accurately.',
        });
        onNotify('Added new teaching material.');
      }
      resetResourceForm();
      await reloadSubcollections(selectedProduct);
    } finally {
      setBusyAction(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || qPrompt.trim().length < 8 || qModelAnswer.trim().length < 2) return;
    setBusyAction(true);
    const keywords = qKeywordsRaw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      if (editingQuestionId) {
        await updateExamQuestion(selectedProduct.id, editingQuestionId, {
          questionType,
          prompt: qPrompt,
          points: qPoints,
          options: qOptions,
          correctOptionIndex: qCorrectIdx,
          rubricKeywords: keywords,
          modelAnswer: qModelAnswer,
        });
        onNotify('Updated exam question.');
      } else {
        await addExamQuestionToProduct(currentUserUid, selectedProduct, questions.length, {
          questionType,
          prompt: qPrompt,
          points: qPoints,
          options: qOptions,
          correctOptionIndex: qCorrectIdx,
          rubricKeywords: keywords,
          modelAnswer: qModelAnswer,
        });
        onNotify('Added exam question.');
      }
      resetQuestionForm();
      await reloadSubcollections(selectedProduct);
    } finally {
      setBusyAction(false);
    }
  };

  const pendingReviewsCount = allSubmissions.filter(
    (s) => s.gradingStatus === 'pending_review'
  ).length;
  const totalExamPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const mcqCount = questions.filter((q) => q.questionType === 'mcq').length;
  const writtenCount = questions.filter((q) => q.questionType === 'text').length;
  const adminUidSet = new Set(adminRecords.map((a) => a.uid));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            Novatek Pharmaceutical Limited · Administrator Control Center
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Admin Panel — Teaching Materials &amp; Exam Control
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busyAction}
            onClick={async () => {
              setBusyAction(true);
              try {
                const seeded = await seedFlagshipCurriculum(currentUserUid);
                onNotify(
                  seeded.length > 0
                    ? `Synced ${seeded.length} flagship module(s) including Gaprito 50 mg.`
                    : 'All flagship pharmaceutical modules (including Gaprito 50 mg) are already synced.'
                );
              } finally {
                setBusyAction(false);
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Database className="w-3.5 h-3.5 text-teal-700" />
            Restore Default Modules
          </button>
          <button
            type="button"
            onClick={openCreateProductForm}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Product Module
          </button>
        </div>
      </div>

      {/* 4-Tab Segmented Admin Switcher */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setStudioTab('materials')}
          className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            studioTab === 'materials'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Teaching Materials ({products.length} Modules)
        </button>

        <button
          type="button"
          onClick={() => setStudioTab('exams')}
          className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            studioTab === 'exams'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Exam Control &amp; Questions
        </button>

        <button
          type="button"
          onClick={() => setStudioTab('grading')}
          className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            studioTab === 'grading'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          Submissions &amp; Grading ({pendingReviewsCount} Pending)
        </button>

        <button
          type="button"
          onClick={() => setStudioTab('admins')}
          className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            studioTab === 'admins'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin Roles &amp; Colleagues
        </button>
      </div>

      {/* Create / Edit Product Module Drawer */}
      {productEditorMode !== 'none' && (
        <form
          onSubmit={(e) => void handleSaveProductForm(e)}
          className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {productEditorMode === 'create'
                ? 'Create New Pharmaceutical Product Module'
                : `Edit Product Module · ${selectedProduct?.brandName}`}
            </h2>
            <button
              type="button"
              onClick={() => setProductEditorMode('none')}
              className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
              aria-label="Close product form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Brand Name *</label>
              <input
                required
                minLength={2}
                maxLength={100}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. GastroShield XR"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Generic Composition *
              </label>
              <input
                required
                minLength={2}
                maxLength={160}
                value={genericComposition}
                onChange={(e) => setGenericComposition(e.target.value)}
                placeholder="e.g. Dexlansoprazole 60 mg Dual-Release Capsule"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Therapeutic Class *
              </label>
              <select
                value={therapeuticClass}
                onChange={(e) => setTherapeuticClass(e.target.value as TherapeuticClass)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-teal-700"
              >
                {THERAPEUTIC_CLASSES.map((tc) => (
                  <option key={tc} value={tc}>
                    {tc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Clinical Positioning Summary *
            </label>
            <textarea
              required
              minLength={10}
              maxLength={600}
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Concise 1–2 sentence clinical summary for colleagues..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Approved Indications *
              </label>
              <textarea
                required
                minLength={5}
                maxLength={1200}
                rows={3}
                value={indications}
                onChange={(e) => setIndications(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Dosage Guidance *
              </label>
              <textarea
                required
                minLength={5}
                maxLength={800}
                rows={3}
                value={dosageGuidance}
                onChange={(e) => setDosageGuidance(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Key Field Differentiation *
              </label>
              <textarea
                required
                minLength={5}
                maxLength={1200}
                rows={3}
                value={keySellingPoints}
                onChange={(e) => setKeySellingPoints(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cover Image Preset or URL
              </label>
              <input
                value={coverImageKey}
                onChange={(e) => setCoverImageKey(e.target.value)}
                placeholder="gaprito_pack, gaprito_sheet, cardionova, or https://..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Visibility Status
              </label>
              <select
                value={moduleStatus}
                onChange={(e) => setModuleStatus(e.target.value as PublicationStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-teal-700"
              >
                <option value="published">Published (Visible to Colleagues)</option>
                <option value="draft">Draft (Hidden from Colleagues)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Exam Duration (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={examDurationMinutes}
                onChange={(e) => setExamDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setProductEditorMode('none')}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busyAction}
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer"
            >
              {busyAction
                ? 'Saving...'
                : productEditorMode === 'create'
                ? 'Create Module'
                : 'Save Module Changes'}
            </button>
          </div>
        </form>
      )}

      {/* SHARED PRODUCT SELECTOR FOR TEACHING MATERIALS & EXAM CONTROL TABS */}
      {(studioTab === 'materials' || studioTab === 'exams') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Module List */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
            <div className="px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Select Product Module</h2>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {products.length} total
              </span>
            </div>

            {products.length === 0 ? (
              <div className="p-6 text-xs text-slate-500">
                No product modules found. Click &ldquo;Restore Default Modules&rdquo; or create a
                new module above.
              </div>
            ) : (
              products.map((prod) => {
                const isSelected = prod.id === selectedProductId;
                const examOpen = prod.examEnabled !== false;
                return (
                  <div
                    key={prod.id}
                    className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-teal-50/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedProductId(prod.id)}
                      className="text-left flex-1 cursor-pointer min-w-0"
                    >
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {prod.brandName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {prod.therapeuticClass} ·{' '}
                        {prod.status === 'published' ? (
                          <span className="text-emerald-700 font-medium">Published</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Draft</span>
                        )}
                      </p>
                      <p className="text-xs font-mono text-slate-500 mt-1 tabular-nums">
                        {prod.resourceCount} materials · {prod.questionCount} Qs ·{' '}
                        {examOpen ? 'Exam Open' : 'Exam Locked'}
                      </p>
                    </button>

                    {confirmDeleteProductId === prod.id ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteProductModule(prod.id);
                            setConfirmDeleteProductId(null);
                            if (selectedProductId === prod.id) setSelectedProductId('');
                            onNotify(`Deleted ${prod.brandName}.`);
                          }}
                          className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteProductId(null)}
                          className="px-2 py-1 text-xs text-slate-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Delete ${prod.brandName}`}
                        onClick={() => setConfirmDeleteProductId(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Active Tab Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedProduct ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
                Select a product module on the left to manage its teaching materials and exam.
              </div>
            ) : studioTab === 'materials' ? (
              /* WORKSPACE 1: TEACHING MATERIALS CONTROL */
              <>
                {/* Module Overview & Quick Visibility Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedProduct.brandName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedProduct.genericComposition} ·{' '}
                      {selectedProduct.status === 'published'
                        ? '✓ Live in Colleague Catalog'
                        : '▲ Hidden Draft Mode'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => void handleCopyProductExamLink(selectedProduct, 'link')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {copiedShareMode === 'link' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Link2 className="w-3.5 h-3.5 text-teal-700" />
                      )}
                      {copiedShareMode === 'link' ? 'Copied Exam Link' : 'Share Exam Link'}
                    </button>
                    <button
                      type="button"
                      disabled={busyAction}
                      onClick={() => void handleQuickToggleVisibility(selectedProduct)}
                      className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {selectedProduct.status === 'published'
                        ? 'Unpublish to Draft'
                        : 'Publish to Colleagues'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditProductForm(selectedProduct)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      Edit Module Info
                    </button>
                  </div>
                </div>

                {/* Existing Teaching Materials List with Edit & Reorder */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">
                        Teaching Materials ({resources.length})
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reorder, edit, or delete Text Monographs, Video Briefings, and Image Visual
                        Aids.
                      </p>
                    </div>
                  </div>

                  {loadingSub ? (
                    <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
                      {resources.map((res, idx) => (
                        <div
                          key={res.id}
                          className={`py-3.5 flex flex-wrap items-center justify-between gap-4 text-sm ${
                            editingResourceId === res.id ? 'bg-teal-50/40 px-3 rounded-lg' : ''
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">
                              {String(idx + 1).padStart(2, '0')}. {res.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                              Format: {res.resourceType.toUpperCase()} · {res.estimatedMinutes} min
                              study
                              {res.mediaUrl ? ` · Media attached` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0 || busyAction}
                              onClick={async () => {
                                await swapLearningResourceOrder(
                                  selectedProduct.id,
                                  resources[idx],
                                  resources[idx - 1],
                                  idx,
                                  idx - 1
                                );
                                await reloadSubcollections(selectedProduct);
                              }}
                              aria-label="Move material up"
                              className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx >= resources.length - 1 || busyAction}
                              onClick={async () => {
                                await swapLearningResourceOrder(
                                  selectedProduct.id,
                                  resources[idx],
                                  resources[idx + 1],
                                  idx,
                                  idx + 1
                                );
                                await reloadSubcollections(selectedProduct);
                              }}
                              aria-label="Move material down"
                              className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => loadResourceIntoEditor(res)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await removeLearningResource(
                                  selectedProduct,
                                  res.id,
                                  resources.length
                                );
                                if (editingResourceId === res.id) resetResourceForm();
                                await reloadSubcollections(selectedProduct);
                                onNotify('Removed teaching material.');
                              }}
                              aria-label="Remove teaching material"
                              className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {resources.length === 0 && (
                        <p className="py-5 text-xs text-slate-500">
                          No teaching materials in this module yet. Add your first text, video, or
                          image unit below.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Add / Edit Teaching Material Form */}
                  <form onSubmit={(e) => void handleSaveResource(e)} className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-slate-900">
                        {editingResourceId
                          ? 'Edit Selected Teaching Material'
                          : 'Add New Teaching Material'}
                      </h5>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPreviewResourceEditor((p) => !p)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {previewResourceEditor ? 'Hide Preview' : 'Preview Material'}
                        </button>
                        {editingResourceId && (
                          <button
                            type="button"
                            onClick={resetResourceForm}
                            className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Material Format</label>
                        <select
                          value={resourceType}
                          onChange={(e) => setResourceType(e.target.value as ResourceType)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="text">Text Monograph</option>
                          <option value="video">Video Briefing</option>
                          <option value="image">Image / Visual Aid</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-slate-600 mb-1">Unit Title *</label>
                        <input
                          required
                          minLength={3}
                          maxLength={240}
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          placeholder="e.g. Mechanism of Action & Dosing Schedule"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Study Time (Min)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={resMinutes}
                          onChange={(e) => setResMinutes(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    {resourceType !== 'text' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            {resourceType === 'video'
                              ? 'Video URL (YouTube, .mp4, or Guided Preset)'
                              : 'Image URL or Visual Preset'}
                          </label>
                          <input
                            maxLength={500}
                            value={resMediaUrl}
                            onChange={(e) => setResMediaUrl(e.target.value)}
                            placeholder={
                              resourceType === 'video'
                                ? 'https://youtube.com/watch?v=... or novatek-briefing://gaprito-bangla'
                                : 'gaprito_sheet, gaprito_evidence, gaprito_molecule, gaprito_pi, or https://...'
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">Media Caption</label>
                          <input
                            maxLength={300}
                            value={resMediaCaption}
                            onChange={(e) => setResMediaCaption(e.target.value)}
                            placeholder="Figure number or clinical video caption..."
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Teaching Content / Clinical Notes *
                      </label>
                      <textarea
                        required
                        minLength={10}
                        maxLength={8000}
                        rows={4}
                        value={resBody}
                        onChange={(e) => setResBody(e.target.value)}
                        placeholder="Write the clinical teaching text, pharmacology points, or video briefing transcript..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Key Physician Detailing Takeaway *
                      </label>
                      <input
                        required
                        minLength={5}
                        maxLength={500}
                        value={resTakeaway}
                        onChange={(e) => setResTakeaway(e.target.value)}
                        placeholder="Core clinical message colleagues must remember for physician calls..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    {previewResourceEditor && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Colleague View Preview
                        </p>
                        {resourceType === 'video' && (
                          <ClinicalVideoPlayer
                            mediaUrl={resMediaUrl || 'novatek-briefing://cardionova-pk'}
                            title={resTitle || 'Clinical Briefing Preview'}
                            caption={resMediaCaption}
                            fallbackSummary={
                              resBody || 'Enter clinical notes above to preview narration.'
                            }
                          />
                        )}
                        {resourceType === 'image' && (
                          <div className="aspect-[16/9] max-h-64 overflow-hidden rounded-lg border border-slate-200 bg-white">
                            <ResilientImage
                              srcKeyOrUrl={resMediaUrl || 'diagram_pharmacokinetics'}
                              alt={resTitle || 'Teaching diagram preview'}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        {resBody && (
                          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                            {resBody}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={busyAction}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer"
                    >
                      {editingResourceId ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Save Teaching Material Updates
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Teaching Material
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* WORKSPACE 2: EXAM CONTROL & QUESTIONS */
              <>
                {/* Shareable Direct Exam Link Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Share Specific Exam Link · {selectedProduct.brandName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Send this direct link to colleagues on WhatsApp, SMS, or Email so they can
                        open and take this exact exam directly without prior study unit completion.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      type="text"
                      readOnly
                      value={buildShareableExamUrl(selectedProduct.id)}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-label="Direct shareable exam link"
                      className="flex-1 px-3.5 py-2 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-700"
                    />
                    <button
                      type="button"
                      onClick={() => void handleCopyProductExamLink(selectedProduct, 'link')}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {copiedShareMode === 'link' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Link2 className="w-3.5 h-3.5" />
                      )}
                      {copiedShareMode === 'link' ? 'Copied Exam Link' : 'Copy Exam Link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopyProductExamLink(selectedProduct, 'invite')}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {copiedShareMode === 'invite' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-teal-700" />
                      )}
                      {copiedShareMode === 'invite' ? 'Copied Invite' : 'Copy Invite Message'}
                    </button>
                  </div>

                  {(selectedProduct.status !== 'published' || selectedProduct.examEnabled === false) && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2">
                      ▲ Note: Ensure this product module is <strong>Published</strong> and{' '}
                      <strong>Exam Open</strong> before colleagues open the shared link.
                    </p>
                  )}
                </div>

                {/* Exam Governance Control Card */}
                <form
                  onSubmit={(e) => void handleSaveExamGovernance(e)}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {selectedProduct.brandName} · Exam Governance &amp; Rules
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Open or lock the exam, configure retake rules, and set time &amp; passing
                        score thresholds.
                      </p>
                    </div>
                    <div className="text-xs font-mono text-slate-600 tabular-nums">
                      {questions.length} Qs ({mcqCount} MCQ · {writtenCount} Written) ·{' '}
                      {totalExamPoints} Total Pts
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Exam Availability
                      </label>
                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setCtrlExamEnabled(true)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            ctrlExamEnabled
                              ? 'bg-white text-emerald-800 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          Exam Open
                        </button>
                        <button
                          type="button"
                          onClick={() => setCtrlExamEnabled(false)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            !ctrlExamEnabled
                              ? 'bg-white text-amber-800 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Paused / Locked
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Colleague Retake Policy
                      </label>
                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setCtrlAllowRetakes(true)}
                          className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            ctrlAllowRetakes
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Allow Retakes
                        </button>
                        <button
                          type="button"
                          onClick={() => setCtrlAllowRetakes(false)}
                          className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            !ctrlAllowRetakes
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Single Attempt Only
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Passing Threshold (%)
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={ctrlPassingPct}
                        onChange={(e) => setCtrlPassingPct(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Time Limit (Minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={ctrlDurationMin}
                        onChange={(e) => setCtrlDurationMin(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg tabular-nums"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={busyAction}
                        className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                      >
                        {busyAction ? 'Saving...' : 'Save Exam Controls'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Question Bank List + Inline Editor */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">
                      Certification Exam Question Bank ({questions.length})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Author, edit, or reorder Multiple-Choice (MCQ) and Written Clinical Text
                      questions.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className={`py-3.5 flex flex-wrap items-start justify-between gap-4 text-sm ${
                          editingQuestionId === q.id ? 'bg-teal-50/40 px-3 rounded-lg' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">
                            Q{String(idx + 1).padStart(2, '0')}. {q.prompt}
                          </p>
                          <p className="text-xs font-mono text-slate-500 mt-1 tabular-nums">
                            {q.questionType === 'mcq'
                              ? `MCQ (${q.options.length} choices · Answer: Option ${String.fromCharCode(
                                  65 + Math.max(0, q.correctOptionIndex)
                                )})`
                              : `WRITTEN TEXT (${q.rubricKeywords.length} rubric keywords)`}{' '}
                            · {q.points} pts
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0 || busyAction}
                            onClick={async () => {
                              await swapExamQuestionOrder(
                                selectedProduct.id,
                                questions[idx],
                                questions[idx - 1],
                                idx,
                                idx - 1
                              );
                              await reloadSubcollections(selectedProduct);
                            }}
                            aria-label="Move question up"
                            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx >= questions.length - 1 || busyAction}
                            onClick={async () => {
                              await swapExamQuestionOrder(
                                selectedProduct.id,
                                questions[idx],
                                questions[idx + 1],
                                idx,
                                idx + 1
                              );
                              await reloadSubcollections(selectedProduct);
                            }}
                            aria-label="Move question down"
                            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => loadQuestionIntoEditor(q)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await removeExamQuestion(selectedProduct, q.id, questions.length);
                              if (editingQuestionId === q.id) resetQuestionForm();
                              await reloadSubcollections(selectedProduct);
                              onNotify('Removed exam question.');
                            }}
                            aria-label="Remove exam question"
                            className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {questions.length === 0 && (
                      <p className="py-5 text-xs text-slate-500">
                        No exam questions configured yet. Use the question builder below.
                      </p>
                    )}
                  </div>

                  {/* Create / Edit Exam Question Form */}
                  <form onSubmit={(e) => void handleSaveQuestion(e)} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-semibold text-slate-900">
                        {editingQuestionId ? 'Edit Exam Question' : 'Add New Exam Question'}
                      </h5>
                      {editingQuestionId && (
                        <button
                          type="button"
                          onClick={resetQuestionForm}
                          className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-slate-600 mb-1">
                          Assessment Format
                        </label>
                        <select
                          value={questionType}
                          onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="mcq">Multiple-Choice Question (Auto-Graded)</option>
                          <option value="text">
                            Written Clinical Scenario (Rubric + Admin Review)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Points *</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={qPoints}
                          onChange={(e) => setQPoints(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Question Prompt *</label>
                      <textarea
                        required
                        minLength={8}
                        maxLength={600}
                        rows={2}
                        value={qPrompt}
                        onChange={(e) => setQPrompt(e.target.value)}
                        placeholder="Enter the clinical question or physician detailing scenario..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    {questionType === 'mcq' ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-600">
                            Answer Options (select radio button next to the correct answer)
                          </label>
                          {qOptions.length < 6 && (
                            <button
                              type="button"
                              onClick={() => setQOptions((prev) => [...prev, ''])}
                              className="text-xs font-medium text-teal-700 hover:underline cursor-pointer"
                            >
                              + Add Option
                            </button>
                          )}
                        </div>
                        {qOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctOptionRadio"
                              checked={qCorrectIdx === idx}
                              onChange={() => setQCorrectIdx(idx)}
                              className="accent-teal-700 cursor-pointer"
                            />
                            <span className="text-xs font-mono text-slate-500 w-5">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            <input
                              required={idx < 2}
                              maxLength={240}
                              value={opt}
                              onChange={(e) => {
                                const copy = [...qOptions];
                                copy[idx] = e.target.value;
                                setQOptions(copy);
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                            />
                            {qOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = qOptions.filter((_, i) => i !== idx);
                                  setQOptions(next);
                                  if (qCorrectIdx >= next.length) setQCorrectIdx(0);
                                }}
                                aria-label="Remove option"
                                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Expected Clinical Rubric Keywords (comma-separated)
                        </label>
                        <input
                          value={qKeywordsRaw}
                          onChange={(e) => setQKeywordsRaw(e.target.value)}
                          placeholder="e.g. cilnidipine, n-type, edema, sympathetic"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Reference Model Answer / Clinical Explanation *
                      </label>
                      <textarea
                        required
                        minLength={2}
                        maxLength={1000}
                        rows={2}
                        value={qModelAnswer}
                        onChange={(e) => setQModelAnswer(e.target.value)}
                        placeholder="Displayed to colleagues on their post-exam clinical breakdown..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busyAction}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer"
                    >
                      {editingQuestionId ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Save Question Updates
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Question to Exam
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COLLEAGUE SUBMISSIONS, GRADING & ATTEMPT RESET */}
      {studioTab === 'grading' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  ['all', 'All Submissions'],
                  ['pending_review', 'Pending Written Review'],
                  ['finalized', 'Finalized'],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSubmissionStatusFilter(val)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    submissionStatusFilter === val
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <select
              value={submissionProductFilter}
              onChange={(e) => setSubmissionProductFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Product Modules</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brandName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
              <div className="px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Colleague Attempts ({filteredSubmissions.length})
                </h2>
              </div>
              {filteredSubmissions.length === 0 ? (
                <div className="p-6 text-xs text-slate-500">
                  No exam submissions match the current filter.
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const selected = activeSubmission?.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setActiveSubmissionId(sub.id)}
                      className={`w-full p-4 text-left transition-colors cursor-pointer ${
                        selected ? 'bg-teal-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">{sub.userName}</span>
                        <span className="text-xs font-mono font-semibold text-teal-700 tabular-nums">
                          {sub.percentage}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{sub.productName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {sub.userEmployeeId ? `${sub.userEmployeeId} · ` : ''}
                        {[sub.userTerritory, sub.userArea, sub.userRegion]
                          .filter(Boolean)
                          .join(' · ')}{' '}
                        ·{' '}
                        {sub.gradingStatus === 'pending_review' ? (
                          <span className="text-amber-700 font-medium">▲ Needs Review</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">✓ Finalized</span>
                        )}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            <div className="lg:col-span-8">
              {activeSubmission ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {activeSubmission.userName} · {activeSubmission.productName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeSubmission.userEmployeeId ? (
                          <>
                            <span className="font-mono font-medium text-slate-700">
                              ID: {activeSubmission.userEmployeeId}
                            </span>{' '}
                            ·{' '}
                          </>
                        ) : null}
                        {activeSubmission.userDesignation} ·{' '}
                        {[
                          activeSubmission.userTerritory,
                          activeSubmission.userArea,
                          activeSubmission.userRegion,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {privateContactByUid[activeSubmission.userId] ? (
                        <p className="text-xs font-mono text-teal-800 mt-1">
                          Mobile: {privateContactByUid[activeSubmission.userId]?.mobileNo || 'N/A'}{' '}
                          · {privateContactByUid[activeSubmission.userId]?.email}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleLoadPrivateContact(activeSubmission.userId)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline mt-1 cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          {loadingContactUid === activeSubmission.userId
                            ? 'Loading contact...'
                            : 'Show Mobile No & Email'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-semibold text-slate-900 tabular-nums">
                        {activeSubmission.awardedScore} / {activeSubmission.maxScore} pts (
                        {activeSubmission.percentage}%)
                      </span>

                      {confirmResetSubId === activeSubmission.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={busyAction}
                            onClick={async () => {
                              setBusyAction(true);
                              try {
                                await resetColleagueSubmissionAttempt(activeSubmission);
                                setConfirmResetSubId(null);
                                onNotify(
                                  `Reset exam attempt for ${activeSubmission.userName}.`
                                );
                              } finally {
                                setBusyAction(false);
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 rounded cursor-pointer"
                          >
                            Confirm Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmResetSubId(null)}
                            className="px-2 py-1 text-xs text-slate-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmResetSubId(activeSubmission.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset Attempt
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                    {activeSubmission.responses.map((resp, idx) => (
                      <div key={resp.questionId} className="p-4 space-y-2">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-xs font-mono text-slate-500 tabular-nums">
                            Q{String(idx + 1).padStart(2, '0')} ·{' '}
                            {resp.questionType === 'mcq' ? 'Auto-Graded MCQ' : 'Written Scenario'}
                          </span>
                          {resp.questionType === 'text' ? (
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-slate-600">Awarded Points:</label>
                              <input
                                type="number"
                                min={0}
                                max={resp.maxPoints}
                                value={adjustedScores[resp.questionId] ?? resp.awardedPoints}
                                onChange={(e) =>
                                  setAdjustedScores((prev) => ({
                                    ...prev,
                                    [resp.questionId]: Number(e.target.value),
                                  }))
                                }
                                className="w-16 px-2 py-1 text-xs font-mono border border-slate-300 rounded text-right tabular-nums"
                              />
                              <span className="text-xs font-mono text-slate-500 tabular-nums">
                                / {resp.maxPoints}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-mono font-semibold text-slate-800 tabular-nums">
                              {resp.awardedPoints} / {resp.maxPoints} pts
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-slate-900">{resp.questionPrompt}</p>
                        {resp.questionType === 'text' && (
                          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 leading-relaxed">
                            {resp.textAnswer || 'No written text submitted.'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Admin / Regional Manager Coaching Feedback
                    </label>
                    <textarea
                      rows={3}
                      maxLength={800}
                      value={managerFeedback}
                      onChange={(e) => setManagerFeedback(e.target.value)}
                      placeholder="Provide clinical coaching feedback visible on the colleague's transcript..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={busyAction}
                      onClick={async () => {
                        const prod = products.find((p) => p.id === activeSubmission.productId);
                        setBusyAction(true);
                        try {
                          await finalizeSubmissionReview({
                            submission: activeSubmission,
                            passingPercentage: prod?.passingPercentage ?? 75,
                            adjustedPointsByQuestionId: adjustedScores,
                            managerFeedback,
                          });
                          onNotify(
                            `Finalized ${activeSubmission.userName}'s score and synced leaderboard.`
                          );
                        } finally {
                          setBusyAction(false);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {busyAction ? 'Updating...' : 'Finalize Grade & Sync Leaderboard'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
                  Select a colleague submission on the left to grade written scenarios, leave
                  feedback, or reset an attempt.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN ROLES & COLLEAGUES */}
      {studioTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Registered Colleagues with 1-Click Role Toggle */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">
                Colleague Directory &amp; Admin Privileges ({colleagueProfiles.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {colleagueProfiles.map((col) => {
                const isGrantedAdmin = adminUidSet.has(col.uid);
                const isSelf = col.uid === currentUserUid;
                return (
                  <div
                    key={col.uid}
                    className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {col.displayName}{' '}
                        {isSelf && <span className="text-xs font-normal text-teal-700">(You)</span>}
                        {col.isRegistrationComplete ? (
                          <span className="text-xs font-normal text-emerald-700 ml-2">
                            ✓ Exam Eligible
                          </span>
                        ) : (
                          <span className="text-xs font-normal text-amber-700 ml-2">
                            ▲ Profile Incomplete
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {col.employeeId ? (
                          <>
                            <span className="font-mono font-medium text-slate-700">
                              ID: {col.employeeId}
                            </span>{' '}
                            ·{' '}
                          </>
                        ) : null}
                        {col.designation} ·{' '}
                        {[col.territory, col.area, col.region].filter(Boolean).join(' · ')}
                      </p>
                      {privateContactByUid[col.uid] ? (
                        <p className="text-xs font-mono text-teal-800 mt-0.5">
                          Mobile: {privateContactByUid[col.uid]?.mobileNo || 'Not provided'} ·{' '}
                          {privateContactByUid[col.uid]?.email}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleLoadPrivateContact(col.uid)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:underline mt-0.5 cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          {loadingContactUid === col.uid ? 'Loading...' : 'View Mobile No'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isGrantedAdmin ? (
                        <button
                          type="button"
                          disabled={busyAction}
                          onClick={async () => {
                            setBusyAction(true);
                            try {
                              await revokeColleagueAdminAccess(col.uid);
                              onNotify(`Revoked Admin privileges for ${col.displayName}.`);
                            } finally {
                              setBusyAction(false);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          Revoke Admin
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyAction}
                          onClick={async () => {
                            setBusyAction(true);
                            try {
                              await grantColleagueAdminAccess(currentUserUid, col.uid, col.region);
                              onNotify(`Granted Admin Panel access to ${col.displayName}.`);
                            } finally {
                              setBusyAction(false);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 cursor-pointer"
                        >
                          Make Admin
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {colleagueProfiles.length === 0 && (
                <p className="p-6 text-xs text-slate-500">No colleagues registered yet.</p>
              )}
            </div>
          </div>

          {/* Active Administrators & Manual UID Grant */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Active Administrators</h3>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{BOOTSTRAPPED_ADMIN_EMAIL}</p>
                    <p className="text-slate-500">Primary Regional Manager Admin</p>
                  </div>
                  <span className="text-emerald-700 font-medium">✓ Permanent</span>
                </div>
                {adminRecords.map((adm) => (
                  <div key={adm.uid} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono font-medium text-slate-900 truncate">{adm.uid}</p>
                      <p className="text-slate-500">Region: {adm.region}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await revokeColleagueAdminAccess(adm.uid);
                        onNotify('Removed co-admin record.');
                      }}
                      className="text-red-700 hover:underline shrink-0 cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!coManagerUid.trim()) return;
                setBusyAction(true);
                try {
                  await grantColleagueAdminAccess(currentUserUid, coManagerUid, coManagerRegion);
                  setCoManagerUid('');
                  onNotify('Authorized new Administrator UID.');
                } finally {
                  setBusyAction(false);
                }
              }}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <h3 className="text-sm font-semibold text-slate-900">Authorize Admin by UID</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paste a colleague&apos;s Account UID (available in their Profile dialog) to grant
                full Admin Panel control over teaching materials and exams.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Colleague Account UID *
                </label>
                <input
                  required
                  value={coManagerUid}
                  onChange={(e) => setCoManagerUid(e.target.value)}
                  placeholder="Paste Firebase UID..."
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assigned Sales Region
                </label>
                <select
                  value={coManagerRegion}
                  onChange={(e) => setCoManagerRegion(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {NOVATEK_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={busyAction}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer"
              >
                Grant Admin Control
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
