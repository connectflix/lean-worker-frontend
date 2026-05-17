"use client";

import type { ReactNode } from "react";
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
  left?: ReactNode;
  center: ReactNode;
  right?: ReactNode;
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
    <div
      className="app-shell coach-app-shell"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(255,122,89,0.10), transparent 30%), radial-gradient(circle at bottom right, rgba(88,180,174,0.10), transparent 34%), var(--coach-bg)",
      }}
    >
      <SidebarNav uiLanguage={uiLanguage} isAdmin={isAdmin} />

      <div
        className="main-shell"
        style={{
          borderRadius: 32,
          border: "1px solid rgba(43,33,24,0.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,248,239,0.90))",
          boxShadow: "0 24px 70px rgba(43,33,24,0.08)",
        }}
      >
        <Topbar
          uiLanguage={uiLanguage}
          title={title}
          firstName={resolvedFirstName}
        />

        <main
          className="content-area"
          style={{
            background:
              "radial-gradient(circle at 8% 8%, rgba(255,122,89,0.06), transparent 26%), radial-gradient(circle at 92% 18%, rgba(88,180,174,0.06), transparent 28%)",
          }}
        >
          {layout === "page" ? (
            <div className="page-wrap">{center}</div>
          ) : (
            <div className={workspaceLayoutClassName}>
              {left ? (
                <aside
                  className="workspace-left"
                  style={{
                    minWidth: 0,
                  }}
                >
                  {left}
                </aside>
              ) : null}

              <section
                className="workspace-center"
                style={{
                  minWidth: 0,
                }}
              >
                {center}
              </section>

              {right ? (
                <aside
                  className="workspace-right"
                  style={{
                    minWidth: 0,
                  }}
                >
                  {right}
                </aside>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}