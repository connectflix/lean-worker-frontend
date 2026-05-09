// app/account/subscription/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { useCurrentUser } from "@/components/user-context";
import {
  changeSubscriptionPack,
  getSubscriptionPlans,
} from "@/lib/api";
import { useUiLanguage } from "@/lib/use-ui-language";
import type {
  Me,
  SubscriptionBillingCycle,
  SubscriptionChangePackResponse,
  SubscriptionPackKey,
  SubscriptionPlanResponse,
} from "@/lib/types";

type ApiErrorLike = {
  message?: string;
  detail?: string;
};

type MeWithSubscription = Me & {
  subscription_pack?: SubscriptionPackKey | string | null;
};

type PackPresentation = {
  key: SubscriptionPackKey;
  name: string;
  subtitleFr: string;
  subtitleEn: string;
  tone: "neutral" | "primary" | "premium" | "executive";
};

const PACK_PRESENTATION: Record<SubscriptionPackKey, PackPresentation> = {
  standard: {
    key: "standard",
    name: "Standard",
    subtitleFr: "Gratuit pour commencer avec méthode.",
    subtitleEn: "Free plan to start with method.",
    tone: "neutral",
  },
  classique: {
    key: "classique",
    name: "Classique",
    subtitleFr: "Pour structurer votre trajectoire avec accompagnement.",
    subtitleEn: "For structuring your trajectory with support.",
    tone: "primary",
  },
  flix: {
    key: "flix",
    name: "Flix",
    subtitleFr: "Pour accélérer votre transformation professionnelle.",
    subtitleEn: "For accelerating your professional transformation.",
    tone: "premium",
  },
  executif: {
    key: "executif",
    name: "Exécutif",
    subtitleFr: "Accompagnement stratégique sur mesure.",
    subtitleEn: "Tailored strategic support.",
    tone: "executive",
  },
};

function isSubscriptionPackKey(value: unknown): value is SubscriptionPackKey {
  return (
    value === "standard" ||
    value === "classique" ||
    value === "flix" ||
    value === "executif"
  );
}

function getPackPresentation(pack: string | null | undefined): PackPresentation {
  if (isSubscriptionPackKey(pack)) {
    return PACK_PRESENTATION[pack];
  }

  return PACK_PRESENTATION.standard;
}

function formatPrice(
  plan: SubscriptionPlanResponse,
  cycle: SubscriptionBillingCycle,
  uiLanguage: "fr" | "en",
): string {
  if (plan.pack === "standard" || cycle === "free") {
    return uiLanguage === "fr" ? "Gratuit" : "Free";
  }

  if (cycle === "yearly") {
    const amount = Number(plan.annual_price_eur ?? 0);
    return `${amount.toLocaleString("fr-BE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} €/an`;
  }

  const amount = Number(plan.monthly_price_eur ?? 0);

  return `${amount.toLocaleString("fr-BE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €/mois`;
}

function getPlanCycleOptions(plan: SubscriptionPlanResponse): SubscriptionBillingCycle[] {
  const cycles = plan.billing_cycles || [];

  if (plan.pack === "standard") {
    return ["free"];
  }

  const normalized = cycles.filter((cycle): cycle is SubscriptionBillingCycle =>
    cycle === "monthly" || cycle === "yearly" || cycle === "free",
  );

  return normalized.length > 0 ? normalized : ["monthly"];
}

function getCycleLabel(cycle: SubscriptionBillingCycle, uiLanguage: "fr" | "en"): string {
  if (cycle === "free") return uiLanguage === "fr" ? "Gratuit" : "Free";
  if (cycle === "yearly") return uiLanguage === "fr" ? "Annuel" : "Yearly";
  return uiLanguage === "fr" ? "Mensuel" : "Monthly";
}

function getActionLabel(
  targetPack: SubscriptionPackKey | string,
  activePack: SubscriptionPackKey,
  uiLanguage: "fr" | "en",
): string {
  if (targetPack === activePack) {
    return uiLanguage === "fr" ? "Pack actuel" : "Current plan";
  }

  if (targetPack === "standard") {
    return uiLanguage === "fr" ? "Passer à Standard" : "Switch to Standard";
  }

  if (activePack === "standard") {
    return uiLanguage === "fr" ? "Souscrire" : "Subscribe";
  }

  return uiLanguage === "fr" ? "Changer de pack" : "Change plan";
}

function getPackFeatures(
  pack: SubscriptionPackKey,
  uiLanguage: "fr" | "en",
): string[] {
  if (uiLanguage === "fr") {
    if (pack === "standard") {
      return [
        "Accès de base à LeanWorker",
        "Suivi de progression",
        "Premières recommandations",
        "Utilisation progressive de la plateforme",
      ];
    }

    if (pack === "classique") {
      return [
        "Tout le pack Standard",
        "Conversations d’accompagnement",
        "Career Blueprint",
        "Adaptive Coach",
        "Recommandations priorisées",
      ];
    }

    if (pack === "flix") {
      return [
        "Tout le pack Classique",
        "Accompagnement plus personnalisé",
        "Analyse approfondie de trajectoire",
        "Plans d’action plus détaillés",
        "Suivi plus rapproché",
      ];
    }

    return [
      "Accompagnement exécutif sur mesure",
      "Travail stratégique sur identité, vision et impact",
      "Préparation aux décisions clés",
      "Qualification préalable requise",
    ];
  }

  if (pack === "standard") {
    return [
      "Basic LeanWorker access",
      "Progress tracking",
      "First recommendations",
      "Progressive platform usage",
    ];
  }

  if (pack === "classique") {
    return [
      "Everything in Standard",
      "Support conversations",
      "Career Blueprint",
      "Adaptive Coach",
      "Prioritized recommendations",
    ];
  }

  if (pack === "flix") {
    return [
      "Everything in Classique",
      "More personalized support",
      "Deeper trajectory analysis",
      "More detailed action plans",
      "Closer follow-up",
    ];
  }

  return [
    "Tailored executive support",
    "Strategic work on identity, vision, and impact",
    "Preparation for key decisions",
    "Qualification required",
  ];
}

export default function SubscriptionPage() {
  return (
    <AuthGuard>
      <SubscriptionContent />
    </AuthGuard>
  );
}

function SubscriptionContent() {
  const { user } = useCurrentUser();
  const { uiLanguage, loadingLanguage } = useUiLanguage("fr");

  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [selectedCycles, setSelectedCycles] = useState<
    Partial<Record<SubscriptionPackKey, SubscriptionBillingCycle>>
  >({});
  const [loading, setLoading] = useState(true);
  const [changingPack, setChangingPack] = useState<string | null>(null);
  const [message, setMessage] = useState<SubscriptionChangePackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typedUser = user as MeWithSubscription | null;

  const activePack = useMemo<SubscriptionPackKey>(() => {
    const candidate = typedUser?.subscription_pack;

    if (isSubscriptionPackKey(candidate)) {
      return candidate;
    }

    return "standard";
  }, [typedUser?.subscription_pack]);

  const activePresentation = getPackPresentation(activePack);

  async function loadPlans() {
    setLoading(true);
    setError(null);

    try {
      const data = await getSubscriptionPlans();
      setPlans(data);

      const initialCycles: Partial<Record<SubscriptionPackKey, SubscriptionBillingCycle>> = {};

      data.forEach((plan) => {
        if (!isSubscriptionPackKey(plan.pack)) return;

        const options = getPlanCycleOptions(plan);
        initialCycles[plan.pack] =
          plan.pack === "standard"
            ? "free"
            : options.includes("monthly")
              ? "monthly"
              : options[0] ?? "monthly";
      });

      setSelectedCycles(initialCycles);
    } catch (err: unknown) {
      const apiError = err as ApiErrorLike;
      setError(
        apiError.detail ||
          apiError.message ||
          (uiLanguage === "fr"
            ? "Impossible de charger les plans d’abonnement."
            : "Unable to load subscription plans."),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePack(plan: SubscriptionPlanResponse) {
    if (!isSubscriptionPackKey(plan.pack)) return;

    const targetPack = plan.pack;
    const billingCycle =
      selectedCycles[targetPack] ??
      (targetPack === "standard" ? "free" : "monthly");

    setChangingPack(targetPack);
    setMessage(null);
    setError(null);

    try {
      const result = await changeSubscriptionPack({
        target_pack: targetPack,
        billing_cycle: billingCycle,
        source: "worker_app",
      });

      if (result.action === "checkout_required" && result.checkout_url) {
        window.location.href = result.checkout_url;
        return;
      }

      setMessage(result);
      await loadPlans();
    } catch (err: unknown) {
      const apiError = err as ApiErrorLike;
      setError(
        apiError.detail ||
          apiError.message ||
          (uiLanguage === "fr"
            ? "Impossible de changer de pack."
            : "Unable to change subscription plan."),
      );
    } finally {
      setChangingPack(null);
    }
  }

  if (loadingLanguage) {
    return (
      <main className="page">
        <div className="page-wrap">
          <div className="card">
            {uiLanguage === "fr" ? "Chargement..." : "Loading..."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Mon abonnement" : "My subscription"}
    >
      <div className="stack" style={{ gap: 18 }}>
        <section
          className="card stack"
          style={{
            gap: 18,
            background:
              "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
          }}
        >
          <div className="row space-between" style={{ gap: 18, flexWrap: "wrap" }}>
            <div className="stack" style={{ gap: 10, maxWidth: 760 }}>
              <span className="badge">
                {uiLanguage === "fr" ? "Abonnement LeanWorker" : "LeanWorker subscription"}
              </span>

              <h1
                className="title"
                style={{
                  margin: 0,
                  fontSize: 40,
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                }}
              >
                {uiLanguage === "fr"
                  ? "Gérez votre niveau d’accompagnement."
                  : "Manage your support level."}
              </h1>

              <p className="muted" style={{ fontSize: 16, lineHeight: 1.7 }}>
                {uiLanguage === "fr"
                  ? "Votre abonnement détermine le niveau d’accès à l’accompagnement humain et technologique LeanWorker : conversations, Career Blueprint, Adaptive Coach, recommandations et leviers."
                  : "Your subscription defines your access level to LeanWorker’s human and technology-enabled support: conversations, Career Blueprint, Adaptive Coach, recommendations, and levers."}
              </p>
            </div>

            <div
              className="card-soft stack"
              style={{
                minWidth: 280,
                gap: 10,
                border: "1px solid rgba(37,99,235,0.18)",
              }}
            >
              <div className="muted">
                {uiLanguage === "fr" ? "Pack actif" : "Active plan"}
              </div>

              <div className="admin-metric-value">{activePresentation.name}</div>

              <div className="muted">
                {uiLanguage === "fr"
                  ? activePresentation.subtitleFr
                  : activePresentation.subtitleEn}
              </div>

              <span className="badge" style={{ alignSelf: "flex-start" }}>
                {uiLanguage === "fr" ? "Actuellement activé" : "Currently active"}
              </span>
            </div>
          </div>
        </section>

        {message ? (
          <section
            className="card stack"
            style={{
              gap: 8,
              border: "1px solid rgba(16,185,129,0.22)",
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(255,255,255,0.96))",
            }}
          >
            <div className="section-title">
              {uiLanguage === "fr" ? "Abonnement mis à jour" : "Subscription updated"}
            </div>

            <div className="muted">{message.message}</div>
          </section>
        ) : null}

        {error ? (
          <section
            className="card stack"
            style={{
              gap: 8,
              border: "1px solid rgba(239,68,68,0.22)",
            }}
          >
            <div className="section-title" style={{ color: "var(--danger)" }}>
              {uiLanguage === "fr" ? "Action impossible" : "Action failed"}
            </div>

            <div className="muted">{error}</div>
          </section>
        ) : null}

        {loading ? (
          <div className="card-soft">
            {uiLanguage === "fr"
              ? "Chargement des packs..."
              : "Loading subscription plans..."}
          </div>
        ) : (
          <section className="card stack" style={{ gap: 16 }}>
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">
                  {uiLanguage === "fr"
                    ? "Choisissez votre pack"
                    : "Choose your plan"}
                </div>

                <div className="muted">
                  {uiLanguage === "fr"
                    ? "Vous pouvez changer de pack selon votre niveau d’engagement et votre besoin d’accompagnement."
                    : "You can change your plan depending on your commitment level and support needs."}
                </div>
              </div>

              <button className="button ghost" type="button" onClick={() => void loadPlans()}>
                {uiLanguage === "fr" ? "Rafraîchir" : "Refresh"}
              </button>
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
              {plans.map((plan) => {
                if (!isSubscriptionPackKey(plan.pack)) {
                  return null;
                }

                const pack = plan.pack;
                const presentation = getPackPresentation(pack);
                const isActive = pack === activePack;
                const cycleOptions = getPlanCycleOptions(plan);
                const selectedCycle =
                  selectedCycles[pack] ??
                  (pack === "standard" ? "free" : "monthly");

                const isContactSales = Boolean(plan.is_contact_sales);
                const isChanging = changingPack === pack;

                return (
                  <article
                    key={pack}
                    className="card-soft stack"
                    style={{
                      gap: 14,
                      minHeight: 520,
                      border: isActive
                        ? "1px solid rgba(37,99,235,0.32)"
                        : "1px solid rgba(15,23,42,0.08)",
                      background: isActive
                        ? "linear-gradient(180deg, rgba(37,99,235,0.08), rgba(255,255,255,0.96))"
                        : undefined,
                    }}
                  >
                    <div className="row space-between" style={{ gap: 8 }}>
                      <span
                        className="badge"
                        style={{
                          background: isActive
                            ? "rgba(37,99,235,0.12)"
                            : "rgba(15,23,42,0.05)",
                          color: isActive ? "#2563eb" : undefined,
                        }}
                      >
                        {isActive
                          ? uiLanguage === "fr"
                            ? "Actuel"
                            : "Current"
                          : presentation.name}
                      </span>

                      {pack === "classique" ? (
                        <span className="badge">
                          {uiLanguage === "fr" ? "Recommandé" : "Recommended"}
                        </span>
                      ) : null}
                    </div>

                    <div className="stack" style={{ gap: 6 }}>
                      <h2 className="section-title" style={{ fontSize: 24 }}>
                        {presentation.name}
                      </h2>

                      <div className="muted" style={{ minHeight: 44, lineHeight: 1.55 }}>
                        {uiLanguage === "fr"
                          ? presentation.subtitleFr
                          : presentation.subtitleEn}
                      </div>

                      <div className="title" style={{ fontSize: 24, margin: 0 }}>
                        {formatPrice(plan, selectedCycle, uiLanguage)}
                      </div>
                    </div>

                    {cycleOptions.length > 1 ? (
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        {cycleOptions.map((cycle) => (
                          <button
                            key={cycle}
                            type="button"
                            className={
                              selectedCycle === cycle ? "button secondary" : "button ghost"
                            }
                            style={{
                              minHeight: 34,
                              padding: "8px 10px",
                              borderRadius: 12,
                              fontSize: 13,
                            }}
                            onClick={() =>
                              setSelectedCycles((previous) => ({
                                ...previous,
                                [pack]: cycle,
                              }))
                            }
                          >
                            {getCycleLabel(cycle, uiLanguage)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="badge" style={{ alignSelf: "flex-start" }}>
                        {getCycleLabel(selectedCycle, uiLanguage)}
                      </span>
                    )}

                    {plan.description ? (
                      <p className="muted" style={{ lineHeight: 1.65 }}>
                        {plan.description}
                      </p>
                    ) : null}

                    <div className="stack" style={{ gap: 8 }}>
                      {getPackFeatures(pack, uiLanguage).map((feature) => (
                        <div
                          key={feature}
                          className="row"
                          style={{ gap: 8, alignItems: "flex-start" }}
                        >
                          <span
                            style={{
                              width: 9,
                              height: 9,
                              marginTop: 7,
                              borderRadius: 999,
                              background: isActive ? "#2563eb" : "#10b981",
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
                      className={isActive ? "button secondary" : "button"}
                      type="button"
                      disabled={isActive || isContactSales || isChanging}
                      onClick={() => void handleChangePack(plan)}
                      style={{ marginTop: "auto", width: "100%" }}
                    >
                      {isChanging
                        ? uiLanguage === "fr"
                          ? "Traitement..."
                          : "Processing..."
                        : isContactSales
                          ? uiLanguage === "fr"
                            ? "Sur qualification"
                            : "Qualification required"
                          : getActionLabel(pack, activePack, uiLanguage)}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section
          className="card stack"
          style={{
            gap: 12,
            border: "1px solid rgba(16,185,129,0.20)",
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.06))",
          }}
        >
          <div className="section-title">
            {uiLanguage === "fr"
              ? "Comment fonctionne le changement de pack ?"
              : "How does plan change work?"}
          </div>

          <div className="grid grid-3">
            <div className="card-soft stack" style={{ gap: 8 }}>
              <strong>{uiLanguage === "fr" ? "Upgrade" : "Upgrade"}</strong>
              <div className="muted" style={{ lineHeight: 1.6 }}>
                {uiLanguage === "fr"
                  ? "Pour passer vers un pack payant ou supérieur, vous êtes redirigé vers Stripe pour confirmer le paiement."
                  : "To move to a paid or higher plan, you are redirected to Stripe to confirm payment."}
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 8 }}>
              <strong>{uiLanguage === "fr" ? "Downgrade" : "Downgrade"}</strong>
              <div className="muted" style={{ lineHeight: 1.6 }}>
                {uiLanguage === "fr"
                  ? "Le passage vers Standard est immédiat et active le pack gratuit."
                  : "Switching to Standard is immediate and activates the free plan."}
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 8 }}>
              <strong>{uiLanguage === "fr" ? "Sécurité" : "Security"}</strong>
              <div className="muted" style={{ lineHeight: 1.6 }}>
                {uiLanguage === "fr"
                  ? "Les paiements et changements payants sont confirmés par webhook Stripe avant activation."
                  : "Payments and paid changes are confirmed by Stripe webhook before activation."}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}