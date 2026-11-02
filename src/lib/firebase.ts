import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const BOOTSTRAPPED_ADMIN_EMAIL = 'skmasum98@gmail.com';
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;
export const FIREBASE_AUTH_SETTINGS_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

export interface ParsedAuthError {
  code: string;
  message: string;
  unauthorizedDomain?: string;
}

export function parseFirebaseAuthError(error: unknown): ParsedAuthError {
  const rawCode =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';
  const rawMessage = error instanceof Error ? error.message : String(error ?? '');
  const hostname =
    typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : 'novateklearn.netlify.app';

  if (
    rawCode === 'auth/unauthorized-domain' ||
    rawMessage.includes('auth/unauthorized-domain')
  ) {
    return {
      code: 'auth/unauthorized-domain',
      unauthorizedDomain: hostname,
      message: `This deployment domain (${hostname}) is not yet authorized in Firebase Authentication for project "${FIREBASE_PROJECT_ID}".`,
    };
  }

  if (
    rawCode === 'auth/popup-blocked' ||
    rawMessage.includes('auth/popup-blocked')
  ) {
    return {
      code: 'auth/popup-blocked',
      message:
        'Your browser blocked the Google Sign-In popup window. Please allow popups for this site in your browser address bar and try again.',
    };
  }

  if (
    rawCode === 'auth/popup-closed-by-user' ||
    rawCode === 'auth/cancelled-popup-request' ||
    rawMessage.includes('auth/popup-closed-by-user') ||
    rawMessage.includes('auth/cancelled-popup-request')
  ) {
    return {
      code: rawCode || 'auth/popup-closed-by-user',
      message:
        'The Google Sign-In window was closed before completing authentication. Click Sign In to try again.',
    };
  }

  if (
    rawCode === 'auth/network-request-failed' ||
    rawMessage.includes('auth/network-request-failed')
  ) {
    return {
      code: 'auth/network-request-failed',
      message:
        'Network connection failed while contacting Google Sign-In. Please check your internet connection and try again.',
    };
  }

  return {
    code: rawCode || 'auth/unknown',
    message: rawMessage || 'Google Sign-In could not be completed. Please try again.',
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();
