// components/elearning-guard.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { savePostLoginReturnTo } from "@/lib/post-login-routing";
import type { Me } from "@/lib/types";

type ElearningGuardProps = {
  children: React.ReactNode;
};

function BrandMark() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 58,
        height: 58,
        borderRadius: 18,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(251,191,36,0.22), rgba(239,68,68,0.20))",
        border: "1px solid rgba(251,191,36,0.24)",
        boxShadow:
          "0 24px 70px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16)",
        color: "#ffffff",
        fontWeight: 950,
        fontSize: 22,
        letterSpacing: "-0.07em",
      }}
    >
      LW
    </div>
  );
}

function LoadingBars() {
  return (
    <div
      aria-hidden="true"
      className="row"
      style={{
        gap: 7,
        justifyContent: "center",
        alignItems: "flex-end",
        height: 54,
      }}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          style={{
            width: 8,
            height: 18 + index * 6,
            borderRadius: 999,
            background:
              index % 2 === 0
                ? "linear-gradient(180deg, #facc15, #f97316)"
                : "linear-gradient(180deg, #fb923c, #ef4444)",
            opacity: 0.9,
            animation: `elearningPulse 900ms ease-in-out ${index * 90}ms infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

export function ElearningGuard({ children }: ElearningGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkWorkerAccess() {
      const targetPath = pathname || "/elearning";
      const token = getToken();

      if (!token) {
        savePostLoginReturnTo(targetPath);
        clearToken();

        if (isMounted) {
          setStatus("denied");
          setUser(null);
        }

        router.replace("/elearning/login");
        return;
      }

      try {
        const me = await getMe();

        if (!isMounted) return;

        setUser(me);
        setStatus("allowed");
      } catch {
        savePostLoginReturnTo(targetPath);
        clearToken();

        if (isMounted) {
          setUser(null);
          setStatus("denied");
        }

        router.replace("/elearning/login");
      }
    }

    void checkWorkerAccess();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (status !== "allowed") {
    return (
      <main
        className="page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px 20px",
          background:
            "radial-gradient(circle at 24% 0%, rgba(239,68,68,0.22), transparent 30%), radial-gradient(circle at 80% 15%, rgba(250,204,21,0.12), transparent 30%), linear-gradient(135deg, #050505 0%, #11100f 42%, #1c120d 100%)",
          color: "#f8fafc",
        }}
      >
        <style>
          {`
            @keyframes elearningPulse {
              from {
                transform: scaleY(0.62);
                opacity: 0.44;
              }
              to {
                transform: scaleY(1);
                opacity: 1;
              }
            }
          `}
        </style>

        <div
          style={{
            width: "100%",
            maxWidth: 780,
            margin: "0 auto",
          }}
        >
          <div
            className="stack"
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: 420,
              justifyContent: "center",
              alignItems: "center",
              gap: 22,
              padding: 34,
              textAlign: "center",
              borderRadius: 34,
              background:
                "linear-gradient(180deg, rgba(18,18,18,0.92), rgba(8,8,8,0.96))",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow:
                "0 34px 100px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.08)",
              backdropFilter: "blur(18px)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -120,
                right: -110,
                width: 300,
                height: 300,
                borderRadius: 999,
                background: "rgba(249,115,22,0.16)",
                filter: "blur(4px)",
              }}
            />

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: -140,
                left: -100,
                width: 310,
                height: 310,
                borderRadius: 999,
                background: "rgba(250,204,21,0.10)",
                filter: "blur(4px)",
              }}
            />

            <div
              className="stack"
              style={{
                position: "relative",
                zIndex: 1,
                gap: 12,
                alignItems: "center",
              }}
            >
              <BrandMark />

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(251,191,36,0.12)",
                  border: "1px solid rgba(251,191,36,0.20)",
                  color: "#fbbf24",
                  fontSize: 12,
                  fontWeight: 950,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Time’s UP! Academy
              </span>
            </div>

            <div
              className="stack"
              style={{
                position: "relative",
                zIndex: 1,
                gap: 10,
                maxWidth: 610,
                alignItems: "center",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  color: "#ffffff",
                  fontSize: 38,
                  lineHeight: 1.02,
                  fontWeight: 950,
                  letterSpacing: "-0.065em",
                }}
              >
                Vérification de votre accès E-Learning...
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "rgba(248,250,252,0.64)",
                  fontSize: 15,
                  lineHeight: 1.7,
                  maxWidth: 560,
                }}
              >
                Préparation de votre espace de formation
                {user?.given_name ? `, ${user.given_name}` : ""}. Nous restaurons votre accès,
                votre progression et la structure du programme Time’s UP!.
              </p>
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <LoadingBars />
            </div>

            <div
              className="row"
              style={{
                position: "relative",
                zIndex: 1,
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  padding: "8px 11px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(248,250,252,0.72)",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Accès sécurisé
              </span>

              <span
                style={{
                  display: "inline-flex",
                  padding: "8px 11px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(248,250,252,0.72)",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Progression restaurée
              </span>

              <span
                style={{
                  display: "inline-flex",
                  padding: "8px 11px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(248,250,252,0.72)",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                LeanWorker E-Learning
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}