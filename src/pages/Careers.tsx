import { useMemo, useState } from 'react';
import { ArrowRight, Briefcase, MapPin } from '@phosphor-icons/react';
import { ApplyJobDialog } from '../components/ApplyJobDialog';
import { PageHeader, QueryStatus } from '../components/ui';
import { api } from '../api';
import type { Job } from '../api/types';
import { useApi } from '../hooks/useApi';

const careersEmail = 'careers@preipokart.in';

export default function Careers() {
  const [team, setTeam] = useState('all');
  const { data, error, loading } = useApi(() => api.listJobs(team), [team]);
  const jobs = data?.data ?? [];
  const teams = [{ id: 'all', label: 'All teams' }, ...(data?.meta.teams ?? [])];
  const [openId, setOpenId] = useState<string | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const rows = jobs;
  const teamLabel = useMemo(() => teams.find((t) => t.id === team)?.label, [team, teams]);

  return (
    <div>
      <PageHeader
        title="Careers"
        description="Open roles at the PreIPOKart desk in India. Write to us if a role fits."
      />

      <QueryStatus loading={loading && !data} error={error}>
        <p className="mb-5 text-sm text-on-surface-variant">
          {rows.length} {rows.length === 1 ? 'role' : 'roles'}
          {team !== 'all' ? ` in ${teamLabel}` : ''}
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
              const jobTeamLabel = teams.find((t) => t.id === job.team)?.label ?? job.team;
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
                          {jobTeamLabel}
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
                        {job.posted ? <span>Posted {job.posted}</span> : null}
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
                        {(job.work ?? []).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button type="button" className="btn-primary min-h-11" onClick={() => setApplyJob(job)}>
                          Apply
                          <ArrowRight size={16} aria-hidden="true" />
                        </button>
                        {appliedIds.has(job.id) ? (
                          <span className="text-sm text-secondary-container">Applied</span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </QueryStatus>

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
          onClose={() => setApplyJob(null)}
          onApplied={(id) => setAppliedIds((prev) => new Set(prev).add(id))}
        />
      ) : null}
    </div>
  );
}
