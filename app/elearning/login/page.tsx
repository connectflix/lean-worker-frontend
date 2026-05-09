"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getLinkedInAuthorizationUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { savePostLoginReturnTo } from "@/lib/post-login-routing";
import {
  BadgePill,
  CheckCircleIcon,
  PathIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

function ElearningLogo() {
  return (
    <div
      aria-label="LeanWorker E-Learning"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(16,185,129,0.14))",
          border: "1px solid rgba(37,99,235,0.18)",
          boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: "-0.04em",
        }}
      >
        <span
          style={{
            background: "linear-gradient(135deg, #2563eb, #10b981)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          LW
        </span>
      </div>

      <div className="stack" style={{ gap: 2 }}>
        <div className="title" style={{ fontSize: 26, margin: 0, lineHeight: 1 }}>
          LeanWorker E-Learning
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          Time’s UP! Academy
        </div>
      </div>
    </div>
  );
}

export default function ElearningLoginPage() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useMemo(
    () => ({
      eyebrow: "Programme de formation Lean Worker",
      heroTitle: "Time’s UP!",
      heroSubtitle: "Work this way or die trying",
      heroBody:
        "Une formation structurée pour apprendre à reprendre le contrôle de votre temps, clarifier votre trajectoire professionnelle et construire votre système Lean Worker.",
      checkingSession: "Vérification de votre session...",
      checkingSessionBody: "Préparation de votre espace de formation.",
      card1Title: "Chapitres vidéo",
      card1Body:
        "Progressez à travers un programme chapitré, construit autour des concepts clés du Lean Worker.",
      card2Title: "Méthodes et canvases",
      card2Body:
        "Découvrez le Purpose Canvas, le Significance Canvas, l’Engagement Canvas, les puissances, les leviers et les preuves.",
      card3Title: "Progression guidée",
      card3Body:
        "Suivez votre avancement leçon par leçon et reprenez facilement là où vous vous êtes arrêté.",
      card4Title: "Passage à l’action",
      card4Body:
        "À différents moments du parcours, accédez à un rendez-vous découverte ou à une souscription adaptée.",
      panelTitle: "Accéder à la formation",
      panelBody:
        "Connectez-vous avec votre compte LinkedIn pour ouvrir votre espace LeanWorker E-Learning.",
      cta: "Continuer avec LinkedIn",
      ctaLoading: "Redirection...",
      bottomNote:
        "Cette plateforme est dédiée à la formation Time’s UP!. Elle ne contient pas l’Adaptive Coach, le Career Blueprint ou les Recommendations de la plateforme LeanWorker principale.",
      bullet1: "Accès sécurisé via LinkedIn",
      bullet2: "Programme vidéo structuré",
      bullet3: "Tunnel d’accompagnement et de souscription",
    }),
    [],
  );

  useEffect(() => {
    const token = getToken();

    if (token) {
      router.replace("/elearning");
      return;
    }

    setCheckingSession(false);
  }, [router]);

  async function handleLinkedInLogin() {
    setLoading(true);
    setError(null);

    try {
      savePostLoginReturnTo("/elearning");
      const url = await getLinkedInAuthorizationUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de lancer la connexion LinkedIn.");
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main
        className="page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 760 }}>
          <div
            className="card stack center"
            style={{
              textAlign: "center",
              minHeight: 280,
              justifyContent: "center",
              gap: 16,
            }}
          >
            <ElearningLogo />
            <BadgePill icon={<SparkIcon size={14} />}>{copy.eyebrow}</BadgePill>
            <div className="title" style={{ margin: 0 }}>
              {copy.checkingSession}
            </div>
            <div className="muted">{copy.checkingSessionBody}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "40px 20px",
        background:
          "radial-gradient(circle at top, rgba(37,99,235,0.07), transparent 38%), linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
      }}
    >
      <div
        className="page-wrap"
        style={{
          width: "100%",
          maxWidth: 1220,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 22,
            alignItems: "stretch",
          }}
        >
          <section
            className="card stack"
            style={{
              justifyContent: "space-between",
              minHeight: 640,
              padding: 32,
              gap: 28,
            }}
          >
            <div className="stack" style={{ gap: 18 }}>
              <div className="row space-between" style={{ alignItems: "center", gap: 12 }}>
                <ElearningLogo />
                <BadgePill icon={<SparkIcon size={14} />}>{copy.eyebrow}</BadgePill>
              </div>

              <div className="stack" style={{ gap: 14 }}>
                <h1
                  className="title"
                  style={{
                    margin: 0,
                    fontSize: 54,
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    maxWidth: 760,
                  }}
                >
                  {copy.heroTitle}
                </h1>

                <div
                  className="subtitle"
                  style={{
                    margin: 0,
                    maxWidth: 720,
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  {copy.heroSubtitle}
                </div>

                <p
                  className="subtitle"
                  style={{
                    margin: 0,
                    maxWidth: 760,
                    fontSize: 18,
                    lineHeight: 1.6,
                  }}
                >
                  {copy.heroBody}
                </p>
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                <BadgePill icon={<CheckCircleIcon size={14} />}>22 chapitres</BadgePill>
                <BadgePill icon={<PathIcon size={14} />}>Méthode Lean Worker</BadgePill>
                <BadgePill icon={<TargetIcon size={14} />}>Progression guidée</BadgePill>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <div className="card-soft stack" style={{ gap: 10, minHeight: 150 }}>
                <div className="section-title" style={{ margin: 0 }}>
                  {copy.card1Title}
                </div>
                <div className="muted">{copy.card1Body}</div>
              </div>

              <div className="card-soft stack" style={{ gap: 10, minHeight: 150 }}>
                <div className="section-title" style={{ margin: 0 }}>
                  {copy.card2Title}
                </div>
                <div className="muted">{copy.card2Body}</div>
              </div>

              <div className="card-soft stack" style={{ gap: 10, minHeight: 150 }}>
                <div className="section-title" style={{ margin: 0 }}>
                  {copy.card3Title}
                </div>
                <div className="muted">{copy.card3Body}</div>
              </div>

              <div className="card-soft stack" style={{ gap: 10, minHeight: 150 }}>
                <div className="section-title" style={{ margin: 0 }}>
                  {copy.card4Title}
                </div>
                <div className="muted">{copy.card4Body}</div>
              </div>
            </div>

            <div className="card-soft">
              <div className="muted" style={{ lineHeight: 1.7 }}>
                {copy.bottomNote}
              </div>
            </div>
          </section>

          <aside
            className="card stack"
            style={{
              justifyContent: "space-between",
              minHeight: 640,
              padding: 32,
              gap: 24,
              border: "1px solid rgba(37,99,235,0.10)",
              boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
            }}
          >
            <div className="stack" style={{ gap: 14 }}>
              <BadgePill icon={<SparkIcon size={14} />}>Accès sécurisé</BadgePill>

              <div className="stack" style={{ gap: 8 }}>
                <div className="title" style={{ fontSize: 30, margin: 0, lineHeight: 1.1 }}>
                  {copy.panelTitle}
                </div>
                <div className="subtitle" style={{ margin: 0 }}>
                  {copy.panelBody}
                </div>
              </div>
            </div>

            <div className="stack" style={{ gap: 16 }}>
              <div
                className="card-soft stack"
                style={{
                  gap: 14,
                  padding: 20,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))",
                }}
              >
                <div className="stack" style={{ gap: 6 }}>
                  <div className="section-title" style={{ margin: 0 }}>
                    Connexion LinkedIn
                  </div>
                  <div className="muted">
                    Votre compte LinkedIn permet d’identifier votre espace de progression.
                  </div>
                </div>

                <button
                  className="button"
                  onClick={handleLinkedInLogin}
                  disabled={loading}
                  type="button"
                  style={{
                    width: "100%",
                    minHeight: 50,
                    fontSize: 16,
                  }}
                >
                  {loading ? copy.ctaLoading : copy.cta}
                </button>

                {error && <div style={{ color: "var(--danger)" }}>{error}</div>}
              </div>

              <div className="stack" style={{ gap: 10 }}>
                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: "#10b981" }} />
                  <div className="muted">{copy.bullet1}</div>
                </div>

                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: "#2563eb" }} />
                  <div className="muted">{copy.bullet2}</div>
                </div>

                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: "#7c3aed" }} />
                  <div className="muted">{copy.bullet3}</div>
                </div>
              </div>
            </div>

            <div className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
              À la fin du programme, vous pourrez choisir un pack d’accompagnement ou réserver une conversation gratuite.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}