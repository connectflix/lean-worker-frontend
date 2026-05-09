"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ElearningGuard } from "@/components/elearning-guard";
import { ElearningShell } from "@/components/elearning-shell";
import {
  getLearningCourseDetail,
  getLearningLessonDetail,
  getLearningLessonExercises,
  getLearningProgressSummary,
  getMe,
  updateLearningLessonProgress,
  upsertLearningExerciseSubmission,
} from "@/lib/api";
import type {
  LearningCourseDetail,
  LearningExercise,
  LearningLessonDetail,
  LearningProgressSummary,
  Me,
} from "@/lib/types";

const CALENDLY_FREE_CONVERSATION_URL =
  "https://calendly.com/flixtalent-connect/ad-hoc-conversation";

export default function ElearningLessonPage() {
  return (
    <ElearningGuard>
      <ElearningLessonContent />
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

function getProgressStatusLabel(status?: string | null, progressPercent?: number | null): string {
  const progress = Number(progressPercent ?? 0);

  if (status === "completed" || progress >= 100) return "Terminée";
  if (status === "in_progress" || progress > 0) return "En cours";
  return "À démarrer";
}

function getSubmissionStatusLabel(status?: string | null): string {
  const normalized = (status || "").trim().toLowerCase();

  if (normalized === "completed") return "Terminé";
  if (normalized === "reviewed") return "Revu";
  if (normalized === "submitted") return "Soumis";
  if (normalized === "draft") return "Brouillon";

  return "À faire";
}

function isExerciseSubmitted(exercise: LearningExercise): boolean {
  const status = (exercise.submission?.status || "").trim().toLowerCase();

  return status === "submitted" || status === "reviewed" || status === "completed";
}

function getRequiredExerciseStats(exercises: LearningExercise[]) {
  const requiredExercises = exercises.filter((exercise) => exercise.is_required);
  const submittedRequiredExercises = requiredExercises.filter(isExerciseSubmitted);

  return {
    requiredCount: requiredExercises.length,
    submittedRequiredCount: submittedRequiredExercises.length,
    missingRequiredCount: Math.max(
      requiredExercises.length - submittedRequiredExercises.length,
      0,
    ),
    allRequiredSubmitted:
      requiredExercises.length === 0 ||
      submittedRequiredExercises.length === requiredExercises.length,
  };
}

function buildCalendlyUrl(utmMedium: string, utmContent: string): string {
  const url = new URL(CALENDLY_FREE_CONVERSATION_URL);

  url.searchParams.set("utm_source", "leanworker_elearning");
  url.searchParams.set("utm_medium", utmMedium);
  url.searchParams.set("utm_campaign", "times_up_lesson_funnel");
  url.searchParams.set("utm_content", utmContent);

  return url.toString();
}

function VideoPlayer({ lesson }: { lesson: LearningLessonDetail }) {
  const demoVideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  const resolvedVideoUrl = lesson.video_url || demoVideoUrl;
  const isDemoVideo = !lesson.video_url;

  const isEmbeddable =
    resolvedVideoUrl.includes("youtube.com/embed") ||
    resolvedVideoUrl.includes("player.vimeo.com") ||
    lesson.video_provider === "embed" ||
    isDemoVideo;

  return (
    <div className="stack" style={{ gap: 10 }}>
      {isDemoVideo ? (
        <div
          className="card-soft"
          style={{
            border: "1px solid rgba(37,99,235,0.16)",
            background: "rgba(37,99,235,0.06)",
          }}
        >
          <strong>Vidéo de démonstration</strong>
          <div className="muted" style={{ marginTop: 4 }}>
            Aucune vidéo n’est encore associée à cette leçon. Une vidéo de démonstration est
            affichée temporairement pour valider le rendu du lecteur.
          </div>
        </div>
      ) : null}

      {isEmbeddable ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%",
            borderRadius: 18,
            overflow: "hidden",
            background: "#020617",
            border: "1px solid rgba(15,23,42,0.10)",
            boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
          }}
        >
          <iframe
            src={resolvedVideoUrl}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        </div>
      ) : (
        <video
          controls
          src={resolvedVideoUrl}
          style={{
            width: "100%",
            borderRadius: 18,
            background: "#020617",
            border: "1px solid rgba(15,23,42,0.10)",
            boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
          }}
        />
      )}
    </div>
  );
}

function LessonSalesCta({
  lesson,
  summary,
  isCompleted,
}: {
  lesson: LearningLessonDetail;
  summary: LearningProgressSummary | null;
  isCompleted: boolean;
}) {
  const progress = Number(summary?.overall_progress_percent ?? 0);
  const isFinalLesson = !lesson.next_lesson_id;
  const isProgramCompleted = isFinalLesson && isCompleted;

  const cta = (() => {
    if (isProgramCompleted || progress >= 95) {
      return {
        badge: "Fin du programme",
        title: "Vous avez maintenant la méthode. Passez à l’accompagnement.",
        body:
          "Time’s UP! vous a donné les concepts, les canvases, les puissances, les leviers et les preuves. L’étape suivante consiste à appliquer cette méthode à votre propre trajectoire avec un accompagnement humain et technologique.",
        primaryLabel: "Choisir mon accompagnement",
        primaryHref: "/elearning/subscribe",
        secondaryLabel: "Réserver une conversation gratuite",
        secondaryHref: buildCalendlyUrl("final_lesson_cta", `lesson_${lesson.id}`),
        tone: "conversion",
      };
    }

    if (progress >= 60) {
      return {
        badge: "Passage à l’action",
        title: "Vous êtes avancé dans le programme. C’est le bon moment pour structurer l’exécution.",
        body:
          "À ce stade, vous avez déjà identifié plusieurs mécanismes importants : temps, engagement, risques, leviers et preuves. Un accompagnement LeanWorker peut vous aider à transformer ces apprentissages en plan d’action personnel.",
        primaryLabel: "Choisir mon pack LeanWorker",
        primaryHref: "/elearning/subscribe",
        secondaryLabel: "Parler à un conseiller",
        secondaryHref: buildCalendlyUrl("advanced_progress_cta", `lesson_${lesson.id}`),
        tone: "strong",
      };
    }

    if (progress >= 25) {
      return {
        badge: "Clarification",
        title: "Vous commencez à voir vos tensions, vos objectifs et votre manière de travailler.",
        body:
          "La formation vous donne la méthode. L’accompagnement LeanWorker vous aide à l’appliquer à votre situation réelle : trajectoire, décisions, routines, recommandations et leviers.",
        primaryLabel: "Découvrir les packs d’accompagnement",
        primaryHref: "/elearning/subscribe",
        secondaryLabel: "Réserver une conversation gratuite",
        secondaryHref: buildCalendlyUrl("mid_program_cta", `lesson_${lesson.id}`),
        tone: "medium",
      };
    }

    return {
      badge: "Début du parcours",
      title: "Vous démarrez Time’s UP!. Vous pouvez déjà relier la méthode à votre situation.",
      body:
        "Si vous voulez comprendre comment le programme peut s’appliquer à votre réalité professionnelle, vous pouvez réserver une conversation gratuite. Sinon, continuez simplement la formation à votre rythme.",
      primaryLabel: "Réserver une conversation gratuite",
      primaryHref: buildCalendlyUrl("early_program_cta", `lesson_${lesson.id}`),
      secondaryLabel: "Voir les packs",
      secondaryHref: "/elearning/subscribe",
      tone: "soft",
    };
  })();

  const isPrimaryExternal = cta.primaryHref.startsWith("http");
  const isSecondaryExternal = cta.secondaryHref.startsWith("http");

  return (
    <section
      className="card stack"
      style={{
        gap: 14,
        border:
          cta.tone === "conversion"
            ? "1px solid rgba(16,185,129,0.26)"
            : cta.tone === "strong"
              ? "1px solid rgba(37,99,235,0.24)"
              : "1px solid rgba(15,23,42,0.08)",
        background:
          cta.tone === "conversion"
            ? "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(37,99,235,0.07))"
            : cta.tone === "strong"
              ? "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(124,58,237,0.06))"
              : cta.tone === "medium"
                ? "linear-gradient(135deg, rgba(37,99,235,0.07), rgba(255,255,255,0.96))"
                : "linear-gradient(135deg, rgba(15,23,42,0.035), rgba(255,255,255,0.96))",
      }}
    >
      <div className="row space-between" style={{ gap: 14, flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
          <span className="badge" style={{ alignSelf: "flex-start" }}>
            {cta.badge}
          </span>

          <div className="section-title" style={{ fontSize: 20 }}>
            {cta.title}
          </div>

          <div className="muted" style={{ lineHeight: 1.7 }}>
            {cta.body}
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 2 }}>
            <span className="badge">Conversations humaines</span>
            <span className="badge">Plateforme LeanWorker</span>
            <span className="badge">Recommendations</span>
            <span className="badge">Leviers</span>
          </div>
        </div>

        <div className="stack" style={{ gap: 10, minWidth: 240 }}>
          {isPrimaryExternal ? (
            <a
              className="button"
              href={cta.primaryHref}
              target="_blank"
              rel="noreferrer"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {cta.primaryLabel}
            </a>
          ) : (
            <Link
              className="button"
              href={cta.primaryHref}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {cta.primaryLabel}
            </Link>
          )}

          {isSecondaryExternal ? (
            <a
              className="button ghost"
              href={cta.secondaryHref}
              target="_blank"
              rel="noreferrer"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {cta.secondaryLabel}
            </a>
          ) : (
            <Link
              className="button ghost"
              href={cta.secondaryHref}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {cta.secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function LessonExercises({
  exercises,
  onRefresh,
}: {
  exercises: LearningExercise[];
  onRefresh: () => Promise<void>;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savingExerciseId, setSavingExerciseId] = useState<number | null>(null);
  const [exerciseError, setExerciseError] = useState<string | null>(null);

  useEffect(() => {
    const nextAnswers: Record<number, string> = {};

    for (const exercise of exercises) {
      nextAnswers[exercise.id] = exercise.submission?.answer_text ?? "";
    }

    setAnswers(nextAnswers);
  }, [exercises]);

  async function handleSave(exercise: LearningExercise, status: "draft" | "submitted") {
    setSavingExerciseId(exercise.id);
    setExerciseError(null);

    try {
      await upsertLearningExerciseSubmission(exercise.id, {
        status,
        answer_text: answers[exercise.id] ?? "",
        answer_json: null,
      });

      await onRefresh();
    } catch (err) {
      setExerciseError(
        err instanceof Error ? err.message : "Impossible d’enregistrer l’exercice.",
      );
    } finally {
      setSavingExerciseId(null);
    }
  }

  const requiredStats = getRequiredExerciseStats(exercises);

  if (exercises.length === 0) {
    return (
      <section className="card stack" style={{ gap: 10 }}>
        <div className="section-title">Exercice pratique</div>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          Aucun exercice n’est encore associé à cette leçon. Les exercices permettront bientôt
          de transformer chaque concept en réflexion, décision ou action concrète.
        </div>
      </section>
    );
  }

  return (
    <section className="card stack" style={{ gap: 16 }}>
      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">Exercices pratiques</div>
          <div className="muted">
            Répondez aux exercices pour transformer la leçon en réflexion personnelle et en
            passage à l’action.
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="badge">{exercises.length} exercice(s)</span>

          {requiredStats.requiredCount > 0 ? (
            <span className="badge">
              {requiredStats.submittedRequiredCount}/{requiredStats.requiredCount} obligatoire(s)
              soumis
            </span>
          ) : null}
        </div>
      </div>

      {!requiredStats.allRequiredSubmitted ? (
        <div
          className="card-soft"
          style={{
            border: "1px solid rgba(251,191,36,0.32)",
            background: "rgba(251,191,36,0.10)",
            lineHeight: 1.6,
          }}
        >
          <strong>Exercices requis à compléter</strong>
          <div className="muted" style={{ marginTop: 4 }}>
            Il reste {requiredStats.missingRequiredCount} exercice(s) obligatoire(s) à soumettre
            avant de pouvoir marquer la leçon comme terminée.
          </div>
        </div>
      ) : null}

      {exerciseError ? (
        <div className="card-soft" style={{ color: "var(--danger)" }}>
          {exerciseError}
        </div>
      ) : null}

      <div className="stack" style={{ gap: 12 }}>
        {exercises.map((exercise, index) => {
          const statusLabel = getSubmissionStatusLabel(exercise.submission?.status);
          const currentAnswer = answers[exercise.id] ?? "";
          const isSaving = savingExerciseId === exercise.id;
          const isSubmitted = isExerciseSubmitted(exercise);

          return (
            <article
              key={exercise.id}
              className="card-soft stack"
              style={{
                gap: 12,
                border: isSubmitted
                  ? "1px solid rgba(16,185,129,0.22)"
                  : "1px solid rgba(15,23,42,0.08)",
                background: isSubmitted
                  ? "linear-gradient(135deg, rgba(16,185,129,0.07), rgba(255,255,255,0.96))"
                  : undefined,
              }}
            >
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 6, maxWidth: 760 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">Exercice {index + 1}</span>
                    <span className="badge">{exercise.exercise_type}</span>
                    {exercise.is_required ? <span className="badge">Obligatoire</span> : null}
                    <span className="badge">{statusLabel}</span>
                  </div>

                  <div className="section-title" style={{ fontSize: 18 }}>
                    {exercise.title}
                  </div>

                  {exercise.instructions ? (
                    <div className="muted" style={{ lineHeight: 1.7 }}>
                      {exercise.instructions}
                    </div>
                  ) : null}
                </div>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(event) =>
                  setAnswers((current) => ({
                    ...current,
                    [exercise.id]: event.target.value,
                  }))
                }
                placeholder="Écrivez votre réponse ici..."
                rows={6}
                style={{
                  width: "100%",
                  resize: "vertical",
                  borderRadius: 16,
                  border: "1px solid rgba(15,23,42,0.12)",
                  padding: 14,
                  font: "inherit",
                  lineHeight: 1.6,
                  background: "rgba(255,255,255,0.82)",
                  color: "inherit",
                  outline: "none",
                }}
              />

              {exercise.submission?.feedback_text ? (
                <div
                  className="card"
                  style={{
                    padding: 12,
                    background: "rgba(37,99,235,0.06)",
                    border: "1px solid rgba(37,99,235,0.14)",
                  }}
                >
                  <strong>Feedback</strong>
                  <div className="muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
                    {exercise.submission.feedback_text}
                  </div>
                </div>
              ) : null}

              <div className="row space-between" style={{ gap: 10, flexWrap: "wrap" }}>
                <div className="muted" style={{ fontSize: 13 }}>
                  {exercise.submission?.updated_at
                    ? `Dernière mise à jour : ${new Date(
                        exercise.submission.updated_at,
                      ).toLocaleString()}`
                    : "Pas encore enregistré"}
                </div>

                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={isSaving}
                    onClick={() => void handleSave(exercise, "draft")}
                  >
                    {isSaving ? "Sauvegarde..." : "Sauvegarder le brouillon"}
                  </button>

                  <button
                    className="button"
                    type="button"
                    disabled={isSaving || currentAnswer.trim().length === 0}
                    onClick={() => void handleSave(exercise, "submitted")}
                  >
                    {isSaving
                      ? "Soumission..."
                      : isSubmitted
                        ? "Soumettre à nouveau"
                        : "Soumettre l’exercice"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ElearningLessonContent() {
  const params = useParams();

  const lessonId = useMemo(() => {
    const raw = params?.lessonId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number(value);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params]);

  const [user, setUser] = useState<Me | null>(null);
  const [lesson, setLesson] = useState<LearningLessonDetail | null>(null);
  const [course, setCourse] = useState<LearningCourseDetail | null>(null);
  const [summary, setSummary] = useState<LearningProgressSummary | null>(null);
  const [exercises, setExercises] = useState<LearningExercise[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshExercises(targetLessonId?: number) {
    const resolvedLessonId = targetLessonId ?? lesson?.id;

    if (!resolvedLessonId) return;

    const exercisesResponse = await getLearningLessonExercises(resolvedLessonId);
    setExercises(exercisesResponse.exercises);
  }

  async function loadLesson() {
    if (!lessonId) {
      setError("Leçon introuvable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [me, lessonDetail] = await Promise.all([
        getMe(),
        getLearningLessonDetail(lessonId),
      ]);

      const [courseDetail, progressSummary, exercisesResponse] = await Promise.all([
        getLearningCourseDetail(lessonDetail.course_id),
        getLearningProgressSummary(),
        getLearningLessonExercises(lessonDetail.id),
      ]);

      setUser(me);
      setLesson(lessonDetail);
      setCourse(courseDetail);
      setSummary(progressSummary);
      setExercises(exercisesResponse.exercises);

      const currentProgress = Number(lessonDetail.progress?.progress_percent ?? 0);

      if (!lessonDetail.progress || currentProgress <= 0) {
        await updateLearningLessonProgress(lessonDetail.id, {
          status: "in_progress",
          progress_percent: Math.max(currentProgress, 5),
        });

        const [refreshedLesson, refreshedSummary, refreshedCourse] = await Promise.all([
          getLearningLessonDetail(lessonDetail.id),
          getLearningProgressSummary(),
          getLearningCourseDetail(lessonDetail.course_id),
        ]);

        setLesson(refreshedLesson);
        setSummary(refreshedSummary);
        setCourse(refreshedCourse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger la leçon.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkCompleted() {
    if (!lesson) return;

    const requiredStats = getRequiredExerciseStats(exercises);

    if (!requiredStats.allRequiredSubmitted) {
      setError(
        `Vous devez d’abord soumettre ${requiredStats.missingRequiredCount} exercice(s) obligatoire(s) avant de terminer la leçon.`,
      );
      return;
    }

    setSavingProgress(true);
    setError(null);

    try {
      await updateLearningLessonProgress(lesson.id, {
        status: "completed",
        progress_percent: 100,
      });

      const [refreshedLesson, refreshedCourse, refreshedSummary, refreshedExercises] =
        await Promise.all([
          getLearningLessonDetail(lesson.id),
          getLearningCourseDetail(lesson.course_id),
          getLearningProgressSummary(),
          getLearningLessonExercises(lesson.id),
        ]);

      setLesson(refreshedLesson);
      setCourse(refreshedCourse);
      setSummary(refreshedSummary);
      setExercises(refreshedExercises.exercises);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de mettre à jour la progression.");
    } finally {
      setSavingProgress(false);
    }
  }

  useEffect(() => {
    void loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const lessonProgress = Number(lesson?.progress?.progress_percent ?? 0);
  const isCompleted = lesson?.progress?.status === "completed" || lessonProgress >= 100;

  const requiredStats = useMemo(() => getRequiredExerciseStats(exercises), [exercises]);

  return (
    <ElearningShell
      title={lesson?.course_title ?? "LeanWorker E-Learning"}
      subtitle={lesson?.chapter_title ?? "Leçon du programme Time’s UP!"}
      user={user}
      courseId={course?.id ?? lesson?.course_id ?? null}
      chapters={course?.chapters ?? []}
      progressPercent={summary?.overall_progress_percent ?? course?.progress_percent ?? 0}
    >
      <div className="stack" style={{ gap: 18 }}>
        {loading ? (
          <div className="card-soft">Chargement de la leçon...</div>
        ) : error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : !lesson ? (
          <div className="card-soft">Leçon introuvable.</div>
        ) : (
          <>
            <section className="card stack" style={{ gap: 16 }}>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">{lesson.chapter_title}</span>
                    <span className="badge">{formatDuration(lesson.duration_seconds)}</span>
                    <span className="badge">
                      {getProgressStatusLabel(
                        lesson.progress?.status,
                        lesson.progress?.progress_percent,
                      )}
                    </span>

                    {exercises.length > 0 ? (
                      <span className="badge">{exercises.length} exercice(s)</span>
                    ) : null}

                    {requiredStats.requiredCount > 0 ? (
                      <span className="badge">
                        {requiredStats.submittedRequiredCount}/{requiredStats.requiredCount} requis
                      </span>
                    ) : null}
                  </div>

                  <h1
                    className="title"
                    style={{
                      margin: 0,
                      fontSize: 36,
                      lineHeight: 1.08,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {lesson.title}
                  </h1>

                  {lesson.description ? (
                    <p className="muted" style={{ lineHeight: 1.7, margin: 0 }}>
                      {lesson.description}
                    </p>
                  ) : null}
                </div>

                <div className="card-soft stack" style={{ gap: 8, minWidth: 220 }}>
                  <div className="muted">Progression de la leçon</div>
                  <div className="admin-metric-value">{formatPercent(lessonProgress)}</div>

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
                        width: formatPercent(lessonProgress),
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(135deg, #2563eb, #10b981)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="card stack" style={{ gap: 14 }}>
              <VideoPlayer lesson={lesson} />

              <LessonExercises
                exercises={exercises}
                onRefresh={() => refreshExercises(lesson.id)}
              />

              <LessonSalesCta lesson={lesson} summary={summary} isCompleted={isCompleted} />

              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  {lesson.previous_lesson_id ? (
                    <Link
                      className="button ghost"
                      href={`/elearning/lessons/${lesson.previous_lesson_id}`}
                    >
                      Leçon précédente
                    </Link>
                  ) : (
                    <Link
                      className="button ghost"
                      href={`/elearning/courses/${lesson.course_id}`}
                    >
                      Retour au programme
                    </Link>
                  )}

                  {lesson.next_lesson_id ? (
                    <Link
                      className="button ghost"
                      href={`/elearning/lessons/${lesson.next_lesson_id}`}
                    >
                      Leçon suivante
                    </Link>
                  ) : (
                    <Link
                      className="button ghost"
                      href={`/elearning/courses/${lesson.course_id}`}
                    >
                      Voir le programme complet
                    </Link>
                  )}
                </div>

                <button
                  className="button"
                  type="button"
                  onClick={() => void handleMarkCompleted()}
                  disabled={
                    savingProgress ||
                    isCompleted ||
                    !requiredStats.allRequiredSubmitted
                  }
                  title={
                    !requiredStats.allRequiredSubmitted
                      ? "Soumettez d’abord les exercices obligatoires."
                      : undefined
                  }
                >
                  {isCompleted
                    ? "Leçon terminée"
                    : savingProgress
                      ? "Mise à jour..."
                      : !requiredStats.allRequiredSubmitted
                        ? "Exercices requis à compléter"
                        : "Marquer comme terminée"}
                </button>
              </div>
            </section>

            {!lesson.next_lesson_id && isCompleted ? (
              <section
                className="card stack"
                style={{
                  gap: 12,
                  border: "1px solid rgba(16,185,129,0.20)",
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.06))",
                }}
              >
                <span className="badge">Fin du programme</span>
                <div className="section-title">Passez maintenant à l’accompagnement LeanWorker</div>
                <div className="muted" style={{ lineHeight: 1.7 }}>
                  Vous avez terminé la dernière leçon. Le programme vous a donné la méthode ;
                  l’accompagnement vous aide maintenant à l’appliquer à votre propre trajectoire.
                </div>

                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  <Link className="button" href="/elearning/subscribe">
                    Voir les packs d’accompagnement
                  </Link>
                  <a
                    className="button ghost"
                    href={buildCalendlyUrl("final_program_bottom_cta", `lesson_${lesson.id}`)}
                    target="_blank"
                    rel="noreferrer"
                  >
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