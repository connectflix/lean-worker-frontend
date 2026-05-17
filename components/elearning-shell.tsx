// components/elearning-shell.tsx
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

function getInitial(user?: Me | null): string {
  return getFirstName(user).trim().charAt(0).toUpperCase() || "W";
}

function formatPercent(value?: number | null): string {
  const normalized = Number(value ?? 0);

  if (!Number.isFinite(normalized)) {
    return "0%";
  }

  return `${Math.round(normalized)}%`;
}

function getChapterProgress(chapter: LearningChapter): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = chapter.lessons.length;

  const completed = chapter.lessons.filter((lesson) => {
    return (
      lesson.progress?.status === "completed" ||
      Number(lesson.progress?.progress_percent ?? 0) >= 100
    );
  }).length;

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percent };
}

function getChapterProgressLabel(chapter: LearningChapter): string {
  const progress = getChapterProgress(chapter);

  if (progress.total === 0) return "0/0";
  return `${progress.completed}/${progress.total}`;
}

function BrandMark() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 48,
        height: 48,
        borderRadius: 16,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(251,191,36,0.20), rgba(239,68,68,0.18))",
        border: "1px solid rgba(251,191,36,0.22)",
        boxShadow:
          "0 18px 44px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.14)",
        color: "#ffffff",
        fontWeight: 950,
        fontSize: 18,
        letterSpacing: "-0.06em",
        flexShrink: 0,
      }}
    >
      LW
    </div>
  );
}

function ProgressBar({
  value,
  height = 8,
}: {
  value?: number | null;
  height?: number;
}) {
  return (
    <div
      style={{
        height,
        borderRadius: 999,
        background: "rgba(255,255,255,0.12)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: formatPercent(value),
          height: "100%",
          borderRadius: 999,
          background: "linear-gradient(90deg, #f97316, #facc15)",
          boxShadow: "0 0 18px rgba(250,204,21,0.18)",
          transition: "width 220ms ease",
        }}
      />
    </div>
  );
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
          ["--sidebar-width" as string]: "322px",
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 22% 0%, rgba(239,68,68,0.20), transparent 30%), radial-gradient(circle at 82% 12%, rgba(250,204,21,0.10), transparent 28%), linear-gradient(135deg, #050505 0%, #11100f 42%, #1c120d 100%)",
          color: "#f8fafc",
        } as React.CSSProperties
      }
    >
      <aside
        className="sidebar"
        style={{
          position: "relative",
          padding: 16,
          borderRadius: 0,
          background: "transparent",
          border: "none",
          boxShadow: "none",
          minHeight: "100vh",
        }}
      >
        <div
          className="stack"
          style={{
            gap: 18,
            height: "calc(100vh - 32px)",
            minHeight: 0,
            padding: 18,
            borderRadius: 30,
            background:
              "linear-gradient(180deg, rgba(18,18,18,0.94), rgba(10,10,10,0.96))",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            className="brand-block"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "4px 2px 0",
            }}
          >
            <BrandMark />

            <div className="stack" style={{ gap: 2, minWidth: 0 }}>
              <h2
                className="brand-title"
                style={{
                  margin: 0,
                  color: "#ffffff",
                  fontSize: 17,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                LeanWorker
              </h2>

              <p
                className="brand-subtitle"
                style={{
                  margin: 0,
                  color: "rgba(248,250,252,0.60)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Time’s UP! Academy
              </p>
            </div>
          </div>

          <div
            className="stack"
            style={{
              gap: 12,
              padding: 16,
              borderRadius: 24,
              background:
                "radial-gradient(circle at top left, rgba(251,191,36,0.16), transparent 38%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "#fbbf24",
                fontSize: 11,
                fontWeight: 950,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Programme de formation
            </div>

            <div
              style={{
                color: "#ffffff",
                fontSize: 18,
                fontWeight: 950,
                lineHeight: 1.05,
                letterSpacing: "-0.045em",
              }}
            >
              Time’s UP!
            </div>

            <div
              style={{
                color: "rgba(248,250,252,0.66)",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Work this way or die trying
            </div>

            <ProgressBar value={progressPercent} />

            <div
              className="row space-between"
              style={{
                gap: 10,
                alignItems: "center",
              }}
            >
              <span style={{ color: "rgba(248,250,252,0.62)", fontSize: 12 }}>
                Progression
              </span>

              <strong
                style={{
                  color: "#ffffff",
                  fontSize: 13,
                  letterSpacing: "-0.02em",
                }}
              >
                {formatPercent(progressPercent)}
              </strong>
            </div>
          </div>

          <nav
            className="stack"
            style={{
              gap: 8,
              flex: 1,
              overflowY: "auto",
              paddingRight: 4,
              minHeight: 0,
            }}
          >
            <Link
              href="/elearning"
              className={`nav-item ${pathname === "/elearning" ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "12px 12px",
                borderRadius: 18,
                textDecoration: "none",
                color: pathname === "/elearning" ? "#ffffff" : "rgba(248,250,252,0.72)",
                background:
                  pathname === "/elearning"
                    ? "linear-gradient(135deg, rgba(249,115,22,0.20), rgba(250,204,21,0.10))"
                    : "transparent",
                border:
                  pathname === "/elearning"
                    ? "1px solid rgba(251,191,36,0.22)"
                    : "1px solid transparent",
              }}
            >
              <span style={{ fontWeight: 850, fontSize: 14 }}>Accueil formation</span>
              <span style={{ color: "#fbbf24", fontSize: 12 }}>Home</span>
            </Link>

            {courseId ? (
              <Link
                href={`/elearning/courses/${courseId}`}
                className={`nav-item ${
                  pathname === `/elearning/courses/${courseId}` ? "active" : ""
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "12px 12px",
                  borderRadius: 18,
                  textDecoration: "none",
                  color:
                    pathname === `/elearning/courses/${courseId}`
                      ? "#ffffff"
                      : "rgba(248,250,252,0.72)",
                  background:
                    pathname === `/elearning/courses/${courseId}`
                      ? "linear-gradient(135deg, rgba(249,115,22,0.20), rgba(250,204,21,0.10))"
                      : "transparent",
                  border:
                    pathname === `/elearning/courses/${courseId}`
                      ? "1px solid rgba(251,191,36,0.22)"
                      : "1px solid transparent",
                }}
              >
                <span style={{ fontWeight: 850, fontSize: 14 }}>Programme complet</span>
                <span style={{ color: "#fbbf24", fontSize: 12 }}>Course</span>
              </Link>
            ) : null}

            <div
              style={{
                padding: "14px 10px 4px",
                color: "rgba(248,250,252,0.42)",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Structure du programme
            </div>

            {chapters.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(248,250,252,0.58)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                La structure du programme apparaîtra ici après le chargement du cours.
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

                const chapterProgress = getChapterProgress(chapter);

                return (
                  <Link
                    key={chapter.id}
                    href={href}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: 12,
                      borderRadius: 18,
                      textDecoration: "none",
                      color: isActive ? "#ffffff" : "rgba(248,250,252,0.72)",
                      background: isActive
                        ? "linear-gradient(135deg, rgba(249,115,22,0.20), rgba(250,204,21,0.08))"
                        : "rgba(255,255,255,0.025)",
                      border: isActive
                        ? "1px solid rgba(251,191,36,0.22)"
                        : "1px solid rgba(255,255,255,0.055)",
                      boxShadow: isActive ? "0 14px 34px rgba(0,0,0,0.24)" : "none",
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 12,
                        display: "inline-grid",
                        placeItems: "center",
                        background: isActive
                          ? "rgba(251,191,36,0.18)"
                          : "rgba(255,255,255,0.06)",
                        color: isActive ? "#fbbf24" : "rgba(248,250,252,0.68)",
                        border: isActive
                          ? "1px solid rgba(251,191,36,0.24)"
                          : "1px solid rgba(255,255,255,0.08)",
                        fontWeight: 950,
                        flexShrink: 0,
                        fontSize: 12,
                      }}
                    >
                      {chapter.display_order}
                    </span>

                    <span className="stack" style={{ gap: 8, minWidth: 0, flex: 1 }}>
                      <span className="stack" style={{ gap: 3 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 850,
                            lineHeight: 1.25,
                          }}
                        >
                          {chapter.title}
                        </span>

                        <span
                          style={{
                            color: "rgba(248,250,252,0.46)",
                            fontSize: 12,
                          }}
                        >
                          {getChapterProgressLabel(chapter)} leçon(s)
                        </span>
                      </span>

                      <div
                        style={{
                          height: 5,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.10)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${chapterProgress.percent}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: "linear-gradient(90deg, #f97316, #facc15)",
                          }}
                        />
                      </div>
                    </span>
                  </Link>
                );
              })
            )}
          </nav>

          <div
            className="stack"
            style={{
              gap: 12,
              padding: 14,
              borderRadius: 22,
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "rgba(248,250,252,0.44)",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              Connecté en tant que
            </div>

            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {getInitial(user)}
              </span>

              <div style={{ minWidth: 0 }}>
                <strong style={{ color: "#ffffff" }}>{getFirstName(user)}</strong>
                {user?.email ? (
                  <div
                    style={{
                      color: "rgba(248,250,252,0.48)",
                      fontSize: 12,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.email}
                  </div>
                ) : null}
              </div>
            </div>

            <button
              className="button ghost"
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                color: "#f8fafc",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      <div
        className="main-shell"
        style={{
          minWidth: 0,
          background: "transparent",
        }}
      >
        <div
          className="topbar"
          style={{
            position: "sticky",
            top: 16,
            zIndex: 20,
            margin: "16px 16px 0 0",
            minHeight: 76,
            borderRadius: 26,
            padding: "14px 18px",
            background: "rgba(10,10,10,0.68)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 20px 70px rgba(0,0,0,0.34)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div className="stack" style={{ gap: 3, minWidth: 0 }}>
            <div
              className="topbar-title"
              style={{
                color: "#ffffff",
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: "-0.035em",
              }}
            >
              {title}
            </div>

            {subtitle ? (
              <div
                style={{
                  color: "rgba(248,250,252,0.58)",
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          <div className="topbar-right">
            <div
              className="user-pill"
              style={{
                gap: 10,
                minHeight: 44,
                padding: "6px 10px 6px 6px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#f8fafc",
              }}
            >
              <span
                className="avatar-circle"
                style={{
                  width: 34,
                  height: 34,
                  background: "linear-gradient(135deg, #f97316, #facc15)",
                  color: "#111111",
                  fontWeight: 950,
                }}
              >
                {getInitial(user)}
              </span>

              <div className="stack" style={{ gap: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>
                  {getFirstName(user)}
                </span>

                <span
                  style={{
                    color: "rgba(248,250,252,0.48)",
                    fontSize: 12,
                  }}
                >
                  Espace formation
                </span>
              </div>
            </div>
          </div>
        </div>

        <main
          className="content-area"
          style={{
            padding: 16,
            minHeight: "calc(100vh - 108px)",
            background: "transparent",
          }}
        >
          <div
            className="page-wrap"
            style={{
              maxWidth: 1320,
              margin: "0 auto",
              padding: "10px 0 48px",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}