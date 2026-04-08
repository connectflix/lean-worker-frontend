"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getLinkedInAuthorizationUrl } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { routeUserAfterLogin } from "@/lib/post-login-routing";
import { useUiLanguage } from "@/lib/use-ui-language";
import {
  BadgePill,
  BrainIcon,
  PathIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

function LeanWorkerLogo() {
  return (
    <div
      aria-label="LeanWorker"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
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
        <div className="title" style={{ fontSize: 28, margin: 0, lineHeight: 1 }}>
          LeanWorker
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          Career intelligence amplified
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { uiLanguage } = useUiLanguage("en");

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkExistingSession() {
      if (!isAuthenticated()) {
        setCheckingSession(false);
        return;
      }

      try {
        await routeUserAfterLogin(router);
      } catch {
        setCheckingSession(false);
      }
    }

    void checkExistingSession();
  }, [router]);

  async function handleLinkedInLogin() {
    setLoading(true);
    setError(null);

    try {
      const url = await getLinkedInAuthorizationUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start LinkedIn login.");
      setLoading(false);
    }
  }

  const copy = useMemo(
    () =>
      uiLanguage === "fr"
        ? {
            eyebrow: "Plateforme de coaching carrière",
            heroTitle:
              "Clarifie ta trajectoire. Transforme tes sessions en mouvement concret.",
            heroSubtitle:
              "LeanWorker t’aide à comprendre ce que tu vis au travail, à relier tes enjeux à ta trajectoire, et à transformer chaque session en actions utiles.",
            checkingSession: "Vérification de ta session en cours...",
            checkingSessionBody:
              "Préparation de ton espace, de ta mémoire et de tes sessions.",
            card1Title: "Coach adaptatif",
            card1Body:
              "Le coach ajuste sa posture selon ton contexte, ton niveau de charge, ton besoin et ta trajectoire.",
            card2Title: "Career Blueprint",
            card2Body:
              "Structure ton identité, ta vision et tes horizons pour un coaching beaucoup plus précis.",
            card3Title: "Recommandations actionnables",
            card3Body:
              "Transforme chaque session en actions concrètes avec des leviers utiles, priorisés et exploitables.",
            card4Title: "Guides IA",
            card4Body:
              "Débloque des mini e-books et mini audiobooks personnalisés pour passer plus vite à l’action.",
            trust1: "Mémoire continue",
            trust2: "Sessions vocales & écrites",
            trust3: "Suivi de progression",
            panelTitle: "Entre dans ton espace LeanWorker",
            panelBody:
              "Connecte-toi avec LinkedIn pour initialiser ton contexte professionnel et lancer une expérience de coaching continue.",
            cta: "Continuer avec LinkedIn",
            ctaLoading: "Redirection...",
            panelHint:
              "Une fois connecté, tu accèdes à un coach adaptatif, un historique intelligent, des recommandations et des guides IA.",
            secondaryTitle: "Conçu pour une progression réelle",
            secondaryBody:
              "Pas seulement des conversations. Une vraie boucle entre réflexion, trajectoire, recommandation et exécution.",
            bottomNote:
              "LeanWorker combine coaching, mémoire, recommandations et artefacts IA dans un même espace de travail.",
            secureAccess: "Accès sécurisé",
            bullet1: "Onboarding guidé et contextualisé",
            bullet2: "Expérience écrite et vocale",
            bullet3: "Guides IA monétisables",
          }
        : {
            eyebrow: "Career coaching platform",
            heroTitle:
              "Clarify your trajectory. Turn every session into concrete movement.",
            heroSubtitle:
              "LeanWorker helps you understand what is happening at work, connect your challenges to your trajectory, and turn each session into useful action.",
            checkingSession: "Checking your current session...",
            checkingSessionBody:
              "Preparing your workspace, memory, and sessions.",
            card1Title: "Adaptive coach",
            card1Body:
              "Your coach adjusts its stance to your context, your cognitive load, your need, and your trajectory.",
            card2Title: "Career Blueprint",
            card2Body:
              "Structure your identity, vision, and horizons for much more precise coaching.",
            card3Title: "Actionable recommendations",
            card3Body:
              "Turn every session into concrete action with useful, prioritized, and usable levers.",
            card4Title: "AI Guides",
            card4Body:
              "Unlock personalized mini e-books and mini audiobooks to move faster into execution.",
            trust1: "Continuous memory",
            trust2: "Voice & written sessions",
            trust3: "Progress tracking",
            panelTitle: "Enter your LeanWorker workspace",
            panelBody:
              "Sign in with LinkedIn to initialize your professional context and start a continuous coaching experience.",
            cta: "Continue with LinkedIn",
            ctaLoading: "Redirecting...",
            panelHint:
              "Once connected, you access an adaptive coach, intelligent history, recommendations, and AI guides.",
            secondaryTitle: "Built for real progress",
            secondaryBody:
              "Not just conversations. A real loop between reflection, trajectory, recommendation, and execution.",
            bottomNote:
              "LeanWorker combines coaching, memory, recommendations, and AI artifacts in one workspace.",
            secureAccess: "Secure access",
            bullet1: "Guided and contextualized onboarding",
            bullet2: "Written and voice experience",
            bullet3: "Monetizable AI guides",
          },
    [uiLanguage],
  );

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
            <LeanWorkerLogo />
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
          "radial-gradient(circle at top, rgba(37,99,235,0.06), transparent 38%), linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)",
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
                <LeanWorkerLogo />
                <BadgePill icon={<SparkIcon size={14} />}>{copy.eyebrow}</BadgePill>
              </div>

              <div className="stack" style={{ gap: 14 }}>
                <h1
                  className="title"
                  style={{
                    margin: 0,
                    fontSize: 44,
                    lineHeight: 1.05,
                    letterSpacing: "-0.04em",
                    maxWidth: 760,
                  }}
                >
                  {copy.heroTitle}
                </h1>

                <p
                  className="subtitle"
                  style={{
                    margin: 0,
                    maxWidth: 720,
                    fontSize: 18,
                    lineHeight: 1.6,
                  }}
                >
                  {copy.heroSubtitle}
                </p>
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                <BadgePill icon={<BrainIcon size={14} />}>{copy.trust1}</BadgePill>
                <BadgePill icon={<SparkIcon size={14} />}>{copy.trust2}</BadgePill>
                <BadgePill icon={<TargetIcon size={14} />}>{copy.trust3}</BadgePill>
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
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <BrainIcon size={16} />
                  <div className="section-title" style={{ margin: 0 }}>
                    {copy.card1Title}
                  </div>
                </div>
                <div className="muted">{copy.card1Body}</div>
              </div>

              <div className="card-soft stack" style={{ gap: 10, minHeight: 150 }}>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <PathIcon size={16} />
                  <div className="section-title" style={{ margin: 0 }}>
                    {copy.card2Title}
                  </div>
                </div>
                <div className="muted">{copy.card2Body}</div>
              </div>

              <div className="card-soft stack" style={{ gap: 10, minHeight: 150 }}>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <TargetIcon size={16} />
                  <div className="section-title" style={{ margin: 0 }}>
                    {copy.card3Title}
                  </div>
                </div>
                <div className="muted">{copy.card3Body}</div>
              </div>

              <div className="card-soft stack" style={{ gap: 10, minHeight: 150 }}>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <SparkIcon size={16} />
                  <div className="section-title" style={{ margin: 0 }}>
                    {copy.card4Title}
                  </div>
                </div>
                <div className="muted">{copy.card4Body}</div>
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 8 }}>
              <div className="section-title" style={{ margin: 0 }}>
                {copy.secondaryTitle}
              </div>
              <div className="muted">{copy.secondaryBody}</div>
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
              <BadgePill icon={<SparkIcon size={14} />}>
                {copy.secureAccess}
              </BadgePill>

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
                    {uiLanguage === "fr" ? "Connexion LinkedIn" : "LinkedIn sign in"}
                  </div>
                  <div className="muted">{copy.panelHint}</div>
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
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "#10b981",
                      flexShrink: 0,
                    }}
                  />
                  <div className="muted">{copy.bullet1}</div>
                </div>

                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "#2563eb",
                      flexShrink: 0,
                    }}
                  />
                  <div className="muted">{copy.bullet2}</div>
                </div>

                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "#7c3aed",
                      flexShrink: 0,
                    }}
                  />
                  <div className="muted">{copy.bullet3}</div>
                </div>
              </div>
            </div>

            <div className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
              {copy.bottomNote}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}