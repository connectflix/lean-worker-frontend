// components/sidebar-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearToken } from "@/lib/auth";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  ActionListIcon,
  ArrowRightIcon,
  BrainIcon,
  ChartIcon,
  LayerIcon,
  PathIcon,
  SessionIcon,
  UserCardIcon,
} from "@/components/ui-flat-icons";

function BrandMark() {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 18,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(255,122,89,0.22), rgba(88,180,174,0.16))",
        border: "1px solid rgba(255,122,89,0.18)",
        boxShadow:
          "0 16px 34px rgba(120,72,42,0.10), inset 0 1px 0 rgba(255,255,255,0.65)",
        fontWeight: 900,
        fontSize: 17,
        letterSpacing: "-0.05em",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          background: "linear-gradient(135deg, var(--coach-accent), var(--coach-calm))",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        LW
      </span>
    </div>
  );
}

function NavIcon({
  href,
  active,
}: {
  href: string;
  active: boolean;
}) {
  const color = active ? "var(--coach-accent)" : "currentColor";

  if (href === "/dashboard") return <ChartIcon size={16} color={color} />;
  if (href === "/session") return <SessionIcon size={16} color={color} />;
  if (href === "/recommendations") return <ActionListIcon size={16} color={color} />;
  if (href === "/ai-artifacts") return <LayerIcon size={16} color={color} />;
  if (href === "/career-blueprint") return <PathIcon size={16} color={color} />;
  if (href === "/account/subscription") return <UserCardIcon size={16} color={color} />;
  if (href === "/history") return <BrainIcon size={16} color={color} />;
  if (href === "/admin/quality") return <UserCardIcon size={16} color={color} />;

  return <ArrowRightIcon size={16} color={color} />;
}

export function SidebarNav({
  uiLanguage,
  isAdmin = false,
}: {
  uiLanguage: SupportedUiLanguage;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  const items = [
    {
      href: "/dashboard",
      label: uiLanguage === "fr" ? "Tableau de bord" : "Dashboard",
    },
    {
      href: "/session",
      label: uiLanguage === "fr" ? "Coaching" : "Coaching",
    },
    {
      href: "/recommendations",
      label: uiLanguage === "fr" ? "Recommandations" : "Recommendations",
    },
    {
      href: "/ai-artifacts",
      label: uiLanguage === "fr" ? "Guides IA" : "AI Guides",
    },
    {
      href: "/career-blueprint",
      label: uiLanguage === "fr" ? "Blueprint carrière" : "Career Blueprint",
    },
    {
      href: "/account/subscription",
      label: uiLanguage === "fr" ? "Abonnement" : "Subscription",
    },
    {
      href: "/history",
      label: uiLanguage === "fr" ? "Historique" : "History",
    },
  ];

  if (isAdmin) {
    items.push({
      href: "/admin/quality",
      label: uiLanguage === "fr" ? "Admin" : "Admin",
    });
  }

  return (
    <aside
      className="sidebar coach-sidebar"
      style={{
        position: "relative",
        padding: 16,
        borderRadius: 30,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,241,220,0.72))",
        boxShadow:
          "0 26px 70px rgba(120,72,42,0.10), inset 0 1px 0 rgba(255,255,255,0.78)",
        backdropFilter: "blur(14px)",
        minHeight: "calc(100vh - 32px)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 30,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at top left, rgba(255,122,89,0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(88,180,174,0.12), transparent 32%)",
        }}
      />

      <div
        className="stack"
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          gap: 20,
        }}
      >
        <div
          className="brand-block"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 6px 12px",
            borderBottom: "1px solid rgba(43,33,24,0.08)",
            marginBottom: 0,
          }}
        >
          <BrandMark />

          <div className="stack" style={{ gap: 2, minWidth: 0 }}>
            <p
              className="brand-title"
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 850,
                letterSpacing: "-0.04em",
                color: "var(--coach-ink)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              LeanWorker
            </p>

            <p
              className="brand-subtitle"
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--coach-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {uiLanguage === "fr"
                ? "Ton espace de progression"
                : "Your growth workspace"}
            </p>
          </div>
        </div>

        <div
          className="nav-section"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span
            className="nav-section-label"
            style={{
              fontSize: 11,
              fontWeight: 850,
              letterSpacing: "0.08em",
              color: "var(--coach-muted)",
              padding: "0 10px",
              textTransform: "uppercase",
            }}
          >
            {uiLanguage === "fr" ? "Parcours" : "Journey"}
          </span>

          <div className="stack" style={{ gap: 7 }}>
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? "active" : ""}`}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "12px 12px",
                    borderRadius: 18,
                    textDecoration: "none",
                    color: active ? "var(--coach-ink)" : "var(--coach-muted)",
                    background: active
                      ? "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,241,220,0.92))"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(255,122,89,0.22)"
                      : "1px solid transparent",
                    boxShadow: active
                      ? "0 14px 30px rgba(120,72,42,0.10), inset 0 1px 0 rgba(255,255,255,0.76)"
                      : "none",
                    transition:
                      "background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease, transform 160ms ease",
                  }}
                >
                  {active ? (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 10,
                        bottom: 10,
                        width: 4,
                        borderRadius: 999,
                        background:
                          "linear-gradient(180deg, var(--coach-accent), var(--coach-calm))",
                      }}
                    />
                  ) : null}

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        color: active ? "var(--coach-accent)" : "var(--coach-muted)",
                        background: active
                          ? "rgba(255,122,89,0.12)"
                          : "rgba(43,33,24,0.045)",
                        transition: "all 180ms ease",
                        flexShrink: 0,
                      }}
                    >
                      <NavIcon href={item.href} active={active} />
                    </span>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: active ? 750 : 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.label}
                    </span>
                  </span>

                  <span
                    style={{
                      opacity: active ? 1 : 0.38,
                      transform: active ? "translateX(0)" : "translateX(-3px)",
                      transition: "all 180ms ease",
                      flexShrink: 0,
                      color: active ? "var(--coach-accent)" : "var(--coach-muted)",
                    }}
                  >
                    <ArrowRightIcon size={14} color="currentColor" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 9,
            padding: 15,
            borderRadius: 22,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,241,220,0.82))",
            border: "1px solid rgba(255,122,89,0.14)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
          }}
        >
          <div
            className="section-title"
            style={{
              margin: 0,
              fontSize: 14,
              color: "var(--coach-ink)",
            }}
          >
            {uiLanguage === "fr" ? "Ton espace personnel" : "Your personal space"}
          </div>

          <div
            className="muted"
            style={{
              fontSize: 12,
              lineHeight: 1.55,
              color: "var(--coach-muted)",
            }}
          >
            {uiLanguage === "fr"
              ? "Un espace calme pour clarifier, décider et avancer sans te disperser."
              : "A calm space to clarify, decide, and move forward without scattering your energy."}
          </div>
        </div>

        <div style={{ marginTop: "auto" }} className="stack">
          <button
            className="button ghost"
            style={{
              width: "100%",
              minHeight: 46,
              borderRadius: 18,
              background: "rgba(255,255,255,0.68)",
              color: "var(--coach-ink)",
              border: "1px solid rgba(43,33,24,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.68)",
            }}
            onClick={() => {
              clearToken();
              window.location.href = "/";
            }}
            type="button"
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <ArrowRightIcon size={14} />
              {uiLanguage === "fr" ? "Déconnexion" : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}