"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, getAdminMe } from "@/lib/api";
import { getAdminToken, setAdminToken } from "@/lib/admin-auth";

type AdminRole = "admin" | "organization";

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px",
  background:
    "radial-gradient(circle at 10% 10%, rgba(59,130,246,0.14), transparent 32%), radial-gradient(circle at 90% 20%, rgba(34,197,94,0.12), transparent 30%), linear-gradient(135deg, #f8fafc 0%, #eef6ff 48%, #f8fff8 100%)",
  color: "#0f172a",
};

const shellStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.25fr) minmax(360px, 0.75fr)",
  gap: 24,
  alignItems: "stretch",
};

const cardStyle: CSSProperties = {
  borderRadius: 28,
  border: "1px solid rgba(15,23,42,0.08)",
  background: "rgba(255,255,255,0.88)",
  boxShadow: "0 24px 80px rgba(15,23,42,0.10)",
  backdropFilter: "blur(18px)",
};

const heroStyle: CSSProperties = {
  ...cardStyle,
  minHeight: 620,
  padding: 30,
  overflow: "hidden",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 28,
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(239,246,255,0.92) 52%, rgba(240,253,244,0.92))",
};

const panelStyle: CSSProperties = {
  ...cardStyle,
  padding: 28,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 22,
  background: "rgba(255,255,255,0.94)",
};

const brandLogoStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, #2563eb, #14b8a6)",
  color: "white",
  fontWeight: 900,
  letterSpacing: "-0.05em",
  flexShrink: 0,
};

const badgeBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  borderRadius: 999,
  padding: "7px 11px",
  fontSize: 12,
  fontWeight: 850,
  lineHeight: 1,
  border: "1px solid rgba(15,23,42,0.08)",
  background: "rgba(15,23,42,0.05)",
  color: "#334155",
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(255,255,255,0.92)",
  color: "#0f172a",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  minHeight: 48,
  width: "100%",
  borderRadius: 999,
  border: "1px solid rgba(37,99,235,0.12)",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  fontWeight: 850,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(37,99,235,0.20)",
};

const disabledButtonStyle: CSSProperties = {
  opacity: 0.55,
  cursor: "not-allowed",
  boxShadow: "none",
};

const mutedStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.6,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 850,
  letterSpacing: "-0.025em",
};

function resolveLandingPath(role: AdminRole) {
  return role === "organization" ? "/admin/organizations" : "/admin";
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: 16,
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(15,23,42,0.08)",
      }}
    >
      <div style={sectionTitleStyle}>{title}</div>
      <div style={{ ...mutedStyle, marginTop: 7, fontSize: 13 }}>{description}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <main style={pageStyle}>
      <div style={{ width: "100%", maxWidth: 820 }}>
        <section style={{ ...heroStyle, minHeight: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={brandLogoStyle}>LW</div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#2563eb",
                }}
              >
                Backoffice
              </div>
              <h1
                style={{
                  margin: "4px 0 0",
                  fontSize: 24,
                  lineHeight: 1.1,
                  letterSpacing: "-0.055em",
                }}
              >
                LeanWorker Admin
              </h1>
              <p style={{ ...mutedStyle, margin: "6px 0 0", fontSize: 14 }}>
                Operations, governance and organization workspace
              </p>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 40,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                maxWidth: 720,
              }}
            >
              Preparing your secure workspace.
            </div>

            <div style={{ ...mutedStyle, maxWidth: 620, marginTop: 14 }}>
              We are checking whether an active admin or organization session already exists.
            </div>
          </div>

          <div
            style={{
              minHeight: 118,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 18,
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(15,23,42,0.08)",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                border: "3px solid rgba(37,99,235,0.18)",
                borderTopColor: "#2563eb",
                animation: "spin 0.9s linear infinite",
              }}
            />
            <div style={mutedStyle}>Checking existing admin session...</div>

            <style jsx>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function tryExistingAdminSession() {
      const token = getAdminToken();

      if (!token) {
        setCheckingExisting(false);
        return;
      }

      try {
        const me = await getAdminMe();
        router.replace(resolveLandingPath(me.role));
      } catch {
        setCheckingExisting(false);
      }
    }

    void tryExistingAdminSession();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await adminLogin(normalizedEmail, password);
      setAdminToken(result.access_token);

      const me = await getAdminMe();
      router.push(resolveLandingPath(me.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingExisting) {
    return <LoadingState />;
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <section style={heroStyle}>
          <div
            style={{
              position: "absolute",
              right: -120,
              top: -120,
              width: 300,
              height: 300,
              borderRadius: 999,
              background: "rgba(37,99,235,0.12)",
              filter: "blur(2px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "45%",
              bottom: -160,
              width: 340,
              height: 340,
              borderRadius: 999,
              background: "rgba(20,184,166,0.10)",
              filter: "blur(3px)",
            }}
          />

          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={brandLogoStyle}>LW</div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#2563eb",
                }}
              >
                Backoffice
              </div>
              <h1
                style={{
                  margin: "4px 0 0",
                  fontSize: 24,
                  lineHeight: 1.1,
                  letterSpacing: "-0.055em",
                }}
              >
                LeanWorker Admin
              </h1>
              <p style={{ ...mutedStyle, margin: "6px 0 0", fontSize: 14 }}>
                Operations, governance and organization workspace
              </p>
            </div>
          </div>

          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  ...badgeBaseStyle,
                  color: "#1d4ed8",
                  background: "rgba(37,99,235,0.09)",
                  border: "1px solid rgba(37,99,235,0.16)",
                }}
              >
                Platform control
              </span>

              <span
                style={{
                  ...badgeBaseStyle,
                  color: "#15803d",
                  background: "rgba(21,128,61,0.09)",
                  border: "1px solid rgba(21,128,61,0.16)",
                }}
              >
                Organization workspace
              </span>

              <span style={badgeBaseStyle}>Role-based access</span>
            </div>

            <h2
              style={{
                margin: 0,
                maxWidth: 760,
                fontSize: 46,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.075em",
              }}
            >
              Centralized control for platform and organization accounts.
            </h2>

            <p style={{ ...mutedStyle, maxWidth: 700, margin: 0, fontSize: 15 }}>
              Access the LeanWorker backoffice to monitor operations, manage organizations,
              supervise workers, follow bookings, review orchestration signals and govern the
              platform from one premium workspace.
            </p>
          </div>

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <FeatureCard
              title="Platform administration"
              description="Manage levers, workers, organizations, orchestration, reporting and operational governance."
            />

            <FeatureCard
              title="Organization workspace"
              description="Give scoped access to organization accounts with visibility restricted to their workers, bookings and coaching assets."
            />

            <FeatureCard
              title="Secure separate access"
              description="Dedicated authentication for admin and organization users, isolated from the worker application experience."
            />

            <FeatureCard
              title="Operational continuity"
              description="Resume quickly with session persistence and automatic redirection to the right role-based landing page."
            />
          </div>
        </section>

        <section style={panelStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                ...badgeBaseStyle,
                color: "#1d4ed8",
                background: "rgba(37,99,235,0.09)",
                border: "1px solid rgba(37,99,235,0.16)",
              }}
            >
              Secure access
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.08,
                letterSpacing: "-0.065em",
              }}
            >
              Sign in
            </h2>

            <p style={{ ...mutedStyle, margin: 0 }}>
              Use your admin or organization account credentials to enter the LeanWorker
              backoffice.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>Email</span>
              <input
                style={inputStyle}
                placeholder="Admin or organization email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>Password</span>
              <input
                style={inputStyle}
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </label>

            {error ? (
              <div
                style={{
                  borderRadius: 14,
                  padding: "11px 12px",
                  color: "#b91c1c",
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.22)",
                  fontSize: 13,
                  fontWeight: 750,
                  lineHeight: 1.45,
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              style={{
                ...buttonStyle,
                ...(loading || !email.trim() || !password ? disabledButtonStyle : {}),
              }}
              type="submit"
              disabled={loading || !email.trim() || !password}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div
            style={{
              borderRadius: 20,
              padding: 16,
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.16)",
            }}
          >
            <div style={{ ...sectionTitleStyle, fontSize: 14 }}>Access note</div>

            <div style={{ ...mutedStyle, marginTop: 8, fontSize: 13 }}>
              Platform admins are redirected to the control center. Organization accounts are
              automatically redirected to their scoped organization workspace.
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          main > div {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          main {
            padding: 18px !important;
          }

          section {
            border-radius: 22px !important;
          }

          h2 {
            font-size: 34px !important;
          }
        }

        @media (max-width: 620px) {
          section div[style*="repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}