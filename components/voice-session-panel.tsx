"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { closeSession, getSessionDetail, synthesizeSpeech, voiceTurn } from "@/lib/api";
import { getUiCopy } from "@/lib/ui-copy";
import type { SessionCloseResponse } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  BadgePill,
  BrainIcon,
  ClockIcon,
  SessionIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type VoiceStage =
  | "idle"
  | "loading"
  | "listening"
  | "user_speaking"
  | "processing"
  | "agent_speaking"
  | "error";

const SILENCE_DURATION_MS = 1500;
const MIN_SPEECH_MS = 400;
const MAX_SEGMENT_MS = 12000;
const SPEECH_THRESHOLD = 8;
const AUDIO_END_FALLBACK_MS = 12000;
const AUDIO_END_PADDING_MS = 1200;

function FlatMicIcon({
  size = 44,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="3" width="8" height="12" rx="4" stroke={color} strokeWidth="1.8" />
      <path
        d="M6 11.5C6 15.1 8.7 18 12 18C15.3 18 18 15.1 18 11.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M12 18V21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 21H15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FlatVoiceWaveIcon({
  size = 44,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 14V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 17V7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 15V9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 18V6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 14V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FlatBrainPulseIcon({
  size = 44,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.2 5.2C8 4 6 4.1 4.9 5.4C3.8 6.6 4 8.6 5.2 9.7C4 10.7 3.7 12.5 4.5 13.9C5.2 15.3 6.8 16 8.3 15.7C8.2 17.4 9.4 19 11.1 19.3C12.8 19.6 14.4 18.6 15 17.1C16.3 18.1 18.3 18 19.4 16.8C20.6 15.5 20.4 13.5 19.1 12.4C20.4 11.4 20.7 9.5 19.9 8.1C19.2 6.7 17.5 6 16 6.4C16.1 4.7 14.9 3.1 13.2 2.8C11.5 2.5 9.9 3.5 9.2 5.2Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 8.3C10.8 9 11.3 10 11.3 11.1V19"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 7.8C13.2 8.5 12.7 9.5 12.7 10.6V19"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FlatAlertIcon({
  size = 44,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4L20 18H4L12 4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9V13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1" fill={color} />
    </svg>
  );
}

function getCoachIntentLabel(
  intent: string | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (!intent) return null;

  const labels =
    uiLanguage === "fr"
      ? {
          clarify: "Clarification de la situation",
          reframe: "Reformulation de la perspective",
          prioritize: "Priorisation du prochain mouvement",
          sequence: "Structuration des prochaines étapes",
          encourage: "Renforcement de l’élan",
          challenge_softly: "Exploration d’une tension",
        }
      : {
          clarify: "Clarifying your situation",
          reframe: "Reframing perspective",
          prioritize: "Prioritizing next move",
          sequence: "Structuring next steps",
          encourage: "Reinforcing momentum",
          challenge_softly: "Exploring a tension",
        };

  return labels[intent as keyof typeof labels] ?? null;
}

function getCoachModeLabel(
  mode: string | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (!mode) return null;

  const labels =
    uiLanguage === "fr"
      ? {
          coach_opening: "Ouverture",
          coach_exploration: "Exploration",
          coach_reflection: "Réflexion",
          coach_trajectory: "Trajectoire",
          coach_actionable: "Action",
          coach_regulation: "Stabilisation",
        }
      : {
          coach_opening: "Opening",
          coach_exploration: "Exploration",
          coach_reflection: "Reflection",
          coach_trajectory: "Trajectory",
          coach_actionable: "Action",
          coach_regulation: "Stabilization",
        };

  return labels[mode as keyof typeof labels] ?? null;
}

function getCoachStyleLabel(
  mode: string | undefined,
  intent: string | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  const key = `${mode || ""}:${intent || ""}`;

  const labels =
    uiLanguage === "fr"
      ? {
          "coach_opening:encourage": "Accueillant et chaleureux",
          "coach_exploration:clarify": "Curieux et clarifiant",
          "coach_reflection:encourage": "Empathique et soutenant",
          "coach_reflection:sequence": "Réflexif et structurant",
          "coach_trajectory:reframe": "Stratégique et recadrant",
          "coach_trajectory:sequence": "Stratégique et organisé",
          "coach_actionable:prioritize": "Direct et orienté action",
          "coach_regulation:sequence": "Calme et contenant",
          default: "Adaptatif et contextuel",
        }
      : {
          "coach_opening:encourage": "Warm and welcoming",
          "coach_exploration:clarify": "Curious and clarifying",
          "coach_reflection:encourage": "Empathic and supportive",
          "coach_reflection:sequence": "Reflective and structuring",
          "coach_trajectory:reframe": "Strategic and reframing",
          "coach_trajectory:sequence": "Strategic and organized",
          "coach_actionable:prioritize": "Direct and action-oriented",
          "coach_regulation:sequence": "Calm and containing",
          default: "Adaptive and contextual",
        };

  return labels[key as keyof typeof labels] ?? labels.default;
}

function getAverageVolume(analyser: AnalyserNode): number {
  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);

  let sum = 0;
  let peak = 0;

  for (let i = 0; i < data.length; i += 1) {
    const delta = Math.abs(data[i] - 128);
    sum += delta;
    if (delta > peak) peak = delta;
  }

  const average = sum / data.length;
  return average * 0.7 + peak * 0.3;
}

function getSupportedAudioMimeType(): string {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }

  return "";
}

export function VoiceSessionPanel({
  sessionId,
  onClosed,
  uiLanguage = "en",
  onCoachStateChange,
}: {
  sessionId: number;
  onClosed: (result: SessionCloseResponse) => void;
  uiLanguage?: SupportedUiLanguage;
  onCoachStateChange?: (state: { coachMode?: string; coachIntent?: string }) => void;
}) {
  const copy = getUiCopy(uiLanguage);

  const [closing, setClosing] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [stage, setStage] = useState<VoiceStage>("loading");
  const [error, setError] = useState<string | null>(null);
  const [coachMode, setCoachMode] = useState<string | undefined>(undefined);
  const [coachIntent, setCoachIntent] = useState<string | undefined>(undefined);
  const [micLevel, setMicLevel] = useState(0);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const speechStartedAtRef = useRef<number | null>(null);
  const silenceStartedAtRef = useRef<number | null>(null);
  const currentSegmentActiveRef = useRef(false);

  const isProcessingRef = useRef(false);
  const isAgentSpeakingRef = useRef(false);
  const voiceEnabledRef = useRef(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const playbackTokenRef = useRef(0);
  const audioFallbackTimeoutRef = useRef<number | null>(null);

  const earconContextRef = useRef<AudioContext | null>(null);
  const lastEarconRef = useRef<string>("");

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    async function loadSessionVoiceSpace() {
      try {
        const detail = await getSessionDetail(sessionId);
        const latestAgentTurn = [...(detail.transcript || [])]
          .reverse()
          .find(
            (turn) =>
              turn.speaker === "agent" &&
              ((turn as any).coach_mode || (turn as any).coach_intent),
          );

        if (latestAgentTurn) {
          const nextMode = (latestAgentTurn as any).coach_mode;
          const nextIntent = (latestAgentTurn as any).coach_intent;
          setCoachMode(nextMode);
          setCoachIntent(nextIntent);

          if (onCoachStateChange) {
            onCoachStateChange({
              coachMode: nextMode,
              coachIntent: nextIntent,
            });
          }
        }
      } catch {
        // ignore bootstrap detail errors
      } finally {
        setBootstrapping(false);
        setStage("idle");
      }
    }

    void loadSessionVoiceSpace();

    return () => {
      cleanupAllResources();
      if (earconContextRef.current) {
        void earconContextRef.current.close();
        earconContextRef.current = null;
      }
    };
  }, [sessionId, onCoachStateChange]);

  useEffect(() => {
    const key = `${stage}:${voiceEnabled ? "on" : "off"}`;
    if (lastEarconRef.current === key) return;
    lastEarconRef.current = key;

    if (!voiceEnabled) return;

    if (stage === "listening") {
      void playEarcon("listen");
    } else if (stage === "processing") {
      void playEarcon("handoff");
    } else if (stage === "agent_speaking") {
      void playEarcon("coach");
    }
  }, [stage, voiceEnabled]);

  const labels = useMemo(() => {
    return {
      sessionLive: uiLanguage === "fr" ? "Session vocale active" : "Voice session active",
      voiceOnly: uiLanguage === "fr" ? "Voix uniquement" : "Voice only",
      adaptiveCoach: uiLanguage === "fr" ? "Coach adaptatif" : "Adaptive coach",
      activeMemory: uiLanguage === "fr" ? "Mémoire active" : "Active memory",
      coachStyle: uiLanguage === "fr" ? "Style du coach" : "Coach style",
      startVoice:
        uiLanguage === "fr" ? "Démarrer la session vocale" : "Start voice session",
      stopVoice:
        uiLanguage === "fr" ? "Arrêter la session vocale" : "Stop voice session",
      closeSession:
        uiLanguage === "fr" ? "Clôturer la session" : "Close session",
      voiceDescription:
        uiLanguage === "fr"
          ? "L’échange se fait uniquement par la voix. Tu parles naturellement, le système détecte la fin de ton tour, puis le coach répond avec la même voix."
          : "The interaction happens only through voice. You speak naturally, the system detects the end of your turn, then the coach responds with the same voice.",
      loading:
        uiLanguage === "fr"
          ? "Préparation de l’espace vocal..."
          : "Preparing voice workspace...",
      idle:
        uiLanguage === "fr"
          ? "Appuie sur démarrer pour lancer la conversation vocale."
          : "Press start to launch the voice conversation.",
      listening: uiLanguage === "fr" ? "Je t’écoute." : "Listening.",
      userSpeaking:
        uiLanguage === "fr" ? "Tu parles..." : "You are speaking...",
      processing:
        uiLanguage === "fr" ? "Le coach réfléchit..." : "Coach is thinking...",
      agentSpeaking:
        uiLanguage === "fr" ? "Le coach parle..." : "Coach is speaking...",
      error: uiLanguage === "fr" ? "Erreur vocale" : "Voice error",
      immersiveNote:
        uiLanguage === "fr"
          ? "Le transcript visuel est masqué pour garder une expérience plus immersive et sonore."
          : "Visual transcript is hidden to preserve a more immersive audio-first experience.",
      accessibilityHint:
        uiLanguage === "fr"
          ? "Tu peux simplement parler et t’arrêter naturellement. Aucun bouton n’est nécessaire pour passer la main."
          : "You can simply speak and stop naturally. No handoff button is needed.",
      currentVoiceTitle:
        uiLanguage === "fr" ? "Voix du coach" : "Coach voice",
      currentVoiceText:
        uiLanguage === "fr"
          ? "Stable pendant toute la session."
          : "Stable throughout the whole session.",
      soundPresence:
        uiLanguage === "fr" ? "Présence vocale" : "Voice presence",
      soundPresenceText:
        uiLanguage === "fr"
          ? "Conversation audio immersive."
          : "Immersive audio conversation.",
      audioMeter: uiLanguage === "fr" ? "Niveau micro" : "Mic level",
    };
  }, [uiLanguage]);

  const currentCoachStyle = getCoachStyleLabel(coachMode, coachIntent, uiLanguage);
  const currentCoachIntent = getCoachIntentLabel(coachIntent, uiLanguage);
  const currentCoachMode = getCoachModeLabel(coachMode, uiLanguage);

  async function ensureEarconContext(): Promise<AudioContext> {
    let ctx = earconContextRef.current;

    if (!ctx || ctx.state === "closed") {
      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextCtor) {
        throw new Error("Web Audio API is not supported in this browser.");
      }

      ctx = new AudioContextCtor();
      earconContextRef.current = ctx;
    }

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    return ctx;
  }

  async function playEarcon(kind: "listen" | "handoff" | "coach") {
    try {
      const ctx = await ensureEarconContext();
      const now = ctx.currentTime;

      const buildTone = (
        frequency: number,
        start: number,
        duration: number,
        gainValue: number,
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration + 0.02);
      };

      if (kind === "listen") {
        buildTone(740, now, 0.08, 0.02);
        buildTone(980, now + 0.09, 0.08, 0.018);
      } else if (kind === "handoff") {
        buildTone(620, now, 0.07, 0.02);
      } else if (kind === "coach") {
        buildTone(520, now, 0.06, 0.018);
        buildTone(690, now + 0.08, 0.07, 0.018);
      }
    } catch {
      // silent fallback
    }
  }

  function clearAudioFallbackTimeout() {
    if (audioFallbackTimeoutRef.current !== null) {
      window.clearTimeout(audioFallbackTimeoutRef.current);
      audioFallbackTimeoutRef.current = null;
    }
  }

  function revokeAudioUrl() {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }

  function stopAgentAudioPlayback() {
    playbackTokenRef.current += 1;
    clearAudioFallbackTimeout();

    if (audioElementRef.current) {
      audioElementRef.current.onended = null;
      audioElementRef.current.onerror = null;
      audioElementRef.current.onloadedmetadata = null;
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }

    revokeAudioUrl();
    isAgentSpeakingRef.current = false;
  }

  function stopRecorderIfNeeded() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
  }

  function stopMonitoring() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function cleanupAllResources() {
    stopMonitoring();
    stopRecorderIfNeeded();
    stopAgentAudioPlayback();
    setMicLevel(0);

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    analyserRef.current = null;
    chunksRef.current = [];
    speechStartedAtRef.current = null;
    silenceStartedAtRef.current = null;
    currentSegmentActiveRef.current = false;
    isProcessingRef.current = false;
    isAgentSpeakingRef.current = false;
  }

  function resetSpeechTracking() {
    speechStartedAtRef.current = null;
    silenceStartedAtRef.current = null;
    currentSegmentActiveRef.current = false;
  }

  async function ensureAudioInfrastructure() {
    if (!mediaStreamRef.current) {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    }

    let audioContext = audioContextRef.current;

    if (!audioContext || audioContext.state === "closed") {
      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextCtor) {
        throw new Error("Web Audio API is not supported in this browser.");
      }

      audioContext = new AudioContextCtor();
      audioContextRef.current = audioContext;
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (!analyserRef.current) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    sourceNodeRef.current = audioContext.createMediaStreamSource(mediaStreamRef.current);
    sourceNodeRef.current.connect(analyserRef.current);
  }

  function startSegmentRecorder() {
    if (!mediaStreamRef.current) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") return;

    const mimeType = getSupportedAudioMimeType();
    const recorder = mimeType
      ? new MediaRecorder(mediaStreamRef.current, { mimeType })
      : new MediaRecorder(mediaStreamRef.current);

    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onerror = () => {
      setError(
        uiLanguage === "fr"
          ? "Échec de l’enregistrement vocal."
          : "Voice recording failed.",
      );
      setStage("error");
    };

    recorder.start(250);
    mediaRecorderRef.current = recorder;
  }

  function armAudioFallbackTimeout(playbackToken: number, durationMs?: number) {
    clearAudioFallbackTimeout();

    const fallbackDelay =
      durationMs && Number.isFinite(durationMs) && durationMs > 0
        ? Math.max(durationMs + AUDIO_END_PADDING_MS, 2500)
        : AUDIO_END_FALLBACK_MS;

    audioFallbackTimeoutRef.current = window.setTimeout(async () => {
      if (playbackTokenRef.current !== playbackToken) return;
      if (!isAgentSpeakingRef.current) return;

      stopAgentAudioPlayback();

      if (voiceEnabledRef.current) {
        await returnToListening();
      } else {
        setStage("idle");
      }
    }, fallbackDelay);
  }

  async function returnToListening() {
    if (!voiceEnabledRef.current) {
      setStage("idle");
      setMicLevel(0);
      return;
    }

    await ensureAudioInfrastructure();
    resetSpeechTracking();
    chunksRef.current = [];
    setStage("listening");
    ensureMonitoringRunning();
  }

  async function playAgentAudioBlob(blob: Blob) {
    stopAgentAudioPlayback();

    const token = playbackTokenRef.current + 1;
    playbackTokenRef.current = token;

    const objectUrl = URL.createObjectURL(blob);
    audioUrlRef.current = objectUrl;

    const audio = new Audio(objectUrl);
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audioElementRef.current = audio;

    isAgentSpeakingRef.current = true;
    setStage("agent_speaking");
    setMicLevel(0);

    audio.onloadedmetadata = () => {
      const durationMs =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? Math.ceil(audio.duration * 1000)
          : undefined;

      armAudioFallbackTimeout(token, durationMs);
    };

    audio.onended = async () => {
      if (playbackTokenRef.current !== token) return;

      stopAgentAudioPlayback();

      if (voiceEnabledRef.current) {
        await returnToListening();
      } else {
        setStage("idle");
      }
    };

    audio.onerror = async () => {
      if (playbackTokenRef.current !== token) return;

      stopAgentAudioPlayback();

      if (voiceEnabledRef.current) {
        await returnToListening();
      } else {
        setStage("idle");
      }
    };

    try {
      await audio.play();

      if (!(Number.isFinite(audio.duration) && audio.duration > 0)) {
        armAudioFallbackTimeout(token);
      }
    } catch (err) {
      stopAgentAudioPlayback();

      if (voiceEnabledRef.current) {
        await returnToListening();
      } else {
        setStage("idle");
      }

      throw err;
    }
  }

  async function processRecordedAudio(audioBlob: Blob) {
    isProcessingRef.current = true;
    setStage("processing");
    setError(null);
    setMicLevel(0);

    try {
      const result = await voiceTurn(audioBlob);
      const nextMode = (result as any).coach_mode;
      const nextIntent = (result as any).coach_intent;

      setCoachMode(nextMode);
      setCoachIntent(nextIntent);

      if (onCoachStateChange) {
        onCoachStateChange({ coachMode: nextMode, coachIntent: nextIntent });
      }

      const coachAudio = await synthesizeSpeech(result.agent_message);

      isProcessingRef.current = false;
      await playAgentAudioBlob(coachAudio);
    } catch (err) {
      isProcessingRef.current = false;
      setError(err instanceof Error ? err.message : "Voice processing failed.");
      setStage("error");
    }
  }

  function finalizeCurrentSegment() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    recorder.onstop = async () => {
      mediaRecorderRef.current = null;

      const chunks = [...chunksRef.current];
      chunksRef.current = [];
      setMicLevel(0);

      if (!chunks.length) {
        if (voiceEnabledRef.current) {
          await returnToListening();
        }
        return;
      }

      const mimeType = recorder.mimeType || getSupportedAudioMimeType() || "audio/webm";
      const audioBlob = new Blob(chunks, { type: mimeType });

      if (audioBlob.size < 1500) {
        if (voiceEnabledRef.current) {
          await returnToListening();
        }
        return;
      }

      await processRecordedAudio(audioBlob);
    };

    recorder.stop();
  }

  function ensureMonitoringRunning() {
    if (!voiceEnabledRef.current) return;
    if (!analyserRef.current) return;
    if (rafRef.current !== null) return;
    monitorVoiceLoop();
  }

  function monitorVoiceLoop() {
    const analyser = analyserRef.current;
    if (!analyser) {
      rafRef.current = null;
      return;
    }

    const step = () => {
      if (!voiceEnabledRef.current || !analyserRef.current) {
        rafRef.current = null;
        setMicLevel(0);
        return;
      }

      if (!isProcessingRef.current && !isAgentSpeakingRef.current) {
        const now = Date.now();
        const volume = getAverageVolume(analyserRef.current);
        const normalizedLevel = Math.max(0, Math.min(1, volume / 36));
        setMicLevel((prev) => prev * 0.72 + normalizedLevel * 0.28);

        const isAboveThreshold = volume >= SPEECH_THRESHOLD;

        if (isAboveThreshold) {
          silenceStartedAtRef.current = null;

          if (!currentSegmentActiveRef.current) {
            currentSegmentActiveRef.current = true;
            speechStartedAtRef.current = now;
            startSegmentRecorder();
          }

          setStage("user_speaking");

          const startedAt = speechStartedAtRef.current ?? now;
          if (now - startedAt >= MAX_SEGMENT_MS) {
            resetSpeechTracking();
            finalizeCurrentSegment();
          }
        } else {
          if (currentSegmentActiveRef.current) {
            if (!silenceStartedAtRef.current) {
              silenceStartedAtRef.current = now;
            }

            const startedAt = speechStartedAtRef.current ?? now;
            const speechDuration = now - startedAt;
            const silenceDuration = now - silenceStartedAtRef.current;

            if (silenceDuration >= SILENCE_DURATION_MS) {
              if (speechDuration >= MIN_SPEECH_MS) {
                resetSpeechTracking();
                finalizeCurrentSegment();
              } else {
                stopRecorderIfNeeded();
                chunksRef.current = [];
                resetSpeechTracking();
                setStage("listening");
                setMicLevel(0);
              }
            }
          } else {
            setStage("listening");
          }
        }
      } else {
        setMicLevel(0);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }

  async function startVoiceSession() {
    if (bootstrapping || closing || voiceEnabled) return;

    try {
      setError(null);
      setVoiceEnabled(true);
      voiceEnabledRef.current = true;
      await returnToListening();
    } catch (err) {
      setVoiceEnabled(false);
      voiceEnabledRef.current = false;
      setStage("error");
      setError(err instanceof Error ? err.message : "Unable to start voice session.");
    }
  }

  function stopVoiceSession() {
    setVoiceEnabled(false);
    voiceEnabledRef.current = false;
    cleanupAllResources();
    setStage("idle");
  }

  async function handleCloseSession() {
    if (closing || bootstrapping || stage === "processing") return;

    setClosing(true);
    setError(null);

    try {
      const result = await closeSession(sessionId);
      onClosed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setClosing(false);
    }
  }

  function getStageLabel(): string {
    switch (stage) {
      case "loading":
        return labels.loading;
      case "idle":
        return labels.idle;
      case "listening":
        return labels.listening;
      case "user_speaking":
        return labels.userSpeaking;
      case "processing":
        return labels.processing;
      case "agent_speaking":
        return labels.agentSpeaking;
      case "error":
        return labels.error;
      default:
        return labels.idle;
    }
  }

  function getOrbVisuals() {
    switch (stage) {
      case "listening":
        return {
          icon: <FlatMicIcon color="#4f46e5" />,
          bg: "rgba(99,102,241,0.10)",
          border: "rgba(99,102,241,0.35)",
          shadow:
            "0 0 0 12px rgba(99,102,241,0.08), 0 18px 50px rgba(99,102,241,0.12)",
          baseScale: 1.02,
        };
      case "user_speaking":
        return {
          icon: <FlatMicIcon color="#2563eb" />,
          bg: "rgba(59,130,246,0.14)",
          border: "rgba(59,130,246,0.42)",
          shadow:
            "0 0 0 14px rgba(59,130,246,0.10), 0 20px 55px rgba(59,130,246,0.16)",
          baseScale: 1.04,
        };
      case "processing":
        return {
          icon: <FlatBrainPulseIcon color="#d97706" />,
          bg: "rgba(245,158,11,0.12)",
          border: "rgba(245,158,11,0.38)",
          shadow:
            "0 0 0 12px rgba(245,158,11,0.08), 0 18px 50px rgba(245,158,11,0.14)",
          baseScale: 1.03,
        };
      case "agent_speaking":
        return {
          icon: <FlatVoiceWaveIcon color="#059669" />,
          bg: "rgba(16,185,129,0.14)",
          border: "rgba(16,185,129,0.42)",
          shadow:
            "0 0 0 14px rgba(16,185,129,0.10), 0 20px 55px rgba(16,185,129,0.16)",
          baseScale: 1.05,
        };
      case "error":
        return {
          icon: <FlatAlertIcon color="#dc2626" />,
          bg: "rgba(239,68,68,0.10)",
          border: "rgba(239,68,68,0.35)",
          shadow: "0 0 0 10px rgba(239,68,68,0.08)",
          baseScale: 1,
        };
      default:
        return {
          icon: <FlatMicIcon color="#64748b" />,
          bg: "rgba(148,163,184,0.08)",
          border: "rgba(148,163,184,0.28)",
          shadow: "0 10px 30px rgba(15,23,42,0.06)",
          baseScale: 1,
        };
    }
  }

  const orb = getOrbVisuals();
  const userSpeakingBoost = stage === "user_speaking" ? micLevel * 0.18 : 0;
  const listeningBoost = stage === "listening" ? micLevel * 0.08 : 0;
  const orbScale = orb.baseScale + userSpeakingBoost + listeningBoost;

  const meterBars = [0.2, 0.38, 0.56, 0.74, 0.92].map((factor, index) => {
    const activeLevel =
      stage === "user_speaking"
        ? Math.max(0.12, Math.min(1, micLevel * (1 + factor * 0.35)))
        : stage === "listening"
          ? Math.max(0.08, micLevel * factor)
          : stage === "agent_speaking"
            ? 0.42 + (index % 2 === 0 ? 0.12 : 0)
            : 0.12;

    return `${Math.round(18 + activeLevel * 54)}px`;
  });

  return (
    <div className="stack">
      <div className="card stack">
        <div className="row space-between" style={{ alignItems: "flex-start", gap: 16 }}>
          <div className="stack" style={{ gap: 6 }}>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <SessionIcon />
              <div className="section-title">{copy.session.conversation}</div>
            </div>
            <div className="muted">Session #{sessionId}</div>
          </div>

          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <BadgePill icon={<SessionIcon size={14} />}>{labels.sessionLive}</BadgePill>
            <BadgePill icon={<SparkIcon size={14} />}>{labels.voiceOnly}</BadgePill>
            <BadgePill icon={<BrainIcon size={14} />}>{labels.adaptiveCoach}</BadgePill>
            <BadgePill icon={<TargetIcon size={14} />}>{labels.activeMemory}</BadgePill>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card-soft stack" style={{ gap: 8 }}>
            <div className="section-title">{labels.currentVoiceTitle}</div>
            <div className="muted">{labels.currentVoiceText}</div>
          </div>

          <div className="card-soft stack" style={{ gap: 8 }}>
            <div className="section-title">{labels.soundPresence}</div>
            <div className="muted">{labels.soundPresenceText}</div>
          </div>
        </div>

        {currentCoachStyle && (
          <div className="card-soft stack" style={{ gap: 8 }}>
            <div className="row space-between" style={{ flexWrap: "wrap", gap: 10 }}>
              <div className="section-title">{labels.coachStyle}</div>
              <BadgePill icon={<SparkIcon size={14} />}>{currentCoachStyle}</BadgePill>
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              {currentCoachIntent ? (
                <BadgePill icon={<TargetIcon size={14} />}>{currentCoachIntent}</BadgePill>
              ) : null}
              {currentCoachMode ? (
                <BadgePill icon={<BrainIcon size={14} />}>{currentCoachMode}</BadgePill>
              ) : null}
              <BadgePill icon={<ClockIcon size={14} />}>{labels.currentVoiceText}</BadgePill>
            </div>

            <div className="muted">{labels.immersiveNote}</div>
          </div>
        )}
      </div>

      {bootstrapping ? (
        <div className="card">
          <div className="muted">{labels.loading}</div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            minHeight: 560,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))",
          }}
        >
          <div
            className="stack"
            style={{
              gap: 28,
              justifyContent: "center",
              minHeight: 520,
              position: "relative",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 20,
                borderRadius: 32,
                background:
                  stage === "agent_speaking"
                    ? "radial-gradient(circle at center, rgba(16,185,129,0.10), transparent 60%)"
                    : stage === "user_speaking"
                      ? "radial-gradient(circle at center, rgba(59,130,246,0.10), transparent 60%)"
                      : stage === "listening"
                        ? "radial-gradient(circle at center, rgba(99,102,241,0.08), transparent 60%)"
                        : "radial-gradient(circle at center, rgba(148,163,184,0.05), transparent 60%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                width: 184,
                height: 184,
                borderRadius: "999px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${orb.border}`,
                background: orb.bg,
                boxShadow: orb.shadow,
                transform: `scale(${orbScale})`,
                transition:
                  stage === "user_speaking"
                    ? "transform 90ms linear, box-shadow 160ms ease, background 160ms ease"
                    : "all 220ms ease",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: "999px",
                  border:
                    stage === "user_speaking"
                      ? "1px solid rgba(59,130,246,0.20)"
                      : stage === "agent_speaking"
                        ? "1px solid rgba(16,185,129,0.20)"
                        : stage === "listening"
                          ? "1px solid rgba(99,102,241,0.18)"
                          : "1px solid transparent",
                  transform: `scale(${1 + micLevel * 0.12})`,
                  transition: "transform 90ms linear",
                }}
              />
              {orb.icon}
            </div>

            <div
              className="row"
              style={{
                justifyContent: "center",
                alignItems: "flex-end",
                gap: 8,
                height: 78,
                position: "relative",
                zIndex: 1,
              }}
              aria-hidden="true"
            >
              {meterBars.map((height, index) => (
                <div
                  key={index}
                  style={{
                    width: 10,
                    height,
                    borderRadius: 999,
                    background:
                      stage === "agent_speaking"
                        ? "rgba(16,185,129,0.72)"
                        : stage === "user_speaking"
                          ? "rgba(59,130,246,0.78)"
                          : stage === "listening"
                            ? "rgba(99,102,241,0.45)"
                            : "rgba(148,163,184,0.28)",
                    transition: "height 90ms linear, background 180ms ease",
                  }}
                />
              ))}
            </div>

            <div
              className="stack"
              style={{
                gap: 12,
                textAlign: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div className="section-title" style={{ fontSize: 30 }}>
                {getStageLabel()}
              </div>

              <div className="muted" style={{ maxWidth: 760, margin: "0 auto" }}>
                {labels.voiceDescription}
              </div>

              <div className="muted" style={{ maxWidth: 680, margin: "0 auto" }}>
                {labels.accessibilityHint}
              </div>

              <div className="muted" style={{ maxWidth: 420, margin: "0 auto" }}>
                {labels.audioMeter}: {Math.round(micLevel * 100)}%
              </div>
            </div>

            <div
              aria-live="polite"
              aria-atomic="true"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              {getStageLabel()}
            </div>

            <div
              className="row"
              style={{
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
                position: "relative",
                zIndex: 1,
              }}
            >
              {!voiceEnabled ? (
                <button
                  className="button"
                  onClick={startVoiceSession}
                  disabled={bootstrapping || closing}
                  type="button"
                  aria-label={labels.startVoice}
                  style={{ minWidth: 240 }}
                >
                  {labels.startVoice}
                </button>
              ) : (
                <button
                  className="button ghost"
                  onClick={stopVoiceSession}
                  disabled={closing}
                  type="button"
                  aria-label={labels.stopVoice}
                  style={{ minWidth: 240 }}
                >
                  {labels.stopVoice}
                </button>
              )}

              <button
                className="button secondary"
                onClick={handleCloseSession}
                disabled={closing || bootstrapping || stage === "processing"}
                type="button"
                aria-label={labels.closeSession}
                style={{ minWidth: 220 }}
              >
                {closing ? copy.session.closing : labels.closeSession}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card-soft" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}
    </div>
  );
}