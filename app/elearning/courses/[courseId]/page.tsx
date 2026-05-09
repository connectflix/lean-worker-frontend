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
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  };

  if (lesson.progress?.status === "completed" || progress >= 100) {
    return {
      ...base,
      color: "#15803d",
      background: "rgba(21,128,61,0.10)",
      border: "1px solid rgba(21,128,61,0.22)",
    };
  }

  if (lesson.progress?.status === "in_progress" || progress > 0) {
    return {
      ...base,
      color: "#4338ca",
      background: "rgba(99,102,241,0.12)",
      border: "1px solid rgba(99,102,241,0.22)",
    };
  }

  return {
    ...base,
    color: "#475569",
    background: "rgba(100,116,139,0.10)",
    border: "1px solid rgba(100,116,139,0.18)",
  };
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
      <div className="stack" style={{ gap: 18 }}>
        {loading ? (
          <div className="card-soft">Chargement du programme...</div>
        ) : error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : !course ? (
          <div className="card-soft">Programme introuvable.</div>
        ) : (
          <>
            <section
              className="card stack"
              style={{
                gap: 18,
                background:
                  "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 32%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
              }}
            >
              <div className="row space-between" style={{ gap: 16, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 10, maxWidth: 760 }}>
                  <span className="badge">Programme de formation</span>

                  <h1
                    className="title"
                    style={{
                      margin: 0,
                      fontSize: 42,
                      lineHeight: 1.05,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {course.title}
                  </h1>

                  {course.subtitle ? (
                    <div className="subtitle" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                      {course.subtitle}
                    </div>
                  ) : null}

                  {course.description ? (
                    <p className="muted" style={{ fontSize: 15, lineHeight: 1.7 }}>
                      {course.description}
                    </p>
                  ) : null}
                </div>

                <div
                  className="card-soft stack"
                  style={{
                    gap: 10,
                    minWidth: 260,
                    border: "1px solid rgba(37,99,235,0.14)",
                  }}
                >
                  <div className="muted">Progression du programme</div>
                  <div className="admin-metric-value">{formatPercent(course.progress_percent)}</div>
                  <div className="muted">
                    {course.completed_lessons} leçon(s) terminée(s) sur {course.total_lessons}
                  </div>

                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: formatPercent(course.progress_percent),
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(135deg, #2563eb, #10b981)",
                      }}
                    />
                  </div>

                  {nextRecommendedLessonId ? (
                    <Link className="button" href={`/elearning/lessons/${nextRecommendedLessonId}`}>
                      {course.progress_percent > 0 ? "Continuer" : "Démarrer"}
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="card stack" style={{ gap: 14 }}>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Chapitres et leçons</div>
                  <div className="muted">
                    Suivez le programme dans l’ordre ou ouvrez directement un chapitre.
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">{course.chapters.length} chapitre(s)</span>
                  <span className="badge">{course.total_lessons} leçon(s)</span>
                </div>
              </div>

              <div className="stack" style={{ gap: 12 }}>
                {course.chapters.map((chapter) => {
                  const completedLessons = chapter.lessons.filter((lesson) => {
                    const progress = Number(lesson.progress?.progress_percent ?? 0);
                    return lesson.progress?.status === "completed" || progress >= 100;
                  }).length;

                  return (
                    <article
                      id={`chapter-${chapter.id}`}
                      key={chapter.id}
                      className="card-soft stack"
                      style={{ gap: 12 }}
                    >
                      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                        <div className="stack" style={{ gap: 6 }}>
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">Chapitre {chapter.display_order}</span>
                            <span className="badge">
                              {completedLessons}/{chapter.lessons.length} leçon(s) terminée(s)
                            </span>
                          </div>

                          <h2 className="section-title" style={{ fontSize: 20 }}>
                            {chapter.title}
                          </h2>

                          {chapter.description ? (
                            <div className="muted" style={{ lineHeight: 1.6 }}>
                              {chapter.description}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="stack" style={{ gap: 8 }}>
                        {chapter.lessons.length === 0 ? (
                          <div className="muted">Aucune leçon disponible dans ce chapitre.</div>
                        ) : (
                          chapter.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/elearning/lessons/${lesson.id}`}
                              className="card"
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr auto",
                                gap: 14,
                                alignItems: "center",
                                textDecoration: "none",
                                color: "inherit",
                                padding: 14,
                              }}
                            >
                              <div className="stack" style={{ gap: 5 }}>
                                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                                  <span style={getLessonStatusTone(lesson)}>
                                    {getLessonStatusLabel(lesson)}
                                  </span>
                                  <span className="badge">{formatDuration(lesson.duration_seconds)}</span>
                                </div>

                                <strong>{lesson.title}</strong>

                                {lesson.description ? (
                                  <div className="muted" style={{ lineHeight: 1.5 }}>
                                    {lesson.description}
                                  </div>
                                ) : null}
                              </div>

                              <div className="button ghost" style={{ whiteSpace: "nowrap" }}>
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
            </section>

            {course.progress_percent >= 100 ? (
              <section
                className="card stack"
                style={{
                  gap: 12,
                  border: "1px solid rgba(16,185,129,0.20)",
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.06))",
                }}
              >
                <span className="badge">Programme terminé</span>
                <div className="section-title">Prêt à passer à l’accompagnement ?</div>
                <div className="muted" style={{ lineHeight: 1.7 }}>
                  Vous avez terminé le programme Time’s UP!. Vous pouvez maintenant choisir un pack
                  LeanWorker ou réserver une conversation gratuite pour transformer la méthode en plan
                  d’action personnel.
                </div>

                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  <Link className="button" href="/elearning/subscribe">
                    Voir les packs
                  </Link>
                  <a className="button ghost" href="#" target="_blank" rel="noreferrer">
                    Réserver une conversation gratuite
                  </a>
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </ElearningShell>
  );
}