import { useMemo, useState } from 'react';
import { ArrowRight, Briefcase, MapPin } from '@phosphor-icons/react';
import { ApplyJobDialog } from '../components/ApplyJobDialog';
import { PageHeader } from '../components/ui';
import { readApplications } from '../data/applications';
import { careersEmail, jobs, teams, type Job } from '../data/jobs';

export default function Careers() {
  const [team, setTeam] = useState<(typeof teams)[number]['id']>('all');
  const [openId, setOpenId] = useState<string | null>(jobs[0]?.id ?? null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [appliedTick, setAppliedTick] = useState(0);

  const rows = useMemo(() => (team === 'all' ? jobs : jobs.filter((job) => job.team === team)), [team]);
  const appliedIds = useMemo(() => new Set(readApplications().map((row) => row.jobId)), [appliedTick]);

  return (
    <div>
      <PageHeader
        title="Careers"
        description="Open roles at the PreIPOKart desk in India. Dummy listings for the marketing site. Write to us if a role fits."
      />

      <p className="mb-5 text-sm text-on-surface-variant">
        {rows.length} {rows.length === 1 ? 'role' : 'roles'}
        {team !== 'all' ? ` in ${teams.find((t) => t.id === team)?.label}` : ''}
      </p>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Team">
        {teams.map((tab) => {
          const pressed = team === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => setTeam(tab.id)}
              className={`min-h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3 font-label-caps text-[11px] uppercase transition-colors ${
                pressed
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="font-headline-sm text-lg text-on-surface">No open roles in this team</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Pick All teams, or email {careersEmail} with the desk you want to join.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((job) => {
            const open = openId === job.id;
            const teamLabel = teams.find((t) => t.id === job.team)?.label ?? job.team;
            return (
              <li key={job.id} className="card overflow-hidden">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-start justify-between gap-4 p-5 text-left sm:p-6"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : job.id)}
                >
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-headline-sm text-xl text-on-surface">{job.title}</span>
                      <span className="rounded-md bg-surface-container-high px-2 py-0.5 font-label-caps text-[10px] uppercase text-on-surface-variant">
                        {teamLabel}
                      </span>
                    </span>
                    <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} aria-hidden="true" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase size={14} aria-hidden="true" />
                        {job.type}
                      </span>
                      <span>Posted {job.posted}</span>
                    </span>
                    <span className="mt-2 block max-w-[70ch] text-sm text-on-surface-variant">{job.summary}</span>
                  </span>
                  <span className="shrink-0 pt-1 text-sm text-primary">{open ? 'Hide' : 'View'}</span>
                </button>

                {open ? (
                  <div className="border-t border-outline-variant/40 px-5 pb-5 sm:px-6 sm:pb-6">
                    <p className="mt-4 font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant">
                      What you will do
                    </p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-on-surface">
                      {job.work.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className="btn-primary min-h-11"
                        onClick={() => setApplyJob(job)}
                      >
                        Apply
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                      {appliedIds.has(job.id) ? (
                        <span className="text-sm text-secondary-container">Applied from this browser</span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Opens a form for your details and resume. Dummy hiring flow, not a live ATS.
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-sm text-on-surface-variant">
        Nothing listed that fits? Write to{' '}
        <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${careersEmail}`}>
          {careersEmail}
        </a>{' '}
        with the team you want.
      </p>

      {applyJob ? (
        <ApplyJobDialog
          job={applyJob}
          onClose={() => {
            setApplyJob(null);
            setAppliedTick((n) => n + 1);
          }}
        />
      ) : null}
    </div>
  );
}
