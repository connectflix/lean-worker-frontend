"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { changeAdminPassword, getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

type FormState = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

const EMPTY_FORM: FormState = {
  current_password: "",
  new_password: "",
  confirm_new_password: "",
};

export default function AdminChangePasswordPage() {
  return (
    <AdminGuard>
      <AdminChangePasswordContent />
    </AdminGuard>
  );
}

function normalizeRoleLabel(role?: string | null): string {
  if (role === "organization") return "Organization account";
  return "Platform admin";
}

function getPasswordStrengthLabel(password: string): {
  label: string;
  status: "empty" | "weak" | "medium" | "strong";
  score: number;
} {
  if (!password) {
    return {
      label: "Not started",
      status: "empty",
      score: 0,
    };
  }

  let score = 0;

  if (password.length >= 8) score += 35;
  if (password.length >= 12) score += 20;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  const normalizedScore = Math.min(100, score);

  if (normalizedScore >= 75) {
    return {
      label: "Strong",
      status: "strong",
      score: normalizedScore,
    };
  }

  if (normalizedScore >= 50) {
    return {
      label: "Medium",
      status: "medium",
      score: normalizedScore,
    };
  }

  return {
    label: "Weak",
    status: "weak",
    score: normalizedScore,
  };
}

function getStrengthColor(status: "empty" | "weak" | "medium" | "strong"): string {
  if (status === "strong") return "#15803d";
  if (status === "medium") return "#b45309";
  if (status === "weak") return "#b91c1c";
  return "#64748b";
}

function AdminChangePasswordContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await getAdminMe();
        setAdmin(me);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin profile.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const passwordStrength = useMemo(
    () => getPasswordStrengthLabel(form.new_password),
    [form.new_password],
  );

  const validationError = useMemo(() => {
    if (!form.current_password.trim()) {
      return "Current password is required.";
    }

    if (!form.new_password.trim()) {
      return "New password is required.";
    }

    if (form.new_password.length < 8) {
      return "New password must contain at least 8 characters.";
    }

    if (form.new_password === form.current_password) {
      return "New password must be different from the current password.";
    }

    if (!form.confirm_new_password.trim()) {
      return "Password confirmation is required.";
    }

    if (form.new_password !== form.confirm_new_password) {
      return "Password confirmation does not match.";
    }

    return null;
  }, [form]);

  const canSubmit = !saving && !validationError;

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setError(null);
    setSuccessMessage(null);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await changeAdminPassword({
        current_password: form.current_password,
        new_password: form.new_password,
        confirm_new_password: form.confirm_new_password,
      });

      setSuccessMessage(result.message || "Password updated successfully.");
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      activeHref="/admin/change-password"
      title="Change password"
      subtitle="Update your admin or organization account password securely."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {loading ? (
        <div className="card stack" style={{ gap: 12 }}>
          <div className="section-title">Loading account security...</div>
          <div className="muted">Preparing your account information.</div>
        </div>
      ) : (
        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card stack" style={{ gap: 16 }}>
            <div className="stack" style={{ gap: 6 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge primary">Account security</span>
                <span className="badge">{normalizeRoleLabel(admin?.role)}</span>
              </div>

              <div className="section-title">Secure your backoffice access</div>

              <div className="muted" style={{ lineHeight: 1.65 }}>
                Use this page to update your password. After a successful change, your new
                password must be used for future LeanWorker backoffice logins.
              </div>
            </div>

            {admin ? (
              <div
                className="card-soft stack"
                style={{
                  gap: 10,
                  background: "rgba(59,130,246,0.06)",
                  border: "1px solid rgba(59,130,246,0.16)",
                }}
              >
                <div className="section-title" style={{ fontSize: 15 }}>
                  Current account
                </div>

                <div className="grid grid-2">
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="muted">Email</div>
                    <strong style={{ wordBreak: "break-word" }}>{admin.email}</strong>
                  </div>

                  <div className="stack" style={{ gap: 4 }}>
                    <div className="muted">Role</div>
                    <strong>{normalizeRoleLabel(admin.role)}</strong>
                  </div>

                  {admin.organization_name ? (
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Organization</div>
                      <strong>{admin.organization_name}</strong>
                    </div>
                  ) : null}

                  {admin.organization_id ? (
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Organization ID</div>
                      <strong>#{admin.organization_id}</strong>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="card-soft stack" style={{ gap: 10 }}>
              <div className="section-title" style={{ fontSize: 15 }}>
                Password rules
              </div>

              <div className="muted" style={{ lineHeight: 1.65 }}>
                Your new password must contain at least 8 characters and must be different from the
                current password. For stronger protection, use a longer password with uppercase
                letters, numbers and special characters.
              </div>
            </div>
          </div>

          <div
            className="card stack"
            style={{
              gap: 16,
              border: "1px solid rgba(15,23,42,0.08)",
              boxShadow: "0 18px 54px rgba(15,23,42,0.08)",
            }}
          >
            <div className="stack" style={{ gap: 6 }}>
              <div className="badge primary" style={{ width: "fit-content" }}>
                Password update
              </div>

              <div className="section-title">Change password</div>

              <div className="muted">
                Enter your current password, then define and confirm the new one.
              </div>
            </div>

            <form className="stack" onSubmit={handleSubmit} style={{ gap: 14 }}>
              <label className="stack" style={{ gap: 6 }}>
                <strong>Current password</strong>
                <input
                  className="input"
                  type="password"
                  value={form.current_password}
                  onChange={(event) => patchForm("current_password", event.target.value)}
                  autoComplete="current-password"
                  disabled={saving}
                  placeholder="Enter current password"
                />
              </label>

              <label className="stack" style={{ gap: 6 }}>
                <strong>New password</strong>
                <input
                  className="input"
                  type="password"
                  value={form.new_password}
                  onChange={(event) => patchForm("new_password", event.target.value)}
                  autoComplete="new-password"
                  disabled={saving}
                  placeholder="Enter new password"
                />

                <div className="stack" style={{ gap: 6 }}>
                  <div className="row space-between" style={{ gap: 8 }}>
                    <div className="muted">Minimum 8 characters.</div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: getStrengthColor(passwordStrength.status),
                      }}
                    >
                      {passwordStrength.label}
                    </div>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(100,116,139,0.14)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${passwordStrength.score}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: getStrengthColor(passwordStrength.status),
                        transition: "width 180ms ease",
                      }}
                    />
                  </div>
                </div>
              </label>

              <label className="stack" style={{ gap: 6 }}>
                <strong>Confirm new password</strong>
                <input
                  className="input"
                  type="password"
                  value={form.confirm_new_password}
                  onChange={(event) =>
                    patchForm("confirm_new_password", event.target.value)
                  }
                  autoComplete="new-password"
                  disabled={saving}
                  placeholder="Confirm new password"
                />
              </label>

              {validationError && !error ? (
                <div
                  className="card-soft"
                  style={{
                    color: "#92400e",
                    background: "rgba(245,158,11,0.10)",
                    border: "1px solid rgba(245,158,11,0.22)",
                  }}
                >
                  {validationError}
                </div>
              ) : null}

              {error ? (
                <div
                  className="card-soft"
                  style={{
                    color: "var(--danger)",
                    background: "rgba(239,68,68,0.10)",
                    border: "1px solid rgba(239,68,68,0.22)",
                  }}
                >
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div
                  className="card-soft"
                  style={{
                    color: "var(--success)",
                    border: "1px solid rgba(21,128,61,0.22)",
                    background: "rgba(21,128,61,0.08)",
                  }}
                >
                  {successMessage}
                </div>
              ) : null}

              <div
                className="row"
                style={{
                  flexWrap: "wrap",
                  gap: 8,
                  paddingTop: 4,
                }}
              >
                <button className="button" type="submit" disabled={!canSubmit}>
                  {saving ? "Updating password..." : "Update password"}
                </button>

                <button
                  className="button ghost"
                  type="button"
                  disabled={saving}
                  onClick={resetForm}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}