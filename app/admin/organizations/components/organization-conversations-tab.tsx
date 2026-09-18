"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getOrganizationConversationsCopy,
  type OrganizationConversationsCopy,
} from "@/lib/i18n/organization-conversations";
import type {
  AdminOrganizationWorkerConversations,
  AdminOrganizationWorkerSummary,
  AdminWorkerConversation,
  AdminWorkerConversationCreate,
  AdminWorkerConversationUpdate,
} from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

type ConversationFormState = {
  title: string;
  source_type: string;
  source_label: string;
  secret_code: string;
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
  onLoadConversations: () => void | Promise<void>;
  onCreateExternalConversation: (
    payload: Omit<AdminWorkerConversationCreate, "worker_id">,
  ) => void | Promise<void>;
  onUpdateExternalConversation: (
    conversationId: number,
    payload: AdminWorkerConversationUpdate,
  ) => void | Promise<void>;
  onDeleteExternalConversation: (conversationId: number) => void | Promise<void>;
  onEditExternalConversation: (conversation: AdminWorkerConversation) => void;
  onCancelEditExternalConversation: () => void;
};

const EMPTY_FORM: ConversationFormState = {
  title: "",
  source_type: "video",
  source_label: "",
  secret_code: "",
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

function formatDateTime(
  value: string | null | undefined,
  locale: string,
): string {
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

  return date.toLocaleString(locale, {
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
    source_type: conversation.source_type || "video",
    source_label: conversation.source_label || "",
    secret_code: conversation.secret_code || "",
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
    source_type: form.source_type.trim() || "video",
    source_label: form.source_label.trim() || null,
    secret_code: form.secret_code.trim() || null,
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

function getConversationSourceLabel(
  conversation: AdminWorkerConversation,
  locale: string,
): string {
  const parts = [
    conversation.source_type || "video",
    conversation.source_label || null,
    formatDateTime(conversation.conversation_date, locale),
  ].filter(Boolean);

  return parts.join(" · ");
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === "object" && err !== null) {
    const maybeError = err as {
      detail?: unknown;
      message?: unknown;
      error?: unknown;
    };

    if (typeof maybeError.detail === "string") return maybeError.detail;
    if (typeof maybeError.message === "string") return maybeError.message;
    if (typeof maybeError.error === "string") return maybeError.error;
  }

  return fallback;
}

function validateExternalConversationForm(
  form: ConversationFormState,
  validation: OrganizationConversationsCopy["validation"],
): string | null {
  const title = form.title.trim();
  const sourceType = form.source_type.trim();
  const filePath = form.file_path.trim();
  const secretCode = form.secret_code.trim();

  if (!title) {
    return validation.titleRequired;
  }

  if (secretCode && !/^[A-Za-z0-9_-]+$/.test(secretCode)) {
    return validation.secretCodeCharacters;
  }

  if (secretCode.length > 100) {
    return validation.secretCodeTooLong;
  }

  if (sourceType === "video" && !filePath) {
    return validation.filePathVideoRequired;
  }

  if (sourceType === "audio" && !filePath) {
    return validation.filePathAudioRequired;
  }

  if (sourceType === "upload" && !filePath) {
    return validation.filePathUploadRequired;
  }

  return null;
}

function ScrollableTextBlock({
  title,
  value,
  maxHeight = 260,
  charsLabel,
}: {
  title: string;
  value?: string | null;
  maxHeight?: number;
  charsLabel: (count: number) => string;
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
          {charsLabel(value.length)}
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
  const { uiLanguage } = useAdminUiLanguage();
  const copy = getOrganizationConversationsCopy(uiLanguage);

  const [form, setForm] = useState<ConversationFormState>(EMPTY_FORM);
  const [expandedCoachSessionId, setExpandedCoachSessionId] = useState<number | null>(null);
  const [expandedExternalConversationId, setExpandedExternalConversationId] =
    useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [localSaving, setLocalSaving] = useState(false);

  const isSubmitting = saving || localSaving;

  const workerLabel = selectedWorkerSummary?.worker
    ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
    : copy.noWorkerSelected;

  const coachSessions = conversations?.coach_sessions ?? [];
  const externalConversations = conversations?.external_conversations ?? [];

  const selectedWorkerHasConversations = useMemo(() => {
    return coachSessions.length > 0 || externalConversations.length > 0;
  }, [coachSessions.length, externalConversations.length]);

  useEffect(() => {
    setForm(buildFormFromConversation(editingExternalConversation));
    setFormError(null);
  }, [editingExternalConversation]);

  function patchField<K extends keyof ConversationFormState>(
    key: K,
    value: ConversationFormState[K],
  ) {
    setFormError(null);
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFormError(null);
    onCancelEditExternalConversation();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validationError = validateExternalConversationForm(
      form,
      copy.validation,
    );

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = buildPayloadFromForm(form);

    setLocalSaving(true);
    setFormError(null);

    try {
      if (editingExternalConversation) {
        await Promise.resolve(
          onUpdateExternalConversation(editingExternalConversation.id, payload),
        );
        return;
      }

      await Promise.resolve(onCreateExternalConversation(payload));
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(getErrorMessage(err, copy.validation.saveFallback));
    } finally {
      setLocalSaving(false);
    }
  }

  return (
    <div className="stack" style={{ gap: 16, minWidth: 0 }}>
      <section
        data-testid="organization-conversations-summary"
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          alignItems: "flex-start",
          flexWrap: "wrap",
          padding: "20px 22px",
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
        }}
      >
        <div className="stack" style={{ gap: 8, minWidth: 0 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="badge primary">{copy.badge}</span>
            {selectedWorkerId ? <span className="badge">{workerLabel}</span> : null}
          </div>

          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">{copy.workerConversations}</div>
            <div className="muted">
              {copy.description(workerLabel)}
            </div>
          </div>
        </div>

        <button
          className="button"
          type="button"
          onClick={() => void onLoadConversations()}
          disabled={!selectedWorkerId || loading}
        >
          {loading ? copy.loading : conversations ? copy.refresh : copy.load}
        </button>
      </section>

      {!selectedWorkerId ? (
        <EmptyState
          title={copy.noWorkerSelected}
          description={copy.noWorkerDescription}
        />
      ) : null}

      {selectedWorkerId && !loading && !conversations ? (
        <EmptyState
          title={copy.notLoadedTitle}
          description={copy.notLoadedDescription}
        />
      ) : null}

      {selectedWorkerId && conversations ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.28fr) minmax(380px, 0.72fr)",
            gap: 18,
            alignItems: "start",
            minWidth: 0,
          }}
        >
          <section
            data-testid="organization-conversations-activity"
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
                  <div className="section-title">{copy.coach.title}</div>
                  <div className="muted">
                    {copy.coach.available(coachSessions.length)}
                  </div>
                </div>

                <span className="badge">{copy.coach.count(coachSessions.length)}</span>
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
                    title={copy.coach.emptyTitle}
                    description={copy.coach.emptyDescription}
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
                            <span className="badge">{copy.coach.session(session.session_id)}</span>
                            <span className="badge">{session.status}</span>
                            <span className="badge">{copy.coach.turns(transcriptCount)}</span>
                          </div>

                          <strong
                            style={{
                              letterSpacing: "-0.02em",
                              wordBreak: "break-word",
                            }}
                          >
                            {copy.coach.sessionTitle}
                          </strong>

                          <span className="muted">
                            {copy.coach.started(
                              formatDateTime(session.started_at, copy.locale),
                            )}
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
                            <span className="muted">{copy.coach.noSummary}</span>
                          )}
                        </div>

                        <button
                          className={isExpanded ? "button" : "button ghost"}
                          type="button"
                          onClick={() =>
                            setExpandedCoachSessionId(isExpanded ? null : session.session_id)
                          }
                        >
                          {isExpanded ? copy.common.hide : copy.common.open}
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
                            <div className="muted">{copy.coach.noTranscript}</div>
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
                                  {turn.speaker === "user"
                                    ? copy.coach.worker
                                    : copy.coach.coach}
                                </strong>

                                <span className="muted" style={{ fontSize: 12 }}>
                                  {formatDateTime(turn.created_at, copy.locale)}
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
                  <div className="section-title">{copy.external.title}</div>
                  <div className="muted">
                    {copy.external.captured(externalConversations.length)}
                  </div>
                </div>

                <span className="badge">{copy.external.count(externalConversations.length)}</span>
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
                    title={copy.external.emptyTitle}
                    description={copy.external.emptyDescription}
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
                            <span className="badge">{conversation.source_type || "video"}</span>
                            {conversation.video_url ? (
                              <span className="badge primary">{copy.external.videoBadge}</span>
                            ) : null}
                            {conversation.transcript ? (
                              <span className="badge">{copy.external.transcriptBadge}</span>
                            ) : null}
                            {conversation.notes ? (
                              <span className="badge">{copy.external.notesBadge}</span>
                            ) : null}
                            {conversation.secret_code ? (
                              <span className="badge">{copy.external.secretCodeBadge}</span>
                            ) : null}
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
                            {getConversationSourceLabel(
                              conversation,
                              copy.locale,
                            )}
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
                            {isExpanded ? copy.common.hide : copy.common.open}
                          </button>

                          <button
                            className="button ghost"
                            type="button"
                            onClick={() => onEditExternalConversation(conversation)}
                          >
                            {copy.common.edit}
                          </button>

                          <button
                            className="button ghost"
                            type="button"
                            onClick={() => void onDeleteExternalConversation(conversation.id)}
                            disabled={isSubmitting}
                            style={{ color: "var(--danger)" }}
                          >
                            {copy.common.delete}
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
                              <strong style={{ fontSize: 12 }}>
                                {copy.external.video}
                              </strong>

                              <a
                                href={conversation.video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="button ghost"
                                style={{
                                  width: "fit-content",
                                }}
                                title={copy.external.openVideoTitle}
                              >
                                {copy.external.watchVideo}
                              </a>
                            </div>
                          ) : null}

                          {conversation.file_path ? (
                            <div className="stack" style={{ gap: 6 }}>
                              <strong style={{ fontSize: 12 }}>
                                {copy.external.filePath}
                              </strong>
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

                          {conversation.secret_code ? (
                            <div className="stack" style={{ gap: 6 }}>
                              <strong style={{ fontSize: 12 }}>
                                {copy.external.secretCode}
                              </strong>
                              <code
                                style={{
                                  width: "fit-content",
                                  maxWidth: "100%",
                                  wordBreak: "break-all",
                                  border: "1px solid var(--admin-border, var(--border))",
                                  borderRadius: 12,
                                  padding: "9px 11px",
                                  background: "rgba(17,24,39,0.035)",
                                  fontSize: 13,
                                }}
                              >
                                {conversation.secret_code}
                              </code>
                            </div>
                          ) : null}

                          <ScrollableTextBlock
                            title={copy.external.transcript}
                            value={conversation.transcript}
                            maxHeight={300}
                            charsLabel={copy.common.chars}
                          />

                          <ScrollableTextBlock
                            title={copy.external.notes}
                            value={conversation.notes}
                            maxHeight={240}
                            charsLabel={copy.common.chars}
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
                title={copy.external.noMaterialTitle}
                description={copy.external.noMaterialDescription}
              />
            ) : null}
          </section>

          <form
            data-testid="organization-conversations-capture"
            className="card stack"
            style={{
              gap: 16,
              minWidth: 0,
              maxHeight: "calc(100vh - 280px)",
              overflowY: "auto",
              overflowX: "hidden",
              position: "sticky",
              top: 78,
              padding: 20,
              borderColor: "var(--admin-border)",
              background: "var(--admin-surface)",
            }}
            onSubmit={(event) => void handleSubmit(event)}
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
                  {editingExternalConversation
                    ? copy.form.editingBadge
                    : copy.form.newBadge}
                </span>
                {editingExternalConversation ? (
                  <span className="badge">#{editingExternalConversation.id}</span>
                ) : null}
              </div>

              <div>
                <div className="section-title">
                  {editingExternalConversation
                    ? copy.form.editTitle
                    : copy.form.addTitle}
                </div>
                <div className="muted">
                  {copy.form.description}
                </div>
              </div>
            </div>

            {formError ? (
              <div
                className="card-soft"
                style={{
                  color: "var(--danger)",
                  border: "1px solid rgba(239,68,68,0.22)",
                  background: "rgba(239,68,68,0.08)",
                  lineHeight: 1.55,
                }}
              >
                {formError}
              </div>
            ) : null}

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">{copy.form.title}</span>
              <input
                className="input"
                value={form.title}
                onChange={(event) => patchField("title", event.target.value)}
                placeholder={copy.form.titlePlaceholder}
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
                <span className="muted">{copy.form.sourceType}</span>
                <select
                  className="select"
                  value={form.source_type}
                  onChange={(event) => patchField("source_type", event.target.value)}
                >
                  <option value="manual">{copy.form.sourceTypes.manual}</option>
                  <option value="meeting">{copy.form.sourceTypes.meeting}</option>
                  <option value="video">{copy.form.sourceTypes.video}</option>
                  <option value="audio">{copy.form.sourceTypes.audio}</option>
                  <option value="url">{copy.form.sourceTypes.url}</option>
                  <option value="upload">{copy.form.sourceTypes.upload}</option>
                  <option value="note">{copy.form.sourceTypes.note}</option>
                </select>
              </label>

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">{copy.form.sourceLabel}</span>
                <input
                  className="input"
                  value={form.source_label}
                  onChange={(event) => patchField("source_label", event.target.value)}
                  placeholder={copy.form.sourceLabelPlaceholder}
                />
              </label>
            </div>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">{copy.form.secretCode}</span>
              <input
                className="input"
                type="text"
                value={form.secret_code}
                onChange={(event) => patchField("secret_code", event.target.value)}
                placeholder={copy.form.secretCodePlaceholder}
                maxLength={100}
                autoComplete="off"
                spellCheck={false}
                pattern="[A-Za-z0-9_-]+"
                title={copy.form.secretCodeTitle}
              />
              <span className="muted" style={{ fontSize: 12 }}>
                {copy.form.secretCodeHelp}
              </span>
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">{copy.form.conversationDate}</span>
              <input
                className="input"
                type="datetime-local"
                value={form.conversation_date}
                onChange={(event) => patchField("conversation_date", event.target.value)}
              />
              <span className="muted" style={{ fontSize: 12 }}>
                {copy.form.conversationDateHelp}
              </span>
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">{copy.form.videoUrl}</span>
              <input
                className="input"
                value={form.video_url}
                onChange={(event) => patchField("video_url", event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">
                {copy.form.filePath}
                {["video", "audio", "upload"].includes(form.source_type) ? " *" : ""}
              </span>
              <input
                className="input"
                value={form.file_path}
                onChange={(event) => patchField("file_path", event.target.value)}
                placeholder={copy.form.filePathPlaceholder}
                aria-invalid={
                  Boolean(formError) &&
                  ["video", "audio", "upload"].includes(form.source_type) &&
                  !form.file_path.trim()
                }
              />
              {["video", "audio", "upload"].includes(form.source_type) ? (
                <span className="muted" style={{ fontSize: 12 }}>
                  {copy.form.filePathHelp}
                </span>
              ) : null}
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">{copy.form.transcript}</span>
              <textarea
                className="textarea"
                value={form.transcript}
                onChange={(event) => patchField("transcript", event.target.value)}
                placeholder={copy.form.transcriptPlaceholder}
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
              <span className="muted">{copy.form.notes}</span>
              <textarea
                className="textarea"
                value={form.notes}
                onChange={(event) => patchField("notes", event.target.value)}
                placeholder={copy.form.notesPlaceholder}
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
                  disabled={isSubmitting}
                >
                  {copy.form.cancel}
                </button>
              ) : null}

              <button
                className="button"
                type="submit"
                disabled={isSubmitting || !selectedWorkerId || !form.title.trim()}
              >
                {isSubmitting
                  ? copy.form.saving
                  : editingExternalConversation
                    ? copy.form.update
                    : copy.form.add}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}