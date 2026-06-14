"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

type CoachingPlanSectionTone = "red" | "orange" | "blue" | "green";

type CoachingPlanSection = {
  id: string;
  title: string;
  eyebrow: string;
  href: string;
  tone: CoachingPlanSectionTone;
  objective: string;
  coachMessage: string;
  workerTakeaway: string;
  keyConcepts: string[];
};

const COACHING_PLAN_SECTIONS: CoachingPlanSection[] = [
  {
    id: "game",
    title: "1. Le jeu",
    eyebrow: "Clarifier le parcours",
    href: "/admin/coaching-plan/game",
    tone: "red",
    objective:
      "Faire ordonner au Worker une série de 12 images liées à l’environnement automobile afin de créer une prise de conscience pédagogique.",
    coachMessage:
      "Le coaching n’est pas une conversation improvisée. C’est un parcours structuré : clarification, apprentissage, configuration puis pilotage.",
    workerTakeaway:
      "Le Worker comprend qu’il va entrer dans un processus guidé, progressif et construit pour l’aider à mieux piloter sa trajectoire.",
    keyConcepts: [
      "Jeu d’ordonnancement",
      "Correction pédagogique",
      "Clarification",
      "Apprentissage",
      "Configuration",
      "Pilotage",
    ],
  },
  {
    id: "initiation",
    title: "2. L’initiation à l’engagement véritable",
    eyebrow: "Passer du désengagement à l’action",
    href: "/admin/coaching-plan/initiation",
    tone: "orange",
    objective:
      "Expliquer que l’engagement véritable se construit progressivement, depuis l’inaction jusqu’à l’action cohérente.",
    coachMessage:
      "L’engagement professionnel ne dépend pas uniquement de la motivation. Il se construit par volonté, discipline, persévérance et cohérence.",
    workerTakeaway:
      "Le Worker comprend où il se situe entre désengagement, réaction, proaction, traction et action.",
    keyConcepts: [
      "Désengagement",
      "Inaction",
      "Réaction",
      "Proaction",
      "Traction",
      "Action",
      "Cohérence",
    ],
  },
  {
    id: "construction",
    title: "3. La construction de l’engagement véritable",
    eyebrow: "Stratégie, planning, exécution",
    href: "/admin/coaching-plan/construction",
    tone: "blue",
    objective:
      "Présenter les trois grands modèles qui permettent de construire un engagement professionnel solide : stratégie, planning et exécution.",
    coachMessage:
      "L’engagement véritable devient possible lorsque le Worker prend de meilleures décisions, structure son engagement et active les bons leviers.",
    workerTakeaway:
      "Le Worker comprend que son engagement ne repose pas seulement sur une intention, mais sur un système de construction complet.",
    keyConcepts: [
      "Success Blueprint",
      "Decision Model",
      "Engagement Canvas",
      "Engagement Model",
      "Work Leverages",
      "Action Model",
    ],
  },
  {
    id: "validation",
    title: "4. La validation de l’engagement véritable",
    eyebrow: "Raison, sens, temps",
    href: "/admin/coaching-plan/validation",
    tone: "green",
    objective:
      "Expliquer comment valider la pertinence et l’effectivité de l’engagement véritable à travers trois notions essentielles.",
    coachMessage:
      "Un engagement professionnel est valide lorsqu’il est désirable, viable et faisable pour le Worker.",
    workerTakeaway:
      "Le Worker comprend que son engagement doit être relié à une raison profonde, un sens professionnel et une capacité réelle d’exécution.",
    keyConcepts: [
      "Raison",
      "Sens",
      "Temps",
      "Purpose Canvas",
      "Significance Canvas",
      "Time Canvas",
    ],
  },
];

function getToneStyle(tone: CoachingPlanSectionTone): {
  accent: string;
  background: string;
  border: string;
  softBackground: string;
  darkBackground: string;
} {
  if (tone === "red") {
    return {
      accent: "#dc2626",
      background: "rgba(239,68,68,0.10)",
      border: "1px solid rgba(239,68,68,0.22)",
      softBackground:
        "linear-gradient(135deg, rgba(239,68,68,0.09), rgba(255,255,255,0.96))",
      darkBackground:
        "linear-gradient(135deg, rgba(127,29,29,0.96), rgba(30,41,59,0.96))",
    };
  }

  if (tone === "orange") {
    return {
      accent: "#ea580c",
      background: "rgba(249,115,22,0.10)",
      border: "1px solid rgba(249,115,22,0.22)",
      softBackground:
        "linear-gradient(135deg, rgba(249,115,22,0.09), rgba(255,255,255,0.96))",
      darkBackground:
        "linear-gradient(135deg, rgba(124,45,18,0.96), rgba(30,41,59,0.96))",
    };
  }

  if (tone === "blue") {
    return {
      accent: "#2563eb",
      background: "rgba(37,99,235,0.10)",
      border: "1px solid rgba(37,99,235,0.22)",
      softBackground:
        "linear-gradient(135deg, rgba(37,99,235,0.09), rgba(255,255,255,0.96))",
      darkBackground:
        "linear-gradient(135deg, rgba(30,64,175,0.96), rgba(30,41,59,0.96))",
    };
  }

  return {
    accent: "#16a34a",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.22)",
    softBackground:
      "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(255,255,255,0.96))",
    darkBackground:
      "linear-gradient(135deg, rgba(22,101,52,0.96), rgba(30,41,59,0.96))",
  };
}

function CoachingPlanBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "dark" | CoachingPlanSectionTone;
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
            background: getToneStyle(tone).background,
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

function CoachingPlanHero() {
  return (
    <section
      className="card stack"
      style={{
        gap: 16,
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(79,70,229,0.20)",
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))",
        color: "#ffffff",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -90,
          top: -90,
          width: 280,
          height: 280,
          borderRadius: 999,
          background: "rgba(124,58,237,0.24)",
          filter: "blur(4px)",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "42%",
          bottom: -130,
          width: 320,
          height: 320,
          borderRadius: 999,
          background: "rgba(59,130,246,0.18)",
          filter: "blur(5px)",
        }}
      />

      <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
        <CoachingPlanBadge tone="dark">Enablement</CoachingPlanBadge>
        <CoachingPlanBadge tone="dark">Première séance</CoachingPlanBadge>
        <CoachingPlanBadge tone="dark">Support coach</CoachingPlanBadge>
      </div>

      <h1
        style={{
          margin: 0,
          maxWidth: 940,
          fontSize: 42,
          lineHeight: 1.04,
          fontWeight: 950,
          letterSpacing: "-0.065em",
          position: "relative",
        }}
      >
        Coaching Plan
      </h1>

      <p
        style={{
          maxWidth: 980,
          margin: 0,
          lineHeight: 1.75,
          color: "rgba(255,255,255,0.74)",
          position: "relative",
        }}
      >
        Un support pédagogique à utiliser dès la première séance pour expliquer au Worker
        l’intention du coaching, les notions clés qui vont être manipulées et la manière dont
        l’engagement véritable sera initié, construit puis validé.
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
          { label: "Sections", value: COACHING_PLAN_SECTIONS.length },
          { label: "Usage", value: "First session" },
          { label: "Core outcome", value: "Engagement" },
          { label: "Format", value: "Visual plan" },
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
  );
}

function CoachingPlanSectionCard({ section }: { section: CoachingPlanSection }) {
  const toneStyle = getToneStyle(section.tone);

  return (
    <article
      className="card stack"
      style={{
        gap: 15,
        minHeight: 420,
        border: toneStyle.border,
        background: toneStyle.softBackground,
        boxShadow: "0 18px 42px rgba(15,23,42,0.06)",
      }}
    >
      <div className="row space-between" style={{ gap: 10, flexWrap: "wrap" }}>
        <CoachingPlanBadge tone={section.tone}>{section.eyebrow}</CoachingPlanBadge>

        <span
          aria-hidden="true"
          style={{
            width: 38,
            height: 38,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: toneStyle.background,
            border: toneStyle.border,
            color: toneStyle.accent,
            fontWeight: 950,
          }}
        >
          {section.title.split(".")[0]}
        </span>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <h2
          className="section-title"
          style={{
            fontSize: 24,
            lineHeight: 1.1,
            letterSpacing: "-0.045em",
          }}
        >
          {section.title}
        </h2>

        <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
          {section.objective}
        </p>
      </div>

      <div
        className="card-soft stack"
        style={{
          gap: 7,
          background: "rgba(255,255,255,0.74)",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <strong>Message coach</strong>
        <div className="muted" style={{ lineHeight: 1.6 }}>
          {section.coachMessage}
        </div>
      </div>

      <div
        className="card-soft stack"
        style={{
          gap: 7,
          background: "rgba(255,255,255,0.62)",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <strong>Ce que le Worker doit comprendre</strong>
        <div className="muted" style={{ lineHeight: 1.6 }}>
          {section.workerTakeaway}
        </div>
      </div>

      <div className="row" style={{ gap: 7, flexWrap: "wrap" }}>
        {section.keyConcepts.map((concept) => (
          <span
            key={concept}
            style={{
              borderRadius: 999,
              padding: "7px 9px",
              fontSize: 11,
              fontWeight: 850,
              background: "rgba(255,255,255,0.70)",
              border: "1px solid rgba(15,23,42,0.08)",
              color: "#334155",
            }}
          >
            {concept}
          </span>
        ))}
      </div>

      <Link
        className="button"
        href={section.href}
        style={{
          marginTop: "auto",
          width: "100%",
          justifyContent: "center",
          minHeight: 44,
          borderRadius: 16,
          background: toneStyle.accent,
          borderColor: toneStyle.accent,
          color: "#ffffff",
          textDecoration: "none",
        }}
      >
        Ouvrir cette section
      </Link>
    </article>
  );
}

function CoachingPlanOverview() {
  const allConcepts = useMemo(() => {
    return COACHING_PLAN_SECTIONS.reduce<string[]>((items, section) => {
      section.keyConcepts.forEach((concept) => {
        if (!items.includes(concept)) {
          items.push(concept);
        }
      });

      return items;
    }, []);
  }, []);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <CoachingPlanHero />

      <section className="card stack" style={{ gap: 14 }}>
        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="stack" style={{ gap: 5 }}>
            <div className="section-title">Structure du Coaching Plan</div>
            <div className="muted" style={{ lineHeight: 1.65, maxWidth: 960 }}>
              Les quatre sections sont conçues pour être présentées au Worker dans l’ordre.
              Elles installent le cadre du coaching, expliquent l’engagement véritable et donnent
              au coach une narration pédagogique claire.
            </div>
          </div>

          <CoachingPlanBadge tone="neutral">
            {COACHING_PLAN_SECTIONS.length} sections
          </CoachingPlanBadge>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {COACHING_PLAN_SECTIONS.map((section) => (
            <CoachingPlanSectionCard key={section.id} section={section} />
          ))}
        </div>
      </section>

      <section
        className="card stack"
        style={{
          gap: 14,
          border: "1px solid rgba(34,197,94,0.20)",
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(255,255,255,0.96))",
        }}
      >
        <div className="section-title">Intention générale à communiquer au Worker</div>

        <div className="muted" style={{ lineHeight: 1.75, maxWidth: 1040 }}>
          Ce coaching vise à aider le Worker à passer d’une situation potentiellement subie,
          dispersée ou peu lisible vers un engagement professionnel plus clair, plus cohérent et
          plus effectif. Le plan explique pourquoi le coaching existe, comment il va se dérouler,
          quels modèles seront utilisés et comment l’engagement sera validé dans le réel.
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {allConcepts.map((concept) => (
            <CoachingPlanBadge key={concept} tone="neutral">
              {concept}
            </CoachingPlanBadge>
          ))}
        </div>
      </section>

      <section className="card stack" style={{ gap: 14 }}>
        <div className="section-title">Mode d’utilisation recommandé</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              title: "1. Présenter le cadre",
              text:
                "Le coach explique que la première séance commence par une mise en contexte visuelle et pédagogique.",
            },
            {
              title: "2. Faire vivre le jeu",
              text:
                "Le Worker ordonne les images, puis le coach affiche la correction pour introduire la logique du parcours.",
            },
            {
              title: "3. Expliquer l’engagement",
              text:
                "Le coach montre comment l’engagement véritable s’initie, se construit et se valide.",
            },
            {
              title: "4. Relier aux canvas",
              text:
                "Le coach annonce que Purpose Canvas, Significance Canvas, Engagement Canvas et Time Canvas seront utilisés pour rendre le coaching concret.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="card-soft stack"
              style={{
                gap: 8,
                background: "rgba(255,255,255,0.78)",
              }}
            >
              <strong>{item.title}</strong>
              <div className="muted" style={{ lineHeight: 1.6 }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminCoachingPlanContent() {
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
      activeHref="/admin/coaching-plan"
      title="Coaching Plan"
      subtitle="First-session coaching plan to explain the intention, concepts and expected journey to the Worker."
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
          <div className="section-title">Loading coaching plan...</div>
          <div className="muted">Preparing the coaching enablement plan workspace.</div>
        </div>
      ) : (
        <CoachingPlanOverview />
      )}
    </AdminShell>
  );
}

export default function AdminCoachingPlanPage() {
  return (
    <AdminGuard>
      <AdminCoachingPlanContent />
    </AdminGuard>
  );
}