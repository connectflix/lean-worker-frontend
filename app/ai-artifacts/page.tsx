"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { getMyAIArtifacts } from "@/lib/api";
import { getUiCopy } from "@/lib/ui-copy";
import { useUiLanguage } from "@/lib/use-ui-language";
import type { AIArtifactStatusResponse } from "@/lib/types";
import {
  ArrowRightIcon,
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  LayerIcon,
  SparkIcon,
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

function ArtifactMetricCard({
  label,
  value,
  helper,
  tone = "warm",
}: {
  label: string;
  value: string | number;
  helper: string;
  tone?: "warm" | "calm" | "neutral";
}) {
  const iconStyle =
    tone === "calm"
      ? {
          background: "rgba(88,180,174,0.12)",
          border: "1px solid rgba(88,180,174,0.20)",
          color: "var(--coach-calm)",
        }
      : tone === "neutral"
        ? {
            background: "rgba(43,33,24,0.05)",
            border: "1px solid rgba(43,33,24,0.08)",
            color: "var(--coach-muted)",
          }
        : {
            background: "rgba(255,122,89,0.12)",
            border: "1px solid rgba(255,122,89,0.20)",
            color: "var(--coach-accent)",
          };

  return (
    <div
      className="card-soft stack"
      style={{
        gap: 10,
        borderRadius: 24,
        background: "rgba(255,255,255,0.68)",
        border: "1px solid rgba(43,33,24,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          ...iconStyle,
        }}
      >
        <LayerIcon size={18} />
      </div>

      <div className="stack" style={{ gap: 4 }}>
        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            fontSize: 13,
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 30,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.055em",
            color: "var(--coach-ink)",
          }}
        >
          {value}
        </div>

        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          {helper}
        </div>
      </div>
    </div>
  );
}

function ArtifactCard({
  item,
  uiLanguage,
  onOpen,
}: {
  item: AIArtifactStatusResponse;
  uiLanguage: "fr" | "en";
  onOpen: () => void;
}) {
  const isCompleted = item.status === "completed";
  const statusTone = getStatusTone(item.status);

  return (
    <div
      className="card stack"
      style={{
        gap: 16,
        borderRadius: 28,
        border: "1px solid rgba(43,33,24,0.08)",
        background: isCompleted
          ? "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(232,248,246,0.72))"
          : "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(255,248,239,0.72))",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
      }}
    >
      <div className="row space-between" style={{ gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            background: isCompleted
              ? "rgba(88,180,174,0.12)"
              : "rgba(255,122,89,0.12)",
            border: isCompleted
              ? "1px solid rgba(88,180,174,0.20)"
              : "1px solid rgba(255,122,89,0.20)",
            color: isCompleted ? "var(--coach-calm)" : "var(--coach-accent)",
            flexShrink: 0,
          }}
        >
          <LayerIcon size={20} />
        </div>

        <span
          className="badge"
          style={{
            ...statusTone,
            fontWeight: 850,
          }}
        >
          {getStatusIcon(item.status)}
          {formatArtifactStatus(item.status, uiLanguage)}
        </span>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <div
          style={{
            fontSize: 21,
            lineHeight: 1.16,
            fontWeight: 900,
            letterSpacing: "-0.045em",
            color: "var(--coach-ink)",
          }}
        >
          {item.title}
        </div>

        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            lineHeight: 1.6,
          }}
        >
          {isCompleted
            ? uiLanguage === "fr"
              ? "Ton guide est prêt. Tu peux l’ouvrir et l’utiliser comme support concret de passage à l’action."
              : "Your guide is ready. You can open it and use it as practical support for action."
            : uiLanguage === "fr"
              ? "Ce guide est en attente de finalisation ou de génération."
              : "This guide is waiting for finalization or generation."}
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <BadgePill icon={<LayerIcon size={14} />}>
          {formatArtifactType(item.format, uiLanguage)}
        </BadgePill>

        <BadgePill icon={<SparkIcon size={14} />}>
          {formatPrice(item.price_eur)}
        </BadgePill>
      </div>

      <div
        className="card-soft"
        style={{
          borderRadius: 22,
          background: "rgba(255,248,239,0.68)",
          border: "1px solid rgba(43,33,24,0.08)",
        }}
      >
        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            lineHeight: 1.55,
          }}
        >
          {uiLanguage === "fr"
            ? "Créé à partir d’une recommandation pour transformer une intention en prochaines étapes plus concrètes."
            : "Created from a recommendation to turn an intention into more concrete next steps."}
        </div>
      </div>

      <button
        className={isCompleted ? "button" : "button ghost"}
        onClick={onOpen}
        type="button"
        style={{
          width: "100%",
          minHeight: 46,
          background: isCompleted ? "var(--coach-accent)" : undefined,
        }}
      >
        <span className="row center" style={{ gap: 8 }}>
          <ArrowRightIcon size={14} />
          {isCompleted
            ? uiLanguage === "fr"
              ? "Ouvrir le guide"
              : "Open guide"
            : uiLanguage === "fr"
              ? "Voir le statut"
              : "View status"}
        </span>
      </button>
    </div>
  );
}

export default function AIArtifactsPage() {
  return (
    <AuthGuard>
      <AIArtifactsContent />
    </AuthGuard>
  );
}

function AIArtifactsContent() {
  const router = useRouter();
  const { uiLanguage, loadingLanguage } = useUiLanguage("en");
  const copy = getUiCopy(uiLanguage);

  const [items, setItems] = useState<AIArtifactStatusResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArtifacts = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setRefreshing(true);
        else setLoading(true);

        setError(null);

        const artifacts = await getMyAIArtifacts();
        setItems(artifacts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : uiLanguage === "fr"
              ? "Impossible de charger les guides IA."
              : "Unable to load AI guides.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [uiLanguage],
  );

  useEffect(() => {
    void loadArtifacts();
  }, [loadArtifacts]);

  const completedCount = useMemo(() => {
    return items.filter((item) => item.status === "completed").length;
  }, [items]);

  const generatingCount = useMemo(() => {
    return items.filter((item) => item.status === "generating" || item.status === "paid").length;
  }, [items]);

  const audiobookCount = useMemo(() => {
    return items.filter((item) => item.format === "audiobook").length;
  }, [items]);

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
      title={uiLanguage === "fr" ? "Mes guides IA" : "My AI Guides"}
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
              maxWidth: 920,
            }}
          >
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <span
                className="badge"
                style={{
                  background: "rgba(255,122,89,0.12)",
                  borderColor: "rgba(255,122,89,0.20)",
                  color: "var(--coach-accent)",
                  fontWeight: 850,
                }}
              >
                {uiLanguage === "fr" ? "Bibliothèque personnelle" : "Personal library"}
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
                {uiLanguage === "fr" ? "Guides actionnables" : "Actionable guides"}
              </span>
            </div>

            <div
              style={{
                fontSize: 44,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Tes guides IA pour passer de l’intention à l’action."
                : "Your AI guides to move from intention to action."}
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
                ? "Retrouve tes mini e-books et mini audiobooks générés à partir de tes recommandations. Chaque guide t’aide à clarifier quoi faire, dans quel ordre, et pourquoi cela compte pour ta trajectoire."
                : "Find your mini e-books and mini audiobooks generated from your recommendations. Each guide helps clarify what to do, in what order, and why it matters for your trajectory."}
            </p>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button
                className="button"
                onClick={() => router.push("/recommendations")}
                type="button"
                style={{
                  background: "var(--coach-accent)",
                  minHeight: 46,
                  paddingInline: 20,
                }}
              >
                {uiLanguage === "fr" ? "Explorer les recommandations" : "Explore recommendations"}
              </button>

              <button
                className="button ghost"
                onClick={() => void loadArtifacts(true)}
                disabled={loading || refreshing}
                type="button"
              >
                <span className="row center" style={{ gap: 8 }}>
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
            </div>
          </div>
        </div>

        <div className="grid grid-4">
          <ArtifactMetricCard
            label={uiLanguage === "fr" ? "Guides total" : "Total guides"}
            value={items.length}
            helper={
              uiLanguage === "fr"
                ? "Tous les guides associés à tes recommandations."
                : "All guides linked to your recommendations."
            }
            tone="warm"
          />

          <ArtifactMetricCard
            label={uiLanguage === "fr" ? "Prêts" : "Ready"}
            value={completedCount}
            helper={
              uiLanguage === "fr"
                ? "Guides disponibles à la lecture ou à l’écoute."
                : "Guides available to read or listen to."
            }
            tone="calm"
          />

          <ArtifactMetricCard
            label={uiLanguage === "fr" ? "En cours" : "In progress"}
            value={generatingCount}
            helper={
              uiLanguage === "fr"
                ? "Guides payés ou en génération."
                : "Paid or currently generating guides."
            }
            tone="neutral"
          />

          <ArtifactMetricCard
            label={uiLanguage === "fr" ? "Formats audio" : "Audio formats"}
            value={audiobookCount}
            helper={
              uiLanguage === "fr"
                ? "Guides disponibles ou demandés en audio."
                : "Guides available or requested as audio."
            }
            tone="calm"
          />
        </div>

        {loading ? (
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
              {uiLanguage === "fr" ? "Chargement de ta bibliothèque..." : "Loading your library..."}
            </div>
            <div className="muted" style={{ color: "var(--coach-muted)" }}>
              {uiLanguage === "fr"
                ? "Nous préparons tes guides IA."
                : "We are preparing your AI guides."}
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
              {uiLanguage === "fr" ? "Erreur de chargement" : "Loading error"}
            </div>

            <div className="muted">{error}</div>

            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <button
                className="button"
                onClick={() => void loadArtifacts()}
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
                {uiLanguage === "fr" ? "Voir recommandations" : "View recommendations"}
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div
            className="card stack"
            style={{
              gap: 18,
              borderRadius: 28,
              border: "1px solid rgba(43,33,24,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,248,239,0.78))",
              boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
            }}
          >
            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,122,89,0.12)",
                  border: "1px solid rgba(255,122,89,0.20)",
                  color: "var(--coach-accent)",
                }}
              >
                <LayerIcon size={20} />
              </div>

              <div className="section-title">
                {uiLanguage === "fr" ? "Aucun guide pour le moment" : "No guides yet"}
              </div>
            </div>

            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                maxWidth: 720,
                lineHeight: 1.7,
              }}
            >
              {uiLanguage === "fr"
                ? "Tes guides IA apparaîtront ici après l’achat depuis une recommandation. Commence par ouvrir une recommandation active et choisis le guide qui t’aide le mieux à passer à l’action."
                : "Your AI guides will appear here after purchase from a recommendation. Start by opening an active recommendation and choose the guide that best helps you move into action."}
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button
                className="button"
                onClick={() => router.push("/recommendations")}
                type="button"
                style={{ background: "var(--coach-accent)" }}
              >
                {uiLanguage === "fr" ? "Explorer les recommandations" : "Explore recommendations"}
              </button>

              <button
                className="button ghost"
                onClick={() => router.push("/dashboard")}
                type="button"
              >
                {uiLanguage === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-3">
            {items.map((item) => (
              <ArtifactCard
                key={item.id}
                item={item}
                uiLanguage={uiLanguage}
                onOpen={() => router.push(`/ai-artifacts/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}