"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import {
  ArrowRightIcon,
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  LayerIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";
import {
  createAIArtifact,
  createAIArtifactCheckoutSession,
  getMyAIArtifacts,
  previewAIArtifact,
  submitSupportCaseFlow,
} from "@/lib/api";
import { useUiLanguage } from "@/lib/use-ui-language";
import type {
  AIArtifactPreviewResponse,
  AIArtifactStatusResponse,
} from "@/lib/types";

type RecommendationArtifactStatus = AIArtifactStatusResponse & {
  recommendation_id?: number;
};

function formatPrice(value: number) {
  return `${value}€`;
}

function resolveDisplayPrice(preview: AIArtifactPreviewResponse | null): number {
  return preview?.estimated_price_eur ?? 0;
}

function getArtifactStatusLabel(status: string, uiLanguage: "fr" | "en"): string {
  if (uiLanguage === "fr") {
    if (status === "completed") return "Débloqué";
    if (status === "generating") return "Génération en cours";
    if (status === "paid") return "Paiement confirmé";
    if (status === "pending_payment") return "Paiement en attente";
    if (status === "failed") return "Échec";
  }

  if (status === "completed") return "Unlocked";
  if (status === "generating") return "Generating";
  if (status === "paid") return "Paid";
  if (status === "pending_payment") return "Pending payment";
  if (status === "failed") return "Failed";
  return status;
}

function localizePreviewSubtitle(
  subtitle: string | null | undefined,
  uiLanguage: "fr" | "en",
): string | null {
  if (!subtitle) return subtitle ?? null;
  if (uiLanguage !== "fr") return subtitle;

  const normalized = subtitle.trim();

  const knownTranslations: Record<string, string> = {
    "A concise practical guide generated from your coaching recommendation.":
      "Un guide pratique concis, généré à partir de ta recommandation de coaching.",
    "A concise audio guide generated from your coaching recommendation.":
      "Un guide audio concis, généré à partir de ta recommandation de coaching.",
  };

  return knownTranslations[normalized] ?? subtitle;
}

function localizeOutlineSectionTitle(
  title: string | null | undefined,
  uiLanguage: "fr" | "en",
): string | null {
  if (!title) return title ?? null;
  if (uiLanguage !== "fr") return title;

  const normalized = title.trim();

  const knownTranslations: Record<string, string> = {
    "Why this action matters now":
      "Pourquoi cette action est importante maintenant",
    "How to start concretely":
      "Comment démarrer concrètement",
    "Common blockers and how to overcome them":
      "Les blocages fréquents et comment les dépasser",
    "A simple execution plan for the next days":
      "Un plan d’exécution simple pour les prochains jours",
    "What this recommendation changes":
      "Ce que cette recommandation change",
    "How to move from insight to action":
      "Comment passer de l’insight à l’action",
  };

  return knownTranslations[normalized] ?? title;
}

export default function AIArtifactPreviewPage() {
  return (
    <AuthGuard>
      <AIArtifactPreviewContent />
    </AuthGuard>
  );
}

function AIArtifactPreviewContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const recommendationId = Number(params?.recommendationId);
  const initialFormat = (searchParams.get("format") || "ebook") as "ebook" | "audiobook";

  const { uiLanguage } = useUiLanguage("en");

  const [preview, setPreview] = useState<AIArtifactPreviewResponse | null>(null);
  const [format, setFormat] = useState<"ebook" | "audiobook">(
    initialFormat === "audiobook" ? "audiobook" : "ebook",
  );
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upsell, setUpsell] = useState(true);
  const [artifacts, setArtifacts] = useState<{
    ebook: RecommendationArtifactStatus | null;
    audiobook: RecommendationArtifactStatus | null;
  }>({
    ebook: null,
    audiobook: null,
  });

  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!recommendationId || Number.isNaN(recommendationId)) {
          throw new Error(
            uiLanguage === "fr"
              ? "Identifiant de recommandation invalide."
              : "Invalid recommendation identifier.",
          );
        }

        const [previewData, artifactList] = await Promise.all([
          previewAIArtifact(recommendationId, format),
          getMyAIArtifacts(),
        ]);

        const relatedArtifacts = (artifactList as RecommendationArtifactStatus[]).filter(
          (item) => item.recommendation_id === recommendationId,
        );

        setArtifacts({
          ebook: relatedArtifacts.find((item) => item.format === "ebook") ?? null,
          audiobook: relatedArtifacts.find((item) => item.format === "audiobook") ?? null,
        });

        setPreview(previewData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : uiLanguage === "fr"
              ? "Impossible de charger la preview."
              : "Unable to load preview.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [format, recommendationId, uiLanguage]);

  const basePrice = useMemo(() => resolveDisplayPrice(preview), [preview]);
  const upsellPrice = upsell ? 9 : 0;
  const totalPrice = basePrice + upsellPrice;

  const currentArtifact = artifacts[format];
  const alternateFormat = format === "ebook" ? "audiobook" : "ebook";
  const siblingArtifact = artifacts[alternateFormat];

  const currentArtifactIsUnlocked = currentArtifact?.status === "completed";
  const currentArtifactExists = !!currentArtifact;
  const currentArtifactNeedsPayment =
    currentArtifact?.status === "pending_payment" || currentArtifact?.status === "failed";
  const currentArtifactInProgress =
    currentArtifact?.status === "paid" || currentArtifact?.status === "generating";

  async function handlePrimaryAction() {
    try {
      setRedirecting(true);
      setError(null);

      if (currentArtifact) {
        if (currentArtifactIsUnlocked || currentArtifactInProgress) {
          router.push(`/ai-artifacts/${currentArtifact.id}`);
          return;
        }

        if (currentArtifactNeedsPayment) {
          const checkout = await createAIArtifactCheckoutSession(currentArtifact.id);
          if (!checkout.checkout_url) {
            throw new Error(
              uiLanguage === "fr"
                ? "Impossible de créer la session de paiement."
                : "Unable to create checkout session.",
            );
          }
          window.location.href = checkout.checkout_url;
          return;
        }
      }

      const created = await createAIArtifact({
        recommendation_id: recommendationId,
        format,
        upsell,
      });

      const checkout = await createAIArtifactCheckoutSession(created.id);

      if (!checkout.checkout_url) {
        throw new Error(
          uiLanguage === "fr"
            ? "Impossible de créer la session de paiement."
            : "Unable to create checkout session.",
        );
      }

      window.location.href = checkout.checkout_url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible de démarrer le paiement."
            : "Unable to start checkout.",
      );
      setRedirecting(false);
    }
  }

  function handleSiblingAction() {
    if (siblingArtifact) {
      router.push(`/ai-artifacts/${siblingArtifact.id}`);
      return;
    }

    router.push(`/ai-artifacts/preview/${recommendationId}?format=${alternateFormat}`);
  }

  async function handleSubmitSupport() {
    const trimmed = supportMessage.trim();

    if (!trimmed) {
      setSupportError(
        uiLanguage === "fr"
          ? "Merci de décrire le problème avant l’envoi."
          : "Please describe the issue before sending.",
      );
      setSupportSuccess(null);
      return;
    }

    try {
      setSupportSubmitting(true);
      setSupportError(null);
      setSupportSuccess(null);

      const contextLine =
        uiLanguage === "fr"
          ? `Contexte preview — recommendation_id=${recommendationId}, format=${format}, artifact_status=${currentArtifact?.status ?? "none"}, prix=${currentArtifact?.price_eur ?? totalPrice}€.`
          : `Preview context — recommendation_id=${recommendationId}, format=${format}, artifact_status=${currentArtifact?.status ?? "none"}, price=${currentArtifact?.price_eur ?? totalPrice}€.`;

      const finalMessage = `${trimmed}\n\n${contextLine}`;

      await submitSupportCaseFlow({
        message: finalMessage,
        language: uiLanguage,
        source: "artifact_preview_page",
      });

      setSupportSuccess(
        uiLanguage === "fr"
          ? "Ton signal a bien été envoyé. Nous allons analyser le problème."
          : "Your report has been sent successfully. We will analyze the issue.",
      );
      setSupportMessage("");
      setSupportOpen(false);
    } catch (err) {
      setSupportError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible d’envoyer le signal pour le moment."
            : "Unable to send the report right now.",
      );
    } finally {
      setSupportSubmitting(false);
    }
  }

  function getPrimaryButtonLabel() {
    if (redirecting) {
      return uiLanguage === "fr" ? "Redirection..." : "Redirecting...";
    }

    if (currentArtifactIsUnlocked) {
      return uiLanguage === "fr" ? "Ouvrir le guide" : "Open guide";
    }

    if (currentArtifactInProgress) {
      return uiLanguage === "fr" ? "Voir le statut du guide" : "View guide status";
    }

    if (currentArtifactNeedsPayment) {
      return uiLanguage === "fr" ? "Continuer le paiement" : "Continue payment";
    }

    return uiLanguage === "fr"
      ? `Débloquer (${formatPrice(totalPrice)})`
      : `Unlock (${formatPrice(totalPrice)})`;
  }

  function getSiblingButtonLabel() {
    if (siblingArtifact?.status === "completed") {
      return alternateFormat === "ebook"
        ? uiLanguage === "fr"
          ? "Ouvrir la version e-book"
          : "Open e-book version"
        : uiLanguage === "fr"
          ? "Ouvrir la version audio"
          : "Open audio version";
    }

    return alternateFormat === "ebook"
      ? uiLanguage === "fr"
        ? "Découvrir la version e-book"
        : "Discover e-book version"
      : uiLanguage === "fr"
        ? "Découvrir la version audio"
        : "Discover audio version";
  }

  const supportPlaceholder =
    uiLanguage === "fr"
      ? "Décris brièvement le problème rencontré sur cette preview ou ce paiement (prix, format, checkout, accès, déblocage, etc.)."
      : "Briefly describe the issue you encountered with this preview or payment (price, format, checkout, access, unlock, etc.).";

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Preview du guide IA" : "AI Guide Preview"}
    >
      {loading ? (
        <div className="card stack">
          <div className="section-title">
            {uiLanguage === "fr" ? "Chargement de la preview" : "Loading preview"}
          </div>
          <div className="muted">
            {uiLanguage === "fr"
              ? "Le coach prépare un aperçu de ton guide personnalisé."
              : "Your coach is preparing a preview of your personalized guide."}
          </div>
        </div>
      ) : error || !preview ? (
        <div className="card stack">
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {uiLanguage === "fr"
              ? "Impossible de charger la preview"
              : "Unable to load preview"}
          </div>

          <div className="muted">{error}</div>

          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            <button className="button" onClick={() => window.location.reload()} type="button">
              {uiLanguage === "fr" ? "Réessayer" : "Try again"}
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
      ) : (
        <>
          <div className="card stack">
            <h1 className="title">{preview.title}</h1>
            <div className="muted">
              {localizePreviewSubtitle(preview.subtitle, uiLanguage)}
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <BadgePill icon={<LayerIcon size={14} />}>
                {format === "audiobook" ? "Mini audiobook" : "Mini e-book"}
              </BadgePill>

              <BadgePill icon={<TargetIcon size={14} />}>
                {formatPrice(currentArtifact?.price_eur ?? basePrice)}
              </BadgePill>

              {currentArtifactExists ? (
                <BadgePill icon={<CheckCircleIcon size={14} />}>
                  {getArtifactStatusLabel(currentArtifact!.status, uiLanguage)}
                </BadgePill>
              ) : null}
            </div>

            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <button
                className={format === "ebook" ? "button" : "button ghost"}
                onClick={() => setFormat("ebook")}
                type="button"
              >
                {uiLanguage === "fr" ? "Version mini e-book" : "Mini e-book version"}
              </button>

              <button
                className={format === "audiobook" ? "button" : "button ghost"}
                onClick={() => setFormat("audiobook")}
                type="button"
              >
                {uiLanguage === "fr" ? "Version mini audiobook" : "Mini audiobook version"}
              </button>
            </div>
          </div>

          {currentArtifactExists ? (
            <div className="card stack">
              <div className="section-title">
                {uiLanguage === "fr" ? "Déjà débloqué ou déjà initié" : "Already unlocked or already started"}
              </div>
              <div className="card-soft">
                {currentArtifactIsUnlocked
                  ? uiLanguage === "fr"
                    ? "Ce guide a déjà été débloqué. Tu peux l’ouvrir directement, sans le repayer."
                    : "This guide has already been unlocked. You can open it directly without paying again."
                  : currentArtifactInProgress
                    ? uiLanguage === "fr"
                      ? "Ce guide est déjà en cours de préparation. Tu peux suivre son statut."
                      : "This guide is already being prepared. You can follow its status."
                    : uiLanguage === "fr"
                      ? "Un paiement a déjà été initié pour ce guide. Tu peux reprendre à partir de l’artefact existant."
                      : "A payment has already been initiated for this guide. You can resume from the existing artifact."}
              </div>
            </div>
          ) : null}

          <div className="card stack">
            <div className="section-title">
              {uiLanguage === "fr" ? "Pourquoi c’est critique" : "Why this matters now"}
            </div>
            <div className="card-soft">
              {preview.goal ||
                (uiLanguage === "fr"
                  ? "Ce point est directement lié à ta progression actuelle et bloque ton évolution."
                  : "This point is directly connected to your current progress and is slowing you down.")}
            </div>
          </div>

          <div className="card stack">
            <div className="section-title">
              {uiLanguage === "fr" ? "Ce que tu vas obtenir" : "What you will get"}
            </div>

            <div className="card-soft stack" style={{ gap: 10 }}>
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <CheckCircleIcon size={14} />
                <span>{uiLanguage === "fr" ? "Plan clair" : "Clear plan"}</span>
              </div>

              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <CheckCircleIcon size={14} />
                <span>{uiLanguage === "fr" ? "Étapes concrètes" : "Concrete steps"}</span>
              </div>

              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <CheckCircleIcon size={14} />
                <span>{uiLanguage === "fr" ? "Action immédiate" : "Immediate action"}</span>
              </div>
            </div>
          </div>

          {preview.outline_json?.sections?.length ? (
            <div className="card stack">
              <div className="section-title">
                {uiLanguage === "fr"
                  ? "Ce que tu vas concrètement faire"
                  : "What you will concretely do"}
              </div>

              <div className="stack" style={{ gap: 10 }}>
                {preview.outline_json.sections.map((section, index) => (
                  <div key={`${index}-${section.title ?? "section"}`} className="card-soft">
                    <div className="row" style={{ gap: 8, alignItems: "center" }}>
                      <CheckCircleIcon size={14} />
                      <span>
                        {localizeOutlineSectionTitle(
                          section.title || `Section ${index + 1}`,
                          uiLanguage,
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!currentArtifactExists ? (
            <div className="card stack">
              <div className="section-title">
                {uiLanguage === "fr"
                  ? "Accélérer tes résultats"
                  : "Accelerate your results"}
              </div>

              <label className="row" style={{ gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={upsell}
                  onChange={() => setUpsell(!upsell)}
                />
                <span>
                  {uiLanguage === "fr" ? "Plan avancé (+9€)" : "Advanced plan (+9€)"}
                </span>
              </label>

              <div className="muted">
                {uiLanguage === "fr"
                  ? "Ajoute une couche de guidage supplémentaire pour aller plus vite dans l’exécution."
                  : "Add an extra layer of guidance to move faster into execution."}
              </div>
            </div>
          ) : null}

          <div className="card stack">
            <div className="row space-between">
              <span>{uiLanguage === "fr" ? "Action" : "Action"}</span>
              <strong>
                {currentArtifactExists
                  ? formatPrice(currentArtifact?.price_eur ?? basePrice)
                  : formatPrice(totalPrice)}
              </strong>
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button className="button" onClick={handlePrimaryAction} type="button">
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <ArrowRightIcon size={14} />
                  {getPrimaryButtonLabel()}
                </span>
              </button>

              <button
                className="button ghost"
                onClick={handleSiblingAction}
                type="button"
              >
                {getSiblingButtonLabel()}
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

          <div className="card stack">
            <div className="row space-between" style={{ alignItems: "center", gap: 12 }}>
              <div className="section-title">
                {uiLanguage === "fr" ? "Besoin d’aide ?" : "Need help?"}
              </div>

              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  setSupportOpen((value) => !value);
                  setSupportError(null);
                  setSupportSuccess(null);
                }}
              >
                {supportOpen
                  ? uiLanguage === "fr"
                    ? "Masquer"
                    : "Hide"
                  : uiLanguage === "fr"
                    ? "Signaler un problème"
                    : "Report an issue"}
              </button>
            </div>

            <div className="muted">
              {uiLanguage === "fr"
                ? "LeanWorker tente déjà de détecter automatiquement certains incidents. Utilise ce formulaire si le problème persiste."
                : "LeanWorker already tries to detect some incidents automatically. Use this form if the issue persists."}
            </div>

            {supportSuccess ? (
              <div className="card-soft" style={{ color: "var(--success, #15803d)" }}>
                {supportSuccess}
              </div>
            ) : null}

            {supportError ? (
              <div className="card-soft" style={{ color: "var(--danger)" }}>
                {supportError}
              </div>
            ) : null}

            {supportOpen ? (
              <div className="card-soft stack" style={{ gap: 10 }}>
                <textarea
                  className="input"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder={supportPlaceholder}
                  rows={5}
                  style={{ width: "100%", resize: "vertical" }}
                />

                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="button"
                    type="button"
                    onClick={() => void handleSubmitSupport()}
                    disabled={supportSubmitting}
                  >
                    {supportSubmitting
                      ? uiLanguage === "fr"
                        ? "Envoi..."
                        : "Sending..."
                      : uiLanguage === "fr"
                        ? "Envoyer"
                        : "Send"}
                  </button>

                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => {
                      setSupportOpen(false);
                      setSupportMessage("");
                      setSupportError(null);
                    }}
                    disabled={supportSubmitting}
                  >
                    {uiLanguage === "fr" ? "Annuler" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </AppShell>
  );
}