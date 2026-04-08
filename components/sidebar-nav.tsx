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
        width: 44,
        height: 44,
        borderRadius: 14,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(16,185,129,0.14))",
        border: "1px solid rgba(37,99,235,0.18)",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.5)",
        fontWeight: 800,
        fontSize: 17,
        letterSpacing: "-0.04em",
        flexShrink: 0,
      }}
      aria-hidden="true"
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

function NavIcon({
  href,
  active,
}: {
  href: string;
  active: boolean;
}) {
  const color = active ? "var(--primary)" : "currentColor";

  if (href === "/dashboard") return <ChartIcon size={16} color={color} />;
  if (href === "/session") return <SessionIcon size={16} color={color} />;
  if (href === "/recommendations") return <ActionListIcon size={16} color={color} />;
  if (href === "/ai-artifacts") return <LayerIcon size={16} color={color} />;
  if (href === "/career-blueprint") return <PathIcon size={16} color={color} />;
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
      label: uiLanguage === "fr" ? "Guides AI" : "AI Guides",
    },
    {
      href: "/career-blueprint",
      label: uiLanguage === "fr" ? "Blueprint" : "Blueprint",
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
      className="sidebar"
      style={{
        position: "relative",
        padding: 16,
        borderRadius: 28,
        border: "1px solid rgba(15,23,42,0.06)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98))",
        boxShadow:
          "0 24px 60px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        minHeight: "calc(100vh - 32px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at top left, rgba(37,99,235,0.06), transparent 28%)",
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
            padding: "8px 6px 4px 6px",
          }}
        >
          <BrandMark />

          <div className="stack" style={{ gap: 2 }}>
            <p
              className="brand-title"
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              LeanWorker
            </p>
            <p
              className="brand-subtitle"
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--muted-foreground, #64748b)",
              }}
            >
              {uiLanguage === "fr"
                ? "Career intelligence amplifiée"
                : "Career intelligence amplified"}
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
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "var(--muted-foreground, #64748b)",
              padding: "0 10px",
              textTransform: "uppercase",
            }}
          >
            {uiLanguage === "fr" ? "Espace de travail" : "Workspace"}
          </span>

          <div className="stack" style={{ gap: 6 }}>
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
                    borderRadius: 16,
                    textDecoration: "none",
                    color: active ? "var(--foreground)" : "inherit",
                    background: active
                      ? "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(241,245,249,0.95))"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(37,99,235,0.14)"
                      : "1px solid transparent",
                    boxShadow: active
                      ? "0 8px 24px rgba(37,99,235,0.08), inset 0 1px 0 rgba(255,255,255,0.75)"
                      : "none",
                    transition: "all 180ms ease",
                  }}
                >
                  {active ? (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 8,
                        bottom: 8,
                        width: 3,
                        borderRadius: 999,
                        background: "linear-gradient(180deg, #2563eb, #10b981)",
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
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        display: "grid",
                        placeItems: "center",
                        background: active ? "rgba(37,99,235,0.08)" : "rgba(15,23,42,0.04)",
                        transition: "all 180ms ease",
                        flexShrink: 0,
                      }}
                    >
                      <NavIcon href={item.href} active={active} />
                    </span>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: active ? 600 : 500,
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
                      opacity: active ? 1 : 0.45,
                      transform: active ? "translateX(0)" : "translateX(-2px)",
                      transition: "all 180ms ease",
                      flexShrink: 0,
                    }}
                  >
                    <ArrowRightIcon
                      size={14}
                      color={active ? "var(--primary)" : "currentColor"}
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 8,
            padding: 14,
            borderRadius: 18,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(248,250,252,0.92))",
            border: "1px solid rgba(15,23,42,0.06)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          <div
            className="section-title"
            style={{
              margin: 0,
              fontSize: 13,
            }}
          >
            {uiLanguage === "fr" ? "Espace personnel" : "Personal workspace"}
          </div>

          <div
            className="muted"
            style={{
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {uiLanguage === "fr"
              ? "Coaching, mémoire, recommandations et guides IA réunis dans un même espace."
              : "Coaching, memory, recommendations, and AI guides in one workspace."}
          </div>
        </div>

        <div style={{ marginTop: "auto" }} className="stack">
          <button
            className="button ghost"
            style={{
              width: "100%",
              minHeight: 46,
              borderRadius: 16,
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(15,23,42,0.08)",
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