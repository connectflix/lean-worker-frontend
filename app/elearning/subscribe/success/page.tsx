// app/elearning/subscription/success/page.tsx
"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import {
  CheckCircleIcon,
  ClockIcon,
  LayerIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type PackContent = {
  label: string;
  subtitle: string;
  nextStep: string;
};

const PACK_CONTENT: Record<string, PackContent> = {
  standard: {
    label: "Standard",
    subtitle: "Commencer avec méthode",
    nextStep:
      "Commencez par continuer votre formation Time’s UP!, puis utilisez LeanWorker pour transformer vos apprentissages en premières actions concrètes.",
  },
  classique: {
    label: "Classique",
    subtitle: "Structurer sa trajectoire",
    nextStep:
      "Vous pouvez maintenant utiliser LeanWorker pour clarifier votre trajectoire, structurer votre Career Blueprint et convertir vos apprentissages en recommandations actionnables.",
  },
  flix: {
    label: "Flix",
    subtitle: "Accélérer sa transformation",
    nextStep:
      "Vous pouvez maintenant accélérer votre passage à l’action avec un accompagnement plus personnalisé, vos leviers prioritaires et un suivi plus rapproché.",
  },
  executif: {
    label: "Exécutif",
    subtitle: "Accompagnement premium",
    nextStep:
      "Votre demande nécessite une qualification dédiée. Réservez une conversation pour aligner le niveau d’accompagnement avec vos enjeux.",
  },
};

export default function ElearningSubscribeSuccessPage() {
  return (
    <ElearningGuard>
      <Suspense fallback={<SuccessFallback />}>
        <ElearningSubscribeSuccessContent />
      </Suspense>
    </ElearningGuard>
  );
}

function SuccessFallback() {
  return (
    <main
      className="page"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(34,197,94,0.16), transparent 34%), linear-gradient(135deg, #050505, #11100f 48%, #1b120b)",
        color: "#f8fafc",
      }}
    >
      <div className="container">
        <div
          className="stack"
          style={{
            minHeight: 260,
            justifyContent: "center",
            padding: 28,
            borderRadius: 32,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div style={{ color: "#ffffff", fontWeight: 900 }}>
            Chargement de votre confirmation...
          </div>
          <div style={{ color: "rgba(248,250,252,0.62)" }}>
            Préparation de votre espace d’accompagnement.
          </div>
        </div>
      </div>
    </main>
  );
}

function normalizePackLabel(value?: string | null): PackContent {
  const normalized = (value || "").trim().toLowerCase();

  return (
    PACK_CONTENT[normalized] || {
      label: value || "votre pack",
      subtitle: "Accompagnement LeanWorker",
      nextStep:
        "Votre souscription est en cours de confirmation. Vous pouvez continuer votre formation ou accéder à LeanWorker.",
    }
  );
}

function formatPercent(value?: number | null): string {
  const normalized = Number(value ?? 0);

  if (!Number.isFinite(normalized)) {
    return "0%";
  }

  return `${Math.round(normalized)}%`;
}

function MasterclassBadge({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "dark" | "gold" | "green";
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

function ElearningSubscribeSuccessContent() {
  const searchParams = useSearchParams();

  const [user, setUser] = useState<Me | null>(null);
  const [courses, setCourses] = useState<LearningCourseSummary[]>([]);
  const [mainCourseDetail, setMainCourseDetail] =
    useState<LearningCourseDetail | null>(null);
  const [summary, setSummary] = useState<LearningProgressSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const packParam = searchParams.get("pack");
  const sessionId = searchParams.get("session_id");

  const packContent = useMemo(() => normalizePackLabel(packParam), [packParam]);

  async function loadContext() {
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
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger la confirmation de souscription.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadContext();
  }, []);

  const mainCourse = courses[0] ?? null;

  return (
    <ElearningShell
      title="Souscription confirmée"
      subtitle="Votre accompagnement LeanWorker est en cours d’activation."
      user={user}
      courseId={mainCourse?.id ?? null}
      chapters={mainCourseDetail?.chapters ?? []}
      progressPercent={summary?.overall_progress_percent ?? 0}
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
            <div style={{ color: "#ffffff", fontWeight: 900 }}>
              Chargement de votre confirmation...
            </div>
            <div style={{ color: "rgba(248,250,252,0.62)" }}>
              Nous récupérons votre contexte de formation et votre progression.
            </div>
          </MasterclassPanel>
        ) : error ? (
          <MasterclassPanel>
            <div style={{ color: "#fca5a5", fontWeight: 900 }}>
              Confirmation indisponible
            </div>
            <div style={{ color: "rgba(248,250,252,0.68)" }}>{error}</div>
          </MasterclassPanel>
        ) : (
          <>
            <section
              className="stack"
              style={{
                position: "relative",
                overflow: "hidden",
                gap: 24,
                minHeight: 470,
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: 34,
                borderRadius: 38,
                background:
                  "radial-gradient(circle at 18% 0%, rgba(34,197,94,0.18), transparent 32%), radial-gradient(circle at 88% 12%, rgba(250,204,21,0.13), transparent 30%), linear-gradient(135deg, #0a0a0a 0%, #11100f 48%, #1e120b 100%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow:
                  "0 34px 100px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: -130,
                  right: -110,
                  width: 340,
                  height: 340,
                  borderRadius: 999,
                  background: "rgba(34,197,94,0.13)",
                }}
              />

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: -140,
                  bottom: -170,
                  width: 380,
                  height: 380,
                  borderRadius: 999,
                  background: "rgba(249,115,22,0.13)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: 70,
                  height: 70,
                  borderRadius: 24,
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(251,191,36,0.12))",
                  border: "1px solid rgba(255,255,255,0.13)",
                  boxShadow: "0 20px 60px rgba(34,197,94,0.10)",
                }}
              >
                <CheckCircleIcon size={34} color="#bbf7d0" />
              </div>

              <div
                className="row"
                style={{
                  justifyContent: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <MasterclassBadge tone="green">
                  <CheckCircleIcon size={14} color="#bbf7d0" />
                  Paiement confirmé
                </MasterclassBadge>

                <MasterclassBadge tone="gold">
                  <SparkIcon size={14} color="#fbbf24" />
                  Pack {packContent.label}
                </MasterclassBadge>
              </div>

              <div
                className="stack"
                style={{
                  gap: 14,
                  alignItems: "center",
                  maxWidth: 860,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: 52,
                    lineHeight: 0.98,
                    fontWeight: 950,
                    letterSpacing: "-0.08em",
                    maxWidth: 840,
                  }}
                >
                  Bienvenue dans votre accompagnement LeanWorker.
                </h1>

                <p
                  style={{
                    color: "rgba(248,250,252,0.68)",
                    fontSize: 17,
                    lineHeight: 1.75,
                    margin: 0,
                    maxWidth: 760,
                  }}
                >
                  Votre souscription au pack <strong>{packContent.label}</strong>{" "}
                  — {packContent.subtitle} — a été initiée avec succès.
                </p>
              </div>

              <div
                className="stack"
                style={{
                  gap: 9,
                  width: "100%",
                  maxWidth: 760,
                  textAlign: "left",
                  padding: 18,
                  borderRadius: 26,
                  background: "rgba(255,255,255,0.075)",
                  border: "1px solid rgba(255,255,255,0.11)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <strong style={{ color: "#ffffff" }}>Prochaine étape</strong>
                <div style={{ color: "rgba(248,250,252,0.64)", lineHeight: 1.75 }}>
                  {packContent.nextStep}
                </div>
              </div>

              {sessionId ? (
                <div
                  style={{
                    color: "rgba(248,250,252,0.48)",
                    fontSize: 12,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Référence Stripe : {sessionId}
                </div>
              ) : null}

              <div
                className="row"
                style={{
                  gap: 10,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Link
                  className="button"
                  href="/dashboard"
                  style={{
                    background: "#ffffff",
                    color: "#111827",
                    borderRadius: 16,
                    minHeight: 46,
                    justifyContent: "center",
                  }}
                >
                  Accéder à LeanWorker
                </Link>

                {mainCourse ? (
                  <Link
                    className="button ghost"
                    href={`/elearning/courses/${mainCourse.id}`}
                    style={{
                      color: "rgba(248,250,252,0.82)",
                      borderColor: "rgba(255,255,255,0.16)",
                      borderRadius: 16,
                      minHeight: 46,
                      justifyContent: "center",
                    }}
                  >
                    Continuer la formation
                  </Link>
                ) : (
                  <Link
                    className="button ghost"
                    href="/elearning"
                    style={{
                      color: "rgba(248,250,252,0.82)",
                      borderColor: "rgba(255,255,255,0.16)",
                      borderRadius: 16,
                      minHeight: 46,
                      justifyContent: "center",
                    }}
                  >
                    Retour à la formation
                  </Link>
                )}

                <Link
                  className="button ghost"
                  href="/recommendations"
                  style={{
                    color: "rgba(248,250,252,0.82)",
                    borderColor: "rgba(255,255,255,0.16)",
                    borderRadius: 16,
                    minHeight: 46,
                    justifyContent: "center",
                  }}
                >
                  Voir mes recommandations
                </Link>
              </div>
            </section>

            <div className="grid grid-3">
              <div
                className="stack"
                style={{
                  gap: 9,
                  padding: 18,
                  borderRadius: 28,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.045))",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <TargetIcon size={16} color="#fbbf24" />
                  <strong style={{ color: "#ffffff" }}>Pack activé</strong>
                </div>

                <div
                  style={{
                    color: "#ffffff",
                    fontSize: 28,
                    lineHeight: 1,
                    fontWeight: 950,
                    letterSpacing: "-0.06em",
                  }}
                >
                  {packContent.label}
                </div>

                <div style={{ color: "rgba(248,250,252,0.58)", lineHeight: 1.6 }}>
                  {packContent.subtitle}
                </div>
              </div>

              <div
                className="stack"
                style={{
                  gap: 9,
                  padding: 18,
                  borderRadius: 28,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.045))",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <LayerIcon size={16} color="#fbbf24" />
                  <strong style={{ color: "#ffffff" }}>Formation</strong>
                </div>

                <div
                  style={{
                    color: "#ffffff",
                    fontSize: 28,
                    lineHeight: 1,
                    fontWeight: 950,
                    letterSpacing: "-0.06em",
                  }}
                >
                  {formatPercent(summary?.overall_progress_percent)}
                </div>

                <div style={{ color: "rgba(248,250,252,0.58)", lineHeight: 1.6 }}>
                  {summary?.completed_lessons ?? 0} leçon(s) terminée(s) sur{" "}
                  {summary?.total_lessons ?? 0}
                </div>
              </div>

              <div
                className="stack"
                style={{
                  gap: 9,
                  padding: 18,
                  borderRadius: 28,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.045))",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <ClockIcon size={16} color="#fbbf24" />
                  <strong style={{ color: "#ffffff" }}>Activation</strong>
                </div>

                <div
                  style={{
                    color: "#ffffff",
                    fontSize: 28,
                    lineHeight: 1,
                    fontWeight: 950,
                    letterSpacing: "-0.06em",
                  }}
                >
                  En cours
                </div>

                <div style={{ color: "rgba(248,250,252,0.58)", lineHeight: 1.6 }}>
                  Finalisation technique dès réception du webhook Stripe.
                </div>
              </div>
            </div>

            <MasterclassPanel>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: 26,
                  lineHeight: 1.12,
                  fontWeight: 950,
                  letterSpacing: "-0.06em",
                }}
              >
                Ce qui vient d’être activé
              </div>

              <div className="grid grid-3">
                {[
                  {
                    title: "Approche humaine",
                    body:
                      "Des conversations pour transformer vos idées, blocages et intentions en décisions concrètes.",
                    icon: <SparkIcon size={16} color="#fbbf24" />,
                  },
                  {
                    title: "Approche technologique",
                    body:
                      "LeanWorker vous accompagne avec Career Blueprint, Adaptive Coach, Recommendations, leviers et suivi de progression.",
                    icon: <LayerIcon size={16} color="#fbbf24" />,
                  },
                  {
                    title: "Approche opérationnelle",
                    body:
                      "Le programme Time’s UP! devient un système d’action appliqué à votre propre trajectoire.",
                    icon: <CheckCircleIcon size={16} color="#fbbf24" />,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="stack"
                    style={{
                      gap: 9,
                      padding: 16,
                      borderRadius: 24,
                      background: "rgba(255,255,255,0.055)",
                      border: "1px solid rgba(255,255,255,0.09)",
                    }}
                  >
                    <div className="row" style={{ gap: 8, alignItems: "center" }}>
                      {item.icon}
                      <strong style={{ color: "#ffffff" }}>{item.title}</strong>
                    </div>

                    <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.65 }}>
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>
            </MasterclassPanel>

            <MasterclassPanel warm>
              <div className="row space-between" style={{ gap: 16, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 8, maxWidth: 820 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <MasterclassBadge tone="gold">
                      <ClockIcon size={14} color="#fbbf24" />
                      Important
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
                    Activation via Stripe webhook
                  </div>

                  <div style={{ color: "rgba(248,250,252,0.64)", lineHeight: 1.75 }}>
                    Votre paiement a été accepté par Stripe. L’activation technique de votre
                    souscription est finalisée dès réception du webhook Stripe côté backend.
                    Cela prend généralement quelques secondes.
                  </div>
                </div>

                <Link
                  className="button ghost"
                  href="/account/subscription"
                  style={{
                    color: "rgba(248,250,252,0.82)",
                    borderColor: "rgba(255,255,255,0.16)",
                    borderRadius: 16,
                    minHeight: 44,
                    justifyContent: "center",
                  }}
                >
                  Voir mon abonnement
                </Link>
              </div>
            </MasterclassPanel>
          </>
        )}
      </div>
    </ElearningShell>
  );
}