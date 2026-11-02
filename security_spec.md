# Novatek Academy — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Default-Deny Safety Net**: Every unlisted path under `/databases/{database}/documents/{document=**}` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Authentication Gate**: Every mutation (`create`, `update`, `delete`) requires an authenticated user with `request.auth.token.email_verified == true`.
3. **RBAC Admin Isolation**: Admin privileges (`isAdmin()`) are derived strictly from either the bootstrapped verified Regional Manager email (`skmasum98@gmail.com` with `email_verified == true`) or `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`. Users can never self-assign admin status.
4. **PII Split-Collection Isolation**: Colleague emails, employee codes, and mobile numbers (`mobileNo`) live exclusively in `/users_private/{userId}` (`allow list: if false`) and can only be read via single-document `get` by `request.auth.uid == userId` or `isAdmin()`. Public colleague profiles (`/profiles/{userId}`) and `/leaderboard/{entryId}` contain zero PII (storing only organizational attributes: `displayName`, `employeeId`, `designation`, `territory`, `area`, `region`).
5. **Master Gate Relational Sync**: Subcollections `/products/{productId}/resources/{resourceId}` and `/products/{productId}/questions/{questionId}` validate parent `/products/{productId}` existence and status via `get()` on single-document operations.
6. **Published & Open Exam Gate (Direct Exam Permitted)**: Verified colleagues who satisfy the 6-field registration gate may submit `/exam_submissions/{submissionId}` and `/leaderboard/{entryId}` directly without prior `/learning_progress` completion, strictly provided `/products/{productId}` exists with `status == 'published'` and `examEnabled != false` (and retake rules permit).
7. **Atomic Submission-Leaderboard Write**: Creating `/exam_submissions/{submissionId}` requires `existsAfter(/databases/$(database)/documents/leaderboard/$(request.auth.uid + '_' + incoming().productId))`, and creating `/leaderboard/{entryId}` requires `existsAfter(/databases/$(database)/documents/exam_submissions/$(incoming().submissionId))`.
8. **Terminal State Locking**: Once an `ExamSubmission` reaches `gradingStatus == 'finalized'`, no non-admin updates are permitted. Once `LearningProgress.isModuleCompleted == true`, it cannot be reverted to `false` by a non-admin.
9. **Cost-Safe Query Enforcer**: Every `allow list` block evaluates `resource.data` directly without `get()` or `exists()` calls.
10. **Mandatory Colleague Registration Gate**: An `/exam_submissions/{submissionId}` document cannot be created unless `/profiles/{request.auth.uid}` satisfies `isCompleteColleagueProfile` (`displayName`, `employeeId`, `territory`, `area`, `region`, `isRegistrationComplete == true`) AND `/users_private/{request.auth.uid}` satisfies `isCompletePrivateUserInfo` (`employeeCode` and `mobileNo`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Attack Vector | Target Path | Malicious Payload / Context | Expected Result |
| :- | :------------ | :---------- | :-------------------------- | :-------------- |
| 1 | **Privilege Escalation (Self-Admin)** | `/admins/attacker_uid` | Non-admin user writes `{ uid: "attacker_uid", grantedBy: "attacker_uid", region: "Dhaka", createdAt: SERVER_TIME }` | `PERMISSION_DENIED` |
| 2 | **Unverified Email Spoofing** | `/products/prod_1` | Auth token `email: "skmasum98@gmail.com"` with `email_verified: false` attempts product creation | `PERMISSION_DENIED` |
| 3 | **Shadow Field Injection** | `/profiles/colleague_1` | Valid profile payload plus shadow field `{ isAdmin: true }` | `PERMISSION_DENIED` |
| 4 | **PII Cross-User Read Leak** | `/users_private/colleague_2` | Authenticated `colleague_1` attempts `get` on `colleague_2`'s private email record | `PERMISSION_DENIED` |
| 5 | **Identity Spoofing on Exam** | `/exam_submissions/sub_1` | Authenticated `colleague_1` submits exam with `userId: "colleague_2"` | `PERMISSION_DENIED` |
| 6 | **Exam on Paused or Draft Module** | `/exam_submissions/sub_2` | `colleague_1` submits exam when `/products/prod_1` has `examEnabled: false` or `status: "draft"` | `PERMISSION_DENIED` |
| 7 | **Orphaned Non-Atomic Submission** | `/exam_submissions/sub_3` | `colleague_1` creates `exam_submissions/sub_3` without writing `/leaderboard/colleague_1_prod_1` in the same batch | `PERMISSION_DENIED` |
| 8 | **Terminal State Unlock / Tamper** | `/exam_submissions/sub_4` | `colleague_1` attempts to update `awardedScore: 100` on an already submitted/finalized exam | `PERMISSION_DENIED` |
| 9 | **Denial-of-Wallet Oversized String** | `/profiles/colleague_1` | `displayName` contains 5,000 characters (exceeding `maxLength: 80`) | `PERMISSION_DENIED` |
| 10 | **ID Poisoning Path Injection** | `/learning_progress/bad$id!@#` | Document ID contains disallowed special characters failing `^[a-zA-Z0-9_\-]+$` | `PERMISSION_DENIED` |
| 11 | **Client Timestamp Forgery** | `/profiles/colleague_1` | Payload supplies backdated `createdAt: Timestamp(2020-01-01)` instead of `request.time` | `PERMISSION_DENIED` |
| 12 | **Unauthorized Blanket Scrape** | `/exam_submissions` | `colleague_1` attempts unfiltered `list` across all colleagues' exam submissions | `PERMISSION_DENIED` |
