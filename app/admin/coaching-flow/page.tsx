"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

type FlowStepType = "start" | "activity" | "decision" | "end";

type FlowStep = {
  id: string;
  type: FlowStepType;
  title: string;
  subtitle?: string;
  canvas?: string;
};

type FlowPhase = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tone: "blue" | "purple" | "teal";
  steps: FlowStep[];
};

const FLOW_PHASES: FlowPhase[] = [
  {
    id: "phase-1",
    number: "1",
    title: "Cadrage & compréhension",
    subtitle: "Comprendre le worker avant de structurer.",
    tone: "blue",
    steps: [
      {
        id: "start",
        type: "start",
        title: "Début",
      },
      {
        id: "worker-entry",
        type: "activity",
        title: "Entrée du Worker",
        subtitle: "Profil, contexte, historique, signaux déjà connus.",
      },
      {
        id: "prepare-session",
        type: "activity",
        title: "Préparer la session",
        subtitle: "Lire le profil et clarifier l’intention du coaching.",
      },
      {
        id: "explore-situation",
        type: "activity",
        title: "Explorer la situation actuelle",
        subtitle: "Faits, ressentis, tensions, aspirations, irritants.",
      },
      {
        id: "need-clear",
        type: "decision",
        title: "Le besoin est-il clair ?",
        subtitle: "Oui : continuer. Non : approfondir.",
      },
      {
        id: "targeted-questions",
        type: "activity",
        title: "Approfondir avec questions ciblées",
        subtitle: "Reformuler, creuser, demander des exemples concrets.",
      },
    ],
  },
  {
    id: "phase-2",
    number: "2",
    title: "Structuration & coaching",
    subtitle: "Transformer la conversation en lecture exploitable.",
    tone: "purple",
    steps: [
      {
        id: "choose-canvas",
        type: "activity",
        title: "Choisir le canvas pertinent",
        subtitle: "Sélectionner le bon outil selon le besoin du worker.",
      },
      {
        id: "engagement-canvas",
        type: "activity",
        title: "Engagement Canvas",
        subtitle: "Identité, missions, ambitions, vision, actions, objectifs.",
        canvas: "Engagement",
      },
      {
        id: "purpose-canvas",
        type: "activity",
        title: "Purpose Canvas",
        subtitle: "Travail, aspiration, inspiration, passion, vocation, formation.",
        canvas: "Purpose",
      },
      {
        id: "significance-canvas",
        type: "activity",
        title: "Significance Canvas",
        subtitle: "Raison, métier, occupation, corvée, hobby.",
        canvas: "Significance",
      },
      {
        id: "time-canvas",
        type: "activity",
        title: "Time Canvas",
        subtitle: "Temps disponible, contraintes, énergie, rituels, priorités, risques.",
        canvas: "Time",
      },
      {
        id: "synthesis",
        type: "activity",
        title: "Synthétiser la lecture du Worker",
        subtitle: "Relier les signaux et dégager une compréhension structurée.",
      },
      {
        id: "orientation-clear",
        type: "decision",
        title: "Une orientation claire émerge-t-elle ?",
        subtitle: "Non : compléter les canvas. Oui : définir les leviers.",
      },
      {
        id: "complete-canvas",
        type: "activity",
        title: "Reformuler / compléter les canvas",
        subtitle: "Clarifier les blocs faibles ou trop vagues.",
      },
      {
        id: "recommendations",
        type: "activity",
        title: "Définir recommandations et leviers",
        subtitle: "Actions, coach, mentor, book, training, AI artifact, opportunité.",
      },
      {
        id: "validate-worker",
        type: "activity",
        title: "Valider avec le Worker",
        subtitle: "Priorités, niveau d’adhésion et prochaine étape.",
      },
      {
        id: "ready-to-act",
        type: "decision",
        title: "Le Worker est-il prêt à agir ?",
        subtitle: "Non : ajuster. Oui : passer à l’action.",
      },
      {
        id: "reinforce-clarity",
        type: "activity",
        title: "Renforcer la clarté",
        subtitle: "Adapter la recommandation ou simplifier le prochain pas.",
      },
    ],
  },
  {
    id: "phase-3",
    number: "3",
    title: "Mise en action & suivi",
    subtitle: "Rendre l’action réaliste et suivre la progression.",
    tone: "teal",
    steps: [
      {
        id: "action-plan",
        type: "activity",
        title: "Construire un plan d’action réaliste",
        subtitle: "Transformer l’intention en actions observables.",
      },
      {
        id: "activate-levers",
        type: "activity",
        title: "Activer les leviers utiles",
        subtitle: "Coach, mentor, book, training, AI artifact, job opportunity.",
      },
      {
        id: "action-feasible",
        type: "decision",
        title: "L’action est-elle faisable dans le temps réel ?",
        subtitle: "Non : ajuster avec Time Canvas. Oui : exécuter.",
      },
      {
        id: "adjust-time",
        type: "activity",
        title: "Ajuster avec le Time Canvas",
        subtitle: "Réduire, planifier ou protéger le temps d’exécution.",
      },
      {
        id: "execution",
        type: "activity",
        title: "Passage à l’action",
        subtitle: "Le Worker engage une première action concrète.",
      },
      {
        id: "progress-follow-up",
        type: "activity",
        title: "Suivi de progression",
        subtitle: "Bloquants, apprentissages, ajustements.",
      },
      {
        id: "goals-moving",
        type: "decision",
        title: "Les objectifs avancent-ils ?",
        subtitle: "Non : réviser. Oui : consolider.",
      },
      {
        id: "revise",
        type: "activity",
        title: "Réviser actions / recommandations / leviers",
        subtitle: "Réduire la friction et réaligner l’accompagnement.",
      },
      {
        id: "consolidate",
        type: "activity",
        title: "Consolider les acquis",
        subtitle: "Capitaliser sur ce qui fonctionne.",
      },
      {
        id: "durable-progress",
        type: "end",
        title: "Progression durable du Worker",
      },
    ],
  },
];

function getToneStyle(tone: FlowPhase["tone"]) {
  if (tone === "blue") {
    return {
      border: "rgba(59,130,246,0.28)",
      background: "rgba(59,130,246,0.06)",
      gradient: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(255,255,255,0.92))",
      strong: "#1d4ed8",
      soft: "rgba(59,130,246,0.12)",
      icon: "◎",
    };
  }

  if (tone === "purple") {
    return {
      border: "rgba(124,58,237,0.26)",
      background: "rgba(124,58,237,0.06)",
      gradient: "linear-gradient(135deg, rgba(124,58,237,0.11), rgba(255,255,255,0.92))",
      strong: "#6d28d9",
      soft: "rgba(124,58,237,0.12)",
      icon: "▦",
    };
  }

  return {
    border: "rgba(20,184,166,0.28)",
    background: "rgba(20,184,166,0.07)",
    gradient: "linear-gradient(135deg, rgba(20,184,166,0.12), rgba(255,255,255,0.92))",
    strong: "#0f766e",
    soft: "rgba(20,184,166,0.14)",
    icon: "↗",
  };
}

function getStepTypeLabel(type: FlowStepType): string {
  if (type === "start") return "Start";
  if (type === "activity") return "Activity";
  if (type === "decision") return "Decision";
  return "End";
}

function StepCard({ step, tone }: { step: FlowStep; tone: FlowPhase["tone"] }) {
  const toneStyle = getToneStyle(tone);

  if (step.type === "decision") {
    return (
      <div
        style={{
          width: 184,
          minHeight: 132,
          display: "grid",
          placeItems: "center",
          position: "relative",
          flex: "0 0 auto",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            transform: "rotate(45deg)",
            border: `2px solid ${toneStyle.strong}`,
            background: "rgba(255,255,255,0.98)",
            boxShadow: "0 18px 38px rgba(15,23,42,0.08)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 116,
            textAlign: "center",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 950,
              lineHeight: 1.22,
              color: toneStyle.strong,
            }}
          >
            {step.title}
          </div>

          {step.subtitle ? (
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                lineHeight: 1.25,
                color: "var(--muted-foreground, #64748b)",
              }}
            >
              {step.subtitle}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const isStartOrEnd = step.type === "start" || step.type === "end";

  return (
    <div
      style={{
        minWidth: isStartOrEnd ? 160 : 252,
        maxWidth: 292,
        minHeight: isStartOrEnd ? 74 : 126,
        borderRadius: isStartOrEnd ? 999 : 18,
        border: isStartOrEnd ? "none" : `1px solid ${toneStyle.border}`,
        background: isStartOrEnd
          ? step.type === "start"
            ? "#0f172a"
            : "linear-gradient(135deg, #0f766e, #14b8a6)"
          : "rgba(255,255,255,0.98)",
        color: isStartOrEnd ? "white" : "inherit",
        boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
        padding: isStartOrEnd ? "18px 22px" : 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
        flex: "0 0 auto",
      }}
    >
      <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
        <span
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            padding: "5px 9px",
            background: isStartOrEnd ? "rgba(255,255,255,0.12)" : toneStyle.soft,
            color: isStartOrEnd ? "rgba(255,255,255,0.86)" : toneStyle.strong,
            fontSize: 10,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {step.canvas || getStepTypeLabel(step.type)}
        </span>
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 950,
          lineHeight: 1.25,
          color: isStartOrEnd ? "white" : "#0f172a",
        }}
      >
        {step.title}
      </div>

      {step.subtitle ? (
        <div
          className="muted"
          style={{
            fontSize: 12,
            lineHeight: 1.45,
            color: isStartOrEnd ? "rgba(255,255,255,0.74)" : undefined,
          }}
        >
          {step.subtitle}
        </div>
      ) : null}
    </div>
  );
}

function Arrow({ label }: { label?: "Oui" | "Non" }) {
  return (
    <div
      style={{
        minWidth: 56,
        height: 38,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        position: "relative",
      }}
    >
      {label ? (
        <span
          style={{
            position: "absolute",
            top: -10,
            fontSize: 11,
            fontWeight: 900,
            color: label === "Oui" ? "#15803d" : "#dc2626",
          }}
        >
          {label}
        </span>
      ) : null}

      <div
        style={{
          width: "100%",
          height: 2,
          background: "#0f172a",
          opacity: 0.72,
        }}
      />

      <div
        style={{
          width: 0,
          height: 0,
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderLeft: "8px solid #0f172a",
          opacity: 0.72,
        }}
      />
    </div>
  );
}

function FlowPhaseView({ phase }: { phase: FlowPhase }) {
  const toneStyle = getToneStyle(phase.tone);
  const decisionCount = phase.steps.filter((step) => step.type === "decision").length;
  const canvasCount = phase.steps.filter((step) => Boolean(step.canvas)).length;

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        border: `1px solid ${toneStyle.border}`,
        background: toneStyle.background,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px minmax(0, 1fr)",
          minHeight: 250,
        }}
      >
        <div
          style={{
            borderRight: `1px solid ${toneStyle.border}`,
            padding: 22,
            background: toneStyle.gradient,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 18,
          }}
        >
          <div className="stack" style={{ gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                background: toneStyle.strong,
                color: "white",
                display: "grid",
                placeItems: "center",
                fontSize: 20,
                fontWeight: 950,
                boxShadow: "0 12px 28px rgba(15,23,42,0.16)",
              }}
            >
              {phase.number}
            </div>

            <div>
              <div
                style={{
                  fontSize: 21,
                  lineHeight: 1.14,
                  fontWeight: 950,
                  color: toneStyle.strong,
                  letterSpacing: "-0.04em",
                }}
              >
                {phase.title}
              </div>

              <div className="muted" style={{ marginTop: 8, lineHeight: 1.5 }}>
                {phase.subtitle}
              </div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge">{phase.steps.length} steps</span>
              <span className="badge">{decisionCount} decisions</span>
              {canvasCount > 0 ? <span className="badge">{canvasCount} canvas</span> : null}
            </div>
          </div>

          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 24,
              border: `1px solid ${toneStyle.border}`,
              background: toneStyle.soft,
              display: "grid",
              placeItems: "center",
              color: toneStyle.strong,
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            {toneStyle.icon}
          </div>
        </div>

        <div style={{ padding: 22, overflowX: "auto" }}>
          {phase.id === "phase-2" ? (
            <div className="stack" style={{ gap: 18, minWidth: 1120 }}>
              <div className="row" style={{ gap: 0, alignItems: "center" }}>
                <StepCard step={phase.steps[0]} tone={phase.tone} />
                <Arrow />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(210px, 1fr))",
                    gap: 12,
                    minWidth: 900,
                  }}
                >
                  {phase.steps.slice(1, 5).map((step) => (
                    <StepCard key={step.id} step={step} tone={phase.tone} />
                  ))}
                </div>
              </div>

              <div className="row" style={{ gap: 0, alignItems: "center" }}>
                <StepCard step={phase.steps[5]} tone={phase.tone} />
                <Arrow />
                <StepCard step={phase.steps[6]} tone={phase.tone} />
                <Arrow label="Non" />
                <StepCard step={phase.steps[7]} tone={phase.tone} />
              </div>

              <div className="row" style={{ gap: 0, alignItems: "center" }}>
                <StepCard step={phase.steps[8]} tone={phase.tone} />
                <Arrow />
                <StepCard step={phase.steps[9]} tone={phase.tone} />
                <Arrow />
                <StepCard step={phase.steps[10]} tone={phase.tone} />
                <Arrow label="Non" />
                <StepCard step={phase.steps[11]} tone={phase.tone} />
              </div>
            </div>
          ) : phase.id === "phase-3" ? (
            <div className="stack" style={{ gap: 18, minWidth: 1190 }}>
              <div className="row" style={{ gap: 0, alignItems: "center" }}>
                <StepCard step={phase.steps[0]} tone={phase.tone} />
                <Arrow />
                <StepCard step={phase.steps[1]} tone={phase.tone} />
                <Arrow />
                <StepCard step={phase.steps[2]} tone={phase.tone} />
                <Arrow label="Non" />
                <StepCard step={phase.steps[3]} tone={phase.tone} />
              </div>

              <div className="row" style={{ gap: 0, alignItems: "center" }}>
                <StepCard step={phase.steps[4]} tone={phase.tone} />
                <Arrow />
                <StepCard step={phase.steps[5]} tone={phase.tone} />
                <Arrow />
                <StepCard step={phase.steps[6]} tone={phase.tone} />
                <Arrow label="Non" />
                <StepCard step={phase.steps[7]} tone={phase.tone} />
              </div>

              <div className="row" style={{ gap: 0, alignItems: "center" }}>
                <StepCard step={phase.steps[8]} tone={phase.tone} />
                <Arrow label="Oui" />
                <StepCard step={phase.steps[9]} tone={phase.tone} />
              </div>
            </div>
          ) : (
            <div className="row" style={{ gap: 0, alignItems: "center", minWidth: 1190 }}>
              <StepCard step={phase.steps[0]} tone={phase.tone} />
              <Arrow />
              <StepCard step={phase.steps[1]} tone={phase.tone} />
              <Arrow />
              <StepCard step={phase.steps[2]} tone={phase.tone} />
              <Arrow />
              <StepCard step={phase.steps[3]} tone={phase.tone} />
              <Arrow />
              <StepCard step={phase.steps[4]} tone={phase.tone} />
              <Arrow label="Non" />
              <StepCard step={phase.steps[5]} tone={phase.tone} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendCard() {
  return (
    <div className="card stack" style={{ gap: 14 }}>
      <div className="section-title">Légende</div>

      <div className="row" style={{ gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 46,
            height: 28,
            borderRadius: 8,
            border: "1px solid rgba(59,130,246,0.5)",
            background: "rgba(59,130,246,0.06)",
          }}
        />
        <div className="muted">Activité</div>
      </div>

      <div className="row" style={{ gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 34,
            height: 34,
            transform: "rotate(45deg)",
            border: "1px solid rgba(124,58,237,0.7)",
            background: "rgba(124,58,237,0.06)",
          }}
        />
        <div className="muted">Décision</div>
      </div>

      <div className="row" style={{ gap: 10, alignItems: "center" }}>
        <Arrow />
        <div className="muted">Flux</div>
      </div>
    </div>
  );
}

function ExpectedResultsCard() {
  return (
    <div
      className="card stack"
      style={{
        gap: 14,
        border: "1px solid rgba(124,58,237,0.24)",
        background: "rgba(124,58,237,0.06)",
      }}
    >
      <div className="section-title">Résultats attendus</div>

      {[
        "Vision plus claire",
        "Actions réalistes",
        "Leviers adaptés",
        "Progression suivie",
      ].map((item) => (
        <div key={item} className="row" style={{ gap: 10, alignItems: "center" }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              background: "#6d28d9",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontSize: 13,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            ✓
          </span>

          <div style={{ fontWeight: 750 }}>{item}</div>
        </div>
      ))}
    </div>
  );
}

function CoachingFlowContent() {
  const stats = useMemo(() => {
    const allSteps = FLOW_PHASES.flatMap((phase) => phase.steps);

    return {
      phaseCount: FLOW_PHASES.length,
      canvasCount: allSteps.filter((step) => Boolean(step.canvas)).length,
      decisionCount: allSteps.filter((step) => step.type === "decision").length,
      stepCount: allSteps.length,
    };
  }, []);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div
        className="card stack"
        style={{
          gap: 14,
          border: "1px solid rgba(59,130,246,0.20)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))",
          color: "white",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -90,
            top: -90,
            width: 260,
            height: 260,
            borderRadius: 999,
            background: "rgba(20,184,166,0.22)",
            filter: "blur(4px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "42%",
            bottom: -120,
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "rgba(124,58,237,0.18)",
            filter: "blur(5px)",
          }}
        />

        <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
          <span
            style={{
              borderRadius: 999,
              padding: "8px 12px",
              background: "rgba(255,255,255,0.12)",
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Coaching Flow
          </span>

          <span
            style={{
              borderRadius: 999,
              padding: "8px 12px",
              background: "rgba(20,184,166,0.28)",
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            End-to-end Worker journey
          </span>
        </div>

        <div
          style={{
            fontSize: 34,
            lineHeight: 1.08,
            fontWeight: 950,
            position: "relative",
          }}
        >
          Parcours du Worker sur l’ensemble du coaching LeanWorker
        </div>

        <div
          style={{
            maxWidth: 980,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.74)",
            position: "relative",
          }}
        >
          Ce visuel présente la séquence complète du coaching : comprendre la situation,
          sélectionner les canvas pertinents, structurer les recommandations, activer les leviers
          et suivre la progression du Worker.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            position: "relative",
          }}
        >
          {[
            { label: "Phases", value: stats.phaseCount },
            { label: "Steps", value: stats.stepCount },
            { label: "Canvas", value: stats.canvasCount },
            { label: "Décisions clés", value: stats.decisionCount },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                borderRadius: 16,
                padding: 12,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
                {metric.label}
              </div>

              <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900 }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 310px",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div className="stack" style={{ gap: 16, minWidth: 0 }}>
          {FLOW_PHASES.map((phase) => (
            <FlowPhaseView key={phase.id} phase={phase} />
          ))}
        </div>

        <div
          className="stack"
          style={{
            gap: 16,
            position: "sticky",
            top: 96,
          }}
        >
          <ExpectedResultsCard />
          <LegendCard />

          <div
            className="card stack"
            style={{
              gap: 10,
              border: "1px solid rgba(245,158,11,0.22)",
              background: "rgba(245,158,11,0.07)",
            }}
          >
            <div className="section-title">Mindset d’utilisation</div>

            <div className="muted" style={{ lineHeight: 1.65 }}>
              Le flow ne remplace pas le jugement du coach. Il sert à garder une logique
              d’accompagnement claire : comprendre, structurer, décider, agir, suivre.
            </div>

            <Link className="button ghost" href="/admin/coaching-guide">
              Open Coaching Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCoachingFlowContent() {
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
      activeHref="/admin/coaching-flow"
      title="Coaching Flow"
      subtitle="Visual process flow for end-to-end worker coaching."
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
          <div className="section-title">Loading coaching flow...</div>
          <div className="muted">Preparing the end-to-end coaching journey workspace.</div>
        </div>
      ) : (
        <CoachingFlowContent />
      )}
    </AdminShell>
  );
}

export default function AdminCoachingFlowPage() {
  return (
    <AdminGuard>
      <AdminCoachingFlowContent />
    </AdminGuard>
  );
}