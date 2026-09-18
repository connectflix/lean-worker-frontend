"use client";

import { useSyncExternalStore } from "react";
import {
  isSupportedUiLanguage,
  type SupportedUiLanguage,
} from "@/lib/user-locales";

const UI_LANGUAGE_STORAGE_KEY = "leanworker.uiLanguage";

let currentLanguage: SupportedUiLanguage = "en";

const listeners = new Set<() => void>();

function readStoredLanguage(): SupportedUiLanguage {
  if (typeof window === "undefined") return "en";

  try {
    const stored = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);

    if (isSupportedUiLanguage(stored)) {
      return stored;
    }
  } catch {
    // Fall back to the current in-memory language when storage is unavailable.
    return currentLanguage;
  }

  return "en";
}

function persistLanguage(language: SupportedUiLanguage) {
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

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setAdminUiLanguage(language: SupportedUiLanguage) {
  if (currentLanguage === language) {
    persistLanguage(language);
    return;
  }

  currentLanguage = language;
  persistLanguage(language);
  emitChange();
}

function subscribe(listener: () => void) {
  /*
   * When a new mounted consumer group starts, rehydrate from persisted state.
   * Once subscribers exist, currentLanguage is the authoritative same-tab
   * shared state and every consumer receives the same updates.
   */
  if (listeners.size === 0) {
    currentLanguage = readStoredLanguage();
    persistLanguage(currentLanguage);
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): SupportedUiLanguage {
  /*
   * useSyncExternalStore reads the snapshot before subscribing.
   * Re-read persisted state when no active consumer exists so a fresh shell
   * mount starts from localStorage rather than stale module state.
   */
  if (listeners.size === 0) {
    currentLanguage = readStoredLanguage();
  }

  return currentLanguage;
}

function getServerSnapshot(): SupportedUiLanguage {
  return "en";
}

export function useAdminUiLanguage() {
  const uiLanguage = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    uiLanguage,
    setUiLanguage: setAdminUiLanguage,
  };
}
