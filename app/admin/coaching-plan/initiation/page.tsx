// frontend/app/admin/coaching-plan/initiation/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

type StageTone = "red" | "orange" | "purple" | "blue" | "green";

type EngagementStage = {
  order: number;
  title: string;
  upperLabel: string;
  lowerLabel: string;
  tone: StageTone;
  explanation: string;
  coachMessage: string;
};

const ENGAGEMENT_STAGES: EngagementStage[] = [
  {
    order: 1,
    title: "Inaction",
    upperLabel: "Abandon",
    lowerLabel: "Découragement",
    tone: "red",
    explanation:
      "Le Worker est bloqué, évite l’action ou ne sait plus comment avancer. L’énergie est faible et la situation semble subie.",
    coachMessage:
      "À ce stade, le coach aide d’abord le Worker à reconnaître la situation sans jugement.",
  },
  {
    order: 2,
    title: "Réaction",
    upperLabel: "Volonté",
    lowerLabel: "Détermination",
    tone: "orange",
    explanation:
      "Le Worker commence à réagir. Il ne pilote pas encore pleinement, mais il retrouve une intention de mouvement.",
    coachMessage:
      "Le coach transforme la réaction en première volonté structurée : que veux-tu reprendre en main ?",
  },
  {
    order: 3,
    title: "Proaction",
    upperLabel: "Motivation",
    lowerLabel: "Discipline",
    tone: "purple",
    explanation:
      "Le Worker commence à anticiper, choisir et agir avec plus de conscience. L’action devient moins subie.",
    coachMessage:
      "Le coach aide à passer d’une motivation ponctuelle à une discipline visible dans les choix.",
  },
  {
    order: 4,
    title: "Traction",
    upperLabel: "Conviction",
    lowerLabel: "Assurance",
    tone: "blue",
    explanation:
      "Le Worker génère du mouvement. Ses actions commencent à produire des effets, mais l’effort doit encore être consolidé.",
    coachMessage:
      "Le coach aide à maintenir le mouvement malgré les résistances, les obstacles et les retours en arrière.",
  },
  {
    order: 5,
    title: "Action",
    upperLabel: "Consistance",
    lowerLabel: "Persévérance",
    tone: "green",
    explanation:
      "Le Worker agit de manière plus stable, plus cohérente et plus répétée. L’engagement devient observable.",
    coachMessage:
      "Le coach aide à transformer l’action en engagement durable, concret et aligné.",
  },
];

function getToneStyle(tone: StageTone) {
  if (tone === "red") {
    return {
      accent: "#dc2626",
      soft: "rgba(239,68,68,0.08)",
      strong: "rgba(239,68,68,0.16)",
      border: "1px solid rgba(239,68,68,0.28)",
    };
  }

  if (tone === "orange") {
    return {
      accent: "#f97316",
      soft: "rgba(249,115,22,0.08)",
      strong: "rgba(249,115,22,0.16)",
      border: "1px solid rgba(249,115,22,0.28)",
    };
  }

  if (tone === "purple") {
    return {
      accent: "#a855f7",
      soft: "rgba(168,85,247,0.08)",
      strong: "rgba(168,85,247,0.16)",
      border: "1px solid rgba(168,85,247,0.28)",
    };
  }

  if (tone === "blue") {
    return {
      accent: "#2563eb",
      soft: "rgba(37,99,235,0.08)",
      strong: "rgba(37,99,235,0.16)",
      border: "1px solid rgba(37,99,235,0.28)",
    };
  }

  return {
    accent: "#16a34a",
    soft: "rgba(34,197,94,0.08)",
    strong: "rgba(34,197,94,0.16)",
    border: "1px solid rgba(34,197,94,0.28)",
  };
}

function CoachingPlanBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "dark" | StageTone;
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

function TransformationDiagram() {
  return (
    <section
      className="card stack"
      style={{
        gap: 22,
        overflowX: "auto",
        border: "1px solid rgba(15,23,42,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
      }}
    >
      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 5 }}>
          <div className="section-title">Modèle d’initiation</div>
          <div className="muted" style={{ lineHeight: 1.65, maxWidth: 920 }}>
            Le passage à l’engagement véritable se fait progressivement : le Worker sort du
            désengagement pour avancer vers une action cohérente, consistante et durable.
          </div>
        </div>

        <CoachingPlanBadge tone="neutral">Désengagement → Engagement</CoachingPlanBadge>
      </div>

      <div
        style={{
          minWidth: 1120,
          padding: "18px 8px 8px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "190px repeat(5, 1fr) 190px",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: 150,
              borderRadius: 22,
              border: "1px solid rgba(239,68,68,0.32)",
              background: "rgba(239,68,68,0.04)",
              display: "grid",
              placeItems: "center",
              color: "#dc2626",
              fontSize: 24,
              fontWeight: 950,
              letterSpacing: "-0.05em",
            }}
          >
            Désengagement
          </div>

          {ENGAGEMENT_STAGES.map((stage) => {
            const tone = getToneStyle(stage.tone);

            return (
              <div key={stage.title} className="stack" style={{ gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    color: tone.accent,
                    fontSize: 22,
                    fontWeight: 950,
                    letterSpacing: "-0.05em",
                    minHeight: 30,
                    textAlign: "center",
                  }}
                >
                  {stage.upperLabel}
                </div>

                <div
                  style={{
                    width: "100%",
                    minHeight: 64,
                    borderRadius: 18,
                    border: tone.border,
                    background: tone.soft,
                    display: "grid",
                    placeItems: "center",
                    color: tone.accent,
                    fontSize: 20,
                    fontWeight: 950,
                    letterSpacing: "-0.04em",
                    boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
                  }}
                >
                  {stage.title}
                </div>

                <div
                  style={{
                    color: tone.accent,
                    fontSize: 20,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    textAlign: "center",
                    minHeight: 30,
                  }}
                >
                  {stage.lowerLabel}
                </div>
              </div>
            );
          })}

          <div
            style={{
              height: 150,
              borderRadius: 22,
              border: "1px solid rgba(34,197,94,0.32)",
              background: "rgba(34,197,94,0.05)",
              display: "grid",
              placeItems: "center",
              color: "#16a34a",
              fontSize: 28,
              fontWeight: 950,
              letterSpacing: "-0.055em",
            }}
          >
            Engagement
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            display: "grid",
            gridTemplateColumns: "190px 1fr 190px",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div />

          <div
            style={{
              position: "relative",
              height: 44,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                height: 2,
                width: "100%",
                background:
                  "linear-gradient(90deg, rgba(37,99,235,0.10), rgba(37,99,235,0.85), rgba(34,197,94,0.85))",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: -24,
                color: "#2563eb",
                fontSize: 20,
                fontWeight: 950,
                letterSpacing: "-0.05em",
              }}
            >
              Cohérence
            </div>
          </div>

          <div />
        </div>
      </div>
    </section>
  );
}

function StageDetailCard({ stage }: { stage: EngagementStage }) {
  const tone = getToneStyle(stage.tone);

  return (
    <article
      className="card-soft stack"
      style={{
        gap: 12,
        borderRadius: 24,
        border: tone.border,
        background: `linear-gradient(135deg, ${tone.soft}, rgba(255,255,255,0.88))`,
      }}
    >
      <div className="row space-between" style={{ gap: 10, flexWrap: "wrap" }}>
        <CoachingPlanBadge tone={stage.tone}>{stage.upperLabel}</CoachingPlanBadge>

        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: tone.strong,
            color: tone.accent,
            fontWeight: 950,
          }}
        >
          {stage.order}
        </span>
      </div>

      <div className="stack" style={{ gap: 5 }}>
        <div
          className="section-title"
          style={{
            color: tone.accent,
            fontSize: 22,
            letterSpacing: "-0.05em",
          }}
        >
          {stage.title}
        </div>

        <div className="muted" style={{ lineHeight: 1.65 }}>
          {stage.explanation}
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
          {stage.coachMessage}
        </div>
      </div>

      <CoachingPlanBadge tone={stage.tone}>{stage.lowerLabel}</CoachingPlanBadge>
    </article>
  );
}

function CoachingPlanInitiationContent() {
  return (
    <div className="stack" style={{ gap: 18 }}>
      <section
        className="card stack"
        style={{
          gap: 16,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(249,115,22,0.20)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(124,45,18,0.92))",
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
            background: "rgba(249,115,22,0.24)",
            filter: "blur(4px)",
          }}
        />

        <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
          <CoachingPlanBadge tone="dark">Coaching Plan</CoachingPlanBadge>
          <CoachingPlanBadge tone="dark">Section 2</CoachingPlanBadge>
          <CoachingPlanBadge tone="dark">Engagement véritable</CoachingPlanBadge>
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
          L’initiation à l’engagement véritable
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
          Cette section explique au Worker que l’engagement professionnel ne se décrète pas.
          Il se construit par une progression : sortir de l’inaction, réagir, devenir proactif,
          générer de la traction, puis agir avec cohérence et consistance.
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
            { label: "Point de départ", value: "Désengagement" },
            { label: "Paliers", value: "5" },
            { label: "Moteur", value: "Cohérence" },
            { label: "Finalité", value: "Engagement" },
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

      <TransformationDiagram />

      <section className="card stack" style={{ gap: 14 }}>
        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="stack" style={{ gap: 5 }}>
            <div className="section-title">Lecture pédagogique des paliers</div>
            <div className="muted" style={{ lineHeight: 1.65, maxWidth: 960 }}>
              Chaque palier aide le coach à situer le Worker et à expliquer ce qui doit évoluer
              pour atteindre un engagement réel et observable.
            </div>
          </div>

          <CoachingPlanBadge tone="neutral">5 paliers</CoachingPlanBadge>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {ENGAGEMENT_STAGES.map((stage) => (
            <StageDetailCard key={stage.title} stage={stage} />
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
        <CoachingPlanBadge tone="neutral">Cohérence</CoachingPlanBadge>

        <div className="section-title">Le rôle central de la cohérence</div>

        <div className="muted" style={{ lineHeight: 1.75, maxWidth: 1080 }}>
          La cohérence est le fil conducteur de l’engagement véritable. Sans cohérence, l’action
          peut exister, mais elle reste dispersée, fragile ou contradictoire. Avec cohérence,
          chaque action devient un élément de trajectoire : elle relie l’identité, le but, les
          choix, les efforts et les résultats du Worker.
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
        <CoachingPlanBadge tone="neutral">Message à transmettre</CoachingPlanBadge>

        <div className="section-title">Phrase coach pour introduire cette section</div>

        <div className="muted" style={{ lineHeight: 1.75, maxWidth: 1080 }}>
          “L’objectif du coaching n’est pas seulement de te motiver. La motivation seule peut
          disparaître. Nous allons plutôt construire un engagement véritable : une manière d’agir
          qui devient cohérente avec ce que tu veux, ce que tu fais, ce que tu construis et ce que
          tu es prêt à soutenir dans la durée.”
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Link className="button ghost" href="/admin/coaching-plan/game">
            Retour au jeu
          </Link>

          <Link className="button ghost" href="/admin/coaching-plan">
            Retour au Coaching Plan
          </Link>

          <Link className="button" href="/admin/coaching-plan/construction">
            Continuer vers la construction
          </Link>
        </div>
      </section>
    </div>
  );
}

function AdminCoachingPlanInitiationContent() {
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
      activeHref="/admin/coaching-plan/initiation"
      title="Coaching Plan — Initiation"
      subtitle="Introduce true engagement as a progressive shift from disengagement to coherent action."
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
          <div className="section-title">Loading coaching initiation...</div>
          <div className="muted">Preparing the second coaching plan section.</div>
        </div>
      ) : (
        <CoachingPlanInitiationContent />
      )}
    </AdminShell>
  );
}

export default function AdminCoachingPlanInitiationPage() {
  return (
    <AdminGuard>
      <AdminCoachingPlanInitiationContent />
    </AdminGuard>
  );
}