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
        width: 42,
        height: 42,
        borderRadius: 14,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(16,185,129,0.14))",
        border: "1px solid rgba(37,99,235,0.18)",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.5)",
        fontWeight: 800,
        fontSize: 16,
        letterSpacing: "-0.04em",
      }}
    >
      <span
        style={{
          background: "linear-gradient(135deg, #2563eb, #10b981)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        LW
      </span>
    </div>
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
        marginBottom: 16,
        alignItems: "center",
        padding: "16px 20px",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div className="row" style={{ gap: 12, alignItems: "center" }}>
        <BrandMark />
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title" style={{ margin: 0 }}>
            LeanWorker
          </div>
          <div className="muted">
            {uiLanguage === "fr"
              ? "Intelligence de carrière amplifiée"
              : "Career intelligence amplified"}
          </div>
        </div>
      </div>

      <nav
        className="row"
        style={{
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <Link className="button ghost" href="/dashboard">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ChartIcon size={14} />
            {copy.common.dashboard}
          </span>
        </Link>

        <Link className="button ghost" href="/session">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <SessionIcon size={14} />
            {uiLanguage === "fr" ? "Coaching" : "Coaching"}
          </span>
        </Link>

        <Link className="button ghost" href="/history">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <BrainIcon size={14} />
            {uiLanguage === "fr" ? "Historique" : "History"}
          </span>
        </Link>

        <Link className="button ghost" href="/recommendations">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ActionListIcon size={14} />
            {copy.common.recommendations}
          </span>
        </Link>

        <Link className="button ghost" href="/ai-artifacts">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <LayerIcon size={14} />
            {uiLanguage === "fr" ? "Guides IA" : "AI Guides"}
          </span>
        </Link>

        <Link className="button ghost" href="/career-blueprint">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <PathIcon size={14} />
            {uiLanguage === "fr" ? "Blueprint" : "Blueprint"}
          </span>
        </Link>

        <button className="button ghost" onClick={handleLogout} type="button">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowRightIcon size={14} />
            {uiLanguage === "fr" ? "Déconnexion" : "Logout"}
          </span>
        </button>
      </nav>
    </header>
  );
}