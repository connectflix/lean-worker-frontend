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
          className="content-area workspace-content-area"
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
          grid-template-columns:
            minmax(240px, 280px)
            minmax(0, 1fr)
            minmax(300px, 340px);
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

        @media (max-width: 1780px) and (min-width: 1381px) {
          .workspace-content-area {
            overflow: hidden;
          }

          .workspace-layout {
            height: calc(100dvh - 190px);
            min-height: 610px;
            overflow: hidden;
            gap: 14px;
            align-items: stretch;
          }

          .workspace-layout--three {
            grid-template-columns:
              minmax(205px, 225px)
              minmax(520px, 1fr)
              minmax(250px, 280px);
          }

          .workspace-layout--left-center {
            grid-template-columns: minmax(205px, 225px) minmax(0, 1fr);
          }

          .workspace-layout--center-right {
            grid-template-columns: minmax(0, 1fr) minmax(250px, 280px);
          }

          .workspace-left,
          .workspace-center,
          .workspace-right {
            height: 100%;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: thin;
            overscroll-behavior: contain;
          }

          .workspace-center {
            overflow: hidden;
          }

          .session-cockpit-column {
            height: 100%;
            min-height: 0;
            display: flex;
            flex-direction: column;
          }

          .session-cockpit-column > .card {
            flex: 0 0 auto;
          }

          .session-cockpit-column > .chat-surface {
            flex: 1 1 auto;
            min-height: 0;
            overflow: hidden;
          }

          .workspace-left .card,
          .workspace-right .card {
            padding: 18px !important;
            border-radius: 24px !important;
          }

          .workspace-left .stack,
          .workspace-right .stack {
            gap: 12px;
          }

          .workspace-left .section-title,
          .workspace-right .section-title {
            font-size: 16px;
            line-height: 1.25;
          }

          .workspace-left .muted,
          .workspace-right .muted {
            font-size: 13px;
            line-height: 1.48 !important;
          }

          .workspace-left .button,
          .workspace-right .button {
            min-height: 40px;
            padding-top: 9px;
            padding-bottom: 9px;
          }

          .workspace-left .badge,
          .workspace-right .badge {
            font-size: 11px;
          }
        }

        @media (max-width: 1380px) {
          .workspace-layout {
            gap: 16px;
          }

          .workspace-layout--three {
            grid-template-columns: minmax(0, 1fr) minmax(250px, 290px);
            grid-template-areas:
              "center right"
              "left left";
          }

          .workspace-layout--three .workspace-center {
            grid-area: center;
          }

          .workspace-layout--three .workspace-right {
            grid-area: right;
          }

          .workspace-layout--three .workspace-left {
            grid-area: left;
          }

          .workspace-layout--three .workspace-left > .stack {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            align-items: start;
          }

          .workspace-layout--left-center,
          .workspace-layout--center-right {
            grid-template-columns: minmax(0, 1fr);
          }
        }


        /*
         * Measured compact-laptop viewport:
         * 1512 × 791 CSS pixels.
         * Keep the central coaching experience fully visible and allow
         * only the side rails to scroll independently.
         */
        @media (max-width: 1600px) and (max-height: 850px) and (min-width: 1100px) {
          .workspace-content-area {
            overflow: hidden !important;
          }

          .workspace-layout {
            height: calc(100dvh - 178px) !important;
            min-height: 0 !important;
            overflow: hidden !important;
            gap: 12px !important;
            align-items: stretch !important;
          }

          .workspace-layout--three {
            grid-template-columns:
              minmax(205px, 220px)
              minmax(0, 1fr)
              minmax(250px, 270px) !important;
          }

          .workspace-left,
          .workspace-right {
            height: 100% !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            scrollbar-width: thin;
            overscroll-behavior: contain;
          }

          .workspace-center {
            height: 100% !important;
            min-height: 0 !important;
            overflow: hidden !important;
          }

          .session-cockpit-column {
            height: 100% !important;
            min-height: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }

          .session-cockpit-column > .card {
            flex: 0 0 auto !important;
            padding: 16px !important;
          }

          .session-cockpit-column > .chat-surface {
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow: hidden !important;
          }

          .workspace-left .card,
          .workspace-right .card {
            padding: 16px !important;
            border-radius: 22px !important;
          }

          .workspace-left .stack,
          .workspace-right .stack {
            gap: 10px !important;
          }

          .workspace-left .section-title,
          .workspace-right .section-title {
            font-size: 15px !important;
            line-height: 1.2 !important;
          }

          .workspace-left .muted,
          .workspace-right .muted {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }

          .workspace-left .button,
          .workspace-right .button {
            min-height: 38px !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
        }

        @media (max-width: 980px) {
          .workspace-content-area {
            overflow: visible;
          }

          .workspace-layout {
            height: auto;
            min-height: 0;
            overflow: visible;
          }

          .workspace-layout--three {
            grid-template-columns: minmax(0, 1fr);
            grid-template-areas:
              "center"
              "left"
              "right";
          }

          .workspace-layout--three .workspace-left > .stack {
            grid-template-columns: minmax(0, 1fr);
          }

          .workspace-left,
          .workspace-center,
          .workspace-right {
            height: auto;
            overflow: visible;
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