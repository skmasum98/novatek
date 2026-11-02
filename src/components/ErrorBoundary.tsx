import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import {
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  type FirestoreErrorInfo,
} from '../lib/firebase';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  rawMessage: string;
  parsedFirestoreError: FirestoreErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    rawMessage: '',
    parsedFirestoreError: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    let parsed: FirestoreErrorInfo | null = null;
    try {
      const candidate = JSON.parse(error.message) as FirestoreErrorInfo;
      if (candidate && typeof candidate.error === 'string' && candidate.operationType) {
        parsed = candidate;
      }
    } catch {
      parsed = null;
    }
    return {
      hasError: true,
      rawMessage: error.message || 'An unexpected error occurred.',
      parsedFirestoreError: parsed,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, rawMessage: '', parsedFirestoreError: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const msg = this.state.parsedFirestoreError?.error || this.state.rawMessage;
    const isQuotaExceeded = msg.includes('Quota exceeded');
    const isFreeDailyReadQuota = msg.includes(
      "Quota exceeded for quota metric 'Free daily read units per project (free tier database)'"
    );

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8">
          <div className="flex items-center gap-3 text-red-700 mb-4">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h1 className="text-lg font-semibold text-slate-900">
              {isQuotaExceeded ? 'Daily Database Quota Reached' : 'Data Synchronization Issue'}
            </h1>
          </div>

          {isQuotaExceeded ? (
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed mb-6">
              <p>
                The Cloud Firestore free-tier daily quota has been reached. Quota limits reset
                automatically the next day.
              </p>
              {isFreeDailyReadQuota && (
                <p>
                  Regional Managers can review or upgrade database capacity in the{' '}
                  <a
                    href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data?openUpgradeDialog=true`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 underline hover:text-teal-800"
                  >
                    Firebase Firestore Console
                  </a>
                  .
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed mb-6">
              <p>{msg}</p>
              {this.state.parsedFirestoreError && (
                <p className="font-mono text-xs text-slate-500">
                  Operation: {this.state.parsedFirestoreError.operationType} · Path:{' '}
                  {this.state.parsedFirestoreError.path || 'unknown'}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Portal
          </button>
        </div>
      </div>
    );
  }
}
