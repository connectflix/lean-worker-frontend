"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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

type GuideFormat = "ebook" | "audiobook";

function normalizeRouteParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeFormat(value: string | null | undefined): GuideFormat {
  return value === "audiobook" ? "audiobook" : "ebook";
}

function formatPrice(value: number): string {
  try {
    return new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value}€`;
  }
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

function getArtifactStatusIcon(status: string) {
  if (status === "completed") return <CheckCircleIcon size={14} />;
  return <ClockIcon size={14} />;
}

function getArtifactStatusStyle(status: string) {
  if (status === "completed") {
    return {
      background: "rgba(88,180,174,0.12)",
      borderColor: "rgba(88,180,174,0.20)",
      color: "var(--coach-calm)",
      fontWeight: 850,
    };
  }

  if (status === "failed") {
    return {
      background: "rgba(198,40,40,0.08)",
      borderColor: "rgba(198,40,40,0.16)",
      color: "var(--danger)",
      fontWeight: 850,
    };
  }

  if (status === "generating" || status === "paid" || status === "pending_payment") {
    return {
      background: "rgba(255,122,89,0.12)",
      borderColor: "rgba(255,122,89,0.20)",
      color: "var(--coach-accent)",
      fontWeight: 850,
    };
  }

  return {
    background: "rgba(43,33,24,0.05)",
    borderColor: "rgba(43,33,24,0.08)",
    color: "var(--coach-muted)",
    fontWeight: 850,
  };
}

function getFormatLabel(format: GuideFormat, uiLanguage: "fr" | "en"): string {
  if (format === "audiobook") {
    return uiLanguage === "fr" ? "Mini audiobook" : "Mini audiobook";
  }

  return uiLanguage === "fr" ? "Mini e-book" : "Mini e-book";
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
    "Personalized AI-generated mini e-book":
      "Mini e-book personnalisé généré par IA",
    "Personalized AI-generated mini audiobook":
      "Mini audiobook personnalisé généré par IA",
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
    "What you are facing right now":
      "Ta situation actuelle",
    "Why this matters now":
      "Pourquoi c’est important maintenant",
    "A practical action plan":
      "Un plan d’action concret",
    "Your next 48 hours":
      "Tes prochaines 48h",
  };

  return knownTranslations[normalized] ?? title;
}

function getRecommendationIdFromSources({
  routeRecommendationId,
  searchParams,
}: {
  routeRecommendationId: string | string[] | undefined;
  searchParams: ReturnType<typeof useSearchParams>;
}): number {
  const rawFromRoute = normalizeRouteParam(routeRecommendationId);

  const raw =
    rawFromRoute ||
    searchParams.get("recommendationId") ||
    searchParams.get("recommendation_id") ||
    searchParams.get("id") ||
    "";

  return Number(raw);
}

function CoachPreviewCard({
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
          ? "linear-gradient(135deg, rgba(255,241,220,0.92), rgba(255,255,255,0.90))"
          : "rgba(255,255,255,0.78)",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function PreviewBenefitRow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="row" style={{ gap: 8, alignItems: "center" }}>
      <CheckCircleIcon size={14} />
      <span>{children}</span>
    </div>
  );
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
  const params = useParams<{ recommendationId?: string }>();
  const searchParams = useSearchParams();

  const recommendationId = useMemo(
    () =>
      getRecommendationIdFromSources({
        routeRecommendationId: params.recommendationId,
        searchParams,
      }),
    [params.recommendationId, searchParams],
  );

  const { uiLanguage, loadingLanguage } = useUiLanguage("en");

  const [preview, setPreview] = useState<AIArtifactPreviewResponse | null>(null);
  const [format, setFormat] = useState<GuideFormat>(
    normalizeFormat(searchParams.get("format")),
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
    const urlFormat = normalizeFormat(searchParams.get("format"));

    setFormat((currentFormat) => {
      if (currentFormat === urlFormat) return currentFormat;
      return urlFormat;
    });
  }, [searchParams]);

  const loadPreview = useCallback(async () => {
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
        audiobook:
          relatedArtifacts.find((item) => item.format === "audiobook") ?? null,
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
  }, [format, recommendationId, uiLanguage]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const basePrice = useMemo(() => resolveDisplayPrice(preview), [preview]);
  const upsellPrice = upsell ? 9 : 0;
  const totalPrice = basePrice + upsellPrice;

  const currentArtifact = artifacts[format];
  const alternateFormat: GuideFormat = format === "ebook" ? "audiobook" : "ebook";
  const siblingArtifact = artifacts[alternateFormat];

  const currentArtifactIsUnlocked = currentArtifact?.status === "completed";
  const currentArtifactExists = Boolean(currentArtifact);
  const currentArtifactNeedsPayment =
    currentArtifact?.status === "pending_payment" ||
    currentArtifact?.status === "failed";
  const currentArtifactInProgress =
    currentArtifact?.status === "paid" ||
    currentArtifact?.status === "generating";

  const displayedActionPrice = currentArtifact?.price_eur ?? totalPrice;

  function updateFormat(nextFormat: GuideFormat) {
    setFormat(nextFormat);

    if (recommendationId && !Number.isNaN(recommendationId)) {
      router.replace(
        `/ai-artifacts/preview/${recommendationId}?format=${nextFormat}`,
        { scroll: false },
      );
    }
  }

  async function handlePrimaryAction() {
    try {
      setRedirecting(true);
      setError(null);

      if (!recommendationId || Number.isNaN(recommendationId)) {
        throw new Error(
          uiLanguage === "fr"
            ? "Identifiant de recommandation invalide."
            : "Invalid recommendation identifier.",
        );
      }

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

    router.push(
      `/ai-artifacts/preview/${recommendationId}?format=${alternateFormat}`,
    );
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
          : `Preview context — recommendation_id=${recommendationId}, format=${format}, artifact_status=${currentArtifact?.status ?? "none"}, price=${currentArtifact?.price_eur ?? totalPrice}€`;

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
      ? "Décris brièvement le problème rencontré sur cette preview ou ce paiement : prix, format, checkout, accès, déblocage, etc."
      : "Briefly describe the issue you encountered with this preview or payment: price, format, checkout, access, unlock, etc.";

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
          <CoachPreviewCard>
            <div className="section-title">
              {uiLanguage === "fr" ? "Chargement..." : "Loading..."}
            </div>
          </CoachPreviewCard>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Preview du guide IA" : "AI Guide Preview"}
    >
      {loading ? (
        <CoachPreviewCard warm>
          <div className="row" style={{ gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(255,122,89,0.12)",
                color: "var(--coach-accent)",
              }}
            >
              <SparkIcon size={20} />
            </div>

            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">
                {uiLanguage === "fr" ? "Chargement de la preview" : "Loading preview"}
              </div>
              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {uiLanguage === "fr"
                  ? "Le coach prépare un aperçu de ton guide personnalisé."
                  : "Your coach is preparing a preview of your personalized guide."}
              </div>
            </div>
          </div>
        </CoachPreviewCard>
      ) : error || !preview ? (
        <CoachPreviewCard>
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {uiLanguage === "fr"
              ? "Impossible de charger la preview"
              : "Unable to load preview"}
          </div>

          <div className="muted">{error}</div>

          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            <button
              className="button"
              onClick={() => void loadPreview()}
              type="button"
              style={{ background: "var(--coach-accent)" }}
            >
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
        </CoachPreviewCard>
      ) : (
        <div className="stack" style={{ gap: 18 }}>
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
                  <SparkIcon size={14} />
                  {uiLanguage === "fr" ? "Guide IA personnalisé" : "Personalized AI guide"}
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
                  <LayerIcon size={14} />
                  {getFormatLabel(format, uiLanguage)}
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
                {preview.title}
              </div>

              <div
                className="subtitle"
                style={{
                  maxWidth: 760,
                  color: "var(--coach-muted)",
                  fontSize: 16,
                  lineHeight: 1.7,
                }}
              >
                {localizePreviewSubtitle(preview.subtitle, uiLanguage)}
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <BadgePill icon={<TargetIcon size={14} />}>
                  {formatPrice(currentArtifact?.price_eur ?? basePrice)}
                </BadgePill>

                {currentArtifact ? (
                  <span
                    className="badge"
                    style={getArtifactStatusStyle(currentArtifact.status)}
                  >
                    {getArtifactStatusIcon(currentArtifact.status)}
                    {getArtifactStatusLabel(currentArtifact.status, uiLanguage)}
                  </span>
                ) : null}
              </div>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <button
                  className={format === "ebook" ? "button" : "button ghost"}
                  onClick={() => updateFormat("ebook")}
                  type="button"
                  style={
                    format === "ebook"
                      ? { background: "var(--coach-accent)" }
                      : undefined
                  }
                >
                  {uiLanguage === "fr" ? "Version mini e-book" : "Mini e-book version"}
                </button>

                <button
                  className={format === "audiobook" ? "button" : "button ghost"}
                  onClick={() => updateFormat("audiobook")}
                  type="button"
                  style={
                    format === "audiobook"
                      ? { background: "var(--coach-accent)" }
                      : undefined
                  }
                >
                  {uiLanguage === "fr"
                    ? "Version mini audiobook"
                    : "Mini audiobook version"}
                </button>
              </div>
            </div>
          </div>

          {currentArtifactExists ? (
            <CoachPreviewCard warm>
              <div className="section-title">
                {uiLanguage === "fr"
                  ? "Déjà débloqué ou déjà initié"
                  : "Already unlocked or already started"}
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
            </CoachPreviewCard>
          ) : null}

          <div className="grid grid-2">
            <CoachPreviewCard>
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                <TargetIcon />
                <div className="section-title">
                  {uiLanguage === "fr" ? "Pourquoi c’est critique" : "Why this matters now"}
                </div>
              </div>

              <div
                className="card-soft"
                style={{
                  borderRadius: 24,
                  background: "rgba(255,248,239,0.68)",
                  border: "1px solid rgba(43,33,24,0.08)",
                  color: "var(--coach-muted)",
                  lineHeight: 1.7,
                }}
              >
                {preview.goal ||
                  (uiLanguage === "fr"
                    ? "Ce point est directement lié à ta progression actuelle et bloque ton évolution."
                    : "This point is directly connected to your current progress and is slowing you down.")}
              </div>
            </CoachPreviewCard>

            <CoachPreviewCard>
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                <SparkIcon />
                <div className="section-title">
                  {uiLanguage === "fr"
                    ? "Alignement personnalisé"
                    : "Personalized alignment"}
                </div>
              </div>

              <div
                className="card-soft stack"
                style={{
                  gap: 10,
                  borderRadius: 24,
                  background: "rgba(255,248,239,0.68)",
                  border: "1px solid rgba(43,33,24,0.08)",
                  color: "var(--coach-muted)",
                  lineHeight: 1.65,
                }}
              >
                <PreviewBenefitRow>
                  {uiLanguage === "fr"
                    ? "Le guide tient compte de ta recommandation et de ton contexte de coaching."
                    : "The guide takes your recommendation and coaching context into account."}
                </PreviewBenefitRow>

                <PreviewBenefitRow>
                  {uiLanguage === "fr"
                    ? "S’il est disponible, ton Purpose Canvas enrichit la personnalisation."
                    : "When available, your Purpose Canvas enriches personalization."}
                </PreviewBenefitRow>
              </div>
            </CoachPreviewCard>
          </div>

          <CoachPreviewCard>
            <div className="section-title">
              {uiLanguage === "fr" ? "Ce que tu vas obtenir" : "What you will get"}
            </div>

            <div className="grid grid-3">
              {[
                uiLanguage === "fr" ? "Plan clair" : "Clear plan",
                uiLanguage === "fr" ? "Étapes concrètes" : "Concrete steps",
                uiLanguage === "fr" ? "Action immédiate" : "Immediate action",
              ].map((label) => (
                <div
                  key={label}
                  className="card-soft"
                  style={{
                    borderRadius: 22,
                    background: "rgba(255,248,239,0.68)",
                    border: "1px solid rgba(43,33,24,0.08)",
                  }}
                >
                  <PreviewBenefitRow>{label}</PreviewBenefitRow>
                </div>
              ))}
            </div>
          </CoachPreviewCard>

          {preview.outline_json?.sections?.length ? (
            <CoachPreviewCard>
              <div className="section-title">
                {uiLanguage === "fr"
                  ? "Ce que tu vas concrètement faire"
                  : "What you will concretely do"}
              </div>

              <div className="stack" style={{ gap: 10 }}>
                {preview.outline_json.sections.map((section, index) => (
                  <div
                    key={`${index}-${section.title ?? "section"}`}
                    className="card-soft"
                    style={{
                      borderRadius: 22,
                      background: "rgba(255,248,239,0.68)",
                      border: "1px solid rgba(43,33,24,0.08)",
                    }}
                  >
                    <PreviewBenefitRow>
                      {localizeOutlineSectionTitle(
                        section.title || `Section ${index + 1}`,
                        uiLanguage,
                      )}
                    </PreviewBenefitRow>
                  </div>
                ))}
              </div>
            </CoachPreviewCard>
          ) : null}

          {!currentArtifactExists ? (
            <CoachPreviewCard>
              <div className="section-title">
                {uiLanguage === "fr"
                  ? "Accélérer tes résultats"
                  : "Accelerate your results"}
              </div>

              <label
                className="row"
                style={{
                  gap: 10,
                  alignItems: "center",
                  borderRadius: 24,
                  padding: 16,
                  background: "rgba(255,248,239,0.68)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <input
                  type="checkbox"
                  checked={upsell}
                  onChange={() => setUpsell((value) => !value)}
                />

                <span style={{ fontWeight: 700, color: "var(--coach-ink)" }}>
                  {uiLanguage === "fr"
                    ? "Plan avancé (+9€)"
                    : "Advanced plan (+9€)"}
                </span>
              </label>

              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {uiLanguage === "fr"
                  ? "Ajoute une couche de guidage supplémentaire pour aller plus vite dans l’exécution."
                  : "Add an extra layer of guidance to move faster into execution."}
              </div>
            </CoachPreviewCard>
          ) : null}

          <CoachPreviewCard warm>
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {uiLanguage === "fr" ? "Action" : "Action"}
                </div>

                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1,
                    fontWeight: 950,
                    letterSpacing: "-0.055em",
                    color: "var(--coach-ink)",
                  }}
                >
                  {formatPrice(displayedActionPrice)}
                </div>
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                <button
                  className="button"
                  onClick={() => void handlePrimaryAction()}
                  type="button"
                  disabled={redirecting}
                  style={{ background: "var(--coach-accent)" }}
                >
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
          </CoachPreviewCard>

          <CoachPreviewCard>
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

            <div className="muted" style={{ color: "var(--coach-muted)" }}>
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
              <div
                className="card-soft stack"
                style={{
                  gap: 10,
                  borderRadius: 24,
                  background: "rgba(255,248,239,0.68)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <textarea
                  className="input"
                  value={supportMessage}
                  onChange={(event) => setSupportMessage(event.target.value)}
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
                    style={{ background: "var(--coach-accent)" }}
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
          </CoachPreviewCard>
        </div>
      )}
    </AppShell>
  );
}