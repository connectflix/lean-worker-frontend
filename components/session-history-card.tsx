"use client";

import { useRouter } from "next/navigation";
import type { SessionHistoryItem } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  ArrowRightIcon,
  BadgePill,
  BrainIcon,
  ClockIcon,
  SessionIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";

function getStatusLabel(status: string, uiLanguage: SupportedUiLanguage): string {
  if (uiLanguage === "fr") {
    if (status === "open") return "ouverte";
    if (status === "closed") return "clôturée";
    if (status === "force_closed") return "clôturée de force";
  }

  if (status === "open") return "open";
  if (status === "closed") return "closed";
  if (status === "force_closed") return "force closed";

  return status;
}

function getStatusTone(status: string) {
  if (status === "open") {
    return {
      background: "rgba(255,122,89,0.12)",
      borderColor: "rgba(255,122,89,0.22)",
      color: "var(--coach-accent)",
    };
  }

  if (status === "force_closed") {
    return {
      background: "rgba(198,40,40,0.08)",
      borderColor: "rgba(198,40,40,0.16)",
      color: "var(--danger)",
    };
  }

  return {
    background: "rgba(88,180,174,0.12)",
    borderColor: "rgba(88,180,174,0.20)",
    color: "var(--coach-calm)",
  };
}

function truncateSummary(value: string, maxLength = 420): string {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trim()}...`;
}

export function SessionHistoryCard({
  item,
  uiLanguage = "en",
}: {
  item: SessionHistoryItem;
  uiLanguage?: SupportedUiLanguage;
}) {
  const router = useRouter();
  const statusTone = getStatusTone(item.status);
  const summary = item.summary ? truncateSummary(item.summary) : null;

  const startedAt = new Date(item.started_at);
  const endedAt = item.ended_at ? new Date(item.ended_at) : null;

  return (
    <div
      className="card stack"
      style={{
        gap: 16,
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,248,239,0.76))",
        boxShadow: "0 18px 48px rgba(43,33,24,0.055)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -72,
          top: -86,
          width: 190,
          height: 190,
          borderRadius: 999,
          background:
            item.status === "open"
              ? "rgba(255,122,89,0.12)"
              : "rgba(88,180,174,0.10)",
          pointerEvents: "none",
        }}
      />

      <div
        className="row space-between"
        style={{
          position: "relative",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div className="stack" style={{ gap: 8, minWidth: 0, flex: 1 }}>
          <div
            className="row"
            style={{
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 15,
                display: "grid",
                placeItems: "center",
                background: "rgba(255,122,89,0.12)",
                border: "1px solid rgba(255,122,89,0.20)",
                color: "var(--coach-accent)",
                flexShrink: 0,
              }}
            >
              <SessionIcon size={18} />
            </div>

            <div className="stack" style={{ gap: 2, minWidth: 0 }}>
              <div
                className="section-title"
                style={{
                  margin: 0,
                  color: "var(--coach-ink)",
                }}
              >
                Session #{item.session_id}
              </div>

              <div
                className="muted"
                style={{
                  color: "var(--coach-muted)",
                  fontSize: 13,
                }}
              >
                {uiLanguage === "fr"
                  ? "Trace de session et lecture contextuelle"
                  : "Session trace and contextual reading"}
              </div>
            </div>
          </div>
        </div>

        <span
          className="badge"
          style={{
            ...statusTone,
            fontWeight: 850,
          }}
        >
          {getStatusLabel(item.status, uiLanguage)}
        </span>
      </div>

      <div
        className="row"
        style={{
          position: "relative",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <BadgePill icon={<ClockIcon size={14} />}>
          {uiLanguage === "fr" ? "Démarrée" : "Started"} ·{" "}
          {startedAt.toLocaleString()}
        </BadgePill>

        {endedAt ? (
          <BadgePill icon={<ClockIcon size={14} />}>
            {uiLanguage === "fr" ? "Clôturée" : "Closed"} ·{" "}
            {endedAt.toLocaleString()}
          </BadgePill>
        ) : null}

        {summary ? (
          <BadgePill icon={<BrainIcon size={14} />}>
            {uiLanguage === "fr" ? "Synthèse disponible" : "Summary available"}
          </BadgePill>
        ) : (
          <BadgePill icon={<SparkIcon size={14} />}>
            {uiLanguage === "fr" ? "Signaux à enrichir" : "Signals to enrich"}
          </BadgePill>
        )}
      </div>

      <div
        className="card-soft"
        style={{
          position: "relative",
          borderRadius: 22,
          background: "rgba(255,255,255,0.66)",
          border: "1px solid rgba(43,33,24,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
        }}
      >
        {summary ? (
          <div
            style={{
              lineHeight: 1.7,
              color: "var(--coach-ink)",
              whiteSpace: "pre-wrap",
            }}
          >
            {summary}
          </div>
        ) : (
          <span
            className="muted"
            style={{
              color: "var(--coach-muted)",
              lineHeight: 1.65,
            }}
          >
            {uiLanguage === "fr"
              ? "Pas encore d’insights — interagis davantage pour faire émerger les signaux du coaching."
              : "No insights yet — start interacting more to unlock coaching insights."}
          </span>
        )}
      </div>

      <div
        className="row"
        style={{
          position: "relative",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <button
          className="button"
          onClick={() => router.push(`/session?sessionId=${item.session_id}`)}
          type="button"
          style={{
            background: "var(--coach-accent)",
            minHeight: 44,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowRightIcon size={14} />
            {item.status === "open"
              ? uiLanguage === "fr"
                ? "Reprendre la session"
                : "Resume session"
              : uiLanguage === "fr"
                ? "Réouvrir la session"
                : "Open session"}
          </span>
        </button>

        <button
          className="button ghost"
          onClick={() => router.push(`/history/${item.session_id}`)}
          type="button"
          style={{
            minHeight: 44,
            borderColor: "rgba(43,33,24,0.10)",
            background: "rgba(255,255,255,0.62)",
          }}
        >
          {uiLanguage === "fr" ? "Voir le détail" : "View detail"}
        </button>
      </div>
    </div>
  );
}