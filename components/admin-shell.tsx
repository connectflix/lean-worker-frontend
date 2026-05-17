"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { clearAdminToken } from "@/lib/admin-auth";

type AdminRole = "admin" | "organization";

type AdminNavSection = "overview" | "operations" | "catalog" | "enablement" | "account";

type AdminNavItem = {
  label: string;
  href: string;
  section: AdminNavSection;
  roles: AdminRole[];
  description?: string;
};

type AdminShellProps = {
  title: string;
  subtitle?: string;
  adminEmail?: string | null;
  adminRole?: AdminRole;
  adminOrganizationName?: string | null;
  activeHref?: string;
  children: ReactNode;
};

const NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    section: "overview",
    roles: ["admin"],
    description: "Operational overview",
  },
  {
    label: "Orchestration",
    href: "/admin/orchestration",
    section: "operations",
    roles: ["admin"],
    description: "Agent orchestration runs",
  },
  {
    label: "Agent Reports",
    href: "/admin/agent-reports",
    section: "operations",
    roles: ["admin"],
    description: "Support, tech, business and CX signals",
  },
  {
    label: "Manage Levers",
    href: "/admin/levers",
    section: "catalog",
    roles: ["admin"],
    description: "Coaches, resources and offers catalog",
  },
  {
    label: "Manage Workers",
    href: "/admin/workers",
    section: "catalog",
    roles: ["admin"],
    description: "Worker directory and worker intelligence",
  },
  {
    label: "Manage Organizations",
    href: "/admin/organizations",
    section: "catalog",
    roles: ["admin", "organization"],
    description: "Organization workspace and assigned workers",
  },
  {
    label: "Manage Bookings",
    href: "/admin/bookings",
    section: "catalog",
    roles: ["admin", "organization"],
    description: "Bookings and appointments",
  },
  {
    label: "Coaching Flow",
    href: "/admin/coaching-flow",
    section: "enablement",
    roles: ["admin", "organization"],
    description: "Guided coaching execution flow",
  },
  {
    label: "Coaching Guide",
    href: "/admin/coaching-guide",
    section: "enablement",
    roles: ["admin", "organization"],
    description: "Coaching methodology and guidance",
  },
  {
    label: "Change password",
    href: "/admin/change-password",
    section: "account",
    roles: ["admin", "organization"],
    description: "Account security",
  },
];

const SECTIONS: AdminNavSection[] = [
  "overview",
  "operations",
  "catalog",
  "enablement",
  "account",
];

function sectionLabel(section: AdminNavSection): string {
  if (section === "overview") return "Overview";
  if (section === "operations") return "Operations";
  if (section === "catalog") return "Catalog";
  if (section === "enablement") return "Enablement";
  return "Account";
}

function getInitials(value?: string | null, fallback = "LW"): string {
  const cleaned = (value || "").trim();

  if (!cleaned) return fallback;

  const parts = cleaned.split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return fallback;

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function isNavItemActive(activeHref: string, itemHref: string): boolean {
  if (itemHref === "/admin") {
    return activeHref === "/admin";
  }

  return activeHref === itemHref || activeHref.startsWith(`${itemHref}/`);
}

function getRoleLabel(adminRole: AdminRole): string {
  if (adminRole === "organization") return "Organization workspace";
  return "LeanWorker control";
}

function getDisplayName(
  adminRole: AdminRole,
  adminOrganizationName?: string | null,
): string {
  if (adminRole === "organization") {
    return adminOrganizationName || "Organization";
  }

  return "Admin";
}

function getRoleBadgeLabel(adminRole: AdminRole): string {
  if (adminRole === "organization") return "Organization";
  return "Platform admin";
}

function getRoleDescription(adminRole: AdminRole): string {
  if (adminRole === "organization") {
    return "Scoped access to organization workers, conversations, bookings and coaching assets.";
  }

  return "Centralized operations, orchestration, catalog and governance workspace.";
}

export function AdminShell({
  title,
  subtitle,
  adminEmail,
  adminRole = "admin",
  adminOrganizationName = null,
  activeHref = "/admin",
  children,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = getDisplayName(adminRole, adminOrganizationName);
  const roleLabel = getRoleLabel(adminRole);

  const visibleNavItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => item.roles.includes(adminRole));
  }, [adminRole]);

  const activeItem = useMemo(() => {
    return (
      visibleNavItems.find((item) => isNavItemActive(activeHref, item.href)) ??
      visibleNavItems[0] ??
      null
    );
  }, [activeHref, visibleNavItems]);

  function handleLogout() {
    clearAdminToken();
    window.location.href = "/admin/login";
  }

  const shellStyle = {
    "--sidebar-width": "292px",
  } as CSSProperties;

  return (
    <div
      className="app-shell admin-app-shell"
      style={{
        ...shellStyle,
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(99,102,241,0.10), transparent 32%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <aside
        className="sidebar"
        style={{
          padding: 18,
          background: "transparent",
          borderRight: "none",
        }}
      >
        <div
          className="admin-sidebar-card stack"
          style={{
            gap: 16,
            height: "100%",
            padding: 14,
            borderRadius: 28,
            background: "rgba(255,255,255,0.82)",
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 22px 55px rgba(15,23,42,0.08)",
            backdropFilter: "blur(18px)",
            overflow: "hidden",
          }}
        >
          <div
            className="admin-brand-block"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 8px 14px",
              borderBottom: "1px solid rgba(15,23,42,0.08)",
            }}
          >
            <div
              className="brand-logo"
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                boxShadow: "0 12px 28px rgba(79,70,229,0.18)",
                background:
                  "linear-gradient(135deg, rgba(79,70,229,1), rgba(124,58,237,0.92))",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              LW
            </div>

            <div style={{ minWidth: 0 }}>
              <h2
                className="brand-title"
                style={{
                  fontSize: 16,
                  letterSpacing: "-0.03em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: 0,
                  color: "#0f172a",
                }}
              >
                {adminRole === "organization" ? "LeanWorker Org" : "LeanWorker Admin"}
              </h2>

              <p
                className="brand-subtitle"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: "2px 0 0",
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                {roleLabel}
              </p>
            </div>
          </div>

          <nav
            className="stack"
            aria-label="Admin navigation"
            style={{
              gap: 16,
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: 2,
            }}
          >
            {SECTIONS.map((section) => {
              const items = visibleNavItems.filter((item) => item.section === section);

              if (items.length === 0) return null;

              return (
                <div key={section} className="nav-section">
                  <div
                    className="nav-section-label"
                    style={{
                      padding: "4px 10px 7px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontSize: 11,
                      fontWeight: 900,
                      color: "#94a3b8",
                    }}
                  >
                    {sectionLabel(section)}
                  </div>

                  <div className="stack" style={{ gap: 5 }}>
                    {items.map((item) => {
                      const isActive = isNavItemActive(activeHref, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`nav-item ${isActive ? "active" : ""}`}
                          title={item.description}
                          style={{
                            minHeight: 44,
                            borderRadius: 15,
                            padding: "10px 11px",
                            border: isActive
                              ? "1px solid rgba(79,70,229,0.20)"
                              : "1px solid transparent",
                            background: isActive
                              ? "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.07))"
                              : "transparent",
                            color: isActive ? "#3730a3" : "#1e293b",
                            fontWeight: isActive ? 800 : 600,
                            boxShadow: isActive
                              ? "0 10px 24px rgba(79,70,229,0.10)"
                              : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            textDecoration: "none",
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              flexShrink: 0,
                              background: isActive
                                ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                                : "rgba(148,163,184,0.45)",
                            }}
                          />

                          <span
                            style={{
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <div
            className="card-soft stack"
            style={{
              gap: 12,
              padding: 14,
              borderRadius: 22,
              background:
                "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(255,255,255,0.90))",
              border: "1px solid rgba(15,23,42,0.08)",
              boxShadow: "0 12px 32px rgba(15,23,42,0.05)",
            }}
          >
            <div className="row" style={{ gap: 10, alignItems: "center", minWidth: 0 }}>
              <span
                className="avatar-circle"
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 14,
                  background: "rgba(79,70,229,0.10)",
                  color: "#3730a3",
                  fontWeight: 900,
                }}
              >
                {getInitials(displayName, adminRole === "organization" ? "O" : "A")}
              </span>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#0f172a",
                  }}
                  title={displayName}
                >
                  {displayName}
                </div>

                {adminEmail ? (
                  <div
                    className="muted"
                    style={{
                      fontSize: 12,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={adminEmail}
                  >
                    {adminEmail}
                  </div>
                ) : (
                  <div className="muted" style={{ fontSize: 12 }}>
                    {getRoleBadgeLabel(adminRole)}
                  </div>
                )}
              </div>
            </div>

            <div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
              {getRoleDescription(adminRole)}
            </div>

            <button
              className="button ghost"
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                justifyContent: "center",
                minHeight: 40,
                borderRadius: 14,
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div
        className="main-shell"
        style={{
          minWidth: 0,
        }}
      >
        <header
          className="topbar"
          style={{
            minHeight: 82,
            height: "auto",
            padding: "16px 24px",
            gap: 14,
            background: "rgba(255,255,255,0.78)",
            borderBottom: "1px solid rgba(15,23,42,0.08)",
            backdropFilter: "blur(18px)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div className="stack" style={{ gap: 6, minWidth: 0, flex: 1 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              {activeItem ? (
                <span
                  className="badge"
                  style={{
                    background: "rgba(79,70,229,0.10)",
                    color: "#3730a3",
                    borderColor: "rgba(79,70,229,0.16)",
                    fontWeight: 800,
                  }}
                >
                  {sectionLabel(activeItem.section)}
                </span>
              ) : null}

              <span
                className="badge"
                style={{
                  background: "rgba(15,23,42,0.05)",
                  color: "#334155",
                  borderColor: "rgba(15,23,42,0.08)",
                  fontWeight: 800,
                }}
              >
                {getRoleBadgeLabel(adminRole)}
              </span>
            </div>

            <div
              className="topbar-title"
              style={{
                fontSize: 21,
                lineHeight: 1.16,
                letterSpacing: "-0.045em",
                fontWeight: 850,
                color: "#0f172a",
              }}
            >
              {title}
            </div>

            {subtitle ? (
              <div
                className="muted"
                style={{
                  maxWidth: 980,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.45,
                }}
                title={subtitle}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          <div
            className="topbar-right"
            style={{
              gap: 10,
              alignItems: "center",
            }}
          >
            <div
              className="user-pill"
              style={{
                background: "rgba(255,255,255,0.86)",
                border: "1px solid rgba(15,23,42,0.08)",
                boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
                borderRadius: 999,
                padding: "7px 10px 7px 7px",
              }}
            >
              <span
                className="avatar-circle"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 13,
                  background: "rgba(79,70,229,0.10)",
                  color: "#3730a3",
                  fontWeight: 900,
                }}
              >
                {getInitials(displayName, adminRole === "organization" ? "O" : "A")}
              </span>

              <div className="stack" style={{ gap: 0, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#0f172a",
                  }}
                  title={displayName}
                >
                  {displayName}
                </span>

                <span className="muted" style={{ fontSize: 12 }}>
                  {roleLabel}
                </span>
              </div>
            </div>

            <button
              className="button ghost"
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-nav"
              style={{
                minHeight: 40,
                borderRadius: 14,
              }}
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </header>

        {mobileMenuOpen ? (
          <nav
            id="admin-mobile-nav"
            className="card-soft"
            aria-label="Admin mobile navigation"
            style={{
              margin: "14px 24px 0",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              position: "sticky",
              top: 88,
              zIndex: 18,
              background: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 22,
              boxShadow: "0 16px 36px rgba(15,23,42,0.08)",
            }}
          >
            {visibleNavItems.map((item) => {
              const isActive = isNavItemActive(activeHref, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? "button" : "button ghost"}
                  onClick={() => setMobileMenuOpen(false)}
                  title={item.description}
                  style={{
                    minHeight: 38,
                    borderRadius: 999,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              className="button ghost"
              type="button"
              onClick={handleLogout}
              style={{
                minHeight: 38,
                color: "var(--danger)",
                borderRadius: 999,
              }}
            >
              Log out
            </button>
          </nav>
        ) : null}

        <main
          className="content-area"
          style={{
            padding: "24px",
          }}
        >
          <div
            className="page-wrap"
            style={{
              maxWidth: "100%",
              width: "100%",
              minWidth: 0,
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}