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
    return uiLanguage === "fr" ? "Mini livre audio" : "Mini audiobook";
  }

  return uiLanguage === "fr" ? "Mini guide numérique" : "Mini e-book";
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

function formatPrice(price: number, uiLanguage: "fr" | "en"): string {
  try {
    return new Intl.NumberFormat(uiLanguage === "fr" ? "fr-BE" : "en-BE", {
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
        borderRadius: 20,
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
        borderRadius: 24,
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
              ? "Ton guide est prêt à être consulté."
              : "Your guide is ready to open."
            : uiLanguage === "fr"
              ? "Ce guide est en cours de préparation."
              : "This guide is being prepared."}
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <BadgePill icon={<LayerIcon size={14} />}>
          {formatArtifactType(item.format, uiLanguage)}
        </BadgePill>

        <BadgePill icon={<SparkIcon size={14} />}>
          {formatPrice(item.price_eur, uiLanguage)}
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
            ? "Créé à partir d’une recommandation pour t’aider à passer à l’action."
            : "Created from a recommendation to help you move into action."}
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
              ? "Ouvrir"
              : "Open"
            : uiLanguage === "fr"
              ? "Voir l’état"
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
  const { uiLanguage, loadingLanguage } = useUiLanguage("fr");
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
      title={uiLanguage === "fr" ? "Guides IA" : "AI Guides"}
    >
      <div className="stack" style={{ gap: 16 }}>
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
                {uiLanguage === "fr" ? "Supports personnalisés" : "Personalized resources"}
              </span>
            </div>

            <div
              style={{
                fontSize: "clamp(34px, 5vw, 44px)",
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Retrouve tes guides personnalisés."
                : "Access your personalized guides."}
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
                ? "Consulte les guides numériques et audio créés à partir de tes recommandations."
                : "Review the digital and audio guides created from your recommendations."}
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
                {uiLanguage === "fr" ? "Voir les recommandations" : "View recommendations"}
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
            label={uiLanguage === "fr" ? "Tous les guides" : "All guides"}
            value={items.length}
            helper={
              uiLanguage === "fr"
                ? "Ensemble de tes guides personnalisés."
                : "All your personalized guides."
            }
            tone="warm"
          />

          <ArtifactMetricCard
            label={uiLanguage === "fr" ? "Prêts" : "Ready"}
            value={completedCount}
            helper={
              uiLanguage === "fr"
                ? "Guides disponibles dès maintenant."
                : "Guides available now."
            }
            tone="calm"
          />

          <ArtifactMetricCard
            label={uiLanguage === "fr" ? "En cours" : "In progress"}
            value={generatingCount}
            helper={
              uiLanguage === "fr"
                ? "Guides en cours de préparation."
                : "Guides currently being prepared."
            }
            tone="neutral"
          />

          <ArtifactMetricCard
            label={uiLanguage === "fr" ? "Guides audio" : "Audio guides"}
            value={audiobookCount}
            helper={
              uiLanguage === "fr"
                ? "Guides disponibles au format audio."
                : "Guides available in audio format."
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
              {uiLanguage === "fr" ? "Chargement des guides..." : "Loading guides..."}
            </div>
            <div className="muted" style={{ color: "var(--coach-muted)" }}>
              {uiLanguage === "fr"
                ? "Nous récupérons tes guides personnalisés."
                : "We are retrieving your personalized guides."}
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
              {uiLanguage === "fr" ? "Impossible de charger les guides" : "Unable to load guides"}
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
                {uiLanguage === "fr" ? "Voir les recommandations" : "View recommendations"}
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
                {uiLanguage === "fr" ? "Aucun guide disponible" : "No guides available"}
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
                ? "Tes guides apparaîtront ici après leur création depuis une recommandation."
                : "Your guides will appear here after they are created from a recommendation."}
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