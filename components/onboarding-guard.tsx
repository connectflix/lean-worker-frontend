"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { BadgePill, PathIcon, SparkIcon } from "@/components/ui-flat-icons";

function BrandMark() {
  return (
    <div
      style={{
        width: 58,
        height: 58,
        borderRadius: 22,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(255,122,89,0.20), rgba(88,180,174,0.16))",
        border: "1px solid rgba(43,33,24,0.08)",
        boxShadow:
          "0 18px 42px rgba(43,33,24,0.10), inset 0 1px 0 rgba(255,255,255,0.76)",
        fontWeight: 950,
        fontSize: 20,
        letterSpacing: "-0.05em",
        color: "var(--coach-ink)",
      }}
      aria-hidden="true"
    >
      LW
    </div>
  );
}

export function OnboardingGuard({ children }: { children: ReactNode }) {
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
      <main
        className="page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background:
            "radial-gradient(circle at top left, rgba(255,122,89,0.12), transparent 30%), radial-gradient(circle at bottom right, rgba(88,180,174,0.12), transparent 34%), var(--coach-bg)",
        }}
      >
        <div
          className="page-wrap center"
          style={{
            maxWidth: 720,
            width: "100%",
          }}
        >
          <div
            className="card stack center"
            style={{
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
              gap: 16,
              minHeight: 340,
              justifyContent: "center",
              borderRadius: 32,
              border: "1px solid rgba(43,33,24,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92) 52%, rgba(232,248,246,0.88))",
              boxShadow: "0 24px 70px rgba(43,33,24,0.10)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -110,
                top: -120,
                width: 280,
                height: 280,
                borderRadius: 999,
                background: "rgba(255,122,89,0.16)",
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: -100,
                bottom: -120,
                width: 280,
                height: 280,
                borderRadius: 999,
                background: "rgba(88,180,174,0.14)",
              }}
            />

            <div
              className="stack center"
              style={{
                position: "relative",
                zIndex: 1,
                gap: 16,
                maxWidth: 520,
              }}
            >
              <BrandMark />

              <div className="row center" style={{ gap: 8, flexWrap: "wrap" }}>
                <BadgePill icon={<PathIcon size={14} />}>Onboarding</BadgePill>
                <BadgePill icon={<SparkIcon size={14} />}>LeanWorker</BadgePill>
              </div>

              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,122,89,0.12)",
                  border: "1px solid rgba(255,122,89,0.22)",
                }}
              >
                <div
                  className="loader"
                  style={{
                    width: 24,
                    height: 24,
                    borderColor: "rgba(255,122,89,0.18)",
                    borderTopColor: "var(--coach-accent)",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1.08,
                  fontWeight: 950,
                  letterSpacing: "-0.06em",
                  color: "var(--coach-ink)",
                }}
              >
                Preparing your onboarding...
              </div>

              <div
                className="muted"
                style={{
                  maxWidth: 460,
                  color: "var(--coach-muted)",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                We are checking your access and preparing your personalized coaching setup.
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}