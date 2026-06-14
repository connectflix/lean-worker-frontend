// frontend/app/admin/coaching-plan/construction/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

type ModelTone = "yellow" | "green" | "blue";

type ConstructionModel = {
  order: number;
  title: string;
  subtitle: string;
  tone: ModelTone;
  objective: string;
  coachMessage: string;
  concepts: string[];
};

const CONSTRUCTION_MODELS: ConstructionModel[] = [
  {
    order: 1,
    title: "Success Blueprint",
    subtitle: "Strategy",
    tone: "yellow",
    objective:
      "Aider le Worker à prendre de meilleures décisions à partir du contexte, des évidences et des risques.",
    coachMessage:
      "L’engagement véritable commence par une stratégie claire : comprendre ce qui est réel, ce qui est risqué et ce qui mérite une décision.",
    concepts: [
      "Decision Model",
      "Evidence-based decisions",
      "Risk-based decisions",
      "Contexte",
      "Évidences",
      "Risques",
    ],
  },
  {
    order: 2,
    title: "Engagement Canvas",
    subtitle: "Planning",
    tone: "green",
    objective:
      "Structurer l’engagement professionnel avec les blocs qui rendent la trajectoire visible et actionnable.",
    coachMessage:
      "Un engagement ne reste pas une intention. Il devient un plan lorsqu’il relie identité, but, missions, ambitions, vision, objectifs et actions.",
    concepts: [
      "Identité",
      "But",
      "Missions",
      "Ambitions",
      "Vision",
      "Objectifs",
      "Actions",
      "Intentions carrière",
      "Intentions talent",
    ],
  },
  {
    order: 3,
    title: "Work Leverages",
    subtitle: "Execution",
    tone: "blue",
    objective:
      "Transformer le plan en exécution grâce aux bons leviers humains, méthodologiques, technologiques et professionnels.",
    coachMessage:
      "Le Worker ne réussit pas seulement par effort individuel. Il réussit lorsqu’il active les bons leviers au bon moment.",
    concepts: [
      "Action Model",
      "Coaching",
      "Mentorat",
      "Formation",
      "Performance",
      "Pairing",
      "Sponsoring",
      "Staging",
    ],
  },
];

const POSITIVE_FEELINGS = [
  "Adéquation aux activités professionnelles",
  "Carrière prédictive",
  "Équité sur la compensation",
  "Performance du Talent",
  "Passion au Travail",
  "Fierté du parcours professionnel",
];

function getToneStyle(tone: ModelTone) {
  if (tone === "yellow") {
    return {
      accent: "#b45309",
      soft: "rgba(251,191,36,0.12)",
      strong: "rgba(251,191,36,0.22)",
      border: "1px solid rgba(251,191,36,0.32)",
      gradient:
        "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(255,255,255,0.92))",
    };
  }

  if (tone === "green") {
    return {
      accent: "#16a34a",
      soft: "rgba(34,197,94,0.10)",
      strong: "rgba(34,197,94,0.20)",
      border: "1px solid rgba(34,197,94,0.28)",
      gradient:
        "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(255,255,255,0.92))",
    };
  }

  return {
    accent: "#2563eb",
    soft: "rgba(37,99,235,0.10)",
    strong: "rgba(37,99,235,0.20)",
    border: "1px solid rgba(37,99,235,0.28)",
    gradient:
      "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(255,255,255,0.92))",
  };
}

function CoachingPlanBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "dark" | ModelTone;
}) {
  const style =
    tone === "dark"
      ? {
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.14)",
          color: "rgba(255,255,255,0.88)",
        }
      : tone === "neutral"
        ? {
            background: "rgba(15,23,42,0.05)",
            border: "1px solid rgba(15,23,42,0.08)",
            color: "#334155",
          }
        : {
            background: getToneStyle(tone).soft,
            border: getToneStyle(tone).border,
            color: getToneStyle(tone).accent,
          };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        borderRadius: 999,
        padding: "8px 11px",
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: "0.035em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function ModelCard({ model }: { model: ConstructionModel }) {
  const tone = getToneStyle(model.tone);

  return (
    <article
      className="card-soft stack"
      style={{
        gap: 14,
        borderRadius: 26,
        border: tone.border,
        background: tone.gradient,
      }}
    >
      <div className="row space-between" style={{ gap: 10, flexWrap: "wrap" }}>
        <CoachingPlanBadge tone={model.tone}>{model.subtitle}</CoachingPlanBadge>

        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: tone.strong,
            color: tone.accent,
            fontWeight: 950,
          }}
        >
          {model.order}
        </span>
      </div>

      <div className="stack" style={{ gap: 6 }}>
        <div
          className="section-title"
          style={{
            color: tone.accent,
            fontSize: 23,
            letterSpacing: "-0.05em",
          }}
        >
          {model.title}
        </div>

        <div className="muted" style={{ lineHeight: 1.65 }}>
          {model.objective}
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 13,
          background: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <strong>Message coach</strong>
        <div className="muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
          {model.coachMessage}
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        {model.concepts.map((concept) => (
          <CoachingPlanBadge key={concept} tone="neutral">
            {concept}
          </CoachingPlanBadge>
        ))}
      </div>
    </article>
  );
}

function EngagementCanvasMiniature() {
  const labelStyle = {
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: "-0.035em",
    color: "#0f172a",
  };

  const cellStyle = {
    padding: "9px 8px",
    background: "#ffffff",
    borderRight: "1.5px solid rgba(15,23,42,0.70)",
    borderBottom: "1.5px solid rgba(15,23,42,0.70)",
    minHeight: 72,
    overflow: "hidden",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        border: "1.5px solid rgba(15,23,42,0.78)",
        background: "#ffffff",
        boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 1.1fr 1.15fr 1.05fr 1.05fr",
          gridTemplateRows: "88px 88px 62px",
        }}
      >
        <div
          style={{
            ...cellStyle,
            gridRow: "1 / span 2",
          }}
        >
          <div style={labelStyle}>Ambitions</div>
        </div>

        <div style={cellStyle}>
          <div style={{ ...labelStyle, textAlign: "center" }}>But</div>
        </div>

        <div
          style={{
            ...cellStyle,
            gridRow: "1 / span 2",
          }}
        >
          <div style={{ ...labelStyle, textAlign: "center" }}>Identité</div>
        </div>

        <div style={cellStyle}>
          <div style={{ ...labelStyle, textAlign: "center" }}>Vision</div>
        </div>

        <div
          style={{
            ...cellStyle,
            gridRow: "1 / span 2",
            borderRight: "none",
          }}
        >
          <div style={{ ...labelStyle, textAlign: "center" }}>Objectifs</div>
        </div>

        <div style={cellStyle}>
          <div style={{ ...labelStyle, textAlign: "center" }}>Missions</div>
        </div>

        <div style={cellStyle}>
          <div style={{ ...labelStyle, textAlign: "center" }}>Actions</div>
        </div>

        <div
          style={{
            ...cellStyle,
            gridColumn: "1 / span 2",
            borderBottom: "none",
          }}
        >
          <div style={labelStyle}>Intentions Carrière</div>
        </div>

        <div
          style={{
            ...cellStyle,
            gridColumn: "3 / span 3",
            borderRight: "none",
            borderBottom: "none",
          }}
        >
          <div style={labelStyle}>Intentions Talent</div>
        </div>
      </div>
    </div>
  );
}

function SwotCanvasMiniature() {
  const quadrantStyle = {
    minHeight: 64,
    padding: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: "-0.025em",
    color: "#111827",
  };

  return (
    <div
      className="stack"
      style={{
        gap: 7,
        width: "100%",
        maxWidth: "100%",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "34px 1fr 1fr 72px",
          gridTemplateRows: "24px 1fr 1fr",
          width: "100%",
          maxWidth: 360,
        }}
      >
        <div />

        <div
          style={{
            display: "grid",
            placeItems: "center",
            fontSize: 9,
            fontWeight: 950,
            letterSpacing: "0.04em",
            color: "#111827",
          }}
        >
          POSITIVE
        </div>

        <div
          style={{
            display: "grid",
            placeItems: "center",
            fontSize: 9,
            fontWeight: 950,
            letterSpacing: "0.04em",
            color: "#111827",
          }}
        >
          NEGATIVE
        </div>

        <div />

        <div />

        <div
          style={{
            ...quadrantStyle,
            borderTop: "1.5px solid rgba(15,23,42,0.82)",
            borderLeft: "1.5px solid rgba(15,23,42,0.82)",
            borderRight: "1px dashed rgba(15,23,42,0.35)",
            borderBottom: "1px dashed rgba(15,23,42,0.35)",
          }}
        >
          <div>
            STRENGTHS
            <div style={{ marginTop: 8, fontSize: 9, color: "#64748b" }}>SO · ST</div>
          </div>
        </div>

        <div
          style={{
            ...quadrantStyle,
            borderTop: "1.5px solid rgba(15,23,42,0.82)",
            borderRight: "1.5px solid rgba(15,23,42,0.82)",
            borderBottom: "1px dashed rgba(15,23,42,0.35)",
          }}
        >
          <div>
            WEAKNESSES
            <div style={{ marginTop: 8, fontSize: 9, color: "#64748b" }}>WO · WT</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            placeItems: "center start",
            paddingLeft: 8,
            fontSize: 8,
            fontWeight: 900,
            lineHeight: 1.2,
            color: "#111827",
          }}
        >
          ← INTERNAL
          <br />
          INFL.
        </div>

        <div />

        <div
          style={{
            ...quadrantStyle,
            borderLeft: "1.5px solid rgba(15,23,42,0.82)",
            borderBottom: "1.5px solid rgba(15,23,42,0.82)",
            borderRight: "1px dashed rgba(15,23,42,0.35)",
          }}
        >
          OPPORTUNITIES
        </div>

        <div
          style={{
            ...quadrantStyle,
            borderRight: "1.5px solid rgba(15,23,42,0.82)",
            borderBottom: "1.5px solid rgba(15,23,42,0.82)",
          }}
        >
          THREATS
        </div>

        <div
          style={{
            display: "grid",
            placeItems: "center start",
            paddingLeft: 8,
            fontSize: 8,
            fontWeight: 900,
            lineHeight: 1.2,
            color: "#111827",
          }}
        >
          ← EXTERNAL
          <br />
          INFL.
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 5,
          fontSize: 8,
          lineHeight: 1.25,
          color: "#475569",
          fontWeight: 750,
        }}
      >
        <div>
          <strong>SO</strong> = strengths exploit opportunity
        </div>
        <div>
          <strong>ST</strong> = strengths face threat
        </div>
        <div>
          <strong>WO</strong> = opportunity mitigates weakness
        </div>
        <div>
          <strong>WT</strong> = restructure to avoid threat
        </div>
      </div>
    </div>
  );
}

function SuccessBlueprintMiniature() {
  return (
    <div
      className="stack"
      style={{
        gap: 10,
        width: "100%",
        maxWidth: "100%",
        alignItems: "center",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderRadius: 999,
          border: "1px solid rgba(15,23,42,0.16)",
          background: "#ffffff",
          fontWeight: 950,
          color: "#334155",
          textAlign: "center",
          fontSize: 13,
        }}
      >
        Decision Model
      </div>

      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          alignItems: "stretch",
        }}
      >
        <div
          className="card-soft stack"
          style={{
            gap: 5,
            padding: 10,
            border: "1px dashed rgba(239,68,68,0.34)",
            background: "rgba(239,68,68,0.04)",
            color: "#dc2626",
            textAlign: "center",
          }}
        >
          <strong>Évidences</strong>
          <span style={{ fontSize: 10, lineHeight: 1.35, color: "#64748b" }}>
            Evidence-based decisions
          </span>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 5,
            padding: 10,
            border: "1px dashed rgba(239,68,68,0.34)",
            background: "rgba(239,68,68,0.04)",
            color: "#dc2626",
            textAlign: "center",
          }}
        >
          <strong>Risques</strong>
          <span style={{ fontSize: 10, lineHeight: 1.35, color: "#64748b" }}>
            Risk-based decisions
          </span>
        </div>
      </div>

      <div
        style={{
          color: "#dc2626",
          fontWeight: 950,
          fontSize: 17,
          letterSpacing: "-0.04em",
        }}
      >
        Contexte
      </div>

      <SwotCanvasMiniature />
    </div>
  );
}

function LeverageBoxMiniature() {
  return (
    <div
      className="stack"
      style={{
        gap: 10,
        minWidth: 0,
        width: "100%",
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(15,23,42,0.16)",
        background: "#ffffff",
      }}
    >
      <strong>Ressources / Leviers</strong>

      {[
        "Développement — livres, séminaires, e-learning",
        "Transformation — coachs, mentors, formateurs",
        "Impact — partenaires, missions, projets",
      ].map((item) => (
        <div key={item} className="muted" style={{ lineHeight: 1.5 }}>
          - {item}
        </div>
      ))}

      <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        {["Références", "Expertise", "Connaissances", "Compétences", "Conseils"].map((item) => (
          <CoachingPlanBadge key={item} tone="neutral">
            {item}
          </CoachingPlanBadge>
        ))}
      </div>
    </div>
  );
}

function ConstructionDiagram() {
  return (
    <section
      className="card stack"
      style={{
        gap: 18,
        overflowX: "auto",
        border: "1px solid rgba(15,23,42,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
      }}
    >
      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 5 }}>
          <div className="section-title">Modèle de construction</div>
          <div className="muted" style={{ lineHeight: 1.65, maxWidth: 980 }}>
            L’engagement véritable se construit par la convergence entre une stratégie de décision,
            une planification claire et une exécution soutenue par les bons leviers.
          </div>
        </div>

        <CoachingPlanBadge tone="neutral">Strategy → Planning → Execution</CoachingPlanBadge>
      </div>

      <div
        style={{
          minWidth: 1080,
          display: "grid",
          gridTemplateColumns: "1fr 1.1fr 1fr",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        <div
          className="card-soft stack"
          style={{
            gap: 14,
            background: "rgba(251,191,36,0.08)",
            overflow: "hidden",
          }}
        >
          <CoachingPlanBadge tone="yellow">1. Success Blueprint</CoachingPlanBadge>
          <SuccessBlueprintMiniature />
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 14,
            background: "rgba(34,197,94,0.07)",
            overflow: "hidden",
          }}
        >
          <CoachingPlanBadge tone="green">2. Engagement Canvas</CoachingPlanBadge>

          <div className="stack" style={{ gap: 12, minWidth: 0 }}>
            <div
              style={{
                alignSelf: "center",
                padding: "10px 18px",
                borderRadius: 999,
                border: "1px solid rgba(15,23,42,0.16)",
                background: "#ffffff",
                fontWeight: 950,
                fontSize: 13,
              }}
            >
              Engagement Model
            </div>

            <EngagementCanvasMiniature />
          </div>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 14,
            background: "rgba(37,99,235,0.07)",
            overflow: "hidden",
          }}
        >
          <CoachingPlanBadge tone="blue">3. Work Leverages</CoachingPlanBadge>

          <div
            style={{
              alignSelf: "center",
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid rgba(15,23,42,0.16)",
              background: "#ffffff",
              fontWeight: 950,
              fontSize: 13,
            }}
          >
            Action Model
          </div>

          <LeverageBoxMiniature />
        </div>
      </div>

      <div
        className="card-soft"
        style={{
          border: "1px solid rgba(34,197,94,0.22)",
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(255,255,255,0.92))",
        }}
      >
        <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <strong style={{ color: "#16a34a" }}>Engagement</strong>
          <span className="muted">=</span>
          <CoachingPlanBadge tone="neutral">Cohérence</CoachingPlanBadge>
          <CoachingPlanBadge tone="neutral">Consistance</CoachingPlanBadge>
          <CoachingPlanBadge tone="neutral">Persévérance</CoachingPlanBadge>
          <CoachingPlanBadge tone="neutral">Action</CoachingPlanBadge>
        </div>
      </div>
    </section>
  );
}

function CoachingPlanConstructionContent() {
  return (
    <div className="stack" style={{ gap: 18 }}>
      <section
        className="card stack"
        style={{
          gap: 16,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(37,99,235,0.20)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,64,175,0.92))",
          color: "#ffffff",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 320,
            height: 320,
            borderRadius: 999,
            background: "rgba(59,130,246,0.22)",
            filter: "blur(4px)",
          }}
        />

        <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
          <CoachingPlanBadge tone="dark">Coaching Plan</CoachingPlanBadge>
          <CoachingPlanBadge tone="dark">Section 3</CoachingPlanBadge>
          <CoachingPlanBadge tone="dark">Construction</CoachingPlanBadge>
        </div>

        <h1
          style={{
            margin: 0,
            maxWidth: 980,
            fontSize: 40,
            lineHeight: 1.04,
            fontWeight: 950,
            letterSpacing: "-0.065em",
            position: "relative",
          }}
        >
          La construction de l’engagement véritable
        </h1>

        <p
          style={{
            maxWidth: 1000,
            margin: 0,
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.76)",
            position: "relative",
          }}
        >
          Cette section explique que l’engagement véritable n’est pas seulement une intention.
          Il se construit avec une stratégie, un plan et des leviers d’exécution capables de
          transformer la trajectoire du Worker.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            position: "relative",
          }}
        >
          {[
            { label: "Modèles", value: "3" },
            { label: "Fondation", value: "Décision" },
            { label: "Structure", value: "Canvas" },
            { label: "Moteur", value: "Leviers" },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                borderRadius: 18,
                padding: 14,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
                {metric.label}
              </div>
              <div style={{ marginTop: 5, fontSize: 22, fontWeight: 900 }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ConstructionDiagram />

      <section className="card stack" style={{ gap: 14 }}>
        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="stack" style={{ gap: 5 }}>
            <div className="section-title">Les 3 modèles à expliquer au Worker</div>
            <div className="muted" style={{ lineHeight: 1.65, maxWidth: 980 }}>
              Le coach présente ces trois modèles comme les trois fondations pratiques de
              l’engagement : décider, planifier et exécuter.
            </div>
          </div>

          <CoachingPlanBadge tone="neutral">3 modèles</CoachingPlanBadge>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {CONSTRUCTION_MODELS.map((model) => (
            <ModelCard key={model.title} model={model} />
          ))}
        </div>
      </section>

      <section
        className="card stack"
        style={{
          gap: 14,
          border: "1px solid rgba(34,197,94,0.22)",
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(255,255,255,0.96))",
        }}
      >
        <CoachingPlanBadge tone="neutral">Positive Feeling</CoachingPlanBadge>

        <div className="section-title">Les effets attendus d’un engagement bien construit</div>

        <div className="muted" style={{ lineHeight: 1.75, maxWidth: 1080 }}>
          Lorsque l’engagement est construit avec stratégie, planning et exécution, le Worker peut
          ressentir une amélioration concrète de son rapport au travail, à sa trajectoire et à sa
          valeur professionnelle.
        </div>

        <div className="grid grid-3">
          {POSITIVE_FEELINGS.map((feeling) => (
            <div
              key={feeling}
              className="card-soft"
              style={{
                background: "rgba(255,255,255,0.76)",
                border: "1px solid rgba(34,197,94,0.16)",
              }}
            >
              <strong style={{ color: "#16a34a" }}>{feeling}</strong>
            </div>
          ))}
        </div>
      </section>

      <section
        className="card stack"
        style={{
          gap: 14,
          border: "1px solid rgba(37,99,235,0.18)",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(255,255,255,0.96))",
        }}
      >
        <CoachingPlanBadge tone="neutral">Message à transmettre</CoachingPlanBadge>

        <div className="section-title">Phrase coach pour introduire cette section</div>

        <div className="muted" style={{ lineHeight: 1.75, maxWidth: 1080 }}>
          “Maintenant que nous avons compris comment on passe progressivement vers l’action,
          nous allons construire ton engagement. Pour cela, nous allons travailler sur trois
          niveaux : une stratégie pour décider, un canvas pour structurer, et des leviers pour
          exécuter dans le réel.”
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Link className="button ghost" href="/admin/coaching-plan/initiation">
            Retour à l’initiation
          </Link>

          <Link className="button ghost" href="/admin/coaching-plan">
            Retour au Coaching Plan
          </Link>

          <Link className="button" href="/admin/coaching-plan/validation">
            Continuer vers la validation
          </Link>
        </div>
      </section>
    </div>
  );
}

function AdminCoachingPlanConstructionContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const me = await getAdminMe();
        setAdmin(me);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin profile.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <AdminShell
      activeHref="/admin/coaching-plan/construction"
      title="Coaching Plan — Construction"
      subtitle="Explain how true engagement is built through strategy, planning and execution levers."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {error ? (
        <div className="card" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="card stack" style={{ gap: 10 }}>
          <div className="section-title">Loading coaching construction...</div>
          <div className="muted">Preparing the third coaching plan section.</div>
        </div>
      ) : (
        <CoachingPlanConstructionContent />
      )}
    </AdminShell>
  );
}

export default function AdminCoachingPlanConstructionPage() {
  return (
    <AdminGuard>
      <AdminCoachingPlanConstructionContent />
    </AdminGuard>
  );
}