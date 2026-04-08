export type SupportedUiLanguage = "fr" | "en";

export function resolveUiLanguage(params: {
  language?: string | null;
  locale?: string | null;
}): SupportedUiLanguage {
  const language = (params.language || "").toLowerCase();
  const locale = (params.locale || "").toLowerCase();

  if (language.startsWith("fr") || locale.startsWith("fr")) {
    return "fr";
  }

  return "en";
}