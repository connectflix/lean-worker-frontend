"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

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
      subtitle="Update your admin or organization account password."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
    >
      {loading ? (
        <div className="card">Loading account information...</div>
      ) : (
        <div className="grid grid-2">
          <div className="card stack">
            <div className="section-title">Account security</div>

            <div className="muted">
              Use this form to update your password. After the change, continue using the new
              password for future admin logins.
            </div>

            {admin ? (
              <div className="card-soft stack" style={{ gap: 8 }}>
                <div>
                  <strong>Email:</strong> {admin.email}
                </div>
                <div>
                  <strong>Role:</strong> {admin.role}
                </div>
                {admin.organization_id ? (
                  <div>
                    <strong>Organization ID:</strong> {admin.organization_id}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="card stack">
            <div className="section-title">Change password</div>

            <form className="stack" onSubmit={handleSubmit}>
              <label className="stack">
                <strong>Current password</strong>
                <input
                  className="input"
                  type="password"
                  value={form.current_password}
                  onChange={(event) => patchForm("current_password", event.target.value)}
                  autoComplete="current-password"
                  disabled={saving}
                />
              </label>

              <label className="stack">
                <strong>New password</strong>
                <input
                  className="input"
                  type="password"
                  value={form.new_password}
                  onChange={(event) => patchForm("new_password", event.target.value)}
                  autoComplete="new-password"
                  disabled={saving}
                />
                <div className="muted">Minimum 8 characters.</div>
              </label>

              <label className="stack">
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
                />
              </label>

              {error ? (
                <div className="card-soft" style={{ color: "var(--danger)" }}>
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

              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                <button
                  className="button"
                  type="submit"
                  disabled={saving || Boolean(validationError)}
                >
                  {saving ? "Updating password..." : "Update password"}
                </button>

                <button
                  className="button ghost"
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setError(null);
                    setSuccessMessage(null);
                  }}
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