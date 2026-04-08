"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { useCurrentUser } from "@/components/user-context";
import { getProfile, updateProfile } from "@/lib/api";
import { getUiCopy } from "@/lib/ui-copy";
import { resolveUiLanguage, type SupportedUiLanguage } from "@/lib/user-locales";
import {
  BadgePill,
  BrainIcon,
  PathIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type FormState = {
  current_role: string;
  industry: string;
  primary_goal: string;
  main_challenge: string;
  improvement_focus: string;
  preferred_coaching_style: string;
};

const IMPROVEMENT_OPTIONS = [
  "organization",
  "prioritization",
  "confidence",
  "stress management",
  "communication",
  "career growth",
];

const IMPROVEMENT_OPTIONS_FR = [
  "organisation",
  "priorisation",
  "confiance",
  "gestion du stress",
  "communication",
  "évolution de carrière",
];

const COACHING_STYLE_OPTIONS = [
  "empathic",
  "direct",
  "structured",
  "motivational",
];

const COACHING_STYLE_OPTIONS_FR = [
  "empathique",
  "direct",
  "structuré",
  "motivant",
];

export default function ProfileUpdateContextPage() {
  return (
    <AuthGuard>
      <ProfileUpdateContextContent />
    </AuthGuard>
  );
}

function ProfileUpdateContextContent() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const [uiLanguage, setUiLanguage] = useState<SupportedUiLanguage>("en");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    current_role: "",
    industry: "",
    primary_goal: "",
    main_challenge: "",
    improvement_focus: "",
    preferred_coaching_style: "",
  });

  useEffect(() => {
    setUiLanguage(
      resolveUiLanguage({
        language: user?.language,
        locale: user?.locale,
      }),
    );
  }, [user]);

  async function loadProfile() {
    try {
      setLoadError(null);

      const profile = await getProfile();

      setForm({
        current_role: profile.current_role || "",
        industry: profile.industry || "",
        primary_goal: profile.primary_goal || "",
        main_challenge: profile.main_challenge || "",
        improvement_focus: profile.improvement_focus || "",
        preferred_coaching_style: profile.preferred_coaching_style || "",
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  const copy = getUiCopy(uiLanguage);

  const steps = useMemo(
    () => [
      {
        key: "current_role",
        title:
          uiLanguage === "fr"
            ? "Ton rôle actuel a-t-il changé ?"
            : "Has your current role changed?",
        subtitle:
          uiLanguage === "fr"
            ? "Mets à jour ta fonction actuelle si nécessaire."
            : "Update your current role if needed.",
      },
      {
        key: "industry",
        title:
          uiLanguage === "fr"
            ? "Ton secteur a-t-il changé ?"
            : "Has your industry changed?",
        subtitle:
          uiLanguage === "fr"
            ? "Cela aide le coach à rester pertinent."
            : "This helps your coach stay relevant.",
      },
      {
        key: "primary_goal",
        title:
          uiLanguage === "fr"
            ? "Quel est ton objectif principal maintenant ?"
            : "What is your main goal now?",
        subtitle:
          uiLanguage === "fr"
            ? "Ton objectif peut évoluer avec ton contexte."
            : "Your goal may evolve with your context.",
      },
      {
        key: "main_challenge",
        title:
          uiLanguage === "fr"
            ? "Quel est ton principal défi actuellement ?"
            : "What is your main challenge right now?",
        subtitle:
          uiLanguage === "fr"
            ? "Partage ce qui te semble le plus bloquant."
            : "Share what feels most blocking right now.",
      },
      {
        key: "improvement_focus",
        title:
          uiLanguage === "fr"
            ? "Sur quoi veux-tu progresser en priorité ?"
            : "What do you want to improve the most?",
        subtitle:
          uiLanguage === "fr"
            ? "Choisis l’axe le plus important aujourd’hui."
            : "Choose the area that matters most today.",
      },
      {
        key: "preferred_coaching_style",
        title:
          uiLanguage === "fr"
            ? "Ton style de coaching préféré a-t-il changé ?"
            : "Has your preferred coaching style changed?",
        subtitle:
          uiLanguage === "fr"
            ? "Nous ajusterons le ton du coach en conséquence."
            : "We will adapt the coach’s tone accordingly.",
      },
    ],
    [uiLanguage],
  );

  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function canContinue(): boolean {
    switch (currentStep.key) {
      case "current_role":
        return form.current_role.trim().length > 1;
      case "industry":
        return form.industry.trim().length > 1;
      case "primary_goal":
        return form.primary_goal.trim().length > 3;
      case "main_challenge":
        return form.main_challenge.trim().length > 3;
      case "improvement_focus":
        return !!form.improvement_focus;
      case "preferred_coaching_style":
        return !!form.preferred_coaching_style;
      default:
        return false;
    }
  }

  async function handleNext() {
    if (!canContinue() || saving) return;

    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateProfile(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (stepIndex === 0 || saving) return;
    setError(null);
    setStepIndex((prev) => prev - 1);
  }

  function renderChoiceGrid(
    options: string[],
    field: "improvement_focus" | "preferred_coaching_style",
  ) {
    return (
      <div className="grid grid-2">
        {options.map((option) => {
          const selected = form[field] === option;

          return (
            <button
              key={option}
              type="button"
              className="card"
              onClick={() => updateField(field, option)}
              style={{
                textAlign: "left",
                border: selected ? "2px solid var(--primary)" : "1px solid var(--border)",
                background: selected ? "var(--primary-soft)" : undefined,
                cursor: "pointer",
              }}
            >
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <BrainIcon size={16} />
                <div className="section-title" style={{ textTransform: "capitalize", margin: 0 }}>
                  {option}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  function renderStepContent() {
    switch (currentStep.key) {
      case "current_role":
        return (
          <input
            className="input"
            value={form.current_role}
            onChange={(e) => updateField("current_role", e.target.value)}
            placeholder={
              uiLanguage === "fr"
                ? "Ex. Senior Business Analyst"
                : "e.g. Senior Business Analyst"
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

      case "primary_goal":
        return (
          <textarea
            className="textarea"
            value={form.primary_goal}
            onChange={(e) => updateField("primary_goal", e.target.value)}
            rows={4}
            autoFocus
            placeholder={
              uiLanguage === "fr"
                ? "Décris ton objectif principal actuel"
                : "Describe your current primary goal"
            }
          />
        );

      case "main_challenge":
        return (
          <textarea
            className="textarea"
            value={form.main_challenge}
            onChange={(e) => updateField("main_challenge", e.target.value)}
            rows={4}
            autoFocus
            placeholder={
              uiLanguage === "fr"
                ? "Décris ce qui te bloque le plus actuellement"
                : "Describe what feels most blocking right now"
            }
          />
        );

      case "improvement_focus":
        return renderChoiceGrid(
          uiLanguage === "fr" ? IMPROVEMENT_OPTIONS_FR : IMPROVEMENT_OPTIONS,
          "improvement_focus",
        );

      case "preferred_coaching_style":
        return renderChoiceGrid(
          uiLanguage === "fr" ? COACHING_STYLE_OPTIONS_FR : COACHING_STYLE_OPTIONS,
          "preferred_coaching_style",
        );

      default:
        return null;
    }
  }

  if (loadingProfile) {
    return (
      <main className="page">
        <div className="page-wrap">
          <div className="card">{copy.common.loading}</div>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <AppShell
        uiLanguage={uiLanguage}
        title={uiLanguage === "fr" ? "Mise à jour du contexte" : "Context update"}
      >
        <div className="card stack">
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {uiLanguage === "fr"
              ? "Impossible de charger ton contexte actuel"
              : "Unable to load your current context"}
          </div>
          <div className="muted">{loadError}</div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button
              className="button"
              onClick={() => {
                setLoadingProfile(true);
                void loadProfile();
              }}
            >
              {uiLanguage === "fr" ? "Réessayer" : "Try again"}
            </button>
            <button className="button ghost" onClick={() => router.push("/dashboard")}>
              {uiLanguage === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Mise à jour du contexte" : "Context update"}
    >
      <div className="card stack">
        <div className="row space-between" style={{ alignItems: "center" }}>
          <BadgePill icon={<PathIcon size={14} />}>
            {uiLanguage === "fr" ? "Mise à jour du contexte" : "Context update"}
          </BadgePill>
          <div className="muted">
            {uiLanguage === "fr"
              ? `Étape ${stepIndex + 1} sur ${totalSteps}`
              : `Step ${stepIndex + 1} of ${totalSteps}`}
          </div>
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
              {user?.given_name || user?.display_name
                ? `${user?.given_name || user?.display_name}, ${currentStep.subtitle}`
                : currentStep.subtitle}
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
              {copy.common.back}
            </button>

            <button
              className="button"
              type="button"
              onClick={handleNext}
              disabled={!canContinue() || saving}
            >
              {saving
                ? uiLanguage === "fr"
                  ? "Enregistrement..."
                  : "Saving..."
                : stepIndex === totalSteps - 1
                  ? uiLanguage === "fr"
                    ? "Mettre à jour mon profil"
                    : "Update my profile"
                  : copy.common.continue}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}