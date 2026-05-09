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

export function savePostLoginReturnTo(path: string): void {
  if (typeof window === "undefined") return;

  if (!isSafeInternalPath(path)) return;

  window.localStorage.setItem(POST_LOGIN_RETURN_TO_KEY, path);
}

export function getPostLoginReturnTo(): string | null {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(POST_LOGIN_RETURN_TO_KEY);

  return isSafeInternalPath(value) ? value : null;
}

export function clearPostLoginReturnTo(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(POST_LOGIN_RETURN_TO_KEY);
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

  const explicitReturnTo = isSafeInternalPath(options?.returnTo)
    ? options?.returnTo
    : null;

  const storedReturnTo = consumePostLoginReturnTo();

  const returnTo = explicitReturnTo || storedReturnTo;

  const respectOnboarding = options?.respectOnboarding ?? true;

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