"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { getUiCopy } from "@/lib/ui-copy";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  ActionListIcon,
  ArrowRightIcon,
  BrainIcon,
  ChartIcon,
  LayerIcon,
  PathIcon,
  SessionIcon,
} from "@/components/ui-flat-icons";

function BrandMark() {
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 18,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(255,122,89,0.20), rgba(88,180,174,0.16))",
        border: "1px solid rgba(43,33,24,0.08)",
        boxShadow:
          "0 14px 34px rgba(43,33,24,0.10), inset 0 1px 0 rgba(255,255,255,0.74)",
        fontWeight: 950,
        fontSize: 16,
        letterSpacing: "-0.05em",
        color: "var(--coach-ink)",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      LW
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      className="button ghost"
      href={href}
      style={{
        minHeight: 40,
        borderRadius: 999,
        background: "rgba(255,255,255,0.66)",
        border: "1px solid rgba(43,33,24,0.08)",
        color: "var(--coach-ink)",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {icon}
        {label}
      </span>
    </Link>
  );
}

export function Header({
  uiLanguage = "en",
}: {
  uiLanguage?: SupportedUiLanguage;
}) {
  const router = useRouter();
  const copy = getUiCopy(uiLanguage);

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  return (
    <header
      className="card row space-between"
      style={{
        position: "relative",
        overflow: "hidden",
        marginBottom: 16,
        alignItems: "center",
        padding: "16px 20px",
        gap: 16,
        flexWrap: "wrap",
        borderRadius: 28,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,248,239,0.92), rgba(255,255,255,0.88) 55%, rgba(232,248,246,0.78))",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -80,
          top: -90,
          width: 190,
          height: 190,
          borderRadius: 999,
          background: "rgba(255,122,89,0.12)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "40%",
          bottom: -110,
          width: 220,
          height: 220,
          borderRadius: 999,
          background: "rgba(88,180,174,0.10)",
          pointerEvents: "none",
        }}
      />

      <div
        className="row"
        style={{
          position: "relative",
          zIndex: 1,
          gap: 12,
          alignItems: "center",
        }}
      >
        <BrandMark />

        <div className="stack" style={{ gap: 4 }}>
          <div
            className="section-title"
            style={{
              margin: 0,
              color: "var(--coach-ink)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            LeanWorker
          </div>

          <div
            className="muted"
            style={{
              color: "var(--coach-muted)",
              fontSize: 13,
            }}
          >
            {uiLanguage === "fr"
              ? "Intelligence de carrière amplifiée"
              : "Career intelligence amplified"}
          </div>
        </div>
      </div>

      <nav
        className="row"
        style={{
          position: "relative",
          zIndex: 1,
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <NavLink
          href="/dashboard"
          icon={<ChartIcon size={14} />}
          label={copy.common.dashboard}
        />

        <NavLink
          href="/session"
          icon={<SessionIcon size={14} />}
          label={uiLanguage === "fr" ? "Coaching" : "Coaching"}
        />

        <NavLink
          href="/history"
          icon={<BrainIcon size={14} />}
          label={uiLanguage === "fr" ? "Historique" : "History"}
        />

        <NavLink
          href="/recommendations"
          icon={<ActionListIcon size={14} />}
          label={copy.common.recommendations}
        />

        <NavLink
          href="/ai-artifacts"
          icon={<LayerIcon size={14} />}
          label={uiLanguage === "fr" ? "Guides IA" : "AI Guides"}
        />

        <NavLink
          href="/career-blueprint"
          icon={<PathIcon size={14} />}
          label={uiLanguage === "fr" ? "Blueprint" : "Blueprint"}
        />

        <button
          className="button ghost"
          onClick={handleLogout}
          type="button"
          style={{
            minHeight: 40,
            borderRadius: 999,
            background: "rgba(255,255,255,0.66)",
            border: "1px solid rgba(43,33,24,0.08)",
            color: "var(--coach-ink)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowRightIcon size={14} />
            {uiLanguage === "fr" ? "Déconnexion" : "Logout"}
          </span>
        </button>
      </nav>
    </header>
  );
}