"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import type { Me } from "@/lib/types";
import { BadgePill, SparkIcon } from "@/components/ui-flat-icons";
import { UserProvider } from "@/components/user-context";
import { useUiLanguage } from "@/lib/use-ui-language";

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

function AuthLoadingScreen() {
  const { uiLanguage } = useUiLanguage("fr");

  const copy =
    uiLanguage === "fr"
      ? {
          badge: "Espace de coaching",
          title: "Préparation de ton espace...",
          description:
            "Nous restaurons ton contexte, tes sessions et tes recommandations personnalisées.",
          status: "Vérification de ton accès en cours",
        }
      : {
          badge: "Coaching workspace",
          title: "Preparing your workspace...",
          description:
            "We are restoring your context, sessions, and personalized recommendations.",
          status: "Checking your access",
        };

  return (
    <main
      className="page"
      lang={uiLanguage}
      translate="no"
      aria-busy="true"
      aria-live="polite"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 3vw, 24px)",
        background:
          "radial-gradient(circle at top left, rgba(255,122,89,0.12), transparent 30%), radial-gradient(circle at bottom right, rgba(88,180,174,0.12), transparent 34%), var(--coach-bg)",
      }}
    >
      <div
        className="page-wrap center"
        style={{
          maxWidth: 760,
          width: "100%",
        }}
      >
        <div
          className="card stack center"
          style={{
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
            gap: 18,
            minHeight: 360,
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
              maxWidth: 580,
            }}
          >
            <div className="stack center" style={{ gap: 10 }}>
              <BrandMark />

              <div className="row center" style={{ gap: 8, flexWrap: "wrap" }}>
                <BadgePill icon={<SparkIcon size={14} />}>LeanWorker</BadgePill>
                <BadgePill icon={<SparkIcon size={14} />}>{copy.badge}</BadgePill>
              </div>
            </div>

            <div
              style={{
                fontSize: 30,
                lineHeight: 1.1,
                fontWeight: 950,
                letterSpacing: "-0.055em",
                color: "var(--coach-ink)",
              }}
            >
              {copy.title}
            </div>

            <div
              className="muted"
              style={{
                maxWidth: 540,
                color: "var(--coach-muted)",
                lineHeight: 1.7,
              }}
            >
              {copy.description}
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
              <span
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  border: 0,
                }}
              >
                {copy.status}
              </span>

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
          </div>
        </div>
      </div>
    </main>
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
    return <AuthLoadingScreen />;
  }

  return <UserProvider value={{ user, setUser }}>{children}</UserProvider>;
}