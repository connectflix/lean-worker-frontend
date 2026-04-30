"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, getAdminMe } from "@/lib/api";
import { getAdminToken, setAdminToken } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function resolveLandingPath(role: "admin" | "organization") {
    return role === "organization" ? "/admin/organizations" : "/admin/levers";
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await adminLogin(email, password);
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
    return (
      <main className="admin-login-page">
        <div className="admin-login-shell">
          <section className="admin-login-hero card">
            <div className="admin-login-brand">
              <div className="brand-logo">LW</div>
              <div className="stack" style={{ gap: 2 }}>
                <div className="home-eyebrow">Backoffice</div>
                <h1 className="brand-title">LeanWorker Admin</h1>
                <p className="brand-subtitle">Operations, governance and organization workspace</p>
              </div>
            </div>

            <div className="card-soft row center" style={{ minHeight: 140 }}>
              <div className="loader" />
              <div className="muted">Checking existing admin session...</div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-shell">
        <section className="admin-login-hero card">
          <div className="admin-login-brand">
            <div className="brand-logo">LW</div>
            <div className="stack" style={{ gap: 2 }}>
              <div className="home-eyebrow">Backoffice</div>
              <h1 className="brand-title">LeanWorker Admin</h1>
              <p className="brand-subtitle">Operations, governance and organization workspace</p>
            </div>
          </div>

          <div className="stack" style={{ gap: 18 }}>
            <div className="stack" style={{ gap: 10 }}>
              <h2 className="admin-login-hero-title">
                Centralized control for platform and organization accounts.
              </h2>
              <p className="subtitle" style={{ maxWidth: 640 }}>
                Access the LeanWorker backoffice to monitor operations, manage organizations,
                supervise workers, and run the platform with the same premium workspace
                experience as the rest of the admin environment.
              </p>
            </div>

            <div className="grid grid-2 admin-login-feature-grid">
              <div className="card-soft stack" style={{ gap: 8 }}>
                <div className="section-title">Platform administration</div>
                <div className="muted">
                  Manage levers, workers, orchestration, monitoring, and global backoffice
                  governance.
                </div>
              </div>

              <div className="card-soft stack" style={{ gap: 8 }}>
                <div className="section-title">Organization workspace</div>
                <div className="muted">
                  Provide scoped access to organization accounts with visibility restricted to
                  their own workers and related information.
                </div>
              </div>

              <div className="card-soft stack" style={{ gap: 8 }}>
                <div className="section-title">Secure separate access</div>
                <div className="muted">
                  Dedicated authentication for admin and organization users, isolated from the
                  standard worker experience.
                </div>
              </div>

              <div className="card-soft stack" style={{ gap: 8 }}>
                <div className="section-title">Operational continuity</div>
                <div className="muted">
                  Quickly resume where you left off with session persistence and role-based landing
                  pages.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-login-panel card">
          <div className="stack" style={{ gap: 8 }}>
            <div className="badge" style={{ width: "fit-content" }}>
              Secure access
            </div>
            <h2 className="title" style={{ fontSize: 30 }}>
              Sign in
            </h2>
            <p className="subtitle">
              Use your admin or organization account credentials to enter the LeanWorker
              backoffice.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="stack" style={{ gap: 14 }}>
            <label className="stack admin-login-field">
              <span className="admin-login-label">Email</span>
              <input
                className="input admin-login-input"
                placeholder="Admin or organization email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="stack admin-login-field">
              <span className="admin-login-label">Password</span>
              <input
                className="input admin-login-input"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error ? <div className="admin-login-error">{error}</div> : null}

            <button
              className="button admin-login-submit"
              type="submit"
              disabled={loading || !email || !password}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="card-soft stack" style={{ gap: 6 }}>
            <div className="section-title" style={{ fontSize: 14 }}>
              Access note
            </div>
            <div className="muted">
              Platform admins can access the full control center. Organization accounts are
              automatically redirected to their scoped organization workspace.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}