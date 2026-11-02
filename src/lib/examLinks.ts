import type { ProductModule } from '../types/models';

export const EXAM_QUERY_PARAM = 'exam';
const PENDING_EXAM_STORAGE_KEY = 'novatek_pending_direct_exam_id';
const VALID_EXAM_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export function normalizeExamProductId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  return VALID_EXAM_ID_REGEX.test(trimmed) ? trimmed : null;
}

export function readExamIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeExamProductId(params.get(EXAM_QUERY_PARAM));
  } catch {
    return null;
  }
}

export function setExamParamInUrl(productId: string): void {
  if (typeof window === 'undefined') return;
  const validId = normalizeExamProductId(productId);
  if (!validId) return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(EXAM_QUERY_PARAM, validId);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // Ignore history API errors in restricted iframe sandboxes
  }
}

export function clearExamParamFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(EXAM_QUERY_PARAM)) return;
    url.searchParams.delete(EXAM_QUERY_PARAM);
    const nextSearch = url.searchParams.toString();
    window.history.replaceState(
      {},
      '',
      `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`
    );
  } catch {
    // Ignore history API errors in restricted iframe sandboxes
  }
}

export function readStoredPendingExamId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return normalizeExamProductId(window.sessionStorage.getItem(PENDING_EXAM_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeStoredPendingExamId(productId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const validId = normalizeExamProductId(productId);
    if (!validId) {
      window.sessionStorage.removeItem(PENDING_EXAM_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(PENDING_EXAM_STORAGE_KEY, validId);
    }
  } catch {
    // Ignore storage unavailability
  }
}

export function buildShareableExamUrl(productId: string): string {
  if (typeof window === 'undefined') {
    return `?${EXAM_QUERY_PARAM}=${encodeURIComponent(productId)}`;
  }
  const basePath = `${window.location.origin}${window.location.pathname}`;
  return `${basePath}?${EXAM_QUERY_PARAM}=${encodeURIComponent(productId)}`;
}

export function buildShareableExamInviteText(product: ProductModule): string {
  const link = buildShareableExamUrl(product.id);
  return [
    `Novatek Academy — Direct Certification Exam Invitation`,
    `Product: ${product.brandName} (${product.genericComposition})`,
    `Questions: ${product.questionCount} | Duration: ${product.examDurationMinutes} min | Passing Score: ${product.passingPercentage}%`,
    `Direct Exam Link: ${link}`,
  ].join('\n');
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to hidden textarea copy for restricted iframe permissions
    }
  }

  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.className = 'fixed -top-96 left-0 opacity-0 pointer-events-none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
