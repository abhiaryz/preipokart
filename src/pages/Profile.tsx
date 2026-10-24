import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Buildings,
  CheckCircle,
  Envelope,
  Eye,
  EyeSlash,
  IdentificationCard,
  Key,
  Lock,
  Phone,
  ShieldCheck,
  User,
  UsersThree,
} from '@phosphor-icons/react';
import { Field, InlineNotice, PageHeader, QueryStatus } from '../components/ui';
import { api, errorMessage } from '../api';
import type { NomineeRelationship } from '../api/types';
import { useApi } from '../hooks/useApi';
import posthog, { isPostHogConfigured } from '../posthog';

const tabs = [
  { id: 'details', label: 'Your details', shortLabel: 'Details', icon: User },
  { id: 'password', label: 'Password', shortLabel: 'Password', icon: Key },
  { id: 'kyc', label: 'KYC', shortLabel: 'KYC', icon: IdentificationCard },
  { id: 'nominee', label: 'Nominee', shortLabel: 'Nominee', icon: UsersThree },
  { id: 'demat', label: 'CDSL & NSDL', shortLabel: 'Demat', icon: Buildings },
] as const;

type TabId = (typeof tabs)[number]['id'];

function isTab(value: string | null): value is TabId {
  return tabs.some((t) => t.id === value);
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'PK';
}

type StatusTone = 'success' | 'warning' | 'neutral' | 'error';

function statusToneClasses(tone: StatusTone) {
  switch (tone) {
    case 'success':
      return 'border-bid/30 bg-bid/10 text-bid';
    case 'warning':
      return 'border-accent/40 bg-accent/10 text-on-surface';
    case 'error':
      return 'border-ask/30 bg-ask/10 text-ask';
    default:
      return 'border-outline-variant/50 bg-surface-container-low text-on-surface-variant';
  }
}

function StatusChip({ label, detail, tone }: { label: string; detail: string; tone: StatusTone }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${statusToneClasses(tone)}`}>
      <p className="text-[10px] font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-0.5 text-sm font-semibold leading-snug">{detail}</p>
    </div>
  );
}

function kycStatusPresentation(status: string): { detail: string; tone: StatusTone } {
  switch (status) {
    case 'verified':
      return { detail: 'Verified', tone: 'success' };
    case 'pending':
    case 'submitted':
      return { detail: 'Under review', tone: 'warning' };
    case 'rejected':
      return { detail: 'Needs update', tone: 'error' };
    default:
      return { detail: 'Not submitted', tone: 'neutral' };
  }
}

function profileSetupProgress(input: {
  hasBasics: boolean;
  kycVerified: boolean;
  hasNominee: boolean;
  dematConnected: boolean;
}) {
  const steps = [input.hasBasics, input.kycVerified, input.hasNominee, input.dematConnected];
  const done = steps.filter(Boolean).length;
  return { done, total: steps.length, percent: Math.round((done / steps.length) * 100) };
}

const tabDescriptions: Record<TabId, string> = {
  details: 'Contact information used for orders and account alerts.',
  password: 'Change your sign-in password. Use a strong password you do not reuse elsewhere.',
  kyc: 'Verify your identity with PAN and Aadhaar before you trade.',
  nominee: 'Register who should receive your holdings if needed.',
  demat: 'Link CDSL or NSDL so shares can move after settlement.',
};

const profileSectionMinHeight = 'min-h-[min(720px,calc(100dvh-13rem))]';

function ProfilePanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={`card flex ${profileSectionMinHeight} flex-col overflow-hidden`}>
      <div className="shrink-0 border-b border-outline-variant/30 bg-surface-container-low px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight text-on-surface">{title}</h2>
        {description ? <p className="mt-1 max-w-prose text-sm leading-relaxed text-on-surface-variant">{description}</p> : null}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">{children}</div>
    </section>
  );
}

function ProfileFormActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-auto border-t border-outline-variant/25 pt-5">
      {children}
    </div>
  );
}

function TabButton({
  active,
  label,
  shortLabel,
  icon: Icon,
  onClick,
  layout,
}: {
  active: boolean;
  label: string;
  shortLabel: string;
  icon: typeof User;
  onClick: () => void;
  layout: 'row' | 'stack';
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-xl text-sm font-medium transition duration-200 ${
        layout === 'stack' ? 'w-full px-3 py-2.5 text-left' : 'min-h-10 shrink-0 whitespace-nowrap px-3 py-2'
      } ${
        active
          ? 'bg-primary text-on-primary shadow-sm'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
      }`}
    >
      <Icon size={18} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
      <span className={layout === 'row' ? 'sm:hidden' : ''}>{shortLabel}</span>
      <span className={layout === 'row' ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
  );
}

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: TabId = isTab(tabParam) ? tabParam : 'details';
  const setTab = (id: TabId) => {
    setSearchParams(id === 'details' ? {} : { tab: id });
  };

  const profile = useApi(() => api.getProfile(), []);
  const kyc = useApi(() => api.getKyc(), []);
  const nominee = useApi(() => api.getNominee(), []);
  const demat = useApi(() => api.getDemat(), []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<'ok' | 'err' | string | null>(null);

  const [pan, setPan] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [kycError, setKycError] = useState('');
  const [kycDone, setKycDone] = useState(false);

  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState<NomineeRelationship>('Spouse');
  const [nomineeDob, setNomineeDob] = useState('');
  const [nomineeShare, setNomineeShare] = useState('100');
  const [nomineePhone, setNomineePhone] = useState('');
  const [nomineePan, setNomineePan] = useState('');
  const [nomineeSaved, setNomineeSaved] = useState(false);
  const [nomineeError, setNomineeError] = useState('');

  const [cdslDp, setCdslDp] = useState('');
  const [cdslBo, setCdslBo] = useState('');
  const [nsdlDp, setNsdlDp] = useState('');
  const [nsdlClient, setNsdlClient] = useState('');
  const [dematError, setDematError] = useState('');

  useEffect(() => {
    const user = profile.data;
    if (!user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setPhone(user.mobile ?? '');
    setCity(user.city ?? '');
    setDob(user.dateOfBirth ?? '');
  }, [profile.data]);

  useEffect(() => {
    const row = nominee.data;
    if (!row) return;
    setNomineeName(row.name);
    setNomineeRelation(row.relationship);
    setNomineeDob(row.dateOfBirth);
    setNomineeShare(String(row.sharePercent ?? 100));
    setNomineePhone(row.mobile);
    setNomineePan(row.pan ?? '');
  }, [nominee.data]);

  useEffect(() => {
    if (demat.data?.cdsl.dpId) setCdslDp(demat.data.cdsl.dpId);
    if (demat.data?.nsdl.dpId) setNsdlDp(demat.data.nsdl.dpId);
  }, [demat.data]);

  const loading = profile.loading || kyc.loading || nominee.loading || demat.loading;
  const loadError = profile.error || kyc.error || nominee.error || demat.error;

  const onSaveDetails = async (e: FormEvent) => {
    e.preventDefault();
    setDetailsError('');
    try {
      await api.updateProfile({
        name,
        email,
        mobile: phone,
        city,
        dateOfBirth: dob || null,
      });
      setDetailsSaved(true);
      await profile.reload();
      window.setTimeout(() => setDetailsSaved(false), 2500);
    } catch (err) {
      setDetailsError(errorMessage(err));
    }
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || newPassword.length < 8 || newPassword !== confirmPassword) {
      setPasswordNotice('err');
      return;
    }
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordNotice('ok');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordNotice(errorMessage(err));
    }
  };

  const onSubmitKyc = async (e: FormEvent) => {
    e.preventDefault();
    const panValue = pan.replace(/\s/g, '').toUpperCase();
    const aadhaarValue = aadhaar.replace(/\D/g, '');
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panValue) || aadhaarValue.length !== 12) {
      setKycError('Enter a valid PAN and 12-digit Aadhaar.');
      setKycDone(false);
      return;
    }
    try {
      await api.submitKyc(panValue, aadhaarValue);
      if (isPostHogConfigured) posthog.capture('kyc_submitted');
      setKycError('');
      setKycDone(true);
      await kyc.reload();
      await profile.reload();
    } catch (err) {
      setKycDone(false);
      setKycError(errorMessage(err));
    }
  };

  const onSaveNominee = async (e: FormEvent) => {
    e.preventDefault();
    if (!nomineeName.trim() || !nomineeRelation || !nomineeDob || !nomineePhone.trim()) {
      setNomineeError('Enter the nominee’s name, relationship, date of birth, and mobile.');
      setNomineeSaved(false);
      return;
    }
    const share = Number(nomineeShare);
    if (!Number.isFinite(share) || share <= 0 || share > 100) {
      setNomineeError('Share must be a number between 1 and 100.');
      setNomineeSaved(false);
      return;
    }
    try {
      await api.setNominee({
        name: nomineeName.trim(),
        relationship: nomineeRelation,
        sharePercent: share,
        dateOfBirth: nomineeDob,
        mobile: nomineePhone.trim(),
        pan: nomineePan.trim() || null,
      });
      if (isPostHogConfigured) posthog.capture('nominee_saved', { relationship: nomineeRelation });
      setNomineeError('');
      setNomineeSaved(true);
      await nominee.reload();
      await profile.reload();
    } catch (err) {
      setNomineeSaved(false);
      setNomineeError(errorMessage(err));
    }
  };

  const kycStatus = kyc.data?.status ?? profile.data?.kycStatus ?? 'unverified';
  const cdslConnected = Boolean(demat.data?.cdsl.connected);
  const nsdlConnected = Boolean(demat.data?.nsdl.connected);
  const kycPresentation = kycStatusPresentation(kycStatus);
  const dematAnyConnected = cdslConnected || nsdlConnected;
  const setup = profileSetupProgress({
    hasBasics: Boolean(name.trim() && email.trim() && phone.trim()),
    kycVerified: kycStatus === 'verified',
    hasNominee: Boolean(nominee.data?.name?.trim()),
    dematConnected: dematAnyConnected,
  });
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Profile & account"
        description="Manage personal details, security, compliance, and demat connections in one place."
      />

      <QueryStatus loading={loading && !profile.data} error={loadError}>
        <section className="card overflow-hidden">
          <div className="relative bg-gradient-to-br from-primary-container/80 via-surface to-surface-container-low p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-on-primary shadow-sm ring-4 ring-surface/80">
                  {initials(name || profile.data?.email || 'PK')}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold tracking-tight text-on-surface">{name || profile.data?.email}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
                    {email ? (
                      <span className="inline-flex items-center gap-1">
                        <Envelope size={14} aria-hidden="true" />
                        {email}
                      </span>
                    ) : null}
                    {phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={14} aria-hidden="true" />
                        {phone}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="w-full max-w-xs rounded-xl border border-outline-variant/40 bg-surface/90 p-4 backdrop-blur-sm sm:w-auto">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-on-surface">Account setup</span>
                  <span className="font-mono text-on-surface-variant">
                    {setup.done}/{setup.total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${setup.percent}%` }}
                    role="progressbar"
                    aria-valuenow={setup.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Profile setup progress"
                  />
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {setup.percent === 100 ? 'You are ready to trade.' : 'Complete KYC, nominee, and demat to unlock the full flow.'}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-2 border-t border-outline-variant/30 bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusChip label="KYC" detail={kycPresentation.detail} tone={kycPresentation.tone} />
            <StatusChip
              label="Nominee"
              detail={nominee.data?.name ? nominee.data.name : 'Not added'}
              tone={nominee.data?.name ? 'success' : 'neutral'}
            />
            <StatusChip label="CDSL" detail={cdslConnected ? 'Connected' : 'Not linked'} tone={cdslConnected ? 'success' : 'neutral'} />
            <StatusChip label="NSDL" detail={nsdlConnected ? 'Connected' : 'Not linked'} tone={nsdlConnected ? 'success' : 'neutral'} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:items-stretch">
          <aside className="hidden lg:block">
            <nav
              className={`card sticky top-24 flex ${profileSectionMinHeight} flex-col gap-1 p-2`}
              role="tablist"
              aria-label="Profile sections"
            >
              {tabs.map((item) => (
                <TabButton
                  key={item.id}
                  active={tab === item.id}
                  label={item.label}
                  shortLabel={item.shortLabel}
                  icon={item.icon}
                  layout="stack"
                  onClick={() => setTab(item.id)}
                />
              ))}
            </nav>
          </aside>

          <div className={`flex min-w-0 flex-col gap-4 ${profileSectionMinHeight}`}>
            <nav
              className="card flex shrink-0 gap-1 overflow-x-auto p-1.5 lg:hidden"
              role="tablist"
              aria-label="Profile sections"
            >
              {tabs.map((item) => (
                <TabButton
                  key={item.id}
                  active={tab === item.id}
                  label={item.label}
                  shortLabel={item.shortLabel}
                  icon={item.icon}
                  layout="row"
                  onClick={() => setTab(item.id)}
                />
              ))}
            </nav>

        {tab === 'details' && (
          <ProfilePanel title="Your details" description={tabDescriptions.details}>
          <form className="flex flex-1 flex-col gap-5" onSubmit={(e) => void onSaveDetails(e)}>
            {detailsSaved ? (
              <InlineNotice tone="success">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle size={16} aria-hidden="true" />
                  Details saved
                </span>
              </InlineNotice>
            ) : null}
            {detailsError ? <InlineNotice tone="error">{detailsError}</InlineNotice> : null}
            <Field id="name" label="Full name">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} aria-hidden="true" />
                <input id="name" className="field pl-10" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </Field>
            <Field id="email" label="Email" hint="We send order updates here.">
              <div className="relative">
                <Envelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} aria-hidden="true" />
                <input id="email" type="email" className="field pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </Field>
            <Field id="phone" label="Mobile number">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} aria-hidden="true" />
                <input id="phone" className="field pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="city" label="City">
                <input id="city" className="field" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field id="dob" label="Date of birth">
                <input id="dob" type="date" className="field" value={dob} onChange={(e) => setDob(e.target.value)} />
              </Field>
            </div>
            <ProfileFormActions>
              <button className="btn-primary" type="submit">
                Save details
              </button>
            </ProfileFormActions>
          </form>
          </ProfilePanel>
        )}

        {tab === 'password' && (
          <ProfilePanel title="Password" description={tabDescriptions.password}>
          <form className="flex flex-1 flex-col gap-5" onSubmit={(e) => void onChangePassword(e)}>
            {passwordNotice === 'ok' ? <InlineNotice tone="success">Password updated.</InlineNotice> : null}
            {passwordNotice && passwordNotice !== 'ok' ? (
              <InlineNotice tone="error">
                {passwordNotice === 'err'
                  ? 'Enter your current password. New password must be at least 8 characters and match the confirmation.'
                  : passwordNotice}
              </InlineNotice>
            ) : null}
            <Field id="current-password" label="Current password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} aria-hidden="true" />
                <input
                  id="current-password"
                  autoComplete="current-password"
                  className="field px-10"
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-on-surface-variant hover:text-on-surface"
                  aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  onClick={() => setShowPasswords((v) => !v)}
                >
                  {showPasswords ? <EyeSlash size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </Field>
            <Field id="new-password" label="New password" hint="Use at least 8 characters.">
              <input
                id="new-password"
                autoComplete="new-password"
                className="field"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Field id="confirm-password" label="Confirm new password">
              <input
                id="confirm-password"
                autoComplete="new-password"
                className="field"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
            <ProfileFormActions>
              <button className="btn-primary" type="submit">
                Update password
              </button>
            </ProfileFormActions>
          </form>
          </ProfilePanel>
        )}

        {tab === 'kyc' && (
          <ProfilePanel title="KYC verification" description={tabDescriptions.kyc}>
          <form className="flex flex-1 flex-col gap-5" onSubmit={(e) => void onSubmitKyc(e)}>
            <div className="flex items-start gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 text-sm text-on-surface-variant">
              <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={20} aria-hidden="true" />
              <p>Use the same PAN and Aadhaar linked to your demat account. We review submissions within one business day.</p>
            </div>
            {kyc.data?.status && kyc.data.status !== 'unverified' ? (
              <InlineNotice tone={kyc.data.status === 'rejected' ? 'error' : 'info'}>
                Status: {kyc.data.status}
                {kyc.data.panLast4 ? ` · PAN ••••${kyc.data.panLast4}` : ''}
                {kyc.data.rejectionReason ? ` · ${kyc.data.rejectionReason}` : ''}
              </InlineNotice>
            ) : null}
            {kycDone ? <InlineNotice tone="success">KYC submitted. We will email you when it is approved.</InlineNotice> : null}
            {kycError ? <InlineNotice tone="error">{kycError}</InlineNotice> : null}
            <Field id="pan" label="PAN">
              <input
                id="pan"
                className="field uppercase"
                placeholder="ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
              />
            </Field>
            <Field id="aadhaar" label="Aadhaar number">
              <input
                id="aadhaar"
                className="field"
                placeholder="XXXX XXXX XXXX"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
              />
            </Field>
            <ProfileFormActions>
              <button className="btn-primary" type="submit">
                Submit KYC
              </button>
            </ProfileFormActions>
          </form>
          </ProfilePanel>
        )}

        {tab === 'nominee' && (
          <ProfilePanel title="Nominee" description={tabDescriptions.nominee}>
          <form className="flex flex-1 flex-col gap-5" onSubmit={(e) => void onSaveNominee(e)}>
            {nomineeSaved ? <InlineNotice tone="success">Nominee saved.</InlineNotice> : null}
            {nomineeError ? <InlineNotice tone="error">{nomineeError}</InlineNotice> : null}
            <Field id="nominee-name" label="Full name">
              <input
                id="nominee-name"
                className="field"
                placeholder="Name as on PAN or Aadhaar"
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="nominee-relation" label="Relationship">
                <select
                  id="nominee-relation"
                  className="field"
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value as NomineeRelationship)}
                >
                  {(['Spouse', 'Parent', 'Child', 'Sibling', 'Other'] as const).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="nominee-share" label="Share of holdings (%)">
                <input
                  id="nominee-share"
                  className="field"
                  type="number"
                  min={1}
                  max={100}
                  value={nomineeShare}
                  onChange={(e) => setNomineeShare(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="nominee-dob" label="Date of birth">
                <input id="nominee-dob" type="date" className="field" value={nomineeDob} onChange={(e) => setNomineeDob(e.target.value)} />
              </Field>
              <Field id="nominee-phone" label="Mobile number">
                <input
                  id="nominee-phone"
                  className="field"
                  placeholder="+91"
                  value={nomineePhone}
                  onChange={(e) => setNomineePhone(e.target.value)}
                />
              </Field>
            </div>
            <Field id="nominee-pan" label="PAN (optional)">
              <input
                id="nominee-pan"
                className="field uppercase"
                placeholder="ABCDE1234F"
                value={nomineePan}
                onChange={(e) => setNomineePan(e.target.value.toUpperCase())}
              />
            </Field>
            <ProfileFormActions>
              <button className="btn-primary" type="submit">
                Save nominee
              </button>
            </ProfileFormActions>
          </form>
          </ProfilePanel>
        )}

        {tab === 'demat' && (
          <ProfilePanel title="CDSL & NSDL" description={tabDescriptions.demat}>
            <div className="flex flex-1 flex-col gap-4">
            {dematError ? <InlineNotice tone="error">{dematError}</InlineNotice> : null}
            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
            <section className="card flex h-full min-h-[20rem] flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-outline-variant/30 bg-surface-container-low px-5 py-4">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Buildings size={20} aria-hidden="true" />
                    CDSL
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Connect your CDSL demat so shares can be credited after a deal.
                    {demat.data?.cdsl.boIdLast4 ? ` Linked ••••${demat.data.cdsl.boIdLast4}` : ''}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cdslConnected ? statusToneClasses('success') : statusToneClasses('neutral')}`}>
                  {cdslConnected ? 'Connected' : 'Not connected'}
                </span>
              </div>
              <div className="flex flex-1 flex-col space-y-4 p-5">
              <Field id="cdsl-dp" label="DP ID">
                <input id="cdsl-dp" className="field" placeholder="12000000" value={cdslDp} onChange={(e) => setCdslDp(e.target.value)} />
              </Field>
              <Field id="cdsl-bo" label="BO ID (16 digits)">
                <input id="cdsl-bo" className="field" placeholder="1200000000000000" value={cdslBo} onChange={(e) => setCdslBo(e.target.value)} />
              </Field>
              <div className="mt-auto border-t border-outline-variant/25 pt-4">
              <button
                type="button"
                className={cdslConnected ? 'btn-secondary w-full sm:w-auto' : 'btn-primary w-full sm:w-auto'}
                onClick={() => {
                  void (async () => {
                    setDematError('');
                    try {
                      if (cdslConnected) {
                        await api.disconnectCdsl();
                        if (isPostHogConfigured) posthog.capture('demat_connection_changed', { provider: 'cdsl', action: 'disconnected' });
                      } else {
                        await api.connectCdsl(cdslDp.trim(), cdslBo.trim());
                        if (isPostHogConfigured) posthog.capture('demat_connection_changed', { provider: 'cdsl', action: 'connected' });
                      }
                      await demat.reload();
                      await profile.reload();
                    } catch (err) {
                      setDematError(errorMessage(err));
                    }
                  })();
                }}
              >
                {cdslConnected ? 'Disconnect CDSL' : 'Connect CDSL'}
              </button>
              </div>
              </div>
            </section>

            <section className="card flex h-full min-h-[20rem] flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-outline-variant/30 bg-surface-container-low px-5 py-4">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Buildings size={20} aria-hidden="true" />
                    NSDL
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Connect your NSDL demat if your account is with NSDL instead of CDSL.
                    {demat.data?.nsdl.clientIdLast4 ? ` Linked ••••${demat.data.nsdl.clientIdLast4}` : ''}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${nsdlConnected ? statusToneClasses('success') : statusToneClasses('neutral')}`}>
                  {nsdlConnected ? 'Connected' : 'Not connected'}
                </span>
              </div>
              <div className="flex flex-1 flex-col space-y-4 p-5">
              <Field id="nsdl-dp" label="DP ID">
                <input id="nsdl-dp" className="field" placeholder="IN300000" value={nsdlDp} onChange={(e) => setNsdlDp(e.target.value)} />
              </Field>
              <Field id="nsdl-client" label="Client ID">
                <input
                  id="nsdl-client"
                  className="field"
                  placeholder="12345678"
                  value={nsdlClient}
                  onChange={(e) => setNsdlClient(e.target.value)}
                />
              </Field>
              <div className="mt-auto border-t border-outline-variant/25 pt-4">
              <button
                type="button"
                className={nsdlConnected ? 'btn-secondary w-full sm:w-auto' : 'btn-primary w-full sm:w-auto'}
                onClick={() => {
                  void (async () => {
                    setDematError('');
                    try {
                      if (nsdlConnected) {
                        await api.disconnectNsdl();
                        if (isPostHogConfigured) posthog.capture('demat_connection_changed', { provider: 'nsdl', action: 'disconnected' });
                      } else {
                        await api.connectNsdl(nsdlDp.trim(), nsdlClient.trim());
                        if (isPostHogConfigured) posthog.capture('demat_connection_changed', { provider: 'nsdl', action: 'connected' });
                      }
                      await demat.reload();
                      await profile.reload();
                    } catch (err) {
                      setDematError(errorMessage(err));
                    }
                  })();
                }}
              >
                {nsdlConnected ? 'Disconnect NSDL' : 'Connect NSDL'}
              </button>
              </div>
              </div>
            </section>
            </div>
            </div>
          </ProfilePanel>
        )}
          </div>
        </div>
      </QueryStatus>
    </div>
  );
}
