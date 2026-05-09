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
    <main className="page">
      <div className="container">
        <div className="card-soft">Chargement de votre confirmation...</div>
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
      <div className="stack" style={{ gap: 18 }}>
        {loading ? (
          <div className="card-soft">Chargement de votre confirmation...</div>
        ) : error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : (
          <>
            <section
              className="card stack"
              style={{
                gap: 18,
                textAlign: "center",
                alignItems: "center",
                minHeight: 420,
                justifyContent: "center",
                border: "1px solid rgba(16,185,129,0.24)",
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(37,99,235,0.06))",
              }}
            >
              <span className="badge">Paiement confirmé</span>

              <h1
                className="title"
                style={{
                  margin: 0,
                  fontSize: 42,
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                  maxWidth: 760,
                }}
              >
                Bienvenue dans votre accompagnement LeanWorker.
              </h1>

              <p className="subtitle" style={{ maxWidth: 760, margin: 0, lineHeight: 1.7 }}>
                Votre souscription au pack <strong>{packContent.label}</strong>{" "}
                — {packContent.subtitle} — a été initiée avec succès.
              </p>

              <div
                className="card-soft"
                style={{
                  maxWidth: 760,
                  textAlign: "left",
                  border: "1px solid rgba(16,185,129,0.18)",
                  background: "rgba(255,255,255,0.72)",
                }}
              >
                <strong>Prochaine étape</strong>
                <div className="muted" style={{ marginTop: 6, lineHeight: 1.7 }}>
                  {packContent.nextStep}
                </div>
              </div>

              {sessionId ? (
                <div className="muted" style={{ fontSize: 13 }}>
                  Référence Stripe : {sessionId}
                </div>
              ) : null}

              <div className="row" style={{ gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Link className="button" href="/dashboard">
                  Accéder à LeanWorker
                </Link>

                {mainCourse ? (
                  <Link className="button ghost" href={`/elearning/courses/${mainCourse.id}`}>
                    Continuer la formation
                  </Link>
                ) : (
                  <Link className="button ghost" href="/elearning">
                    Retour à la formation
                  </Link>
                )}

                <Link className="button ghost" href="/recommendations">
                  Voir mes recommandations
                </Link>
              </div>
            </section>

            <section className="card stack" style={{ gap: 12 }}>
              <div className="section-title">Ce qui vient d’être activé</div>

              <div className="grid grid-3">
                <div className="card-soft stack" style={{ gap: 8 }}>
                  <strong>Approche humaine</strong>
                  <div className="muted" style={{ lineHeight: 1.6 }}>
                    Des conversations pour transformer vos idées, blocages et intentions en décisions
                    concrètes.
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 8 }}>
                  <strong>Approche technologique</strong>
                  <div className="muted" style={{ lineHeight: 1.6 }}>
                    LeanWorker vous accompagne avec Career Blueprint, Adaptive Coach, Recommendations,
                    leviers et suivi de progression.
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 8 }}>
                  <strong>Approche opérationnelle</strong>
                  <div className="muted" style={{ lineHeight: 1.6 }}>
                    Le programme Time’s UP! devient un système d’action appliqué à votre propre
                    trajectoire.
                  </div>
                </div>
              </div>
            </section>

            <section
              className="card stack"
              style={{
                gap: 12,
                border: "1px solid rgba(37,99,235,0.16)",
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.07), rgba(255,255,255,0.96))",
              }}
            >
              <span className="badge">Important</span>
              <div className="section-title">Activation via Stripe webhook</div>
              <div className="muted" style={{ lineHeight: 1.7 }}>
                Votre paiement a été accepté par Stripe. L’activation technique de votre souscription
                est finalisée dès réception du webhook Stripe côté backend. Cela prend généralement
                quelques secondes.
              </div>
            </section>
          </>
        )}
      </div>
    </ElearningShell>
  );
}