"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { useCurrentUser } from "@/components/user-context";
import { getProfile, updateProfile } from "@/lib/api";
import { useUiLanguage } from "@/lib/use-ui-language";
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
  { value: "organization", fr: "Organisation", en: "Organization" },
  { value: "prioritization", fr: "Priorisation", en: "Prioritization" },
  { value: "confidence", fr: "Confiance", en: "Confidence" },
  { value: "stress management", fr: "Gestion du stress", en: "Stress management" },
  { value: "communication", fr: "Communication", en: "Communication" },
  { value: "career growth", fr: "Évolution de carrière", en: "Career growth" },
] as const;

const COACHING_STYLE_OPTIONS = [
  { value: "empathic", fr: "Empathique", en: "Empathic" },
  { value: "direct", fr: "Direct", en: "Direct" },
  { value: "structured", fr: "Structuré", en: "Structured" },
  { value: "motivational", fr: "Motivant", en: "Motivational" },
] as const;

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
        gap: 16,
        borderRadius: 26,
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
        borderRadius: 20,
        border: selected
          ? "2px solid var(--coach-accent)"
          : "1px solid rgba(43,33,24,0.08)",
        background: selected
          ? "linear-gradient(135deg, rgba(255,122,89,0.14), rgba(255,255,255,0.88))"
          : "rgba(255,255,255,0.72)",
        boxShadow: selected
          ? "0 12px 28px rgba(255,122,89,0.10)"
          : "0 6px 18px rgba(43,33,24,0.035)",
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
  const { uiLanguage } = useUiLanguage("fr");
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
      setLoadError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible de charger le profil."
            : "Failed to load profile.",
      );
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, [uiLanguage]);

  const firstName = user?.given_name || user?.display_name || null;

  const copy = useMemo(() => {
    if (uiLanguage === "fr") {
      return {
        shellTitle: "Profil",
        heroTitle: firstName
          ? `${firstName}, mets ton profil à jour.`
          : "Mets ton profil à jour.",
        heroSubtitle:
          "Actualise uniquement les éléments qui ont changé pour garder un coaching pertinent.",
        contextUpdate: "Mise à jour du profil",
        activeProfile: "Profil actif",
        coachCalibration: "Coach personnalisé",
        stepLabel: (current: number, total: number) => `Étape ${current} sur ${total}`,
        progress: "Progression",
        currentSnapshot: "Informations du profil",
        currentSnapshotText:
          "Vérifie chaque rubrique et ajuste ce qui ne correspond plus à ta situation actuelle.",
        contextImpact:
          "Ces informations seront utilisées dans les prochaines sessions pour adapter les questions et recommandations.",
        loading: "Chargement du profil...",
        loadingBody: "Nous récupérons tes informations actuelles.",
        loadingErrorTitle: "Impossible de charger le profil",
        retry: "Réessayer",
        backToDashboard: "Retour au tableau de bord",
        save: "Enregistrer les modifications",
        saving: "Enregistrement...",
        continue: "Continuer",
        back: "Retour",
        placeholders: {
          currentRole: "Ex. Senior Business Analyst",
          industry: "Ex. Banque, technologie, santé",
          primaryGoal: "Décris ton objectif principal actuel.",
          mainChallenge: "Décris ce qui te freine ou te préoccupe le plus.",
        },
        steps: [
          {
            key: "current_role",
            title: "Rôle actuel",
            subtitle: "Quelle est ta fonction ou ton activité principale aujourd’hui ?",
          },
          {
            key: "industry",
            title: "Secteur",
            subtitle: "Dans quel environnement professionnel évolues-tu actuellement ?",
          },
          {
            key: "primary_goal",
            title: "Objectif principal",
            subtitle: "Quel résultat souhaites-tu atteindre en priorité ?",
          },
          {
            key: "main_challenge",
            title: "Défi principal",
            subtitle: "Quel obstacle ou sujet mérite le plus d’attention aujourd’hui ?",
          },
          {
            key: "improvement_focus",
            title: "Axe de progression",
            subtitle: "Sur quel domaine souhaites-tu progresser en priorité ?",
          },
          {
            key: "preferred_coaching_style",
            title: "Style de coaching",
            subtitle: "Comment souhaites-tu être accompagné par le coach ?",
          },
        ],
      };
    }

    return {
      shellTitle: "Profile",
      heroTitle: firstName
        ? `${firstName}, update your profile.`
        : "Update your profile.",
      heroSubtitle:
        "Update only what has changed to keep your coaching relevant.",
      contextUpdate: "Profile update",
      activeProfile: "Active profile",
      coachCalibration: "Personalized coach",
      stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
      progress: "Progress",
      currentSnapshot: "Profile information",
      currentSnapshotText:
        "Review each section and adjust anything that no longer reflects your current situation.",
      contextImpact:
        "This information will be used in future sessions to tailor questions and recommendations.",
      loading: "Loading profile...",
      loadingBody: "We are retrieving your current information.",
      loadingErrorTitle: "Unable to load profile",
      retry: "Try again",
      backToDashboard: "Back to dashboard",
      save: "Save changes",
      saving: "Saving...",
      continue: "Continue",
      back: "Back",
      placeholders: {
        currentRole: "e.g. Senior Business Analyst",
        industry: "e.g. Banking, technology, healthcare",
        primaryGoal: "Describe your current main goal.",
        mainChallenge: "Describe what is holding you back or concerning you most.",
      },
      steps: [
        {
          key: "current_role",
          title: "Current role",
          subtitle: "What is your main role or professional activity today?",
        },
        {
          key: "industry",
          title: "Industry",
          subtitle: "Which professional environment do you currently work in?",
        },
        {
          key: "primary_goal",
          title: "Main goal",
          subtitle: "What result do you want to prioritize?",
        },
        {
          key: "main_challenge",
          title: "Main challenge",
          subtitle: "Which obstacle or issue needs the most attention today?",
        },
        {
          key: "improvement_focus",
          title: "Development focus",
          subtitle: "Which area do you want to improve first?",
        },
        {
          key: "preferred_coaching_style",
          title: "Coaching style",
          subtitle: "How would you like the coach to support you?",
        },
      ],
    };
  }, [uiLanguage, firstName]);

  const steps = copy.steps;
  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

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
      setError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible de mettre à jour le profil."
            : "Failed to update profile.",
      );
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
          minHeight: 52,
          borderRadius: 18,
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
          minHeight: 160,
          borderRadius: 18,
          borderColor: "rgba(43,33,24,0.10)",
          background: "rgba(255,255,255,0.82)",
          lineHeight: 1.7,
          fontSize: 15,
        }}
      />
    );
  }

  function renderChoiceGrid(
    options: readonly { value: string; fr: string; en: string }[],
    field: "improvement_focus" | "preferred_coaching_style",
  ) {
    return (
      <div className="grid grid-2">
        {options.map((option) => (
          <CoachChoiceCard
            key={option.value}
            label={option[uiLanguage]}
            selected={form[field] === option.value}
            onClick={() => updateField(field, option.value)}
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
          copy.placeholders.currentRole,
        );

      case "industry":
        return renderTextInput(
          form.industry,
          (value) => updateField("industry", value),
          copy.placeholders.industry,
        );

      case "primary_goal":
        return renderTextArea(
          form.primary_goal,
          (value) => updateField("primary_goal", value),
          copy.placeholders.primaryGoal,
        );

      case "main_challenge":
        return renderTextArea(
          form.main_challenge,
          (value) => updateField("main_challenge", value),
          copy.placeholders.mainChallenge,
        );

      case "improvement_focus":
        return renderChoiceGrid(IMPROVEMENT_OPTIONS, "improvement_focus");

      case "preferred_coaching_style":
        return renderChoiceGrid(COACHING_STYLE_OPTIONS, "preferred_coaching_style");

      default:
        return null;
    }
  }

  if (loadingProfile) {
    return (
      <main
        className="page"
        lang={uiLanguage}
        translate="no"
        suppressHydrationWarning
        style={{
          minHeight: "100vh",
          background: "var(--coach-bg)",
          padding: "clamp(16px, 3vw, 24px)",
        }}
      >
        <div className="page-wrap">
          <CoachSectionCard warm>
            <div className="row" style={{ gap: 12, alignItems: "center" }}>
              <div className="loader" />

              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">{copy.loading}</div>
                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {copy.loadingBody}
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
      <AppShell uiLanguage={uiLanguage} title={copy.shellTitle}>
        <CoachSectionCard>
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {copy.loadingErrorTitle}
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
              {copy.retry}
            </button>

            <button
              className="button ghost"
              onClick={() => router.push("/dashboard")}
              type="button"
            >
              {copy.backToDashboard}
            </button>
          </div>
        </CoachSectionCard>
      </AppShell>
    );
  }

  return (
    <AppShell uiLanguage={uiLanguage} title={copy.shellTitle}>
      <div className="stack" style={{ gap: 16 }}>
        <div
          className="card stack"
          style={{
            gap: 18,
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
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
                {copy.contextUpdate}
              </BadgePill>

              <BadgePill icon={<SparkIcon size={14} />}>
                {copy.activeProfile}
              </BadgePill>

              <BadgePill icon={<BrainIcon size={14} />}>
                {copy.coachCalibration}
              </BadgePill>
            </div>

            <div
              style={{
                maxWidth: 900,
                fontSize: "clamp(34px, 5vw, 44px)",
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {copy.heroTitle}
            </div>

            <p
              className="subtitle"
              style={{
                maxWidth: 700,
                color: "var(--coach-muted)",
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              {copy.heroSubtitle}
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
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div className="stack" style={{ gap: 18 }}>
            <CoachSectionCard>
              <div className="section-title">{copy.currentSnapshot}</div>

              <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
                {copy.currentSnapshotText}
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
                  {copy.stepLabel(stepIndex + 1, totalSteps)}
                </BadgePill>

                <BadgePill icon={<TargetIcon size={14} />}>
                  {copy.progress} {progress}%
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
                gap: 20,
                minHeight: 500,
                justifyContent: "space-between",
              }}
            >
              <div className="stack" style={{ gap: 18 }}>
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <BadgePill icon={<SparkIcon size={14} />}>
                      {copy.stepLabel(stepIndex + 1, totalSteps)}
                    </BadgePill>

                    <BadgePill icon={<TargetIcon size={14} />}>
                      {progress}%
                    </BadgePill>
                  </div>

                  <div
                    style={{
                      fontSize: 31,
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
                        ? copy.save
                        : copy.continue}
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