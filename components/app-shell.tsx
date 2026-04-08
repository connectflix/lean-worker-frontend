"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { Topbar } from "@/components/topbar";
import { useCurrentUser } from "@/components/user-context";
import type { SupportedUiLanguage } from "@/lib/user-locales";

export function AppShell({
  uiLanguage,
  title,
  firstName,
  isAdmin = false,
  children,
}: {
  uiLanguage: SupportedUiLanguage;
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
    <div className="app-shell">
      <SidebarNav uiLanguage={uiLanguage} isAdmin={isAdmin} />

      <div className="main-shell">
        <Topbar
          uiLanguage={uiLanguage}
          title={title}
          firstName={resolvedFirstName}
        />

        <main className="content-area">
          <div className="page-wrap">{children}</div>
        </main>
      </div>
    </div>
  );
}