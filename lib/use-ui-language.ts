"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import {
  isSupportedUiLanguage,
  resolveUiLanguage,
  type SupportedUiLanguage,
} from "@/lib/user-locales";

const UI_LANGUAGE_STORAGE_KEY = "leanworker.uiLanguage";

function readPersistedUiLanguage(): SupportedUiLanguage | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);

    if (isSupportedUiLanguage(stored)) {
      return stored;
    }

    return null;
  } catch {
    return null;
  }
}

function readBrowserUiLanguage(): SupportedUiLanguage | null {
  if (typeof window === "undefined") return null;

  const candidates = [
    window.navigator.language,
    ...(window.navigator.languages || []),
  ];

  for (const candidate of candidates) {
    const resolved = resolveUiLanguage({
      language: candidate,
      locale: candidate,
    });

    if (isSupportedUiLanguage(resolved)) {
      return resolved;
    }
  }

  return null;
}

export function persistUiLanguage(language: SupportedUiLanguage) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage failures.
    }
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}

export function useUiLanguage(defaultLanguage: SupportedUiLanguage = "en") {
  const [uiLanguage, setUiLanguage] = useState<SupportedUiLanguage>(() => {
    return readPersistedUiLanguage() ?? readBrowserUiLanguage() ?? defaultLanguage;
  });

  const [loadingLanguage, setLoadingLanguage] = useState(true);

  useEffect(() => {
    const initialLanguage =
      readPersistedUiLanguage() ?? readBrowserUiLanguage() ?? defaultLanguage;
    setUiLanguage(initialLanguage);
    persistUiLanguage(initialLanguage);
  }, [defaultLanguage]);

  useEffect(() => {
    let cancelled = false;

    async function loadLanguage() {
      if (!isAuthenticated()) {
        const fallback =
          readPersistedUiLanguage() ?? readBrowserUiLanguage() ?? defaultLanguage;

        setUiLanguage(fallback);
        persistUiLanguage(fallback);
        setLoadingLanguage(false);
        return;
      }

      try {
        const me = await getMe();

        if (cancelled) return;

        const resolved = resolveUiLanguage({
          language: me.language,
          locale: me.locale,
        });

        setUiLanguage(resolved);
        persistUiLanguage(resolved);
      } catch {
        if (cancelled) return;

        const fallback =
          readPersistedUiLanguage() ?? readBrowserUiLanguage() ?? defaultLanguage;

        setUiLanguage(fallback);
        persistUiLanguage(fallback);
      } finally {
        if (!cancelled) {
          setLoadingLanguage(false);
        }
      }
    }

    void loadLanguage();

    return () => {
      cancelled = true;
    };
  }, [defaultLanguage]);

  function updateUiLanguage(language: SupportedUiLanguage) {
    setUiLanguage(language);
    persistUiLanguage(language);
  }

  return {
    uiLanguage,
    loadingLanguage,
    setUiLanguage: updateUiLanguage,
  };
}