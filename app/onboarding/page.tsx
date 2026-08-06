"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { completeOnboarding, getMe } from "@/lib/api";
import { useUiLanguage } from "@/lib/use-ui-language";
import {
  BadgePill,
  BrainIcon,
  CheckCircleIcon,
  PathIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type Level = "Starter" | "Junior" | "Senior" | "Expert" | "Master" | "Elite";

type Horizon = {
  target_compensation: string;
  target_role: string;
  target_level: Level | "";
};

type FormState = {
  current_role: string;
  industry: string;
  main_challenge: string;
  preferred_coaching_style: string;
  short_term_mission: Horizon;
  mid_term_ambition: Horizon;
  long_term_goal: Horizon;
};

const LEVELS: Level[] = ["Starter", "Junior", "Senior", "Expert", "Master", "Elite"];
const COACHING_STYLE_OPTIONS = [
  { value: "empathic", fr: "Empathique", en: "Empathic" },
  { value: "direct", fr: "Direct", en: "Direct" },
  { value: "structured", fr: "Structuré", en: "Structured" },
  { value: "motivational", fr: "Motivant", en: "Motivational" },
] as const;

const LEVEL_LABELS: Record<Level, { fr: string; en: string }> = {
  Starter: { fr: "Débutant", en: "Starter" },
  Junior: { fr: "Junior", en: "Junior" },
  Senior: { fr: "Senior", en: "Senior" },
  Expert: { fr: "Expert", en: "Expert" },
  Master: { fr: "Maître", en: "Master" },
  Elite: { fr: "Élite", en: "Elite" },
};

function OnboardingShell({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: "fr" | "en";
}) {
  return (
    <main
      lang={lang}
      translate="no"
      suppressHydrationWarning
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(255,122,89,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(88,180,174,0.14), transparent 32%), var(--coach-bg)",
        padding: "clamp(14px, 3vw, 24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1080,
        }}
      >
        {children}
      </div>
    </main>
  );
}

function CoachPanel({
  children,
  warm = false,
}: {
  children: React.ReactNode;
  warm?: boolean;
}) {
  return (
    <div
      className="card stack"
      style={{
        gap: 16,
        borderRadius: 28,
        border: "1px solid rgba(43,33,24,0.08)",
        background: warm
          ? "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92) 55%, rgba(232,248,246,0.82))"
          : "rgba(255,255,255,0.82)",
        boxShadow: "0 24px 70px rgba(43,33,24,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function SelectableCard({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="card stack"
      onClick={onClick}
      style={{
        gap: 10,
        textAlign: "left",
        cursor: "pointer",
        borderRadius: 20,
        border: selected
          ? "2px solid var(--coach-accent)"
          : "1px solid rgba(43,33,24,0.08)",
        background: selected
          ? "linear-gradient(135deg, rgba(255,122,89,0.14), rgba(255,255,255,0.86))"
          : "rgba(255,255,255,0.74)",
        boxShadow: selected
          ? "0 12px 28px rgba(255,122,89,0.10)"
          : "0 6px 18px rgba(43,33,24,0.035)",
      }}
    >
      {children}
    </button>
  );
}

export default function OnboardingPage() {
  return (
    <OnboardingGuard>
      <OnboardingContent />
    </OnboardingGuard>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const { uiLanguage } = useUiLanguage("fr");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    current_role: "",
    industry: "",
    main_challenge: "",
    preferred_coaching_style: "",
    short_term_mission: {
      target_compensation: "",
      target_role: "",
      target_level: "",
    },
    mid_term_ambition: {
      target_compensation: "",
      target_role: "",
      target_level: "",
    },
    long_term_goal: {
      target_compensation: "",
      target_role: "",
      target_level: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const me = await getMe();
        setFirstName(me.given_name || me.display_name || "");
      } catch (err) {
        setError(err instanceof Error
            ? err.message
            : uiLanguage === "fr"
              ? "Impossible de charger ton profil."
              : "Unable to load your profile.");
      } finally {
        setLoadingProfile(false);
      }
    }

    void loadProfile();
  }, [uiLanguage]);

  const copy = useMemo(() => {
    if (uiLanguage === "fr") {
      return {
        badge: "Démarrage",
        loading: "Préparation de ton parcours...",
        loadingBody: "Nous chargeons ton profil et personnalisons ton espace.",
        loadingErrorTitle: "Impossible de préparer ton parcours",
        loadingErrorBody:
          "Nous n’avons pas pu charger ton profil. Réessaie pour continuer.",
        retry: "Réessayer",
        back: "Retour",
        next: "Continuer",
        finish: "Terminer",
        saving: "Enregistrement...",
        stepLabel: (current: number, total: number) => `Étape ${current} sur ${total}`,
        saveError: "Impossible d’enregistrer ton onboarding.",
        welcomeTitle: "Un accompagnement adapté dès le départ",
        welcomeHint:
          "Tes réponses aideront le coach à comprendre ta situation, tes priorités et la direction que tu souhaites prendre.",
        progress: "Progression",
        setupLabel: "Profil personnalisé",
        personalizedCoach: "Coach personnalisé",
        sidebarTitle: "Posons les bases de ton parcours.",
        sidebarBody:
          "Quelques réponses suffisent pour adapter le coaching à ta réalité professionnelle.",
        targetRolePlaceholder: "Fonction ou rôle visé",
        targetCompensationPlaceholder: "Rémunération souhaitée (optionnel)",
        currentRolePlaceholder: "Ex. Business Analyst, Product Manager",
        industryPlaceholder: "Ex. Banque, technologie, santé",
        challengePlaceholder:
          "Ex. J’ai du mal à prioriser et je me sens surchargée",
        steps: [
          {
            key: "welcome",
            title: `Bienvenue ${firstName || ""}`.trim(),
            subtitle: "Prenons quelques minutes pour personnaliser ton accompagnement.",
          },
          {
            key: "current_role",
            title: "Quel est ton rôle actuel ?",
            subtitle: "Indique ta fonction ou ton activité principale.",
          },
          {
            key: "industry",
            title: "Dans quel secteur travailles-tu ?",
            subtitle: "Cela aidera le coach à comprendre ton environnement.",
          },
          {
            key: "main_challenge",
            title: "Quel est ton principal défi en ce moment ?",
            subtitle: "Décris ce qui te freine ou te préoccupe le plus aujourd’hui.",
          },
          {
            key: "short_term_mission",
            title: "Quelle est ta priorité à court terme ?",
            subtitle: "Ce que tu souhaites accomplir dans les prochains mois.",
          },
          {
            key: "mid_term_ambition",
            title: "Quelle est ton ambition à moyen terme ?",
            subtitle: "La prochaine étape importante de ton évolution.",
          },
          {
            key: "long_term_goal",
            title: "Quel est ton objectif à long terme ?",
            subtitle: "La direction professionnelle que tu souhaites construire.",
          },
          {
            key: "preferred_coaching_style",
            title: "Quel style de coaching préfères-tu ?",
            subtitle: "Choisis la manière dont tu aimerais être accompagné.",
          },
        ],
      };
    }

    return {
      badge: "Getting started",
      loading: "Preparing your journey...",
      loadingBody: "We are loading your profile and personalizing your workspace.",
      loadingErrorTitle: "We could not prepare your journey",
      loadingErrorBody:
        "We were unable to load your profile. Please try again to continue.",
      retry: "Try again",
      back: "Back",
      next: "Continue",
      finish: "Finish",
      saving: "Saving...",
      stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
      saveError: "Unable to save your onboarding.",
      welcomeTitle: "Relevant guidance from the start",
      welcomeHint:
        "Your answers will help the coach understand your situation, priorities, and desired direction.",
      progress: "Progress",
      setupLabel: "Personalized profile",
      personalizedCoach: "Personalized coach",
      sidebarTitle: "Let’s set the foundations for your journey.",
      sidebarBody:
        "A few answers are enough to tailor the coaching to your professional reality.",
      targetRolePlaceholder: "Target role",
      targetCompensationPlaceholder: "Target compensation (optional)",
      currentRolePlaceholder: "e.g. Business Analyst, Product Manager",
      industryPlaceholder: "e.g. Banking, technology, healthcare",
      challengePlaceholder:
        "e.g. I struggle to prioritize and feel overloaded",
      steps: [
        {
          key: "welcome",
          title: `Welcome ${firstName || ""}`.trim(),
          subtitle: "Let’s take a few minutes to personalize your experience.",
        },
        {
          key: "current_role",
          title: "What is your current role?",
          subtitle: "Enter your main role or professional activity.",
        },
        {
          key: "industry",
          title: "Which industry do you work in?",
          subtitle: "This will help the coach understand your environment.",
        },
        {
          key: "main_challenge",
          title: "What is your main challenge right now?",
          subtitle: "Describe what is holding you back or concerning you most.",
        },
        {
          key: "short_term_mission",
          title: "What is your short-term priority?",
          subtitle: "What you want to achieve over the next few months.",
        },
        {
          key: "mid_term_ambition",
          title: "What is your mid-term ambition?",
          subtitle: "The next important step in your development.",
        },
        {
          key: "long_term_goal",
          title: "What is your long-term goal?",
          subtitle: "The professional direction you want to build.",
        },
        {
          key: "preferred_coaching_style",
          title: "What coaching style do you prefer?",
          subtitle: "Choose how you would like to be supported.",
        },
      ],
    };
  }, [uiLanguage, firstName]);

  const steps = copy.steps;
  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateHorizon(
    horizonKey: "short_term_mission" | "mid_term_ambition" | "long_term_goal",
    field: keyof Horizon,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [horizonKey]: {
        ...prev[horizonKey],
        [field]: value,
      },
    }));
  }

  function canContinue(): boolean {
    switch (currentStep.key) {
      case "welcome":
        return true;
      case "current_role":
        return form.current_role.trim().length > 1;
      case "industry":
        return form.industry.trim().length > 1;
      case "main_challenge":
        return form.main_challenge.trim().length > 3;
      case "short_term_mission":
        return (
          form.short_term_mission.target_role.trim().length > 1 &&
          !!form.short_term_mission.target_level
        );
      case "mid_term_ambition":
        return (
          form.mid_term_ambition.target_role.trim().length > 1 &&
          !!form.mid_term_ambition.target_level
        );
      case "long_term_goal":
        return (
          form.long_term_goal.target_role.trim().length > 1 &&
          !!form.long_term_goal.target_level
        );
      case "preferred_coaching_style":
        return !!form.preferred_coaching_style;
      default:
        return false;
    }
  }

  async function handleNext() {
    if (!canContinue() || saving) return;

    setError(null);

    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    setSaving(true);

    try {
      await completeOnboarding({
        current_role: form.current_role,
        industry: form.industry,
        main_challenge: form.main_challenge,
        preferred_coaching_style: form.preferred_coaching_style,
        short_term_mission: {
          target_compensation: form.short_term_mission.target_compensation || null,
          target_role: form.short_term_mission.target_role || null,
          target_level: form.short_term_mission.target_level || null,
        },
        mid_term_ambition: {
          target_compensation: form.mid_term_ambition.target_compensation || null,
          target_role: form.mid_term_ambition.target_role || null,
          target_level: form.mid_term_ambition.target_level || null,
        },
        long_term_goal: {
          target_compensation: form.long_term_goal.target_compensation || null,
          target_role: form.long_term_goal.target_role || null,
          target_level: form.long_term_goal.target_level || null,
        },
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveError);
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (stepIndex === 0 || saving) return;
    setError(null);
    setStepIndex((prev) => prev - 1);
  }

  async function handleRetryProfileLoad() {
    setLoadingProfile(true);
    setError(null);

    try {
      const me = await getMe();
      setFirstName(me.given_name || me.display_name || "");
    } catch (err) {
      setError(err instanceof Error
            ? err.message
            : uiLanguage === "fr"
              ? "Impossible de charger ton profil."
              : "Unable to load your profile.");
    } finally {
      setLoadingProfile(false);
    }
  }

  function renderHorizonBlock(
    horizonKey: "short_term_mission" | "mid_term_ambition" | "long_term_goal",
  ) {
    const value = form[horizonKey];

    return (
      <div className="stack" style={{ gap: 16 }}>
        <input
          className="input"
          value={value.target_role}
          onChange={(event) => updateHorizon(horizonKey, "target_role", event.target.value)}
          placeholder={copy.targetRolePlaceholder}
          autoFocus
          style={{
            minHeight: 52,
            borderRadius: 18,
            borderColor: "rgba(43,33,24,0.10)",
            background: "rgba(255,255,255,0.82)",
          }}
        />

        <input
          className="input"
          value={value.target_compensation}
          onChange={(event) =>
            updateHorizon(horizonKey, "target_compensation", event.target.value)
          }
          placeholder={copy.targetCompensationPlaceholder}
          style={{
            minHeight: 52,
            borderRadius: 18,
            borderColor: "rgba(43,33,24,0.10)",
            background: "rgba(255,255,255,0.82)",
          }}
        />

        <div className="grid grid-3">
          {LEVELS.map((level) => {
            const selected = value.target_level === level;

            return (
              <SelectableCard
                key={level}
                selected={selected}
                onClick={() => updateHorizon(horizonKey, "target_level", level)}
              >
                <div className="row" style={{ gap: 8, justifyContent: "center" }}>
                  {selected ? <CheckCircleIcon size={16} /> : <TargetIcon size={16} />}
                  <div
                    className="section-title"
                    style={{
                      margin: 0,
                      textAlign: "center",
                      fontSize: 16,
                      color: "var(--coach-ink)",
                    }}
                  >
                    {LEVEL_LABELS[level][uiLanguage]}
                  </div>
                </div>
              </SelectableCard>
            );
          })}
        </div>
      </div>
    );
  }

  function renderStepContent() {
    switch (currentStep.key) {
      case "welcome":
        return (
          <div
            className="card-soft stack"
            style={{
              gap: 14,
              borderRadius: 28,
              background:
                "linear-gradient(135deg, rgba(255,122,89,0.12), rgba(255,255,255,0.82) 55%, rgba(88,180,174,0.12))",
              border: "1px solid rgba(43,33,24,0.08)",
            }}
          >
            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,122,89,0.12)",
                  color: "var(--coach-accent)",
                }}
              >
                <SparkIcon size={20} />
              </div>

              <div className="section-title" style={{ margin: 0, color: "var(--coach-ink)" }}>
                {copy.welcomeTitle}
              </div>
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
              {copy.welcomeHint}
            </div>
          </div>
        );

      case "current_role":
        return (
          <input
            className="input"
            value={form.current_role}
            onChange={(event) => updateField("current_role", event.target.value)}
            placeholder={copy.currentRolePlaceholder}
            autoFocus
            style={{
              minHeight: 54,
              borderRadius: 18,
              borderColor: "rgba(43,33,24,0.10)",
              background: "rgba(255,255,255,0.82)",
            }}
          />
        );

      case "industry":
        return (
          <input
            className="input"
            value={form.industry}
            onChange={(event) => updateField("industry", event.target.value)}
            placeholder={copy.industryPlaceholder}
            autoFocus
            style={{
              minHeight: 54,
              borderRadius: 18,
              borderColor: "rgba(43,33,24,0.10)",
              background: "rgba(255,255,255,0.82)",
            }}
          />
        );

      case "main_challenge":
        return (
          <textarea
            className="textarea"
            value={form.main_challenge}
            onChange={(event) => updateField("main_challenge", event.target.value)}
            rows={5}
            placeholder={copy.challengePlaceholder}
            autoFocus
            style={{
              borderRadius: 18,
              borderColor: "rgba(43,33,24,0.10)",
              background: "rgba(255,255,255,0.82)",
              lineHeight: 1.65,
            }}
          />
        );

      case "short_term_mission":
        return renderHorizonBlock("short_term_mission");

      case "mid_term_ambition":
        return renderHorizonBlock("mid_term_ambition");

      case "long_term_goal":
        return renderHorizonBlock("long_term_goal");

      case "preferred_coaching_style":
        return (
          <div className="grid grid-2">
            {COACHING_STYLE_OPTIONS.map((option) => {
                const selected = form.preferred_coaching_style === option.value;

                return (
                  <SelectableCard
                    key={option.value}
                    selected={selected}
                    onClick={() =>
                      updateField("preferred_coaching_style", option.value)
                    }
                  >
                    <div className="row" style={{ gap: 10, alignItems: "center" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 14,
                          display: "grid",
                          placeItems: "center",
                          background: selected
                            ? "rgba(255,122,89,0.14)"
                            : "rgba(43,33,24,0.05)",
                          color: selected ? "var(--coach-accent)" : "var(--coach-muted)",
                        }}
                      >
                        {selected ? <CheckCircleIcon size={16} /> : <BrainIcon size={16} />}
                      </div>

                      <div
                        className="section-title"
                        style={{
                          textTransform: "capitalize",
                          margin: 0,
                          color: "var(--coach-ink)",
                        }}
                      >
                        {option[uiLanguage]}
                      </div>
                    </div>
                  </SelectableCard>
                );
              },
            )}
          </div>
        );

      default:
        return null;
    }
  }

  if (loadingProfile) {
    return (
      <OnboardingShell lang={uiLanguage}>
        <CoachPanel warm>
          <div className="row" style={{ gap: 12, alignItems: "center" }}>
            <div className="loader" />
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">{copy.loading}</div>
              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {copy.loadingBody}
              </div>
            </div>
          </div>
        </CoachPanel>
      </OnboardingShell>
    );
  }

  if (error && !firstName && stepIndex === 0) {
    return (
      <OnboardingShell lang={uiLanguage}>
        <CoachPanel>
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {copy.loadingErrorTitle}
          </div>

          <div className="muted" style={{ color: "var(--coach-muted)" }}>
            {copy.loadingErrorBody}
          </div>

          <div
            className="card-soft"
            style={{
              color: "var(--danger)",
              borderRadius: 22,
              background: "rgba(198,40,40,0.08)",
              border: "1px solid rgba(198,40,40,0.16)",
            }}
          >
            {error}
          </div>

          <div className="row">
            <button
              className="button"
              onClick={() => void handleRetryProfileLoad()}
              type="button"
              style={{ background: "var(--coach-accent)" }}
            >
              {copy.retry}
            </button>
          </div>
        </CoachPanel>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell lang={uiLanguage}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        <CoachPanel warm>
          <div className="stack" style={{ gap: 18 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <BadgePill icon={<PathIcon size={14} />}>{copy.badge}</BadgePill>
              <BadgePill icon={<SparkIcon size={14} />}>{copy.setupLabel}</BadgePill>
            </div>

            <div
              style={{
                fontSize: 31,
                lineHeight: 1.04,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {copy.sidebarTitle}
            </div>

            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                lineHeight: 1.7,
              }}
            >
              {copy.sidebarBody}
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 10,
                borderRadius: 24,
                background: "rgba(255,255,255,0.64)",
                border: "1px solid rgba(43,33,24,0.08)",
              }}
            >
              <div className="row space-between" style={{ gap: 12 }}>
                <span className="muted" style={{ color: "var(--coach-muted)" }}>
                  {copy.progress}
                </span>
                <strong style={{ color: "var(--coach-ink)" }}>{progress}%</strong>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 10,
                  background: "rgba(43,33,24,0.08)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, var(--coach-accent), var(--coach-calm))",
                    transition: "width 220ms ease",
                  }}
                />
              </div>

              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {copy.stepLabel(stepIndex + 1, totalSteps)}
              </div>
            </div>

            <div className="stack" style={{ gap: 8 }}>
              {steps.map((step, index) => {
                const active = index === stepIndex;
                const done = index < stepIndex;

                return (
                  <div
                    key={step.key}
                    className="row"
                    style={{
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 16,
                      background: active
                        ? "rgba(255,122,89,0.12)"
                        : done
                          ? "rgba(88,180,174,0.10)"
                          : "transparent",
                      color: active ? "var(--coach-accent)" : "var(--coach-muted)",
                    }}
                  >
                    {done ? <CheckCircleIcon size={14} /> : <TargetIcon size={14} />}
                    <span style={{ fontSize: 13, fontWeight: active ? 800 : 600 }}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CoachPanel>

        <CoachPanel>
          <div
            className="stack"
            style={{
              gap: 20,
              minHeight: 500,
              justifyContent: "space-between",
            }}
          >
            <div className="stack" style={{ gap: 22 }}>
              <div className="stack" style={{ gap: 10 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <BadgePill icon={<TargetIcon size={14} />}>
                    {copy.stepLabel(stepIndex + 1, totalSteps)}
                  </BadgePill>

                  <BadgePill icon={<BrainIcon size={14} />}>
                    {copy.personalizedCoach}
                  </BadgePill>
                </div>

                <div
                  style={{
                    fontSize: 34,
                    lineHeight: 1.08,
                    fontWeight: 950,
                    letterSpacing: "-0.06em",
                    color: "var(--coach-ink)",
                  }}
                >
                  {currentStep.title}
                </div>

                <p
                  className="subtitle"
                  style={{
                    margin: 0,
                    color: "var(--coach-muted)",
                    lineHeight: 1.7,
                    maxWidth: 720,
                  }}
                >
                  {currentStep.subtitle}
                </p>
              </div>

              {renderStepContent()}
            </div>

            <div className="stack" style={{ gap: 14 }}>
              {error ? (
                <div
                  className="card-soft"
                  style={{
                    color: "var(--danger)",
                    borderRadius: 20,
                    background: "rgba(198,40,40,0.08)",
                    border: "1px solid rgba(198,40,40,0.16)",
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <button
                  className="button ghost"
                  type="button"
                  onClick={handleBack}
                  disabled={stepIndex === 0 || saving}
                >
                  {copy.back}
                </button>

                <button
                  className="button"
                  type="button"
                  onClick={() => void handleNext()}
                  disabled={!canContinue() || saving}
                  style={{
                    background: "var(--coach-accent)",
                    minHeight: 46,
                    paddingInline: 22,
                  }}
                >
                  {saving
                    ? copy.saving
                    : stepIndex === totalSteps - 1
                      ? copy.finish
                      : copy.next}
                </button>
              </div>
            </div>
          </div>
        </CoachPanel>
      </div>
    </OnboardingShell>
  );
}