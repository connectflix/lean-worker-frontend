"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ElearningGuard } from "@/components/elearning-guard";
import { ElearningShell } from "@/components/elearning-shell";
import {
  createSubscriptionCheckoutSession,
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
  SubscriptionBillingCycle,
} from "@/lib/types";

type PaidBillingCycle = "monthly" | "yearly";

type SubscriptionPack = {
  key: "standard" | "classique" | "flix" | "executif";
  name: string;
  subtitle: string;
  monthlyPriceEur: number;
  annualPriceEur?: number | null;
  priceLabel: string;
  annualPriceLabel?: string;
  description: string;
  bestFor: string;
  features: string[];
  highlighted?: boolean;
  isFree?: boolean;
  isContactSales?: boolean;
  ctaLabel: string;
};

const CALENDLY_FREE_CONVERSATION_URL =
  "https://calendly.com/flixtalent-connect/ad-hoc-conversation";

const PACKS: SubscriptionPack[] = [
  {
    key: "standard",
    name: "Standard",
    subtitle: "Commencer avec méthode",
    monthlyPriceEur: 0,
    annualPriceEur: 0,
    priceLabel: "Gratuit",
    description:
      "Pour commencer à utiliser LeanWorker après la formation Time’s UP!, sans engagement payant.",
    bestFor: "Idéal si vous voulez démarrer simplement après Time’s UP!.",
    features: [
      "Accès gratuit au socle LeanWorker",
      "Suivi de progression",
      "Premières recommandations personnalisées",
      "Activation de leviers simples",
      "Base de travail pour passer à l’action",
    ],
    isFree: true,
    ctaLabel: "Activer gratuitement",
  },
  {
    key: "classique",
    name: "Classique",
    subtitle: "Structurer sa trajectoire",
    monthlyPriceEur: 89.9,
    annualPriceEur: 899,
    priceLabel: "89,90 €/mois",
    annualPriceLabel: "899 €/an",
    description:
      "Pour construire une trajectoire plus claire avec une combinaison de méthode, plateforme et conversations.",
    bestFor: "Idéal si vous voulez clarifier votre direction professionnelle.",
    features: [
      "Tout le pack Standard",
      "Conversations d’accompagnement",
      "Career Blueprint",
      "Adaptive Coach",
      "Recommendations priorisées",
      "Leviers adaptés à votre situation",
    ],
    highlighted: true,
    ctaLabel: "Souscrire à Classique",
  },
  {
    key: "flix",
    name: "Flix",
    subtitle: "Accélérer sa transformation",
    monthlyPriceEur: 290.9,
    annualPriceEur: 2909,
    priceLabel: "290,90 €/mois",
    annualPriceLabel: "2 909 €/an",
    description:
      "Pour accélérer votre passage à l’action avec une expérience plus personnalisée et plus intensive.",
    bestFor: "Idéal si vous voulez accélérer votre évolution professionnelle.",
    features: [
      "Tout le pack Classique",
      "Accompagnement plus personnalisé",
      "Analyse approfondie de votre trajectoire",
      "Plans d’action plus détaillés",
      "Leviers humains, technologiques et méthodologiques",
      "Suivi plus rapproché",
    ],
    ctaLabel: "Souscrire à Flix",
  },
  {
    key: "executif",
    name: "Exécutif",
    subtitle: "Accompagnement premium",
    monthlyPriceEur: 0,
    annualPriceEur: null,
    priceLabel: "Sur mesure",
    description:
      "Pour les profils qui souhaitent un accompagnement stratégique, profond et orienté impact.",
    bestFor: "Idéal si vous visez un repositionnement fort ou un niveau supérieur.",
    features: [
      "Tout le pack Flix",
      "Accompagnement exécutif sur mesure",
      "Travail approfondi sur identité, vision et impact",
      "Préparation aux décisions clés",
      "Suivi stratégique",
      "Approche humaine + technologique complète",
    ],
    isContactSales: true,
    ctaLabel: "Réserver pour Exécutif",
  },
];

export default function ElearningSubscribePage() {
  return (
    <ElearningGuard>
      <Suspense fallback={<SubscribeFallback />}>
        <ElearningSubscribeContent />
      </Suspense>
    </ElearningGuard>
  );
}

function SubscribeFallback() {
  return (
    <main className="page">
      <div className="container">
        <div className="card-soft">Chargement de la page de souscription...</div>
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

function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildCalendlyUrl(utmMedium: string, utmContent: string): string {
  const url = new URL(CALENDLY_FREE_CONVERSATION_URL);

  url.searchParams.set("utm_source", "leanworker_elearning");
  url.searchParams.set("utm_medium", utmMedium);
  url.searchParams.set("utm_campaign", "times_up_program");
  url.searchParams.set("utm_content", utmContent);

  return url.toString();
}

function normalizePackKey(value?: string | null): SubscriptionPack["key"] | null {
  const normalized = (value || "").trim().toLowerCase();

  if (
    normalized === "standard" ||
    normalized === "classique" ||
    normalized === "flix" ||
    normalized === "executif"
  ) {
    return normalized;
  }

  if (normalized === "executive") {
    return "executif";
  }

  return null;
}

function normalizeBillingCycle(value?: string | null): PaidBillingCycle {
  const normalized = (value || "").trim().toLowerCase();

  if (normalized === "yearly") {
    return "yearly";
  }

  return "monthly";
}

function findPackByKey(value?: string | null): SubscriptionPack | null {
  const packKey = normalizePackKey(value);

  if (!packKey) return null;

  return PACKS.find((pack) => pack.key === packKey) ?? null;
}

function getPackPriceLabel(pack: SubscriptionPack, billingCycle: PaidBillingCycle): string {
  if (pack.isFree) return "Gratuit";
  if (pack.isContactSales) return "Sur mesure";

  if (billingCycle === "yearly") {
    return `${formatPrice(Number(pack.annualPriceEur ?? 0))}/an`;
  }

  return `${formatPrice(pack.monthlyPriceEur)}/mois`;
}

function getBillingCycleLabel(billingCycle: PaidBillingCycle): string {
  return billingCycle === "yearly" ? "Annuel" : "Mensuel";
}

function getCheckoutBillingCycle(pack: SubscriptionPack, billingCycle: PaidBillingCycle): SubscriptionBillingCycle {
  if (pack.key === "standard") {
    return "free";
  }

  return billingCycle;
}

function ElearningSubscribeContent() {
  const searchParams = useSearchParams();

  const cancelled = searchParams.get("cancelled") === "true";
  const cancelledPack = findPackByKey(searchParams.get("pack"));
  const cancelledBillingCycle = normalizeBillingCycle(searchParams.get("billing_cycle"));

  const [user, setUser] = useState<Me | null>(null);
  const [courses, setCourses] = useState<LearningCourseSummary[]>([]);
  const [mainCourseDetail, setMainCourseDetail] =
    useState<LearningCourseDetail | null>(null);
  const [summary, setSummary] = useState<LearningProgressSummary | null>(null);

  const [billingCycle, setBillingCycle] = useState<PaidBillingCycle>(cancelledBillingCycle);
  const [loading, setLoading] = useState(true);
  const [checkoutLoadingPack, setCheckoutLoadingPack] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSubscribeContext() {
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
          : "Impossible de charger la page de souscription.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSubscribeContext();
  }, []);

  const mainCourse = useMemo(() => courses[0] ?? null, [courses]);

  async function handlePackSelection(pack: SubscriptionPack) {
    if (pack.key === "executif") {
      window.open(
        buildCalendlyUrl("executive_pack_cta", pack.key),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    const selectedBillingCycle = getCheckoutBillingCycle(pack, billingCycle);

    setCheckoutLoadingPack(pack.key);
    setError(null);

    try {
      const checkout = await createSubscriptionCheckoutSession({
        pack: pack.key,
        billing_cycle: selectedBillingCycle,
        source: "elearning",
      });

      window.location.href = checkout.checkout_url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de démarrer la souscription.",
      );
    } finally {
      setCheckoutLoadingPack(null);
    }
  }

  return (
    <ElearningShell
      title="Passer à l’accompagnement"
      subtitle="Transformez la méthode Time’s UP! en trajectoire personnelle concrète."
      user={user}
      courseId={mainCourse?.id ?? null}
      chapters={mainCourseDetail?.chapters ?? []}
      progressPercent={summary?.overall_progress_percent ?? 0}
    >
      <div className="stack" style={{ gap: 18 }}>
        {cancelled ? (
          <section
            className="card stack"
            style={{
              gap: 14,
              border: "1px solid rgba(251,191,36,0.32)",
              background:
                "linear-gradient(135deg, rgba(251,191,36,0.14), rgba(255,255,255,0.96))",
            }}
          >
            <div className="row space-between" style={{ gap: 14, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 6, maxWidth: 760 }}>
                <span className="badge">Souscription interrompue</span>

                <div className="section-title">
                  Vous avez quitté le paiement avant confirmation.
                </div>

                <div className="muted" style={{ lineHeight: 1.7 }}>
                  Aucun montant n’a été débité. Vous pouvez réessayer
                  {cancelledPack
                    ? ` le pack ${cancelledPack.name} en mode ${getBillingCycleLabel(
                        cancelledBillingCycle,
                      ).toLowerCase()}`
                    : " la souscription"}{" "}
                  ou réserver une conversation gratuite si vous souhaitez valider le bon niveau
                  d’accompagnement avant de continuer.
                </div>
              </div>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                {cancelledPack && cancelledPack.key !== "executif" ? (
                  <button
                    className="button"
                    type="button"
                    onClick={() => void handlePackSelection(cancelledPack)}
                    disabled={checkoutLoadingPack === cancelledPack.key}
                  >
                    {checkoutLoadingPack === cancelledPack.key
                      ? cancelledPack.key === "standard"
                        ? "Activation..."
                        : "Redirection Stripe..."
                      : `Réessayer ${cancelledPack.name}`}
                  </button>
                ) : null}

                <a
                  className="button ghost"
                  href={buildCalendlyUrl(
                    "cancelled_checkout_cta",
                    cancelledPack?.key ?? "unknown_pack",
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Réserver une conversation gratuite
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section
          className="card stack"
          style={{
            gap: 18,
            background:
              "radial-gradient(circle at top left, rgba(16,185,129,0.12), transparent 32%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
          }}
        >
          <div className="row space-between" style={{ gap: 18, flexWrap: "wrap" }}>
            <div className="stack" style={{ gap: 12, maxWidth: 780 }}>
              <span className="badge">Suite du programme Time’s UP!</span>

              <h1
                className="title"
                style={{
                  margin: 0,
                  fontSize: 42,
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                }}
              >
                Vous avez compris la méthode. Maintenant, appliquez-la à votre
                trajectoire.
              </h1>

              <p className="muted" style={{ fontSize: 16, lineHeight: 1.75, maxWidth: 760 }}>
                Time’s UP! vous donne les concepts, les canvases, les puissances, les
                leviers et les preuves. L’accompagnement LeanWorker vous aide maintenant à
                transformer cette méthode en décisions, actions, routines et progression
                mesurable.
              </p>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <span className="badge">Conversations humaines</span>
                <span className="badge">Plateforme LeanWorker</span>
                <span className="badge">Career Blueprint</span>
                <span className="badge">Adaptive Coach</span>
                <span className="badge">Recommendations</span>
                <span className="badge">Leviers</span>
              </div>
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 10,
                minWidth: 270,
                border: "1px solid rgba(16,185,129,0.22)",
              }}
            >
              <div className="muted">Votre progression formation</div>

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

              {mainCourse ? (
                <Link className="button ghost" href={`/elearning/courses/${mainCourse.id}`}>
                  Revoir le programme
                </Link>
              ) : (
                <Link className="button ghost" href="/elearning">
                  Retour à la formation
                </Link>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="card-soft">Chargement des offres d’accompagnement...</div>
        ) : error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : (
          <>
            <section className="card stack" style={{ gap: 16 }}>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Choisissez votre niveau d’accompagnement</div>
                  <div className="muted">
                    Chaque pack combine une approche humaine par conversations et une
                    approche technologique via la plateforme LeanWorker.
                  </div>
                </div>

                <a
                  className="button ghost"
                  href={buildCalendlyUrl("free_conversation_cta", "top_cta")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Réserver une conversation gratuite
                </a>
              </div>

              <div
                className="card-soft row space-between"
                style={{
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                  border: "1px solid rgba(37,99,235,0.14)",
                  background: "rgba(37,99,235,0.05)",
                }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <strong>Mode de facturation pour les packs payants</strong>
                  <div className="muted">
                    Le pack Standard reste gratuit. Classique et Flix peuvent être souscrits au mois
                    ou à l’année.
                  </div>
                </div>

                <div
                  className="row"
                  style={{
                    gap: 6,
                    padding: 4,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.82)",
                    border: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  <button
                    type="button"
                    className={billingCycle === "monthly" ? "button" : "button ghost"}
                    onClick={() => setBillingCycle("monthly")}
                    style={{
                      padding: "8px 14px",
                      minHeight: 36,
                    }}
                  >
                    Mensuel
                  </button>

                  <button
                    type="button"
                    className={billingCycle === "yearly" ? "button" : "button ghost"}
                    onClick={() => setBillingCycle("yearly")}
                    style={{
                      padding: "8px 14px",
                      minHeight: 36,
                    }}
                  >
                    Annuel
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(240px, 1fr))",
                  gap: 14,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {PACKS.map((pack) => {
                  const selectedPriceLabel = getPackPriceLabel(pack, billingCycle);
                  const isPaidPack = !pack.isFree && !pack.isContactSales;
                  const savingsLabel =
                    isPaidPack && billingCycle === "yearly" && pack.annualPriceEur
                      ? `Équivalent ${formatPrice(pack.annualPriceEur / 12)}/mois`
                      : null;

                  return (
                    <article
                      key={pack.key}
                      className="card-soft stack"
                      style={{
                        gap: 14,
                        minHeight: 560,
                        border: pack.highlighted
                          ? "1px solid rgba(37,99,235,0.30)"
                          : "1px solid rgba(15,23,42,0.08)",
                        background: pack.highlighted
                          ? "linear-gradient(180deg, rgba(37,99,235,0.08), rgba(255,255,255,0.96))"
                          : undefined,
                        position: "relative",
                      }}
                    >
                      {pack.highlighted ? (
                        <span
                          className="badge"
                          style={{
                            alignSelf: "flex-start",
                            background: "rgba(37,99,235,0.12)",
                            color: "#2563eb",
                          }}
                        >
                          Recommandé
                        </span>
                      ) : null}

                      <div className="stack" style={{ gap: 4 }}>
                        <h2 className="section-title" style={{ fontSize: 24 }}>
                          {pack.name}
                        </h2>

                        <div className="subtitle" style={{ margin: 0, fontWeight: 700 }}>
                          {pack.subtitle}
                        </div>

                        <div
                          className="badge"
                          style={{
                            alignSelf: "flex-start",
                            fontSize: 13,
                          }}
                        >
                          {selectedPriceLabel}
                        </div>

                        {isPaidPack ? (
                          <div className="muted" style={{ fontSize: 13 }}>
                            {billingCycle === "yearly"
                              ? savingsLabel
                              : pack.annualPriceLabel
                                ? `Option annuelle : ${pack.annualPriceLabel}`
                                : null}
                          </div>
                        ) : null}
                      </div>

                      <p className="muted" style={{ lineHeight: 1.65 }}>
                        {pack.description}
                      </p>

                      <div
                        className="card"
                        style={{
                          padding: 12,
                          background: "rgba(255,255,255,0.72)",
                        }}
                      >
                        <strong>Pour qui ?</strong>
                        <div className="muted" style={{ marginTop: 4, lineHeight: 1.55 }}>
                          {pack.bestFor}
                        </div>
                      </div>

                      <div className="stack" style={{ gap: 8 }}>
                        {pack.features.map((feature) => (
                          <div
                            key={feature}
                            className="row"
                            style={{
                              gap: 8,
                              alignItems: "flex-start",
                            }}
                          >
                            <span
                              style={{
                                width: 9,
                                height: 9,
                                marginTop: 7,
                                borderRadius: 999,
                                background: pack.highlighted ? "#2563eb" : "#10b981",
                                flexShrink: 0,
                              }}
                            />

                            <div className="muted" style={{ lineHeight: 1.45 }}>
                              {feature}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        className={pack.highlighted ? "button" : "button ghost"}
                        type="button"
                        onClick={() => void handlePackSelection(pack)}
                        disabled={checkoutLoadingPack === pack.key}
                        style={{
                          marginTop: "auto",
                          width: "100%",
                        }}
                      >
                        {checkoutLoadingPack === pack.key
                          ? pack.key === "standard"
                            ? "Activation..."
                            : "Redirection Stripe..."
                          : pack.isFree
                            ? "Activer gratuitement"
                            : pack.isContactSales
                              ? pack.ctaLabel
                              : `${pack.ctaLabel} · ${getBillingCycleLabel(billingCycle)}`}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section
              className="card stack"
              style={{
                gap: 14,
                border: "1px solid rgba(16,185,129,0.20)",
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.06))",
              }}
            >
              <div className="row space-between" style={{ gap: 16, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 6, maxWidth: 760 }}>
                  <span className="badge">Vous hésitez encore ?</span>

                  <div className="section-title">Réservez une conversation gratuite</div>

                  <div className="muted" style={{ lineHeight: 1.7 }}>
                    Si vous ne savez pas encore quel pack choisir, commencez par une
                    conversation gratuite. L’objectif est de comprendre votre situation, votre
                    trajectoire, votre niveau d’urgence et le type d’accompagnement le plus utile.
                  </div>
                </div>

                <a
                  className="button"
                  href={buildCalendlyUrl("free_conversation_cta", "bottom_cta")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Réserver gratuitement
                </a>
              </div>
            </section>

            <section className="card stack" style={{ gap: 12 }}>
              <div className="section-title">Ce que l’accompagnement ajoute à la formation</div>

              <div className="grid grid-3">
                <div className="card-soft stack" style={{ gap: 8 }}>
                  <strong>Humain</strong>
                  <div className="muted" style={{ lineHeight: 1.6 }}>
                    Des conversations pour clarifier, challenger, reformuler et transformer vos
                    intentions en décisions concrètes.
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 8 }}>
                  <strong>Technologique</strong>
                  <div className="muted" style={{ lineHeight: 1.6 }}>
                    Une plateforme qui structure votre Career Blueprint, vos recommandations,
                    vos leviers et votre suivi de progression.
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 8 }}>
                  <strong>Opérationnel</strong>
                  <div className="muted" style={{ lineHeight: 1.6 }}>
                    Une logique de passage à l’action pour que la méthode Lean Worker devienne
                    visible dans votre manière de travailler.
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </ElearningShell>
  );
}