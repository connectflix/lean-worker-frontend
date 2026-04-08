"use client";

import { useEffect, useState } from "react";
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
  return `${price}€`;
}

function getStatusIcon(status: string) {
  if (status === "completed") return <CheckCircleIcon size={14} />;
  return <ClockIcon size={14} />;
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

  async function loadArtifacts(showRefreshing = false) {
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
  }

  useEffect(() => {
    void loadArtifacts();
  }, []);

  if (loadingLanguage) {
    return (
      <main className="page">
        <div className="page-wrap center">
          <div className="card">{copy.common.loading}</div>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Mes guides IA" : "My AI Guides"}
    >
      <div className="page-wrap center stack-xl">
        <div className="stack" style={{ textAlign: "center", maxWidth: 720 }}>
          <div className="row center" style={{ gap: 8 }}>
            <LayerIcon />
            <h1 className="title">
              {uiLanguage === "fr" ? "Mes guides IA" : "My AI Guides"}
            </h1>
          </div>

          <p className="subtitle">
            {uiLanguage === "fr"
              ? "Accède à tes e-books et audiobooks générés automatiquement à partir de tes sessions."
              : "Access your AI-generated e-books and audiobooks from your sessions."}
          </p>

          <div className="row center" style={{ gap: 8, flexWrap: "wrap" }}>
            <BadgePill icon={<SparkIcon size={14} />}>
              {uiLanguage === "fr" ? "Bibliothèque personnelle" : "Personal library"}
            </BadgePill>

            <button
              className="button ghost"
              onClick={() => void loadArtifacts(true)}
              disabled={loading || refreshing}
              type="button"
            >
              <span className="row center" style={{ gap: 6 }}>
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

        {loading ? (
          <div className="card stack center">
            <div className="section-title">
              {uiLanguage === "fr" ? "Chargement..." : "Loading..."}
            </div>
            <div className="muted">
              {uiLanguage === "fr"
                ? "Nous préparons ta bibliothèque."
                : "Preparing your library."}
            </div>
          </div>
        ) : error ? (
          <div className="card stack center">
            <div className="section-title" style={{ color: "var(--danger)" }}>
              {uiLanguage === "fr" ? "Erreur de chargement" : "Loading error"}
            </div>

            <div className="muted">{error}</div>

            <div className="row center" style={{ gap: 10 }}>
              <button
                className="button"
                onClick={() => void loadArtifacts()}
                type="button"
              >
                {uiLanguage === "fr" ? "Réessayer" : "Try again"}
              </button>

              <button
                className="button ghost"
                onClick={() => router.push("/recommendations")}
                type="button"
              >
                {uiLanguage === "fr"
                  ? "Voir recommandations"
                  : "View recommendations"}
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="card stack center">
            <div className="section-title">
              {uiLanguage === "fr" ? "Aucun guide pour le moment" : "No guides yet"}
            </div>

            <div className="muted">
              {uiLanguage === "fr"
                ? "Achète un guide depuis une recommandation pour commencer."
                : "Purchase a guide from a recommendation to get started."}
            </div>

            <button
              className="button"
              onClick={() => router.push("/recommendations")}
              type="button"
            >
              {uiLanguage === "fr" ? "Explorer" : "Explore recommendations"}
            </button>
          </div>
        ) : (
          <div className="grid grid-3">
            {items.map((item) => {
              const isCompleted = item.status === "completed";

              return (
                <div key={item.id} className="card stack">
                  <div className="row space-between">
                    <strong>{item.title}</strong>

                    <BadgePill icon={getStatusIcon(item.status)}>
                      {formatArtifactStatus(item.status, uiLanguage)}
                    </BadgePill>
                  </div>

                  <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                    <BadgePill icon={<LayerIcon size={14} />}>
                      {formatArtifactType(item.format, uiLanguage)}
                    </BadgePill>

                    <BadgePill icon={<LayerIcon size={14} />}>
                      {formatPrice(item.price_eur)}
                    </BadgePill>
                  </div>

                  <div className="muted">
                    {isCompleted
                      ? uiLanguage === "fr"
                        ? "Prêt à être consulté."
                        : "Ready to open."
                      : uiLanguage === "fr"
                        ? "En attente de finalisation."
                        : "Waiting to be finalized."}
                  </div>

                  <button
                    className="button"
                    onClick={() => router.push(`/ai-artifacts/${item.id}`)}
                    type="button"
                  >
                    <span className="row center" style={{ gap: 8 }}>
                      <ArrowRightIcon size={14} />
                      {uiLanguage === "fr" ? "Ouvrir" : "Open"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}