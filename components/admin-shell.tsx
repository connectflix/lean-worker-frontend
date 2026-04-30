"use client";

import Link from "next/link";
import { clearAdminToken } from "@/lib/admin-auth";

type AdminNavItem = {
  label: string;
  href: string;
  section: "overview" | "operations" | "catalog" | "account";
  roles: Array<"admin" | "organization">;
};

type AdminShellProps = {
  title: string;
  subtitle?: string;
  adminEmail?: string | null;
  adminRole?: "admin" | "organization";
  activeHref?: string;
  children: React.ReactNode;
};

const NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    section: "overview",
    roles: ["admin"],
  },

  {
    label: "Orchestration",
    href: "/admin/orchestration",
    section: "operations",
    roles: ["admin"],
  },
  {
    label: "Agent Reports",
    href: "/admin/agent-reports",
    section: "operations",
    roles: ["admin"],
  },

  {
    label: "Manage Levers",
    href: "/admin/levers",
    section: "catalog",
    roles: ["admin"],
  },
  {
    label: "Manage Workers",
    href: "/admin/workers",
    section: "catalog",
    roles: ["admin"],
  },
  {
    label: "Manage Organizations",
    href: "/admin/organizations",
    section: "catalog",
    roles: ["admin", "organization"],
  },

  {
    label: "Change password",
    href: "/admin/change-password",
    section: "account",
    roles: ["admin", "organization"],
  },
];

function sectionLabel(section: AdminNavItem["section"]): string {
  if (section === "overview") return "OVERVIEW";
  if (section === "operations") return "OPERATIONS";
  if (section === "catalog") return "CATALOG";
  return "ACCOUNT";
}

export function AdminShell({
  title,
  subtitle,
  adminEmail,
  adminRole = "admin",
  activeHref = "/admin",
  children,
}: AdminShellProps) {
  const sections: AdminNavItem["section"][] = ["overview", "operations", "catalog", "account"];

  function handleLogout() {
    clearAdminToken();
    window.location.href = "/admin/login";
  }

  return (
    <div
      className="app-shell admin-app-shell"
      style={
        {
          ["--sidebar-width" as string]: "260px",
        } as React.CSSProperties
      }
    >
      <aside className="sidebar">
        <div className="card admin-sidebar-card stack" style={{ gap: 18, height: "100%" }}>
          <div className="brand-block admin-brand-block">
            <div className="brand-logo">LW</div>
            <div>
              <h2 className="brand-title">
                {adminRole === "organization" ? "LeanWorker Organization" : "LeanWorker Admin"}
              </h2>
              <p className="brand-subtitle">
                {adminRole === "organization"
                  ? "Organization workspace"
                  : "Operations & control center"}
              </p>
            </div>
          </div>

          <div className="stack" style={{ gap: 14, flex: 1 }}>
            {sections.map((section) => {
              const items = NAV_ITEMS.filter(
                (item) => item.section === section && item.roles.includes(adminRole),
              );

              if (items.length === 0) return null;

              return (
                <div key={section} className="nav-section">
                  <div className="nav-section-label">{sectionLabel(section)}</div>

                  {items.map((item) => {
                    const isActive =
                      activeHref === item.href ||
                      (item.href !== "/admin" && activeHref.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${isActive ? "active" : ""}`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="card-soft stack" style={{ gap: 10 }}>
            <div className="section-title" style={{ fontSize: 14 }}>
              {adminRole === "organization" ? "Organization space" : "Admin space"}
            </div>

            <div className="muted">
              {adminRole === "organization"
                ? "Access limited to organization workers and related information."
                : "Centralized monitoring, orchestration, and governance."}
            </div>

            {adminEmail ? (
              <div className="muted" style={{ fontSize: 13 }}>
                Signed in as {adminEmail}
              </div>
            ) : null}

            <button className="button ghost" type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <div className="topbar">
          <div className="stack" style={{ gap: 2, minWidth: 0 }}>
            <div className="topbar-title">{title}</div>
            {subtitle ? <div className="muted">{subtitle}</div> : null}
          </div>

          <div className="topbar-right">
            <div className="user-pill">
              <span className="avatar-circle">{adminRole === "organization" ? "O" : "A"}</span>
              <div className="stack" style={{ gap: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {adminRole === "organization" ? "Organization" : "Admin"}
                </span>
                <span className="muted" style={{ fontSize: 12 }}>
                  LeanWorker control
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
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
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}