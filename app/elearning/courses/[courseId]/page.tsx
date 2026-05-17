// app/elearning/courses/[courseId]/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ElearningGuard } from "@/components/elearning-guard";
import { ElearningShell } from "@/components/elearning-shell";
import {
  getLearningCourseDetail,
  getLearningProgressSummary,
  getMe,
} from "@/lib/api";
import type {
  LearningCourseDetail,
  LearningLessonSummary,
  LearningProgressSummary,
  Me,
} from "@/lib/types";
import {
  CheckCircleIcon,
  ClockIcon,
  PathIcon,
  PlayCircleIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";

export default function ElearningCoursePage() {
  return (
    <ElearningGuard>
      <ElearningCourseContent />
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

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "Durée à venir";

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

function getLessonStatusLabel(lesson: LearningLessonSummary): string {
  const progress = Number(lesson.progress?.progress_percent ?? 0);

  if (lesson.progress?.status === "completed" || progress >= 100) {
    return "Terminée";
  }

  if (lesson.progress?.status === "in_progress" || progress > 0) {
    return "En cours";
  }

  return "À démarrer";
}

function getLessonStatusTone(lesson: LearningLessonSummary): React.CSSProperties {
  const progress = Number(lesson.progress?.progress_percent ?? 0);

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
    letterSpacing: "0.015em",
  };

  if (lesson.progress?.status === "completed" || progress >= 100) {
    return {
      ...base,
      color: "#bbf7d0",
      background: "rgba(34,197,94,0.12)",
      border: "1px solid rgba(34,197,94,0.24)",
    };
  }

  if (lesson.progress?.status === "in_progress" || progress > 0) {
    return {
      ...base,
      color: "#fbbf24",
      background: "rgba(251,191,36,0.13)",
      border: "1px solid rgba(251,191,36,0.26)",
    };
  }

  return {
    ...base,
    color: "rgba(248,250,252,0.66)",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.11)",
  };
}

function MasterclassBadge({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "dark" | "gold" | "green" | "red";
}) {
  const styles =
    tone === "gold"
      ? {
          background: "rgba(251,191,36,0.14)",
          border: "1px solid rgba(251,191,36,0.25)",
          color: "#fbbf24",
        }
      : tone === "green"
        ? {
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.22)",
            color: "#bbf7d0",
          }
        : tone === "red"
          ? {
              background: "rgba(239,68,68,0.14)",
              border: "1px solid rgba(239,68,68,0.24)",
              color: "#fca5a5",
            }
          : {
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.11)",
              color: "rgba(248,250,252,0.72)",
            };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 11px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: "0.025em",
        ...styles,
      }}
    >
      {children}
    </span>
  );
}

function MasterclassPanel({
  children,
  warm = false,
}: {
  children: React.ReactNode;
  warm?: boolean;
}) {
  return (
    <section
      className="stack"
      style={{
        gap: 16,
        padding: 22,
        borderRadius: 30,
        background: warm
          ? "linear-gradient(135deg, rgba(251,191,36,0.13), rgba(255,255,255,0.055))"
          : "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.045))",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </section>
  );
}

function LessonStatusIcon({ lesson }: { lesson: LearningLessonSummary }) {
  const progress = Number(lesson.progress?.progress_percent ?? 0);

  if (lesson.progress?.status === "completed" || progress >= 100) {
    return <CheckCircleIcon size={14} color="#bbf7d0" />;
  }

  if (lesson.progress?.status === "in_progress" || progress > 0) {
    return <ClockIcon size={14} color="#fbbf24" />;
  }

  return <PlayCircleIcon size={14} color="rgba(248,250,252,0.62)" />;
}

function ElearningCourseContent() {
  const params = useParams();

  const courseId = useMemo(() => {
    const raw = params?.courseId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params]);

  const [user, setUser] = useState<Me | null>(null);
  const [course, setCourse] = useState<LearningCourseDetail | null>(null);
  const [summary, setSummary] = useState<LearningProgressSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCourse() {
    if (!courseId) {
      setError("Programme introuvable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [me, detail, progressSummary] = await Promise.all([
        getMe(),
        getLearningCourseDetail(courseId),
        getLearningProgressSummary(),
      ]);

      setUser(me);
      setCourse(detail);
      setSummary(progressSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le programme.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const firstAvailableLessonId = useMemo(() => {
    if (!course) return null;

    for (const chapter of course.chapters) {
      const firstLesson = chapter.lessons[0];

      if (firstLesson) {
        return firstLesson.id;
      }
    }

    return null;
  }, [course]);

  const nextRecommendedLessonId = useMemo(() => {
    if (!course) return firstAvailableLessonId;

    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        const progress = Number(lesson.progress?.progress_percent ?? 0);

        if (lesson.progress?.status !== "completed" && progress < 100) {
          return lesson.id;
        }
      }
    }

    return firstAvailableLessonId;
  }, [course, firstAvailableLessonId]);

  return (
    <ElearningShell
      title="Programme Time’s UP!"
      subtitle="Vue complète du parcours de formation Lean Worker."
      user={user}
      courseId={course?.id ?? courseId}
      chapters={course?.chapters ?? []}
      progressPercent={summary?.overall_progress_percent ?? course?.progress_percent ?? 0}
    >
      <div
        className="stack"
        style={{
          gap: 18,
          color: "#f8fafc",
        }}
      >
        {loading ? (
          <MasterclassPanel>
            <div style={{ color: "#ffffff", fontWeight: 900, fontSize: 18 }}>
              Chargement du programme...
            </div>
            <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.7 }}>
              Préparation des chapitres, des leçons et de votre progression.
            </div>
          </MasterclassPanel>
        ) : error ? (
          <MasterclassPanel>
            <div style={{ color: "#fca5a5", fontWeight: 900, fontSize: 18 }}>
              Impossible de charger le programme
            </div>
            <div style={{ color: "rgba(248,250,252,0.68)" }}>{error}</div>
          </MasterclassPanel>
        ) : !course ? (
          <MasterclassPanel>
            <div style={{ color: "rgba(248,250,252,0.72)" }}>
              Programme introuvable.
            </div>
          </MasterclassPanel>
        ) : (
          <>
            <section
              className="stack"
              style={{
                position: "relative",
                overflow: "hidden",
                gap: 22,
                padding: 30,
                borderRadius: 36,
                background:
                  "radial-gradient(circle at 16% 0%, rgba(239,68,68,0.20), transparent 32%), radial-gradient(circle at 86% 14%, rgba(250,204,21,0.13), transparent 30%), linear-gradient(135deg, #0a0a0a 0%, #11100f 48%, #1e120b 100%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow:
                  "0 34px 100px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: -160,
                  right: -120,
                  width: 360,
                  height: 360,
                  borderRadius: 999,
                  background: "rgba(249,115,22,0.15)",
                }}
              />

              <div
                className="row space-between"
                style={{
                  gap: 18,
                  flexWrap: "wrap",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div className="stack" style={{ gap: 13, maxWidth: 780 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <MasterclassBadge tone="gold">
                      <SparkIcon size={14} color="#fbbf24" />
                      Programme de formation
                    </MasterclassBadge>

                    <MasterclassBadge>
                      <PathIcon size={14} color="rgba(248,250,252,0.70)" />
                      Parcours complet
                    </MasterclassBadge>
                  </div>

                  <h1
                    style={{
                      margin: 0,
                      color: "#ffffff",
                      fontSize: 58,
                      lineHeight: 0.95,
                      fontWeight: 950,
                      letterSpacing: "-0.075em",
                    }}
                  >
                    {course.title}
                  </h1>

                  {course.subtitle ? (
                    <div
                      style={{
                        color: "rgba(248,250,252,0.90)",
                        margin: 0,
                        fontSize: 24,
                        fontWeight: 900,
                        lineHeight: 1.18,
                        letterSpacing: "-0.045em",
                      }}
                    >
                      {course.subtitle}
                    </div>
                  ) : null}

                  {course.description ? (
                    <p
                      style={{
                        color: "rgba(248,250,252,0.64)",
                        fontSize: 16,
                        lineHeight: 1.75,
                        margin: 0,
                        maxWidth: 760,
                      }}
                    >
                      {course.description}
                    </p>
                  ) : null}
                </div>

                <div
                  className="stack"
                  style={{
                    gap: 12,
                    minWidth: 280,
                    maxWidth: 340,
                    padding: 20,
                    borderRadius: 28,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.055))",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ color: "rgba(248,250,252,0.62)", fontSize: 13 }}>
                    Progression du programme
                  </div>

                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: 44,
                      lineHeight: 1,
                      fontWeight: 950,
                      letterSpacing: "-0.07em",
                    }}
                  >
                    {formatPercent(course.progress_percent)}
                  </div>

                  <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.55 }}>
                    {course.completed_lessons} leçon(s) terminée(s) sur {course.total_lessons}
                  </div>

                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.09)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: formatPercent(course.progress_percent),
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(135deg, #facc15, #f97316, #ef4444)",
                      }}
                    />
                  </div>

                  {nextRecommendedLessonId ? (
                    <Link
                      className="button"
                      href={`/elearning/lessons/${nextRecommendedLessonId}`}
                      style={{
                        background: "#ffffff",
                        color: "#111827",
                        borderRadius: 16,
                        minHeight: 46,
                        justifyContent: "center",
                      }}
                    >
                      {course.progress_percent > 0 ? "Continuer" : "Démarrer"}
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            <MasterclassPanel>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 5 }}>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: 24,
                      fontWeight: 950,
                      letterSpacing: "-0.055em",
                    }}
                  >
                    Chapitres et leçons
                  </div>

                  <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.65 }}>
                    Suivez le programme dans l’ordre ou ouvrez directement un chapitre.
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <MasterclassBadge>
                    {course.chapters.length} chapitre(s)
                  </MasterclassBadge>
                  <MasterclassBadge tone="gold">
                    {course.total_lessons} leçon(s)
                  </MasterclassBadge>
                </div>
              </div>

              <div className="stack" style={{ gap: 14 }}>
                {course.chapters.map((chapter) => {
                  const completedLessons = chapter.lessons.filter((lesson) => {
                    const progress = Number(lesson.progress?.progress_percent ?? 0);
                    return lesson.progress?.status === "completed" || progress >= 100;
                  }).length;

                  return (
                    <article
                      id={`chapter-${chapter.id}`}
                      key={chapter.id}
                      className="stack"
                      style={{
                        gap: 13,
                        padding: 18,
                        borderRadius: 28,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.070), rgba(255,255,255,0.040))",
                        border: "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                        <div className="stack" style={{ gap: 8 }}>
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <MasterclassBadge tone="gold">
                              Chapitre {chapter.display_order}
                            </MasterclassBadge>

                            <MasterclassBadge>
                              {completedLessons}/{chapter.lessons.length} leçon(s) terminée(s)
                            </MasterclassBadge>
                          </div>

                          <h2
                            style={{
                              color: "#ffffff",
                              fontSize: 22,
                              lineHeight: 1.15,
                              fontWeight: 950,
                              letterSpacing: "-0.055em",
                              margin: 0,
                            }}
                          >
                            {chapter.title}
                          </h2>

                          {chapter.description ? (
                            <div
                              style={{
                                color: "rgba(248,250,252,0.62)",
                                lineHeight: 1.65,
                                maxWidth: 900,
                              }}
                            >
                              {chapter.description}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="stack" style={{ gap: 9 }}>
                        {chapter.lessons.length === 0 ? (
                          <div style={{ color: "rgba(248,250,252,0.62)" }}>
                            Aucune leçon disponible dans ce chapitre.
                          </div>
                        ) : (
                          chapter.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/elearning/lessons/${lesson.id}`}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr auto",
                                gap: 14,
                                alignItems: "center",
                                textDecoration: "none",
                                color: "inherit",
                                padding: 15,
                                borderRadius: 22,
                                background: "rgba(0,0,0,0.18)",
                                border: "1px solid rgba(255,255,255,0.09)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045)",
                              }}
                            >
                              <div className="stack" style={{ gap: 7 }}>
                                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                                  <span style={getLessonStatusTone(lesson)}>
                                    <LessonStatusIcon lesson={lesson} />
                                    {getLessonStatusLabel(lesson)}
                                  </span>

                                  <MasterclassBadge>
                                    <ClockIcon size={14} color="rgba(248,250,252,0.62)" />
                                    {formatDuration(lesson.duration_seconds)}
                                  </MasterclassBadge>
                                </div>

                                <strong
                                  style={{
                                    color: "#ffffff",
                                    fontSize: 15,
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {lesson.title}
                                </strong>

                                {lesson.description ? (
                                  <div
                                    style={{
                                      color: "rgba(248,250,252,0.58)",
                                      lineHeight: 1.55,
                                      fontSize: 14,
                                    }}
                                  >
                                    {lesson.description}
                                  </div>
                                ) : null}
                              </div>

                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "10px 13px",
                                  borderRadius: 14,
                                  background: "rgba(255,255,255,0.08)",
                                  border: "1px solid rgba(255,255,255,0.11)",
                                  color: "rgba(248,250,252,0.78)",
                                  fontSize: 13,
                                  fontWeight: 900,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <PlayCircleIcon size={14} />
                                Ouvrir
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </MasterclassPanel>

            {course.progress_percent >= 100 ? (
              <MasterclassPanel warm>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <MasterclassBadge tone="green">
                    <CheckCircleIcon size={14} color="#bbf7d0" />
                    Programme terminé
                  </MasterclassBadge>
                </div>

                <div
                  style={{
                    color: "#ffffff",
                    fontSize: 26,
                    lineHeight: 1.12,
                    fontWeight: 950,
                    letterSpacing: "-0.06em",
                  }}
                >
                  Prêt à passer à l’accompagnement ?
                </div>

                <div style={{ color: "rgba(248,250,252,0.64)", lineHeight: 1.75 }}>
                  Vous avez terminé le programme Time’s UP!. Vous pouvez maintenant choisir un pack
                  LeanWorker ou réserver une conversation gratuite pour transformer la méthode en plan
                  d’action personnel.
                </div>

                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  <Link
                    className="button"
                    href="/elearning/subscribe"
                    style={{
                      background: "#ffffff",
                      color: "#111827",
                      borderRadius: 16,
                    }}
                  >
                    Voir les packs
                  </Link>

                  <a
                    className="button ghost"
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "rgba(248,250,252,0.82)",
                      borderColor: "rgba(255,255,255,0.16)",
                    }}
                  >
                    Réserver une conversation gratuite
                  </a>
                </div>
              </MasterclassPanel>
            ) : null}
          </>
        )}
      </div>
    </ElearningShell>
  );
}