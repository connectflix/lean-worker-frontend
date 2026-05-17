// app/account/subscription/page.tsx
"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { useCurrentUser } from "@/components/user-context";
import { changeSubscriptionPack, getSubscriptionPlans } from "@/lib/api";
import { useUiLanguage } from "@/lib/use-ui-language";
import {
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  LayerIcon,
  SparkIcon,
  TargetIcon,
  UserCardIcon,
} from "@/components/ui-flat-icons";
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
  tone: "neutral" | "warm" | "calm" | "premium";
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
    tone: "warm",
  },
  flix: {
    key: "flix",
    name: "Flix",
    subtitleFr: "Pour accélérer votre transformation professionnelle.",
    subtitleEn: "For accelerating your professional transformation.",
    tone: "calm",
  },
  executif: {
    key: "executif",
    name: "Exécutif",
    subtitleFr: "Accompagnement stratégique sur mesure.",
    subtitleEn: "Tailored strategic support.",
    tone: "premium",
  },
};

function CoachSectionCard({
  children,
  warm = false,
}: {
  children: ReactNode;
  warm?: boolean;
}) {
  return (
    <section
      className="card stack"
      style={{
        gap: 18,
        borderRadius: 30,
        border: "1px solid rgba(43,33,24,0.08)",
        background: warm
          ? "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92) 55%, rgba(232,248,246,0.82))"
          : "rgba(255,255,255,0.80)",
        boxShadow: "0 22px 60px rgba(43,33,24,0.07)",
      }}
    >
      {children}
    </section>
  );
}

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

  const normalized = cycles.filter((cycle): cycle is SubscriptionBillingCycle => {
    return cycle === "monthly" || cycle === "yearly" || cycle === "free";
  });

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

function getPackFeatures(pack: SubscriptionPackKey, uiLanguage: "fr" | "en"): string[] {
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

function getPackToneStyle(tone: PackPresentation["tone"], active = false) {
  if (tone === "calm") {
    return {
      iconColor: "var(--coach-calm)",
      softBg: "rgba(88,180,174,0.12)",
      border: "rgba(88,180,174,0.22)",
      gradient: "linear-gradient(135deg, rgba(232,248,246,0.94), rgba(255,255,255,0.92))",
      activeGlow: "0 18px 44px rgba(88,180,174,0.13)",
    };
  }

  if (tone === "premium") {
    return {
      iconColor: "#9a6a19",
      softBg: "rgba(214,179,106,0.14)",
      border: "rgba(214,179,106,0.24)",
      gradient: "linear-gradient(135deg, rgba(255,246,224,0.94), rgba(255,255,255,0.92))",
      activeGlow: "0 18px 44px rgba(154,106,25,0.12)",
    };
  }

  if (tone === "warm") {
    return {
      iconColor: "var(--coach-accent)",
      softBg: "rgba(255,122,89,0.13)",
      border: "rgba(255,122,89,0.24)",
      gradient: "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92))",
      activeGlow: "0 18px 44px rgba(255,122,89,0.13)",
    };
  }

  return {
    iconColor: active ? "var(--coach-accent)" : "var(--coach-muted)",
    softBg: active ? "rgba(255,122,89,0.12)" : "rgba(43,33,24,0.05)",
    border: active ? "rgba(255,122,89,0.20)" : "rgba(43,33,24,0.08)",
    gradient: "rgba(255,255,255,0.78)",
    activeGlow: "0 18px 44px rgba(43,33,24,0.07)",
  };
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
  const activeTone = getPackToneStyle(activePresentation.tone, true);

  const labels = useMemo(() => {
    if (uiLanguage === "fr") {
      return {
        loading: "Chargement...",
        shellTitle: "Mon abonnement",
        heroBadge: "Abonnement LeanWorker",
        heroTitle: "Choisis le niveau d’accompagnement qui soutient ton rythme.",
        heroSubtitle:
          "Ton abonnement définit l’intensité de ton espace LeanWorker : coaching, Career Blueprint, recommandations, guides IA et leviers d’action.",
        activePlan: "Pack actif",
        currentlyActive: "Actuellement activé",
        updatedTitle: "Abonnement mis à jour",
        errorTitle: "Action impossible",
        loadingPlans: "Chargement des packs...",
        choosePlan: "Choisissez votre pack",
        choosePlanText:
          "Tu peux changer de pack selon ton niveau d’engagement, ton besoin de clarté et ton rythme de transformation.",
        refresh: "Rafraîchir",
        current: "Actuel",
        recommended: "Recommandé",
        processing: "Traitement...",
        qualificationRequired: "Sur qualification",
        guideTitle: "Comment fonctionne le changement de pack ?",
        upgrade: "Upgrade",
        upgradeText:
          "Pour passer vers un pack payant ou supérieur, tu es redirigé vers Stripe pour confirmer le paiement.",
        downgrade: "Downgrade",
        downgradeText:
          "Le passage vers Standard est immédiat et active le pack gratuit.",
        security: "Sécurité",
        securityText:
          "Les paiements et changements payants sont confirmés par webhook Stripe avant activation.",
        coachingAccess: "Accès coaching",
        pathSupport: "Soutien de trajectoire",
        executionLevers: "Leviers d’action",
      };
    }

    return {
      loading: "Loading...",
      shellTitle: "My subscription",
      heroBadge: "LeanWorker subscription",
      heroTitle: "Choose the support level that matches your pace.",
      heroSubtitle:
        "Your subscription defines the intensity of your LeanWorker space: coaching, Career Blueprint, recommendations, AI guides, and action levers.",
      activePlan: "Active plan",
      currentlyActive: "Currently active",
      updatedTitle: "Subscription updated",
      errorTitle: "Action failed",
      loadingPlans: "Loading subscription plans...",
      choosePlan: "Choose your plan",
      choosePlanText:
        "You can change your plan based on your commitment level, clarity needs, and transformation pace.",
      refresh: "Refresh",
      current: "Current",
      recommended: "Recommended",
      processing: "Processing...",
      qualificationRequired: "Qualification required",
      guideTitle: "How does plan change work?",
      upgrade: "Upgrade",
      upgradeText:
        "To move to a paid or higher plan, you are redirected to Stripe to confirm payment.",
      downgrade: "Downgrade",
      downgradeText:
        "Switching to Standard is immediate and activates the free plan.",
      security: "Security",
      securityText:
        "Payments and paid changes are confirmed by Stripe webhook before activation.",
      coachingAccess: "Coaching access",
      pathSupport: "Trajectory support",
      executionLevers: "Action levers",
    };
  }, [uiLanguage]);

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
      <main
        className="page"
        style={{
          minHeight: "100vh",
          background: "var(--coach-bg)",
          padding: 24,
        }}
      >
        <div className="page-wrap">
          <CoachSectionCard>
            <div className="section-title">{labels.loading}</div>
          </CoachSectionCard>
        </div>
      </main>
    );
  }

  return (
    <AppShell uiLanguage={uiLanguage} title={labels.shellTitle}>
      <div className="stack" style={{ gap: 18 }}>
        <section
          className="card stack"
          style={{
            gap: 20,
            position: "relative",
            overflow: "hidden",
            borderRadius: 32,
            border: "1px solid rgba(43,33,24,0.08)",
            background:
              "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92) 52%, rgba(232,248,246,0.88))",
            boxShadow: "0 22px 60px rgba(43,33,24,0.07)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -110,
              top: -130,
              width: 310,
              height: 310,
              borderRadius: 999,
              background: "rgba(255,122,89,0.16)",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "46%",
              bottom: -150,
              width: 340,
              height: 340,
              borderRadius: 999,
              background: "rgba(88,180,174,0.14)",
            }}
          />

          <div
            className="row space-between"
            style={{
              gap: 18,
              flexWrap: "wrap",
              alignItems: "stretch",
              position: "relative",
            }}
          >
            <div className="stack" style={{ gap: 14, maxWidth: 820 }}>
              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                <BadgePill icon={<LayerIcon size={14} />}>{labels.heroBadge}</BadgePill>
                <BadgePill icon={<SparkIcon size={14} />}>{labels.coachingAccess}</BadgePill>
                <BadgePill icon={<TargetIcon size={14} />}>{labels.pathSupport}</BadgePill>
              </div>

              <h1
                style={{
                  margin: 0,
                  maxWidth: 900,
                  fontSize: 44,
                  lineHeight: 1.02,
                  fontWeight: 950,
                  letterSpacing: "-0.07em",
                  color: "var(--coach-ink)",
                }}
              >
                {labels.heroTitle}
              </h1>

              <p
                className="subtitle"
                style={{
                  maxWidth: 760,
                  color: "var(--coach-muted)",
                  fontSize: 16,
                  lineHeight: 1.7,
                }}
              >
                {labels.heroSubtitle}
              </p>
            </div>

            <div
              className="card-soft stack"
              style={{
                minWidth: 280,
                maxWidth: 360,
                gap: 12,
                borderRadius: 28,
                background: "rgba(255,255,255,0.78)",
                border: `1px solid ${activeTone.border}`,
                boxShadow: activeTone.activeGlow,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  color: activeTone.iconColor,
                  background: activeTone.softBg,
                  border: `1px solid ${activeTone.border}`,
                }}
              >
                <UserCardIcon size={18} />
              </div>

              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {labels.activePlan}
              </div>

              <div
                style={{
                  fontSize: 36,
                  lineHeight: 1,
                  fontWeight: 950,
                  letterSpacing: "-0.06em",
                  color: "var(--coach-ink)",
                }}
              >
                {activePresentation.name}
              </div>

              <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.6 }}>
                {uiLanguage === "fr"
                  ? activePresentation.subtitleFr
                  : activePresentation.subtitleEn}
              </div>

              <BadgePill icon={<CheckCircleIcon size={14} />}>
                {labels.currentlyActive}
              </BadgePill>
            </div>
          </div>
        </section>

        {message ? (
          <CoachSectionCard>
            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <CheckCircleIcon />
              <div className="section-title" style={{ color: "var(--success)" }}>
                {labels.updatedTitle}
              </div>
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)" }}>
              {message.message}
            </div>
          </CoachSectionCard>
        ) : null}

        {error ? (
          <CoachSectionCard>
            <div className="section-title" style={{ color: "var(--danger)" }}>
              {labels.errorTitle}
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)" }}>
              {error}
            </div>
          </CoachSectionCard>
        ) : null}

        {loading ? (
          <CoachSectionCard>
            <div className="row" style={{ gap: 12, alignItems: "center" }}>
              <div className="loader" />
              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {labels.loadingPlans}
              </div>
            </div>
          </CoachSectionCard>
        ) : (
          <CoachSectionCard>
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 6 }}>
                <div className="section-title">{labels.choosePlan}</div>

                <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
                  {labels.choosePlanText}
                </div>
              </div>

              <button className="button ghost" type="button" onClick={() => void loadPlans()}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <ClockIcon size={14} />
                  {labels.refresh}
                </span>
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(250px, 1fr))",
                gap: 14,
                overflowX: "auto",
                paddingBottom: 6,
              }}
            >
              {plans.map((plan) => {
                if (!isSubscriptionPackKey(plan.pack)) {
                  return null;
                }

                const pack = plan.pack;
                const presentation = getPackPresentation(pack);
                const toneStyle = getPackToneStyle(presentation.tone, pack === activePack);
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
                      gap: 16,
                      minHeight: 540,
                      borderRadius: 28,
                      border: isActive
                        ? `2px solid ${toneStyle.border}`
                        : "1px solid rgba(43,33,24,0.08)",
                      background: isActive ? toneStyle.gradient : "rgba(255,255,255,0.70)",
                      boxShadow: isActive
                        ? toneStyle.activeGlow
                        : "0 12px 34px rgba(43,33,24,0.05)",
                    }}
                  >
                    <div className="row space-between" style={{ gap: 8 }}>
                      <BadgePill
                        icon={
                          isActive ? (
                            <CheckCircleIcon size={14} />
                          ) : (
                            <LayerIcon size={14} />
                          )
                        }
                      >
                        {isActive ? labels.current : presentation.name}
                      </BadgePill>

                      {pack === "classique" ? (
                        <BadgePill icon={<SparkIcon size={14} />}>
                          {labels.recommended}
                        </BadgePill>
                      ) : null}
                    </div>

                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 17,
                        display: "grid",
                        placeItems: "center",
                        color: toneStyle.iconColor,
                        background: toneStyle.softBg,
                        border: `1px solid ${toneStyle.border}`,
                      }}
                    >
                      <TargetIcon size={18} />
                    </div>

                    <div className="stack" style={{ gap: 7 }}>
                      <h2
                        className="section-title"
                        style={{
                          fontSize: 25,
                          color: "var(--coach-ink)",
                        }}
                      >
                        {presentation.name}
                      </h2>

                      <div
                        className="muted"
                        style={{
                          minHeight: 48,
                          color: "var(--coach-muted)",
                          lineHeight: 1.55,
                        }}
                      >
                        {uiLanguage === "fr"
                          ? presentation.subtitleFr
                          : presentation.subtitleEn}
                      </div>

                      <div
                        style={{
                          fontSize: 28,
                          lineHeight: 1,
                          fontWeight: 950,
                          letterSpacing: "-0.055em",
                          color: "var(--coach-ink)",
                        }}
                      >
                        {formatPrice(plan, selectedCycle, uiLanguage)}
                      </div>
                    </div>

                    {cycleOptions.length > 1 ? (
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        {cycleOptions.map((cycle) => (
                          <button
                            key={cycle}
                            type="button"
                            className={selectedCycle === cycle ? "button" : "button ghost"}
                            style={{
                              minHeight: 36,
                              padding: "8px 12px",
                              borderRadius: 999,
                              fontSize: 13,
                              background:
                                selectedCycle === cycle ? "var(--coach-accent)" : undefined,
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
                      <BadgePill icon={<ClockIcon size={14} />}>
                        {getCycleLabel(selectedCycle, uiLanguage)}
                      </BadgePill>
                    )}

                    {plan.description ? (
                      <p
                        className="muted"
                        style={{
                          margin: 0,
                          color: "var(--coach-muted)",
                          lineHeight: 1.65,
                        }}
                      >
                        {plan.description}
                      </p>
                    ) : null}

                    <div className="stack" style={{ gap: 9 }}>
                      {getPackFeatures(pack, uiLanguage).map((feature) => (
                        <div
                          key={feature}
                          className="row"
                          style={{ gap: 9, alignItems: "flex-start" }}
                        >
                          <CheckCircleIcon size={15} color={toneStyle.iconColor} />
                          <div
                            className="muted"
                            style={{
                              color: "var(--coach-muted)",
                              lineHeight: 1.45,
                            }}
                          >
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
                      style={{
                        marginTop: "auto",
                        width: "100%",
                        minHeight: 46,
                        background: isActive ? undefined : "var(--coach-accent)",
                        color: isActive ? "var(--coach-accent)" : undefined,
                        borderColor: isActive ? "rgba(255,122,89,0.28)" : undefined,
                      }}
                    >
                      {isChanging
                        ? labels.processing
                        : isContactSales
                          ? labels.qualificationRequired
                          : getActionLabel(pack, activePack, uiLanguage)}
                    </button>
                  </article>
                );
              })}
            </div>
          </CoachSectionCard>
        )}

        <CoachSectionCard warm>
          <div className="row" style={{ gap: 10, alignItems: "center" }}>
            <SparkIcon />
            <div className="section-title">{labels.guideTitle}</div>
          </div>

          <div className="grid grid-3">
            {[
              {
                title: labels.upgrade,
                text: labels.upgradeText,
                icon: <TargetIcon size={16} />,
              },
              {
                title: labels.downgrade,
                text: labels.downgradeText,
                icon: <LayerIcon size={16} />,
              },
              {
                title: labels.security,
                text: labels.securityText,
                icon: <CheckCircleIcon size={16} />,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card-soft stack"
                style={{
                  gap: 10,
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.70)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 14,
                    display: "grid",
                    placeItems: "center",
                    color: "var(--coach-accent)",
                    background: "rgba(255,122,89,0.12)",
                  }}
                >
                  {item.icon}
                </div>

                <strong style={{ color: "var(--coach-ink)" }}>{item.title}</strong>

                <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.6 }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </CoachSectionCard>
      </div>
    </AppShell>
  );
}