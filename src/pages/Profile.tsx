import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Buildings, CheckCircle, Envelope, Eye, EyeSlash, Lock, Phone, User } from '@phosphor-icons/react';
import { Field, InlineNotice, PageHeader, QueryStatus } from '../components/ui';
import { api, errorMessage } from '../api';
import type { NomineeRelationship } from '../api/types';
import { useApi } from '../hooks/useApi';
import posthog, { isPostHogConfigured } from '../posthog';

const tabs = [
  { id: 'details', label: 'Your details' },
  { id: 'password', label: 'Password' },
  { id: 'kyc', label: 'KYC' },
  { id: 'nominee', label: 'Nominee' },
  { id: 'demat', label: 'CDSL & NSDL' },
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

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Profile"
        description="Update your details, password, KYC, nominee, and connect your CDSL or NSDL demat account."
      />

      <QueryStatus loading={loading && !profile.data} error={loadError}>
        <div className="card mb-6 flex items-center gap-4 p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-lg font-semibold text-on-primary-container">
            {initials(name || profile.data?.email || 'PK')}
          </span>
          <div>
            <p className="font-medium">{name || profile.data?.email}</p>
            <p className="text-sm text-on-surface-variant">
              KYC: {kycStatus} · Nominee: {nominee.data?.name ?? 'Not added'} · CDSL:{' '}
              {cdslConnected ? 'Connected' : 'Not connected'} · NSDL: {nsdlConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>

        <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-surface-container-low p-1" role="tablist" aria-label="Profile sections">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`min-h-10 cursor-pointer whitespace-nowrap rounded-md px-3 text-sm font-medium transition duration-200 ${
                tab === item.id
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'details' && (
          <form className="card space-y-5 p-5" onSubmit={(e) => void onSaveDetails(e)}>
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
            <button className="btn-primary" type="submit">
              Save details
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form className="card space-y-5 p-5" onSubmit={(e) => void onChangePassword(e)}>
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
            <button className="btn-primary" type="submit">
              Update password
            </button>
          </form>
        )}

        {tab === 'kyc' && (
          <form className="card space-y-5 p-5" onSubmit={(e) => void onSubmitKyc(e)}>
            <p className="text-sm text-on-surface-variant">
              KYC confirms who you are so you can buy and sell. Enter the same PAN and Aadhaar linked to your demat account.
            </p>
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
            <button className="btn-primary" type="submit">
              Submit KYC
            </button>
          </form>
        )}

        {tab === 'nominee' && (
          <form className="card space-y-5 p-5" onSubmit={(e) => void onSaveNominee(e)}>
            <p className="text-sm text-on-surface-variant">
              A nominee is the person who receives your PreIPOKart holdings if something happens to you. You can change this later.
            </p>
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
            <button className="btn-primary" type="submit">
              Save nominee
            </button>
          </form>
        )}

        {tab === 'demat' && (
          <div className="space-y-4">
            {dematError ? <InlineNotice tone="error">{dematError}</InlineNotice> : null}
            <section className="card space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
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
                <span className="rounded-md border border-on-surface/15 px-2 py-1 text-xs">
                  {cdslConnected ? 'Connected' : 'Not connected'}
                </span>
              </div>
              <Field id="cdsl-dp" label="DP ID">
                <input id="cdsl-dp" className="field" placeholder="12000000" value={cdslDp} onChange={(e) => setCdslDp(e.target.value)} />
              </Field>
              <Field id="cdsl-bo" label="BO ID (16 digits)">
                <input id="cdsl-bo" className="field" placeholder="1200000000000000" value={cdslBo} onChange={(e) => setCdslBo(e.target.value)} />
              </Field>
              <button
                type="button"
                className={cdslConnected ? 'btn-secondary' : 'btn-primary'}
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
            </section>

            <section className="card space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
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
                <span className="rounded-md border border-on-surface/15 px-2 py-1 text-xs">
                  {nsdlConnected ? 'Connected' : 'Not connected'}
                </span>
              </div>
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
              <button
                type="button"
                className={nsdlConnected ? 'btn-secondary' : 'btn-primary'}
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
            </section>
          </div>
        )}
      </QueryStatus>
    </div>
  );
}
