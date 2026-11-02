import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Link2,
  Lock,
  Maximize2,
  PlayCircle,
  Settings,
  X,
} from 'lucide-react';
import { buildShareableExamUrl, copyTextToClipboard } from '../lib/examLinks';
import type {
  ExamQuestion,
  LearningProgress,
  LearningResource,
  ProductModule,
} from '../types/models';
import { ClinicalVideoPlayer } from './ClinicalVideoPlayer';
import { GapritoTrainingSheet } from './GapritoTrainingSheet';
import { ResilientImage } from './ResilientImage';

interface StudyWorkspaceProps {
  product: ProductModule;
  resources: LearningResource[];
  questions: ExamQuestion[];
  progress?: LearningProgress;
  hasExistingAttempt: boolean;
  isRegistrationComplete: boolean;
  missingRegistrationFields: string[];
  isAdmin: boolean;
  isLoadingSubcollections: boolean;
  onBack: () => void;
  onMarkResourceCompleted: (resourceId: string) => Promise<void>;
  onStartExam: () => void;
  onOpenRegistrationModal: () => void;
  onOpenAdminForProduct: () => void;
  onNotify?: (msg: string) => void;
}

export const StudyWorkspace: React.FC<StudyWorkspaceProps> = ({
  product,
  resources,
  questions,
  progress,
  hasExistingAttempt,
  isRegistrationComplete,
  missingRegistrationFields,
  isAdmin,
  isLoadingSubcollections,
  onBack,
  onMarkResourceCompleted,
  onStartExam,
  onOpenRegistrationModal,
  onOpenAdminForProduct,
  onNotify,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<'units' | 'sheet'>('units');
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [zoomedImageOpen, setZoomedImageOpen] = useState(false);
  const [copiedExamLink, setCopiedExamLink] = useState(false);

  const isGapritoModule =
    product.id === 'prod_gaprito_50' || product.brandName.toLowerCase().includes('gaprito');

  useEffect(() => {
    setActiveIndex(0);
    setStudyMode('units');
    setCopiedExamLink(false);
  }, [product.id]);

  const totalExamMarks = useMemo(
    () => questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    [questions]
  );

  const completedIds = progress?.completedResourceIds || [];
  const isExamEnabled = product.examEnabled !== false;
  const isRetakeBlocked = product.allowRetakes === false && hasExistingAttempt;
  const canStartExam =
    isExamEnabled && !isRetakeBlocked && isRegistrationComplete && questions.length > 0;
  const needsRegistrationForExam = isExamEnabled && !isRetakeBlocked && !isRegistrationComplete;

  const completedCount = resources.filter((r) => completedIds.includes(r.id)).length;
  const completionPct =
    resources.length > 0 ? Math.round((completedCount / resources.length) * 100) : 0;

  const activeResource = resources[activeIndex] || null;
  const isCurrentCompleted = activeResource ? completedIds.includes(activeResource.id) : false;

  const handleCompleteUnit = async () => {
    if (!activeResource || markingId) return;
    setMarkingId(activeResource.id);
    try {
      await onMarkResourceCompleted(activeResource.id);
      if (activeIndex < resources.length - 1) {
        setActiveIndex((idx) => idx + 1);
      }
    } finally {
      setMarkingId(null);
    }
  };

  const formatResourceKind = (type: LearningResource['resourceType']) => {
    if (type === 'video') return 'Video Briefing';
    if (type === 'image') return 'Visual Detailing Plate';
    return 'Clinical Monograph';
  };

  const renderResourceIcon = (type: LearningResource['resourceType']) => {
    if (type === 'video') return <PlayCircle className="w-4 h-4 shrink-0" />;
    if (type === 'image') return <ImageIcon className="w-4 h-4 shrink-0" />;
    return <FileText className="w-4 h-4 shrink-0" />;
  };

  const examButtonLabel = !isExamEnabled
    ? 'Exam Paused by Admin'
    : isRetakeBlocked
    ? 'Single-Attempt Exam Completed'
    : needsRegistrationForExam
    ? 'Complete Profile to Take Exam'
    : questions.length > 0
    ? `Take Exam Directly (${questions.length} Qs · ${totalExamMarks} Marks)`
    : 'Loading Exam Questions...';

  const handleCopyShareLink = async () => {
    const url = buildShareableExamUrl(product.id);
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopiedExamLink(true);
      onNotify?.(`Copied direct exam link for ${product.brandName}.`);
      window.setTimeout(() => setCopiedExamLink(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Top Breadcrumb & Back */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 no-print">
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Product Portfolio
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={onOpenAdminForProduct}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Edit in Admin Panel
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopyShareLink()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-teal-700 hover:underline transition-colors cursor-pointer"
                >
                  {copiedExamLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5 text-teal-700" />
                  )}
                  {copiedExamLink ? 'Copied Direct Exam Link' : 'Share Direct Exam Link'}
                </button>
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {product.brandName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span>{product.genericComposition}</span>
            <span aria-hidden="true">·</span>
            <span>{product.therapeuticClass}</span>
            {questions.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {questions.length} Questions ({totalExamMarks} Marks)
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Passing Score: {product.passingPercentage}%</span>
            <span aria-hidden="true">·</span>
            <span>
              {product.allowRetakes === false ? 'Single Attempt Only' : 'Retakes Permitted'}
            </span>
          </div>
        </div>

        {/* Exam Unlock Action */}
        <div className="flex items-center gap-3 shrink-0">
          {needsRegistrationForExam ? (
            <button
              type="button"
              onClick={onOpenRegistrationModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Lock className="w-4 h-4" />
              {examButtonLabel}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canStartExam}
              onClick={onStartExam}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                canStartExam
                  ? 'bg-teal-700 text-white hover:bg-teal-800 cursor-pointer'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {canStartExam ? (
                <ClipboardCheck className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {examButtonLabel}
            </button>
          )}
        </div>
      </div>

      {/* Product Clinical Reference Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-200 text-sm no-print">
        <div>
          <h2 className="text-xs font-semibold text-slate-500 mb-1.5">Approved Indications</h2>
          <p className="text-slate-700 leading-relaxed">{product.indications}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold text-slate-500 mb-1.5">Dosage &amp; Administration</h2>
          <p className="text-slate-700 leading-relaxed">{product.dosageGuidance}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold text-slate-500 mb-1.5">Core Field Differentiation</h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {product.keySellingPoints}
          </p>
        </div>
      </div>

      {/* Interactive Switcher for Gaprito Master Bangla Training Sheet vs Step-by-Step Study Units */}
      {isGapritoModule && (
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setStudyMode('units')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                studyMode === 'units'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-700" />
              ধাপে ধাপে স্টাডি ইউনিট ({completedCount}/{resources.length})
            </button>
            <button
              type="button"
              onClick={() => setStudyMode('sheet')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                studyMode === 'sheet'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
              বাংলা মাস্টার ট্রেনিং শিট ও PDF (প্রিন্টযোগ্য)
            </button>
          </div>

          <p className="text-xs text-slate-500">
            চাইলে এখনই সরাসরি পরীক্ষায় (২৫টি প্রশ্ন · ১০০ নম্বর) অংশ নিতে পারেন, অথবা আগে স্টাডি ইউনিট ও ট্রেনিং শিট পড়ে নিতে পারেন।
          </p>
        </div>
      )}

      {isGapritoModule && studyMode === 'sheet' ? (
        <div className="pt-6">
          <GapritoTrainingSheet />
        </div>
      ) : isLoadingSubcollections ? (
        <div className="py-16 space-y-4">
          <div className="h-6 w-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-72 w-full bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : resources.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-xl mt-8 p-8">
          <p className="text-base font-medium text-slate-900 mb-1">
            No learning resources have been added to {product.brandName} yet.
          </p>
          <p className="text-sm text-slate-500">
            Administrators can add clinical monographs, videos, and visual diagrams in the Admin
            Panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-start">
          {/* Left Zone (Main Multimedia Stage - 8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 md:p-8">
            {activeResource && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-teal-700 tabular-nums">
                      Unit {String(activeIndex + 1).padStart(2, '0')} of{' '}
                      {String(resources.length).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatResourceKind(activeResource.resourceType)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{activeResource.estimatedMinutes} min study</span>
                  </div>
                  {isCurrentCompleted && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">
                  {activeResource.title}
                </h2>

                {activeResource.resourceType === 'video' && (
                  <div className="mb-6">
                    <ClinicalVideoPlayer
                      mediaUrl={activeResource.mediaUrl}
                      title={activeResource.title}
                      caption={activeResource.mediaCaption}
                      fallbackSummary={activeResource.bodyText}
                    />
                  </div>
                )}

                {activeResource.resourceType === 'image' && (
                  <div className="mb-6 space-y-2">
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10]">
                      <ResilientImage
                        srcKeyOrUrl={activeResource.mediaUrl || product.coverImageKey}
                        alt={activeResource.title}
                        className="w-full h-full object-contain bg-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setZoomedImageOpen(true)}
                        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900/85 text-white rounded-md hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Inspect Full Resolution
                      </button>
                    </div>
                    {activeResource.mediaCaption && (
                      <p className="text-xs text-slate-500">{activeResource.mediaCaption}</p>
                    )}
                  </div>
                )}

                <div className="prose prose-slate max-w-none text-slate-700 text-[15px] leading-7 whitespace-pre-line mb-8">
                  {activeResource.bodyText}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-8">
                  <p className="text-xs font-semibold text-teal-800 mb-1">
                    Physician Detailing Key Message
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {activeResource.clinicalTakeaway}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeIndex === 0}
                      onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                      className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                    >
                      Previous Unit
                    </button>
                    <button
                      type="button"
                      disabled={activeIndex >= resources.length - 1}
                      onClick={() => setActiveIndex((i) => Math.min(resources.length - 1, i + 1))}
                      className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                    >
                      Next Unit
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={markingId === activeResource.id}
                    onClick={() => void handleCompleteUnit()}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isCurrentCompleted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-teal-700 text-white hover:bg-teal-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {markingId === activeResource.id
                      ? 'Saving Progress...'
                      : isCurrentCompleted
                      ? activeIndex < resources.length - 1
                        ? 'Completed · Continue Next'
                        : 'Unit Completed'
                      : 'Mark Unit Complete'}
                    {!isCurrentCompleted && activeIndex < resources.length - 1 && (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Zone (Curriculum Checklist & Exam Gate - 4 cols) */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900">Study Completion</h3>
                <span className="text-xs font-mono font-semibold text-teal-700 tabular-nums">
                  {completedCount}/{resources.length} Units ({completionPct}%)
                </span>
              </div>
              <svg
                viewBox="0 0 1000 8"
                preserveAspectRatio="none"
                className="w-full h-2 rounded-full overflow-hidden bg-slate-100 block"
                role="progressbar"
                aria-label="Study module completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completionPct}
              >
                <rect
                  x="0"
                  y="0"
                  width={Math.max(0, Math.min(1000, completionPct * 10))}
                  height="8"
                  className="fill-teal-700 transition-[width] duration-200"
                />
              </svg>
            </div>

            <div className="divide-y divide-slate-100 border-t border-b border-slate-200">
              {resources.map((res, idx) => {
                const done = completedIds.includes(res.id);
                const selected = idx === activeIndex;
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`w-full py-3.5 px-3 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      selected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <span
                      className={`mt-0.5 ${
                        done
                          ? 'text-emerald-600'
                          : selected
                          ? 'text-teal-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        renderResourceIcon(res.resourceType)
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm leading-snug ${
                          selected ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}. {res.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {formatResourceKind(res.resourceType)} · {res.estimatedMinutes} min
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-900">
                Certification Exam Status
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contains{' '}
                <span className="font-mono font-medium tabular-nums">{questions.length}</span>{' '}
                questions totaling{' '}
                <span className="font-mono font-medium tabular-nums">{totalExamMarks} marks</span>.
                Time limit:{' '}
                <span className="font-mono font-medium tabular-nums">
                  {product.examDurationMinutes} minutes
                </span>
                .
              </p>

              {!isExamEnabled ? (
                <p className="text-xs text-amber-700">
                  ▲ An Administrator has currently paused this certification exam while colleagues
                  review the teaching materials.
                </p>
              ) : isRetakeBlocked ? (
                <p className="text-xs text-slate-600">
                  ✓ Single-attempt exam completed. Contact an Administrator if an exam reset is
                  needed.
                </p>
              ) : !isRegistrationComplete ? (
                <div className="space-y-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3.5">
                  <p className="text-xs text-amber-900 leading-relaxed">
                    ▲ <strong>Registration Required Before Exam:</strong> Complete{' '}
                    {missingRegistrationFields.join(', ')} to unlock certification exams.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenRegistrationModal}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    Complete Registration Details
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Direct exam access is enabled — you may start the certification exam now or
                    study the remaining units at your own pace.
                  </p>
                  <button
                    type="button"
                    disabled={questions.length === 0}
                    onClick={onStartExam}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Start Exam Now ({totalExamMarks} Marks)
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {zoomedImageOpen && activeResource && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 md:p-10">
          <div className="relative max-w-5xl w-full bg-white rounded-xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {activeResource.title}
              </p>
              <button
                type="button"
                onClick={() => setZoomedImageOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                aria-label="Close full resolution view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 max-h-[78vh] overflow-auto flex items-center justify-center">
              <ResilientImage
                srcKeyOrUrl={activeResource.mediaUrl || product.coverImageKey}
                alt={activeResource.title}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>
            {activeResource.mediaCaption && (
              <div className="px-5 py-3 border-t border-slate-200 text-xs text-slate-600">
                {activeResource.mediaCaption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
