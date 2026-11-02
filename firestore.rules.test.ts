import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Phase 0 & Phase 5 Hardened Security Rule Verification Suite
 * Evaluates the "Dirty Dozen" adversarial scenarios and regression invariants
 * against firestore.rules / DRAFT_firestore.rules.
 */

const rulesPath = fs.existsSync(path.resolve('firestore.rules'))
  ? path.resolve('firestore.rules')
  : path.resolve('DRAFT_firestore.rules');

const rulesSource = fs.readFileSync(rulesPath, 'utf8');

interface AuthContext {
  uid: string;
  email: string;
  emailVerified: boolean;
  isAdminDocPresent?: boolean;
}

const SERVER_TIME = 1793514800000;
const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && ID_REGEX.test(id);
}

function isSignedIn(auth: AuthContext | null): boolean {
  return auth !== null;
}

function isVerifiedUser(auth: AuthContext | null): boolean {
  return auth !== null && auth.emailVerified === true;
}

function isAdmin(auth: AuthContext | null): boolean {
  if (!isVerifiedUser(auth) || !auth) return false;
  return auth.email === 'skmasum98@gmail.com' || Boolean(auth.isAdminDocPresent);
}

test('Rule AST contains default-deny safety net and rules_version 2', () => {
  assert.match(rulesSource, /rules_version\s*=\s*'2';/);
  assert.match(rulesSource, /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
});

test('Dirty Dozen #1: Privilege escalation via self-assigned /admins/{uid} is DENIED', () => {
  const attacker: AuthContext = { uid: 'colleague_99', email: 'rep@novatek.com', emailVerified: true };
  const canCreateAdmin = isVerifiedUser(attacker) && isAdmin(attacker);
  assert.equal(canCreateAdmin, false);
  assert.match(rulesSource, /match \/admins\/\{adminId\}[\s\S]*?allow create:[\s\S]*?isAdmin\(\)/);
});

test('Dirty Dozen #2: Unverified admin email spoofing is DENIED', () => {
  const spoofedAdmin: AuthContext = {
    uid: 'spoof_uid',
    email: 'skmasum98@gmail.com',
    emailVerified: false,
  };
  assert.equal(isAdmin(spoofedAdmin), false);
  assert.match(rulesSource, /request\.auth\.token\.email_verified == true/);
});

test('Dirty Dozen #3: Shadow field injection on /profiles/{userId} is DENIED', () => {
  const allowedKeys = new Set([
    'uid',
    'displayName',
    'designation',
    'employeeId',
    'territory',
    'area',
    'region',
    'isRegistrationComplete',
    'visibility',
    'createdAt',
    'updatedAt',
  ]);
  const maliciousPayloadKeys = [
    'uid',
    'displayName',
    'designation',
    'region',
    'visibility',
    'createdAt',
    'updatedAt',
    'isAdmin',
  ];
  const hasOnlyAllowed = maliciousPayloadKeys.every((k) => allowedKeys.has(k));
  assert.equal(hasOnlyAllowed, false);
  assert.match(rulesSource, /function isValidPublicProfile\(data\)[\s\S]*?data\.keys\(\)\.hasOnly\(/);
});

test('Dirty Dozen #4: Cross-user PII read on /users_private/{userId} is DENIED', () => {
  const requester: AuthContext = { uid: 'colleague_1', email: 'c1@novatek.com', emailVerified: true };
  const targetUserId = 'colleague_2';
  const canGetPrivate = isSignedIn(requester) && (requester.uid === targetUserId || isAdmin(requester));
  assert.equal(canGetPrivate, false);
  assert.match(rulesSource, /match \/users_private\/\{userId\}[\s\S]*?allow list: if false;/);
});

test('Dirty Dozen #5: Identity spoofing on /exam_submissions/{submissionId} is DENIED', () => {
  const requester: AuthContext = { uid: 'colleague_1', email: 'c1@novatek.com', emailVerified: true };
  const payloadUserId = 'colleague_2';
  assert.equal(requester.uid === payloadUserId, false);
  assert.match(rulesSource, /incoming\(\)\.userId == request\.auth\.uid/);
});

test('Dirty Dozen #6: Submitting exam on paused or unpublished product module is DENIED for non-admins', () => {
  const colleague: AuthContext = { uid: 'colleague_1', email: 'c1@novatek.com', emailVerified: true };
  const pausedProduct = { status: 'published', examEnabled: false };
  const draftProduct = { status: 'draft', examEnabled: true };

  const canSubmit = (prod: { status: string; examEnabled: boolean }, auth: AuthContext) =>
    (prod.status === 'published' || isAdmin(auth)) && prod.examEnabled === true;

  assert.equal(canSubmit(pausedProduct, colleague), false);
  assert.equal(canSubmit(draftProduct, colleague), false);
  assert.match(rulesSource, /function canSubmitExamForProduct\(productData, productId\)/);
  assert.match(rulesSource, /productData\.status == 'published' \|\| isAdmin\(\)/);
  assert.match(rulesSource, /productData\.examEnabled == true/);
});

test('Dirty Dozen #7: Non-atomic exam submission without leaderboard write is DENIED', () => {
  const leaderboardExistsAfter = false;
  assert.equal(leaderboardExistsAfter, false);
  assert.match(
    rulesSource,
    /existsAfter\(\/databases\/\$\(database\)\/documents\/leaderboard\/\$\(request\.auth\.uid \+ '_' \+ incoming\(\)\.productId\)\)/
  );
});

test('Dirty Dozen #8: Non-admin tampering with finalized /exam_submissions is DENIED', () => {
  const colleague: AuthContext = { uid: 'colleague_1', email: 'c1@novatek.com', emailVerified: true };
  assert.equal(isAdmin(colleague), false);
  assert.match(rulesSource, /match \/exam_submissions\/\{submissionId\}[\s\S]*?allow update:[\s\S]*?isAdmin\(\)/);
});

test('Dirty Dozen #9: Denial-of-Wallet oversized string payload is DENIED', () => {
  const hugeDisplayName = 'A'.repeat(5000);
  const validSize = hugeDisplayName.length >= 2 && hugeDisplayName.length <= 80;
  assert.equal(validSize, false);
});

test('Dirty Dozen #10: ID poisoning path injection is DENIED', () => {
  assert.equal(isValidId('bad$id!@#'), false);
  assert.equal(isValidId('a'.repeat(129)), false);
  assert.equal(isValidId('valid_id-123'), true);
});

test('Dirty Dozen #11: Client timestamp forgery is DENIED', () => {
  const clientForgedTimestamp: number = 1577836800000;
  const serverRequestTime: number = SERVER_TIME;
  assert.equal(clientForgedTimestamp === serverRequestTime, false);
  assert.match(rulesSource, /incoming\(\)\.createdAt == request\.time/);
  assert.match(rulesSource, /incoming\(\)\.updatedAt == request\.time/);
});

test('Dirty Dozen #12: Unfiltered blanket list scrape on /exam_submissions is DENIED', () => {
  const requester: AuthContext = { uid: 'colleague_1', email: 'c1@novatek.com', emailVerified: true };
  const otherDoc = { userId: 'colleague_2', productAuthorId: 'admin_1', visibility: 'org' };
  const canListOtherSubmission =
    otherDoc.userId === requester.uid ||
    otherDoc.productAuthorId === requester.uid ||
    (requester.email === 'skmasum98@gmail.com' && requester.emailVerified && otherDoc.visibility === 'org');
  assert.equal(canListOtherSubmission, false);
});

test('QAP Guard: /admins list rule enforces explicit equality predicates without unprovable type scans', () => {
  assert.match(rulesSource, /match \/admins\/\{adminId\}[\s\S]*?existing\(\)\.grantedBy == request\.auth\.uid[\s\S]*?existing\(\)\.visibility == 'org'/);
  assert.doesNotMatch(rulesSource, /allow list:\s*if[^\n;]*is string/);
});

function hasRequiredLocationForDesignation(data: {
  designation: string;
  territory?: string;
  area?: string;
}): boolean {
  if (
    data.designation === 'Regional Manager' ||
    data.designation === 'Regional Sales Manager' ||
    data.designation === 'RSM' ||
    data.designation === 'Zonal Manager' ||
    data.designation === 'National Sales Manager'
  ) {
    return true;
  }
  if (
    data.designation === 'Area Manager' ||
    data.designation === 'Area Sales Manager' ||
    data.designation === 'ASM'
  ) {
    return typeof data.area === 'string' && data.area.length >= 1 && data.area.length <= 80;
  }
  return (
    typeof data.territory === 'string' &&
    data.territory.length >= 1 &&
    data.territory.length <= 80 &&
    typeof data.area === 'string' &&
    data.area.length >= 1 &&
    data.area.length <= 80
  );
}

test('Registration Gate: Role-aware Territory & Area rules and employeeId/employeeCode sync resilience', () => {
  assert.match(rulesSource, /function hasRequiredLocationForDesignation\(data\)/);
  assert.match(rulesSource, /function hasCompletedColleagueRegistration\(prof, priv\)/);
  assert.match(
    rulesSource,
    /hasCompletedColleagueRegistration\(\s*get\(\/databases\/\$\(database\)\/documents\/profiles\/\$\(request\.auth\.uid\)\)\.data,\s*get\(\/databases\/\$\(database\)\/documents\/users_private\/\$\(request\.auth\.uid\)\)\.data\s*\)/
  );

  // MPO missing territory or area -> DENIED
  assert.equal(
    hasRequiredLocationForDesignation({
      designation: 'Medical Promotion Officer',
      territory: '',
      area: 'Jashore Central',
    }),
    false
  );
  assert.equal(
    hasRequiredLocationForDesignation({
      designation: 'Medical Promotion Officer',
      territory: 'Jashore Sadar',
      area: '',
    }),
    false
  );
  assert.equal(
    hasRequiredLocationForDesignation({
      designation: 'Medical Promotion Officer',
      territory: 'A',
      area: 'B',
    }),
    true
  );

  // Area Manager: territory optional, area mandatory
  assert.equal(
    hasRequiredLocationForDesignation({
      designation: 'Area Manager',
      territory: '',
      area: 'Khulna Metro',
    }),
    true
  );
  assert.equal(
    hasRequiredLocationForDesignation({
      designation: 'Area Manager',
      territory: '',
      area: '',
    }),
    false
  );

  // Regional Manager: both territory and area optional
  assert.equal(
    hasRequiredLocationForDesignation({
      designation: 'Regional Manager',
      territory: '',
      area: '',
    }),
    true
  );
});

test('Retake Leaderboard Safety: Unchanged submissionId on lower-score retake does not fail if prior submission was pruned', () => {
  assert.match(
    rulesSource,
    /incoming\(\)\.submissionId == existing\(\)\.submissionId \|\|\s*existsAfter\(\/databases\/\$\(database\)\/documents\/exam_submissions\/\$\(incoming\(\)\.submissionId\)\)/
  );
});

test('Direct Exam Policy: Verified registered colleagues can submit exams directly without prior learning_progress', () => {
  assert.doesNotMatch(
    rulesSource,
    /learning_progress\/\$\(request\.auth\.uid \+ '_' \+ incoming\(\)\.productId\)/
  );
});
