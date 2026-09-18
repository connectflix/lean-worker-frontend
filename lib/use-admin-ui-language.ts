"use client";

import { useEffect, useState } from "react";
import {
  isSupportedUiLanguage,
  type SupportedUiLanguage,
} from "@/lib/user-locales";

const UI_LANGUAGE_STORAGE_KEY = "leanworker.uiLanguage";

function readAdminUiLanguage(): SupportedUiLanguage {
  if (typeof window === "undefined") return "en";

  try {
    const stored = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);

    if (isSupportedUiLanguage(stored)) {
      return stored;
    }
  } catch {
    // Fall back to English when storage is unavailable.
  }

  return "en";
}

function persistAdminUiLanguage(language: SupportedUiLanguage) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The UI can still switch language for the current session.
    }
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}

export function useAdminUiLanguage() {
  const [uiLanguage, setUiLanguage] =
    useState<SupportedUiLanguage>(readAdminUiLanguage);

  useEffect(() => {
    persistAdminUiLanguage(uiLanguage);
  }, [uiLanguage]);

  return {
    uiLanguage,
    setUiLanguage,
  };
}
