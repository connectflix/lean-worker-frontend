"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearToken } from "@/lib/auth";
import type { LearningChapter, Me } from "@/lib/types";

type ElearningShellProps = {
  title: string;
  subtitle?: string;
  user?: Me | null;
  courseId?: number | null;
  chapters?: LearningChapter[];
  progressPercent?: number | null;
  children: React.ReactNode;
};

function getFirstName(user?: Me | null): string {
  return user?.given_name || user?.display_name || "Worker";
}

function formatPercent(value?: number | null): string {
  const normalized = Number(value ?? 0);

  if (!Number.isFinite(normalized)) {
    return "0%";
  }

  return `${Math.round(normalized)}%`;
}

function getChapterProgressLabel(chapter: LearningChapter): string {
  const total = chapter.lessons.length;
  const completed = chapter.lessons.filter((lesson) => {
    return (
      lesson.progress?.status === "completed" ||
      Number(lesson.progress?.progress_percent ?? 0) >= 100
    );
  }).length;

  if (total === 0) return "0/0";
  return `${completed}/${total}`;
}

export function ElearningShell({
  title,
  subtitle,
  user,
  courseId,
  chapters = [],
  progressPercent,
  children,
}: ElearningShellProps) {
  const pathname = usePathname();

  function handleLogout() {
    clearToken();
    window.location.href = "/elearning/login";
  }

  return (
    <div
      className="app-shell elearning-app-shell"
      style={
        {
          ["--sidebar-width" as string]: "310px",
        } as React.CSSProperties
      }
    >
      <aside className="sidebar">
        <div className="card stack" style={{ gap: 18, height: "100%" }}>
          <div className="brand-block">
            <div className="brand-logo">LW</div>
            <div>
              <h2 className="brand-title">LeanWorker E-Learning</h2>
              <p className="brand-subtitle">Time’s UP! Academy</p>
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 10 }}>
            <div className="section-title" style={{ fontSize: 14 }}>
              Programme de formation
            </div>

            <div className="muted">
              Time’s UP! — Work this way or die trying
            </div>

            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: "rgba(15,23,42,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: formatPercent(progressPercent),
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #2563eb, #10b981)",
                }}
              />
            </div>

            <div className="muted" style={{ fontSize: 13 }}>
              Progression : {formatPercent(progressPercent)}
            </div>
          </div>

          <nav className="stack" style={{ gap: 8, flex: 1, overflowY: "auto", paddingRight: 4 }}>
            <Link
              href="/elearning"
              className={`nav-item ${pathname === "/elearning" ? "active" : ""}`}
            >
              <span>Accueil formation</span>
            </Link>

            {courseId ? (
              <Link
                href={`/elearning/courses/${courseId}`}
                className={`nav-item ${
                  pathname === `/elearning/courses/${courseId}` ? "active" : ""
                }`}
              >
                <span>Vue complète du programme</span>
              </Link>
            ) : null}

            <div className="muted" style={{ fontSize: 12, padding: "10px 10px 2px" }}>
              Structure du programme
            </div>

            {chapters.length === 0 ? (
              <div className="card-soft">
                <div className="muted" style={{ fontSize: 13 }}>
                  La structure du programme apparaîtra ici après le chargement du cours.
                </div>
              </div>
            ) : (
              chapters.map((chapter) => {
                const firstLesson = chapter.lessons[0] ?? null;
                const href = firstLesson
                  ? `/elearning/lessons/${firstLesson.id}`
                  : courseId
                    ? `/elearning/courses/${courseId}#chapter-${chapter.id}`
                    : "/elearning";

                const isActive =
                  pathname === href ||
                  chapter.lessons.some((lesson) => pathname === `/elearning/lessons/${lesson.id}`);

                return (
                  <Link
                    key={chapter.id}
                    href={href}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    style={{
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        display: "inline-grid",
                        placeItems: "center",
                        background: "rgba(37,99,235,0.08)",
                        color: "#2563eb",
                        fontWeight: 800,
                        flexShrink: 0,
                        fontSize: 12,
                      }}
                    >
                      {chapter.display_order}
                    </span>

                    <span className="stack" style={{ gap: 2, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          lineHeight: 1.25,
                        }}
                      >
                        {chapter.title}
                      </span>
                      <span className="muted" style={{ fontSize: 12 }}>
                        {getChapterProgressLabel(chapter)} leçon(s)
                      </span>
                    </span>
                  </Link>
                );
              })
            )}
          </nav>

          <div className="card-soft stack" style={{ gap: 10 }}>
            <div className="section-title" style={{ fontSize: 14 }}>
              Connecté en tant que
            </div>

            <div>
              <strong>{getFirstName(user)}</strong>
              {user?.email ? (
                <div className="muted" style={{ fontSize: 13 }}>
                  {user.email}
                </div>
              ) : null}
            </div>

            <button className="button ghost" type="button" onClick={handleLogout}>
              Se déconnecter
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
              <span className="avatar-circle">E</span>
              <div className="stack" style={{ gap: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {getFirstName(user)}
                </span>
                <span className="muted" style={{ fontSize: 12 }}>
                  Espace formation
                </span>
              </div>
            </div>
          </div>
        </div>

        <main className="content-area">
          <div className="page-wrap">{children}</div>
        </main>
      </div>
    </div>
  );
}