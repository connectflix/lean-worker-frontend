"use client";

import { Suspense, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import {
  ArrowRightIcon,
  BadgePill,
  ClockIcon,
  LayerIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";
import { getUiCopy } from "@/lib/ui-copy";
import { useUiLanguage } from "@/lib/use-ui-language";

function CoachCancelCard({
  children,
  warm = false,
}: {
  children: ReactNode;
  warm?: boolean;
}) {
  return (
    <div
      className="card stack"
      style={{
        gap: 16,
        borderRadius: 24,
        border: "1px solid rgba(43,33,24,0.08)",
        background: warm
          ? "linear-gradient(135deg, rgba(255,241,220,0.94), rgba(255,255,255,0.92) 58%, rgba(232,248,246,0.84))"
          : "rgba(255,255,255,0.78)",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
      }}
    >
      {children}
    </div>
  );
}

export default function AIArtifactCancelPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <main
            className="page"
            style={{
              minHeight: "100vh",
              background: "var(--coach-bg)",
              padding: "clamp(16px, 3vw, 24px)",
            }}
          >
            <div className="page-wrap">
              <CoachCancelCard>
                <div className="section-title">Chargement...</div>
              </CoachCancelCard>
            </div>
          </main>
        }
      >
        <AIArtifactCancelContent />
      </Suspense>
    </AuthGuard>
  );
}

function AIArtifactCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const artifactId = searchParams.get("artifact_id");

  const { uiLanguage, loadingLanguage } = useUiLanguage("fr");
  const copy = getUiCopy(uiLanguage);

  if (loadingLanguage) {
    return (
      <main
        className="page"
        lang={uiLanguage}
        translate="no"
        suppressHydrationWarning
        style={{
          minHeight: "100vh",
          background: "var(--coach-bg)",
          padding: "clamp(16px, 3vw, 24px)",
        }}
      >
        <div className="page-wrap">
          <CoachCancelCard>
            <div className="section-title">{copy.common.loading}</div>
          </CoachCancelCard>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Paiement interrompu" : "Payment interrupted"}
    >
      <div
        className="stack"
        style={{
          gap: 16,
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          className="card stack"
          style={{
            gap: 16,
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            border: "1px solid rgba(43,33,24,0.08)",
            background:
              "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92) 52%, rgba(232,248,246,0.88))",
            boxShadow: "0 22px 60px rgba(43,33,24,0.07)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -110,
              top: -130,
              width: 310,
              height: 310,
              borderRadius: 999,
              background: "rgba(255,122,89,0.16)",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "46%",
              bottom: -150,
              width: 340,
              height: 340,
              borderRadius: 999,
              background: "rgba(88,180,174,0.14)",
            }}
          />

          <div className="stack" style={{ gap: 16, position: "relative" }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{
                  background: "rgba(255,122,89,0.12)",
                  borderColor: "rgba(255,122,89,0.20)",
                  color: "var(--coach-accent)",
                  fontWeight: 850,
                }}
              >
                <LayerIcon size={14} />
                {uiLanguage === "fr" ? "Guide IA" : "AI guide"}
              </span>

              <span
                className="badge"
                style={{
                  background: "rgba(88,180,174,0.12)",
                  borderColor: "rgba(88,180,174,0.20)",
                  color: "var(--coach-calm)",
                  fontWeight: 850,
                }}
              >
                <ClockIcon size={14} />
                {uiLanguage === "fr" ? "Paiement interrompu" : "Payment interrupted"}
              </span>
            </div>

            <div
              style={{
                maxWidth: 880,
                fontSize: "clamp(34px, 5vw, 44px)",
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Le paiement n’a pas été finalisé."
                : "The payment was not completed."}
            </div>

            <p
              className="subtitle"
              style={{
                maxWidth: 700,
                color: "var(--coach-muted)",
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              {uiLanguage === "fr"
                ? "Aucun débit n’a été finalisé. Tu peux reprendre le paiement plus tard depuis le guide ou la bibliothèque."
                : "No charge was completed. You can resume payment later from the guide or your library."}
            </p>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <BadgePill icon={<ClockIcon size={14} />}>
                {uiLanguage === "fr" ? "Aucun débit finalisé" : "No charge completed"}
              </BadgePill>

              <BadgePill icon={<SparkIcon size={14} />}>
                {uiLanguage === "fr" ? "Paiement à reprendre" : "Payment can be resumed"}
              </BadgePill>
            </div>
          </div>
        </div>

        <CoachCancelCard>
          <div className="section-title">
            {uiLanguage === "fr" ? "Prochaine étape" : "Next step"}
          </div>

          <div
            className="card-soft"
            style={{
              borderRadius: 24,
              background: "rgba(255,248,239,0.74)",
              border: "1px solid rgba(43,33,24,0.08)",
              color: "var(--coach-muted)",
              lineHeight: 1.7,
            }}
          >
            {uiLanguage === "fr"
              ? "Retourne au guide concerné, consulte ta bibliothèque ou choisis une autre recommandation."
              : "Return to the related guide, open your library, or choose another recommendation."}
          </div>

          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            {artifactId ? (
              <button
                className="button"
                onClick={() => router.push(`/ai-artifacts/${artifactId}`)}
                type="button"
                style={{ background: "var(--coach-accent)" }}
              >
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <ArrowRightIcon size={14} />
                  {uiLanguage === "fr" ? "Revenir au guide" : "Return to guide"}
                </span>
              </button>
            ) : null}

            <button
              className={artifactId ? "button secondary" : "button"}
              onClick={() => router.push("/ai-artifacts")}
              type="button"
              style={
                artifactId
                  ? {
                      color: "var(--coach-accent)",
                      borderColor: "rgba(255,122,89,0.28)",
                    }
                  : { background: "var(--coach-accent)" }
              }
            >
              {uiLanguage === "fr" ? "Voir mes guides" : "View my guides"}
            </button>

            <button
              className="button ghost"
              onClick={() => router.push("/recommendations")}
              type="button"
            >
              {uiLanguage === "fr" ? "Retour aux recommandations" : "Back to recommendations"}
            </button>
          </div>
        </CoachCancelCard>
      </div>
    </AppShell>
  );
}