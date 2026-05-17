// app/elearning/login/page.tsx
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
          width: 58,
          height: 58,
          borderRadius: 18,
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(135deg, rgba(251,191,36,0.22), rgba(239,68,68,0.20))",
          border: "1px solid rgba(251,191,36,0.24)",
          boxShadow:
            "0 24px 70px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
          fontWeight: 950,
          fontSize: 22,
          letterSpacing: "-0.07em",
          color: "#ffffff",
          flexShrink: 0,
        }}
      >
        LW
      </div>

      <div className="stack" style={{ gap: 2 }}>
        <div
          style={{
            color: "#ffffff",
            fontSize: 24,
            fontWeight: 950,
            lineHeight: 1,
            letterSpacing: "-0.055em",
          }}
        >
          LeanWorker E-Learning
        </div>

        <div
          style={{
            color: "rgba(248,250,252,0.62)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Time’s UP! Academy
        </div>
      </div>
    </div>
  );
}

function MasterclassBadge({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "dark" | "gold" | "red";
}) {
  const styles =
    tone === "gold"
      ? {
          background: "rgba(251,191,36,0.14)",
          border: "1px solid rgba(251,191,36,0.24)",
          color: "#fbbf24",
        }
      : tone === "red"
        ? {
            background: "rgba(239,68,68,0.14)",
            border: "1px solid rgba(239,68,68,0.24)",
            color: "#fca5a5",
          }
        : {
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.11)",
            color: "rgba(248,250,252,0.76)",
          };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 11px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: "0.03em",
        ...styles,
      }}
    >
      {children}
    </span>
  );
}

function FeatureCard({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="stack"
      style={{
        gap: 10,
        minHeight: 166,
        padding: 18,
        borderRadius: 24,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.045))",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: "rgba(251,191,36,0.12)",
          border: "1px solid rgba(251,191,36,0.18)",
          color: "#fbbf24",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#ffffff",
          fontSize: 16,
          fontWeight: 900,
          letterSpacing: "-0.035em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "rgba(248,250,252,0.62)",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {body}
      </div>
    </div>
  );
}

function LoadingBars() {
  return (
    <div
      aria-hidden="true"
      className="row"
      style={{
        gap: 7,
        justifyContent: "center",
        alignItems: "flex-end",
        height: 54,
      }}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          style={{
            width: 8,
            height: 18 + index * 6,
            borderRadius: 999,
            background:
              index % 2 === 0
                ? "linear-gradient(180deg, #facc15, #f97316)"
                : "linear-gradient(180deg, #fb923c, #ef4444)",
            opacity: 0.9,
            animation: `elearningPulse 900ms ease-in-out ${index * 90}ms infinite alternate`,
          }}
        />
      ))}
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
        "Une formation structurée pour reprendre le contrôle de votre temps, clarifier votre trajectoire professionnelle et construire votre système Lean Worker.",
      checkingSession: "Vérification de votre session...",
      checkingSessionBody:
        "Préparation de votre espace de formation, de votre accès et de votre progression.",
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
        "Connectez-vous avec LinkedIn pour ouvrir votre espace LeanWorker E-Learning et reprendre votre progression.",
      cta: "Continuer avec LinkedIn",
      ctaLoading: "Redirection...",
      bottomNote:
        "Cette plateforme est dédiée à la formation Time’s UP!. Elle est volontairement séparée de l’espace LeanWorker principal pour offrir une expérience d’apprentissage plus immersive.",
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
          padding: "36px 20px",
          background:
            "radial-gradient(circle at 24% 0%, rgba(239,68,68,0.22), transparent 30%), radial-gradient(circle at 80% 15%, rgba(250,204,21,0.12), transparent 30%), linear-gradient(135deg, #050505 0%, #11100f 42%, #1c120d 100%)",
          color: "#f8fafc",
        }}
      >
        <style>
          {`
            @keyframes elearningPulse {
              from {
                transform: scaleY(0.62);
                opacity: 0.44;
              }
              to {
                transform: scaleY(1);
                opacity: 1;
              }
            }
          `}
        </style>

        <div style={{ width: "100%", maxWidth: 780 }}>
          <div
            className="stack"
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: 420,
              justifyContent: "center",
              alignItems: "center",
              gap: 22,
              padding: 34,
              textAlign: "center",
              borderRadius: 34,
              background:
                "linear-gradient(180deg, rgba(18,18,18,0.92), rgba(8,8,8,0.96))",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow:
                "0 34px 100px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.08)",
              backdropFilter: "blur(18px)",
            }}
          >
            <ElearningLogo />

            <MasterclassBadge tone="gold">{copy.eyebrow}</MasterclassBadge>

            <div
              style={{
                color: "#ffffff",
                fontSize: 34,
                lineHeight: 1.05,
                fontWeight: 950,
                letterSpacing: "-0.06em",
              }}
            >
              {copy.checkingSession}
            </div>

            <div
              style={{
                color: "rgba(248,250,252,0.64)",
                fontSize: 15,
                lineHeight: 1.7,
                maxWidth: 520,
              }}
            >
              {copy.checkingSessionBody}
            </div>

            <LoadingBars />
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
          "radial-gradient(circle at 16% 0%, rgba(239,68,68,0.26), transparent 32%), radial-gradient(circle at 86% 12%, rgba(250,204,21,0.13), transparent 28%), linear-gradient(135deg, #050505 0%, #11100f 44%, #1e120b 100%)",
        color: "#f8fafc",
      }}
    >
      <style>
        {`
          @media (max-width: 980px) {
            .elearning-login-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 760px) {
            .elearning-feature-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div
        className="page-wrap"
        style={{
          width: "100%",
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        <div
          className="elearning-login-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 22,
            alignItems: "stretch",
          }}
        >
          <section
            className="stack"
            style={{
              position: "relative",
              overflow: "hidden",
              justifyContent: "space-between",
              minHeight: 660,
              padding: 34,
              gap: 30,
              borderRadius: 36,
              background:
                "linear-gradient(180deg, rgba(18,18,18,0.92), rgba(8,8,8,0.96))",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow:
                "0 34px 100px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -180,
                right: -130,
                width: 420,
                height: 420,
                borderRadius: 999,
                background: "rgba(249,115,22,0.16)",
                filter: "blur(3px)",
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: -140,
                bottom: -170,
                width: 420,
                height: 420,
                borderRadius: 999,
                background: "rgba(250,204,21,0.10)",
                filter: "blur(3px)",
              }}
            />

            <div
              className="stack"
              style={{
                gap: 22,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div className="row space-between" style={{ alignItems: "center", gap: 12 }}>
                <ElearningLogo />
                <MasterclassBadge tone="gold">{copy.eyebrow}</MasterclassBadge>
              </div>

              <div className="stack" style={{ gap: 16, maxWidth: 820 }}>
                <div
                  style={{
                    color: "#fbbf24",
                    fontSize: 13,
                    fontWeight: 950,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  LeanWorker Original Program
                </div>

                <h1
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: 74,
                    lineHeight: 0.9,
                    fontWeight: 950,
                    letterSpacing: "-0.085em",
                    maxWidth: 760,
                  }}
                >
                  {copy.heroTitle}
                </h1>

                <div
                  style={{
                    margin: 0,
                    maxWidth: 720,
                    color: "rgba(248,250,252,0.90)",
                    fontSize: 24,
                    lineHeight: 1.15,
                    fontWeight: 900,
                    letterSpacing: "-0.045em",
                  }}
                >
                  {copy.heroSubtitle}
                </div>

                <p
                  style={{
                    margin: 0,
                    maxWidth: 760,
                    color: "rgba(248,250,252,0.64)",
                    fontSize: 17,
                    lineHeight: 1.72,
                  }}
                >
                  {copy.heroBody}
                </p>
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                <MasterclassBadge>
                  <CheckCircleIcon size={14} color="#fbbf24" />
                  22 chapitres
                </MasterclassBadge>

                <MasterclassBadge>
                  <PathIcon size={14} color="#fbbf24" />
                  Méthode Lean Worker
                </MasterclassBadge>

                <MasterclassBadge>
                  <TargetIcon size={14} color="#fbbf24" />
                  Progression guidée
                </MasterclassBadge>
              </div>
            </div>

            <div
              className="elearning-feature-grid"
              style={{
                position: "relative",
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <FeatureCard
                title={copy.card1Title}
                body={copy.card1Body}
                icon={<SparkIcon size={18} />}
              />

              <FeatureCard
                title={copy.card2Title}
                body={copy.card2Body}
                icon={<PathIcon size={18} />}
              />

              <FeatureCard
                title={copy.card3Title}
                body={copy.card3Body}
                icon={<CheckCircleIcon size={18} />}
              />

              <FeatureCard
                title={copy.card4Title}
                body={copy.card4Body}
                icon={<TargetIcon size={18} />}
              />
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: 16,
                borderRadius: 22,
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(248,250,252,0.58)",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              {copy.bottomNote}
            </div>
          </section>

          <aside
            className="stack"
            style={{
              position: "relative",
              overflow: "hidden",
              justifyContent: "space-between",
              minHeight: 660,
              padding: 32,
              gap: 24,
              borderRadius: 36,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,247,237,0.94))",
              border: "1px solid rgba(251,191,36,0.18)",
              boxShadow:
                "0 34px 100px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.72)",
              color: "#1c1917",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -110,
                right: -110,
                width: 260,
                height: 260,
                borderRadius: 999,
                background: "rgba(251,191,36,0.22)",
              }}
            />

            <div
              className="stack"
              style={{
                gap: 16,
                position: "relative",
                zIndex: 1,
              }}
            >
              <BadgePill icon={<SparkIcon size={14} />}>Accès sécurisé</BadgePill>

              <div className="stack" style={{ gap: 9 }}>
                <div
                  style={{
                    fontSize: 36,
                    lineHeight: 1.02,
                    fontWeight: 950,
                    letterSpacing: "-0.065em",
                    color: "#1c1917",
                  }}
                >
                  {copy.panelTitle}
                </div>

                <div
                  style={{
                    margin: 0,
                    color: "rgba(28,25,23,0.68)",
                    fontSize: 15,
                    lineHeight: 1.7,
                  }}
                >
                  {copy.panelBody}
                </div>
              </div>
            </div>

            <div
              className="stack"
              style={{
                gap: 16,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                className="stack"
                style={{
                  gap: 15,
                  padding: 20,
                  borderRadius: 26,
                  background: "rgba(255,255,255,0.82)",
                  border: "1px solid rgba(28,25,23,0.08)",
                  boxShadow: "0 18px 50px rgba(28,25,23,0.08)",
                }}
              >
                <div className="stack" style={{ gap: 6 }}>
                  <div
                    style={{
                      color: "#1c1917",
                      fontWeight: 900,
                      fontSize: 16,
                      letterSpacing: "-0.035em",
                    }}
                  >
                    Connexion LinkedIn
                  </div>

                  <div
                    style={{
                      color: "rgba(28,25,23,0.62)",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
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
                    minHeight: 52,
                    fontSize: 15,
                    borderRadius: 16,
                    background: "#111827",
                    color: "#ffffff",
                    boxShadow: "0 16px 34px rgba(17,24,39,0.18)",
                  }}
                >
                  {loading ? copy.ctaLoading : copy.cta}
                </button>

                {error ? (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.16)",
                      color: "#b91c1c",
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="stack" style={{ gap: 11 }}>
                {[
                  { label: copy.bullet1, color: "#f97316" },
                  { label: copy.bullet2, color: "#ef4444" },
                  { label: copy.bullet3, color: "#111827" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="row"
                    style={{
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        color: "rgba(28,25,23,0.68)",
                        fontSize: 14,
                        lineHeight: 1.45,
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: 16,
                borderRadius: 22,
                background: "rgba(28,25,23,0.045)",
                border: "1px solid rgba(28,25,23,0.07)",
                color: "rgba(28,25,23,0.58)",
                fontSize: 13,
                lineHeight: 1.65,
              }}
            >
              À la fin du programme, vous pourrez choisir un pack d’accompagnement ou réserver une
              conversation gratuite.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}