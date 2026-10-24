import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ChatCircleDots, PaperPlaneTilt, Plus } from '@phosphor-icons/react';
import { Field, InlineNotice, PageHeader, QueryStatus } from '../components/ui';
import { api, errorMessage } from '../api';
import type { SupportTicketDetail, SupportTicketSummary } from '../api';

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

function statusClass(status: string) {
  if (status === 'open') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (status === 'in_progress') return 'bg-amber-50 text-amber-900 border-amber-200';
  if (status === 'resolved') return 'bg-slate-100 text-slate-700 border-slate-200';
  return 'bg-slate-200 text-slate-600 border-slate-300';
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function Support() {
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportTicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newBusy, setNewBusy] = useState(false);
  const [newError, setNewError] = useState('');

  const [reply, setReply] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState('');

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const res = await api.listSupportTickets();
      setTickets(res.data);
      if (res.data.length > 0 && !selectedId) {
        setSelectedId(res.data[0].id);
      }
    } catch (err) {
      setListError(errorMessage(err, 'Could not load your tickets.'));
    } finally {
      setListLoading(false);
    }
  }, [selectedId]);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailError('');
    try {
      const data = await api.getSupportTicket(id);
      setDetail(data);
    } catch (err) {
      setDetail(null);
      setDetailError(errorMessage(err, 'Could not load this ticket.'));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const subject = newSubject.trim();
    const message = newMessage.trim();
    if (!subject || !message) {
      setNewError('Subject and message are required.');
      return;
    }
    setNewBusy(true);
    setNewError('');
    try {
      const { ticketId } = await api.createSupportTicket({ subject, message });
      setShowNew(false);
      setNewSubject('');
      setNewMessage('');
      await loadList();
      setSelectedId(ticketId);
    } catch (err) {
      setNewError(errorMessage(err, 'Could not create ticket.'));
    } finally {
      setNewBusy(false);
    }
  };

  const handleReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || !detail) return;
    const message = reply.trim();
    if (!message) {
      setReplyError('Write a message before sending.');
      return;
    }
    setReplyBusy(true);
    setReplyError('');
    try {
      await api.replySupportTicket(selectedId, message);
      setReply('');
      await loadDetail(selectedId);
      await loadList();
    } catch (err) {
      setReplyError(errorMessage(err, 'Could not send reply.'));
    } finally {
      setReplyBusy(false);
    }
  };

  const threadClosed = detail?.status === 'closed' || detail?.status === 'resolved';

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Support desk"
        description="Submit a query and follow the conversation with our team. This inbox is separate from the public contact form."
        actions={
          <button type="button" className="btn-primary min-h-10 gap-2" onClick={() => setShowNew(true)}>
            <Plus size={18} weight="bold" aria-hidden="true" />
            New ticket
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        <aside className="card flex flex-col overflow-hidden p-0">
          <div className="border-b border-outline-variant/40 px-4 py-3 text-sm font-medium">Your tickets</div>
          <QueryStatus loading={listLoading} error={listError}>
            {tickets.length === 0 ? (
              <p className="p-4 text-sm text-on-surface-variant">No tickets yet. Open one to ask the desk a question.</p>
            ) : (
              <ul className="max-h-[min(420px,50vh)] divide-y divide-outline-variant/30 overflow-y-auto">
                {tickets.map((t) => {
                  const active = t.id === selectedId;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors ${
                          active ? 'bg-[#0f4a3d]/8' : 'hover:bg-surface-container-low'
                        }`}
                        onClick={() => setSelectedId(t.id)}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="line-clamp-2 text-sm font-medium">{t.subject}</span>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass(t.status)}`}
                          >
                            {STATUS_LABEL[t.status] ?? t.status}
                          </span>
                        </span>
                        {t.lastMessagePreview ? (
                          <span className="line-clamp-1 text-xs text-on-surface-variant">{t.lastMessagePreview}</span>
                        ) : null}
                        <span className="text-[11px] text-on-surface-variant">{formatWhen(t.updatedAt)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </QueryStatus>
        </aside>

        <section className="card flex min-h-[min(480px,60vh)] flex-col p-0">
          {!selectedId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-on-surface-variant">
              <ChatCircleDots size={40} className="text-primary/60" aria-hidden="true" />
              <p className="text-sm">Select a ticket or create a new one.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-outline-variant/40 px-5 py-4">
                <QueryStatus loading={detailLoading && !detail} error={detailError}>
                  {detail ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-headline-sm text-lg">{detail.subject}</h2>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass(detail.status)}`}
                        >
                          {STATUS_LABEL[detail.status] ?? detail.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant">Ticket {detail.id}</p>
                    </>
                  ) : null}
                </QueryStatus>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
                {detailLoading && detail ? (
                  <p className="text-xs text-on-surface-variant">Refreshing…</p>
                ) : null}
                {detail?.messages.map((msg) => {
                  const fromDesk = msg.authorType === 'staff';
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${
                        fromDesk
                          ? 'mr-auto bg-surface-container-low text-on-surface'
                          : 'ml-auto bg-[#0f4a3d] text-white'
                      }`}
                    >
                      <div className="mb-1 text-[11px] font-medium opacity-80">
                        {fromDesk ? 'PreIPOKart desk' : 'You'} · {formatWhen(msg.createdAt)}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    </div>
                  );
                })}
              </div>

              {detail && !threadClosed ? (
                <form className="border-t border-outline-variant/40 p-4" onSubmit={(e) => void handleReply(e)}>
                  {replyError ? <InlineNotice tone="error">{replyError}</InlineNotice> : null}
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <Field id="support-reply" label="Reply">
                      <textarea
                        id="support-reply"
                        className="field min-h-[72px] resize-y py-2"
                        rows={2}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Add details for the desk…"
                      />
                      </Field>
                    </div>
                    <button type="submit" className="btn-primary min-h-11 shrink-0 gap-2" disabled={replyBusy}>
                      <PaperPlaneTilt size={18} aria-hidden="true" />
                      {replyBusy ? 'Sending…' : 'Send'}
                    </button>
                  </div>
                </form>
              ) : detail && threadClosed ? (
                <p className="border-t border-outline-variant/40 p-4 text-sm text-on-surface-variant">
                  This ticket is {STATUS_LABEL[detail.status]?.toLowerCase() ?? detail.status}. Start a new ticket if
                  you need more help.
                </p>
              ) : null}
            </>
          )}
        </section>
      </div>

      {showNew ? (
        <div
          className="fixed inset-0 z-modal flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-ticket-title"
          onClick={() => setShowNew(false)}
        >
          <form
            className="card flex w-full max-w-lg flex-col gap-4 p-5 sm:p-6"
            onSubmit={(e) => void handleCreate(e)}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="new-ticket-title" className="font-headline-sm text-xl">
              New support ticket
            </h2>
            {newError ? <InlineNotice tone="error">{newError}</InlineNotice> : null}
            <Field id="new-subject" label="Subject">
              <input
                id="new-subject"
                className="field"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Order settlement question"
                required
              />
            </Field>
            <Field id="new-message" label="Message">
              <textarea
                id="new-message"
                className="field min-h-32 resize-y py-3"
                rows={5}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn-primary min-h-11" disabled={newBusy}>
                {newBusy ? 'Submitting…' : 'Submit ticket'}
              </button>
              <button type="button" className="btn-secondary min-h-11" onClick={() => setShowNew(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
