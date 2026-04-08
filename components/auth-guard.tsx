"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import type { Me } from "@/lib/types";
import { BadgePill, SparkIcon } from "@/components/ui-flat-icons";
import { UserProvider } from "@/components/user-context";

function BrandMark() {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(16,185,129,0.14))",
        border: "1px solid rgba(37,99,235,0.18)",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.5)",
        fontWeight: 800,
        fontSize: 20,
        letterSpacing: "-0.04em",
      }}
      aria-hidden="true"
    >
      <span
        style={{
          background: "linear-gradient(135deg, #2563eb, #10b981)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        LW
      </span>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed">("checking");
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function check() {
      const token = getToken();

      if (!token) {
        clearToken();
        router.replace("/");
        return;
      }

      try {
        const me = await getMe();

        if (!me.onboarding_completed) {
          router.replace("/onboarding");
          return;
        }

        if (!isMounted) return;

        setUser(me);
        setStatus("allowed");
      } catch {
        clearToken();
        router.replace("/");
      }
    }

    void check();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (status !== "allowed") {
    return (
      <main className="page">
        <div
          className="page-wrap center"
          style={{
            maxWidth: 760,
            minHeight: "100vh",
            justifyContent: "center",
          }}
        >
          <div
            className="card stack center"
            style={{
              textAlign: "center",
              gap: 16,
              minHeight: 320,
              justifyContent: "center",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.90), rgba(248,250,252,0.92))",
            }}
          >
            <BrandMark />

            <BadgePill icon={<SparkIcon size={14} />}>LeanWorker</BadgePill>

            <div className="loader" />

            <div className="section-title" style={{ margin: 0, fontSize: 20 }}>
              Loading your workspace...
            </div>

            <div className="muted" style={{ maxWidth: 520 }}>
              Restoring your coaching context, sessions, recommendations, and
              personalized workspace.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <UserProvider value={{ user, setUser }}>
      {children}
    </UserProvider>
  );
}