"use client";

import { BadgePill, BrainIcon, SparkIcon } from "@/components/ui-flat-icons";
import type { SupportedUiLanguage } from "@/lib/user-locales";

type SessionSummaryCardProps = {
  summary: string;
  uiLanguage?: SupportedUiLanguage;
};

export function SessionSummaryCard({
  summary,
  uiLanguage = "fr",
}: SessionSummaryCardProps) {
  const copy =
    uiLanguage === "fr"
      ? {
          title: "Résumé de la session",
          description:
            "Les principaux éléments retenus de ta conversation de coaching.",
          badge: "Synthèse de session",
          empty:
            "Aucun résumé n’est encore disponible pour cette session.",
        }
      : {
          title: "Session summary",
          description: "The main points captured from your coaching conversation.",
          badge: "Session synthesis",
          empty:
            "No summary is available for this session yet.",
        };
  return (
    <div
      className="card stack"
      lang={uiLanguage}
      style={{
        gap: 14,
        borderRadius: 24,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,241,220,0.92), rgba(255,255,255,0.90))",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -80,
          top: -90,
          width: 210,
          height: 210,
          borderRadius: 999,
          background: "rgba(255,122,89,0.12)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "45%",
          bottom: -120,
          width: 240,
          height: 240,
          borderRadius: 999,
          background: "rgba(88,180,174,0.10)",
          pointerEvents: "none",
        }}
      />

      <div
        className="row space-between"
        style={{
          alignItems: "center",
          gap: 12,
          position: "relative",
          flexWrap: "wrap",
        }}
      >
        <div
          className="row"
          style={{
            gap: 10,
            alignItems: "center",
            minWidth: 0,
            flex: "1 1 280px",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,122,89,0.12)",
              border: "1px solid rgba(255,122,89,0.20)",
              color: "var(--coach-accent)",
              flexShrink: 0,
            }}
          >
            <BrainIcon size={18} />
          </div>

          <div className="stack" style={{ gap: 3, minWidth: 0 }}>
            <div
              className="section-title"
              style={{
                margin: 0,
                color: "var(--coach-ink)",
              }}
            >
              {copy.title}
            </div>

            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                fontSize: 13,
              }}
            >
              {copy.description}
            </div>
          </div>
        </div>

        <BadgePill icon={<SparkIcon size={14} />}>{copy.badge}</BadgePill>
      </div>

      <div
        className="card-soft"
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          color: "var(--coach-ink)",
          background: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(43,33,24,0.08)",
          borderRadius: 22,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.74)",
          position: "relative",
        }}
      >
        {summary.trim() || copy.empty}
      </div>
    </div>
  );
}