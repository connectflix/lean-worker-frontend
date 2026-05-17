// app/learning/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ElearningGuard } from "@/components/elearning-guard";
import { ElearningShell } from "@/components/elearning-shell";
import {
  getLearningCourseDetail,
  getLearningCourses,
  getLearningProgressSummary,
  getMe,
} from "@/lib/api";
import type {
  LearningCourseDetail,
  LearningCourseSummary,
  LearningProgressSummary,
  Me,
} from "@/lib/types";

export default function ElearningHomePage() {
  return (
    <ElearningGuard>
      <ElearningHomeContent />
    </ElearningGuard>
  );
}

function formatPercent(value?: number | null): string {
  const normalized = Number(value ?? 0);

  if (!Number.isFinite(normalized)) {
    return "0%";
  }

  return `${Math.round(normalized)}%`;
}

function getCourseCtaLabel(course: LearningCourseSummary): string {
  if (course.progress_percent >= 100) return "Revoir le programme";
  if (course.progress_percent > 0) return "Continuer";
  return "Démarrer le programme";
}

function getCourseStateLabel(course: LearningCourseSummary): string {
  if (course.progress_percent >= 100) return "Programme terminé";
  if (course.progress_percent > 0) return "En cours";
  return "Nouveau programme";
}

function getChapterProgressLabel(completedLessons: number, totalLessons: number): string {
  if (totalLessons === 0) return "Aucune leçon";
  if (completedLessons >= totalLessons) return "Terminé";
  if (completedLessons > 0) return `${completedLessons}/${totalLessons} terminé`;
  return `${totalLessons} leçon(s)`;
}

function ElearningHomeContent() {
  const [user, setUser] = useState<Me | null>(null);
  const [courses, setCourses] = useState<LearningCourseSummary[]>([]);
  const [mainCourseDetail, setMainCourseDetail] = useState<LearningCourseDetail | null>(null);
  const [summary, setSummary] = useState<LearningProgressSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadElearningHome() {
    setLoading(true);
    setError(null);

    try {
      const [me, courseItems, progressSummary] = await Promise.all([
        getMe(),
        getLearningCourses(),
        getLearningProgressSummary(),
      ]);

      setUser(me);
      setCourses(courseItems);
      setSummary(progressSummary);

      const firstCourse = courseItems[0] ?? null;

      if (firstCourse) {
        const detail = await getLearningCourseDetail(firstCourse.id);
        setMainCourseDetail(detail);
      } else {
        setMainCourseDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger l’espace E-Learning.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadElearningHome();
  }, []);

  const mainCourse = useMemo(() => courses[0] ?? null, [courses]);

  const progressPercent = summary?.overall_progress_percent ?? 0;
  const firstName = user?.given_name || user?.display_name || "Worker";

  return (
    <ElearningShell
      title="LeanWorker E-Learning"
      subtitle="Programme Time’s UP! — apprendre à devenir un Lean Worker."
      user={user}
      courseId={mainCourse?.id ?? null}
      chapters={mainCourseDetail?.chapters ?? []}
      progressPercent={progressPercent}
    >
      <div
        className="stack"
        style={{
          gap: 20,
          color: "#f8fafc",
        }}
      >
        <section
          className="card stack"
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 520,
            gap: 28,
            padding: 34,
            borderRadius: 34,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "radial-gradient(circle at 12% 0%, rgba(239,68,68,0.28), transparent 32%), radial-gradient(circle at 82% 20%, rgba(245,158,11,0.18), transparent 30%), linear-gradient(135deg, #080808 0%, #15110d 44%, #24140d 100%)",
            boxShadow: "0 28px 90px rgba(0,0,0,0.42)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.52), rgba(0,0,0,0.10)), radial-gradient(circle at bottom right, rgba(255,255,255,0.08), transparent 35%)",
              pointerEvents: "none",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -120,
              top: -80,
              width: 420,
              height: 420,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.08), transparent 62%)",
            }}
          />

          <div
            className="row space-between"
            style={{
              position: "relative",
              zIndex: 1,
              gap: 18,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div className="stack" style={{ gap: 16, maxWidth: 780 }}>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <span
                  className="badge"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    borderColor: "rgba(255,255,255,0.18)",
                    color: "#f8fafc",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 900,
                  }}
                >
                  Programme original
                </span>

                <span
                  className="badge"
                  style={{
                    background: "rgba(239,68,68,0.18)",
                    borderColor: "rgba(239,68,68,0.30)",
                    color: "#fecaca",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 900,
                  }}
                >
                  Time discipline
                </span>
              </div>

              <div className="stack" style={{ gap: 12 }}>
                <div
                  style={{
                    color: "rgba(248,250,252,0.72)",
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Bienvenue {firstName}
                </div>

                <h1
                  style={{
                    margin: 0,
                    maxWidth: 780,
                    fontSize: "clamp(52px, 8vw, 104px)",
                    lineHeight: 0.88,
                    letterSpacing: "-0.085em",
                    fontWeight: 950,
                    color: "#ffffff",
                  }}
                >
                  Time’s UP!
                </h1>

                <div
                  style={{
                    color: "#fbbf24",
                    fontSize: "clamp(22px, 3vw, 34px)",
                    lineHeight: 1.05,
                    fontWeight: 900,
                    letterSpacing: "-0.05em",
                  }}
                >
                  Work this way or die trying
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  maxWidth: 720,
                  color: "rgba(248,250,252,0.78)",
                  fontSize: 17,
                  lineHeight: 1.75,
                }}
              >
                Une formation immersive pour comprendre, structurer et transformer ta manière
                de travailler : rapport au temps, purpose, significance, engagement,
                puissances, risques, leviers, preuves et passage à l’action.
              </p>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                {mainCourse ? (
                  <Link
                    className="button"
                    href={`/elearning/courses/${mainCourse.id}`}
                    style={{
                      minHeight: 50,
                      paddingInline: 22,
                      borderRadius: 999,
                      background: "#ffffff",
                      color: "#0f0f0f",
                      border: "1px solid rgba(255,255,255,0.28)",
                      fontWeight: 900,
                    }}
                  >
                    {getCourseCtaLabel(mainCourse)}
                  </Link>
                ) : null}

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => void loadElearningHome()}
                  disabled={loading}
                  style={{
                    minHeight: 50,
                    paddingInline: 22,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    color: "#f8fafc",
                    border: "1px solid rgba(255,255,255,0.16)",
                  }}
                >
                  {loading ? "Chargement..." : "Rafraîchir"}
                </button>
              </div>
            </div>

            <div
              className="stack"
              style={{
                position: "relative",
                zIndex: 1,
                gap: 14,
                minWidth: 280,
                maxWidth: 360,
                flex: "0 1 360px",
              }}
            >
              <div
                className="stack"
                style={{
                  gap: 12,
                  padding: 20,
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div style={{ color: "rgba(248,250,252,0.68)", fontSize: 13 }}>
                  Progression globale
                </div>

                <div
                  style={{
                    fontSize: 54,
                    lineHeight: 1,
                    fontWeight: 950,
                    letterSpacing: "-0.07em",
                    color: "#ffffff",
                  }}
                >
                  {formatPercent(progressPercent)}
                </div>

                <div style={{ color: "rgba(248,250,252,0.72)", lineHeight: 1.5 }}>
                  {summary?.completed_lessons ?? 0} leçon(s) terminée(s) sur{" "}
                  {summary?.total_lessons ?? 0}
                </div>

                <div
                  style={{
                    height: 10,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.14)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: formatPercent(progressPercent),
                      height: "100%",
                      borderRadius: 999,
                      background: "linear-gradient(90deg, #f97316, #facc15)",
                    }}
                  />
                </div>
              </div>

              <div
                className="stack"
                style={{
                  gap: 10,
                  padding: 18,
                  borderRadius: 24,
                  background: "rgba(0,0,0,0.30)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ fontSize: 13, color: "rgba(248,250,252,0.60)" }}>
                  Format
                </div>
                <strong style={{ color: "#ffffff" }}>Programme vidéo + exercices</strong>
                <div style={{ color: "rgba(248,250,252,0.70)", lineHeight: 1.55 }}>
                  Une progression guidée, chapitre par chapitre, pour transformer la théorie en
                  comportement observable.
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <section
            className="card stack"
            style={{
              gap: 10,
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "linear-gradient(135deg, #111111, #1c1917)",
              color: "#f8fafc",
            }}
          >
            <div className="section-title" style={{ color: "#ffffff" }}>
              Chargement du contenu de formation...
            </div>
            <div style={{ color: "rgba(248,250,252,0.68)" }}>
              Nous préparons le programme, les chapitres et ta progression.
            </div>
          </section>
        ) : error ? (
          <section
            className="card stack"
            style={{
              gap: 12,
              borderRadius: 28,
              border: "1px solid rgba(239,68,68,0.24)",
              background: "rgba(127,29,29,0.18)",
            }}
          >
            <div className="section-title" style={{ color: "#fecaca" }}>
              Impossible de charger l’espace E-Learning
            </div>
            <div style={{ color: "#fecaca" }}>{error}</div>
            <button
              className="button"
              type="button"
              onClick={() => void loadElearningHome()}
              style={{ alignSelf: "flex-start" }}
            >
              Réessayer
            </button>
          </section>
        ) : courses.length === 0 ? (
          <section
            className="card stack"
            style={{
              gap: 10,
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "linear-gradient(135deg, #111111, #1c1917)",
              color: "#f8fafc",
            }}
          >
            <strong>Aucun programme publié pour le moment.</strong>
            <div style={{ color: "rgba(248,250,252,0.68)" }}>
              Exécutez le script de seed ou publiez un programme avant d’utiliser cet espace.
            </div>
          </section>
        ) : (
          <>
            {mainCourse ? (
              <section
                className="card stack"
                style={{
                  gap: 18,
                  borderRadius: 30,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(135deg, rgba(18,18,18,0.98), rgba(31,27,24,0.98))",
                  color: "#f8fafc",
                  boxShadow: "0 22px 70px rgba(0,0,0,0.28)",
                }}
              >
                <div className="row space-between" style={{ gap: 14, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 6 }}>
                    <div
                      style={{
                        color: "#fbbf24",
                        fontSize: 12,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Programme principal
                    </div>

                    <div className="section-title" style={{ color: "#ffffff", fontSize: 26 }}>
                      Reprendre Time’s UP!
                    </div>

                    <div style={{ color: "rgba(248,250,252,0.66)" }}>
                      Reprends ta progression dans le parcours et continue au bon endroit.
                    </div>
                  </div>

                  <Link
                    className="button"
                    href={`/elearning/courses/${mainCourse.id}`}
                    style={{
                      alignSelf: "center",
                      borderRadius: 999,
                      background: "#ffffff",
                      color: "#111111",
                      fontWeight: 900,
                    }}
                  >
                    {getCourseCtaLabel(mainCourse)}
                  </Link>
                </div>

                <div
                  className="stack"
                  style={{
                    gap: 14,
                    padding: 20,
                    borderRadius: 26,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                    <div className="stack" style={{ gap: 6 }}>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 28,
                          lineHeight: 1.1,
                          letterSpacing: "-0.045em",
                          color: "#ffffff",
                        }}
                      >
                        {mainCourse.title}
                      </h2>

                      {mainCourse.subtitle ? (
                        <div style={{ color: "#fbbf24", fontWeight: 800 }}>
                          {mainCourse.subtitle}
                        </div>
                      ) : null}
                    </div>

                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span
                        className="badge"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          borderColor: "rgba(255,255,255,0.14)",
                          color: "#f8fafc",
                        }}
                      >
                        {getCourseStateLabel(mainCourse)}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          borderColor: "rgba(255,255,255,0.14)",
                          color: "#f8fafc",
                        }}
                      >
                        {mainCourse.total_lessons} leçon(s)
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          borderColor: "rgba(255,255,255,0.14)",
                          color: "#f8fafc",
                        }}
                      >
                        {formatPercent(mainCourse.progress_percent)}
                      </span>
                    </div>
                  </div>

                  {mainCourse.description ? (
                    <p
                      style={{
                        margin: 0,
                        color: "rgba(248,250,252,0.70)",
                        lineHeight: 1.7,
                      }}
                    >
                      {mainCourse.description}
                    </p>
                  ) : null}

                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.12)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: formatPercent(mainCourse.progress_percent),
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(90deg, #f97316, #facc15)",
                      }}
                    />
                  </div>
                </div>
              </section>
            ) : null}

            {mainCourseDetail ? (
              <section
                className="card stack"
                style={{
                  gap: 18,
                  borderRadius: 30,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(135deg, rgba(10,10,10,0.98), rgba(24,20,18,0.98))",
                  color: "#f8fafc",
                  boxShadow: "0 22px 70px rgba(0,0,0,0.28)",
                }}
              >
                <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 6 }}>
                    <div
                      style={{
                        color: "#fbbf24",
                        fontSize: 12,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Curriculum
                    </div>

                    <div className="section-title" style={{ color: "#ffffff", fontSize: 26 }}>
                      Structure du programme
                    </div>

                    <div style={{ color: "rgba(248,250,252,0.66)" }}>
                      Parcours les chapitres comme une série premium : chaque bloc prépare le
                      suivant.
                    </div>
                  </div>

                  <span
                    className="badge"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      borderColor: "rgba(255,255,255,0.14)",
                      color: "#f8fafc",
                      alignSelf: "flex-start",
                    }}
                  >
                    {mainCourseDetail.chapters.length} chapitre(s)
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 14,
                  }}
                >
                  {mainCourseDetail.chapters.map((chapter) => {
                    const firstLesson = chapter.lessons[0] ?? null;
                    const completedLessons = chapter.lessons.filter((lesson) => {
                      return (
                        lesson.progress?.status === "completed" ||
                        Number(lesson.progress?.progress_percent ?? 0) >= 100
                      );
                    }).length;

                    const chapterProgress =
                      chapter.lessons.length > 0
                        ? Math.round((completedLessons / chapter.lessons.length) * 100)
                        : 0;

                    return (
                      <article
                        id={`chapter-${chapter.id}`}
                        key={chapter.id}
                        className="stack"
                        style={{
                          minHeight: 260,
                          gap: 14,
                          padding: 20,
                          borderRadius: 26,
                          background:
                            "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))",
                          border: "1px solid rgba(255,255,255,0.12)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                      >
                        <div className="row space-between" style={{ gap: 12 }}>
                          <span
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 16,
                              display: "grid",
                              placeItems: "center",
                              background: "rgba(251,191,36,0.14)",
                              border: "1px solid rgba(251,191,36,0.24)",
                              color: "#fbbf24",
                              fontWeight: 950,
                            }}
                          >
                            {chapter.display_order}
                          </span>

                          <span
                            className="badge"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              borderColor: "rgba(255,255,255,0.14)",
                              color: "#f8fafc",
                            }}
                          >
                            {getChapterProgressLabel(completedLessons, chapter.lessons.length)}
                          </span>
                        </div>

                        <div className="stack" style={{ gap: 8 }}>
                          <strong
                            style={{
                              color: "#ffffff",
                              fontSize: 21,
                              lineHeight: 1.15,
                              letterSpacing: "-0.035em",
                            }}
                          >
                            {chapter.title}
                          </strong>

                          {chapter.description ? (
                            <div
                              style={{
                                color: "rgba(248,250,252,0.66)",
                                lineHeight: 1.6,
                              }}
                            >
                              {chapter.description}
                            </div>
                          ) : null}
                        </div>

                        <div
                          style={{
                            height: 8,
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.12)",
                            overflow: "hidden",
                            marginTop: "auto",
                          }}
                        >
                          <div
                            style={{
                              width: `${chapterProgress}%`,
                              height: "100%",
                              borderRadius: 999,
                              background: "linear-gradient(90deg, #f97316, #facc15)",
                            }}
                          />
                        </div>

                        {firstLesson ? (
                          <Link
                            className="button ghost"
                            href={`/elearning/lessons/${firstLesson.id}`}
                            style={{
                              borderRadius: 999,
                              background: "rgba(255,255,255,0.08)",
                              color: "#f8fafc",
                              border: "1px solid rgba(255,255,255,0.14)",
                              justifyContent: "center",
                            }}
                          >
                            Ouvrir le chapitre
                          </Link>
                        ) : (
                          <div style={{ color: "rgba(248,250,252,0.52)" }}>
                            Aucune leçon disponible.
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </ElearningShell>
  );
}