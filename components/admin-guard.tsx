"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";
import { getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

const ORGANIZATION_ALLOWED_PREFIXES = [
  "/admin/organizations",
  "/admin/coaching-plan",
  "/admin/coaching-guide",
  "/admin/coaching-flow",
  "/admin/bookings",
  "/admin/change-password",
];

function isAllowedForOrganization(pathname: string): boolean {
  return ORGANIZATION_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getLoadingMessage(account: AdminMe | null): string {
  if (account?.role === "organization") {
    return "Checking your organization workspace access...";
  }

  return "Checking backoffice access...";
}

function getLoadingDescription(account: AdminMe | null): string {
  if (account?.role === "organization") {
    return "Your organization access is being verified before opening the scoped workspace.";
  }

  return "LeanWorker is validating your admin session and permissions.";
}

function AdminGuardLoadingState({ account }: { account: AdminMe | null }) {
  return (
    <main
      className="page"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 34%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <div
        className="card stack"
        style={{
          width: "min(520px, 100%)",
          gap: 18,
          padding: 28,
          borderRadius: 28,
          background: "rgba(255,255,255,0.86)",
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 24px 60px rgba(15,23,42,0.10)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          className="row"
          style={{
            gap: 14,
            alignItems: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 46,
              height: 46,
              borderRadius: 18,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(79,70,229,1), rgba(124,58,237,0.92))",
              color: "#ffffff",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              boxShadow: "0 16px 34px rgba(79,70,229,0.20)",
            }}
          >
            LW
          </div>

          <div className="stack" style={{ gap: 4, minWidth: 0 }}>
            <div
              className="section-title"
              style={{
                fontSize: 20,
                letterSpacing: "-0.04em",
              }}
            >
              LeanWorker Backoffice
            </div>

            <div className="muted">Secure admin workspace</div>
          </div>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 10,
            borderRadius: 22,
            border: "1px solid rgba(79,70,229,0.14)",
            background:
              "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(255,255,255,0.78))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#4f46e5",
                boxShadow: "0 0 0 6px rgba(79,70,229,0.12)",
                flexShrink: 0,
              }}
            />

            <div style={{ fontWeight: 850, letterSpacing: "-0.02em" }}>
              {getLoadingMessage(account)}
            </div>
          </div>

          <div className="muted" style={{ lineHeight: 1.55 }}>
            {getLoadingDescription(account)}
          </div>
        </div>

        <div
          aria-label="Loading"
          style={{
            width: "100%",
            height: 8,
            borderRadius: 999,
            overflow: "hidden",
            background: "rgba(100,116,139,0.14)",
          }}
        >
          <div
            style={{
              width: "42%",
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
            }}
          />
        </div>
      </div>
    </main>
  );
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");
  const [account, setAccount] = useState<AdminMe | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminAccess() {
      const token = getAdminToken();

      if (!token) {
        clearAdminToken();

        if (!cancelled) {
          setAccount(null);
          setStatus("denied");
          router.replace("/admin/login");
        }

        return;
      }

      try {
        const me = await getAdminMe();

        if (cancelled) return;

        setAccount(me);

        if (me.role === "organization" && !isAllowedForOrganization(pathname)) {
          setStatus("denied");
          router.replace("/admin/organizations");
          return;
        }

        setStatus("allowed");
      } catch {
        clearAdminToken();

        if (!cancelled) {
          setAccount(null);
          setStatus("denied");
          router.replace("/admin/login");
        }
      }
    }

    void checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (status !== "allowed") {
    return <AdminGuardLoadingState account={account} />;
  }

  return <>{children}</>;
}