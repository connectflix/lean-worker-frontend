// frontend/app/admin/coaching-plan/validation/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

type ValidationTone = "rose" | "cyan" | "emerald";

type ValidationNotion = {
  order: number;
  title: string;
  question: string;
  jobType: string;
  canvasTitle: string;
  canvasSubtitle: string;
  tone: ValidationTone;
  objective: string;
  coachMessage: string;
  validationQuestion: string;
  concepts: string[];
};

const VALIDATION_NOTIONS: ValidationNotion[] = [
  {
    order: 1,
    title: "Raison",
    question: "Désirable ?",
    jobType: "Emotional Jobs",
    canvasTitle: "Ultimate Why Circles",
    canvasSubtitle: "Purpose Canvas",
    tone: "rose",
    objective:
      "Valider que l’engagement du Worker repose sur une raison profonde, une finalité et un lien clair avec ce qui le met réellement en mouvement.",
    coachMessage:
      "La raison répond à la question : pourquoi cet engagement mérite-t-il ton énergie, ton attention et ton implication ?",
    validationQuestion:
      "Est-ce que cet engagement est suffisamment désirable pour être poursuivi dans la durée ?",
    concepts: ["Travail", "Passion", "Aspiration", "Vocation", "Inspiration", "Formation"],
  },
  {
    order: 2,
    title: "Sens",
    question: "Viable ?",
    jobType: "Pivotal Jobs",
    canvasTitle: "Work Mental Structure",
    canvasSubtitle: "Significance Canvas",
    tone: "cyan",
    objective:
      "Valider que l’engagement possède une vraie valeur professionnelle et mentale pour le Worker, au-delà d’une simple occupation.",
    coachMessage:
      "Le sens permet de distinguer ce qui compte vraiment de ce qui occupe, fatigue ou détourne le Worker de sa trajectoire.",
    validationQuestion:
      "Est-ce que cet engagement a suffisamment de sens pour devenir une structure professionnelle solide ?",
    concepts: ["% Raison", "% Métier", "% Occupation", "% Corvée", "% Hobby"],
  },
  {
    order: 3,
    title: "Temps",
    question: "Faisable ?",
    jobType: "Functional Jobs",
    canvasTitle: "Work Your Jobs",
    canvasSubtitle: "Time Canvas",
    tone: "emerald",
    objective:
      "Valider que l’engagement est réaliste, soutenable et exécutable dans le temps réel du Worker.",
    coachMessage:
      "Le temps transforme l’engagement en réalité : sans capacité d’exécution, l’engagement reste une intention.",
    validationQuestion:
      "Est-ce que cet engagement est faisable avec le temps, l’expertise, le capital et les contraintes du Worker ?",
    concepts: ["Travail", "Expertise", "Capital", "Temps"],
  },
];

function getToneStyle(tone: ValidationTone) {
  if (tone === "rose") {
    return {
      accent: "#be123c",
      soft: "rgba(244,63,94,0.09)",
      strong: "rgba(244,63,94,0.17)",
      border: "1px solid rgba(244,63,94,0.26)",
      gradient:
        "linear-gradient(135deg, rgba(244,63,94,0.12), rgba(255,255,255,0.94))",
    };
  }

  if (tone === "cyan") {
    return {
      accent: "#0891b2",
      soft: "rgba(6,182,212,0.09)",
      strong: "rgba(6,182,212,0.17)",
      border: "1px solid rgba(6,182,212,0.26)",
      gradient:
        "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(255,255,255,0.94))",
    };
  }

  return {
    accent: "#16a34a",
    soft: "rgba(34,197,94,0.09)",
    strong: "rgba(34,197,94,0.17)",
    border: "1px solid rgba(34,197,94,0.26)",
    gradient:
      "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(255,255,255,0.94))",
  };
}

function CoachingPlanBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "dark" | ValidationTone;
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

function PurposeNetworkMiniature() {
  const nodes = [
    { label: "Travail", x: "48%", y: "8%" },
    { label: "Passion", x: "80%", y: "16%" },
    { label: "Aspiration", x: "86%", y: "48%" },
    { label: "Formation", x: "58%", y: "78%" },
    { label: "Inspiration", x: "28%", y: "72%" },
    { label: "Vocation", x: "22%", y: "35%" },
  ];

  const lines = [
    ["48%", "8%", "80%", "16%"],
    ["48%", "8%", "86%", "48%"],
    ["48%", "8%", "58%", "78%"],
    ["48%", "8%", "28%", "72%"],
    ["22%", "35%", "80%", "16%"],
    ["22%", "35%", "86%", "48%"],
    ["28%", "72%", "80%", "16%"],
    ["58%", "78%", "86%", "48%"],
    ["28%", "72%", "58%", "78%"],
  ];

  return (
    <div
      style={{
        position: "relative",
        minHeight: 260,
        borderRadius: 24,
        border: "1px solid rgba(15,23,42,0.10)",
        background:
          "radial-gradient(circle at 50% 40%, rgba(34,197,94,0.08), transparent 38%), rgba(255,255,255,0.78)",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {lines.map(([x1, y1, x2, y2], index) => (
          <line
            key={`${x1}-${y1}-${x2}-${y2}-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={index % 3 === 0 ? "rgba(239,68,68,0.34)" : "rgba(37,99,235,0.28)"}
            strokeWidth="0.55"
            strokeDasharray={index % 2 === 0 ? "4 4" : undefined}
          />
        ))}
      </svg>

      {nodes.map((node) => (
        <div
          key={node.label}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            transform: "translate(-50%, -50%)",
            minWidth: 110,
            minHeight: 54,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            border: "1px dashed rgba(15,23,42,0.22)",
            background: "rgba(255,255,255,0.92)",
            color: "#334155",
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          {node.label}
        </div>
      ))}
    </div>
  );
}

function SignificanceBarMiniature() {
  const items = [
    { label: "% Raison", background: "rgba(251,191,36,0.13)" },
    { label: "% Métier", background: "rgba(244,63,94,0.10)" },
    { label: "% Occupation", background: "rgba(34,197,94,0.10)" },
    { label: "% Corvée", background: "rgba(99,102,241,0.10)" },
    { label: "% Hobby", background: "rgba(239,68,68,0.10)" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(120px, 1fr))",
        minWidth: 680,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(15,23,42,0.14)",
        background: "#ffffff",
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          style={{
            minHeight: 82,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            padding: 12,
            background: item.background,
            borderRight: index === items.length - 1 ? "none" : "1px solid rgba(15,23,42,0.12)",
            fontWeight: 950,
            color: "#334155",
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

function TimeTriangleMiniature() {
  const nodes = [
    { label: "Travail", x: "22%", y: "20%" },
    { label: "Expertise", x: "50%", y: "20%" },
    { label: "Capital", x: "78%", y: "20%" },
    { label: "Temps", x: "50%", y: "80%" },
  ];

  const lines = [
    ["22%", "20%", "50%", "20%"],
    ["50%", "20%", "78%", "20%"],
    ["22%", "20%", "50%", "80%"],
    ["78%", "20%", "50%", "80%"],
  ];

  return (
    <div
      style={{
        position: "relative",
        minHeight: 250,
        borderRadius: 24,
        border: "1px solid rgba(15,23,42,0.10)",
        background:
          "radial-gradient(circle at 50% 65%, rgba(34,197,94,0.08), transparent 40%), rgba(255,255,255,0.78)",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {lines.map(([x1, y1, x2, y2], index) => (
          <line
            key={`${x1}-${y1}-${x2}-${y2}-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={index === 2 ? "rgba(239,68,68,0.36)" : "rgba(37,99,235,0.28)"}
            strokeWidth="0.65"
            strokeDasharray={index === 2 ? "5 4" : undefined}
          />
        ))}
      </svg>

      {nodes.map((node) => (
        <div
          key={node.label}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            transform: "translate(-50%, -50%)",
            width: 104,
            height: 58,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            border: "1px dashed rgba(15,23,42,0.22)",
            background: "rgba(255,255,255,0.92)",
            color: "#334155",
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          {node.label}
        </div>
      ))}
    </div>
  );
}

function ValidationNotionCard({ notion }: { notion: ValidationNotion }) {
  const tone = getToneStyle(notion.tone);

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
        <CoachingPlanBadge tone={notion.tone}>{notion.question}</CoachingPlanBadge>

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
          {notion.order}
        </span>
      </div>

      <div className="stack" style={{ gap: 6 }}>
        <div
          className="section-title"
          style={{
            color: tone.accent,
            fontSize: 24,
            letterSpacing: "-0.05em",
          }}
        >
          {notion.title}
        </div>

        <CoachingPlanBadge tone="neutral">{notion.jobType}</CoachingPlanBadge>

        <div className="muted" style={{ lineHeight: 1.65 }}>
          {notion.objective}
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
        <strong>{notion.canvasTitle}</strong>
        <div className="muted" style={{ marginTop: 4 }}>
          {notion.canvasSubtitle}
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
        <strong>Question de validation</strong>
        <div className="muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
          {notion.validationQuestion}
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        {notion.concepts.map((concept) => (
          <CoachingPlanBadge key={concept} tone="neutral">
            {concept}
          </CoachingPlanBadge>
        ))}
      </div>
    </article>
  );
}

function ValidationDiagram() {
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
          <div className="section-title">Modèle de validation</div>
          <div className="muted" style={{ lineHeight: 1.65, maxWidth: 980 }}>
            L’engagement véritable doit être validé sur trois dimensions : une raison profonde,
            un sens professionnel et une faisabilité dans le temps réel du Worker.
          </div>
        </div>

        <CoachingPlanBadge tone="neutral">Raison → Sens → Temps</CoachingPlanBadge>
      </div>

      <div
        style={{
          minWidth: 1180,
          display: "grid",
          gridTemplateColumns: "190px 1fr",
          gap: 20,
          alignItems: "center",
        }}
      >
        <div
          style={{
            minHeight: 170,
            borderRadius: 24,
            border: "1px solid rgba(34,197,94,0.30)",
            background: "rgba(34,197,94,0.05)",
            display: "grid",
            placeItems: "center",
            color: "#16a34a",
            fontSize: 30,
            fontWeight: 950,
            letterSpacing: "-0.06em",
          }}
        >
          Engagement
        </div>

        <div className="stack" style={{ gap: 14 }}>
          {VALIDATION_NOTIONS.map((notion) => {
            const tone = getToneStyle(notion.tone);

            return (
              <div
                key={notion.title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "130px 160px 1fr",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    color: tone.accent,
                    fontWeight: 950,
                    fontSize: 22,
                    letterSpacing: "-0.05em",
                  }}
                >
                  {notion.title}
                </div>

                <div className="stack" style={{ gap: 5 }}>
                  <strong style={{ color: "#334155" }}>{notion.question}</strong>
                  <span
                    style={{
                      color: tone.accent,
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {notion.jobType}
                  </span>
                </div>

                <div
                  style={{
                    minHeight: 72,
                    borderRadius: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 18px",
                    border: tone.border,
                    background: tone.soft,
                  }}
                >
                  <div>
                    <strong style={{ color: tone.accent }}>{notion.canvasTitle}</strong>
                    <div className="muted" style={{ marginTop: 3 }}>
                      {notion.canvasSubtitle}
                    </div>
                  </div>

                  <CoachingPlanBadge tone={notion.tone}>
                    {notion.order}
                  </CoachingPlanBadge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CoachingPlanValidationContent() {
  return (
    <div className="stack" style={{ gap: 18 }}>
      <section
        className="card stack"
        style={{
          gap: 16,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(34,197,94,0.20)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(22,101,52,0.92))",
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
            background: "rgba(34,197,94,0.22)",
            filter: "blur(4px)",
          }}
        />

        <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
          <CoachingPlanBadge tone="dark">Coaching Plan</CoachingPlanBadge>
          <CoachingPlanBadge tone="dark">Section 4</CoachingPlanBadge>
          <CoachingPlanBadge tone="dark">Validation</CoachingPlanBadge>
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
          La validation de l’engagement véritable
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
          Cette section explique comment vérifier que l’engagement du Worker est réellement
          pertinent, effectif et soutenable : il doit être désirable, viable et faisable.
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
            { label: "Notions", value: "3" },
            { label: "Désirable", value: "Raison" },
            { label: "Viable", value: "Sens" },
            { label: "Faisable", value: "Temps" },
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

      <ValidationDiagram />

      <section className="card stack" style={{ gap: 14 }}>
        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="stack" style={{ gap: 5 }}>
            <div className="section-title">Les 3 notions de validation</div>
            <div className="muted" style={{ lineHeight: 1.65, maxWidth: 980 }}>
              Le coach utilise ces trois notions pour aider le Worker à tester la solidité de son
              engagement avant de le transformer en plan d’action.
            </div>
          </div>

          <CoachingPlanBadge tone="neutral">3 tests</CoachingPlanBadge>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {VALIDATION_NOTIONS.map((notion) => (
            <ValidationNotionCard key={notion.title} notion={notion} />
          ))}
        </div>
      </section>

      <section className="card stack" style={{ gap: 14 }}>
        <div className="section-title">Illustrations des canvas de validation</div>

        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card-soft stack" style={{ gap: 12 }}>
            <CoachingPlanBadge tone="rose">Raison / Purpose Canvas</CoachingPlanBadge>
            <PurposeNetworkMiniature />
          </div>

          <div className="card-soft stack" style={{ gap: 12, overflowX: "auto" }}>
            <CoachingPlanBadge tone="cyan">Sens / Significance Canvas</CoachingPlanBadge>
            <SignificanceBarMiniature />
          </div>

          <div className="card-soft stack" style={{ gap: 12 }}>
            <CoachingPlanBadge tone="emerald">Temps / Time Canvas</CoachingPlanBadge>
            <TimeTriangleMiniature />
          </div>

          <div
            className="card-soft stack"
            style={{
              gap: 12,
              border: "1px solid rgba(34,197,94,0.22)",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(255,255,255,0.96))",
            }}
          >
            <CoachingPlanBadge tone="neutral">Synthèse</CoachingPlanBadge>

            <div className="section-title" style={{ fontSize: 20 }}>
              Quand l’engagement est validé
            </div>

            <div className="muted" style={{ lineHeight: 1.7 }}>
              L’engagement véritable est validé lorsque le Worker peut expliquer pourquoi il
              s’engage, pourquoi cet engagement a du sens dans sa trajectoire et comment il peut
              réellement le soutenir dans le temps.
            </div>
          </div>
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

        <div className="section-title">Phrase coach pour clôturer le Coaching Plan</div>

        <div className="muted" style={{ lineHeight: 1.75, maxWidth: 1080 }}>
          “À la fin de ce coaching, nous ne chercherons pas seulement à dire que tu es engagé.
          Nous chercherons à le vérifier. Ton engagement devra avoir une raison claire, un sens
          professionnel réel et une faisabilité dans ton temps, tes ressources et ta trajectoire.”
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Link className="button ghost" href="/admin/coaching-plan/construction">
            Retour à la construction
          </Link>

          <Link className="button ghost" href="/admin/coaching-plan">
            Retour au Coaching Plan
          </Link>

          <Link className="button" href="/admin/coaching-guide">
            Aller au Coaching Guide
          </Link>
        </div>
      </section>
    </div>
  );
}

function AdminCoachingPlanValidationContent() {
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
      activeHref="/admin/coaching-plan/validation"
      title="Coaching Plan — Validation"
      subtitle="Validate true engagement through reason, meaning and feasible time-based execution."
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
          <div className="section-title">Loading coaching validation...</div>
          <div className="muted">Preparing the fourth coaching plan section.</div>
        </div>
      ) : (
        <CoachingPlanValidationContent />
      )}
    </AdminShell>
  );
}

export default function AdminCoachingPlanValidationPage() {
  return (
    <AdminGuard>
      <AdminCoachingPlanValidationContent />
    </AdminGuard>
  );
}