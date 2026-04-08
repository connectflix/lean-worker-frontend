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

  return (
    <header className="topbar">
      <div className="stack" style={{ gap: 4 }}>
        <div className="topbar-title">{title}</div>
        <div className="muted" style={{ fontSize: 13 }}>
          {uiLanguage === "fr"
            ? "Espace de coaching personnalisé"
            : "Personalized coaching workspace"}
        </div>
      </div>

      <div className="topbar-right" style={{ gap: 12 }}>
        <BadgePill icon={<SparkIcon size={14} />}>
          {uiLanguage === "fr" ? "Coach actif" : "Coach active"}
        </BadgePill>

        <div className="user-pill">
          <span className="avatar-circle">{initial}</span>

          <span className="stack" style={{ gap: 2 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
              }}
            >
              <UserCardIcon size={14} />
              {firstName || (uiLanguage === "fr" ? "Utilisateur" : "User")}
            </span>

            <span className="muted" style={{ fontSize: 12 }}>
              {uiLanguage === "fr" ? "Session active" : "Active session"}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}