"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";
import { resolveUiLanguage, type SupportedUiLanguage } from "@/lib/user-locales";

function persistUiLanguage(language: SupportedUiLanguage) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem("leanworker.uiLanguage", language);
  } catch {
    // ignore storage failures
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}

export function useUiLanguage(defaultLanguage: SupportedUiLanguage = "en") {
  const [uiLanguage, setUiLanguage] = useState<SupportedUiLanguage>(defaultLanguage);
  const [loadingLanguage, setLoadingLanguage] = useState(true);

  useEffect(() => {
    async function loadLanguage() {
      try {
        const me = await getMe();
        const resolved = resolveUiLanguage({
          language: me.language,
          locale: me.locale,
        });
        setUiLanguage(resolved);
        persistUiLanguage(resolved);
      } catch {
        setUiLanguage(defaultLanguage);
        persistUiLanguage(defaultLanguage);
      } finally {
        setLoadingLanguage(false);
      }
    }

    void loadLanguage();
  }, [defaultLanguage]);

  return { uiLanguage, loadingLanguage };
}