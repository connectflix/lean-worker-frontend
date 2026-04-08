"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { BadgePill, PathIcon, SparkIcon } from "@/components/ui-flat-icons";

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

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      const token = getToken();

      if (!token) {
        clearToken();
        if (isMounted) {
          setStatus("denied");
        }
        router.replace("/");
        return;
      }

      try {
        const me = await getMe();

        if (me.onboarding_completed) {
          if (isMounted) {
            setStatus("denied");
          }
          router.replace("/dashboard");
          return;
        }

        if (isMounted) {
          setStatus("allowed");
        }
      } catch {
        clearToken();
        if (isMounted) {
          setStatus("denied");
        }
        router.replace("/");
      }
    }

    void checkAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (status !== "allowed") {
    return (
      <main className="page">
        <div className="page-wrap center" style={{ maxWidth: 680 }}>
          <div
            className="card stack center"
            style={{
              textAlign: "center",
              gap: 14,
              minHeight: 280,
              justifyContent: "center",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))",
            }}
          >
            <BrandMark />
            <BadgePill icon={<PathIcon size={14} />}>Onboarding</BadgePill>
            <div className="loader" />
            <div className="section-title" style={{ margin: 0 }}>
              Preparing your onboarding...
            </div>
            <div className="muted">
              We are checking your access and preparing your personalized setup.
            </div>
            <BadgePill icon={<SparkIcon size={14} />}>LeanWorker</BadgePill>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}