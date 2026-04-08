"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { completeOnboarding, getMe } from "@/lib/api";
import { resolveUiLanguage, type SupportedUiLanguage } from "@/lib/user-locales";
import {
  BadgePill,
  BrainIcon,
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
const COACHING_STYLE_OPTIONS_EN = ["empathic", "direct", "structured", "motivational"];
const COACHING_STYLE_OPTIONS_FR = ["empathique", "direct", "structuré", "motivant"];

export default function OnboardingPage() {
  return (
    <OnboardingGuard>
      <OnboardingContent />
    </OnboardingGuard>
  );
}

function OnboardingContent() {
  const router = useRouter();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [uiLanguage, setUiLanguage] = useState<SupportedUiLanguage>("en");
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
        setUiLanguage(
          resolveUiLanguage({
            language: me.language,
            locale: me.locale,
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your profile.");
      } finally {
        setLoadingProfile(false);
      }
    }

    void loadProfile();
  }, []);

  const copy = useMemo(() => {
    if (uiLanguage === "fr") {
      return {
        badge: "Onboarding",
        loading: "Préparation de ton onboarding...",
        loadingErrorTitle: "Impossible de préparer ton onboarding",
        loadingErrorBody:
          "Nous n’avons pas pu récupérer ton profil de départ. Réessaie pour continuer.",
        retry: "Réessayer",
        back: "Retour",
        next: "Continuer",
        finish: "Terminer l’onboarding",
        saving: "Enregistrement...",
        stepLabel: (current: number, total: number) => `Étape ${current} sur ${total}`,
        saveError: "Impossible d’enregistrer ton onboarding.",
        welcomeHint:
          "Ces informations serviront à personnaliser ton coach dès les premières sessions.",
        steps: [
          {
            key: "welcome",
            title: `Bienvenue ${firstName || ""}`.trim(),
            subtitle:
              "Commençons par quelques informations clés pour personnaliser ton coaching.",
          },
          {
            key: "current_role",
            title: "Quel est ton rôle actuel ?",
            subtitle: "Décris simplement ta fonction actuelle.",
          },
          {
            key: "industry",
            title: "Dans quel secteur travailles-tu ?",
            subtitle: "Cela aide le coach à comprendre ton environnement.",
          },
          {
            key: "main_challenge",
            title: "Quel est ton principal défi actuellement ?",
            subtitle: "Partage ce qui te bloque le plus aujourd’hui.",
          },
          {
            key: "short_term_mission",
            title: "Quelle est ta mission à court terme ?",
            subtitle: "Ce que tu veux atteindre dans un horizon proche.",
          },
          {
            key: "mid_term_ambition",
            title: "Quelle est ton ambition à moyen terme ?",
            subtitle: "Ce vers quoi tu veux évoluer ensuite.",
          },
          {
            key: "long_term_goal",
            title: "Quel est ton but à long terme ?",
            subtitle: "La direction professionnelle que tu veux construire.",
          },
          {
            key: "preferred_coaching_style",
            title: "Quel style de coaching préfères-tu ?",
            subtitle: "Nous adapterons le ton et l’approche du coach.",
          },
        ],
      };
    }

    return {
      badge: "Onboarding",
      loading: "Preparing your onboarding...",
      loadingErrorTitle: "We could not prepare your onboarding",
      loadingErrorBody:
        "We were unable to load your starting profile. Please try again to continue.",
      retry: "Try again",
      back: "Back",
      next: "Continue",
      finish: "Finish onboarding",
      saving: "Saving...",
      stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
      saveError: "Failed to save onboarding.",
      welcomeHint:
        "These details will help personalize your coach from your very first sessions.",
      steps: [
        {
          key: "welcome",
          title: `Welcome ${firstName || ""}`.trim(),
          subtitle:
            "Let’s capture a few key details to personalize your coaching.",
        },
        {
          key: "current_role",
          title: "What is your current role?",
          subtitle: "Describe your current function in a simple way.",
        },
        {
          key: "industry",
          title: "Which industry do you work in?",
          subtitle: "This helps the coach understand your environment.",
        },
        {
          key: "main_challenge",
          title: "What is your main challenge right now?",
          subtitle: "Share what feels most blocking today.",
        },
        {
          key: "short_term_mission",
          title: "What is your short-term mission?",
          subtitle: "What you want to achieve in the near term.",
        },
        {
          key: "mid_term_ambition",
          title: "What is your mid-term ambition?",
          subtitle: "What you want to grow into next.",
        },
        {
          key: "long_term_goal",
          title: "What is your long-term goal?",
          subtitle: "The professional direction you want to build.",
        },
        {
          key: "preferred_coaching_style",
          title: "What coaching style do you prefer?",
          subtitle: "We will adapt the tone and approach of your coach.",
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
      setUiLanguage(
        resolveUiLanguage({
          language: me.language,
          locale: me.locale,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your profile.");
    } finally {
      setLoadingProfile(false);
    }
  }

  function renderHorizonBlock(
    horizonKey: "short_term_mission" | "mid_term_ambition" | "long_term_goal",
  ) {
    const value = form[horizonKey];

    return (
      <div className="stack" style={{ gap: 14 }}>
        <input
          className="input"
          value={value.target_role}
          onChange={(e) => updateHorizon(horizonKey, "target_role", e.target.value)}
          placeholder={uiLanguage === "fr" ? "Fonction cible" : "Target role"}
          autoFocus
        />

        <input
          className="input"
          value={value.target_compensation}
          onChange={(e) => updateHorizon(horizonKey, "target_compensation", e.target.value)}
          placeholder={
            uiLanguage === "fr"
              ? "Rémunération cible (optionnel)"
              : "Target compensation (optional)"
          }
        />

        <div className="grid grid-3">
          {LEVELS.map((level) => {
            const selected = value.target_level === level;
            return (
              <button
                key={level}
                type="button"
                className="card"
                onClick={() => updateHorizon(horizonKey, "target_level", level)}
                style={{
                  textAlign: "center",
                  border: selected ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: selected ? "var(--primary-soft)" : undefined,
                  cursor: "pointer",
                }}
              >
                <div className="section-title" style={{ margin: 0 }}>
                  {level}
                </div>
              </button>
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
          <div className="card-soft">
            <div className="stack">
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <SparkIcon />
                <div className="section-title" style={{ margin: 0 }}>
                  {uiLanguage === "fr"
                    ? "Un coaching plus pertinent dès le départ"
                    : "More relevant coaching from day one"}
                </div>
              </div>
              <div className="muted">{copy.welcomeHint}</div>
            </div>
          </div>
        );

      case "current_role":
        return (
          <input
            className="input"
            value={form.current_role}
            onChange={(e) => updateField("current_role", e.target.value)}
            placeholder={
              uiLanguage === "fr"
                ? "Ex. Business Analyst, Product Manager"
                : "e.g. Business Analyst, Product Manager"
            }
            autoFocus
          />
        );

      case "industry":
        return (
          <input
            className="input"
            value={form.industry}
            onChange={(e) => updateField("industry", e.target.value)}
            placeholder={
              uiLanguage === "fr"
                ? "Ex. Banque, Tech, Santé"
                : "e.g. Banking, Tech, Healthcare"
            }
            autoFocus
          />
        );

      case "main_challenge":
        return (
          <textarea
            className="textarea"
            value={form.main_challenge}
            onChange={(e) => updateField("main_challenge", e.target.value)}
            rows={4}
            placeholder={
              uiLanguage === "fr"
                ? "Ex. J’ai du mal à prioriser et je me sens surchargée"
                : "e.g. I struggle with prioritization and feel overloaded"
            }
            autoFocus
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
            {(uiLanguage === "fr" ? COACHING_STYLE_OPTIONS_FR : COACHING_STYLE_OPTIONS_EN).map(
              (option) => {
                const selected = form.preferred_coaching_style === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className="card"
                    onClick={() => updateField("preferred_coaching_style", option)}
                    style={{
                      textAlign: "left",
                      border: selected ? "2px solid var(--primary)" : "1px solid var(--border)",
                      background: selected ? "var(--primary-soft)" : undefined,
                      cursor: "pointer",
                    }}
                  >
                    <div className="row" style={{ gap: 8, alignItems: "center" }}>
                      <BrainIcon size={16} />
                      <div
                        className="section-title"
                        style={{ textTransform: "capitalize", margin: 0 }}
                      >
                        {option}
                      </div>
                    </div>
                  </button>
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
      <main className="page">
        <div className="page-wrap" style={{ maxWidth: 760 }}>
          <div className="card">{copy.loading}</div>
        </div>
      </main>
    );
  }

  if (error && !firstName && stepIndex === 0) {
    return (
      <main className="page">
        <div className="page-wrap" style={{ maxWidth: 760 }}>
          <div className="card stack">
            <div className="section-title" style={{ color: "var(--danger)" }}>
              {copy.loadingErrorTitle}
            </div>
            <div className="muted">{copy.loadingErrorBody}</div>
            <div className="card-soft" style={{ color: "var(--danger)" }}>
              {error}
            </div>
            <div className="row">
              <button className="button" onClick={() => void handleRetryProfileLoad()}>
                {copy.retry}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-wrap" style={{ maxWidth: 760 }}>
        <div className="card stack">
          <div className="row space-between" style={{ alignItems: "center" }}>
            <BadgePill icon={<PathIcon size={14} />}>{copy.badge}</BadgePill>
            <div className="muted">{copy.stepLabel(stepIndex + 1, totalSteps)}</div>
          </div>

          <div
            style={{
              width: "100%",
              height: 8,
              background: "var(--border)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "var(--primary)",
                transition: "width 220ms ease",
              }}
            />
          </div>
        </div>

        <div className="card stack" style={{ minHeight: 420, justifyContent: "space-between" }}>
          <div className="stack" style={{ gap: 20 }}>
            <div className="stack" style={{ gap: 8 }}>
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <TargetIcon />
                <h1 className="title" style={{ margin: 0 }}>
                  {currentStep.title}
                </h1>
              </div>
              <p className="subtitle" style={{ margin: 0 }}>
                {currentStep.subtitle}
              </p>
            </div>

            {renderStepContent()}
          </div>

          <div className="stack" style={{ gap: 12 }}>
            {error && <div style={{ color: "var(--danger)" }}>{error}</div>}

            <div className="row space-between" style={{ gap: 12 }}>
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
                onClick={handleNext}
                disabled={!canContinue() || saving}
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
      </div>
    </main>
  );
}