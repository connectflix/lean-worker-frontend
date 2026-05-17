// app/elearning/lessons/[lessonId]/page.tsx
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
import {
  CheckCircleIcon,
  ClockIcon,
  PathIcon,
  PlayCircleIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";

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

function MasterclassButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
}) {
  const style: React.CSSProperties =
    variant === "primary"
      ? {
          background: "#ffffff",
          color: "#111827",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.18)",
          minHeight: 44,
          justifyContent: "center",
        }
      : {
          color: "rgba(248,250,252,0.82)",
          borderColor: "rgba(255,255,255,0.16)",
          borderRadius: 16,
          minHeight: 44,
          justifyContent: "center",
        };

  if (external) {
    return (
      <a
        className={variant === "primary" ? "button" : "button ghost"}
        href={href}
        target="_blank"
        rel="noreferrer"
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className={variant === "primary" ? "button" : "button ghost"}
      href={href}
      style={style}
    >
      {children}
    </Link>
  );
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
    <div className="stack" style={{ gap: 12 }}>
      {isDemoVideo ? (
        <div
          className="stack"
          style={{
            gap: 6,
            padding: 15,
            borderRadius: 22,
            border: "1px solid rgba(251,191,36,0.24)",
            background: "rgba(251,191,36,0.10)",
          }}
        >
          <strong style={{ color: "#fbbf24" }}>Vidéo de démonstration</strong>
          <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.6 }}>
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
            borderRadius: 30,
            overflow: "hidden",
            background: "#020617",
            border: "1px solid rgba(255,255,255,0.11)",
            boxShadow:
              "0 34px 100px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)",
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
            borderRadius: 30,
            background: "#020617",
            border: "1px solid rgba(255,255,255,0.11)",
            boxShadow:
              "0 34px 100px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)",
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
    <MasterclassPanel warm={cta.tone === "conversion" || cta.tone === "strong"}>
      <div className="row space-between" style={{ gap: 14, flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 10, maxWidth: 760 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <MasterclassBadge tone={cta.tone === "soft" ? "dark" : "gold"}>
              <SparkIcon size={14} color={cta.tone === "soft" ? "rgba(248,250,252,0.70)" : "#fbbf24"} />
              {cta.badge}
            </MasterclassBadge>
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: 25,
              lineHeight: 1.12,
              fontWeight: 950,
              letterSpacing: "-0.06em",
            }}
          >
            {cta.title}
          </div>

          <div style={{ color: "rgba(248,250,252,0.64)", lineHeight: 1.75 }}>
            {cta.body}
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 2 }}>
            <MasterclassBadge>Conversations humaines</MasterclassBadge>
            <MasterclassBadge>Plateforme LeanWorker</MasterclassBadge>
            <MasterclassBadge>Recommendations</MasterclassBadge>
            <MasterclassBadge>Leviers</MasterclassBadge>
          </div>
        </div>

        <div className="stack" style={{ gap: 10, minWidth: 250 }}>
          <MasterclassButtonLink
            href={cta.primaryHref}
            external={isPrimaryExternal}
            variant="primary"
          >
            {cta.primaryLabel}
          </MasterclassButtonLink>

          <MasterclassButtonLink
            href={cta.secondaryHref}
            external={isSecondaryExternal}
            variant="ghost"
          >
            {cta.secondaryLabel}
          </MasterclassButtonLink>
        </div>
      </div>
    </MasterclassPanel>
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
      <MasterclassPanel>
        <div
          style={{
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 950,
            letterSpacing: "-0.055em",
          }}
        >
          Exercice pratique
        </div>

        <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.7 }}>
          Aucun exercice n’est encore associé à cette leçon. Les exercices permettront bientôt
          de transformer chaque concept en réflexion, décision ou action concrète.
        </div>
      </MasterclassPanel>
    );
  }

  return (
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
            Exercices pratiques
          </div>

          <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.65 }}>
            Répondez aux exercices pour transformer la leçon en réflexion personnelle et en
            passage à l’action.
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <MasterclassBadge>{exercises.length} exercice(s)</MasterclassBadge>

          {requiredStats.requiredCount > 0 ? (
            <MasterclassBadge tone="gold">
              {requiredStats.submittedRequiredCount}/{requiredStats.requiredCount} obligatoire(s)
              soumis
            </MasterclassBadge>
          ) : null}
        </div>
      </div>

      {!requiredStats.allRequiredSubmitted ? (
        <div
          className="stack"
          style={{
            gap: 5,
            padding: 15,
            borderRadius: 22,
            border: "1px solid rgba(251,191,36,0.26)",
            background: "rgba(251,191,36,0.10)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "#fbbf24" }}>Exercices requis à compléter</strong>
          <div style={{ color: "rgba(248,250,252,0.64)" }}>
            Il reste {requiredStats.missingRequiredCount} exercice(s) obligatoire(s) à soumettre
            avant de pouvoir marquer la leçon comme terminée.
          </div>
        </div>
      ) : null}

      {exerciseError ? (
        <div
          style={{
            color: "#fca5a5",
            padding: 14,
            borderRadius: 20,
            border: "1px solid rgba(239,68,68,0.22)",
            background: "rgba(239,68,68,0.10)",
          }}
        >
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
              className="stack"
              style={{
                gap: 12,
                padding: 16,
                borderRadius: 26,
                border: isSubmitted
                  ? "1px solid rgba(34,197,94,0.24)"
                  : "1px solid rgba(255,255,255,0.10)",
                background: isSubmitted
                  ? "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(255,255,255,0.045))"
                  : "linear-gradient(180deg, rgba(255,255,255,0.060), rgba(255,255,255,0.035))",
              }}
            >
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <MasterclassBadge>Exercice {index + 1}</MasterclassBadge>
                    <MasterclassBadge>{exercise.exercise_type}</MasterclassBadge>
                    {exercise.is_required ? (
                      <MasterclassBadge tone="gold">Obligatoire</MasterclassBadge>
                    ) : null}
                    <MasterclassBadge tone={isSubmitted ? "green" : "dark"}>
                      {statusLabel}
                    </MasterclassBadge>
                  </div>

                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: 19,
                      fontWeight: 950,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {exercise.title}
                  </div>

                  {exercise.instructions ? (
                    <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.7 }}>
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
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.13)",
                  padding: 15,
                  font: "inherit",
                  lineHeight: 1.65,
                  background: "rgba(0,0,0,0.24)",
                  color: "#f8fafc",
                  outline: "none",
                }}
              />

              {exercise.submission?.feedback_text ? (
                <div
                  className="stack"
                  style={{
                    gap: 6,
                    padding: 14,
                    borderRadius: 20,
                    background: "rgba(251,191,36,0.09)",
                    border: "1px solid rgba(251,191,36,0.20)",
                  }}
                >
                  <strong style={{ color: "#fbbf24" }}>Feedback</strong>
                  <div style={{ color: "rgba(248,250,252,0.64)", lineHeight: 1.6 }}>
                    {exercise.submission.feedback_text}
                  </div>
                </div>
              ) : null}

              <div className="row space-between" style={{ gap: 10, flexWrap: "wrap" }}>
                <div style={{ color: "rgba(248,250,252,0.52)", fontSize: 13 }}>
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
                    style={{
                      color: "rgba(248,250,252,0.82)",
                      borderColor: "rgba(255,255,255,0.16)",
                      borderRadius: 16,
                    }}
                  >
                    {isSaving ? "Sauvegarde..." : "Sauvegarder le brouillon"}
                  </button>

                  <button
                    className="button"
                    type="button"
                    disabled={isSaving || currentAnswer.trim().length === 0}
                    onClick={() => void handleSave(exercise, "submitted")}
                    style={{
                      background: "#ffffff",
                      color: "#111827",
                      borderRadius: 16,
                    }}
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
    </MasterclassPanel>
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
              Chargement de la leçon...
            </div>
            <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.7 }}>
              Préparation de la vidéo, des exercices et de votre progression.
            </div>
          </MasterclassPanel>
        ) : error ? (
          <MasterclassPanel>
            <div style={{ color: "#fca5a5", fontWeight: 900, fontSize: 18 }}>
              Impossible de charger ou mettre à jour la leçon
            </div>
            <div style={{ color: "rgba(248,250,252,0.68)" }}>{error}</div>
          </MasterclassPanel>
        ) : !lesson ? (
          <MasterclassPanel>
            <div style={{ color: "rgba(248,250,252,0.72)" }}>Leçon introuvable.</div>
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
                  "radial-gradient(circle at 18% 0%, rgba(239,68,68,0.20), transparent 32%), radial-gradient(circle at 88% 12%, rgba(250,204,21,0.13), transparent 30%), linear-gradient(135deg, #0a0a0a 0%, #11100f 48%, #1e120b 100%)",
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
                <div className="stack" style={{ gap: 13, maxWidth: 800 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <MasterclassBadge tone="gold">
                      <PathIcon size={14} color="#fbbf24" />
                      {lesson.chapter_title}
                    </MasterclassBadge>

                    <MasterclassBadge>
                      <ClockIcon size={14} color="rgba(248,250,252,0.70)" />
                      {formatDuration(lesson.duration_seconds)}
                    </MasterclassBadge>

                    <MasterclassBadge tone={isCompleted ? "green" : "dark"}>
                      {isCompleted ? (
                        <CheckCircleIcon size={14} color="#bbf7d0" />
                      ) : (
                        <PlayCircleIcon size={14} color="rgba(248,250,252,0.70)" />
                      )}
                      {getProgressStatusLabel(
                        lesson.progress?.status,
                        lesson.progress?.progress_percent,
                      )}
                    </MasterclassBadge>

                    {exercises.length > 0 ? (
                      <MasterclassBadge>{exercises.length} exercice(s)</MasterclassBadge>
                    ) : null}

                    {requiredStats.requiredCount > 0 ? (
                      <MasterclassBadge tone="gold">
                        {requiredStats.submittedRequiredCount}/{requiredStats.requiredCount} requis
                      </MasterclassBadge>
                    ) : null}
                  </div>

                  <h1
                    style={{
                      margin: 0,
                      color: "#ffffff",
                      fontSize: 48,
                      lineHeight: 0.98,
                      fontWeight: 950,
                      letterSpacing: "-0.075em",
                    }}
                  >
                    {lesson.title}
                  </h1>

                  {lesson.description ? (
                    <p
                      style={{
                        color: "rgba(248,250,252,0.64)",
                        fontSize: 16,
                        lineHeight: 1.75,
                        margin: 0,
                        maxWidth: 760,
                      }}
                    >
                      {lesson.description}
                    </p>
                  ) : null}
                </div>

                <div
                  className="stack"
                  style={{
                    gap: 12,
                    minWidth: 260,
                    maxWidth: 330,
                    padding: 20,
                    borderRadius: 28,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.055))",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ color: "rgba(248,250,252,0.62)", fontSize: 13 }}>
                    Progression de la leçon
                  </div>

                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: 42,
                      lineHeight: 1,
                      fontWeight: 950,
                      letterSpacing: "-0.07em",
                    }}
                  >
                    {formatPercent(lessonProgress)}
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
                        width: formatPercent(lessonProgress),
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(135deg, #facc15, #f97316, #ef4444)",
                      }}
                    />
                  </div>

                  <div style={{ color: "rgba(248,250,252,0.58)", lineHeight: 1.55 }}>
                    Regardez la vidéo, complétez les exercices requis, puis marquez la leçon comme
                    terminée.
                  </div>
                </div>
              </div>
            </section>

            <MasterclassPanel>
              <VideoPlayer lesson={lesson} />
            </MasterclassPanel>

            <LessonExercises
              exercises={exercises}
              onRefresh={() => refreshExercises(lesson.id)}
            />

            <LessonSalesCta lesson={lesson} summary={summary} isCompleted={isCompleted} />

            <MasterclassPanel>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  {lesson.previous_lesson_id ? (
                    <MasterclassButtonLink
                      href={`/elearning/lessons/${lesson.previous_lesson_id}`}
                      variant="ghost"
                    >
                      Leçon précédente
                    </MasterclassButtonLink>
                  ) : (
                    <MasterclassButtonLink
                      href={`/elearning/courses/${lesson.course_id}`}
                      variant="ghost"
                    >
                      Retour au programme
                    </MasterclassButtonLink>
                  )}

                  {lesson.next_lesson_id ? (
                    <MasterclassButtonLink
                      href={`/elearning/lessons/${lesson.next_lesson_id}`}
                      variant="ghost"
                    >
                      Leçon suivante
                    </MasterclassButtonLink>
                  ) : (
                    <MasterclassButtonLink
                      href={`/elearning/courses/${lesson.course_id}`}
                      variant="ghost"
                    >
                      Voir le programme complet
                    </MasterclassButtonLink>
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
                  style={{
                    background: isCompleted ? "rgba(34,197,94,0.16)" : "#ffffff",
                    color: isCompleted ? "#bbf7d0" : "#111827",
                    borderRadius: 16,
                    border: isCompleted
                      ? "1px solid rgba(34,197,94,0.24)"
                      : "1px solid rgba(255,255,255,0.18)",
                    minHeight: 44,
                  }}
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
            </MasterclassPanel>

            {!lesson.next_lesson_id && isCompleted ? (
              <MasterclassPanel warm>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <MasterclassBadge tone="green">
                    <CheckCircleIcon size={14} color="#bbf7d0" />
                    Fin du programme
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
                  Passez maintenant à l’accompagnement LeanWorker
                </div>

                <div style={{ color: "rgba(248,250,252,0.64)", lineHeight: 1.75 }}>
                  Vous avez terminé la dernière leçon. Le programme vous a donné la méthode ;
                  l’accompagnement vous aide maintenant à l’appliquer à votre propre trajectoire.
                </div>

                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  <MasterclassButtonLink href="/elearning/subscribe" variant="primary">
                    Voir les packs d’accompagnement
                  </MasterclassButtonLink>

                  <MasterclassButtonLink
                    href={buildCalendlyUrl("final_program_bottom_cta", `lesson_${lesson.id}`)}
                    external
                    variant="ghost"
                  >
                    Réserver une conversation gratuite
                  </MasterclassButtonLink>
                </div>
              </MasterclassPanel>
            ) : null}
          </>
        )}
      </div>
    </ElearningShell>
  );
}