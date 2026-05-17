"use client";

import type { SupportedUiLanguage } from "@/lib/user-locales";
import { BadgePill, SparkIcon, UserCardIcon } from "@/components/ui-flat-icons";

export function Topbar({
  uiLanguage,
  title,
  firstName,
}: {
  uiLanguage: SupportedUiLanguage;
  title: string;
  firstName?: string | null;
}) {
  const initial = firstName?.trim()?.charAt(0)?.toUpperCase() || "U";
  const displayName = firstName || (uiLanguage === "fr" ? "Utilisateur" : "User");

  return (
    <header
      className="topbar coach-topbar"
      style={{
        minHeight: 78,
        height: "auto",
        padding: "14px 22px",
        gap: 16,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,248,239,0.88))",
        borderBottom: "1px solid rgba(43,33,24,0.08)",
        backdropFilter: "saturate(160%) blur(18px)",
      }}
    >
      <div className="stack" style={{ gap: 5, minWidth: 0 }}>
        <div
          className="row"
          style={{
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            className="badge"
            style={{
              width: "fit-content",
              background: "rgba(255,122,89,0.11)",
              borderColor: "rgba(255,122,89,0.20)",
              color: "var(--coach-accent)",
              fontWeight: 800,
            }}
          >
            {uiLanguage === "fr" ? "LeanWorker App" : "LeanWorker App"}
          </span>

          <span
            className="badge"
            style={{
              width: "fit-content",
              background: "rgba(88,180,174,0.11)",
              borderColor: "rgba(88,180,174,0.20)",
              color: "var(--coach-calm)",
              fontWeight: 800,
            }}
          >
            {uiLanguage === "fr" ? "Espace calme" : "Calm workspace"}
          </span>
        </div>

        <div
          className="topbar-title"
          style={{
            fontSize: 20,
            lineHeight: 1.15,
            fontWeight: 850,
            letterSpacing: "-0.045em",
            color: "var(--coach-ink)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={title}
        >
          {title}
        </div>

        <div
          className="muted"
          style={{
            fontSize: 13,
            lineHeight: 1.45,
            color: "var(--coach-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {uiLanguage === "fr"
            ? "Clarifie ta situation, choisis la prochaine action et avance avec sérénité."
            : "Clarify your situation, choose the next action, and move forward calmly."}
        </div>
      </div>

      <div
        className="topbar-right"
        style={{
          gap: 12,
          flexShrink: 0,
        }}
      >
        <BadgePill icon={<SparkIcon size={14} />}>
          {uiLanguage === "fr" ? "Coach actif" : "Coach active"}
        </BadgePill>

        <div
          className="user-pill"
          style={{
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(43,33,24,0.08)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
            padding: "8px 12px",
            borderRadius: 999,
          }}
        >
          <span
            className="avatar-circle"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,122,89,0.18), rgba(88,180,174,0.14))",
              color: "var(--coach-accent)",
              border: "1px solid rgba(255,122,89,0.16)",
              fontWeight: 850,
            }}
          >
            {initial}
          </span>

          <span className="stack" style={{ gap: 2, minWidth: 0 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 750,
                color: "var(--coach-ink)",
                maxWidth: 190,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={displayName}
            >
              <UserCardIcon size={14} />
              {displayName}
            </span>

            <span
              className="muted"
              style={{
                fontSize: 12,
                color: "var(--coach-muted)",
                whiteSpace: "nowrap",
              }}
            >
              {uiLanguage === "fr" ? "Session active" : "Active session"}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}