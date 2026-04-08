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

  useEffect(() => {
    async function tryExistingAdminSession() {
      const token = getAdminToken();
      if (!token) {
        setCheckingExisting(false);
        return;
      }

      try {
        await getAdminMe();
        router.replace("/admin/levers");
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
      router.push("/admin/levers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingExisting) {
    return (
      <main className="page">
        <div className="container stack" style={{ maxWidth: 520 }}>
          <div className="card">Checking existing admin session...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container stack" style={{ maxWidth: 520 }}>
        <div className="card stack">
          <h1 className="title">Admin Login</h1>
          <p className="subtitle">
            Separate access for platform administration. LinkedIn user accounts cannot access this area.
          </p>

          <form onSubmit={handleSubmit} className="stack">
            <input
              className="textarea"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <input
              className="textarea"
              placeholder="Admin password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && <div style={{ color: "var(--danger)" }}>{error}</div>}

            <button className="button" type="submit" disabled={loading || !email || !password}>
              {loading ? "Signing in..." : "Sign in as admin"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}