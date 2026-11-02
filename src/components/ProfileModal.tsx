import React, { useMemo, useState } from 'react';
import { AlertCircle, Check, Copy, LogOut, X } from 'lucide-react';
import {
  BLUEPRINT_LIMITS,
  getLocationRequirementsForDesignation,
  isColleagueRegistrationComplete,
  isValidMobileNo,
  normalizeDesignationLabel,
  sanitizeEmployeeId,
} from '../lib/validation';
import {
  NOVATEK_DESIGNATIONS,
  NOVATEK_REGIONS,
  type ColleagueRegistrationInput,
  type PrivateUserInfo,
  type PublicProfile,
} from '../types/models';

interface ProfileModalProps {
  profile: PublicProfile;
  privateInfo: PrivateUserInfo;
  isAdmin: boolean;
  isOnboardingPrompt?: boolean;
  onClose: () => void;
  onSave: (input: ColleagueRegistrationInput) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  privateInfo,
  isAdmin,
  isOnboardingPrompt = false,
  onClose,
  onSave,
  onSignOut,
}) => {
  const alreadyComplete = isColleagueRegistrationComplete(profile, privateInfo);

  const initialRegion = (profile.region || '').trim();
  const isInitialRegionOfficial = NOVATEK_REGIONS.includes(initialRegion);
  const useInitialCustomRegion = Boolean(alreadyComplete && initialRegion && !isInitialRegionOfficial);

  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [employeeId, setEmployeeId] = useState(
    profile.employeeId || (alreadyComplete ? privateInfo.employeeCode : '')
  );
  const [designation, setDesignation] = useState(
    normalizeDesignationLabel(profile.designation) ||
      (isAdmin ? 'Regional Manager' : 'Medical Promotion Officer')
  );
  const [territory, setTerritory] = useState(profile.territory || '');
  const [area, setArea] = useState(profile.area || '');
  const [regionChoice, setRegionChoice] = useState(
    useInitialCustomRegion
      ? '__custom__'
      : isInitialRegionOfficial
      ? initialRegion
      : NOVATEK_REGIONS[0]
  );
  const [customRegion, setCustomRegion] = useState(useInitialCustomRegion ? initialRegion : '');
  const [mobileNo, setMobileNo] = useState(privateInfo.mobileNo || '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  const locationReqs = useMemo(
    () => getLocationRequirementsForDesignation(designation),
    [designation]
  );

  const designationOptions = useMemo(() => {
    if (designation && !NOVATEK_DESIGNATIONS.includes(designation)) {
      return [designation, ...NOVATEK_DESIGNATIONS];
    }
    return NOVATEK_DESIGNATIONS;
  }, [designation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (displayName.trim().length < BLUEPRINT_LIMITS.DISPLAY_NAME_MIN) {
      setFormError('Please enter your full Name (at least 2 characters).');
      return;
    }
    if (sanitizeEmployeeId(employeeId).length < BLUEPRINT_LIMITS.EMPLOYEE_CODE_MIN) {
      setFormError('Please enter your official Novatek Employee ID.');
      return;
    }

    const trimmedTerritory = territory.trim();
    const trimmedArea = area.trim();
    const resolvedRegion =
      regionChoice === '__custom__' ? customRegion.trim() : regionChoice.trim();

    if (locationReqs.territoryRequired && trimmedTerritory.length < BLUEPRINT_LIMITS.TERRITORY_MIN) {
      setFormError('Please enter your assigned Territory.');
      return;
    }
    if (
      !locationReqs.territoryRequired &&
      trimmedTerritory.length > 0 &&
      trimmedTerritory.length < BLUEPRINT_LIMITS.TERRITORY_MIN
    ) {
      setFormError(
        'Territory is optional for your designation—leave it blank or enter at least 2 characters.'
      );
      return;
    }

    if (locationReqs.areaRequired && trimmedArea.length < BLUEPRINT_LIMITS.AREA_MIN) {
      setFormError('Please enter your assigned Area.');
      return;
    }
    if (
      !locationReqs.areaRequired &&
      trimmedArea.length > 0 &&
      trimmedArea.length < BLUEPRINT_LIMITS.AREA_MIN
    ) {
      setFormError(
        'Area is optional for Regional Managers—leave it blank or enter at least 2 characters.'
      );
      return;
    }

    if (resolvedRegion.length < BLUEPRINT_LIMITS.REGION_MIN) {
      setFormError('Please select or enter your assigned Sales Region.');
      return;
    }
    if (!isValidMobileNo(mobileNo)) {
      setFormError('Please enter a valid Mobile No (7 to 15 digits, e.g. 01711-223344).');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        displayName: displayName.trim(),
        employeeId: sanitizeEmployeeId(employeeId),
        designation,
        territory: trimmedTerritory,
        area: trimmedArea,
        region: resolvedRegion,
        mobileNo: mobileNo.trim(),
      });
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to save registration details. Please retry.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard.writeText(profile.uid);
      setCopiedUid(true);
      window.setTimeout(() => setCopiedUid(false), 2000);
    } catch {
      setCopiedUid(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {!alreadyComplete || isOnboardingPrompt
                ? 'Complete Colleague Registration'
                : 'Colleague Field Profile'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {!alreadyComplete || isOnboardingPrompt
                ? 'Required before taking any Novatek product certification exam.'
                : isAdmin
                ? 'Administrator / Regional Manager Account'
                : 'Verified Field Colleague Account'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration dialog"
            className="p-1.5 text-slate-400 hover:text-slate-800 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
          {!alreadyComplete && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 text-xs text-amber-900 leading-relaxed">
              Please complete your mandatory colleague details (<strong>Name</strong>,{' '}
              <strong>Employee ID</strong>, <strong>Region</strong>, <strong>Mobile No</strong>
              {locationReqs.areaRequired ? (
                <>
                  , <strong>Area</strong>
                </>
              ) : null}
              {locationReqs.territoryRequired ? (
                <>
                  , and <strong>Territory</strong>
                </>
              ) : null}
              ) to unlock certification exams.
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                required
                minLength={2}
                maxLength={80}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Md. Tariqul Islam"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Employee ID *
              </label>
              <input
                required
                minLength={2}
                maxLength={40}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. NVK-10428"
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Designation *</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-teal-700"
              >
                {designationOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Region *</label>
              <select
                value={regionChoice}
                onChange={(e) => setRegionChoice(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-teal-700"
              >
                {NOVATEK_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="__custom__">Other (Enter Region Text)</option>
              </select>
            </div>
          </div>

          {regionChoice === '__custom__' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Enter Region Name *
              </label>
              <input
                required
                minLength={2}
                maxLength={80}
                value={customRegion}
                onChange={(e) => setCustomRegion(e.target.value)}
                placeholder="Type your assigned Region name..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Territory{' '}
                {locationReqs.territoryRequired ? (
                  '*'
                ) : (
                  <span className="text-slate-400 font-normal">(Optional)</span>
                )}
              </label>
              <input
                required={locationReqs.territoryRequired}
                maxLength={80}
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
                placeholder={
                  locationReqs.territoryRequired
                    ? 'e.g. Dhanmondi-2'
                    : `Optional for ${designation}`
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Area{' '}
                {locationReqs.areaRequired ? (
                  '*'
                ) : (
                  <span className="text-slate-400 font-normal">(Optional)</span>
                )}
              </label>
              <input
                required={locationReqs.areaRequired}
                maxLength={80}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={
                  locationReqs.areaRequired
                    ? 'e.g. Dhaka Metro South'
                    : 'Optional for Regional Manager'
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mobile No *</label>
            <input
              required
              type="tel"
              minLength={7}
              maxLength={20}
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              placeholder="e.g. +880 1711-223344"
              className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Mobile No and verified email ({privateInfo.email || 'Google Account'}) are stored in a
              private record hidden from public colleague views.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">Account UID (for Admin Authorization)</p>
              <p className="text-xs font-mono text-slate-700 truncate">{profile.uid}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleCopyUid()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer shrink-0"
            >
              {copiedUid ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedUid ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
              {!alreadyComplete && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Study First
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {saving
                ? 'Saving...'
                : !alreadyComplete
                ? 'Save & Unlock Exams'
                : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
