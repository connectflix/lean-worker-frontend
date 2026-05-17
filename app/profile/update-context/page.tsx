"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { useCurrentUser } from "@/components/user-context";
import { getProfile, updateProfile } from "@/lib/api";
import { resolveUiLanguage, type SupportedUiLanguage } from "@/lib/user-locales";
import {
  BadgePill,
  BrainIcon,
  CheckCircleIcon,
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

function CoachSectionCard({
  children,
  warm = false,
}: {
  children: ReactNode;
  warm?: boolean;
}) {
  return (
    <div
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
    </div>
  );
}

function CoachChoiceCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
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
          ? "linear-gradient(135deg, rgba(255,122,89,0.14), rgba(255,255,255,0.88))"
          : "rgba(255,255,255,0.72)",
        boxShadow: selected
          ? "0 14px 34px rgba(255,122,89,0.12)"
          : "0 8px 24px rgba(43,33,24,0.04)",
      }}
    >
      <div className="row" style={{ gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            color: selected ? "var(--coach-accent)" : "var(--coach-muted)",
            background: selected
              ? "rgba(255,122,89,0.13)"
              : "rgba(43,33,24,0.05)",
          }}
        >
          {selected ? <CheckCircleIcon size={16} /> : <BrainIcon size={16} />}
        </div>

        <div
          className="section-title"
          style={{
            margin: 0,
            fontSize: 15,
            textTransform: "capitalize",
            color: "var(--coach-ink)",
          }}
        >
          {label}
        </div>
      </div>
    </button>
  );
}

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

  const firstName = user?.given_name || user?.display_name || null;

  const labels = useMemo(() => {
    if (uiLanguage === "fr") {
      return {
        shellTitle: "Mise à jour du contexte",
        heroTitle: firstName
          ? `${firstName}, ajustons ton contexte professionnel.`
          : "Ajustons ton contexte professionnel.",
        heroSubtitle:
          "Ces informations permettent au coach de rester aligné avec ta réalité actuelle, tes priorités et ton style préféré.",
        contextUpdate: "Mise à jour du contexte",
        activeProfile: "Profil actif",
        coachCalibration: "Calibration coach",
        stepLabel: (current: number, total: number) => `Étape ${current} sur ${total}`,
        progress: "Progression",
        currentSnapshot: "Contexte actuel",
        currentSnapshotText:
          "Relis chaque point et corrige uniquement ce qui a changé. Le coach utilisera ce contexte dans les prochaines sessions.",
        loading: "Chargement du contexte...",
        loadingBody: "Nous récupérons ton profil actuel.",
        loadingErrorTitle: "Impossible de charger ton contexte actuel",
        retry: "Réessayer",
        backToDashboard: "Retour au tableau de bord",
        save: "Mettre à jour mon profil",
        saving: "Enregistrement...",
        continue: "Continuer",
        back: "Retour",
      };
    }

    return {
      shellTitle: "Context update",
      heroTitle: firstName
        ? `${firstName}, let’s tune your professional context.`
        : "Let’s tune your professional context.",
      heroSubtitle:
        "These details help your coach stay aligned with your current reality, priorities, and preferred coaching style.",
      contextUpdate: "Context update",
      activeProfile: "Active profile",
      coachCalibration: "Coach calibration",
      stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
      progress: "Progress",
      currentSnapshot: "Current context",
      currentSnapshotText:
        "Review each point and adjust only what has changed. Your coach will use this context in the next sessions.",
      loading: "Loading context...",
      loadingBody: "We are retrieving your current profile.",
      loadingErrorTitle: "Unable to load your current context",
      retry: "Try again",
      backToDashboard: "Back to dashboard",
      save: "Update my profile",
      saving: "Saving...",
      continue: "Continue",
      back: "Back",
    };
  }, [uiLanguage, firstName]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setError(null);
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

  function renderTextInput(
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
  ) {
    return (
      <input
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus
        style={{
          minHeight: 56,
          borderRadius: 20,
          borderColor: "rgba(43,33,24,0.10)",
          background: "rgba(255,255,255,0.82)",
          fontSize: 15,
        }}
      />
    );
  }

  function renderTextArea(
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
  ) {
    return (
      <textarea
        className="textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        autoFocus
        placeholder={placeholder}
        style={{
          minHeight: 180,
          borderRadius: 22,
          borderColor: "rgba(43,33,24,0.10)",
          background: "rgba(255,255,255,0.82)",
          lineHeight: 1.7,
          fontSize: 15,
        }}
      />
    );
  }

  function renderChoiceGrid(
    options: string[],
    field: "improvement_focus" | "preferred_coaching_style",
  ) {
    return (
      <div className="grid grid-2">
        {options.map((option) => (
          <CoachChoiceCard
            key={option}
            label={option}
            selected={form[field] === option}
            onClick={() => updateField(field, option)}
          />
        ))}
      </div>
    );
  }

  function renderStepContent() {
    switch (currentStep.key) {
      case "current_role":
        return renderTextInput(
          form.current_role,
          (value) => updateField("current_role", value),
          uiLanguage === "fr"
            ? "Ex. Senior Business Analyst"
            : "e.g. Senior Business Analyst",
        );

      case "industry":
        return renderTextInput(
          form.industry,
          (value) => updateField("industry", value),
          uiLanguage === "fr"
            ? "Ex. Banque, Tech, Santé"
            : "e.g. Banking, Tech, Healthcare",
        );

      case "primary_goal":
        return renderTextArea(
          form.primary_goal,
          (value) => updateField("primary_goal", value),
          uiLanguage === "fr"
            ? "Décris ton objectif principal actuel"
            : "Describe your current primary goal",
        );

      case "main_challenge":
        return renderTextArea(
          form.main_challenge,
          (value) => updateField("main_challenge", value),
          uiLanguage === "fr"
            ? "Décris ce qui te bloque le plus actuellement"
            : "Describe what feels most blocking right now",
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
      <main
        className="page"
        style={{
          minHeight: "100vh",
          background: "var(--coach-bg)",
          padding: 24,
        }}
      >
        <div className="page-wrap">
          <CoachSectionCard warm>
            <div className="row" style={{ gap: 12, alignItems: "center" }}>
              <div className="loader" />

              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">{labels.loading}</div>
                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {labels.loadingBody}
                </div>
              </div>
            </div>
          </CoachSectionCard>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <AppShell uiLanguage={uiLanguage} title={labels.shellTitle}>
        <CoachSectionCard>
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {labels.loadingErrorTitle}
          </div>

          <div className="muted" style={{ color: "var(--coach-muted)" }}>
            {loadError}
          </div>

          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            <button
              className="button"
              onClick={() => {
                setLoadingProfile(true);
                void loadProfile();
              }}
              style={{ background: "var(--coach-accent)" }}
              type="button"
            >
              {labels.retry}
            </button>

            <button
              className="button ghost"
              onClick={() => router.push("/dashboard")}
              type="button"
            >
              {labels.backToDashboard}
            </button>
          </div>
        </CoachSectionCard>
      </AppShell>
    );
  }

  return (
    <AppShell uiLanguage={uiLanguage} title={labels.shellTitle}>
      <div className="stack" style={{ gap: 18 }}>
        <div
          className="card stack"
          style={{
            gap: 18,
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

          <div className="stack" style={{ gap: 16, position: "relative" }}>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <BadgePill icon={<PathIcon size={14} />}>
                {labels.contextUpdate}
              </BadgePill>

              <BadgePill icon={<SparkIcon size={14} />}>
                {labels.activeProfile}
              </BadgePill>

              <BadgePill icon={<BrainIcon size={14} />}>
                {labels.coachCalibration}
              </BadgePill>
            </div>

            <div
              style={{
                maxWidth: 900,
                fontSize: 44,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {labels.heroTitle}
            </div>

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
          </div>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "minmax(260px, 0.72fr) minmax(0, 1.28fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div className="stack" style={{ gap: 18 }}>
            <CoachSectionCard>
              <div className="section-title">{labels.currentSnapshot}</div>

              <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
                {labels.currentSnapshotText}
              </div>

              <div className="stack" style={{ gap: 8 }}>
                {steps.map((step, index) => {
                  const active = index === stepIndex;
                  const done = index < stepIndex;

                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => setStepIndex(index)}
                      className="row"
                      style={{
                        width: "100%",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 18,
                        border: active
                          ? "1px solid rgba(255,122,89,0.22)"
                          : "1px solid transparent",
                        background: active
                          ? "rgba(255,122,89,0.12)"
                          : done
                            ? "rgba(88,180,174,0.10)"
                            : "transparent",
                        color: active ? "var(--coach-accent)" : "var(--coach-muted)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {done ? <CheckCircleIcon size={15} /> : <TargetIcon size={15} />}

                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: active ? 850 : 650,
                        }}
                      >
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CoachSectionCard>

            <CoachSectionCard warm>
              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                <BadgePill icon={<SparkIcon size={14} />}>
                  {labels.stepLabel(stepIndex + 1, totalSteps)}
                </BadgePill>

                <BadgePill icon={<TargetIcon size={14} />}>
                  {labels.progress} {progress}%
                </BadgePill>
              </div>

              <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
                {uiLanguage === "fr"
                  ? "Une fois mis à jour, ce contexte sera réutilisé par le coach pour ajuster ses questions, ses reformulations et ses recommandations."
                  : "Once updated, this context will be reused by your coach to adjust questions, reflections, and recommendations."}
              </div>
            </CoachSectionCard>
          </div>

          <CoachSectionCard>
            <div
              className="stack"
              style={{
                gap: 24,
                minHeight: 540,
                justifyContent: "space-between",
              }}
            >
              <div className="stack" style={{ gap: 22 }}>
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <BadgePill icon={<SparkIcon size={14} />}>
                      {labels.stepLabel(stepIndex + 1, totalSteps)}
                    </BadgePill>

                    <BadgePill icon={<TargetIcon size={14} />}>
                      {progress}%
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
                    {labels.back}
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
                      ? labels.saving
                      : stepIndex === totalSteps - 1
                        ? labels.save
                        : labels.continue}
                  </button>
                </div>
              </div>
            </div>
          </CoachSectionCard>
        </div>
      </div>
    </AppShell>
  );
}