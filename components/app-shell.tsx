"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { Topbar } from "@/components/topbar";
import { useCurrentUser } from "@/components/user-context";
import type { SupportedUiLanguage } from "@/lib/user-locales";

export function AppShell({
  uiLanguage = "fr",
  title,
  firstName,
  isAdmin = false,
  children,
}: {
  uiLanguage?: SupportedUiLanguage;
  title: string;
  firstName?: string | null;
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  const { user } = useCurrentUser();

  const resolvedFirstName =
    firstName ??
    user?.given_name ??
    user?.display_name ??
    null;

  return (
    <div
      className="app-shell coach-app-shell"
      lang={uiLanguage}
      data-admin-shell={isAdmin ? "true" : "false"}
    >
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: "fixed",
          left: 16,
          top: 12,
          zIndex: 1000,
          padding: "10px 14px",
          borderRadius: 12,
          background: "var(--coach-ink)",
          color: "#ffffff",
          textDecoration: "none",
          transform: "translateY(-160%)",
          transition: "transform 160ms ease",
        }}
        onFocus={(event) => {
          event.currentTarget.style.transform = "translateY(0)";
        }}
        onBlur={(event) => {
          event.currentTarget.style.transform = "translateY(-160%)";
        }}
      >
        {uiLanguage === "fr" ? "Aller au contenu principal" : "Skip to main content"}
      </a>

      <SidebarNav uiLanguage={uiLanguage} isAdmin={isAdmin} />

      <div className="main-shell">
        <Topbar
          uiLanguage={uiLanguage}
          title={title}
          firstName={resolvedFirstName}
        />

        <main
          id="main-content"
          className="content-area"
          tabIndex={-1}
          aria-label={
            uiLanguage === "fr"
              ? `Contenu principal : ${title}`
              : `Main content: ${title}`
          }
        >
          <div className="page-wrap">{children}</div>
        </main>
      </div>
    </div>
  );
}