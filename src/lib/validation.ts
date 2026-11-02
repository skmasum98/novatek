import type { PrivateUserInfo, PublicProfile } from '../types/models';

/**
 * Defensive payload constraints synchronized verbatim with firebase-blueprint.json
 * and firestore.rules maxLength, minLength, and pattern invariants.
 */

export const ID_PATTERN = /^[a-zA-Z0-9_\-]+$/;
export const EMPLOYEE_ID_PATTERN = /^[a-zA-Z0-9_\-./ ]+$/;
export const MOBILE_NO_PATTERN = /^[0-9+\-() ]+$/;

export const BLUEPRINT_LIMITS = {
  ID_MAX: 128,
  DISPLAY_NAME_MIN: 2,
  DISPLAY_NAME_MAX: 80,
  DESIGNATION_MIN: 2,
  DESIGNATION_MAX: 80,
  TERRITORY_MIN: 1,
  TERRITORY_MAX: 80,
  AREA_MIN: 1,
  AREA_MAX: 80,
  REGION_MIN: 1,
  REGION_MAX: 80,
  EMAIL_MAX: 160,
  EMPLOYEE_CODE_MIN: 1,
  EMPLOYEE_CODE_MAX: 40,
  MOBILE_NO_MIN: 7,
  MOBILE_NO_MAX: 20,
  BRAND_NAME_MIN: 2,
  BRAND_NAME_MAX: 100,
  GENERIC_MIN: 2,
  GENERIC_MAX: 160,
  SUMMARY_MIN: 10,
  SUMMARY_MAX: 600,
  INDICATIONS_MIN: 5,
  INDICATIONS_MAX: 1200,
  DOSAGE_MIN: 5,
  DOSAGE_MAX: 800,
  SELLING_POINTS_MIN: 5,
  SELLING_POINTS_MAX: 1200,
  COVER_IMAGE_MAX: 240,
  RESOURCE_TITLE_MIN: 3,
  RESOURCE_TITLE_MAX: 240,
  RESOURCE_BODY_MIN: 10,
  RESOURCE_BODY_MAX: 8000,
  MEDIA_URL_MAX: 500,
  MEDIA_CAPTION_MAX: 300,
  CLINICAL_TAKEAWAY_MIN: 5,
  CLINICAL_TAKEAWAY_MAX: 500,
  QUESTION_PROMPT_MIN: 8,
  QUESTION_PROMPT_MAX: 600,
  OPTION_MAX: 240,
  KEYWORD_MAX: 80,
  MODEL_ANSWER_MIN: 2,
  MODEL_ANSWER_MAX: 1000,
  TEXT_ANSWER_MAX: 2000,
  MANAGER_FEEDBACK_MAX: 800,
} as const;

const BANGLA_DIGIT_BASE = 0x09e6;

/**
 * Converts Bangla numerals (০-৯) to ASCII numerals (0-9) so colleagues typing in Bangla
 * keyboard layout do not have Employee IDs or Mobile Numbers stripped.
 */
export function normalizeBanglaDigits(raw: string): string {
  return raw.replace(/[\u09E6-\u09EF]/g, (ch) =>
    String(ch.charCodeAt(0) - BANGLA_DIGIT_BASE)
  );
}

export function sanitizeId(raw: string): string {
  const cleaned = normalizeBanglaDigits(raw)
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, BLUEPRINT_LIMITS.ID_MAX);
  return cleaned.length > 0 ? cleaned : `id_${Date.now()}`;
}

export function validateId(id: string): boolean {
  return id.length >= 1 && id.length <= BLUEPRINT_LIMITS.ID_MAX && ID_PATTERN.test(id);
}

export function sanitizeEmployeeId(raw: string): string {
  return normalizeBanglaDigits(raw)
    .trim()
    .replace(/[^a-zA-Z0-9_\-./ ]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, BLUEPRINT_LIMITS.EMPLOYEE_CODE_MAX);
}

export function sanitizeMobileNo(raw: string): string {
  return normalizeBanglaDigits(raw)
    .trim()
    .replace(/[^0-9+\-() ]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, BLUEPRINT_LIMITS.MOBILE_NO_MAX);
}

export function isValidMobileNo(raw: string): boolean {
  const cleaned = sanitizeMobileNo(raw);
  const digitsOnly = cleaned.replace(/[^0-9]/g, '');
  return (
    cleaned.length >= BLUEPRINT_LIMITS.MOBILE_NO_MIN &&
    cleaned.length <= BLUEPRINT_LIMITS.MOBILE_NO_MAX &&
    MOBILE_NO_PATTERN.test(cleaned) &&
    digitsOnly.length >= 7 &&
    digitsOnly.length <= 15
  );
}

export interface DesignationLocationRequirements {
  territoryRequired: boolean;
  areaRequired: boolean;
  regionRequired: true;
}

const REGIONAL_LEVEL_DESIGNATIONS = new Set([
  'Regional Manager',
  'Regional Sales Manager',
  'RSM',
  'Zonal Manager',
  'National Sales Manager',
]);

const AREA_LEVEL_DESIGNATIONS = new Set([
  'Area Manager',
  'Area Sales Manager',
  'ASM',
]);

export function normalizeDesignationLabel(designation: string | null | undefined): string {
  const trimmed = (designation || '').trim();
  if (trimmed === 'Area Sales Manager') {
    return 'Area Manager';
  }
  return trimmed;
}

export function getLocationRequirementsForDesignation(
  designation: string | null | undefined
): DesignationLocationRequirements {
  const trimmed = (designation || '').trim();
  const normalized = normalizeDesignationLabel(trimmed);
  if (REGIONAL_LEVEL_DESIGNATIONS.has(trimmed) || REGIONAL_LEVEL_DESIGNATIONS.has(normalized)) {
    return {
      territoryRequired: false,
      areaRequired: false,
      regionRequired: true,
    };
  }
  if (AREA_LEVEL_DESIGNATIONS.has(trimmed) || AREA_LEVEL_DESIGNATIONS.has(normalized)) {
    return {
      territoryRequired: false,
      areaRequired: true,
      regionRequired: true,
    };
  }
  return {
    territoryRequired: true,
    areaRequired: true,
    regionRequired: true,
  };
}

export function getMissingRegistrationFields(
  profile: PublicProfile | null | undefined,
  privateInfo: PrivateUserInfo | null | undefined
): string[] {
  const missing: string[] = [];
  const { territoryRequired, areaRequired } = getLocationRequirementsForDesignation(
    profile?.designation
  );

  if (!profile || (profile.displayName || '').trim().length < BLUEPRINT_LIMITS.DISPLAY_NAME_MIN) {
    missing.push('Name');
  }

  const empId = sanitizeEmployeeId(profile?.employeeId || '');
  const privEmp = sanitizeEmployeeId(privateInfo?.employeeCode || '');
  if (
    empId.length < BLUEPRINT_LIMITS.EMPLOYEE_CODE_MIN &&
    privEmp.length < BLUEPRINT_LIMITS.EMPLOYEE_CODE_MIN
  ) {
    missing.push('Employee ID');
  }

  if (
    territoryRequired &&
    (!profile || (profile.territory || '').trim().length < BLUEPRINT_LIMITS.TERRITORY_MIN)
  ) {
    missing.push('Territory');
  }

  if (
    areaRequired &&
    (!profile || (profile.area || '').trim().length < BLUEPRINT_LIMITS.AREA_MIN)
  ) {
    missing.push('Area');
  }

  if (!profile || (profile.region || '').trim().length < BLUEPRINT_LIMITS.REGION_MIN) {
    missing.push('Region');
  }

  if (!privateInfo || !isValidMobileNo(privateInfo.mobileNo || '')) {
    missing.push('Mobile No');
  }

  return missing;
}

export function isColleagueRegistrationComplete(
  profile: PublicProfile | null | undefined,
  privateInfo: PrivateUserInfo | null | undefined
): boolean {
  if (!profile || !privateInfo) return false;
  return getMissingRegistrationFields(profile, privateInfo).length === 0;
}

export function clampString(val: string, minLen: number, maxLen: number, fallback = 'N/A'): string {
  const trimmed = val.trim();
  if (trimmed.length < minLen) {
    const padded = trimmed.length > 0 ? trimmed.padEnd(minLen, '.') : fallback.slice(0, maxLen);
    return padded.slice(0, maxLen);
  }
  return trimmed.slice(0, maxLen);
}

export function clampOptionalString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

export function clampInt(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function scoreWrittenResponseByRubric(
  textAnswer: string,
  rubricKeywords: string[],
  maxPoints: number
): number {
  const cleaned = textAnswer.trim().toLowerCase();
  if (cleaned.length < 12) return 0;

  if (!rubricKeywords || rubricKeywords.length === 0) {
    return cleaned.length >= 40 ? maxPoints : Math.max(1, Math.round(maxPoints * 0.5));
  }

  let matched = 0;
  for (const kw of rubricKeywords) {
    const alternatives = kw
      .split('|')
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
    if (alternatives.length > 0 && alternatives.some((alt) => cleaned.includes(alt))) {
      matched += 1;
    }
  }

  // Full credit when at least 60% of key clinical concepts (in Bangla or English) are articulated
  const targetMatches = Math.max(1, Math.ceil(rubricKeywords.length * 0.6));
  const ratio = Math.min(1, matched / targetMatches);
  return clampInt(maxPoints * ratio, 0, maxPoints);
}
