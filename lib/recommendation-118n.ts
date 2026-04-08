import type { SupportedUiLanguage } from "@/lib/user-locales";

export function localizeRecommendationText(
  text: string | null | undefined,
  uiLanguage: SupportedUiLanguage
): string | null {
  if (!text) return null;
  if (uiLanguage !== "fr") return text;

  const normalized = text.trim();

  const map: Record<string, string> = {
    // WHY NOW
    "Start with a tailored action guide you can apply immediately.":
      "Commence par un plan d’action personnalisé que tu peux appliquer immédiatement.",

    // SITUATION LINK
    "primary problem match; balanced structured support for medium-intensity situation; category fits career movement and guidance":
      "Correspondance directe avec ton problème principal ; accompagnement structuré adapté à une situation intermédiaire ; aligné avec une évolution de carrière.",

    // BENEFIT
    "Start with your personalized guide at a launch price.":
      "Commence avec ton guide personnalisé à un tarif de lancement.",

    // fallback variants (important)
    "Start with your personalized guide":
      "Commence avec ton guide personnalisé",

    "balanced structured support":
      "accompagnement structuré équilibré",
  };

  return map[normalized] ?? text;
}