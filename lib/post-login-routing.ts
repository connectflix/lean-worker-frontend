import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { getMe } from "@/lib/api";

const POST_LOGIN_RETURN_TO_KEY = "leanworker.postLoginReturnTo";

function isSafeInternalPath(value?: string | null): value is string {
  if (!value) return false;

  const trimmed = value.trim();

  if (!trimmed.startsWith("/")) return false;
  if (trimmed.startsWith("//")) return false;
  if (trimmed.includes("://")) return false;

  return true;
}

function normalizeInternalPath(value?: string | null): string | null {
  if (!isSafeInternalPath(value)) return null;

  const trimmed = value.trim();

  if (trimmed === "/auth/callback") return null;
  if (trimmed.startsWith("/auth/callback?")) return null;

  return trimmed;
}

function isOnboardingPath(path: string | null): boolean {
  return path === "/onboarding" || Boolean(path?.startsWith("/onboarding?"));
}

export function savePostLoginReturnTo(path: string): void {
  if (typeof window === "undefined") return;

  const safePath = normalizeInternalPath(path);

  if (!safePath) return;

  try {
    window.localStorage.setItem(POST_LOGIN_RETURN_TO_KEY, safePath);
  } catch {
    // Ignore storage failures.
  }
}

export function getPostLoginReturnTo(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(POST_LOGIN_RETURN_TO_KEY);
    return normalizeInternalPath(value);
  } catch {
    return null;
  }
}

export function clearPostLoginReturnTo(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(POST_LOGIN_RETURN_TO_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function consumePostLoginReturnTo(): string | null {
  const value = getPostLoginReturnTo();
  clearPostLoginReturnTo();

  return value;
}

export async function routeUserAfterLogin(
  router: AppRouterInstance,
  options?: {
    returnTo?: string | null;
    respectOnboarding?: boolean;
  },
): Promise<void> {
  const me = await getMe();

  const explicitReturnTo = normalizeInternalPath(options?.returnTo);
  const storedReturnTo = consumePostLoginReturnTo();

  const returnTo = explicitReturnTo || storedReturnTo;
  const respectOnboarding = options?.respectOnboarding ?? true;

  if (respectOnboarding && !me.onboarding_completed && !isOnboardingPath(returnTo)) {
    router.replace("/onboarding");
    return;
  }

  if (returnTo) {
    router.replace(returnTo);
    return;
  }

  if (respectOnboarding && !me.onboarding_completed) {
    router.replace("/onboarding");
    return;
  }

  router.replace("/dashboard");
}