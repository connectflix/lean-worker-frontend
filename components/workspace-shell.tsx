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

      <style jsx global>{`
        .workspace-layout {
          display: grid;
          width: 100%;
          min-width: 0;
          gap: 24px;
          align-items: start;
        }

        .workspace-layout--three {
          grid-template-columns: minmax(240px, 280px) minmax(0, 1fr) minmax(300px, 340px);
        }

        .workspace-layout--left-center {
          grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
        }

        .workspace-layout--center-right {
          grid-template-columns: minmax(0, 1fr) minmax(300px, 340px);
        }

        .workspace-layout--center-only {
          grid-template-columns: minmax(0, 1fr);
        }

        .workspace-left,
        .workspace-center,
        .workspace-right {
          min-width: 0;
        }

        .workspace-center {
          width: 100%;
        }

        @media (max-width: 1760px) {
          .workspace-layout {
            gap: 18px;
          }

          .workspace-layout--three {
            grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
            grid-template-areas:
              "left left"
              "center right";
          }

          .workspace-layout--three .workspace-left {
            grid-area: left;
          }

          .workspace-layout--three .workspace-center {
            grid-area: center;
          }

          .workspace-layout--three .workspace-right {
            grid-area: right;
          }

          .workspace-layout--three .workspace-left > .stack {
            display: grid;
            grid-template-columns: minmax(240px, 0.8fr) minmax(0, 1.2fr);
            gap: 18px;
            align-items: start;
          }
        }

        @media (max-width: 1320px) {
          .workspace-layout--three,
          .workspace-layout--left-center,
          .workspace-layout--center-right {
            grid-template-columns: minmax(0, 1fr);
            grid-template-areas:
              "left"
              "center"
              "right";
          }

          .workspace-layout--three .workspace-left > .stack {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .workspace-layout {
            gap: 14px;
          }

          .workspace-layout--three .workspace-left > .stack {
            display: flex;
          }

          .main-shell {
            border-radius: 22px !important;
          }

          .content-area {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}