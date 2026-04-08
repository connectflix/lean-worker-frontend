"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { Topbar } from "@/components/topbar";
import { useCurrentUser } from "@/components/user-context";
import type { SupportedUiLanguage } from "@/lib/user-locales";

export function WorkspaceShell({
  uiLanguage,
  title,
  firstName,
  isAdmin = false,
  left,
  center,
  right,
  layout = "workspace",
}: {
  uiLanguage: SupportedUiLanguage;
  title: string;
  firstName?: string | null;
  isAdmin?: boolean;
  left?: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
  layout?: "workspace" | "page";
}) {
  const { user } = useCurrentUser();

  const resolvedFirstName =
    firstName ??
    user?.given_name ??
    user?.display_name ??
    null;

  const workspaceLayoutClassName = (() => {
    if (left && right) return "workspace-layout workspace-layout--three";
    if (left && !right) return "workspace-layout workspace-layout--left-center";
    if (!left && right) return "workspace-layout workspace-layout--center-right";
    return "workspace-layout workspace-layout--center-only";
  })();

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
          {layout === "page" ? (
            <div className="page-wrap">{center}</div>
          ) : (
            <div className={workspaceLayoutClassName}>
              {left ? <aside className="workspace-left">{left}</aside> : null}
              <section className="workspace-center">{center}</section>
              {right ? <aside className="workspace-right">{right}</aside> : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}