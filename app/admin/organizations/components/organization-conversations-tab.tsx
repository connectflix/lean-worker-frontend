"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AdminOrganizationWorkerConversations,
  AdminOrganizationWorkerSummary,
  AdminWorkerConversation,
  AdminWorkerConversationCreate,
  AdminWorkerConversationUpdate,
} from "@/lib/types";

type ConversationFormState = {
  title: string;
  source_type: string;
  source_label: string;
  video_url: string;
  file_path: string;
  conversation_date: string;
  transcript: string;
  notes: string;
};

type OrganizationConversationsTabProps = {
  selectedWorkerId: number | null;
  selectedWorkerSummary: AdminOrganizationWorkerSummary | null;
  conversations: AdminOrganizationWorkerConversations | null;
  loading: boolean;
  saving: boolean;
  editingExternalConversation: AdminWorkerConversation | null;
  onLoadConversations: () => void;
  onCreateExternalConversation: (
    payload: Omit<AdminWorkerConversationCreate, "worker_id">,
  ) => void;
  onUpdateExternalConversation: (
    conversationId: number,
    payload: AdminWorkerConversationUpdate,
  ) => void;
  onDeleteExternalConversation: (conversationId: number) => void;
  onEditExternalConversation: (conversation: AdminWorkerConversation) => void;
  onCancelEditExternalConversation: () => void;
};

const EMPTY_FORM: ConversationFormState = {
  title: "",
  source_type: "manual",
  source_label: "",
  video_url: "",
  file_path: "",
  conversation_date: "",
  transcript: "",
  notes: "",
};

function hasExplicitTimezone(value: string): boolean {
  return /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
}

function formatNaiveDateTime(value: string): string | null {
  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
  const match = normalizedValue.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (!match) return null;

  const [, year, month, day, hour, minute] = match;

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");

  if (!hasExplicitTimezone(normalizedValue)) {
    const naiveLabel = formatNaiveDateTime(normalizedValue);
    if (naiveLabel) return naiveLabel;
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("fr-BE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return "";

  const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");

  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(normalizedValue) &&
    !hasExplicitTimezone(normalizedValue)
  ) {
    return normalizedValue.slice(0, 16);
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function buildFormFromConversation(
  conversation: AdminWorkerConversation | null,
): ConversationFormState {
  if (!conversation) return EMPTY_FORM;

  return {
    title: conversation.title || "",
    source_type: conversation.source_type || "manual",
    source_label: conversation.source_label || "",
    video_url: conversation.video_url || "",
    file_path: conversation.file_path || "",
    conversation_date: toDateTimeLocalValue(conversation.conversation_date),
    transcript: conversation.transcript || "",
    notes: conversation.notes || "",
  };
}

function buildPayloadFromForm(
  form: ConversationFormState,
): Omit<AdminWorkerConversationCreate, "worker_id"> {
  return {
    title: form.title.trim(),
    source_type: form.source_type.trim() || "manual",
    source_label: form.source_label.trim() || null,
    video_url: form.video_url.trim() || null,
    file_path: form.file_path.trim() || null,
    conversation_date: form.conversation_date ? `${form.conversation_date}:00` : null,
    transcript: form.transcript.trim() || null,
    notes: form.notes.trim() || null,
  };
}

function getTextPreview(value?: string | null, maxLength = 120): string {
  const text = (value || "").trim().replace(/\s+/g, " ");

  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}…`;
}

function getConversationSourceLabel(conversation: AdminWorkerConversation): string {
  const parts = [
    conversation.source_type || "manual",
    conversation.source_label || null,
    formatDateTime(conversation.conversation_date),
  ].filter(Boolean);

  return parts.join(" · ");
}

function ScrollableTextBlock({
  title,
  value,
  maxHeight = 260,
}: {
  title: string;
  value?: string | null;
  maxHeight?: number;
}) {
  if (!value) return null;

  return (
    <div className="stack" style={{ gap: 7 }}>
      <div
        className="row space-between"
        style={{
          gap: 8,
          alignItems: "center",
        }}
      >
        <strong
          style={{
            fontSize: 12,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </strong>

        <span className="badge" style={{ fontSize: 11, padding: "5px 8px" }}>
          {value.length} chars
        </span>
      </div>

      <div
        style={{
          maxHeight,
          overflowY: "auto",
          overflowX: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 13,
          lineHeight: 1.6,
          border: "1px solid var(--admin-border, var(--border))",
          borderRadius: 14,
          padding: 12,
          background: "#ffffff",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="card-soft stack"
      style={{
        gap: 6,
        background: "rgba(255,255,255,0.72)",
        border: "1px dashed var(--admin-border, var(--border))",
      }}
    >
      <div style={{ fontWeight: 750, letterSpacing: "-0.02em" }}>{title}</div>
      <div className="muted">{description}</div>
    </div>
  );
}

export function OrganizationConversationsTab({
  selectedWorkerId,
  selectedWorkerSummary,
  conversations,
  loading,
  saving,
  editingExternalConversation,
  onLoadConversations,
  onCreateExternalConversation,
  onUpdateExternalConversation,
  onDeleteExternalConversation,
  onEditExternalConversation,
  onCancelEditExternalConversation,
}: OrganizationConversationsTabProps) {
  const [form, setForm] = useState<ConversationFormState>(EMPTY_FORM);
  const [expandedCoachSessionId, setExpandedCoachSessionId] = useState<number | null>(null);
  const [expandedExternalConversationId, setExpandedExternalConversationId] =
    useState<number | null>(null);

  const workerLabel = selectedWorkerSummary?.worker
    ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
    : "No worker selected";

  const coachSessions = conversations?.coach_sessions ?? [];
  const externalConversations = conversations?.external_conversations ?? [];

  const selectedWorkerHasConversations = useMemo(() => {
    return coachSessions.length > 0 || externalConversations.length > 0;
  }, [coachSessions.length, externalConversations.length]);

  useEffect(() => {
    setForm(buildFormFromConversation(editingExternalConversation));
  }, [editingExternalConversation]);

  function patchField<K extends keyof ConversationFormState>(
    key: K,
    value: ConversationFormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    onCancelEditExternalConversation();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const payload = buildPayloadFromForm(form);

    if (!payload.title) {
      return;
    }

    if (editingExternalConversation) {
      onUpdateExternalConversation(editingExternalConversation.id, payload);
      return;
    }

    onCreateExternalConversation(payload);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="stack" style={{ gap: 16, minWidth: 0 }}>
      <div
        className="card-soft"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "flex-start",
          flexWrap: "wrap",
          background: "rgba(255,255,255,0.76)",
          border: "1px solid var(--admin-border, var(--border))",
        }}
      >
        <div className="stack" style={{ gap: 8, minWidth: 0 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="badge primary">Conversations</span>
            {selectedWorkerId ? <span className="badge">{workerLabel}</span> : null}
          </div>

          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Worker conversations</div>
            <div className="muted">
              Review AI coach sessions and add external conversation material for{" "}
              <strong>{workerLabel}</strong>.
            </div>
          </div>
        </div>

        <button
          className="button"
          type="button"
          onClick={onLoadConversations}
          disabled={!selectedWorkerId || loading}
        >
          {loading ? "Loading..." : conversations ? "Refresh conversations" : "Load conversations"}
        </button>
      </div>

      {!selectedWorkerId ? (
        <EmptyState
          title="No worker selected"
          description="Select a worker first to review coach sessions and external conversations."
        />
      ) : null}

      {selectedWorkerId && !loading && !conversations ? (
        <EmptyState
          title="Conversations not loaded"
          description="Click “Load conversations” to fetch coach sessions and manually captured conversations."
        />
      ) : null}

      {selectedWorkerId && conversations ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.18fr) minmax(360px, 0.82fr)",
            gap: 16,
            alignItems: "start",
            minWidth: 0,
          }}
        >
          <div
            className="stack"
            style={{
              gap: 16,
              minWidth: 0,
              maxHeight: "calc(100vh - 280px)",
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: 6,
            }}
          >
            <div className="card stack" style={{ gap: 14, minWidth: 0 }}>
              <div
                className="row space-between"
                style={{ alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Coach sessions</div>
                  <div className="muted">
                    {coachSessions.length} AI coaching session
                    {coachSessions.length > 1 ? "s" : ""} available.
                  </div>
                </div>

                <span className="badge">{coachSessions.length} session(s)</span>
              </div>

              <div
                className="stack"
                style={{
                  gap: 10,
                  maxHeight: 380,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 6,
                }}
              >
                {coachSessions.length === 0 ? (
                  <EmptyState
                    title="No coach session"
                    description="No AI coach session was found for this worker."
                  />
                ) : null}

                {coachSessions.map((session) => {
                  const isExpanded = expandedCoachSessionId === session.session_id;
                  const transcriptCount = session.transcript.length;

                  return (
                    <div
                      key={session.session_id}
                      className="card-soft stack"
                      style={{
                        gap: 10,
                        border: isExpanded
                          ? "1px solid var(--admin-accent, var(--primary))"
                          : "1px solid var(--admin-border, var(--border))",
                        background: "#ffffff",
                        minWidth: 0,
                      }}
                    >
                      <div
                        className="row space-between"
                        style={{ gap: 12, alignItems: "flex-start" }}
                      >
                        <div className="stack" style={{ gap: 6, minWidth: 0 }}>
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">session #{session.session_id}</span>
                            <span className="badge">{session.status}</span>
                            <span className="badge">{transcriptCount} turn(s)</span>
                          </div>

                          <strong
                            style={{
                              letterSpacing: "-0.02em",
                              wordBreak: "break-word",
                            }}
                          >
                            AI coaching session
                          </strong>

                          <span className="muted">
                            Started: {formatDateTime(session.started_at)}
                          </span>

                          {session.summary ? (
                            <span
                              style={{
                                fontSize: 13,
                                wordBreak: "break-word",
                                lineHeight: 1.55,
                              }}
                            >
                              {getTextPreview(session.summary, isExpanded ? 220 : 140)}
                            </span>
                          ) : (
                            <span className="muted">No summary available.</span>
                          )}
                        </div>

                        <button
                          className={isExpanded ? "button" : "button ghost"}
                          type="button"
                          onClick={() =>
                            setExpandedCoachSessionId(isExpanded ? null : session.session_id)
                          }
                        >
                          {isExpanded ? "Hide" : "Open"}
                        </button>
                      </div>

                      {isExpanded ? (
                        <div
                          className="stack"
                          style={{
                            gap: 8,
                            maxHeight: 440,
                            overflowY: "auto",
                            overflowX: "hidden",
                            paddingRight: 6,
                            borderTop: "1px solid var(--admin-border, var(--border))",
                            paddingTop: 10,
                          }}
                        >
                          {session.transcript.length === 0 ? (
                            <div className="muted">No transcript available.</div>
                          ) : null}

                          {session.transcript.map((turn) => (
                            <div
                              key={turn.id}
                              style={{
                                padding: 12,
                                borderRadius: 14,
                                border: "1px solid var(--admin-border, var(--border))",
                                background:
                                  turn.speaker === "user"
                                    ? "rgba(17,24,39,0.035)"
                                    : "rgba(94,106,210,0.055)",
                              }}
                            >
                              <div
                                className="row space-between"
                                style={{ gap: 8, marginBottom: 6 }}
                              >
                                <strong style={{ fontSize: 12 }}>
                                  {turn.speaker === "user" ? "Worker" : "Coach"}
                                </strong>

                                <span className="muted" style={{ fontSize: 12 }}>
                                  {formatDateTime(turn.created_at)}
                                </span>
                              </div>

                              <div
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  fontSize: 13,
                                  lineHeight: 1.6,
                                }}
                              >
                                {turn.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card stack" style={{ gap: 14, minWidth: 0 }}>
              <div
                className="row space-between"
                style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">External conversations</div>
                  <div className="muted">
                    {externalConversations.length} external conversation
                    {externalConversations.length > 1 ? "s" : ""} captured manually.
                  </div>
                </div>

                <span className="badge">{externalConversations.length} captured</span>
              </div>

              <div
                className="stack"
                style={{
                  gap: 10,
                  maxHeight: 640,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 6,
                }}
              >
                {externalConversations.length === 0 ? (
                  <EmptyState
                    title="No external conversation"
                    description="No external conversation has been added for this worker yet."
                  />
                ) : null}

                {externalConversations.map((conversation) => {
                  const isExpanded = expandedExternalConversationId === conversation.id;
                  const preview =
                    getTextPreview(conversation.notes, 130) ||
                    getTextPreview(conversation.transcript, 130);

                  return (
                    <div
                      key={conversation.id}
                      className="card-soft stack"
                      style={{
                        gap: 10,
                        border: isExpanded
                          ? "1px solid var(--admin-accent, var(--primary))"
                          : "1px solid var(--admin-border, var(--border))",
                        background: "#ffffff",
                        minWidth: 0,
                      }}
                    >
                      <div
                        className="row space-between"
                        style={{ gap: 12, alignItems: "flex-start" }}
                      >
                        <div className="stack" style={{ gap: 6, minWidth: 0 }}>
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">#{conversation.id}</span>
                            <span className="badge">{conversation.source_type || "manual"}</span>
                            {conversation.video_url ? (
                              <span className="badge primary">video</span>
                            ) : null}
                            {conversation.transcript ? (
                              <span className="badge">transcript</span>
                            ) : null}
                            {conversation.notes ? <span className="badge">notes</span> : null}
                          </div>

                          <strong
                            style={{
                              wordBreak: "break-word",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {conversation.title}
                          </strong>

                          <span className="muted">
                            {getConversationSourceLabel(conversation)}
                          </span>

                          {preview ? (
                            <span
                              className="muted"
                              style={{
                                fontSize: 13,
                                lineHeight: 1.55,
                                wordBreak: "break-word",
                              }}
                            >
                              {preview}
                            </span>
                          ) : null}
                        </div>

                        <div
                          className="row"
                          style={{
                            gap: 8,
                            flexWrap: "wrap",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className={isExpanded ? "button" : "button ghost"}
                            type="button"
                            onClick={() =>
                              setExpandedExternalConversationId(
                                isExpanded ? null : conversation.id,
                              )
                            }
                          >
                            {isExpanded ? "Hide" : "Open"}
                          </button>

                          <button
                            className="button ghost"
                            type="button"
                            onClick={() => onEditExternalConversation(conversation)}
                          >
                            Edit
                          </button>

                          <button
                            className="button ghost"
                            type="button"
                            onClick={() => onDeleteExternalConversation(conversation.id)}
                            disabled={saving}
                            style={{ color: "var(--danger)" }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div
                          className="stack"
                          style={{
                            gap: 12,
                            borderTop: "1px solid var(--admin-border, var(--border))",
                            paddingTop: 12,
                          }}
                        >
                          {conversation.video_url ? (
                            <div className="stack" style={{ gap: 6 }}>
                              <strong style={{ fontSize: 12 }}>Video</strong>

                              <a
                                href={conversation.video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="button ghost"
                                style={{
                                  width: "fit-content",
                                }}
                                title="Open video in a new tab"
                              >
                                Watch video
                              </a>
                            </div>
                          ) : null}

                          {conversation.file_path ? (
                            <div className="stack" style={{ gap: 6 }}>
                              <strong style={{ fontSize: 12 }}>File path</strong>
                              <div
                                style={{
                                  wordBreak: "break-word",
                                  fontSize: 13,
                                  border: "1px solid var(--admin-border, var(--border))",
                                  borderRadius: 12,
                                  padding: 10,
                                  background: "rgba(17,24,39,0.025)",
                                }}
                              >
                                {conversation.file_path}
                              </div>
                            </div>
                          ) : null}

                          <ScrollableTextBlock
                            title="Transcript"
                            value={conversation.transcript}
                            maxHeight={300}
                          />

                          <ScrollableTextBlock
                            title="Notes"
                            value={conversation.notes}
                            maxHeight={240}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {!selectedWorkerHasConversations ? (
              <EmptyState
                title="No conversation material"
                description="This worker has no AI session transcript and no external conversation material yet."
              />
            ) : null}
          </div>

          <form
            className="card stack"
            style={{
              gap: 14,
              minWidth: 0,
              maxHeight: "calc(100vh - 280px)",
              overflowY: "auto",
              overflowX: "hidden",
              position: "sticky",
              top: 78,
            }}
            onSubmit={handleSubmit}
          >
            <div
              className="stack"
              style={{
                gap: 8,
                paddingBottom: 4,
                borderBottom: "1px solid var(--admin-border, var(--border))",
              }}
            >
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className={editingExternalConversation ? "badge primary" : "badge"}>
                  {editingExternalConversation ? "editing" : "new"}
                </span>
                {editingExternalConversation ? (
                  <span className="badge">#{editingExternalConversation.id}</span>
                ) : null}
              </div>

              <div>
                <div className="section-title">
                  {editingExternalConversation
                    ? "Edit external conversation"
                    : "Add external conversation"}
                </div>
                <div className="muted">
                  Add notes, transcript, video link, meeting context, or imported conversation
                  material.
                </div>
              </div>
            </div>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">Title</span>
              <input
                className="input"
                value={form.title}
                onChange={(event) => patchField("title", event.target.value)}
                placeholder="Example: Initial discovery call"
                required
              />
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Source type</span>
                <select
                  className="select"
                  value={form.source_type}
                  onChange={(event) => patchField("source_type", event.target.value)}
                >
                  <option value="manual">Manual</option>
                  <option value="meeting">Meeting</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="url">URL</option>
                  <option value="upload">Upload</option>
                  <option value="note">Note</option>
                </select>
              </label>

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Source label</span>
                <input
                  className="input"
                  value={form.source_label}
                  onChange={(event) => patchField("source_label", event.target.value)}
                  placeholder="Example: Zoom, Teams, YouTube"
                />
              </label>
            </div>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">Conversation date</span>
              <input
                className="input"
                type="datetime-local"
                value={form.conversation_date}
                onChange={(event) => patchField("conversation_date", event.target.value)}
              />
              <span className="muted" style={{ fontSize: 12 }}>
                Stored without timezone conversion to preserve the exact local date and time.
              </span>
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">Video URL</span>
              <input
                className="input"
                value={form.video_url}
                onChange={(event) => patchField("video_url", event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">File path</span>
              <input
                className="input"
                value={form.file_path}
                onChange={(event) => patchField("file_path", event.target.value)}
                placeholder="/uploads/conversation..."
              />
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">Transcript</span>
              <textarea
                className="textarea"
                value={form.transcript}
                onChange={(event) => patchField("transcript", event.target.value)}
                placeholder="Paste transcript or conversation content..."
                rows={8}
                style={{
                  minHeight: 170,
                  maxHeight: 280,
                  overflowY: "auto",
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">Notes</span>
              <textarea
                className="textarea"
                value={form.notes}
                onChange={(event) => patchField("notes", event.target.value)}
                placeholder="Internal notes, observations, key signals..."
                rows={5}
                style={{
                  minHeight: 120,
                  maxHeight: 240,
                  overflowY: "auto",
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
            </label>

            <div
              className="row"
              style={{
                gap: 8,
                justifyContent: "flex-end",
                position: "sticky",
                bottom: 0,
                paddingTop: 12,
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "saturate(180%) blur(14px)",
                borderTop: "1px solid var(--admin-border, var(--border))",
              }}
            >
              {editingExternalConversation ? (
                <button
                  className="button ghost"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              ) : null}

              <button
                className="button"
                type="submit"
                disabled={saving || !selectedWorkerId || !form.title.trim()}
              >
                {saving
                  ? "Saving..."
                  : editingExternalConversation
                    ? "Update conversation"
                    : "Add conversation"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}