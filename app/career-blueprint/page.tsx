"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { useCurrentUser } from "@/components/user-context";
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
import { resolveUiLanguage, type SupportedUiLanguage } from "@/lib/user-locales";

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

function SelectableLevelCard({
  level,
  selected,
  onClick,
}: {
  level: Level;
  selected: boolean;
  onClick: () => void;
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
        borderRadius: 22,
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
          {level}
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
  const { user } = useCurrentUser();

  const [uiLanguage, setUiLanguage] = useState<SupportedUiLanguage>("en");
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
    setUiLanguage(
      resolveUiLanguage({
        language: user?.language,
        locale: user?.locale,
      }),
    );
  }, [user]);

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
        setError(err instanceof Error ? err.message : "Failed to load career blueprint.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const copy = useMemo(() => {
    if (uiLanguage === "fr") {
      return {
        shellTitle: "Career Blueprint",
        title: "Career Blueprint",
        subtitle:
          "Clarifie ton identité, ta vision, tes horizons de carrière et ton point de départ.",
        save: "Enregistrer le blueprint",
        saving: "Enregistrement...",
        saved: "Blueprint enregistré.",
        back: "Retour",
        next: "Continuer",
        finish: "Retour au tableau de bord",
        loading: "Chargement du blueprint...",
        progress: "Progression",
        activeBlueprint: "Blueprint actif",
        incompleteBlueprint: "Blueprint à compléter",
        journey: "Parcours personnel",
        stepLabel: (current: number, total: number) => `Étape ${current} sur ${total}`,
        noGap: "Aucun écart majeur détecté pour le moment.",
        totalMustBe100: "La somme doit faire 100%.",
        currentSignals: "Signaux actuels",
        steps: [
          {
            key: "identity",
            title: "Identité",
            subtitle:
              "Quels principes et valeurs veux-tu préserver dans ta vie professionnelle ?",
          },
          {
            key: "vision",
            title: "Vision",
            subtitle:
              "Quels accomplissements cherches-tu à atteindre à travers ton travail ?",
          },
          {
            key: "short_term_mission",
            title: "Mission",
            subtitle: "Quel résultat veux-tu atteindre à court terme ?",
          },
          {
            key: "mid_term_ambition",
            title: "Ambition",
            subtitle: "Quel résultat veux-tu atteindre à moyen terme ?",
          },
          {
            key: "long_term_goal",
            title: "But",
            subtitle: "Quel résultat veux-tu atteindre à long terme ?",
          },
          {
            key: "talent_focus",
            title: "Talent",
            subtitle:
              "Quels domaines veux-tu développer côté compétences, connaissances ou expertise ?",
          },
          {
            key: "career_focus",
            title: "Carrière",
            subtitle:
              "Quels domaines veux-tu développer côté vocation, passion ou impact ?",
          },
          {
            key: "starting_point",
            title: "Point de départ",
            subtitle:
              "Comment perçois-tu ton job actuel ? La somme doit faire 100.",
          },
          {
            key: "inspiration",
            title: "Inspiration & aspiration",
            subtitle:
              "Qui t’inspire aujourd’hui, et qui rêves-tu d’égaler un jour ?",
          },
        ],
      };
    }

    return {
      shellTitle: "Career Blueprint",
      title: "Career Blueprint",
      subtitle:
        "Clarify your identity, vision, career horizons, and starting point.",
      save: "Save blueprint",
      saving: "Saving...",
      saved: "Blueprint saved.",
      back: "Back",
      next: "Continue",
      finish: "Back to dashboard",
      loading: "Loading blueprint...",
      progress: "Progress",
      activeBlueprint: "Blueprint active",
      incompleteBlueprint: "Blueprint to complete",
      journey: "Personal journey",
      stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
      noGap: "No major gap detected for now.",
      totalMustBe100: "The total must equal 100%.",
      currentSignals: "Current signals",
      steps: [
        {
          key: "identity",
          title: "Identity",
          subtitle:
            "Which principles and values do you want to preserve in your professional life?",
        },
        {
          key: "vision",
          title: "Vision",
          subtitle: "What accomplishments are you seeking through your work?",
        },
        {
          key: "short_term_mission",
          title: "Mission",
          subtitle: "What result do you want to reach in the short term?",
        },
        {
          key: "mid_term_ambition",
          title: "Ambition",
          subtitle: "What result do you want to reach in the mid term?",
        },
        {
          key: "long_term_goal",
          title: "Goal",
          subtitle: "What result do you want to reach in the long term?",
        },
        {
          key: "talent_focus",
          title: "Talent",
          subtitle:
            "Which areas do you want to develop in terms of skills, knowledge, or expertise?",
        },
        {
          key: "career_focus",
          title: "Career",
          subtitle:
            "Which areas do you want to develop in terms of vocation, passion, or impact?",
        },
        {
          key: "starting_point",
          title: "Starting point",
          subtitle: "How do you perceive your current job? The total must equal 100.",
        },
        {
          key: "inspiration",
          title: "Inspiration & aspiration",
          subtitle:
            "Who inspires you most today, and who do you dream of equaling one day?",
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
      setError(err instanceof Error ? err.message : "Failed to save career blueprint.");
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
        rows={7}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          borderRadius: 22,
          borderColor: "rgba(43,33,24,0.10)",
          background: "rgba(255,255,255,0.82)",
          lineHeight: 1.7,
          minHeight: 220,
        }}
      />
    );
  }

  function renderHorizon(
    key: "short_term_mission" | "mid_term_ambition" | "long_term_goal",
    data: Horizon,
  ) {
    return (
      <div className="stack" style={{ gap: 18 }}>
        <input
          className="input"
          value={data.target_role}
          onChange={(event) => updateHorizon(key, { target_role: event.target.value })}
          placeholder={uiLanguage === "fr" ? "Rôle cible" : "Target role"}
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
          placeholder={uiLanguage === "fr" ? "Compensation cible" : "Target compensation"}
          style={{
            minHeight: 54,
            borderRadius: 18,
            borderColor: "rgba(43,33,24,0.10)",
            background: "rgba(255,255,255,0.82)",
          }}
        />

        <div className="stack" style={{ gap: 10 }}>
          <div className="muted" style={{ color: "var(--coach-muted)" }}>
            {uiLanguage === "fr" ? "Niveau cible" : "Target level"}
          </div>

          <div className="grid grid-3">
            {LEVELS.map((level) => (
              <SelectableLevelCard
                key={level}
                level={level}
                selected={data.target_level === level}
                onClick={() => updateHorizon(key, { target_level: level })}
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
        label: uiLanguage === "fr" ? "Mon métier" : "My profession",
      },
      {
        key: "my_work_percent" as const,
        label: uiLanguage === "fr" ? "Mon travail" : "My work",
      },
      {
        key: "chore_percent" as const,
        label: uiLanguage === "fr" ? "Corvée" : "Chore",
      },
      {
        key: "destiny_percent" as const,
        label: uiLanguage === "fr" ? "Destinée" : "Destiny",
      },
      {
        key: "hobby_percent" as const,
        label: uiLanguage === "fr" ? "Hobby" : "Hobby",
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
          uiLanguage === "fr"
            ? "Décris les principes et valeurs que tu veux préserver"
            : "Describe the principles and values you want to preserve",
        );

      case "vision":
        return renderTextArea(
          form.vision_text,
          (value) => updateField("vision_text", value),
          uiLanguage === "fr"
            ? "Décris ce que tu veux accomplir à travers ton travail"
            : "Describe what you want to accomplish through your work",
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
          uiLanguage === "fr"
            ? "Quelles compétences ou expertises veux-tu développer ?"
            : "Which skills or expertise do you want to develop?",
        );

      case "career_focus":
        return renderTextArea(
          form.career_focus_text,
          (value) => updateField("career_focus_text", value),
          uiLanguage === "fr"
            ? "Quels domaines de vocation, de passion ou d’impact veux-tu développer ?"
            : "Which areas of vocation, passion, or impact do you want to develop?",
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
              placeholder={
                uiLanguage === "fr"
                  ? "Personne qui t’inspire"
                  : "Person who inspires you"
              }
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
              placeholder={
                uiLanguage === "fr"
                  ? "Personne que tu rêves d’égaler"
                  : "Person you dream of equaling"
              }
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
                <div className="section-title">{copy.loading}</div>
                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {uiLanguage === "fr"
                    ? "Nous récupérons ta trajectoire et ton point de départ."
                    : "We are retrieving your trajectory and starting point."}
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
                fontSize: 44,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Dessine la trajectoire qui doit guider ton coaching."
                : "Shape the trajectory that should guide your coaching."}
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
            gridTemplateColumns: "minmax(260px, 0.72fr) minmax(0, 1.28fr)",
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
                    {uiLanguage === "fr" ? "Écart court terme" : "Short-term gap"}
                  </BadgePill>
                ) : null}

                {careerGap?.role_gap_mid_term ? (
                  <BadgePill icon={<PathIcon size={14} />}>
                    {uiLanguage === "fr" ? "Écart moyen terme" : "Mid-term gap"}
                  </BadgePill>
                ) : null}

                {careerGap?.role_gap_long_term ? (
                  <BadgePill icon={<ChartIcon size={14} />}>
                    {uiLanguage === "fr" ? "Écart long terme" : "Long-term gap"}
                  </BadgePill>
                ) : null}

                {!careerGap?.role_gap_short_term &&
                !careerGap?.role_gap_mid_term &&
                !careerGap?.role_gap_long_term ? (
                  <BadgePill icon={<CheckCircleIcon size={14} />}>
                    {uiLanguage === "fr" ? "Lecture stable" : "Stable reading"}
                  </BadgePill>
                ) : null}
              </div>
            </CoachSectionCard>
          </div>

          <CoachSectionCard>
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
                    <BadgePill icon={<SparkIcon size={14} />}>
                      {copy.stepLabel(stepIndex + 1, totalSteps)}
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