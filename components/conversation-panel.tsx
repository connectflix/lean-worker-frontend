"use client";

import { useEffect, useRef, useState } from "react";
import { closeSession, getSessionDetail, sendConversationTurn } from "@/lib/api";
import { getUiCopy } from "@/lib/ui-copy";
import type {
  ConversationTurnResponse,
  SessionCloseResponse,
  TranscriptTurn,
} from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import { SparkIcon } from "@/components/ui-flat-icons";

type Turn = {
  speaker: "user" | "agent";
  text: string;
  coachMode?: string;
  coachIntent?: string;
};

function mapTranscriptTurnToLocalTurn(turn: TranscriptTurn): Turn {
  return {
    speaker: turn.speaker,
    text: turn.text,
    coachMode: turn.coach_mode,
    coachIntent: turn.coach_intent,
  };
}

function mapConversationResponseToAgentTurn(response: ConversationTurnResponse): Turn {
  return {
    speaker: "agent",
    text: response.agent_message,
    coachMode: response.coach_mode,
    coachIntent: response.coach_intent,
  };
}

function CoachMiniIcon({
  children,
  tone = "warm",
}: {
  children: React.ReactNode;
  tone?: "warm" | "calm";
}) {
  return (
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: 14,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background:
          tone === "calm"
            ? "rgba(88,180,174,0.13)"
            : "rgba(255,122,89,0.13)",
        border:
          tone === "calm"
            ? "1px solid rgba(88,180,174,0.22)"
            : "1px solid rgba(255,122,89,0.22)",
        color: tone === "calm" ? "var(--coach-calm)" : "var(--coach-accent)",
      }}
    >
      {children}
    </span>
  );
}

function ThinkingDots() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        gap: 4,
        alignItems: "center",
        marginLeft: 4,
      }}
    >
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: "var(--coach-accent)",
            opacity: 0.45 + item * 0.18,
          }}
        />
      ))}
    </span>
  );
}

export function ConversationPanel({
  sessionId,
  onClosed,
  uiLanguage = "en",
  onCoachStateChange,
  variant = "standard",
}: {
  sessionId: number;
  onClosed: (result: SessionCloseResponse) => void;
  uiLanguage?: SupportedUiLanguage;
  onCoachStateChange?: (state: { coachMode?: string; coachIntent?: string }) => void;
  variant?: "standard" | "cockpit";
}) {
  const copy = getUiCopy(uiLanguage);

  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const onCoachStateChangeRef = useRef<typeof onCoachStateChange>(onCoachStateChange);

  useEffect(() => {
    onCoachStateChangeRef.current = onCoachStateChange;
  }, [onCoachStateChange]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setBootstrapping(true);
        setError(null);

        const detail = await getSessionDetail(sessionId);

        if (cancelled) return;

        const existingTurns = (detail.transcript || []).map(mapTranscriptTurnToLocalTurn);
        setTurns(existingTurns);

        const lastAgentTurn = [...existingTurns]
          .reverse()
          .find((turn) => turn.speaker === "agent");

        if (lastAgentTurn) {
          onCoachStateChangeRef.current?.({
            coachMode: lastAgentTurn.coachMode,
            coachIntent: lastAgentTurn.coachIntent,
          });
        }
      } catch {
        if (!cancelled) {
          setError(
            uiLanguage === "fr"
              ? "Impossible de charger la session."
              : "Unable to load the session.",
          );
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [sessionId, uiLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, loading]);

  async function handleSend() {
    const userText = message.trim();

    if (!userText || loading || closing) return;

    setMessage("");
    setLoading(true);
    setError(null);

    setTurns((prev) => [...prev, { speaker: "user", text: userText }]);

    try {
      const response = await sendConversationTurn(sessionId, userText, uiLanguage);
      const agentTurn = mapConversationResponseToAgentTurn(response);

      setTurns((prev) => [...prev, agentTurn]);

      onCoachStateChangeRef.current?.({
        coachMode: agentTurn.coachMode,
        coachIntent: agentTurn.coachIntent,
      });
    } catch {
      setError(
        uiLanguage === "fr"
          ? "Erreur lors de l’envoi du message."
          : "Error sending message.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseSession() {
    if (closing) return;

    try {
      setClosing(true);
      setError(null);

      const result = await closeSession(sessionId);
      onClosed(result);
    } catch {
      setError(
        uiLanguage === "fr"
          ? "Erreur lors de la clôture."
          : "Error closing session.",
      );
      setClosing(false);
    }
  }

  const labels = {
    loading:
      uiLanguage === "fr"
        ? "Préparation de l’espace écrit..."
        : "Preparing written workspace...",
    typing: uiLanguage === "fr" ? "Le coach réfléchit" : "Coach is thinking",
    inputTitle: uiLanguage === "fr" ? "Ton message" : "Your message",
    inputHint:
      uiLanguage === "fr"
        ? "Écris naturellement. Entrée pour envoyer, Maj+Entrée pour aller à la ligne."
        : "Write naturally. Press Enter to send, Shift+Enter for a new line.",
    send: loading
      ? uiLanguage === "fr"
        ? "Envoi..."
        : "Sending..."
      : copy.session.sendTextTurn,
    close: closing
      ? uiLanguage === "fr"
        ? "Clôture..."
        : "Closing..."
      : copy.session.closeSession,
    coachReplyHint:
      uiLanguage === "fr"
        ? "Le coach répondra ici avec le contexte actif disponible."
        : "The coach will answer here using the available active context.",
    you: uiLanguage === "fr" ? "Toi" : "You",
    coach: "Coach",
  };

  const isCockpit = variant === "cockpit";

  return (
    <div
      className="chat-surface"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: isCockpit ? "clamp(520px, calc(100dvh - 230px), 920px)" : "100%",
        maxHeight: isCockpit ? "calc(100dvh - 230px)" : undefined,
        border: isCockpit ? "none" : "1px solid rgba(43,33,24,0.08)",
        background: isCockpit
          ? "transparent"
          : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,248,239,0.88))",
        boxShadow: isCockpit ? "none" : "0 18px 48px rgba(43,33,24,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        className="chat-messages"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: isCockpit ? "20px" : 24,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          background:
            "radial-gradient(circle at top left, rgba(255,122,89,0.07), transparent 30%), radial-gradient(circle at bottom right, rgba(88,180,174,0.07), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,248,239,0.92))",
        }}
      >
        {bootstrapping ? (
          <div
            className="card-soft stack"
            style={{
              gap: 10,
              borderRadius: 24,
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(43,33,24,0.08)",
            }}
          >
            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <CoachMiniIcon tone="calm">
                <SparkIcon size={16} />
              </CoachMiniIcon>
              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {labels.loading}
              </div>
            </div>
          </div>
        ) : turns.length === 0 ? null : (
          turns.map((turn, index) => {
            const isUser = turn.speaker === "user";

            return (
              <div
                key={`${turn.speaker}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  className={`chat-bubble ${isUser ? "chat-user" : "chat-agent"}`}
                  style={{
                    maxWidth: isUser ? "74%" : "78%",
                    padding: "15px 17px",
                    borderRadius: isUser ? "24px 24px 8px 24px" : "24px 24px 24px 8px",
                    lineHeight: 1.6,
                    background: isUser
                      ? "linear-gradient(135deg, var(--coach-accent), #ff9a7e)"
                      : "rgba(255,255,255,0.86)",
                    color: isUser ? "#ffffff" : "var(--coach-ink)",
                    border: isUser ? "none" : "1px solid rgba(43,33,24,0.08)",
                    boxShadow: isUser
                      ? "0 14px 30px rgba(255,122,89,0.18)"
                      : "0 14px 30px rgba(43,33,24,0.06)",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      marginBottom: 7,
                      color: isUser ? "rgba(255,255,255,0.76)" : "var(--coach-muted)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {isUser ? labels.you : labels.coach}
                  </div>

                  <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {turn.text}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              className="chat-bubble chat-agent"
              style={{
                maxWidth: "78%",
                padding: "15px 17px",
                borderRadius: "24px 24px 24px 8px",
                background: "rgba(255,255,255,0.88)",
                color: "var(--coach-ink)",
                border: "1px solid rgba(43,33,24,0.08)",
                boxShadow: "0 14px 30px rgba(43,33,24,0.06)",
              }}
            >
              <div
                className="muted"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "var(--coach-muted)",
                  fontWeight: 650,
                }}
              >
                {labels.typing}
                <ThinkingDots />
              </div>
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div
        className="chat-input-bar"
        style={{
          borderTop: "1px solid rgba(43,33,24,0.08)",
          padding: isCockpit ? "14px 20px 18px" : 18,
          marginTop: 0,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(18px)",
          flexShrink: 0,
        }}
      >
        {error ? (
          <div
            style={{
              marginBottom: 12,
              borderRadius: 16,
              padding: "11px 12px",
              color: "#b91c1c",
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.20)",
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.45,
            }}
          >
            {error}
          </div>
        ) : null}

        {isCockpit ? (
          <div className="stack" style={{ gap: 12 }}>
            <div className="stack" style={{ gap: 4 }}>
              <div
                className="section-title"
                style={{
                  fontSize: 14,
                  color: "var(--coach-ink)",
                }}
              >
                {labels.inputTitle}
              </div>

              <div
                className="muted"
                style={{
                  fontSize: 13,
                  color: "var(--coach-muted)",
                }}
              >
                {labels.inputHint}
              </div>
            </div>

            <textarea
              className="textarea chat-input-textarea"
              placeholder={copy.session.typeMessage}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              disabled={loading || closing}
              style={{
                width: "100%",
                minWidth: 0,
                resize: "vertical",
                boxSizing: "border-box",
                display: "block",
                lineHeight: 1.6,
                borderRadius: 24,
                border: "1px solid rgba(43,33,24,0.10)",
                background: "#ffffff",
                color: "var(--coach-ink)",
                padding: 16,
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />

            <div
              className="row"
              style={{
                gap: 12,
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div
                className="muted"
                style={{
                  fontSize: 12,
                  color: "var(--coach-muted)",
                  lineHeight: 1.5,
                }}
              >
                {labels.coachReplyHint}
              </div>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <button
                  className="button"
                  onClick={() => void handleSend()}
                  disabled={!message.trim() || loading || closing}
                  style={{
                    whiteSpace: "nowrap",
                    minHeight: 44,
                    background: "var(--coach-accent)",
                  }}
                  type="button"
                >
                  {labels.send}
                </button>

                <button
                  className="button secondary"
                  onClick={() => void handleCloseSession()}
                  disabled={loading || closing}
                  style={{
                    whiteSpace: "nowrap",
                    minHeight: 44,
                    color: "var(--coach-accent)",
                    borderColor: "rgba(255,122,89,0.32)",
                    background: "rgba(255,122,89,0.06)",
                  }}
                  type="button"
                >
                  {labels.close}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              width: "100%",
              minWidth: 0,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: "1 1 420px",
                minWidth: 260,
                width: "100%",
              }}
            >
              <textarea
                className="textarea chat-input-textarea"
                placeholder={copy.session.typeMessage}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                disabled={loading || closing}
                style={{
                  width: "100%",
                  minWidth: 0,
                  resize: "vertical",
                  boxSizing: "border-box",
                  display: "block",
                  lineHeight: 1.6,
                  borderRadius: 24,
                  border: "1px solid rgba(43,33,24,0.10)",
                  background: "#ffffff",
                  color: "var(--coach-ink)",
                  padding: 16,
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexShrink: 0,
                flexWrap: "wrap",
              }}
            >
              <button
                className="button"
                onClick={() => void handleSend()}
                disabled={!message.trim() || loading || closing}
                style={{
                  whiteSpace: "nowrap",
                  minHeight: 44,
                  background: "var(--coach-accent)",
                }}
                type="button"
              >
                {labels.send}
              </button>

              <button
                className="button secondary"
                onClick={() => void handleCloseSession()}
                disabled={loading || closing}
                style={{
                  whiteSpace: "nowrap",
                  minHeight: 44,
                  color: "var(--coach-accent)",
                  borderColor: "rgba(255,122,89,0.32)",
                  background: "rgba(255,122,89,0.06)",
                }}
                type="button"
              >
                {labels.close}
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @media (max-width: 1600px) and (max-height: 850px) and (min-width: 1100px) {
          .workspace-center .chat-surface {
            height: auto !important;
            min-height: 520px !important;
            max-height: none !important;
          }

          .workspace-center .chat-messages {
            min-height: 260px !important;
            max-height: none !important;
          }

          .workspace-center .chat-input-textarea {
            min-height: 108px !important;
          }
        }
      `}</style>
    </div>
  );
}