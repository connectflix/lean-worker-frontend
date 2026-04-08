import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { getMe } from "@/lib/api";

export async function routeUserAfterLogin(router: AppRouterInstance): Promise<void> {
  const me = await getMe();

  if (!me.onboarding_completed) {
    router.replace("/onboarding");
    return;
  }

  router.replace("/dashboard");
}