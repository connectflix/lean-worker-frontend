"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { useCurrentUser } from "@/components/user-context";
import {
  BadgePill,
  ChartIcon,
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
  const [, setCareerGap] = useState<CareerGap | null>(null);

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
    starting_point: {
      my_profession_percent: 20,
      my_work_percent: 20,
      chore_percent: 20,
      destiny_percent: 20,
      hobby_percent: 20,
    },
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
            starting_point: blueprint.starting_point || {
              my_profession_percent: 20,
              my_work_percent: 20,
              chore_percent: 20,
              destiny_percent: 20,
              hobby_percent: 20,
            },
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
        finish: "Terminer",
        loading: "Chargement...",
        stepLabel: (current: number, total: number) => `Étape ${current} sur ${total}`,
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
        currentRole: "Aujourd’hui",
        shortTermGap: "Écart court terme",
        midTermGap: "Écart moyen terme",
        longTermGap: "Écart long terme",
        levelGap: "Écart de niveau",
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
      finish: "Finish",
      loading: "Loading...",
      stepLabel: (current: number, total: number) => `Step ${current} of ${total}`,
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
      currentRole: "Today",
      shortTermGap: "Short-term gap",
      midTermGap: "Mid-term gap",
      longTermGap: "Long-term gap",
      levelGap: "Level gap",
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  function renderHorizon(
    key: "short_term_mission" | "mid_term_ambition" | "long_term_goal",
    data: Horizon,
  ) {
    return (
      <div className="stack" style={{ gap: 14 }}>
        <input
          className="input"
          value={data.target_role}
          onChange={(e) => updateHorizon(key, { target_role: e.target.value })}
          placeholder={uiLanguage === "fr" ? "Rôle cible" : "Target role"}
        />

        <select
          className="input"
          value={data.target_level ?? ""}
          onChange={(e) =>
            updateHorizon(key, {
              target_level: e.target.value ? (e.target.value as Level) : null,
            })
          }
        >
          <option value="">{uiLanguage === "fr" ? "Niveau cible" : "Target level"}</option>
          {LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <input
          className="input"
          value={data.target_compensation}
          onChange={(e) =>
            updateHorizon(key, { target_compensation: e.target.value })
          }
          placeholder={uiLanguage === "fr" ? "Compensation cible" : "Target compensation"}
        />
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
      <div className="stack" style={{ gap: 16 }}>
        {rows.map((row) => (
          <div key={row.key} className="stack" style={{ gap: 8 }}>
            <div className="row space-between">
              <span>{row.label}</span>
              <strong>{form.starting_point[row.key]}%</strong>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.starting_point[row.key]}
              onChange={(e) => updateStartingPoint(row.key, Number(e.target.value))}
            />
          </div>
        ))}

        <div className="card-soft row space-between">
          <strong>{uiLanguage === "fr" ? "Total" : "Total"}</strong>
          <strong style={{ color: total === 100 ? "var(--success)" : "var(--danger)" }}>
            {total}%
          </strong>
        </div>
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
          <div className="stack" style={{ gap: 14 }}>
            <input
              className="input"
              value={form.inspiration_person}
              onChange={(e) => updateField("inspiration_person", e.target.value)}
              placeholder={uiLanguage === "fr" ? "Personne qui t’inspire" : "Person who inspires you"}
            />
            <input
              className="input"
              value={form.aspiration_person}
              onChange={(e) => updateField("aspiration_person", e.target.value)}
              placeholder={uiLanguage === "fr" ? "Personne que tu rêves d’égaler" : "Person you dream of equaling"}
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
      <main className="page">
        <div className="page-wrap">
          <div className="card">{copy.loading}</div>
        </div>
      </main>
    );
  }

  return (
    <AppShell uiLanguage={uiLanguage} title={copy.shellTitle}>
      <div
        className="card stack"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))",
        }}
      >
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <PathIcon />
          <h1 className="title">{copy.title}</h1>
        </div>

        <p className="subtitle">{copy.subtitle}</p>

        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <BadgePill icon={<SparkIcon size={14} />}>
            {copy.stepLabel(stepIndex + 1, totalSteps)}
          </BadgePill>
          <BadgePill icon={<ChartIcon size={14} />}>{progress}%</BadgePill>
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
          {saved && <div style={{ color: "var(--success)" }}>{copy.saved}</div>}

          <div className="row space-between" style={{ gap: 12 }}>
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
              >
                {copy.next}
              </button>
            ) : (
              <button
                className="button"
                type="button"
                onClick={handleSave}
                disabled={!canGoNext || saving}
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
    </AppShell>
  );
}