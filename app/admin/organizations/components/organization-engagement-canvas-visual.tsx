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
  surface: string;
  title: string;
  softTitle: string;
} {
  switch (tone) {
    case "blue":
      return {
        border: "rgba(94,106,210,0.28)",
        background: "rgba(94,106,210,0.055)",
        surface: "rgba(94,106,210,0.035)",
        title: "#4f5bc4",
        softTitle: "rgba(79,91,196,0.82)",
      };
    case "purple":
      return {
        border: "rgba(126,87,194,0.25)",
        background: "rgba(126,87,194,0.055)",
        surface: "rgba(126,87,194,0.035)",
        title: "#6f47b8",
        softTitle: "rgba(111,71,184,0.82)",
      };
    case "orange":
      return {
        border: "rgba(217,119,6,0.24)",
        background: "rgba(217,119,6,0.055)",
        surface: "rgba(217,119,6,0.035)",
        title: "#b45309",
        softTitle: "rgba(180,83,9,0.82)",
      };
    case "teal":
      return {
        border: "rgba(13,148,136,0.24)",
        background: "rgba(13,148,136,0.055)",
        surface: "rgba(13,148,136,0.035)",
        title: "#0f766e",
        softTitle: "rgba(15,118,110,0.82)",
      };
    case "rose":
      return {
        border: "rgba(225,29,72,0.22)",
        background: "rgba(225,29,72,0.052)",
        surface: "rgba(225,29,72,0.032)",
        title: "#be123c",
        softTitle: "rgba(190,18,60,0.82)",
      };
    case "amber":
      return {
        border: "rgba(180,83,9,0.24)",
        background: "rgba(180,83,9,0.055)",
        surface: "rgba(180,83,9,0.035)",
        title: "#b45309",
        softTitle: "rgba(180,83,9,0.82)",
      };
    case "indigo":
      return {
        border: "rgba(79,70,229,0.24)",
        background: "rgba(79,70,229,0.055)",
        surface: "rgba(79,70,229,0.035)",
        title: "#4338ca",
        softTitle: "rgba(67,56,202,0.82)",
      };
    case "green":
      return {
        border: "rgba(21,128,61,0.24)",
        background: "rgba(21,128,61,0.055)",
        surface: "rgba(21,128,61,0.035)",
        title: "#15803d",
        softTitle: "rgba(21,128,61,0.82)",
      };
    case "cyan":
      return {
        border: "rgba(8,145,178,0.24)",
        background: "rgba(8,145,178,0.055)",
        surface: "rgba(8,145,178,0.035)",
        title: "#0e7490",
        softTitle: "rgba(14,116,144,0.82)",
      };
    default:
      return {
        border: "rgba(94,106,210,0.28)",
        background: "rgba(94,106,210,0.055)",
        surface: "rgba(94,106,210,0.035)",
        title: "#4f5bc4",
        softTitle: "rgba(79,91,196,0.82)",
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
    <div className="stack" style={{ gap: 14, minWidth: 0 }}>
      <div
        className="card-soft"
        style={{
          minWidth: 0,
          overflowX: "auto",
          overflowY: "hidden",
          padding: 12,
          background: "rgba(255,255,255,0.72)",
        }}
      >
        <div
          style={{
            minWidth: 1180,
            overflow: "hidden",
            borderRadius: 22,
            border: "1px solid rgba(17,24,39,0.10)",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1.4fr 1.4fr 1.1fr 1.05fr",
              minHeight: 620,
              borderBottom: "1px solid rgba(17,24,39,0.10)",
            }}
          >
            <div style={{ borderRight: "1px solid rgba(17,24,39,0.10)" }}>
              <EngagementCanvasCell
                title="Ambitions"
                helper="Ce que le worker vise, cherche à accomplir ou souhaite devenir."
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
                borderRight: "1px solid rgba(17,24,39,0.10)",
              }}
            >
              <div style={{ borderBottom: "1px solid rgba(17,24,39,0.10)" }}>
                <EngagementCanvasCell
                  title="But"
                  helper="Le sens immédiat ou la finalité visible dans son travail."
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
                helper="Les responsabilités, contributions et activités importantes."
                tone="teal"
                value={form.missions_text}
                onChange={(value) => onChange("missions_text", value)}
                placeholder="Quelles missions, responsabilités ou contributions sont importantes ?"
                disabled={disabled}
                minHeight={308}
              />
            </div>

            <div style={{ borderRight: "1px solid rgba(17,24,39,0.10)" }}>
              <EngagementCanvasCell
                title="Identité"
                helper="La manière dont le worker se définit professionnellement."
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
                borderRight: "1px solid rgba(17,24,39,0.10)",
              }}
            >
              <div style={{ borderBottom: "1px solid rgba(17,24,39,0.10)" }}>
                <EngagementCanvasCell
                  title="Vision"
                  helper="La direction claire qui doit guider la trajectoire."
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
                helper="Les actions concrètes à exécuter ou à renforcer."
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
              helper="Les résultats ciblés et les points de progression mesurables."
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
              minHeight: 280,
            }}
          >
            <div style={{ borderRight: "1px solid rgba(17,24,39,0.10)" }}>
              <EngagementIntentCanvasCell
                title="Intentions Carrière"
                helper="Ce que le worker attend de sa trajectoire professionnelle."
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
              helper="Ce qui permet de renforcer, développer ou exprimer son talent."
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

      <div
        className="card-soft"
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          background: "rgba(255,255,255,0.72)",
        }}
      >
        <span className="badge primary">Engagement structure</span>
        <span className="muted" style={{ lineHeight: 1.6 }}>
          Ambitions · But/Missions · Identité · Vision/Actions · Objectifs · Intentions
          Carrière · Intentions Talent.
        </span>
      </div>
    </div>
  );
}

function EngagementCanvasCell({
  title,
  helper,
  tone,
  value,
  onChange,
  placeholder,
  minHeight,
  disabled = false,
}: {
  title: string;
  helper: string;
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
        background: `linear-gradient(180deg, ${toneStyles.background}, #ffffff 46%)`,
        opacity: disabled ? 0.76 : 1,
      }}
    >
      <div
        className="stack"
        style={{
          gap: 5,
          padding: "18px 18px 10px",
        }}
      >
        <div
          style={{
            fontSize: 24,
            lineHeight: 1.04,
            fontWeight: 750,
            letterSpacing: "-0.045em",
            color: toneStyles.title,
          }}
        >
          {title}
        </div>

        <div
          style={{
            maxWidth: 260,
            color: toneStyles.softTitle,
            fontSize: 12,
            lineHeight: 1.45,
            fontWeight: 600,
          }}
        >
          {helper}
        </div>
      </div>

      <div
        style={{
          height: 1,
          margin: "0 18px",
          background: toneStyles.border,
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
          color: "var(--foreground)",
          font: "inherit",
          fontSize: 14,
          lineHeight: 1.6,
          padding: "14px 18px 18px",
          cursor: disabled ? "not-allowed" : "text",
          overflowY: "auto",
        }}
      />
    </div>
  );
}

function EngagementIntentCanvasCell({
  title,
  helper,
  tone,
  items,
  disabled = false,
}: {
  title: string;
  helper: string;
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
        minHeight: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(180deg, ${toneStyles.background}, #ffffff 52%)`,
        opacity: disabled ? 0.76 : 1,
      }}
    >
      <div
        className="stack"
        style={{
          gap: 5,
          padding: "18px 18px 10px",
        }}
      >
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.04,
            fontWeight: 750,
            letterSpacing: "-0.045em",
            color: toneStyles.title,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: toneStyles.softTitle,
            fontSize: 12,
            lineHeight: 1.45,
            fontWeight: 600,
          }}
        >
          {helper}
        </div>
      </div>

      <div
        style={{
          height: 1,
          margin: "0 18px",
          background: toneStyles.border,
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
          padding: "14px 18px 18px",
          flex: 1,
        }}
      >
        {items.map((item) => (
          <label key={item.label} className="stack" style={{ gap: 5 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: toneStyles.title,
                letterSpacing: "-0.01em",
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
                minHeight: 76,
                maxHeight: 132,
                resize: "vertical",
                border: `1px solid ${toneStyles.border}`,
                borderRadius: 14,
                outline: "none",
                padding: 10,
                font: "inherit",
                fontSize: 13,
                lineHeight: 1.5,
                background: "rgba(255,255,255,0.88)",
                color: "var(--foreground)",
                cursor: disabled ? "not-allowed" : "text",
                overflowY: "auto",
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}