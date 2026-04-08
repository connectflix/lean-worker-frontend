"use client";

import { useRouter } from "next/navigation";
import type { SessionHistoryItem } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  ArrowRightIcon,
  BadgePill,
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
  return status;
}

export function SessionHistoryCard({
  item,
  uiLanguage = "en",
}: {
  item: SessionHistoryItem;
  uiLanguage?: SupportedUiLanguage;
}) {
  const router = useRouter();

  return (
    <div
      className="card stack"
      style={{
        gap: 16,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.90), rgba(248,250,252,0.92))",
      }}
    >
      <div className="row space-between" style={{ alignItems: "flex-start", gap: 12 }}>
        <div className="stack" style={{ gap: 6 }}>
          <div
            className="section-title"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <SessionIcon />
            Session #{item.session_id}
          </div>

          <div className="muted">
            {uiLanguage === "fr"
              ? "Trace de session et lecture contextuelle"
              : "Session trace and contextual reading"}
          </div>
        </div>

        <BadgePill icon={<SparkIcon size={14} />}>
          {getStatusLabel(item.status, uiLanguage)}
        </BadgePill>
      </div>

      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        <BadgePill icon={<ClockIcon size={14} />}>
          {new Date(item.started_at).toLocaleString()}
        </BadgePill>
      </div>

      <div className="card-soft">
        {item.summary ? (
          <div style={{ lineHeight: 1.6 }}>{item.summary}</div>
        ) : (
          <span className="muted">
            {uiLanguage === "fr"
              ? "Pas encore d’insights — interagis davantage pour faire émerger les signaux du coaching."
              : "No insights yet — start interacting more to unlock coaching insights."}
          </span>
        )}
      </div>

      <button
        className="button"
        onClick={() => router.push(`/session?sessionId=${item.session_id}`)}
        type="button"
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ArrowRightIcon size={14} />
          {uiLanguage === "fr" ? "Reprendre la session" : "Resume session"}
        </span>
      </button>
    </div>
  );
}