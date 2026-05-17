// app/elearning/subscribe/cancel/page.tsx
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

type BillingCycle = "monthly" | "yearly";

type PackContent = {
  key: "standard" | "classique" | "flix" | "executif";
  label: string;
  subtitle: string;
  retryLabel: string;
};

const CALENDLY_FREE_CONVERSATION_URL =
  "https://calendly.com/flixtalent-connect/ad-hoc-conversation";

const PACK_CONTENT: Record<string, PackContent> = {
  standard: {
    key: "standard",
    label: "Standard",
    subtitle: "Commencer avec méthode",
    retryLabel: "Réessayer Standard",
  },
  classique: {
    key: "classique",
    label: "Classique",
    subtitle: "Structurer sa trajectoire",
    retryLabel: "Réessayer Classique",
  },
  flix: {
    key: "flix",
    label: "Flix",
    subtitle: "Accélérer sa transformation",
    retryLabel: "Réessayer Flix",
  },
  executif: {
    key: "executif",
    label: "Exécutif",
    subtitle: "Accompagnement premium",
    retryLabel: "Réserver pour Exécutif",
  },
};

export default function ElearningSubscribeCancelPage() {
  return (
    <ElearningGuard>
      <Suspense fallback={<CancelFallback />}>
        <ElearningSubscribeCancelContent />
      </Suspense>
    </ElearningGuard>
  );
}

function CancelFallback() {
  return (
    <main className="page">
      <div className="container">
        <div className="card-soft">Chargement de la page d’annulation...</div>
      </div>
    </main>
  );
}

function formatPercent(value?: number | null): string {
  const normalized = Number(value ?? 0);

  if (!Number.isFinite(normalized)) {
    return "0%";
  }

  return `${Math.round(normalized)}%`;
}

function normalizePack(value?: string | null): PackContent | null {
  const normalized = (value || "").trim().toLowerCase();

  if (normalized === "executive") {
    return PACK_CONTENT.executif;
  }

  return PACK_CONTENT[normalized] ?? null;
}

function normalizeBillingCycle(value?: string | null): BillingCycle {
  const normalized = (value || "").trim().toLowerCase();

  if (normalized === "yearly") {
    return "yearly";
  }

  return "monthly";
}

function getBillingCycleLabel(cycle: BillingCycle): string {
  return cycle === "yearly" ? "annuel" : "mensuel";
}

function buildCalendlyUrl(utmMedium: string, utmContent: string): string {
  const url = new URL(CALENDLY_FREE_CONVERSATION_URL);

  url.searchParams.set("utm_source", "leanworker_elearning");
  url.searchParams.set("utm_medium", utmMedium);
  url.searchParams.set("utm_campaign", "times_up_subscription_cancel");
  url.searchParams.set("utm_content", utmContent);

  return url.toString();
}

function buildRetryHref(pack: PackContent | null, billingCycle: BillingCycle): string {
  const params = new URLSearchParams();

  if (pack) {
    params.set("pack", pack.key);
  }

  params.set("billing_cycle", billingCycle);
  params.set("cancelled", "true");

  return `/elearning/subscribe?${params.toString()}`;
}

function ElearningSubscribeCancelContent() {
  const searchParams = useSearchParams();

  const cancelledPack = useMemo(
    () => normalizePack(searchParams.get("pack")),
    [searchParams],
  );

  const billingCycle = useMemo(
    () => normalizeBillingCycle(searchParams.get("billing_cycle")),
    [searchParams],
  );

  const sessionId = searchParams.get("session_id");

  const [user, setUser] = useState<Me | null>(null);
  const [courses, setCourses] = useState<LearningCourseSummary[]>([]);
  const [mainCourseDetail, setMainCourseDetail] =
    useState<LearningCourseDetail | null>(null);
  const [summary, setSummary] = useState<LearningProgressSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          : "Impossible de charger le contexte de souscription.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadContext();
  }, []);

  const mainCourse = courses[0] ?? null;
  const retryHref = buildRetryHref(cancelledPack, billingCycle);

  return (
    <ElearningShell
      title="Souscription interrompue"
      subtitle="Aucun paiement n’a été finalisé."
      user={user}
      courseId={mainCourse?.id ?? null}
      chapters={mainCourseDetail?.chapters ?? []}
      progressPercent={summary?.overall_progress_percent ?? 0}
    >
      <div className="stack" style={{ gap: 18 }}>
        {loading ? (
          <div className="card-soft">Chargement de votre espace...</div>
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
                minHeight: 420,
                justifyContent: "center",
                border: "1px solid rgba(251,191,36,0.34)",
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.16), rgba(255,255,255,0.96))",
              }}
            >
              <div className="stack" style={{ gap: 10, maxWidth: 820 }}>
                <span className="badge" style={{ alignSelf: "flex-start" }}>
                  Paiement interrompu
                </span>

                <h1
                  className="title"
                  style={{
                    margin: 0,
                    fontSize: 42,
                    lineHeight: 1.05,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Vous avez quitté la souscription avant confirmation.
                </h1>

                <p className="subtitle" style={{ margin: 0, lineHeight: 1.7 }}>
                  Aucun montant n’a été débité. Vous pouvez reprendre la souscription,
                  revenir à la formation, ou réserver une conversation gratuite pour choisir
                  le niveau d’accompagnement le plus adapté.
                </p>
              </div>

              {cancelledPack ? (
                <div
                  className="card-soft"
                  style={{
                    border: "1px solid rgba(251,191,36,0.30)",
                    background: "rgba(255,255,255,0.70)",
                  }}
                >
                  <strong>Pack sélectionné</strong>
                  <div className="muted" style={{ marginTop: 6, lineHeight: 1.7 }}>
                    Vous étiez sur le pack <strong>{cancelledPack.label}</strong>{" "}
                    — {cancelledPack.subtitle} — en facturation{" "}
                    <strong>{getBillingCycleLabel(billingCycle)}</strong>.
                  </div>
                </div>
              ) : (
                <div
                  className="card-soft"
                  style={{
                    border: "1px solid rgba(251,191,36,0.30)",
                    background: "rgba(255,255,255,0.70)",
                  }}
                >
                  <strong>Souscription non finalisée</strong>
                  <div className="muted" style={{ marginTop: 6, lineHeight: 1.7 }}>
                    Le pack concerné n’a pas été identifié dans l’URL. Vous pouvez revenir à
                    la page de souscription pour choisir à nouveau votre accompagnement.
                  </div>
                </div>
              )}

              {sessionId ? (
                <div className="muted" style={{ fontSize: 13 }}>
                  Référence Stripe annulée : {sessionId}
                </div>
              ) : null}

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <Link className="button" href={retryHref}>
                  {cancelledPack ? cancelledPack.retryLabel : "Reprendre la souscription"}
                </Link>

                <a
                  className="button ghost"
                  href={buildCalendlyUrl(
                    "cancel_page_free_conversation",
                    cancelledPack?.key ?? "unknown_pack",
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Réserver une conversation gratuite
                </a>

                {mainCourse ? (
                  <Link className="button ghost" href={`/elearning/courses/${mainCourse.id}`}>
                    Retour à la formation
                  </Link>
                ) : (
                  <Link className="button ghost" href="/elearning">
                    Retour à l’accueil formation
                  </Link>
                )}
              </div>
            </section>

            <section className="card stack" style={{ gap: 12 }}>
              <div className="section-title">Votre progression Time’s UP!</div>

              <div className="grid grid-3">
                <div className="card-soft stack" style={{ gap: 8 }}>
                  <strong>Progression globale</strong>
                  <div className="admin-metric-value">
                    {formatPercent(summary?.overall_progress_percent)}
                  </div>
                  <div className="muted">
                    {summary?.completed_lessons ?? 0} leçon(s) terminée(s) sur{" "}
                    {summary?.total_lessons ?? 0}
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 8 }}>
                  <strong>Formation</strong>
                  <div className="muted" style={{ lineHeight: 1.6 }}>
                    Vous pouvez continuer Time’s UP! normalement. L’annulation du paiement
                    ne bloque pas l’accès à votre espace de formation.
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 8 }}>
                  <strong>Accompagnement</strong>
                  <div className="muted" style={{ lineHeight: 1.6 }}>
                    La souscription peut être reprise plus tard depuis la page des packs,
                    sans perdre votre progression.
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
              <span className="badge" style={{ alignSelf: "flex-start" }}>
                Besoin de clarifier ?
              </span>

              <div className="section-title">
                Choisissez le pack avec un échange humain.
              </div>

              <div className="muted" style={{ lineHeight: 1.7 }}>
                Si vous avez interrompu le paiement parce que vous hésitez entre Standard,
                Classique, Flix ou Exécutif, commencez par une conversation gratuite. L’objectif
                est de comprendre votre situation et de sélectionner le bon niveau
                d’accompagnement.
              </div>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <a
                  className="button"
                  href={buildCalendlyUrl(
                    "cancel_page_bottom_cta",
                    cancelledPack?.key ?? "unknown_pack",
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Réserver gratuitement
                </a>

                <Link className="button ghost" href="/elearning/subscribe">
                  Voir tous les packs
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </ElearningShell>
  );
}