// app/elearning/subscribe/page.tsx
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
import {
  CheckCircleIcon,
  ClockIcon,
  LayerIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

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
    <main
      className="page"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(239,68,68,0.16), transparent 34%), linear-gradient(135deg, #050505, #11100f 48%, #1b120b)",
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
            Chargement de la page de souscription...
          </div>
          <div style={{ color: "rgba(248,250,252,0.62)" }}>
            Préparation des packs d’accompagnement LeanWorker.
          </div>
        </div>
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

function getCheckoutBillingCycle(
  pack: SubscriptionPack,
  billingCycle: PaidBillingCycle,
): SubscriptionBillingCycle {
  if (pack.key === "standard") {
    return "free";
  }

  return billingCycle;
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

function MasterclassButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      className={variant === "primary" ? "button" : "button ghost"}
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: variant === "primary" ? "#ffffff" : undefined,
        color: variant === "primary" ? "#111827" : "rgba(248,250,252,0.82)",
        borderColor:
          variant === "primary" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.16)",
        borderRadius: 16,
        minHeight: 44,
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
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
      <div
        className="stack"
        style={{
          gap: 18,
          color: "#f8fafc",
        }}
      >
        {cancelled ? (
          <MasterclassPanel warm>
            <div className="row space-between" style={{ gap: 14, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 8, maxWidth: 780 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <MasterclassBadge tone="gold">
                    <ClockIcon size={14} color="#fbbf24" />
                    Souscription interrompue
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
                  Vous avez quitté le paiement avant confirmation.
                </div>

                <div style={{ color: "rgba(248,250,252,0.64)", lineHeight: 1.75 }}>
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
                  <MasterclassButton
                    onClick={() => void handlePackSelection(cancelledPack)}
                    disabled={checkoutLoadingPack === cancelledPack.key}
                  >
                    {checkoutLoadingPack === cancelledPack.key
                      ? cancelledPack.key === "standard"
                        ? "Activation..."
                        : "Redirection Stripe..."
                      : `Réessayer ${cancelledPack.name}`}
                  </MasterclassButton>
                ) : null}

                <a
                  className="button ghost"
                  href={buildCalendlyUrl(
                    "cancelled_checkout_cta",
                    cancelledPack?.key ?? "unknown_pack",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "rgba(248,250,252,0.82)",
                    borderColor: "rgba(255,255,255,0.16)",
                    borderRadius: 16,
                    minHeight: 44,
                  }}
                >
                  Réserver une conversation gratuite
                </a>
              </div>
            </div>
          </MasterclassPanel>
        ) : null}

        <section
          className="stack"
          style={{
            position: "relative",
            overflow: "hidden",
            gap: 24,
            padding: 32,
            borderRadius: 38,
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
              width: 370,
              height: 370,
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
            <div className="stack" style={{ gap: 15, maxWidth: 850 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <MasterclassBadge tone="gold">
                  <SparkIcon size={14} color="#fbbf24" />
                  Suite du programme Time’s UP!
                </MasterclassBadge>

                <MasterclassBadge>
                  <LayerIcon size={14} color="rgba(248,250,252,0.70)" />
                  Accompagnement LeanWorker
                </MasterclassBadge>
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#ffffff",
                  fontSize: 52,
                  lineHeight: 0.98,
                  fontWeight: 950,
                  letterSpacing: "-0.08em",
                  maxWidth: 920,
                }}
              >
                Vous avez compris la méthode. Maintenant, appliquez-la à votre trajectoire.
              </h1>

              <p
                style={{
                  color: "rgba(248,250,252,0.64)",
                  fontSize: 16,
                  lineHeight: 1.8,
                  margin: 0,
                  maxWidth: 800,
                }}
              >
                Time’s UP! vous donne les concepts, les canvases, les puissances, les
                leviers et les preuves. L’accompagnement LeanWorker vous aide maintenant à
                transformer cette méthode en décisions, actions, routines et progression
                mesurable.
              </p>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <MasterclassBadge>Conversations humaines</MasterclassBadge>
                <MasterclassBadge>Plateforme LeanWorker</MasterclassBadge>
                <MasterclassBadge>Career Blueprint</MasterclassBadge>
                <MasterclassBadge>Adaptive Coach</MasterclassBadge>
                <MasterclassBadge>Recommendations</MasterclassBadge>
                <MasterclassBadge>Leviers</MasterclassBadge>
              </div>
            </div>

            <div
              className="stack"
              style={{
                gap: 12,
                minWidth: 270,
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
                Votre progression formation
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
                {formatPercent(summary?.overall_progress_percent)}
              </div>

              <div style={{ color: "rgba(248,250,252,0.60)", lineHeight: 1.55 }}>
                {summary?.completed_lessons ?? 0} leçon(s) terminée(s) sur{" "}
                {summary?.total_lessons ?? 0}
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
                    width: formatPercent(summary?.overall_progress_percent),
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #facc15, #f97316, #ef4444)",
                  }}
                />
              </div>

              {mainCourse ? (
                <Link
                  className="button ghost"
                  href={`/elearning/courses/${mainCourse.id}`}
                  style={{
                    color: "rgba(248,250,252,0.82)",
                    borderColor: "rgba(255,255,255,0.16)",
                    borderRadius: 16,
                    justifyContent: "center",
                  }}
                >
                  Revoir le programme
                </Link>
              ) : (
                <Link
                  className="button ghost"
                  href="/elearning"
                  style={{
                    color: "rgba(248,250,252,0.82)",
                    borderColor: "rgba(255,255,255,0.16)",
                    borderRadius: 16,
                    justifyContent: "center",
                  }}
                >
                  Retour à la formation
                </Link>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <MasterclassPanel>
            <div style={{ color: "#ffffff", fontWeight: 900 }}>
              Chargement des offres d’accompagnement...
            </div>
            <div style={{ color: "rgba(248,250,252,0.62)" }}>
              Préparation des packs disponibles.
            </div>
          </MasterclassPanel>
        ) : error ? (
          <MasterclassPanel>
            <div style={{ color: "#fca5a5", fontWeight: 900 }}>Action impossible</div>
            <div style={{ color: "rgba(248,250,252,0.68)" }}>{error}</div>
          </MasterclassPanel>
        ) : (
          <>
            <MasterclassPanel>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 5 }}>
                  <div
                    style={{
                      color: "#ffffff",
                      fontSize: 27,
                      lineHeight: 1.1,
                      fontWeight: 950,
                      letterSpacing: "-0.065em",
                    }}
                  >
                    Choisissez votre niveau d’accompagnement
                  </div>

                  <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.7 }}>
                    Chaque pack combine une approche humaine par conversations et une
                    approche technologique via la plateforme LeanWorker.
                  </div>
                </div>

                <a
                  className="button ghost"
                  href={buildCalendlyUrl("free_conversation_cta", "top_cta")}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "rgba(248,250,252,0.82)",
                    borderColor: "rgba(255,255,255,0.16)",
                    borderRadius: 16,
                    minHeight: 44,
                  }}
                >
                  Réserver une conversation gratuite
                </a>
              </div>

              <div
                className="row space-between"
                style={{
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                  padding: 16,
                  borderRadius: 24,
                  border: "1px solid rgba(251,191,36,0.18)",
                  background: "rgba(251,191,36,0.075)",
                }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <strong style={{ color: "#ffffff" }}>
                    Mode de facturation pour les packs payants
                  </strong>
                  <div style={{ color: "rgba(248,250,252,0.60)", lineHeight: 1.55 }}>
                    Le pack Standard reste gratuit. Classique et Flix peuvent être souscrits au mois
                    ou à l’année.
                  </div>
                </div>

                <div
                  className="row"
                  style={{
                    gap: 6,
                    padding: 5,
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.28)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <button
                    type="button"
                    className={billingCycle === "monthly" ? "button" : "button ghost"}
                    onClick={() => setBillingCycle("monthly")}
                    style={{
                      padding: "8px 14px",
                      minHeight: 36,
                      borderRadius: 999,
                      background: billingCycle === "monthly" ? "#ffffff" : undefined,
                      color:
                        billingCycle === "monthly" ? "#111827" : "rgba(248,250,252,0.72)",
                      borderColor:
                        billingCycle === "monthly"
                          ? "rgba(255,255,255,0.18)"
                          : "transparent",
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
                      borderRadius: 999,
                      background: billingCycle === "yearly" ? "#ffffff" : undefined,
                      color:
                        billingCycle === "yearly" ? "#111827" : "rgba(248,250,252,0.72)",
                      borderColor:
                        billingCycle === "yearly"
                          ? "rgba(255,255,255,0.18)"
                          : "transparent",
                    }}
                  >
                    Annuel
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(250px, 1fr))",
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

                  const isLoadingPack = checkoutLoadingPack === pack.key;

                  return (
                    <article
                      key={pack.key}
                      className="stack"
                      style={{
                        gap: 15,
                        minHeight: 600,
                        padding: 18,
                        borderRadius: 30,
                        border: pack.highlighted
                          ? "1px solid rgba(251,191,36,0.34)"
                          : "1px solid rgba(255,255,255,0.10)",
                        background: pack.highlighted
                          ? "radial-gradient(circle at top, rgba(251,191,36,0.15), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.095), rgba(255,255,255,0.045))"
                          : "linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.035))",
                        boxShadow: pack.highlighted
                          ? "0 24px 70px rgba(251,191,36,0.09), inset 0 1px 0 rgba(255,255,255,0.08)"
                          : "inset 0 1px 0 rgba(255,255,255,0.06)",
                        position: "relative",
                      }}
                    >
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        {pack.highlighted ? (
                          <MasterclassBadge tone="gold">
                            <SparkIcon size={14} color="#fbbf24" />
                            Recommandé
                          </MasterclassBadge>
                        ) : null}

                        {pack.isFree ? (
                          <MasterclassBadge tone="green">Gratuit</MasterclassBadge>
                        ) : null}

                        {pack.isContactSales ? (
                          <MasterclassBadge>Sur qualification</MasterclassBadge>
                        ) : null}
                      </div>

                      <div className="stack" style={{ gap: 6 }}>
                        <h2
                          style={{
                            color: "#ffffff",
                            fontSize: 29,
                            lineHeight: 1,
                            fontWeight: 950,
                            letterSpacing: "-0.065em",
                            margin: 0,
                          }}
                        >
                          {pack.name}
                        </h2>

                        <div
                          style={{
                            color: pack.highlighted ? "#fbbf24" : "rgba(248,250,252,0.72)",
                            fontWeight: 800,
                          }}
                        >
                          {pack.subtitle}
                        </div>

                        <div
                          style={{
                            color: "#ffffff",
                            fontSize: 24,
                            lineHeight: 1.05,
                            fontWeight: 950,
                            letterSpacing: "-0.055em",
                            marginTop: 6,
                          }}
                        >
                          {selectedPriceLabel}
                        </div>

                        {isPaidPack ? (
                          <div style={{ color: "rgba(248,250,252,0.52)", fontSize: 13 }}>
                            {billingCycle === "yearly"
                              ? savingsLabel
                              : pack.annualPriceLabel
                                ? `Option annuelle : ${pack.annualPriceLabel}`
                                : null}
                          </div>
                        ) : null}
                      </div>

                      <p
                        style={{
                          color: "rgba(248,250,252,0.62)",
                          lineHeight: 1.7,
                          margin: 0,
                        }}
                      >
                        {pack.description}
                      </p>

                      <div
                        className="stack"
                        style={{
                          gap: 6,
                          padding: 14,
                          borderRadius: 22,
                          background: "rgba(0,0,0,0.22)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <strong style={{ color: "#ffffff" }}>Pour qui ?</strong>
                        <div style={{ color: "rgba(248,250,252,0.60)", lineHeight: 1.6 }}>
                          {pack.bestFor}
                        </div>
                      </div>

                      <div className="stack" style={{ gap: 9 }}>
                        {pack.features.map((feature) => (
                          <div
                            key={feature}
                            className="row"
                            style={{
                              gap: 9,
                              alignItems: "flex-start",
                            }}
                          >
                            <span
                              style={{
                                width: 9,
                                height: 9,
                                marginTop: 7,
                                borderRadius: 999,
                                background: pack.highlighted ? "#fbbf24" : "#34d399",
                                flexShrink: 0,
                              }}
                            />

                            <div style={{ color: "rgba(248,250,252,0.62)", lineHeight: 1.45 }}>
                              {feature}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        className={pack.highlighted ? "button" : "button ghost"}
                        type="button"
                        onClick={() => void handlePackSelection(pack)}
                        disabled={isLoadingPack}
                        style={{
                          marginTop: "auto",
                          width: "100%",
                          minHeight: 46,
                          borderRadius: 16,
                          justifyContent: "center",
                          background: pack.highlighted ? "#ffffff" : undefined,
                          color: pack.highlighted ? "#111827" : "rgba(248,250,252,0.82)",
                          borderColor: pack.highlighted
                            ? "rgba(255,255,255,0.18)"
                            : "rgba(255,255,255,0.16)",
                        }}
                      >
                        {isLoadingPack
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
            </MasterclassPanel>

            <MasterclassPanel warm>
              <div className="row space-between" style={{ gap: 16, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 8, maxWidth: 790 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <MasterclassBadge tone="gold">
                      <TargetIcon size={14} color="#fbbf24" />
                      Vous hésitez encore ?
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
                    Réservez une conversation gratuite
                  </div>

                  <div style={{ color: "rgba(248,250,252,0.64)", lineHeight: 1.75 }}>
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
                  style={{
                    background: "#ffffff",
                    color: "#111827",
                    borderRadius: 16,
                    minHeight: 44,
                    justifyContent: "center",
                  }}
                >
                  Réserver gratuitement
                </a>
              </div>
            </MasterclassPanel>

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
                Ce que l’accompagnement ajoute à la formation
              </div>

              <div className="grid grid-3">
                {[
                  {
                    title: "Humain",
                    body:
                      "Des conversations pour clarifier, challenger, reformuler et transformer vos intentions en décisions concrètes.",
                    icon: <SparkIcon size={16} color="#fbbf24" />,
                  },
                  {
                    title: "Technologique",
                    body:
                      "Une plateforme qui structure votre Career Blueprint, vos recommandations, vos leviers et votre suivi de progression.",
                    icon: <LayerIcon size={16} color="#fbbf24" />,
                  },
                  {
                    title: "Opérationnel",
                    body:
                      "Une logique de passage à l’action pour que la méthode Lean Worker devienne visible dans votre manière de travailler.",
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
          </>
        )}
      </div>
    </ElearningShell>
  );
}