"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { getAIArtifact } from "@/lib/api";
import { getUiCopy } from "@/lib/ui-copy";
import { useUiLanguage } from "@/lib/use-ui-language";
import type { AIArtifactResponse } from "@/lib/types";
import {
  ArrowRightIcon,
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  LayerIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

function formatArtifactType(format: string, uiLanguage: "fr" | "en"): string {
  if (format === "audiobook") {
    return uiLanguage === "fr" ? "Mini audiobook" : "Mini audiobook";
  }

  return uiLanguage === "fr" ? "Mini e-book" : "Mini e-book";
}

function formatArtifactStatus(status: string, uiLanguage: "fr" | "en"): string {
  const fr: Record<string, string> = {
    pending_payment: "Paiement en attente",
    paid: "Payé",
    generating: "Génération en cours",
    completed: "Prêt",
    failed: "Échec",
  };

  const en: Record<string, string> = {
    pending_payment: "Pending payment",
    paid: "Paid",
    generating: "Generating",
    completed: "Ready",
    failed: "Failed",
  };

  return (uiLanguage === "fr" ? fr : en)[status] ?? status;
}

function formatPrice(price: number): string {
  try {
    return new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: price % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price}€`;
  }
}

function getStatusIcon(status: string) {
  if (status === "completed") return <CheckCircleIcon size={14} />;
  return <ClockIcon size={14} />;
}

function getStatusTone(status: string) {
  if (status === "completed") {
    return {
      background: "rgba(88,180,174,0.12)",
      borderColor: "rgba(88,180,174,0.20)",
      color: "var(--coach-calm)",
    };
  }

  if (status === "failed") {
    return {
      background: "rgba(198,40,40,0.08)",
      borderColor: "rgba(198,40,40,0.16)",
      color: "var(--danger)",
    };
  }

  if (status === "generating" || status === "paid") {
    return {
      background: "rgba(255,122,89,0.12)",
      borderColor: "rgba(255,122,89,0.20)",
      color: "var(--coach-accent)",
    };
  }

  return {
    background: "rgba(43,33,24,0.05)",
    borderColor: "rgba(43,33,24,0.08)",
    color: "var(--coach-muted)",
  };
}

function localizeArtifactSubtitle(
  subtitle: string | null | undefined,
  uiLanguage: "fr" | "en",
): string | null {
  if (!subtitle) return subtitle ?? null;
  if (uiLanguage !== "fr") return subtitle;

  const normalized = subtitle.trim();

  const knownTranslations: Record<string, string> = {
    "Personalized AI-generated mini e-book": "Mini e-book personnalisé généré par IA",
    "Personalized AI-generated mini audiobook": "Mini audiobook personnalisé généré par IA",
  };

  return knownTranslations[normalized] ?? subtitle;
}

function SuccessInfoCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="card-soft stack"
      style={{
        gap: 8,
        borderRadius: 24,
        background: "rgba(255,248,239,0.68)",
        border: "1px solid rgba(43,33,24,0.08)",
      }}
    >
      <div className="row" style={{ gap: 8, alignItems: "center" }}>
        {icon}

        <div className="section-title" style={{ fontSize: 16 }}>
          {title}
        </div>
      </div>

      <div
        className="muted"
        style={{
          color: "var(--coach-muted)",
          lineHeight: 1.65,
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default function AIArtifactSuccessPage() {
  return (
    <AuthGuard>
      <AIArtifactSuccessContent />
    </AuthGuard>
  );
}

function AIArtifactSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const artifactIdParam = searchParams.get("artifact_id");

  const artifactId = useMemo(() => {
    if (!artifactIdParam) return null;

    const parsed = Number(artifactIdParam);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [artifactIdParam]);

  const { uiLanguage, loadingLanguage } = useUiLanguage("en");
  const copy = getUiCopy(uiLanguage);

  const [artifact, setArtifact] = useState<AIArtifactResponse | null>(null);
  const [loadingArtifact, setLoadingArtifact] = useState(Boolean(artifactId));
  const [error, setError] = useState<string | null>(null);

  const loadArtifact = useCallback(async () => {
    if (!artifactId) {
      setLoadingArtifact(false);
      return;
    }

    try {
      setLoadingArtifact(true);
      setError(null);

      const data = await getAIArtifact(artifactId);
      setArtifact(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible de charger le guide après paiement."
            : "Unable to load the guide after payment.",
      );
    } finally {
      setLoadingArtifact(false);
    }
  }, [artifactId, uiLanguage]);

  useEffect(() => {
    void loadArtifact();
  }, [loadArtifact]);

  const isCompleted = artifact?.status === "completed";
  const isGenerating = artifact?.status === "generating" || artifact?.status === "paid";

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
          <div
            className="card"
            style={{
              borderRadius: 28,
              border: "1px solid rgba(43,33,24,0.08)",
              background: "rgba(255,255,255,0.78)",
            }}
          >
            {copy.common.loading}
          </div>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Paiement réussi" : "Payment successful"}
    >
      <div className="stack" style={{ gap: 18 }}>
        <div
          className="card stack"
          style={{
            gap: 20,
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

          <div
            className="stack"
            style={{
              gap: 16,
              position: "relative",
            }}
          >
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <span
                className="badge"
                style={{
                  background: "rgba(88,180,174,0.12)",
                  borderColor: "rgba(88,180,174,0.20)",
                  color: "var(--coach-calm)",
                  fontWeight: 850,
                }}
              >
                <CheckCircleIcon size={14} />
                {uiLanguage === "fr" ? "Paiement confirmé" : "Payment confirmed"}
              </span>

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
                {uiLanguage === "fr" ? "Guide personnalisé" : "Personalized guide"}
              </span>
            </div>

            <div
              style={{
                maxWidth: 920,
                fontSize: 44,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Ton achat est confirmé. Ton guide IA est en préparation."
                : "Your purchase is confirmed. Your AI guide is being prepared."}
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
                ? "Ton paiement a bien été enregistré. Selon le statut du guide, tu peux l’ouvrir immédiatement ou suivre sa génération depuis la page dédiée."
                : "Your payment has been recorded. Depending on the guide status, you can open it immediately or follow its generation from the dedicated page."}
            </p>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              {artifact?.format ? (
                <BadgePill icon={<LayerIcon size={14} />}>
                  {formatArtifactType(artifact.format, uiLanguage)}
                </BadgePill>
              ) : null}

              {artifact?.price_eur != null ? (
                <BadgePill icon={<TargetIcon size={14} />}>
                  {formatPrice(artifact.price_eur)}
                </BadgePill>
              ) : null}

              {artifact?.status ? (
                <span
                  className="badge"
                  style={{
                    ...getStatusTone(artifact.status),
                    fontWeight: 850,
                  }}
                >
                  {getStatusIcon(artifact.status)}
                  {formatArtifactStatus(artifact.status, uiLanguage)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {loadingArtifact ? (
          <div
            className="card stack"
            style={{
              borderRadius: 28,
              border: "1px solid rgba(43,33,24,0.08)",
              background: "rgba(255,255,255,0.78)",
              boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
            }}
          >
            <div className="section-title">
              {uiLanguage === "fr" ? "Chargement du guide" : "Loading guide"}
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)" }}>
              {uiLanguage === "fr"
                ? "Nous récupérons les dernières informations sur ton guide."
                : "We are retrieving the latest information about your guide."}
            </div>
          </div>
        ) : error ? (
          <div
            className="card stack"
            style={{
              borderRadius: 28,
              border: "1px solid rgba(198,40,40,0.16)",
              background: "rgba(255,255,255,0.78)",
            }}
          >
            <div className="section-title" style={{ color: "var(--danger)" }}>
              {uiLanguage === "fr"
                ? "Impossible de charger le guide"
                : "Unable to load the guide"}
            </div>

            <div className="muted">{error}</div>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button
                className="button"
                onClick={() => void loadArtifact()}
                type="button"
                style={{ background: "var(--coach-accent)" }}
              >
                {uiLanguage === "fr" ? "Réessayer" : "Try again"}
              </button>

              <button
                className="button ghost"
                onClick={() => router.push("/ai-artifacts")}
                type="button"
              >
                {uiLanguage === "fr" ? "Ouvrir ma bibliothèque" : "Open my library"}
              </button>
            </div>
          </div>
        ) : artifact ? (
          <>
            <div
              className="card stack"
              style={{
                gap: 16,
                borderRadius: 32,
                border: "1px solid rgba(43,33,24,0.08)",
                background: "rgba(255,255,255,0.78)",
                boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
              }}
            >
              <div
                className="row space-between"
                style={{
                  alignItems: "flex-start",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
                  <div className="section-title">{artifact.title}</div>

                  {artifact.subtitle ? (
                    <div className="muted" style={{ color: "var(--coach-muted)" }}>
                      {localizeArtifactSubtitle(artifact.subtitle, uiLanguage)}
                    </div>
                  ) : null}
                </div>

                <span
                  className="badge"
                  style={{
                    ...getStatusTone(artifact.status),
                    fontWeight: 850,
                  }}
                >
                  {getStatusIcon(artifact.status)}
                  {formatArtifactStatus(artifact.status, uiLanguage)}
                </span>
              </div>

              <div
                className="card-soft"
                style={{
                  borderRadius: 24,
                  background: "rgba(255,248,239,0.74)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <div
                  className="muted"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {isCompleted
                    ? uiLanguage === "fr"
                      ? "Ton guide est prêt. Tu peux l’ouvrir immédiatement."
                      : "Your guide is ready. You can open it immediately."
                    : isGenerating
                      ? uiLanguage === "fr"
                        ? "Le paiement est confirmé et la génération est en cours. Ton guide sera disponible très bientôt."
                        : "Payment is confirmed and generation is in progress. Your guide will be available very soon."
                      : artifact.status === "failed"
                        ? uiLanguage === "fr"
                          ? "La génération a rencontré un problème. Tu peux ouvrir le guide pour consulter le statut ou signaler le problème."
                          : "Generation encountered an issue. You can open the guide to review the status or report the issue."
                        : uiLanguage === "fr"
                          ? "Ton achat est bien enregistré. Tu peux suivre l’état du guide depuis sa page."
                          : "Your purchase has been recorded. You can track the guide status from its page."}
                </div>
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                <button
                  className="button"
                  onClick={() => router.push(`/ai-artifacts/${artifact.id}`)}
                  type="button"
                  style={{ background: "var(--coach-accent)" }}
                >
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                    <ArrowRightIcon size={14} />
                    {isCompleted
                      ? uiLanguage === "fr"
                        ? "Ouvrir le guide"
                        : "Open guide"
                      : uiLanguage === "fr"
                        ? "Voir le statut du guide"
                        : "View guide status"}
                  </span>
                </button>

                <button
                  className="button secondary"
                  onClick={() => router.push("/ai-artifacts")}
                  type="button"
                  style={{
                    color: "var(--coach-accent)",
                    borderColor: "rgba(255,122,89,0.28)",
                  }}
                >
                  {uiLanguage === "fr" ? "Ouvrir ma bibliothèque" : "Open my library"}
                </button>

                <button
                  className="button ghost"
                  onClick={() => router.push("/recommendations")}
                  type="button"
                >
                  {uiLanguage === "fr"
                    ? "Retour aux recommandations"
                    : "Back to recommendations"}
                </button>
              </div>
            </div>

            <div className="grid grid-3">
              <SuccessInfoCard
                title={uiLanguage === "fr" ? "Paiement" : "Payment"}
                text={
                  uiLanguage === "fr"
                    ? "Ton paiement est enregistré et rattaché à ce guide IA."
                    : "Your payment is recorded and linked to this AI guide."
                }
                icon={<CheckCircleIcon size={16} />}
              />

              <SuccessInfoCard
                title={uiLanguage === "fr" ? "Génération" : "Generation"}
                text={
                  isCompleted
                    ? uiLanguage === "fr"
                      ? "La génération est terminée. Le guide est consultable."
                      : "Generation is complete. The guide is available."
                    : uiLanguage === "fr"
                      ? "La génération peut prendre quelques instants selon le format."
                      : "Generation may take a few moments depending on the format."
                }
                icon={<SparkIcon size={16} />}
              />

              <SuccessInfoCard
                title={uiLanguage === "fr" ? "Bibliothèque" : "Library"}
                text={
                  uiLanguage === "fr"
                    ? "Le guide reste accessible depuis ta bibliothèque personnelle."
                    : "The guide remains accessible from your personal library."
                }
                icon={<LayerIcon size={16} />}
              />
            </div>

            {artifact.goal ? (
              <div
                className="card stack"
                style={{
                  gap: 14,
                  borderRadius: 28,
                  border: "1px solid rgba(43,33,24,0.08)",
                  background: "rgba(255,255,255,0.78)",
                  boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
                }}
              >
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <TargetIcon />
                  <div className="section-title">
                    {uiLanguage === "fr" ? "Objectif du guide" : "Guide goal"}
                  </div>
                </div>

                <div
                  className="card-soft"
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.7,
                    borderRadius: 24,
                    background: "rgba(255,248,239,0.68)",
                    border: "1px solid rgba(43,33,24,0.08)",
                  }}
                >
                  {artifact.goal}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div
            className="card stack"
            style={{
              gap: 16,
              borderRadius: 32,
              border: "1px solid rgba(43,33,24,0.08)",
              background: "rgba(255,255,255,0.78)",
              boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
            }}
          >
            <div className="section-title">
              {uiLanguage === "fr" ? "Paiement enregistré" : "Payment recorded"}
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.7 }}>
              {uiLanguage === "fr"
                ? "Ton paiement a bien été pris en compte. Tu peux maintenant consulter ta bibliothèque de guides IA."
                : "Your payment has been recorded. You can now open your AI guide library."}
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button
                className="button"
                onClick={() => router.push("/ai-artifacts")}
                type="button"
                style={{ background: "var(--coach-accent)" }}
              >
                {uiLanguage === "fr" ? "Ouvrir ma bibliothèque" : "Open my library"}
              </button>

              <button
                className="button ghost"
                onClick={() => router.push("/recommendations")}
                type="button"
              >
                {uiLanguage === "fr"
                  ? "Retour aux recommandations"
                  : "Back to recommendations"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}