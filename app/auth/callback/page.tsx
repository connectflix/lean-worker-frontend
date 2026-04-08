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
        width: 56,
        height: 56,
        borderRadius: 18,
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(16,185,129,0.14))",
        border: "1px solid rgba(37,99,235,0.18)",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.5)",
        fontWeight: 800,
        fontSize: 22,
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

        if (!token) {
          if (isMounted) {
            setError("Missing authentication token.");
          }
          return;
        }

        saveToken(token);
        await routeUserAfterLogin(router);
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
    <main
      className="page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      <div className="page-wrap" style={{ maxWidth: 760, width: "100%" }}>
        <div
          className="card stack"
          style={{
            textAlign: "center",
            gap: 18,
            minHeight: 360,
            justifyContent: "center",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))",
          }}
        >
          <div className="stack" style={{ gap: 8, alignItems: "center" }}>
            <BrandMark />
            <BadgePill icon={<SparkIcon size={14} />}>{copy.eyebrow}</BadgePill>
            <h1 className="title" style={{ margin: 0 }}>
              {copy.brandTitle}
            </h1>
            <div className="muted">{copy.brandSubtitle}</div>
          </div>

          {!error ? (
            <>
              <div className="row" style={{ justifyContent: "center" }}>
                <BadgePill icon={<CheckCircleIcon size={14} />}>{copy.badgeOk}</BadgePill>
              </div>

              <h2 className="title" style={{ fontSize: 28, margin: 0 }}>
                {copy.signingIn}
              </h2>

              <p className="subtitle" style={{ margin: 0, maxWidth: 580, alignSelf: "center" }}>
                {copy.signingInBody}
              </p>

              <div className="loader" style={{ alignSelf: "center" }} />
            </>
          ) : (
            <>
              <div className="row" style={{ justifyContent: "center" }}>
                <BadgePill icon={<SparkIcon size={14} />}>{copy.badgeError}</BadgePill>
              </div>

              <h2 className="title" style={{ fontSize: 28, margin: 0 }}>
                {copy.errorTitle}
              </h2>

              <p className="subtitle" style={{ margin: 0 }}>
                {copy.errorBody}
              </p>

              <div className="card-soft" style={{ color: "var(--danger)" }}>
                {error}
              </div>

              <div className="row" style={{ justifyContent: "center", flexWrap: "wrap" }}>
                <button className="button" onClick={() => router.push("/")}>
                  {copy.backHome}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function AuthCallbackFallback() {
  return (
    <main
      className="page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      <div className="page-wrap" style={{ maxWidth: 760, width: "100%" }}>
        <div
          className="card stack"
          style={{
            textAlign: "center",
            gap: 18,
            minHeight: 360,
            justifyContent: "center",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))",
          }}
        >
          <div className="stack" style={{ gap: 8, alignItems: "center" }}>
            <BrandMark />
            <BadgePill icon={<SparkIcon size={14} />}>Authentication</BadgePill>
            <h1 className="title" style={{ margin: 0 }}>
              LeanWorker
            </h1>
            <div className="muted">Career intelligence amplified</div>
          </div>

          <div className="row" style={{ justifyContent: "center" }}>
            <BadgePill icon={<CheckCircleIcon size={14} />}>Login</BadgePill>
          </div>

          <h2 className="title" style={{ fontSize: 28, margin: 0 }}>
            Signing you in...
          </h2>

          <p className="subtitle" style={{ margin: 0, maxWidth: 580, alignSelf: "center" }}>
            We are preparing your coaching workspace, restoring your context, and loading your
            personalized environment.
          </p>

          <div className="loader" style={{ alignSelf: "center" }} />
        </div>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}