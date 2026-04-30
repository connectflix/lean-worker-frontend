"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";
import { getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

const ORGANIZATION_ALLOWED_PREFIXES = ["/admin/organizations"];

function isAllowedForOrganization(pathname: string): boolean {
  return ORGANIZATION_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");
  const [account, setAccount] = useState<AdminMe | null>(null);

  useEffect(() => {
    async function checkAdminAccess() {
      const token = getAdminToken();

      if (!token) {
        clearAdminToken();
        setStatus("denied");
        router.replace("/admin/login");
        return;
      }

      try {
        const me = await getAdminMe();
        setAccount(me);

        if (me.role === "organization" && !isAllowedForOrganization(pathname)) {
          setStatus("denied");
          router.replace("/admin/organizations");
          return;
        }

        setStatus("allowed");
      } catch {
        clearAdminToken();
        setAccount(null);
        setStatus("denied");
        router.replace("/admin/login");
      }
    }

    void checkAdminAccess();
  }, [pathname, router]);

  if (status !== "allowed") {
    return (
      <main className="page">
        <div className="container">
          <div className="card">
            {account?.role === "organization"
              ? "Redirecting to your organization workspace..."
              : "Checking backoffice access..."}
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}