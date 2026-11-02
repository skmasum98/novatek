import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Trophy,
  XCircle,
} from 'lucide-react';
import { BLUEPRINT_LIMITS } from '../lib/validation';
import type {
  ExamQuestion,
  ExamSubmission,
  ProductModule,
  PublicProfile,
} from '../types/models';

interface ExamWorkspaceProps {
  product: ProductModule;
  questions: ExamQuestion[];
  userProfile: PublicProfile;
  onCancelExam: () => void;
  onExitToCatalog?: () => void;
  onSubmitExam: (params: {
    mcqSelections: Record<string, number>;
    textResponses: Record<string, string>;
    durationSeconds: number;
  }) => Promise<ExamSubmission>;
  onOpenLeaderboard: (productId: string) => void;
}

const DIAL_RADIUS = 19;
const DIAL_CIRCUMFERENCE = 2 * Math.PI * DIAL_RADIUS;

function formatClock(totalSeconds: number, forceHours = false): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  if (forceHours || hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
      seconds
    ).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatSpokenDuration(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  if (minutes > 0 && seconds > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and ${seconds} ${
      seconds === 1 ? 'second' : 'seconds'
    }`;
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
}

export const ExamWorkspace: React.FC<ExamWorkspaceProps> = ({
  product,
  questions,
  userProfile,
  onCancelExam,
  onExitToCatalog,
  onSubmitExam,
  onOpenLeaderboard,
}) => {
  // Strictly follow the product's configured examDurationMinutes setting
  const configuredDurationMinutes = useMemo(() => {
    const raw = Number(product.examDurationMinutes);
    return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 15;
  }, [product.examDurationMinutes]);

  const totalAllowedSeconds = configuredDurationMinutes * 60;
  const showHoursFormat = totalAllowedSeconds >= 3600;
  const totalExamMarks = useMemo(
    () => questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    [questions]
  );

  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalAllowedSeconds);
  const [mcqSelections, setMcqSelections] = useState<Record<string, number>>({});
  const [textResponses, setTextResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSubmission, setCompletedSubmission] = useState<ExamSubmission | null>(null);
  const [timedOutAutoSubmitted, setTimedOutAutoSubmitted] = useState(false);
  const [validationNotice, setValidationNotice] = useState<string | null>(null);

  const startTimestampRef = useRef<number>(Date.now());
  const autoSubmittedRef = useRef<boolean>(false);

  // Reset exam session timer cleanly if switching product modules
  useEffect(() => {
    startTimestampRef.current = Date.now();
    autoSubmittedRef.current = false;
    setTimedOutAutoSubmitted(false);
    setCompletedSubmission(null);
    setValidationNotice(null);
    setMcqSelections({});
    setTextResponses({});
    setRemainingSeconds(totalAllowedSeconds);
  }, [product.id]);

  // Keep remainingSeconds synchronized if product.examDurationMinutes updates
  useEffect(() => {
    if (completedSubmission) return;
    const elapsedMs = Math.max(0, Date.now() - startTimestampRef.current);
    const nextRemaining = Math.max(0, Math.ceil((totalAllowedSeconds * 1000 - elapsedMs) / 1000));
    setRemainingSeconds(nextRemaining);
  }, [totalAllowedSeconds, completedSubmission]);

  const performSubmit = async (allowIncomplete: boolean) => {
    if (isSubmitting || completedSubmission) return;

    if (!allowIncomplete) {
      const unansweredIdx = questions.findIndex((q) => {
        if (q.questionType === 'mcq') {
          return typeof mcqSelections[q.id] !== 'number';
        }
        return (textResponses[q.id] || '').trim().length < 12;
      });
      if (unansweredIdx !== -1) {
        const unanswered = questions[unansweredIdx];
        const qNum = String(unansweredIdx + 1).padStart(2, '0');
        setValidationNotice(
          unanswered.questionType === 'mcq'
            ? `Question ${qNum} is unanswered — please select an answer for every multiple-choice question before submitting.`
            : `Question ${qNum} requires a complete written answer (at least 12 characters) before submitting.`
        );
        document
          .getElementById(`exam-q-${unanswered.id}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    setValidationNotice(null);
    setIsSubmitting(true);
    try {
      const rawElapsedSec = Math.max(
        1,
        Math.round((Date.now() - startTimestampRef.current) / 1000)
      );
      const cappedElapsedSec = Math.min(totalAllowedSeconds, rawElapsedSec);
      const result = await onSubmitExam({
        mcqSelections,
        textResponses,
        durationSeconds: cappedElapsedSec,
      });
      setCompletedSubmission(result);
    } catch (err) {
      let friendlyMsg =
        'Could not save your exam submission right now. Your answers are preserved—please click Submit Certification Exam again.';
      if (err instanceof Error && err.message) {
        try {
          const parsed = JSON.parse(err.message) as { error?: string };
          if (parsed && typeof parsed.error === 'string') {
            friendlyMsg =
              'Could not verify exam submission permissions with the server. Please verify your Colleague Info in the top-right menu, then click Submit Certification Exam again — all your answers remain saved on screen.';
          } else {
            friendlyMsg = err.message;
          }
        } catch {
          friendlyMsg = err.message;
        }
      }
      setValidationNotice(friendlyMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keep a stable ref to performSubmit so typing in textareas never resets the countdown interval
  const latestPerformSubmitRef = useRef(performSubmit);
  latestPerformSubmitRef.current = performSubmit;

  // Drift-free wall-clock countdown synchronized against startTimestampRef & product duration
  useEffect(() => {
    if (completedSubmission) return;

    const syncCountdown = () => {
      const elapsedMs = Math.max(0, Date.now() - startTimestampRef.current);
      const leftMs = totalAllowedSeconds * 1000 - elapsedMs;
      const nextSec = Math.max(0, Math.ceil(leftMs / 1000));

      setRemainingSeconds((prev) => (prev === nextSec ? prev : nextSec));

      if (nextSec <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        setTimedOutAutoSubmitted(true);
        void latestPerformSubmitRef.current(true);
      }
    };

    syncCountdown();
    const intervalId = window.setInterval(syncCountdown, 250);
    document.addEventListener('visibilitychange', syncCountdown);
    window.addEventListener('focus', syncCountdown);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', syncCountdown);
      window.removeEventListener('focus', syncCountdown);
    };
  }, [product.id, totalAllowedSeconds, Boolean(completedSubmission)]);

  const answeredCount = questions.filter((q) =>
    q.questionType === 'mcq'
      ? typeof mcqSelections[q.id] === 'number'
      : (textResponses[q.id] || '').trim().length >= 12
  ).length;

  const remainingRatio =
    totalAllowedSeconds > 0
      ? Math.max(0, Math.min(1, remainingSeconds / totalAllowedSeconds))
      : 0;
  const dialDashOffset = DIAL_CIRCUMFERENCE * (1 - remainingRatio);
  const progressBarUnits = Math.max(0, Math.min(1000, Math.round(remainingRatio * 1000)));

  // Dual-coded semantic urgency tiers (icon + explicit label + color; never color alone)
  const warningThresholdSeconds = Math.min(
    300,
    Math.max(90, Math.floor(totalAllowedSeconds * 0.25))
  );
  const urgencyState: 'nominal' | 'warning' | 'critical' =
    remainingSeconds <= 60
      ? 'critical'
      : remainingSeconds <= warningThresholdSeconds
      ? 'warning'
      : 'nominal';

  const milestoneAnnouncement = useMemo(() => {
    if (remainingSeconds === totalAllowedSeconds) {
      return `Certification exam started. ${configuredDurationMinutes} minutes allotted.`;
    }
    if (remainingSeconds === 300 && totalAllowedSeconds > 300) {
      return '5 minutes remaining in certification exam.';
    }
    if (remainingSeconds === 120 && totalAllowedSeconds > 120) {
      return '2 minutes remaining in certification exam.';
    }
    if (remainingSeconds === 60) {
      return 'Final minute remaining. Exam will auto-submit at zero.';
    }
    if (remainingSeconds === 30) {
      return '30 seconds remaining in certification exam.';
    }
    if (remainingSeconds === 0) {
      return 'Exam time limit reached. Submitting recorded answers.';
    }
    return '';
  }, [remainingSeconds, totalAllowedSeconds, configuredDurationMinutes]);

  // Post-Exam Results & Clinical Breakdown Screen
  if (completedSubmission) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {timedOutAutoSubmitted && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 flex items-start gap-3 text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Time limit reached ({configuredDurationMinutes} min allotted) — your recorded
              responses were automatically submitted for grading when the countdown reached 00:00.
            </span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <p className="text-xs text-slate-500 mb-1">
                {product.brandName} · Certification Assessment Result
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {completedSubmission.passed
                  ? 'Certification Threshold Achieved'
                  : 'Additional Study Recommended'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-2">
                <span>{userProfile.displayName}</span>
                {userProfile.employeeId && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">ID: {userProfile.employeeId}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>
                  {[userProfile.territory, userProfile.area, userProfile.region]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {completedSubmission.gradingStatus === 'pending_review'
                    ? '▲ Provisional Score (Written Response Queued for Manager Sign-Off)'
                    : '✓ Finalized Score'}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-3xl md:text-4xl font-mono font-bold text-slate-900 tabular-nums">
                {completedSubmission.percentage}%
              </div>
              <p className="text-xs font-mono text-slate-500 tabular-nums mt-1">
                {completedSubmission.awardedScore} / {completedSubmission.maxScore} pts ·{' '}
                {formatClock(completedSubmission.durationSeconds, showHoursFormat)} /{' '}
                {formatClock(totalAllowedSeconds, showHoursFormat)} used
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              {completedSubmission.passed ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <Award className="w-4 h-4" />
                  Passed (Required: {product.passingPercentage}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-semibold text-red-700">
                  <XCircle className="w-4 h-4" />
                  Below Passing Threshold ({product.passingPercentage}% required)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {onExitToCatalog && (
                <button
                  type="button"
                  onClick={onExitToCatalog}
                  className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  All Products
                </button>
              )}
              <button
                type="button"
                onClick={onCancelExam}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Open Study Material
              </button>
              <button
                type="button"
                onClick={() => onOpenLeaderboard(product.id)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trophy className="w-4 h-4" />
                View Colleague Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Question-by-Question Clinical Review */}
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          <div className="px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Clinical Answer Breakdown &amp; Reference Rationale
            </h2>
          </div>

          {questions.map((q, idx) => {
            const resp = completedSubmission.responses.find((r) => r.questionId === q.id);
            const earned = resp?.awardedPoints ?? 0;
            const isFullMarks = earned === q.points;

            return (
              <div key={q.id} className="p-6 space-y-3">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-xs font-mono text-slate-500 tabular-nums">
                    Question {String(idx + 1).padStart(2, '0')} ·{' '}
                    {q.questionType === 'mcq' ? 'Multiple Choice' : 'Written Clinical Scenario'}
                  </p>
                  <span
                    className={`text-xs font-mono font-semibold tabular-nums ${
                      isFullMarks
                        ? 'text-emerald-700'
                        : earned > 0
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {isFullMarks ? '✓' : earned > 0 ? '▲' : '✕'} {earned} / {q.points} pts
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-relaxed">{q.prompt}</p>

                {q.questionType === 'mcq' ? (
                  <div className="text-xs space-y-1 text-slate-600">
                    <p>
                      <span className="font-medium text-slate-800">Your Selection:</span>{' '}
                      {resp && resp.selectedOptionIndex >= 0
                        ? q.options[resp.selectedOptionIndex]
                        : 'No option selected'}
                    </p>
                    {!isFullMarks && q.correctOptionIndex >= 0 && (
                      <p className="text-emerald-800">
                        <span className="font-medium">Correct Answer:</span>{' '}
                        {q.options[q.correctOptionIndex]}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <p className="font-medium text-slate-800">Your Written Clinical Response:</p>
                    <p className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 leading-relaxed">
                      {resp?.textAnswer || 'No response submitted.'}
                    </p>
                  </div>
                )}

                <div className="pt-2 text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-teal-800">Reference Rationale: </span>
                  {q.modelAnswer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const dialStrokeClass =
    urgencyState === 'critical'
      ? 'stroke-red-600'
      : urgencyState === 'warning'
      ? 'stroke-amber-600'
      : 'stroke-teal-700';

  const barFillClass =
    urgencyState === 'critical'
      ? 'fill-red-600'
      : urgencyState === 'warning'
      ? 'fill-amber-600'
      : 'fill-teal-700';

  const clockTextClass =
    urgencyState === 'critical'
      ? 'text-red-700'
      : urgencyState === 'warning'
      ? 'text-amber-800'
      : 'text-slate-900';

  const statusTextClass =
    urgencyState === 'critical'
      ? 'text-red-700'
      : urgencyState === 'warning'
      ? 'text-amber-800'
      : 'text-slate-500';

  const inputsLocked = isSubmitting || remainingSeconds === 0;
  const submitButtonDisabled = isSubmitting;

  // Active Timed Certification Exam
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Screen-reader milestone announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {milestoneAnnouncement}
      </div>

      {/* Sticky Exam Header & Visual Countdown Timer */}
      <div
        className={`sticky top-[61px] z-30 bg-white/95 backdrop-blur border rounded-xl overflow-hidden shadow-xs transition-colors ${
          urgencyState === 'critical'
            ? 'border-red-300'
            : urgencyState === 'warning'
            ? 'border-amber-300'
            : 'border-slate-200'
        }`}
      >
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              {onExitToCatalog && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onExitToCatalog}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All Products
                </button>
              )}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCancelExam}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {!onExitToCatalog && <ArrowLeft className="w-3.5 h-3.5" />}
                Open Study Material
              </button>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">
              {product.brandName} · Certification Exam
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5 tabular-nums">
              <span>
                Answered {answeredCount} of {questions.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>Total: {totalExamMarks} marks</span>
              <span aria-hidden="true">·</span>
              <span>Passing score: {product.passingPercentage}%</span>
              <span aria-hidden="true">·</span>
              <span>
                Allotted: {configuredDurationMinutes}{' '}
                {configuredDurationMinutes === 1 ? 'min' : 'mins'}
              </span>
            </div>
          </div>

          {/* Visual Radial Ring + Tabular Digital Countdown */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 44 44"
                className="absolute inset-0 w-11 h-11 -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx="22"
                  cy="22"
                  r={DIAL_RADIUS}
                  fill="none"
                  strokeWidth="3.5"
                  className="stroke-slate-200"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={DIAL_RADIUS}
                  fill="none"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={DIAL_CIRCUMFERENCE}
                  strokeDashoffset={dialDashOffset}
                  className={`transition-[stroke-dashoffset,stroke] duration-500 ease-linear motion-reduce:transition-none ${dialStrokeClass}`}
                />
              </svg>

              {urgencyState === 'critical' ? (
                <AlertCircle className="w-4 h-4 text-red-600 relative z-10" aria-hidden="true" />
              ) : urgencyState === 'warning' ? (
                <AlertTriangle
                  className="w-4 h-4 text-amber-600 relative z-10"
                  aria-hidden="true"
                />
              ) : (
                <Clock className="w-4 h-4 text-teal-700 relative z-10" aria-hidden="true" />
              )}
            </div>

            <div className="text-left sm:text-right">
              <div
                className={`text-xl md:text-2xl font-mono font-bold tracking-tight tabular-nums leading-none ${clockTextClass}`}
              >
                {formatClock(remainingSeconds, showHoursFormat)}
              </div>
              <p className={`text-[11px] font-medium mt-1 tabular-nums ${statusTextClass}`}>
                {remainingSeconds === 0
                  ? '✕ Time expired · Submitting exam'
                  : urgencyState === 'critical'
                  ? '✕ Final minute · Auto-submits at 00:00'
                  : urgencyState === 'warning'
                  ? `▲ Low time · ${Math.ceil(remainingSeconds / 60)} min left of ${configuredDurationMinutes}m`
                  : `Time remaining · ${formatClock(totalAllowedSeconds, showHoursFormat)} limit`}
              </p>
            </div>
          </div>
        </div>

        {/* Depleting Linear Countdown Bar */}
        <svg
          viewBox="0 0 1000 6"
          preserveAspectRatio="none"
          className="w-full h-1.5 block bg-slate-100"
          role="progressbar"
          aria-label="Remaining exam time"
          aria-valuemin={0}
          aria-valuemax={totalAllowedSeconds}
          aria-valuenow={remainingSeconds}
          aria-valuetext={`${formatSpokenDuration(
            remainingSeconds
          )} remaining out of ${configuredDurationMinutes} ${
            configuredDurationMinutes === 1 ? 'minute' : 'minutes'
          }`}
        >
          <rect
            x="0"
            y="0"
            width={progressBarUnits}
            height="6"
            className={`transition-[width,fill] duration-500 ease-linear motion-reduce:transition-none ${barFillClass}`}
          />
        </svg>
      </div>

      {remainingSeconds === 0 && isSubmitting && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2.5 text-xs text-amber-900">
          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Exam time limit ({configuredDurationMinutes} min) reached — submitting your recorded
            answers...
          </span>
        </div>
      )}

      {validationNotice && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>{validationNotice}</span>
        </div>
      )}

      {/* Exam Questions List */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
        {questions.map((q, idx) => (
          <div key={q.id} id={`exam-q-${q.id}`} className="p-6 md:p-8 space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs font-mono text-teal-700 font-medium tabular-nums">
                Question {String(idx + 1).padStart(2, '0')} ·{' '}
                {q.questionType === 'mcq' ? 'Multiple Choice' : 'Written Clinical Scenario'}
              </span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {q.points} points
              </span>
            </div>

            <p className="text-base font-semibold text-slate-900 leading-relaxed">{q.prompt}</p>

            {q.questionType === 'mcq' ? (
              <div className="space-y-2.5 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isSelected = mcqSelections[q.id] === optIdx;
                  return (
                    <button
                      key={`${q.id}_opt_${optIdx}`}
                      type="button"
                      disabled={inputsLocked}
                      onClick={() => {
                        setValidationNotice(null);
                        setMcqSelections((prev) => ({ ...prev, [q.id]: optIdx }));
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-start gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-medium'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span
                        className={`font-mono text-xs mt-0.5 shrink-0 ${
                          isSelected ? 'text-teal-700 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={4}
                  disabled={inputsLocked}
                  maxLength={BLUEPRINT_LIMITS.TEXT_ANSWER_MAX}
                  value={textResponses[q.id] || ''}
                  onChange={(e) => {
                    setValidationNotice(null);
                    setTextResponses((prev) => ({ ...prev, [q.id]: e.target.value }));
                  }}
                  placeholder="Write your concise clinical explanation using accurate pharmacological mechanisms and patient counseling points..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 disabled:bg-slate-50 disabled:opacity-70"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Evaluated immediately on clinical rubric terms and queued for Regional Manager
                    review.
                  </span>
                  <span className="font-mono tabular-nums">
                    {(textResponses[q.id] || '').length}/{BLUEPRINT_LIMITS.TEXT_ANSWER_MAX}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Footer */}
      <div className="flex items-center justify-between gap-4 pt-2 pb-8">
        <p className="text-xs text-slate-500">
          Your highest official product score automatically updates the Novatek colleague
          leaderboard.
        </p>
        <button
          type="button"
          disabled={submitButtonDisabled}
          onClick={() => void performSubmit(remainingSeconds === 0)}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
          {isSubmitting ? 'Submitting Exam...' : 'Submit Certification Exam'}
        </button>
      </div>
    </div>
  );
};
