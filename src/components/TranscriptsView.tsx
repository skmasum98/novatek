import React, { useState } from 'react';
import { Award, ChevronDown, ChevronUp, FileCheck2 } from 'lucide-react';
import type { ExamSubmission } from '../types/models';

interface TranscriptsViewProps {
  submissions: ExamSubmission[];
  onGoToProducts: () => void;
}

export const TranscriptsView: React.FC<TranscriptsViewProps> = ({
  submissions,
  onGoToProducts,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    submissions[0]?.id || null
  );

  const formatDate = (sub: ExamSubmission) => {
    if (!sub.createdAt || typeof sub.createdAt.toDate !== 'function') {
      return 'Just now';
    }
    return sub.createdAt.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <p className="text-xs text-slate-500 mb-1">
          Personal Certification Record &amp; Regional Manager Coaching Notes
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          My Exam Transcripts
        </h1>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 px-6 text-center">
          <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-900 mb-1">
            You have not submitted any product certification exams yet.
          </p>
          <p className="text-xs text-slate-500 mb-5">
            Complete the text, video, and visual study units inside any Novatek product module to
            unlock its exam.
          </p>
          <button
            type="button"
            onClick={onGoToProducts}
            className="px-4 py-2 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer"
          >
            Browse Product Modules
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          {submissions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            return (
              <div key={sub.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className="w-full px-6 py-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer text-left"
                >
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{sub.productName}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{formatDate(sub)}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {sub.passed ? (
                          <span className="text-emerald-700 font-medium">✓ Certified</span>
                        ) : (
                          <span className="text-amber-700 font-medium">▲ Below Threshold</span>
                        )}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {sub.gradingStatus === 'finalized'
                          ? 'Finalized by Regional Manager'
                          : 'Provisional (Pending Written Review)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                        {sub.percentage}%
                      </p>
                      <p className="text-xs font-mono text-slate-500 tabular-nums">
                        {sub.awardedScore}/{sub.maxScore} pts
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4">
                    {sub.managerFeedback && (
                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 mb-1">
                          <Award className="w-3.5 h-3.5" />
                          Regional Manager Coaching Feedback
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {sub.managerFeedback}
                        </p>
                      </div>
                    )}

                    <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-lg">
                      {sub.responses.map((resp, idx) => (
                        <div key={resp.questionId} className="p-4 space-y-1.5 text-xs">
                          <div className="flex items-baseline justify-between gap-4">
                            <span className="font-mono text-slate-500 tabular-nums">
                              Q{String(idx + 1).padStart(2, '0')} ·{' '}
                              {resp.questionType === 'mcq' ? 'MCQ' : 'Written'}
                            </span>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              {resp.awardedPoints} / {resp.maxPoints} pts
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{resp.questionPrompt}</p>
                          {resp.questionType === 'text' && (
                            <p className="text-slate-600 pt-1 leading-relaxed">
                              <span className="font-medium text-slate-800">Submitted Text: </span>
                              {resp.textAnswer || '—'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
