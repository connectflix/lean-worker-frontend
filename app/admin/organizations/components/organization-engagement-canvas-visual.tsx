"use client";

import type { AdminWorkerEngagementState } from "@/lib/types";

type CanvasTone =
  | "blue"
  | "purple"
  | "orange"
  | "teal"
  | "rose"
  | "amber"
  | "indigo"
  | "green"
  | "cyan";

type EngagementFormState = {
  worker_id: string;
  state_type: AdminWorkerEngagementState;

  identity_text: string;
  purpose_text: string;
  missions_text: string;
  ambitions_text: string;

  career_intent_compensation: string;
  career_intent_role: string;
  career_intent_passion_criteria: string;
  career_intent_collaboration_profile: string;
  career_intent_performance_level: string;
  career_intent_responsibilities: string;

  vision_text: string;
  actions_text: string;
  objectives_text: string;

  talent_intent_foundations: string;
  talent_intent_personality: string;
  talent_intent_watch: string;
  talent_intent_next_level: string;
  talent_intent_impact_niches: string;
  talent_intent_social_contributions: string;
};

function getCanvasToneStyles(tone: CanvasTone): {
  border: string;
  background: string;
  title: string;
} {
  switch (tone) {
    case "blue":
      return {
        border: "rgba(59,130,246,0.55)",
        background: "rgba(59,130,246,0.08)",
        title: "#1d4ed8",
      };
    case "purple":
      return {
        border: "rgba(168,85,247,0.55)",
        background: "rgba(168,85,247,0.08)",
        title: "#7e22ce",
      };
    case "orange":
      return {
        border: "rgba(249,115,22,0.55)",
        background: "rgba(249,115,22,0.08)",
        title: "#c2410c",
      };
    case "teal":
      return {
        border: "rgba(20,184,166,0.55)",
        background: "rgba(20,184,166,0.08)",
        title: "#0f766e",
      };
    case "rose":
      return {
        border: "rgba(244,63,94,0.55)",
        background: "rgba(244,63,94,0.08)",
        title: "#be123c",
      };
    case "amber":
      return {
        border: "rgba(245,158,11,0.55)",
        background: "rgba(245,158,11,0.1)",
        title: "#b45309",
      };
    case "indigo":
      return {
        border: "rgba(99,102,241,0.55)",
        background: "rgba(99,102,241,0.08)",
        title: "#4338ca",
      };
    case "green":
      return {
        border: "rgba(34,197,94,0.55)",
        background: "rgba(34,197,94,0.08)",
        title: "#15803d",
      };
    case "cyan":
      return {
        border: "rgba(6,182,212,0.55)",
        background: "rgba(6,182,212,0.08)",
        title: "#0e7490",
      };
    default:
      return {
        border: "rgba(59,130,246,0.55)",
        background: "rgba(59,130,246,0.08)",
        title: "#1d4ed8",
      };
  }
}

type OrganizationEngagementCanvasVisualProps = {
  form: EngagementFormState;
  onChange: <K extends keyof EngagementFormState>(
    key: K,
    value: EngagementFormState[K],
  ) => void;
  disabled?: boolean;
};

export function OrganizationEngagementCanvasVisual({
  form,
  onChange,
  disabled = false,
}: OrganizationEngagementCanvasVisualProps) {
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div style={{ width: "100%", overflowX: "auto", paddingBottom: 4 }}>
        <div
          style={{
            minWidth: 1180,
            border: "2px solid rgba(15,23,42,0.78)",
            borderRadius: 10,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 18px 48px rgba(15,23,42,0.10)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1.4fr 1.4fr 1.1fr 1.05fr",
              minHeight: 620,
              borderBottom: "2px solid rgba(15,23,42,0.78)",
            }}
          >
            <div style={{ borderRight: "2px solid rgba(15,23,42,0.78)" }}>
              <EngagementCanvasCell
                title="Ambitions"
                tone="orange"
                value={form.ambitions_text}
                onChange={(value) => onChange("ambitions_text", value)}
                placeholder="Quelles ambitions professionnelles émergent ?"
                disabled={disabled}
                minHeight={620}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateRows: "1fr 1fr",
                borderRight: "2px solid rgba(15,23,42,0.78)",
              }}
            >
              <div style={{ borderBottom: "2px solid rgba(15,23,42,0.78)" }}>
                <EngagementCanvasCell
                  title="But"
                  tone="purple"
                  value={form.purpose_text}
                  onChange={(value) => onChange("purpose_text", value)}
                  placeholder="Quel est le but visible dans son travail ?"
                  disabled={disabled}
                  minHeight={308}
                />
              </div>

              <EngagementCanvasCell
                title="Missions"
                tone="teal"
                value={form.missions_text}
                onChange={(value) => onChange("missions_text", value)}
                placeholder="Quelles missions, responsabilités ou contributions sont importantes ?"
                disabled={disabled}
                minHeight={308}
              />
            </div>

            <div style={{ borderRight: "2px solid rgba(15,23,42,0.78)" }}>
              <EngagementCanvasCell
                title="Identité"
                tone="blue"
                value={form.identity_text}
                onChange={(value) => onChange("identity_text", value)}
                placeholder="Qui est ce worker professionnellement ?"
                disabled={disabled}
                minHeight={620}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateRows: "1fr 1fr",
                borderRight: "2px solid rgba(15,23,42,0.78)",
              }}
            >
              <div style={{ borderBottom: "2px solid rgba(15,23,42,0.78)" }}>
                <EngagementCanvasCell
                  title="Vision"
                  tone="cyan"
                  value={form.vision_text}
                  onChange={(value) => onChange("vision_text", value)}
                  placeholder="Quelle vision doit guider le worker ?"
                  disabled={disabled}
                  minHeight={308}
                />
              </div>

              <EngagementCanvasCell
                title="Actions"
                tone="amber"
                value={form.actions_text}
                onChange={(value) => onChange("actions_text", value)}
                placeholder="Quelles actions concrètes doivent être portées ?"
                disabled={disabled}
                minHeight={308}
              />
            </div>

            <EngagementCanvasCell
              title="Objectifs"
              tone="rose"
              value={form.objectives_text}
              onChange={(value) => onChange("objectives_text", value)}
              placeholder="Quels objectifs doivent être ciblés ?"
              disabled={disabled}
              minHeight={620}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              minHeight: 260,
            }}
          >
            <div style={{ borderRight: "2px solid rgba(15,23,42,0.78)" }}>
              <EngagementIntentCanvasCell
                title="Intentions Carrière"
                tone="indigo"
                disabled={disabled}
                items={[
                  {
                    label: "Compensation",
                    value: form.career_intent_compensation,
                    onChange: (value) => onChange("career_intent_compensation", value),
                  },
                  {
                    label: "Role",
                    value: form.career_intent_role,
                    onChange: (value) => onChange("career_intent_role", value),
                  },
                  {
                    label: "Passion criteria",
                    value: form.career_intent_passion_criteria,
                    onChange: (value) =>
                      onChange("career_intent_passion_criteria", value),
                  },
                  {
                    label: "Collaboration profile",
                    value: form.career_intent_collaboration_profile,
                    onChange: (value) =>
                      onChange("career_intent_collaboration_profile", value),
                  },
                  {
                    label: "Performance level",
                    value: form.career_intent_performance_level,
                    onChange: (value) =>
                      onChange("career_intent_performance_level", value),
                  },
                  {
                    label: "Responsibilities",
                    value: form.career_intent_responsibilities,
                    onChange: (value) =>
                      onChange("career_intent_responsibilities", value),
                  },
                ]}
              />
            </div>

            <EngagementIntentCanvasCell
              title="Intentions Talent"
              tone="green"
              disabled={disabled}
              items={[
                {
                  label: "Foundations",
                  value: form.talent_intent_foundations,
                  onChange: (value) => onChange("talent_intent_foundations", value),
                },
                {
                  label: "Personality",
                  value: form.talent_intent_personality,
                  onChange: (value) => onChange("talent_intent_personality", value),
                },
                {
                  label: "Watch",
                  value: form.talent_intent_watch,
                  onChange: (value) => onChange("talent_intent_watch", value),
                },
                {
                  label: "Next level",
                  value: form.talent_intent_next_level,
                  onChange: (value) => onChange("talent_intent_next_level", value),
                },
                {
                  label: "Impact niches",
                  value: form.talent_intent_impact_niches,
                  onChange: (value) => onChange("talent_intent_impact_niches", value),
                },
                {
                  label: "Social contributions",
                  value: form.talent_intent_social_contributions,
                  onChange: (value) =>
                    onChange("talent_intent_social_contributions", value),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="muted" style={{ lineHeight: 1.6 }}>
        Structure cible respectée : Ambitions, But/Missions, Identité, Vision/Actions,
        Objectifs, puis Intentions Carrière et Intentions Talent en bas du canvas.
      </div>
    </div>
  );
}

function EngagementCanvasCell({
  title,
  tone,
  value,
  onChange,
  placeholder,
  minHeight,
  disabled = false,
}: {
  title: string;
  tone: CanvasTone;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight: number;
  disabled?: boolean;
}) {
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
      style={{
        minHeight,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(180deg, ${toneStyles.background}, rgba(255,255,255,0.98) 42%)`,
      }}
    >
      <div
        style={{
          padding: "18px 18px 8px",
          fontSize: 34,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: toneStyles.title,
        }}
      >
        {title}
      </div>

      <div
        style={{
          height: 4,
          width: 56,
          marginLeft: 18,
          marginBottom: 6,
          borderRadius: 999,
          background: toneStyles.title,
          opacity: 0.75,
        }}
      />

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || "Saisir ici..."}
        disabled={disabled}
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          resize: "none",
          border: "none",
          outline: "none",
          background: "transparent",
          color: "#0f172a",
          font: "inherit",
          fontSize: 15,
          lineHeight: 1.55,
          padding: "10px 18px 18px",
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.72 : 1,
        }}
      />
    </div>
  );
}

function EngagementIntentCanvasCell({
  title,
  tone,
  items,
  disabled = false,
}: {
  title: string;
  tone: CanvasTone;
  items: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
  }>;
  disabled?: boolean;
}) {
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
      style={{
        minHeight: 260,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(180deg, ${toneStyles.background}, rgba(255,255,255,0.98) 48%)`,
      }}
    >
      <div
        style={{
          padding: "18px 18px 8px",
          fontSize: 32,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: toneStyles.title,
        }}
      >
        {title}
      </div>

      <div
        style={{
          height: 4,
          width: 72,
          marginLeft: 18,
          marginBottom: 6,
          borderRadius: 999,
          background: toneStyles.title,
          opacity: 0.75,
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
          padding: "10px 18px 18px",
          flex: 1,
        }}
      >
        {items.map((item) => (
          <label key={item.label} className="stack" style={{ gap: 5 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: toneStyles.title,
              }}
            >
              {item.label}
            </span>

            <textarea
              value={item.value}
              onChange={(event) => item.onChange(event.target.value)}
              disabled={disabled}
              rows={3}
              placeholder="Saisir ici..."
              style={{
                width: "100%",
                minHeight: 72,
                resize: "vertical",
                border: `1px solid ${toneStyles.border}`,
                borderRadius: 12,
                outline: "none",
                padding: 10,
                font: "inherit",
                fontSize: 13,
                lineHeight: 1.45,
                background: "rgba(255,255,255,0.82)",
                color: "#0f172a",
                cursor: disabled ? "not-allowed" : "text",
                opacity: disabled ? 0.72 : 1,
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}