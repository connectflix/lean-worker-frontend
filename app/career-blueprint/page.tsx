"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import {
  BadgePill,
  ChartIcon,
  CheckCircleIcon,
  PathIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";
import {
  getCareerBlueprint,
  getCareerGap,
  saveCareerBlueprint,
} from "@/lib/api";
import { useUiLanguage } from "@/lib/use-ui-language";

type Level = "Starter" | "Junior" | "Senior" | "Expert" | "Master" | "Elite";

type Horizon = {
  target_compensation: string;
  target_role: string;
  target_level: Level | null;
};

type StartingPoint = {
  my_profession_percent: number;
  my_work_percent: number;
  chore_percent: number;
  destiny_percent: number;
  hobby_percent: number;
};

type FormState = {
  identity_text: string;
  vision_text: string;
  talent_focus_text: string;
  career_focus_text: string;
  inspiration_person: string;
  aspiration_person: string;
  short_term_mission: Horizon;
  mid_term_ambition: Horizon;
  long_term_goal: Horizon;
  starting_point: StartingPoint;
  is_completed: boolean;
};

type CareerGap = {
  current_role?: string | null;
  short_term_role?: string | null;
  short_term_level?: string | null;
  mid_term_role?: string | null;
  mid_term_level?: string | null;
  long_term_role?: string | null;
  long_term_level?: string | null;
  role_gap_short_term: boolean;
  role_gap_mid_term: boolean;
  role_gap_long_term: boolean;
  level_gap_mid_term: boolean;
  level_gap_long_term: boolean;
  profession_percent?: number | null;
  work_percent?: number | null;
  chore_percent?: number | null;
  destiny_percent?: number | null;
  hobby_percent?: number | null;
  key_gap_summary?: string | null;
};

const LEVELS: Level[] = ["Starter", "Junior", "Senior", "Expert", "Master", "Elite"];

const LEVEL_LABELS: Record<Level, { fr: string; en: string }> = {
  Starter: { fr: "Débutant", en: "Starter" },
  Junior: { fr: "Junior", en: "Junior" },
  Senior: { fr: "Senior", en: "Senior" },
  Expert: { fr: "Expert", en: "Expert" },
  Master: { fr: "Maître", en: "Master" },
  Elite: { fr: "Élite", en: "Elite" },
};

const DEFAULT_STARTING_POINT: StartingPoint = {
  my_profession_percent: 20,
  my_work_percent: 20,
  chore_percent: 20,
  destiny_percent: 20,
  hobby_percent: 20,
};

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

function SelectableLevelCard({
  level,
  selected,
  onClick,
  uiLanguage,
}: {
  level: Level;
  selected: boolean;
  onClick: () => void;
  uiLanguage: "fr" | "en";
}) {
  return (
    <button
      type="button"
      className="card stack"
      onClick={onClick}
      style={{
        gap: 8,
        textAlign: "center",
        cursor: "pointer",
        borderRadius: 18,
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
      <div
        className="row"
        style={{
          gap: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {selected ? <CheckCircleIcon size={15} /> : <TargetIcon size={15} />}

        <div
          className="section-title"
          style={{
            margin: 0,
            fontSize: 15,
            color: "var(--coach-ink)",
          }}
        >
          {LEVEL_LABELS[level][uiLanguage]}
        </div>
      </div>
    </button>
  );
}

export default function CareerBlueprintPage() {
  return (
    <AuthGuard>
      <CareerBlueprintContent />
    </AuthGuard>
  );
}

function CareerBlueprintContent() {
  const router = useRouter();
  const { uiLanguage } = useUiLanguage("fr");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [careerGap, setCareerGap] = useState<CareerGap | null>(null);

  const [form, setForm] = useState<FormState>({
    identity_text: "",
    vision_text: "",
    talent_focus_text: "",
    career_focus_text: "",
    inspiration_person: "",
    aspiration_person: "",
    short_term_mission: {
      target_compensation: "",
      target_role: "",
      target_level: null,
    },
    mid_term_ambition: {
      target_compensation: "",
      target_role: "",
      target_level: null,
    },
    long_term_goal: {
      target_compensation: "",
      target_role: "",
      target_level: null,
    },
    starting_point: DEFAULT_STARTING_POINT,
    is_completed: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const [blueprint, gap] = await Promise.all([
          getCareerBlueprint(),
          getCareerGap(),
        ]);

        setCareerGap(gap);

        if (blueprint) {
          setForm({
            identity_text: blueprint.identity_text || "",
            vision_text: blueprint.vision_text || "",
            talent_focus_text: blueprint.talent_focus_text || "",
            career_focus_text: blueprint.career_focus_text || "",
            inspiration_person: blueprint.inspiration_person || "",
            aspiration_person: blueprint.aspiration_person || "",
            short_term_mission: {
              target_compensation: blueprint.short_term_mission?.target_compensation || "",
              target_role: blueprint.short_term_mission?.target_role || "",
              target_level: blueprint.short_term_mission?.target_level ?? null,
            },
            mid_term_ambition: {
              target_compensation: blueprint.mid_term_ambition?.target_compensation || "",
              target_role: blueprint.mid_term_ambition?.target_role || "",
              target_level: blueprint.mid_term_ambition?.target_level ?? null,
            },
            long_term_goal: {
              target_compensation: blueprint.long_term_goal?.target_compensation || "",
              target_role: blueprint.long_term_goal?.target_role || "",
              target_level: blueprint.long_term_goal?.target_level ?? null,
            },
            starting_point: blueprint.starting_point || DEFAULT_STARTING_POINT,
            is_completed: blueprint.is_completed ?? false,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : uiLanguage === "fr"
              ? "Impossible de charger le Career Blueprint."
              : "Failed to load the Career Blueprint.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [uiLanguage]);

  const copy = useMemo(() => {
    if (uiLanguage === "fr") {
      return {
        shellTitle: "Career Blueprint",
        title: "Career Blueprint",
        subtitle:
          "Structure ton point de départ, tes ambitions et la direction qui guidera ton coaching.",
        save: "Enregistrer",
        saving: "Enregistrement...",
        saved: "Career Blueprint enregistré.",
        back: "Retour",
        next: "Continuer",
        finish: "Retour au tableau de bord",
        loading: "Chargement du Career Blueprint...",
        loadingBody: "Nous récupérons ta trajectoire et tes informations enregistrées.",
        progress: "Progression",
        activeBlueprint: "Blueprint actif",
        incompleteBlueprint: "À compléter",
        journey: "Étapes du parcours",
        stepLabel: (current: number, total: number) => `Étape ${current} sur ${total}`,
        noGap: "Aucun écart majeur détecté pour le moment.",
        totalMustBe100: "La répartition doit totaliser 100 %.",
        currentSignals: "Lecture actuelle",
        heroTitle: "Définis la trajectoire qui guidera ton coaching.",
        targetRole: "Fonction ou rôle visé",
        targetCompensation: "Rémunération souhaitée (optionnel)",
        targetLevel: "Niveau visé",
        identityPlaceholder:
          "Décris les principes, valeurs et conditions que tu veux préserver.",
        visionPlaceholder:
          "Décris ce que tu veux accomplir ou rendre possible grâce à ton travail.",
        talentPlaceholder:
          "Quelles compétences, connaissances ou expertises veux-tu développer ?",
        careerPlaceholder:
          "Quels domaines de vocation, de passion ou d’impact veux-tu approfondir ?",
        inspirationPlaceholder: "Personne qui t’inspire aujourd’hui",
        aspirationPlaceholder: "Personne ou modèle que tu souhaites égaler",
        steps: [
          {
            key: "identity",
            title: "Identité",
            subtitle:
              "Quels principes, valeurs et conditions sont essentiels dans ta vie professionnelle ?",
          },
          {
            key: "vision",
            title: "Vision",
            subtitle: "Quelle contribution ou quel accomplissement souhaites-tu construire ?",
          },
          {
            key: "short_term_mission",
            title: "Court terme",
            subtitle: "Quelle priorité souhaites-tu atteindre dans les prochains mois ?",
          },
          {
            key: "mid_term_ambition",
            title: "Moyen terme",
            subtitle: "Quelle évolution importante souhaites-tu engager ensuite ?",
          },
          {
            key: "long_term_goal",
            title: "Long terme",
            subtitle: "Quelle direction professionnelle souhaites-tu construire durablement ?",
          },
          {
            key: "talent_focus",
            title: "Talents",
            subtitle: "Quelles capacités veux-tu renforcer pour progresser ?",
          },
          {
            key: "career_focus",
            title: "Carrière",
            subtitle: "Quels domaines de passion, de vocation ou d’impact veux-tu développer ?",
          },
          {
            key: "starting_point",
            title: "Point de départ",
            subtitle:
              "Comment perçois-tu ton travail aujourd’hui ? Répartis les cinq dimensions sur 100 %.",
          },
          {
            key: "inspiration",
            title: "Inspiration",
            subtitle:
              "Quels modèles nourrissent aujourd’hui ta manière de penser ou d’évoluer ?",
          },
        ],
      };
    }

    return {
      shellTitle: "Career Blueprint",
      title: "Career Blueprint",
      subtitle:
        "Structure your starting point, ambitions, and the direction that will guide your coaching.",
      save: "Save",
      saving: "Saving...",
      saved: "Career Blueprint saved.",
      back: "Back",
      next: "Continue",
      finish: "Back to dashboard",
      loading: "Loading the Career Blueprint...",
      loadingBody: "We are retrieving your trajectory and saved information.",
      progress: "Progress",
      activeBlueprint: "Blueprint active",
      incompleteBlueprint: "To complete",
      journey: "Journey steps",
      stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
      noGap: "No major gap detected for now.",
      totalMustBe100: "The distribution must total 100%.",
      currentSignals: "Current reading",
      heroTitle: "Define the trajectory that will guide your coaching.",
      targetRole: "Target role",
      targetCompensation: "Target compensation (optional)",
      targetLevel: "Target level",
      identityPlaceholder:
        "Describe the principles, values, and conditions you want to preserve.",
      visionPlaceholder:
        "Describe what you want to accomplish or make possible through your work.",
      talentPlaceholder:
        "Which skills, knowledge, or expertise do you want to develop?",
      careerPlaceholder:
        "Which areas of vocation, passion, or impact do you want to deepen?",
      inspirationPlaceholder: "Person who inspires you today",
      aspirationPlaceholder: "Person or role model you would like to emulate",
      steps: [
        {
          key: "identity",
          title: "Identity",
          subtitle:
            "Which principles, values, and conditions are essential in your professional life?",
        },
        {
          key: "vision",
          title: "Vision",
          subtitle: "What contribution or achievement do you want to build?",
        },
        {
          key: "short_term_mission",
          title: "Short term",
          subtitle: "What priority do you want to achieve over the next few months?",
        },
        {
          key: "mid_term_ambition",
          title: "Mid term",
          subtitle: "What important development do you want to pursue next?",
        },
        {
          key: "long_term_goal",
          title: "Long term",
          subtitle: "What professional direction do you want to build over time?",
        },
        {
          key: "talent_focus",
          title: "Talents",
          subtitle: "Which capabilities do you want to strengthen to progress?",
        },
        {
          key: "career_focus",
          title: "Career",
          subtitle: "Which areas of passion, vocation, or impact do you want to develop?",
        },
        {
          key: "starting_point",
          title: "Starting point",
          subtitle:
            "How do you perceive your work today? Distribute the five dimensions across 100%.",
        },
        {
          key: "inspiration",
          title: "Inspiration",
          subtitle:
            "Which role models currently shape the way you think or grow?",
        },
      ],
    };
  }, [uiLanguage]);

  const steps = copy.steps;
  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateHorizon(
    key: "short_term_mission" | "mid_term_ambition" | "long_term_goal",
    value: Partial<Horizon>,
  ) {
    setSaved(false);
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...value,
      },
    }));
  }

  function updateStartingPoint(key: keyof StartingPoint, value: number) {
    setSaved(false);
    setForm((prev) => ({
      ...prev,
      starting_point: {
        ...prev.starting_point,
        [key]: value,
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await saveCareerBlueprint({
        ...form,
        is_completed: true,
      });

      setForm((prev) => ({
        ...prev,
        is_completed: true,
      }));

      setSaved(true);

      const refreshedGap = await getCareerGap();
      setCareerGap(refreshedGap);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible d’enregistrer le Career Blueprint."
            : "Failed to save the Career Blueprint.",
      );
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }

  function renderTextArea(
    value: string,
    onChange: (value: string) => void,
    placeholder?: string,
  ) {
    return (
      <textarea
        className="textarea"
        rows={6}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          borderRadius: 18,
          borderColor: "rgba(43,33,24,0.10)",
          background: "rgba(255,255,255,0.82)",
          lineHeight: 1.7,
          minHeight: 180,
        }}
      />
    );
  }

  function renderHorizon(
    key: "short_term_mission" | "mid_term_ambition" | "long_term_goal",
    data: Horizon,
  ) {
    return (
      <div className="stack" style={{ gap: 16 }}>
        <input
          className="input"
          value={data.target_role}
          onChange={(event) => updateHorizon(key, { target_role: event.target.value })}
          placeholder={copy.targetRole}
          style={{
            minHeight: 54,
            borderRadius: 18,
            borderColor: "rgba(43,33,24,0.10)",
            background: "rgba(255,255,255,0.82)",
          }}
        />

        <input
          className="input"
          value={data.target_compensation}
          onChange={(event) =>
            updateHorizon(key, { target_compensation: event.target.value })
          }
          placeholder={copy.targetCompensation}
          style={{
            minHeight: 54,
            borderRadius: 18,
            borderColor: "rgba(43,33,24,0.10)",
            background: "rgba(255,255,255,0.82)",
          }}
        />

        <div className="stack" style={{ gap: 10 }}>
          <div className="muted" style={{ color: "var(--coach-muted)" }}>
            {copy.targetLevel}
          </div>

          <div className="grid grid-3">
            {LEVELS.map((level) => (
              <SelectableLevelCard
                key={level}
                level={level}
                selected={data.target_level === level}
                onClick={() => updateHorizon(key, { target_level: level })}
                uiLanguage={uiLanguage}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderStartingPoint() {
    const total =
      form.starting_point.my_profession_percent +
      form.starting_point.my_work_percent +
      form.starting_point.chore_percent +
      form.starting_point.destiny_percent +
      form.starting_point.hobby_percent;

    const rows = [
      {
        key: "my_profession_percent" as const,
        label: uiLanguage === "fr" ? "Métier" : "Profession",
      },
      {
        key: "my_work_percent" as const,
        label: uiLanguage === "fr" ? "Travail" : "Work",
      },
      {
        key: "chore_percent" as const,
        label: uiLanguage === "fr" ? "Corvée" : "Chore",
      },
      {
        key: "destiny_percent" as const,
        label: uiLanguage === "fr" ? "Vocation" : "Calling",
      },
      {
        key: "hobby_percent" as const,
        label: uiLanguage === "fr" ? "Loisir" : "Hobby",
      },
    ];

    return (
      <div className="stack" style={{ gap: 18 }}>
        {rows.map((row) => (
          <div
            key={row.key}
            className="card-soft stack"
            style={{
              gap: 10,
              borderRadius: 22,
              background: "rgba(255,248,239,0.74)",
              border: "1px solid rgba(43,33,24,0.08)",
            }}
          >
            <div className="row space-between">
              <span style={{ fontWeight: 700, color: "var(--coach-ink)" }}>
                {row.label}
              </span>
              <strong style={{ color: "var(--coach-accent)" }}>
                {form.starting_point[row.key]}%
              </strong>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.starting_point[row.key]}
              onChange={(event) => updateStartingPoint(row.key, Number(event.target.value))}
              style={{
                width: "100%",
                accentColor: "var(--coach-accent)",
              }}
            />
          </div>
        ))}

        <div
          className="card-soft row space-between"
          style={{
            borderRadius: 22,
            background:
              total === 100
                ? "rgba(88,180,174,0.10)"
                : "rgba(198,40,40,0.08)",
            border:
              total === 100
                ? "1px solid rgba(88,180,174,0.18)"
                : "1px solid rgba(198,40,40,0.16)",
          }}
        >
          <strong>{uiLanguage === "fr" ? "Total" : "Total"}</strong>
          <strong style={{ color: total === 100 ? "var(--coach-calm)" : "var(--danger)" }}>
            {total}%
          </strong>
        </div>

        {total !== 100 ? (
          <div className="muted" style={{ color: "var(--danger)" }}>
            {copy.totalMustBe100}
          </div>
        ) : null}
      </div>
    );
  }

  function renderStepContent() {
    switch (currentStep.key) {
      case "identity":
        return renderTextArea(
          form.identity_text,
          (value) => updateField("identity_text", value),
          copy.identityPlaceholder,
        );

      case "vision":
        return renderTextArea(
          form.vision_text,
          (value) => updateField("vision_text", value),
          copy.visionPlaceholder,
        );

      case "short_term_mission":
        return renderHorizon("short_term_mission", form.short_term_mission);

      case "mid_term_ambition":
        return renderHorizon("mid_term_ambition", form.mid_term_ambition);

      case "long_term_goal":
        return renderHorizon("long_term_goal", form.long_term_goal);

      case "talent_focus":
        return renderTextArea(
          form.talent_focus_text,
          (value) => updateField("talent_focus_text", value),
          copy.talentPlaceholder,
        );

      case "career_focus":
        return renderTextArea(
          form.career_focus_text,
          (value) => updateField("career_focus_text", value),
          copy.careerPlaceholder,
        );

      case "starting_point":
        return renderStartingPoint();

      case "inspiration":
        return (
          <div className="stack" style={{ gap: 16 }}>
            <input
              className="input"
              value={form.inspiration_person}
              onChange={(event) => updateField("inspiration_person", event.target.value)}
              placeholder={copy.inspirationPlaceholder}
              style={{
                minHeight: 54,
                borderRadius: 18,
                borderColor: "rgba(43,33,24,0.10)",
                background: "rgba(255,255,255,0.82)",
              }}
            />

            <input
              className="input"
              value={form.aspiration_person}
              onChange={(event) => updateField("aspiration_person", event.target.value)}
              placeholder={copy.aspirationPlaceholder}
              style={{
                minHeight: 54,
                borderRadius: 18,
                borderColor: "rgba(43,33,24,0.10)",
                background: "rgba(255,255,255,0.82)",
              }}
            />
          </div>
        );

      default:
        return null;
    }
  }

  const canGoNext = (() => {
    switch (currentStep.key) {
      case "identity":
        return form.identity_text.trim().length > 10;
      case "vision":
        return form.vision_text.trim().length > 10;
      case "short_term_mission":
        return !!form.short_term_mission.target_role.trim();
      case "mid_term_ambition":
        return !!form.mid_term_ambition.target_role.trim();
      case "long_term_goal":
        return !!form.long_term_goal.target_role.trim();
      case "talent_focus":
        return form.talent_focus_text.trim().length > 10;
      case "career_focus":
        return form.career_focus_text.trim().length > 10;
      case "starting_point":
        return (
          form.starting_point.my_profession_percent +
            form.starting_point.my_work_percent +
            form.starting_point.chore_percent +
            form.starting_point.destiny_percent +
            form.starting_point.hobby_percent ===
          100
        );
      case "inspiration":
        return (
          form.inspiration_person.trim().length > 1 &&
          form.aspiration_person.trim().length > 1
        );
      default:
        return false;
    }
  })();

  if (loading) {
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

  return (
    <AppShell uiLanguage={uiLanguage} title={copy.shellTitle}>
      <div className="stack" style={{ gap: 18 }}>
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
              <BadgePill icon={<PathIcon size={14} />}>{copy.title}</BadgePill>

              <BadgePill icon={<SparkIcon size={14} />}>
                {form.is_completed ? copy.activeBlueprint : copy.incompleteBlueprint}
              </BadgePill>

              <BadgePill icon={<ChartIcon size={14} />}>
                {copy.progress} {progress}%
              </BadgePill>
            </div>

            <div
              style={{
                maxWidth: 920,
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
              {copy.subtitle}
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
              <div className="section-title">{copy.journey}</div>

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
              <div className="section-title">{copy.currentSignals}</div>

              <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
                {careerGap?.key_gap_summary || copy.noGap}
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {careerGap?.role_gap_short_term ? (
                  <BadgePill icon={<TargetIcon size={14} />}>
                    {uiLanguage === "fr" ? "Écart à court terme" : "Short-term gap"}
                  </BadgePill>
                ) : null}

                {careerGap?.role_gap_mid_term ? (
                  <BadgePill icon={<PathIcon size={14} />}>
                    {uiLanguage === "fr" ? "Écart à moyen terme" : "Mid-term gap"}
                  </BadgePill>
                ) : null}

                {careerGap?.role_gap_long_term ? (
                  <BadgePill icon={<ChartIcon size={14} />}>
                    {uiLanguage === "fr" ? "Écart à long terme" : "Long-term gap"}
                  </BadgePill>
                ) : null}

                {!careerGap?.role_gap_short_term &&
                !careerGap?.role_gap_mid_term &&
                !careerGap?.role_gap_long_term ? (
                  <BadgePill icon={<CheckCircleIcon size={14} />}>
                    {uiLanguage === "fr" ? "Trajectoire cohérente" : "Trajectory aligned"}
                  </BadgePill>
                ) : null}
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

                {saved ? (
                  <div
                    className="card-soft"
                    style={{
                      color: "var(--coach-calm)",
                      borderRadius: 20,
                      background: "rgba(88,180,174,0.10)",
                      border: "1px solid rgba(88,180,174,0.18)",
                    }}
                  >
                    {copy.saved}
                  </div>
                ) : null}

                <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={goBack}
                    disabled={stepIndex === 0 || saving}
                  >
                    {copy.back}
                  </button>

                  {stepIndex < totalSteps - 1 ? (
                    <button
                      className="button"
                      type="button"
                      onClick={goNext}
                      disabled={!canGoNext || saving}
                      style={{
                        background: "var(--coach-accent)",
                        minHeight: 46,
                        paddingInline: 22,
                      }}
                    >
                      {copy.next}
                    </button>
                  ) : (
                    <button
                      className="button"
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={!canGoNext || saving}
                      style={{
                        background: "var(--coach-accent)",
                        minHeight: 46,
                        paddingInline: 22,
                      }}
                    >
                      {saving ? copy.saving : copy.save}
                    </button>
                  )}
                </div>

                {form.is_completed ? (
                  <div className="row" style={{ justifyContent: "flex-end" }}>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => router.push("/dashboard")}
                    >
                      {copy.finish}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </CoachSectionCard>
        </div>
      </div>
    </AppShell>
  );
}