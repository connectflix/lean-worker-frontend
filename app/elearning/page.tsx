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

  return (
    <ElearningShell
      title="LeanWorker E-Learning"
      subtitle="Programme Time’s UP! — apprendre à devenir un Lean Worker."
      user={user}
      courseId={mainCourse?.id ?? null}
      chapters={mainCourseDetail?.chapters ?? []}
      progressPercent={summary?.overall_progress_percent ?? 0}
    >
      <div className="stack" style={{ gap: 18 }}>
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
              <span className="badge">Programme de formation Lean Worker</span>

              <h1
                className="title"
                style={{
                  margin: 0,
                  fontSize: 46,
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                }}
              >
                Time’s UP!
              </h1>

              <div className="subtitle" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                Work this way or die trying
              </div>

              <p className="muted" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 760 }}>
                Une formation structurée pour comprendre la méthode Lean Worker :
                rapport au temps, purpose, significance, engagement, puissances,
                risques, leviers, preuves et passage à l’action.
              </p>
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 10,
                minWidth: 260,
                border: "1px solid rgba(37,99,235,0.14)",
              }}
            >
              <div className="muted">Progression globale</div>
              <div className="admin-metric-value">
                {formatPercent(summary?.overall_progress_percent)}
              </div>
              <div className="muted">
                {summary?.completed_lessons ?? 0} leçon(s) terminée(s) sur{" "}
                {summary?.total_lessons ?? 0}
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
                    width: formatPercent(summary?.overall_progress_percent),
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #2563eb, #10b981)",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="card-soft">Chargement du contenu de formation...</div>
        ) : error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="card-soft stack" style={{ gap: 8 }}>
            <strong>Aucun programme publié pour le moment.</strong>
            <div className="muted">
              Exécutez le script de seed ou publiez un programme avant d’utiliser cet espace.
            </div>
          </div>
        ) : (
          <>
            {mainCourse ? (
              <section className="card stack" style={{ gap: 16 }}>
                <div className="row space-between" style={{ gap: 14, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 6 }}>
                    <div className="section-title">Programme principal</div>
                    <div className="muted">
                      Reprenez votre progression dans le parcours Time’s UP!.
                    </div>
                  </div>

                  <Link className="button" href={`/elearning/courses/${mainCourse.id}`}>
                    {getCourseCtaLabel(mainCourse)}
                  </Link>
                </div>

                <div className="card-soft stack" style={{ gap: 12 }}>
                  <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                    <div className="stack" style={{ gap: 4 }}>
                      <h2 className="section-title" style={{ fontSize: 24 }}>
                        {mainCourse.title}
                      </h2>
                      {mainCourse.subtitle ? (
                        <div className="subtitle" style={{ margin: 0 }}>
                          {mainCourse.subtitle}
                        </div>
                      ) : null}
                    </div>

                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge">{mainCourse.total_lessons} leçon(s)</span>
                      <span className="badge">
                        {mainCourse.completed_lessons} terminée(s)
                      </span>
                      <span className="badge">{formatPercent(mainCourse.progress_percent)}</span>
                    </div>
                  </div>

                  {mainCourse.description ? (
                    <p className="muted" style={{ lineHeight: 1.7 }}>
                      {mainCourse.description}
                    </p>
                  ) : null}

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
                        width: formatPercent(mainCourse.progress_percent),
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(135deg, #2563eb, #10b981)",
                      }}
                    />
                  </div>
                </div>
              </section>
            ) : null}

            {mainCourseDetail ? (
              <section className="card stack" style={{ gap: 14 }}>
                <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="section-title">Structure du programme</div>
                    <div className="muted">
                      Parcourez les chapitres et démarrez la leçon souhaitée.
                    </div>
                  </div>

                  <span className="badge">
                    {mainCourseDetail.chapters.length} chapitre(s)
                  </span>
                </div>

                <div className="stack" style={{ gap: 10 }}>
                  {mainCourseDetail.chapters.map((chapter) => {
                    const firstLesson = chapter.lessons[0] ?? null;
                    const completedLessons = chapter.lessons.filter((lesson) => {
                      return (
                        lesson.progress?.status === "completed" ||
                        Number(lesson.progress?.progress_percent ?? 0) >= 100
                      );
                    }).length;

                    return (
                      <div
                        id={`chapter-${chapter.id}`}
                        key={chapter.id}
                        className="card-soft stack"
                        style={{ gap: 10 }}
                      >
                        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                          <div className="stack" style={{ gap: 4 }}>
                            <div className="row" style={{ gap: 8, alignItems: "center" }}>
                              <span className="badge">Chapitre {chapter.display_order}</span>
                              <span className="badge">
                                {completedLessons}/{chapter.lessons.length} leçon(s)
                              </span>
                            </div>

                            <strong>{chapter.title}</strong>

                            {chapter.description ? (
                              <div className="muted">{chapter.description}</div>
                            ) : null}
                          </div>

                          {firstLesson ? (
                            <Link className="button ghost" href={`/elearning/lessons/${firstLesson.id}`}>
                              Ouvrir
                            </Link>
                          ) : null}
                        </div>
                      </div>
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