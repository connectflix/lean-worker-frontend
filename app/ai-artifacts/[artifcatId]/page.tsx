"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { PremiumEbookReader } from "@/components/premium-ebook-reader";
import {
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  LayerIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";
import { getAIArtifact, submitSupportCaseFlow } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { getUiCopy } from "@/lib/ui-copy";
import { useUiLanguage } from "@/lib/use-ui-language";
import type { AIArtifactResponse } from "@/lib/types";

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

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function normalizeRouteParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function parseArtifactIdFromSources(
  params: ReturnType<typeof useParams>,
  pathname: string | null,
): number | null {
  const rawFromParams = normalizeRouteParam(
    params?.artifactId as string | string[] | undefined,
  );

  if (rawFromParams) {
    const parsed = Number(rawFromParams);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  if (pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];

    if (last && last !== "ai-artifacts") {
      const parsed = Number(last);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  return null;
}

function resolveAssetUrl(src: string | null | undefined): string | null {
  if (!src) return null;

  const trimmed = src.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const base = API_BASE_URL.replace(/\/+$/, "");
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `${base}${path}`;
}

function localizeArtifactSubtitle(
  subtitle: string | null | undefined,
  uiLanguage: "fr" | "en",
): string | null {
  if (!subtitle) return subtitle ?? null;
  if (uiLanguage !== "fr") return subtitle;

  const normalized = subtitle.trim();

  const knownTranslations: Record<string, string> = {
    "Personalized AI-generated mini e-book":
      "Mini e-book personnalisé généré par IA",
    "Personalized AI-generated mini audiobook":
      "Mini audiobook personnalisé généré par IA",
  };

  return knownTranslations[normalized] ?? subtitle;
}

function extractPurposeCanvasContext(artifact: AIArtifactResponse | null): string {
  const payload = artifact?.personalization_context_json;

  if (!payload || typeof payload !== "object") {
    return "";
  }

  const value = (payload as Record<string, unknown>).purpose_canvas_context;

  return typeof value === "string" ? value.trim() : "";
}

function hasPurposeCanvasContext(artifact: AIArtifactResponse | null): boolean {
  return Boolean(extractPurposeCanvasContext(artifact));
}

function PremiumAudioPlayer({
  src,
  uiLanguage,
  storageKey,
}: {
  src: string;
  uiLanguage: "fr" | "en";
  storageKey: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  function loadSavedPosition() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return 0;
      return Number(raw) || 0;
    } catch {
      return 0;
    }
  }

  function savePosition(time: number) {
    try {
      localStorage.setItem(storageKey, String(time));
    } catch {
      // Ignore storage failures.
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const savedTime = loadSavedPosition();

    const onLoadedMetadata = () => {
      const nextDuration = audio.duration || 0;
      setDuration(nextDuration);
      setIsReady(true);

      if (savedTime > 0 && savedTime < nextDuration) {
        audio.currentTime = savedTime;
        setCurrentTime(savedTime);
      }
    };

    const onTimeUpdate = () => {
      const time = audio.currentTime || 0;
      setCurrentTime(time);

      if (Math.floor(time) % 2 === 0) {
        savePosition(time);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      savePosition(0);
      setCurrentTime(0);
    };

    const onPause = () => {
      setIsPlaying(false);
      savePosition(audio.currentTime || 0);
    };

    const onPlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [src, storageKey]);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  }

  function seekTo(value: number) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value;
    setCurrentTime(value);
    savePosition(value);
  }

  function jump(delta: number) {
    const audio = audioRef.current;
    if (!audio) return;

    const next = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));

    audio.currentTime = next;
    setCurrentTime(next);
    savePosition(next);
  }

  function changeRate(rate: number) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
  }

  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="card-soft stack" style={{ gap: 14 }}>
      <audio ref={audioRef} preload="metadata" src={src} />

      <div className="stack" style={{ gap: 4 }}>
        <div className="section-title">
          {uiLanguage === "fr" ? "Lecteur audio" : "Audio player"}
        </div>

        <div className="muted">
          {uiLanguage === "fr"
            ? "Écoute directement ton mini audiobook."
            : "Listen directly to your mini audiobook."}
        </div>
      </div>

      <div className="row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className="button"
          onClick={() => void togglePlay()}
          type="button"
          disabled={!isReady}
          style={{ minWidth: 110 }}
        >
          {isPlaying ? "Pause" : uiLanguage === "fr" ? "Lecture" : "Play"}
        </button>

        <button
          className="button ghost"
          onClick={() => jump(-10)}
          type="button"
          disabled={!isReady}
        >
          -10s
        </button>

        <button
          className="button ghost"
          onClick={() => jump(10)}
          type="button"
          disabled={!isReady}
        >
          +10s
        </button>

        <select
          className="input"
          value={playbackRate}
          onChange={(event) => changeRate(Number(event.target.value))}
          style={{ width: 110 }}
          disabled={!isReady}
        >
          {[0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
            <option key={rate} value={rate}>
              {rate}x
            </option>
          ))}
        </select>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => seekTo(Number(event.target.value))}
          disabled={!isReady}
          style={{ width: "100%", accentColor: "var(--primary)" }}
        />

        <div className="row space-between">
          <span className="muted">{formatDuration(currentTime)}</span>
          <span className="muted">{progressPercent.toFixed(0)}%</span>
          <span className="muted">{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AIArtifactDetailPage() {
  return (
    <AuthGuard>
      <AIArtifactDetailContent />
    </AuthGuard>
  );
}

function AIArtifactDetailContent() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const artifactId = parseArtifactIdFromSources(params, pathname);

  const { uiLanguage, loadingLanguage } = useUiLanguage("en");
  const copy = getUiCopy(uiLanguage);

  const [artifact, setArtifact] = useState<AIArtifactResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAudioScript, setShowAudioScript] = useState(false);

  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);

  async function loadArtifact(showRefreshing = false) {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      if (artifactId == null) {
        throw new Error(
          uiLanguage === "fr"
            ? "Identifiant d’artefact introuvable dans l’URL."
            : "Artifact identifier could not be resolved from the URL.",
        );
      }

      const artifactData = await getAIArtifact(artifactId);
      setArtifact(artifactData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible de charger l’artefact."
            : "Unable to load artifact.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadArtifact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifactId, pathname, uiLanguage]);

  useEffect(() => {
    setShowAudioScript(false);
  }, [artifact?.id]);

  const resolvedAudioUrl = useMemo(
    () => resolveAssetUrl(artifact?.audio_url),
    [artifact?.audio_url],
  );

  const canPlayAudio = useMemo(() => Boolean(resolvedAudioUrl), [resolvedAudioUrl]);
  const purposeCanvasAvailable = useMemo(
    () => hasPurposeCanvasContext(artifact),
    [artifact],
  );

  const outlineSections = Array.isArray(
    (artifact?.outline_json as { sections?: Array<{ title?: string }> } | undefined)
      ?.sections,
  )
    ? ((artifact?.outline_json as { sections?: Array<{ title?: string }> }).sections ?? [])
    : [];

  const supportPlaceholder =
    uiLanguage === "fr"
      ? "Décris brièvement le problème rencontré sur ce guide : paiement, accès, génération, lecture audio, contenu indisponible, etc."
      : "Briefly describe the issue you encountered with this guide: payment, access, generation, audio playback, unavailable content, etc.";

  async function handleSubmitSupport() {
    const trimmed = supportMessage.trim();

    if (!trimmed) {
      setSupportError(
        uiLanguage === "fr"
          ? "Merci de décrire ton problème avant l’envoi."
          : "Please describe your issue before sending.",
      );
      setSupportSuccess(null);
      return;
    }

    if (!artifact) {
      setSupportError(
        uiLanguage === "fr"
          ? "Impossible d’envoyer la demande sans artefact chargé."
          : "Cannot submit the request without a loaded artifact.",
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
          ? `Contexte artefact — id=${artifact.id}, format=${artifact.format}, statut=${artifact.status}, titre="${artifact.title}".`
          : `Artifact context — id=${artifact.id}, format=${artifact.format}, status=${artifact.status}, title="${artifact.title}".`;

      const finalMessage = `${trimmed}\n\n${contextLine}`;

      await submitSupportCaseFlow({
        message: finalMessage,
        language: uiLanguage,
        source: "artifact_detail_page",
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

  if (loadingLanguage) {
    return (
      <main className="page">
        <div className="page-wrap">
          <div className="card">{copy.common.loading}</div>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Détail du guide IA" : "AI Guide Details"}
    >
      {loading ? (
        <div className="card stack">
          <div className="section-title">
            {uiLanguage === "fr" ? "Chargement du guide IA" : "Loading AI guide"}
          </div>

          <div className="muted">
            {uiLanguage === "fr"
              ? "Nous récupérons ton contenu généré."
              : "We are retrieving your generated content."}
          </div>
        </div>
      ) : error ? (
        <div className="card stack">
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {uiLanguage === "fr"
              ? "Impossible de charger le guide IA"
              : "Unable to load AI guide"}
          </div>

          <div className="muted">{error}</div>

          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            <button className="button" onClick={() => void loadArtifact()} type="button">
              {uiLanguage === "fr" ? "Réessayer" : "Try again"}
            </button>

            <button
              className="button ghost"
              onClick={() => router.push("/ai-artifacts")}
              type="button"
            >
              {uiLanguage === "fr" ? "Retour à mes guides IA" : "Back to my AI guides"}
            </button>
          </div>
        </div>
      ) : !artifact ? (
        <div className="card stack">
          <div className="section-title">
            {uiLanguage === "fr" ? "Artefact introuvable" : "Artifact not found"}
          </div>

          <div className="muted">
            {uiLanguage === "fr"
              ? "Le guide demandé n’existe pas ou n’est plus accessible."
              : "The requested guide does not exist or is no longer accessible."}
          </div>
        </div>
      ) : (
        <>
          <div className="card stack">
            <div className="row space-between" style={{ alignItems: "flex-start", gap: 16 }}>
              <div className="stack" style={{ gap: 6 }}>
                <div className="section-title">{artifact.title}</div>

                <div className="muted">{formatArtifactType(artifact.format, uiLanguage)}</div>

                {artifact.subtitle ? (
                  <div className="muted">
                    {localizeArtifactSubtitle(artifact.subtitle, uiLanguage)}
                  </div>
                ) : null}
              </div>

              <BadgePill icon={getStatusIcon(artifact.status)}>
                {formatArtifactStatus(artifact.status, uiLanguage)}
              </BadgePill>
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <BadgePill icon={<LayerIcon size={14} />}>
                {formatPrice(artifact.price_eur)}
              </BadgePill>

              <BadgePill icon={<ClockIcon size={14} />}>
                {uiLanguage === "fr" ? "Mis à jour" : "Updated"}{" "}
                {new Date(artifact.updated_at).toLocaleString()}
              </BadgePill>

              {artifact.estimated_effort_score != null ? (
                <BadgePill icon={<TargetIcon size={14} />}>
                  {uiLanguage === "fr"
                    ? `Effort ${artifact.estimated_effort_score}/5`
                    : `Effort ${artifact.estimated_effort_score}/5`}
                </BadgePill>
              ) : null}
            </div>

            {artifact.goal ? (
              <div className="card-soft stack" style={{ gap: 6 }}>
                <div className="section-title">
                  {uiLanguage === "fr" ? "Objectif" : "Goal"}
                </div>

                <div style={{ whiteSpace: "pre-wrap" }}>{artifact.goal}</div>
              </div>
            ) : null}

            {artifact.target_action ? (
              <div className="card-soft stack" style={{ gap: 6 }}>
                <div className="section-title">
                  {uiLanguage === "fr" ? "Action ciblée" : "Target action"}
                </div>

                <div style={{ whiteSpace: "pre-wrap" }}>{artifact.target_action}</div>
              </div>
            ) : null}

            {purposeCanvasAvailable ? (
              <div className="card-soft stack" style={{ gap: 8 }}>
                <div className="section-title">
                  {uiLanguage === "fr"
                    ? "Personnalisation Purpose Canvas"
                    : "Purpose Canvas personalization"}
                </div>

                <div className="muted">
                  {uiLanguage === "fr"
                    ? "Ce guide a été enrichi avec ton Purpose Canvas : Travail, Aspiration, Inspiration, Passion, Vocation et Formation."
                    : "This guide was enriched with your Purpose Canvas: Travail, Aspiration, Inspiration, Passion, Vocation, and Formation."}
                </div>
              </div>
            ) : null}

            {artifact.error_message ? (
              <div style={{ color: "var(--danger)" }}>{artifact.error_message}</div>
            ) : null}

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button
                className="button ghost"
                onClick={() => void loadArtifact(true)}
                type="button"
                disabled={refreshing}
              >
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <ClockIcon size={14} />
                  {refreshing
                    ? uiLanguage === "fr"
                      ? "Actualisation..."
                      : "Refreshing..."
                    : uiLanguage === "fr"
                      ? "Actualiser"
                      : "Refresh"}
                </span>
              </button>

              <button
                className="button secondary"
                onClick={() => router.push("/ai-artifacts")}
                type="button"
              >
                {uiLanguage === "fr" ? "Retour à mes guides IA" : "Back to my AI guides"}
              </button>

              <button
                className="button ghost"
                onClick={() => {
                  setSupportOpen((value) => !value);
                  setSupportError(null);
                  setSupportSuccess(null);
                }}
                type="button"
              >
                {supportOpen
                  ? uiLanguage === "fr"
                    ? "Masquer le support"
                    : "Hide support"
                  : uiLanguage === "fr"
                    ? "Signaler un problème"
                    : "Report an issue"}
              </button>
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
                <div className="section-title">
                  {uiLanguage === "fr" ? "Décrire le problème" : "Describe the issue"}
                </div>

                <div className="muted">
                  {uiLanguage === "fr"
                    ? "Utilise ce formulaire seulement si le problème persiste. LeanWorker tente déjà de détecter certains incidents automatiquement."
                    : "Use this form only if the issue persists. LeanWorker already tries to detect some incidents automatically."}
                </div>

                <textarea
                  className="input"
                  value={supportMessage}
                  onChange={(event) => setSupportMessage(event.target.value)}
                  placeholder={supportPlaceholder}
                  rows={5}
                  style={{ width: "100%", resize: "vertical" }}
                />

                <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
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

          <div className="card stack">
            <div className="row" style={{ alignItems: "center", gap: 8 }}>
              <SparkIcon />
              <div className="section-title">
                {uiLanguage === "fr" ? "Résultat disponible" : "Available result"}
              </div>
            </div>

            <div className="muted">
              {artifact.format === "ebook"
                ? uiLanguage === "fr"
                  ? "Cet achat correspond à un mini e-book uniquement."
                  : "This purchase corresponds to a mini e-book only."
                : uiLanguage === "fr"
                  ? "Cet achat correspond à un mini audiobook uniquement."
                  : "This purchase corresponds to a mini audiobook only."}
            </div>

            {artifact.status !== "completed" ? (
              <div className="card-soft">
                {artifact.status === "pending_payment"
                  ? uiLanguage === "fr"
                    ? "Le paiement n’est pas encore confirmé pour ce guide."
                    : "Payment has not been confirmed for this guide yet."
                  : artifact.status === "paid"
                    ? uiLanguage === "fr"
                      ? "Le paiement est confirmé. La génération peut démarrer."
                      : "Payment is confirmed. Generation can start."
                    : artifact.status === "generating"
                      ? uiLanguage === "fr"
                        ? "La génération est en cours. Actualise cette page dans quelques secondes."
                        : "Generation is in progress. Refresh this page in a few seconds."
                      : artifact.status === "failed"
                        ? uiLanguage === "fr"
                          ? "La génération a échoué. Tu peux signaler le problème via le support."
                          : "Generation failed. You can report the issue via support."
                        : uiLanguage === "fr"
                          ? "Le guide n’est pas encore disponible."
                          : "The guide is not available yet."}
              </div>
            ) : null}

            {artifact.status === "completed" && artifact.format === "audiobook" && canPlayAudio ? (
              <PremiumAudioPlayer
                src={resolvedAudioUrl!}
                uiLanguage={uiLanguage}
                storageKey={`audio-progress-${artifact.id}`}
              />
            ) : null}

            {artifact.status === "completed" &&
            artifact.format === "ebook" &&
            artifact.content_markdown ? (
              <PremiumEbookReader
                outlineSections={outlineSections}
                contentMarkdown={artifact.content_markdown}
                uiLanguage={uiLanguage}
                storageKey={`ebook-reader-${artifact.id}`}
              />
            ) : null}

            {artifact.status === "completed" &&
              artifact.format === "ebook" &&
              !artifact.content_markdown && (
                <div className="muted">
                  {uiLanguage === "fr"
                    ? "Le mini e-book est prêt, mais son contenu détaillé n’est pas encore affichable ici."
                    : "The mini e-book is ready, but its detailed content is not yet displayable here."}
                </div>
              )}

            {artifact.status === "completed" &&
              artifact.format === "audiobook" &&
              !canPlayAudio && (
                <div className="muted">
                  {uiLanguage === "fr"
                    ? "Le mini audiobook est prêt, mais le fichier audio n’est pas encore lisible ici."
                    : "The mini audiobook is ready, but the audio file is not yet playable here."}
                </div>
              )}
          </div>

          {artifact.format === "audiobook" && artifact.audio_script_text ? (
            <div className="card stack">
              <div className="row space-between" style={{ alignItems: "center", gap: 12 }}>
                <div className="section-title">
                  {uiLanguage === "fr" ? "Script audio" : "Audio script"}
                </div>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setShowAudioScript((value) => !value)}
                >
                  {showAudioScript
                    ? uiLanguage === "fr"
                      ? "Masquer le script"
                      : "Hide script"
                    : uiLanguage === "fr"
                      ? "Voir le script"
                      : "Show script"}
                </button>
              </div>

              {showAudioScript ? (
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                  {artifact.audio_script_text}
                </div>
              ) : (
                <div className="muted">
                  {uiLanguage === "fr"
                    ? "Le script est masqué par défaut. Tu peux l’ouvrir si besoin."
                    : "The script is hidden by default. You can open it if needed."}
                </div>
              )}
            </div>
          ) : null}
        </>
      )}
    </AppShell>
  );
}