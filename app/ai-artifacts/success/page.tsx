"use client";

import { useEffect, useState } from "react";
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
  return `${price}€`;
}

function getStatusIcon(status: string) {
  if (status === "completed") return <CheckCircleIcon size={14} />;
  return <ClockIcon size={14} />;
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

  const artifactId =
    artifactIdParam && Number.isFinite(Number(artifactIdParam))
      ? Number(artifactIdParam)
      : null;

  const { uiLanguage, loadingLanguage } = useUiLanguage("en");
  const copy = getUiCopy(uiLanguage);

  const [artifact, setArtifact] = useState<AIArtifactResponse | null>(null);
  const [loadingArtifact, setLoadingArtifact] = useState(Boolean(artifactId));
  const [error, setError] = useState<string | null>(null);

  async function loadArtifact() {
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
  }

  useEffect(() => {
    void loadArtifact();
  }, [artifactId, uiLanguage]);

  if (loadingLanguage) {
    return (
      <main className="page">
        <div className="page-wrap">
          <div className="card">{copy.common.loading}</div>
        </div>
      </main>
    );
  }

  const isCompleted = artifact?.status === "completed";
  const isGenerating = artifact?.status === "generating" || artifact?.status === "paid";

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Paiement réussi" : "Payment successful"}
    >
      <div className="card stack">
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <CheckCircleIcon />
          <h1 className="title">
            {uiLanguage === "fr" ? "Paiement confirmé" : "Payment confirmed"}
          </h1>
        </div>

        <p className="subtitle">
          {uiLanguage === "fr"
            ? "Ton achat a bien été enregistré. Nous préparons maintenant ton guide IA personnalisé."
            : "Your purchase has been confirmed. We are now preparing your personalized AI guide."}
        </p>

        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <BadgePill icon={<SparkIcon size={14} />}>
            {uiLanguage === "fr"
              ? "Guide personnalisé"
              : "Personalized guide"}
          </BadgePill>

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
        </div>
      </div>

      {loadingArtifact ? (
        <div className="card stack">
          <div className="section-title">
            {uiLanguage === "fr"
              ? "Chargement du guide"
              : "Loading guide"}
          </div>

          <div className="muted">
            {uiLanguage === "fr"
              ? "Nous récupérons les dernières informations sur ton artefact."
              : "We are retrieving the latest information about your artifact."}
          </div>
        </div>
      ) : error ? (
        <div className="card stack">
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
            >
              {uiLanguage === "fr" ? "Réessayer" : "Try again"}
            </button>

            <button
              className="button ghost"
              onClick={() => router.push("/ai-artifacts")}
              type="button"
            >
              {uiLanguage === "fr"
                ? "Ouvrir ma bibliothèque"
                : "Open my library"}
            </button>
          </div>
        </div>
      ) : artifact ? (
        <>
          <div className="card stack">
            <div className="row space-between" style={{ alignItems: "flex-start", gap: 16 }}>
              <div className="stack" style={{ gap: 6 }}>
                <div className="section-title">{artifact.title}</div>
                {artifact.subtitle ? <div className="muted">{artifact.subtitle}</div> : null}
              </div>

              <BadgePill icon={getStatusIcon(artifact.status)}>
                {formatArtifactStatus(artifact.status, uiLanguage)}
              </BadgePill>
            </div>

            <div className="card-soft">
              <div className="muted">
                {isCompleted
                  ? uiLanguage === "fr"
                    ? "Ton guide est prêt. Tu peux l’ouvrir immédiatement."
                    : "Your guide is ready. You can open it immediately."
                  : isGenerating
                    ? uiLanguage === "fr"
                      ? "Le paiement est confirmé et la génération est en cours. Ton guide sera disponible très bientôt."
                      : "Payment is confirmed and generation is in progress. Your guide will be available very soon."
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
              >
                {uiLanguage === "fr"
                  ? "Ouvrir ma bibliothèque"
                  : "Open my library"}
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

          {artifact.goal ? (
            <div className="card stack">
              <div className="section-title">
                {uiLanguage === "fr" ? "Objectif du guide" : "Guide goal"}
              </div>
              <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                {artifact.goal}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="card stack">
          <div className="section-title">
            {uiLanguage === "fr"
              ? "Paiement enregistré"
              : "Payment recorded"}
          </div>

          <div className="muted">
            {uiLanguage === "fr"
              ? "Ton paiement a bien été pris en compte. Tu peux maintenant consulter ta bibliothèque de guides IA."
              : "Your payment has been recorded. You can now open your AI guide library."}
          </div>

          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            <button
              className="button"
              onClick={() => router.push("/ai-artifacts")}
              type="button"
            >
              {uiLanguage === "fr"
                ? "Ouvrir ma bibliothèque"
                : "Open my library"}
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
    </AppShell>
  );
}