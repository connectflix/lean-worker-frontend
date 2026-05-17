"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { completeOnboarding, getMe } from "@/lib/api";
import { resolveUiLanguage, type SupportedUiLanguage } from "@/lib/user-locales";
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
const COACHING_STYLE_OPTIONS_EN = ["empathic", "direct", "structured", "motivational"];
const COACHING_STYLE_OPTIONS_FR = ["empathique", "direct", "structuré", "motivant"];

function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(255,122,89,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(88,180,174,0.14), transparent 32%), var(--coach-bg)",
        padding: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1040,
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
        gap: 18,
        borderRadius: 32,
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
        borderRadius: 24,
        border: selected
          ? "2px solid var(--coach-accent)"
          : "1px solid rgba(43,33,24,0.08)",
        background: selected
          ? "linear-gradient(135deg, rgba(255,122,89,0.14), rgba(255,255,255,0.86))"
          : "rgba(255,255,255,0.74)",
        boxShadow: selected
          ? "0 16px 36px rgba(255,122,89,0.12)"
          : "0 10px 28px rgba(43,33,24,0.04)",
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
        progress: "Progression",
        calmSetup: "Configuration calme",
        personalizedCoach: "Coach personnalisé",
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
      progress: "Progress",
      calmSetup: "Calm setup",
      personalizedCoach: "Personalized coach",
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
      <div className="stack" style={{ gap: 16 }}>
        <input
          className="input"
          value={value.target_role}
          onChange={(event) => updateHorizon(horizonKey, "target_role", event.target.value)}
          placeholder={uiLanguage === "fr" ? "Fonction cible" : "Target role"}
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
          placeholder={
            uiLanguage === "fr"
              ? "Rémunération cible (optionnel)"
              : "Target compensation (optional)"
          }
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
                    {level}
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
                {uiLanguage === "fr"
                  ? "Un coaching plus pertinent dès le départ"
                  : "More relevant coaching from day one"}
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
            placeholder={
              uiLanguage === "fr"
                ? "Ex. Business Analyst, Product Manager"
                : "e.g. Business Analyst, Product Manager"
            }
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
            placeholder={
              uiLanguage === "fr"
                ? "Ex. Banque, Tech, Santé"
                : "e.g. Banking, Tech, Healthcare"
            }
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
            placeholder={
              uiLanguage === "fr"
                ? "Ex. J’ai du mal à prioriser et je me sens surchargée"
                : "e.g. I struggle with prioritization and feel overloaded"
            }
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
            {(uiLanguage === "fr" ? COACHING_STYLE_OPTIONS_FR : COACHING_STYLE_OPTIONS_EN).map(
              (option) => {
                const selected = form.preferred_coaching_style === option;

                return (
                  <SelectableCard
                    key={option}
                    selected={selected}
                    onClick={() => updateField("preferred_coaching_style", option)}
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
                        {option}
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
      <OnboardingShell>
        <CoachPanel warm>
          <div className="row" style={{ gap: 12, alignItems: "center" }}>
            <div className="loader" />
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">{copy.loading}</div>
              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {uiLanguage === "fr"
                  ? "Nous préparons ton espace personnel."
                  : "We are preparing your personal workspace."}
              </div>
            </div>
          </div>
        </CoachPanel>
      </OnboardingShell>
    );
  }

  if (error && !firstName && stepIndex === 0) {
    return (
      <OnboardingShell>
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
    <OnboardingShell>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "minmax(260px, 0.72fr) minmax(0, 1.28fr)",
          gap: 22,
          alignItems: "stretch",
        }}
      >
        <CoachPanel warm>
          <div className="stack" style={{ gap: 18 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <BadgePill icon={<PathIcon size={14} />}>{copy.badge}</BadgePill>
              <BadgePill icon={<SparkIcon size={14} />}>{copy.calmSetup}</BadgePill>
            </div>

            <div
              style={{
                fontSize: 38,
                lineHeight: 1.04,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Construisons ton point de départ."
                : "Let’s build your starting point."}
            </div>

            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                lineHeight: 1.7,
              }}
            >
              {uiLanguage === "fr"
                ? "Quelques réponses suffisent pour rendre ton coaching plus précis, plus humain et plus actionnable."
                : "A few answers are enough to make your coaching sharper, more human, and more actionable."}
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
              gap: 24,
              minHeight: 560,
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