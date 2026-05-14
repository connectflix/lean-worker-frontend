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

function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function getReadableUrlLabel(value?: string | null): string {
  if (!value) return "Open link";

  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Open link";
  }
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
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
    conversation_date: form.conversation_date
      ? new Date(form.conversation_date).toISOString()
      : null,
    transcript: form.transcript.trim() || null,
    notes: form.notes.trim() || null,
  };
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
    <div className="stack" style={{ gap: 6 }}>
      <strong style={{ fontSize: 12 }}>{title}</strong>

      <div
        style={{
          maxHeight,
          overflowY: "auto",
          overflowX: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 13,
          lineHeight: 1.55,
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 12,
          background: "rgba(15,23,42,0.03)",
        }}
      >
        {value}
      </div>
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
          gap: 12,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">Worker conversations</div>
          <div className="muted">
            Review AI coach sessions and add external conversation material for{" "}
            <strong>{workerLabel}</strong>.
          </div>
        </div>

        <button
          className="button"
          type="button"
          onClick={onLoadConversations}
          disabled={!selectedWorkerId || loading}
        >
          {loading ? "Loading..." : "Load conversations"}
        </button>
      </div>

      {!selectedWorkerId ? (
        <div className="card">Select a worker to review conversations.</div>
      ) : null}

      {selectedWorkerId && !loading && !conversations ? (
        <div className="card">
          Conversations are not loaded yet. Click “Load conversations”.
        </div>
      ) : null}

      {selectedWorkerId && conversations ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(360px, 0.8fr)",
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
            <div className="card" style={{ minWidth: 0 }}>
              <div
                className="row space-between"
                style={{ alignItems: "flex-start", gap: 12 }}
              >
                <div>
                  <div className="section-title">Coach sessions</div>
                  <div className="muted">
                    {coachSessions.length} AI coaching session
                    {coachSessions.length > 1 ? "s" : ""} available.
                  </div>
                </div>
              </div>

              <div
                className="stack"
                style={{
                  gap: 10,
                  marginTop: 14,
                  maxHeight: 360,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 6,
                }}
              >
                {coachSessions.length === 0 ? (
                  <div className="muted">No coach session found for this worker.</div>
                ) : null}

                {coachSessions.map((session) => {
                  const isExpanded = expandedCoachSessionId === session.session_id;

                  return (
                    <div
                      key={session.session_id}
                      className="card-soft"
                      style={{ border: "1px solid var(--border)", minWidth: 0 }}
                    >
                      <div
                        className="row space-between"
                        style={{ gap: 12, alignItems: "flex-start" }}
                      >
                        <div className="stack" style={{ gap: 4, minWidth: 0 }}>
                          <strong>Session #{session.session_id}</strong>
                          <span className="muted">
                            {session.status} · {formatDateTime(session.started_at)}
                          </span>
                          {session.summary ? (
                            <span
                              style={{
                                fontSize: 13,
                                wordBreak: "break-word",
                                lineHeight: 1.5,
                              }}
                            >
                              {session.summary}
                            </span>
                          ) : null}
                        </div>

                        <button
                          className="button ghost"
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
                            marginTop: 12,
                            maxHeight: 420,
                            overflowY: "auto",
                            overflowX: "hidden",
                            paddingRight: 6,
                          }}
                        >
                          {session.transcript.length === 0 ? (
                            <div className="muted">No transcript available.</div>
                          ) : null}

                          {session.transcript.map((turn) => (
                            <div
                              key={turn.id}
                              style={{
                                padding: 10,
                                borderRadius: 12,
                                background:
                                  turn.speaker === "user"
                                    ? "rgba(15,23,42,0.04)"
                                    : "rgba(37,99,235,0.06)",
                              }}
                            >
                              <div
                                className="row space-between"
                                style={{ gap: 8, marginBottom: 4 }}
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
                                  lineHeight: 1.55,
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

            <div className="card" style={{ minWidth: 0 }}>
              <div className="section-title">External conversations</div>
              <div className="muted">
                {externalConversations.length} external conversation
                {externalConversations.length > 1 ? "s" : ""} captured manually.
              </div>

              <div
                className="stack"
                style={{
                  gap: 10,
                  marginTop: 14,
                  maxHeight: 620,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 6,
                }}
              >
                {externalConversations.length === 0 ? (
                  <div className="muted">
                    No external conversation has been added for this worker yet.
                  </div>
                ) : null}

                {externalConversations.map((conversation) => {
                  const isExpanded = expandedExternalConversationId === conversation.id;

                  return (
                    <div
                      key={conversation.id}
                      className="card-soft"
                      style={{ border: "1px solid var(--border)", minWidth: 0 }}
                    >
                      <div
                        className="row space-between"
                        style={{ gap: 12, alignItems: "flex-start" }}
                      >
                        <div className="stack" style={{ gap: 4, minWidth: 0 }}>
                          <strong style={{ wordBreak: "break-word" }}>
                            {conversation.title}
                          </strong>
                          <span className="muted">
                            {conversation.source_type}
                            {conversation.source_label
                              ? ` · ${conversation.source_label}`
                              : ""}{" "}
                            · {formatDateTime(conversation.conversation_date)}
                          </span>
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
                            className="button ghost"
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
                        <div className="stack" style={{ gap: 12, marginTop: 12 }}>
                          {conversation.video_url ? (
                            <div className="stack" style={{ gap: 6 }}>
                              <strong style={{ fontSize: 12 }}>Video URL</strong>

                              <a
                                href={conversation.video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="button ghost"
                                style={{
                                  width: "fit-content",
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  justifyContent: "flex-start",
                                }}
                                title={conversation.video_url}
                              >
                                Watch conversation
                              </a>
                            </div>
                          ) : null}

                          {conversation.file_path ? (
                            <div className="stack" style={{ gap: 6 }}>
                              <strong style={{ fontSize: 12 }}>File path</strong>
                              <div style={{ wordBreak: "break-word", fontSize: 13 }}>
                                {conversation.file_path}
                              </div>
                            </div>
                          ) : null}

                          <ScrollableTextBlock
                            title="Transcript"
                            value={conversation.transcript}
                            maxHeight={280}
                          />

                          <ScrollableTextBlock
                            title="Notes"
                            value={conversation.notes}
                            maxHeight={220}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {!selectedWorkerHasConversations ? (
              <div className="card-soft">
                No conversation material is available yet for this worker.
              </div>
            ) : null}
          </div>

          <form
            className="card stack"
            style={{
              gap: 12,
              minWidth: 0,
              maxHeight: "calc(100vh - 280px)",
              overflowY: "auto",
              overflowX: "hidden",
              position: "sticky",
              top: 78,
            }}
            onSubmit={handleSubmit}
          >
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
                  className="input"
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
                className="input"
                value={form.transcript}
                onChange={(event) => patchField("transcript", event.target.value)}
                placeholder="Paste transcript or conversation content..."
                rows={8}
                style={{
                  minHeight: 170,
                  maxHeight: 260,
                  overflowY: "auto",
                  resize: "vertical",
                  lineHeight: 1.55,
                }}
              />
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">Notes</span>
              <textarea
                className="input"
                value={form.notes}
                onChange={(event) => patchField("notes", event.target.value)}
                placeholder="Internal notes, observations, key signals..."
                rows={5}
                style={{
                  minHeight: 120,
                  maxHeight: 220,
                  overflowY: "auto",
                  resize: "vertical",
                  lineHeight: 1.55,
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
                paddingTop: 10,
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(10px)",
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