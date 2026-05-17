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
        borderRadius: 28,
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
              padding: 24,
            }}
          >
            <div className="page-wrap">
              <CoachCancelCard>
                <div className="section-title">Loading...</div>
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

  const { uiLanguage, loadingLanguage } = useUiLanguage("en");
  const copy = getUiCopy(uiLanguage);

  if (loadingLanguage) {
    return (
      <main
        className="page"
        style={{
          minHeight: "100vh",
          background: "var(--coach-bg)",
          padding: 24,
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
      title={uiLanguage === "fr" ? "Paiement annulé" : "Payment canceled"}
    >
      <div
        className="stack"
        style={{
          gap: 18,
          maxWidth: 980,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          className="card stack"
          style={{
            gap: 18,
            position: "relative",
            overflow: "hidden",
            borderRadius: 32,
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
                {uiLanguage === "fr" ? "Paiement non finalisé" : "Payment not completed"}
              </span>
            </div>

            <div
              style={{
                maxWidth: 880,
                fontSize: 44,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Ton paiement a été interrompu."
                : "Your payment was interrupted."}
            </div>

            <p
              className="subtitle"
              style={{
                maxWidth: 760,
                color: "var(--coach-muted)",
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              {uiLanguage === "fr"
                ? "Aucun souci : aucun débit n’a été finalisé. Tu peux reprendre le déblocage de ton guide plus tard, depuis la page du guide, ta bibliothèque ou tes recommandations."
                : "No problem: no charge was completed. You can resume unlocking your guide later from the guide page, your library, or your recommendations."}
            </p>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <BadgePill icon={<ClockIcon size={14} />}>
                {uiLanguage === "fr" ? "Aucun débit effectué" : "No charge completed"}
              </BadgePill>

              <BadgePill icon={<SparkIcon size={14} />}>
                {uiLanguage === "fr" ? "Reprise possible" : "Can resume later"}
              </BadgePill>
            </div>
          </div>
        </div>

        <CoachCancelCard>
          <div className="section-title">
            {uiLanguage === "fr" ? "Que veux-tu faire maintenant ?" : "What would you like to do now?"}
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
              ? "Tu peux retourner au guide concerné si un artefact existe déjà, ouvrir ta bibliothèque de guides IA ou revenir aux recommandations pour choisir une autre action."
              : "You can return to the related guide if an artifact already exists, open your AI guide library, or go back to recommendations to choose another action."}
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
                  {uiLanguage === "fr" ? "Retour au guide" : "Back to guide"}
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
              {uiLanguage === "fr" ? "Ouvrir ma bibliothèque" : "Open my library"}
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