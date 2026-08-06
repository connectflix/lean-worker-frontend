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
          width: 54,
          height: 54,
          borderRadius: 18,
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(135deg, rgba(255,122,89,0.20), rgba(88,180,174,0.16))",
          border: "1px solid rgba(43,33,24,0.08)",
          boxShadow:
            "0 14px 34px rgba(43,33,24,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
          fontWeight: 950,
          fontSize: 22,
          letterSpacing: "-0.055em",
          color: "var(--coach-ink)",
        }}
      >
        LW
      </div>

      <div className="stack" style={{ gap: 2 }}>
        <div
          style={{
            fontSize: 28,
            lineHeight: 1,
            fontWeight: 950,
            letterSpacing: "-0.06em",
            color: "var(--coach-ink)",
          }}
        >
          LeanWorker
        </div>

        <div
          className="muted"
          style={{
            fontSize: 13,
            color: "var(--coach-muted)",
          }}
        >
          Career intelligence amplified
        </div>
      </div>
    </div>
  );
}

function SoftFeatureCard({
  icon,
  title,
  body,
  tone = "warm",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone?: "warm" | "calm" | "neutral";
}) {
  const iconStyle =
    tone === "calm"
      ? {
          background: "rgba(88,180,174,0.12)",
          color: "var(--coach-calm)",
          border: "1px solid rgba(88,180,174,0.20)",
        }
      : tone === "neutral"
        ? {
            background: "rgba(43,33,24,0.05)",
            color: "var(--coach-muted)",
            border: "1px solid rgba(43,33,24,0.08)",
          }
        : {
            background: "rgba(255,122,89,0.12)",
            color: "var(--coach-accent)",
            border: "1px solid rgba(255,122,89,0.20)",
          };

  return (
    <div
      className="card-soft stack"
      style={{
        gap: 10,
        minHeight: 138,
        borderRadius: 26,
        background: "rgba(255,255,255,0.68)",
        border: "1px solid rgba(43,33,24,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.74)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 15,
          display: "grid",
          placeItems: "center",
          ...iconStyle,
        }}
      >
        {icon}
      </div>

      <div className="stack" style={{ gap: 6 }}>
        <div
          className="section-title"
          style={{
            margin: 0,
            color: "var(--coach-ink)",
          }}
        >
          {title}
        </div>

        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            lineHeight: 1.6,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

function BulletLine({
  children,
  tone = "warm",
}: {
  children: React.ReactNode;
  tone?: "warm" | "calm" | "neutral";
}) {
  const background =
    tone === "calm"
      ? "var(--coach-calm)"
      : tone === "neutral"
        ? "rgba(43,33,24,0.42)"
        : "var(--coach-accent)";

  return (
    <div className="row" style={{ gap: 10, alignItems: "center" }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background,
          flexShrink: 0,
          boxShadow: "0 0 0 5px rgba(255,255,255,0.70)",
        }}
      />

      <div
        className="muted"
        style={{
          color: "var(--coach-muted)",
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { uiLanguage } = useUiLanguage("fr");

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
      setError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible de démarrer la connexion LinkedIn."
            : "Unable to start LinkedIn login.",
      );
      setLoading(false);
    }
  }

  const copy = useMemo(
    () =>
      uiLanguage === "fr"
        ? {
            eyebrow: "Coaching carrière personnalisé",
            heroTitle:
              "Clarifie ta trajectoire. Passe à l’action.",
            heroSubtitle:
              "Un coach intelligent pour prendre du recul, définir tes priorités et avancer avec un plan adapté à ta situation.",
            checkingSession: "Ouverture de ton espace...",
            checkingSessionBody:
              "Nous préparons ton profil et tes dernières sessions.",
            card1Title: "Coach adaptatif",
            card1Body:
              "Un accompagnement qui s’adapte à ton contexte, tes objectifs et ton rythme.",
            card2Title: "Career Blueprint",
            card2Body:
              "Structure ton rôle actuel, tes ambitions et les étapes de ton évolution.",
            card3Title: "Plan d’action concret",
            card3Body:
              "Transforme chaque échange en prochaines étapes claires, réalistes et prioritaires.",
            card4Title: "Ressources personnalisées",
            card4Body:
              "Retrouve des guides adaptés à tes besoins pour approfondir et progresser.",
            trust1: "Contexte mémorisé",
            trust2: "Voix et texte",
            trust3: "Progression suivie",
            panelTitle: "Commence ton parcours",
            panelBody:
              "Connecte-toi avec LinkedIn pour créer ton profil professionnel et accéder à ton coach.",
            cta: "Continuer avec LinkedIn",
            ctaLoading: "Redirection...",
            panelHint:
              "La connexion permet de personnaliser ton accompagnement dès la première session.",
            secondaryTitle: "De la réflexion à l’action",
            secondaryBody:
              "Chaque session t’aide à mieux comprendre ta situation, décider et avancer concrètement.",
            bottomNote:
              "Tes échanges, objectifs et recommandations restent réunis dans un même espace.",
            secureAccess: "Accès sécurisé",
            loginTitle: "Connexion LinkedIn",
            bullet1: "Profil professionnel personnalisé",
            bullet2: "Coaching par écrit ou par la voix",
            bullet3: "Recommandations et guides adaptés",
            previewTitle: "Un espace simple et structuré",
            previewBody:
              "Retrouve tes sessions, ta trajectoire et tes prochaines actions au même endroit.",
          }
        : {
            eyebrow: "Personalized career coaching",
            heroTitle:
              "Clarify your direction. Take action.",
            heroSubtitle:
              "An intelligent coach to step back, set priorities, and move forward with a plan tailored to your situation.",
            checkingSession: "Opening your workspace...",
            checkingSessionBody:
              "Preparing your profile and latest sessions.",
            card1Title: "Adaptive coach",
            card1Body:
              "Guidance that adapts to your context, goals, and pace.",
            card2Title: "Career Blueprint",
            card2Body:
              "Structure your current role, ambitions, and next career steps.",
            card3Title: "Concrete action plan",
            card3Body:
              "Turn every conversation into clear, realistic, prioritized next steps.",
            card4Title: "Personalized resources",
            card4Body:
              "Access tailored guides to deepen your thinking and keep progressing.",
            trust1: "Remembered context",
            trust2: "Voice and text",
            trust3: "Tracked progress",
            panelTitle: "Start your journey",
            panelBody:
              "Sign in with LinkedIn to create your professional profile and access your coach.",
            cta: "Continue with LinkedIn",
            ctaLoading: "Redirecting...",
            panelHint:
              "Your connection helps personalize the experience from the first session.",
            secondaryTitle: "From reflection to action",
            secondaryBody:
              "Each session helps you understand your situation, make decisions, and move forward.",
            bottomNote:
              "Your conversations, goals, and recommendations stay together in one workspace.",
            secureAccess: "Secure access",
            loginTitle: "LinkedIn sign in",
            bullet1: "Personalized professional profile",
            bullet2: "Coaching by text or voice",
            bullet3: "Tailored recommendations and guides",
            previewTitle: "A simple, structured workspace",
            previewBody:
              "Find your sessions, career direction, and next actions in one place.",
          },
    [uiLanguage],
  );

  if (checkingSession) {
    return (
      <main
        className="page"
        lang={uiLanguage}
        translate="no"
        suppressHydrationWarning
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(18px, 4vw, 40px) clamp(14px, 3vw, 20px)",
          background:
            "radial-gradient(circle at 18% 12%, rgba(255,122,89,0.16), transparent 30%), radial-gradient(circle at 82% 78%, rgba(88,180,174,0.14), transparent 32%), var(--coach-bg)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 760 }}>
          <div
            className="card stack center"
            style={{
              textAlign: "center",
              minHeight: 320,
              justifyContent: "center",
              gap: 16,
              borderRadius: 32,
              border: "1px solid rgba(43,33,24,0.08)",
              background: "rgba(255,255,255,0.78)",
              boxShadow: "0 24px 70px rgba(43,33,24,0.08)",
            }}
          >
            <LeanWorkerLogo />

            <BadgePill icon={<SparkIcon size={14} />}>{copy.eyebrow}</BadgePill>

            <div
              style={{
                fontSize: 30,
                lineHeight: 1.1,
                fontWeight: 900,
                letterSpacing: "-0.055em",
                color: "var(--coach-ink)",
              }}
            >
              {copy.checkingSession}
            </div>

            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
              }}
            >
              {copy.checkingSessionBody}
            </div>

            <div className="loader" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="page"
      lang={uiLanguage}
      translate="no"
      suppressHydrationWarning
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "clamp(18px, 4vw, 40px) clamp(14px, 3vw, 20px)",
        background:
          "radial-gradient(circle at 12% 8%, rgba(255,122,89,0.18), transparent 32%), radial-gradient(circle at 88% 18%, rgba(88,180,174,0.14), transparent 28%), radial-gradient(circle at 60% 92%, rgba(255,241,220,0.80), transparent 34%), var(--coach-bg)",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 22,
            alignItems: "stretch",
          }}
        >
          <section
            className="card stack"
            style={{
              justifyContent: "space-between",
              minHeight: 580,
              padding: "clamp(22px, 4vw, 32px)",
              gap: 24,
              position: "relative",
              overflow: "hidden",
              borderRadius: 34,
              border: "1px solid rgba(43,33,24,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,241,220,0.94), rgba(255,255,255,0.86) 54%, rgba(232,248,246,0.86))",
              boxShadow: "0 24px 70px rgba(43,33,24,0.08)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -120,
                top: -130,
                width: 330,
                height: 330,
                borderRadius: 999,
                background: "rgba(255,122,89,0.16)",
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "42%",
                bottom: -150,
                width: 360,
                height: 360,
                borderRadius: 999,
                background: "rgba(88,180,174,0.14)",
              }}
            />

            <div className="stack" style={{ gap: 18, position: "relative" }}>
              <div
                className="row space-between"
                style={{
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <LeanWorkerLogo />

                <span
                  className="badge"
                  style={{
                    background: "rgba(255,122,89,0.12)",
                    borderColor: "rgba(255,122,89,0.20)",
                    color: "var(--coach-accent)",
                    fontWeight: 850,
                  }}
                >
                  <SparkIcon size={14} />
                  {copy.eyebrow}
                </span>
              </div>

              <div className="stack" style={{ gap: 16 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(36px, 5vw, 58px)",
                    lineHeight: 0.98,
                    letterSpacing: "-0.08em",
                    maxWidth: 840,
                    fontWeight: 950,
                    color: "var(--coach-ink)",
                  }}
                >
                  {copy.heroTitle}
                </h1>

                <p
                  className="subtitle"
                  style={{
                    margin: 0,
                    maxWidth: 700,
                    fontSize: 17,
                    lineHeight: 1.7,
                    color: "var(--coach-muted)",
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
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
                position: "relative",
              }}
            >
              <SoftFeatureCard
                icon={<BrainIcon size={18} />}
                title={copy.card1Title}
                body={copy.card1Body}
                tone="warm"
              />

              <SoftFeatureCard
                icon={<PathIcon size={18} />}
                title={copy.card2Title}
                body={copy.card2Body}
                tone="calm"
              />

              <SoftFeatureCard
                icon={<TargetIcon size={18} />}
                title={copy.card3Title}
                body={copy.card3Body}
                tone="warm"
              />

              <SoftFeatureCard
                icon={<SparkIcon size={18} />}
                title={copy.card4Title}
                body={copy.card4Body}
                tone="neutral"
              />
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 8,
                position: "relative",
                borderRadius: 26,
                background: "rgba(255,255,255,0.68)",
                border: "1px solid rgba(43,33,24,0.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.74)",
              }}
            >
              <div
                className="section-title"
                style={{
                  margin: 0,
                  color: "var(--coach-ink)",
                }}
              >
                {copy.secondaryTitle}
              </div>

              <div
                className="muted"
                style={{
                  color: "var(--coach-muted)",
                  lineHeight: 1.6,
                }}
              >
                {copy.secondaryBody}
              </div>
            </div>
          </section>

          <aside
            className="card stack"
            style={{
              justifyContent: "space-between",
              minHeight: 580,
              padding: "clamp(22px, 4vw, 32px)",
              gap: 24,
              position: "relative",
              overflow: "hidden",
              borderRadius: 34,
              border: "1px solid rgba(43,33,24,0.08)",
              background: "rgba(255,255,255,0.82)",
              boxShadow: "0 24px 70px rgba(43,33,24,0.08)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -90,
                top: -90,
                width: 240,
                height: 240,
                borderRadius: 999,
                background: "rgba(255,122,89,0.12)",
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: -100,
                bottom: -90,
                width: 260,
                height: 260,
                borderRadius: 999,
                background: "rgba(88,180,174,0.12)",
              }}
            />

            <div className="stack" style={{ gap: 14, position: "relative" }}>
              <span
                className="badge"
                style={{
                  width: "fit-content",
                  background: "rgba(88,180,174,0.12)",
                  borderColor: "rgba(88,180,174,0.20)",
                  color: "var(--coach-calm)",
                  fontWeight: 850,
                }}
              >
                <SparkIcon size={14} />
                {copy.secureAccess}
              </span>

              <div className="stack" style={{ gap: 10 }}>
                <div
                  style={{
                    fontSize: 34,
                    lineHeight: 1.04,
                    fontWeight: 950,
                    letterSpacing: "-0.065em",
                    color: "var(--coach-ink)",
                  }}
                >
                  {copy.panelTitle}
                </div>

                <div
                  className="subtitle"
                  style={{
                    margin: 0,
                    color: "var(--coach-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  {copy.panelBody}
                </div>
              </div>
            </div>

            <div className="stack" style={{ gap: 16, position: "relative" }}>
              <div
                className="card-soft stack"
                style={{
                  gap: 14,
                  padding: 22,
                  borderRadius: 28,
                  background:
                    "linear-gradient(180deg, rgba(255,248,239,0.90), rgba(255,255,255,0.78))",
                  border: "1px solid rgba(43,33,24,0.08)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.74)",
                }}
              >
                <div className="stack" style={{ gap: 6 }}>
                  <div
                    className="section-title"
                    style={{
                      margin: 0,
                      color: "var(--coach-ink)",
                    }}
                  >
                    {copy.loginTitle}
                  </div>

                  <div
                    className="muted"
                    style={{
                      color: "var(--coach-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {copy.panelHint}
                  </div>
                </div>

                <button
                  className="button"
                  onClick={handleLinkedInLogin}
                  disabled={loading}
                  type="button"
                  style={{
                    width: "100%",
                    minHeight: 52,
                    fontSize: 16,
                    background: "var(--coach-accent)",
                    boxShadow: "0 14px 30px rgba(255,122,89,0.22)",
                  }}
                >
                  {loading ? copy.ctaLoading : copy.cta}
                </button>

                {error ? (
                  <div
                    className="card-soft"
                    style={{
                      color: "var(--danger)",
                      background: "rgba(198,40,40,0.08)",
                      border: "1px solid rgba(198,40,40,0.16)",
                      borderRadius: 18,
                    }}
                  >
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="stack" style={{ gap: 11 }}>
                <BulletLine tone="warm">{copy.bullet1}</BulletLine>
                <BulletLine tone="calm">{copy.bullet2}</BulletLine>
                <BulletLine tone="neutral">{copy.bullet3}</BulletLine>
              </div>
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 8,
                position: "relative",
                borderRadius: 26,
                background: "rgba(232,248,246,0.62)",
                border: "1px solid rgba(88,180,174,0.18)",
              }}
            >
              <div
                className="section-title"
                style={{
                  margin: 0,
                  color: "var(--coach-ink)",
                }}
              >
                {copy.previewTitle}
              </div>

              <div
                className="muted"
                style={{
                  color: "var(--coach-muted)",
                  lineHeight: 1.6,
                }}
              >
                {copy.previewBody}
              </div>

              <div
                className="fine-print"
                style={{
                  color: "var(--coach-muted)",
                  lineHeight: 1.55,
                }}
              >
                {copy.bottomNote}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}