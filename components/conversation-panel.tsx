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
import {
  BadgePill,
  ClockIcon,
  SessionIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";

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

        if (lastAgentTurn && onCoachStateChange) {
          onCoachStateChange({
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
  }, [sessionId, uiLanguage, onCoachStateChange]);

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

      if (onCoachStateChange) {
        onCoachStateChange({
          coachMode: agentTurn.coachMode,
          coachIntent: agentTurn.coachIntent,
        });
      }
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
    sessionLive: uiLanguage === "fr" ? "Session écrite active" : "Written session active",
    textOnly: uiLanguage === "fr" ? "Écrit uniquement" : "Text only",
    adaptiveCoach: uiLanguage === "fr" ? "Coach adaptatif" : "Adaptive coach",
    activeMemory: uiLanguage === "fr" ? "Mémoire active" : "Active memory",
    purposeAware:
      uiLanguage === "fr" ? "Purpose Canvas intégré" : "Purpose Canvas integrated",
    loading:
      uiLanguage === "fr"
        ? "Préparation de l’espace écrit..."
        : "Preparing written workspace...",
    empty:
      uiLanguage === "fr"
        ? "Commence à écrire pour lancer l’échange avec ton coach."
        : "Start typing to begin the exchange with your coach.",
    typing: uiLanguage === "fr" ? "Le coach réfléchit..." : "Coach is thinking...",
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
    immersiveNote:
      uiLanguage === "fr"
        ? "Même cockpit que la voix, avec interaction écrite au centre. Le coach exploite maintenant aussi le Purpose Canvas lorsqu’il existe."
        : "Same cockpit as voice mode, with written interaction in the center. The coach now also uses the Purpose Canvas when available.",
    coachReplyHint:
      uiLanguage === "fr"
        ? "Le coach répondra ici, avec le contexte actif disponible."
        : "The coach will answer here, using the available active context.",
  };

  const isCockpit = variant === "cockpit";

  return (
    <div
      className="chat-surface"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: isCockpit ? "clamp(460px, calc(100vh - 270px), 900px)" : "100%",
        maxHeight: isCockpit ? "calc(100vh - 270px)" : undefined,
        border: isCockpit ? "none" : undefined,
        background: isCockpit ? "transparent" : undefined,
        boxShadow: isCockpit ? "none" : undefined,
      }}
    >
      {isCockpit ? (
        <div className="card stack" style={{ gap: 14, margin: 16, marginBottom: 0 }}>
          <div
            className="row"
            style={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div className="stack" style={{ gap: 6 }}>
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <SessionIcon />
                <div className="section-title">{labels.sessionLive}</div>
              </div>
              <div className="muted">{labels.immersiveNote}</div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <BadgePill icon={<SparkIcon size={14} />}>{labels.textOnly}</BadgePill>
              <BadgePill icon={<SparkIcon size={14} />}>{labels.adaptiveCoach}</BadgePill>
              <BadgePill icon={<ClockIcon size={14} />}>{labels.activeMemory}</BadgePill>
              <BadgePill icon={<SparkIcon size={14} />}>{labels.purposeAware}</BadgePill>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="chat-messages"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          paddingTop: isCockpit ? 16 : undefined,
        }}
      >
        {bootstrapping ? (
          <div className="card-soft">
            <div className="muted">{labels.loading}</div>
          </div>
        ) : turns.length === 0 ? (
          <div className="card-soft">
            <div className="muted">{labels.empty}</div>
          </div>
        ) : (
          turns.map((turn, index) => {
            const isUser = turn.speaker === "user";

            return (
              <div
                key={`${turn.speaker}-${index}`}
                className={`chat-bubble ${isUser ? "chat-user" : "chat-agent"}`}
              >
                {!isUser ? (
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                    Coach
                  </div>
                ) : null}

                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {turn.text}
                </div>
              </div>
            );
          })
        )}

        {loading ? (
          <div className="chat-bubble chat-agent">
            <div className="muted">{labels.typing}</div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div
        className="chat-input-bar"
        style={{
          borderTop: "1px solid var(--border-color, #e5e7eb)",
          paddingTop: 12,
          marginTop: 8,
          background: isCockpit ? "rgba(252, 253, 255, 0.96)" : "var(--panel-bg, transparent)",
          flexShrink: 0,
        }}
      >
        {error ? (
          <div
            style={{
              marginBottom: 10,
              fontSize: 13,
              color: "#b42318",
            }}
          >
            {error}
          </div>
        ) : null}

        {isCockpit ? (
          <div className="stack" style={{ gap: 12 }}>
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title" style={{ fontSize: 14 }}>
                {labels.inputTitle}
              </div>
              <div className="muted" style={{ fontSize: 13 }}>
                {labels.inputHint}
              </div>
            </div>

            <textarea
              className="textarea chat-input-textarea"
              placeholder={copy.session.typeMessage}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              disabled={loading || closing}
              style={{
                width: "100%",
                minWidth: 0,
                resize: "vertical",
                boxSizing: "border-box",
                display: "block",
                lineHeight: 1.5,
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
              <div className="muted" style={{ fontSize: 12 }}>
                {labels.coachReplyHint}
              </div>

              <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
                <button
                  className="button"
                  onClick={() => void handleSend()}
                  disabled={!message.trim() || loading || closing}
                  style={{ whiteSpace: "nowrap" }}
                  type="button"
                >
                  {labels.send}
                </button>

                <button
                  className="button secondary"
                  onClick={() => void handleCloseSession()}
                  disabled={loading || closing}
                  style={{ whiteSpace: "nowrap" }}
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
                  lineHeight: 1.5,
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
                gap: 12,
                alignItems: "center",
                flexShrink: 0,
                flexWrap: "wrap",
              }}
            >
              <button
                className="button"
                onClick={() => void handleSend()}
                disabled={!message.trim() || loading || closing}
                style={{ whiteSpace: "nowrap" }}
                type="button"
              >
                {labels.send}
              </button>

              <button
                className="button secondary"
                onClick={() => void handleCloseSession()}
                disabled={loading || closing}
                style={{ whiteSpace: "nowrap" }}
                type="button"
              >
                {labels.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}