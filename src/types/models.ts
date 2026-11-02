import type { Timestamp } from 'firebase/firestore';

export type TherapeuticClass =
  | 'Cardiovascular'
  | 'Metabolic & Endocrine'
  | 'Respiratory'
  | 'Gastroenterology'
  | 'Neurology'
  | 'Anti-Infectives';

export type ResourceType = 'text' | 'video' | 'image';
export type QuestionType = 'mcq' | 'text';
export type GradingStatus = 'pending_review' | 'finalized';
export type PublicationStatus = 'published' | 'draft';

export interface AdminRecord {
  uid: string;
  grantedBy: string;
  region: string;
  visibility?: 'org';
  createdAt?: Timestamp;
}

export interface PublicProfile {
  uid: string;
  displayName: string;
  designation: string;
  employeeId?: string;
  territory?: string;
  area?: string;
  region: string;
  isRegistrationComplete?: boolean;
  visibility: 'org';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PrivateUserInfo {
  uid: string;
  email: string;
  employeeCode: string;
  mobileNo?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ColleagueRegistrationInput {
  displayName: string;
  employeeId: string;
  designation: string;
  territory: string;
  area: string;
  region: string;
  mobileNo: string;
}

export interface ProductModule {
  id: string;
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
  resourceCount: number;
  questionCount: number;
  status: PublicationStatus;
  authorId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LearningResource {
  id: string;
  productId: string;
  authorId: string;
  productStatus: PublicationStatus;
  orderIndex: number;
  resourceType: ResourceType;
  title: string;
  estimatedMinutes: number;
  bodyText: string;
  mediaUrl: string;
  mediaCaption: string;
  clinicalTakeaway: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ExamQuestion {
  id: string;
  productId: string;
  authorId: string;
  productStatus: PublicationStatus;
  orderIndex: number;
  questionType: QuestionType;
  prompt: string;
  points: number;
  options: string[];
  correctOptionIndex: number;
  rubricKeywords: string[];
  modelAnswer: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LearningProgress {
  userId: string;
  productId: string;
  completedResourceIds: string[];
  isModuleCompleted: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ExamResponseItem {
  questionId: string;
  questionPrompt: string;
  questionType: QuestionType;
  selectedOptionIndex: number;
  textAnswer: string;
  awardedPoints: number;
  maxPoints: number;
}

export interface ExamSubmission {
  id: string;
  userId: string;
  userName: string;
  userRegion: string;
  userDesignation: string;
  userEmployeeId?: string;
  userTerritory?: string;
  userArea?: string;
  productId: string;
  productName: string;
  productAuthorId: string;
  responses: ExamResponseItem[];
  awardedScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  hasTextQuestions: boolean;
  gradingStatus: GradingStatus;
  managerFeedback: string;
  durationSeconds: number;
  visibility: 'org';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userRegion: string;
  userDesignation: string;
  userEmployeeId?: string;
  userTerritory?: string;
  userArea?: string;
  productId: string;
  productName: string;
  submissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  durationSeconds: number;
  gradingStatus: GradingStatus;
  visibility: 'org';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const NOVATEK_REGIONS: string[] = [
  'B.Baria',
  'Barishal',
  'Bogura',
  'Coxs Bazar',
  'CTG-A',
  'CTG-B',
  'Cumilla',
  'Dhaka-A',
  'Dhaka-B',
  'Dhaka-C',
  'Dinajpur',
  'Faridpur',
  'Jashore',
  'Khulna',
  'Kishoreganj',
  'Mymensingh',
  'Noakhali-A',
  'Noakhali-B',
  'Pabna',
  'Patuakhali',
  'Rajshahi',
  'Rangpur',
  'Sylhet',
  'Tangail',
];

export const NOVATEK_DESIGNATIONS: string[] = [
  'Medical Promotion Officer',
  'Senior Medical Promotion Officer',
  'Territory Manager',
  'Area Manager',
  'Regional Manager',
  'Product Specialist',
];

export const THERAPEUTIC_CLASSES: TherapeuticClass[] = [
  'Cardiovascular',
  'Metabolic & Endocrine',
  'Respiratory',
  'Gastroenterology',
  'Neurology',
  'Anti-Infectives',
];
