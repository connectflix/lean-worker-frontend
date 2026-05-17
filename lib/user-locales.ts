export type SupportedUiLanguage = "fr" | "en";

const SUPPORTED_UI_LANGUAGES: SupportedUiLanguage[] = ["fr", "en"];

function normalizeLocaleValue(value?: string | null): string {
  return (value || "").trim().toLowerCase().replace("_", "-");
}

function startsWithAny(value: string, candidates: string[]): boolean {
  return candidates.some((candidate) => value.startsWith(candidate));
}

export function isSupportedUiLanguage(
  value?: string | null,
): value is SupportedUiLanguage {
  const normalized = normalizeLocaleValue(value);

  return SUPPORTED_UI_LANGUAGES.includes(normalized as SupportedUiLanguage);
}

export function resolveUiLanguage(params: {
  language?: string | null;
  locale?: string | null;
}): SupportedUiLanguage {
  const language = normalizeLocaleValue(params.language);
  const locale = normalizeLocaleValue(params.locale);

  if (isSupportedUiLanguage(language)) {
    return language;
  }

  if (isSupportedUiLanguage(locale)) {
    return locale;
  }

  if (
    startsWithAny(language, ["fr", "french", "français", "francais"]) ||
    startsWithAny(locale, ["fr", "french", "français", "francais"])
  ) {
    return "fr";
  }

  return "en";
}