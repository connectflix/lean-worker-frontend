"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveToken } from "@/lib/auth";
import { routeUserAfterLogin } from "@/lib/post-login-routing";
import {
  BadgePill,
  CheckCircleIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";

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

function AuthSurface({
  children,
}: {
  children: React.ReactNode;
}) {
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
            minHeight: 380,
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
              gap: 18,
              maxWidth: 580,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);

  const copy = useMemo(
    () => ({
      eyebrow: "Authentication",
      brandTitle: "LeanWorker",
      brandSubtitle: "Career intelligence amplified",
      signingIn: "Signing you in...",
      signingInBody:
        "We are preparing your coaching workspace, restoring your context, and loading your personalized environment.",
      badgeOk: "Login",
      badgeError: "Login issue",
      errorTitle: "We could not complete your sign-in",
      errorBody: "Your authentication flow did not complete as expected.",
      backHome: "Back to home",
    }),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    async function handleCallback() {
      try {
        const token = searchParams.get("token");
        const returnTo = searchParams.get("returnTo");

        if (!token) {
          if (isMounted) {
            setError("Missing authentication token.");
          }
          return;
        }

        saveToken(token);

        await routeUserAfterLogin(router, {
          returnTo,
        });
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Authentication callback failed.");
        }
      }
    }

    void handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <AuthSurface>
      <div className="stack center" style={{ gap: 10 }}>
        <BrandMark />

        <div className="row center" style={{ gap: 8, flexWrap: "wrap" }}>
          <BadgePill icon={<SparkIcon size={14} />}>{copy.eyebrow}</BadgePill>
        </div>

        <div
          style={{
            fontSize: 34,
            lineHeight: 1.06,
            fontWeight: 950,
            letterSpacing: "-0.065em",
            color: "var(--coach-ink)",
          }}
        >
          {copy.brandTitle}
        </div>

        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            fontSize: 14,
          }}
        >
          {copy.brandSubtitle}
        </div>
      </div>

      {!error ? (
        <>
          <div className="row center" style={{ gap: 8, flexWrap: "wrap" }}>
            <BadgePill icon={<CheckCircleIcon size={14} />}>{copy.badgeOk}</BadgePill>
            <BadgePill icon={<SparkIcon size={14} />}>Coach workspace</BadgePill>
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
            {copy.signingIn}
          </div>

          <p
            className="subtitle"
            style={{
              margin: 0,
              maxWidth: 560,
              color: "var(--coach-muted)",
              lineHeight: 1.7,
            }}
          >
            {copy.signingInBody}
          </p>

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
        </>
      ) : (
        <>
          <div className="row center" style={{ gap: 8, flexWrap: "wrap" }}>
            <BadgePill icon={<SparkIcon size={14} />}>{copy.badgeError}</BadgePill>
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
            {copy.errorTitle}
          </div>

          <p
            className="subtitle"
            style={{
              margin: 0,
              maxWidth: 560,
              color: "var(--coach-muted)",
              lineHeight: 1.7,
            }}
          >
            {copy.errorBody}
          </p>

          <div
            className="card-soft"
            style={{
              width: "100%",
              maxWidth: 520,
              color: "var(--danger)",
              background: "rgba(198,40,40,0.08)",
              border: "1px solid rgba(198,40,40,0.16)",
              borderRadius: 22,
              textAlign: "left",
            }}
          >
            {error}
          </div>

          <div className="row center" style={{ flexWrap: "wrap" }}>
            <button
              className="button"
              onClick={() => router.push("/")}
              type="button"
              style={{
                background: "var(--coach-accent)",
                minHeight: 46,
                paddingInline: 22,
              }}
            >
              {copy.backHome}
            </button>
          </div>
        </>
      )}
    </AuthSurface>
  );
}

function AuthCallbackFallback() {
  return (
    <AuthSurface>
      <div className="stack center" style={{ gap: 10 }}>
        <BrandMark />

        <div className="row center" style={{ gap: 8, flexWrap: "wrap" }}>
          <BadgePill icon={<SparkIcon size={14} />}>Authentication</BadgePill>
        </div>

        <div
          style={{
            fontSize: 34,
            lineHeight: 1.06,
            fontWeight: 950,
            letterSpacing: "-0.065em",
            color: "var(--coach-ink)",
          }}
        >
          LeanWorker
        </div>

        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            fontSize: 14,
          }}
        >
          Career intelligence amplified
        </div>
      </div>

      <div className="row center" style={{ gap: 8, flexWrap: "wrap" }}>
        <BadgePill icon={<CheckCircleIcon size={14} />}>Login</BadgePill>
        <BadgePill icon={<SparkIcon size={14} />}>Coach workspace</BadgePill>
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
        Signing you in...
      </div>

      <p
        className="subtitle"
        style={{
          margin: 0,
          maxWidth: 560,
          color: "var(--coach-muted)",
          lineHeight: 1.7,
        }}
      >
        We are preparing your coaching workspace, restoring your context, and loading your
        personalized environment.
      </p>

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
    </AuthSurface>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}