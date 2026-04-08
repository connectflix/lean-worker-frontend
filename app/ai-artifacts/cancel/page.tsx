"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import {
  ArrowRightIcon,
  BadgePill,
  ClockIcon,
  LayerIcon,
} from "@/components/ui-flat-icons";
import { getUiCopy } from "@/lib/ui-copy";
import { useUiLanguage } from "@/lib/use-ui-language";

export default function AIArtifactCancelPage() {
  return (
    <AuthGuard>
      <AIArtifactCancelContent />
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
      title={uiLanguage === "fr" ? "Paiement annulé" : "Payment canceled"}
    >
      <div className="card stack">
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <LayerIcon />
          <h1 className="title">
            {uiLanguage === "fr" ? "Paiement interrompu" : "Payment interrupted"}
          </h1>
        </div>

        <p className="subtitle">
          {uiLanguage === "fr"
            ? "Le paiement n’a pas été finalisé. Aucun souci : tu peux reprendre plus tard."
            : "The payment was not completed. No problem: you can continue later."}
        </p>

        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <BadgePill icon={<ClockIcon size={14} />}>
            {uiLanguage === "fr" ? "Aucun débit effectué" : "No charge completed"}
          </BadgePill>
        </div>

        <div className="card-soft">
          <div className="muted">
            {uiLanguage === "fr"
              ? "Tu peux retourner à la recommandation concernée ou reprendre depuis ta bibliothèque de guides IA."
              : "You can go back to the related recommendation or continue from your AI guide library."}
          </div>
        </div>

        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          {artifactId ? (
            <button
              className="button"
              onClick={() => router.push(`/ai-artifacts/${artifactId}`)}
              type="button"
            >
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <ArrowRightIcon size={14} />
                {uiLanguage === "fr" ? "Retour au guide" : "Back to guide"}
              </span>
            </button>
          ) : null}

          <button
            className="button secondary"
            onClick={() => router.push("/ai-artifacts")}
            type="button"
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
      </div>
    </AppShell>
  );
}