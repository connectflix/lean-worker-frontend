"use client";

import { useState } from "react";
import type { AdminOrganizationAccessAccount } from "@/lib/types";

type OrganizationAccessTabProps = {
  selectedOrganizationId: number | null;
  contactEmail: string;
  editingOrganizationId: number | null;
  accessAccountSaving: boolean;
  detailLoading: boolean;
  saving: boolean;
  accessAccountResult: AdminOrganizationAccessAccount | null;
  onCreateOrResetAccessAccount: () => void;
};

function MaskedPassword({
  value,
  visible,
}: {
  value?: string | null;
  visible: boolean;
}) {
  if (!value) {
    return <span className="muted">No temporary password returned.</span>;
  }

  return (
    <code
      style={{
        display: "inline-flex",
        maxWidth: "100%",
        overflowX: "auto",
        padding: "8px 10px",
        borderRadius: 10,
        background: "rgba(17,24,39,0.06)",
        border: "1px solid var(--admin-border)",
        color: "var(--admin-ink)",
        fontSize: 13,
        lineHeight: 1.35,
        whiteSpace: "nowrap",
      }}
    >
      {visible ? value : "••••••••••••••••"}
    </code>
  );
}

export function OrganizationAccessTab({
  selectedOrganizationId,
  contactEmail,
  editingOrganizationId,
  accessAccountSaving,
  detailLoading,
  saving,
  accessAccountResult,
  onCreateOrResetAccessAccount,
}: OrganizationAccessTabProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const normalizedContactEmail = contactEmail.trim();
  const canGenerateAccount =
    Boolean(selectedOrganizationId) &&
    Boolean(editingOrganizationId) &&
    Boolean(normalizedContactEmail) &&
    !accessAccountSaving &&
    !detailLoading &&
    !saving;

  async function handleCopyPassword() {
    if (!accessAccountResult?.temporary_password) return;

    try {
      await navigator.clipboard.writeText(accessAccountResult.temporary_password);
      setCopyState("copied");

      window.setTimeout(() => {
        setCopyState("idle");
      }, 1800);
    } catch {
      setCopyState("failed");

      window.setTimeout(() => {
        setCopyState("idle");
      }, 1800);
    }
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(360px, 0.95fr)",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Organization access account</div>
            <div className="muted">
              Create or reset the organization login account. The account uses the organization
              contact email and generates a temporary password shown once.
            </div>
          </div>

          {editingOrganizationId ? (
            <span className="badge primary">organization #{editingOrganizationId}</span>
          ) : (
            <span className="badge warning">no organization selected</span>
          )}
        </div>

        <div className="grid grid-3">
          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">Organization</div>
            <div className="admin-metric-value" style={{ fontSize: 22 }}>
              {editingOrganizationId ? `#${editingOrganizationId}` : "—"}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">Contact email</div>
            <div
              style={{
                fontWeight: 700,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={normalizedContactEmail || "Not configured"}
            >
              {normalizedContactEmail || "Not configured"}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">Access status</div>
            <div>
              {accessAccountResult ? (
                <span className="badge success">generated</span>
              ) : normalizedContactEmail ? (
                <span className="badge warning">ready to generate</span>
              ) : (
                <span className="badge danger">email required</span>
              )}
            </div>
          </div>
        </div>

        {!selectedOrganizationId || !editingOrganizationId ? (
          <div className="card-soft stack" style={{ gap: 8 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              Organization required
            </div>
            <div className="muted">
              Select and save an organization before creating an access account.
            </div>
          </div>
        ) : (
          <div
            className="card-soft stack"
            style={{
              gap: 12,
              border: normalizedContactEmail
                ? "1px solid rgba(94,106,210,0.18)"
                : "1px solid rgba(198,40,40,0.20)",
              background: normalizedContactEmail
                ? "rgba(94,106,210,0.06)"
                : "var(--danger-soft)",
            }}
          >
            <div className="row space-between" style={{ gap: 10, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title" style={{ fontSize: 15 }}>
                  Login configuration
                </div>

                <div className="muted">
                  This action creates or resets the organization login account using the contact
                  email.
                </div>
              </div>

              {normalizedContactEmail ? (
                <span className="badge primary">email available</span>
              ) : (
                <span className="badge danger">missing email</span>
              )}
            </div>

            <div className="card-soft stack" style={{ gap: 6, background: "#ffffff" }}>
              <div className="muted">Login email</div>
              <div
                style={{
                  fontWeight: 800,
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                }}
              >
                {normalizedContactEmail || "No contact email configured"}
              </div>
            </div>

            {!normalizedContactEmail ? (
              <div className="muted" style={{ color: "var(--danger)" }}>
                Add a contact email in the Organization tab before creating an access account.
              </div>
            ) : null}

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button
                className="button"
                type="button"
                onClick={onCreateOrResetAccessAccount}
                disabled={!canGenerateAccount}
              >
                {accessAccountSaving
                  ? "Generating account..."
                  : accessAccountResult
                    ? "Reset organization account"
                    : "Create organization account"}
              </button>

              {accessAccountResult ? (
                <span className="badge warning">resets password</span>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div
        className="card stack"
        style={{
          gap: 16,
          minWidth: 0,
          position: "sticky",
          top: 92,
        }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">Access result</div>
          <div className="muted">
            Temporary credentials are displayed here only after generation or reset.
          </div>
        </div>

        {accessAccountResult ? (
          <div
            className="card-soft stack"
            style={{
              gap: 14,
              background: "var(--success-soft)",
              border: "1px solid rgba(21,128,61,0.22)",
            }}
          >
            <div className="row space-between" style={{ gap: 10, flexWrap: "wrap" }}>
              <div className="section-title" style={{ fontSize: 15 }}>
                Access account generated
              </div>

              <span className="badge success">shown once</span>
            </div>

            <div style={{ fontWeight: 800, lineHeight: 1.45 }}>
              {accessAccountResult.message}
            </div>

            <div className="card-soft stack" style={{ gap: 8, background: "#ffffff" }}>
              <div className="muted">Login email</div>
              <div
                style={{
                  fontWeight: 800,
                  wordBreak: "break-word",
                  lineHeight: 1.35,
                }}
              >
                {accessAccountResult.email}
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 10, background: "#ffffff" }}>
              <div className="row space-between" style={{ gap: 10, flexWrap: "wrap" }}>
                <div className="muted">Temporary password</div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                    style={{ minHeight: 34, padding: "7px 11px", fontSize: 12 }}
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>

                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => void handleCopyPassword()}
                    style={{ minHeight: 34, padding: "7px 11px", fontSize: 12 }}
                  >
                    {copyState === "copied"
                      ? "Copied"
                      : copyState === "failed"
                        ? "Copy failed"
                        : "Copy password"}
                  </button>
                </div>
              </div>

              <MaskedPassword
                value={accessAccountResult.temporary_password}
                visible={passwordVisible}
              />
            </div>

            <div
              className="card-soft"
              style={{
                border: "1px solid rgba(180,83,9,0.20)",
                background: "var(--warning-soft)",
              }}
            >
              <div className="muted" style={{ color: "var(--warning)" }}>
                Share this password securely. It will not be visible again after you leave this
                result.
              </div>
            </div>
          </div>
        ) : (
          <div className="card-soft stack" style={{ gap: 8 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              No credential generated yet
            </div>
            <div className="muted">
              Once you create or reset an organization account, the email and temporary password
              will appear here.
            </div>
          </div>
        )}

        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Security note
          </div>

          <div className="muted">
            Use this action only when onboarding an organization user or when the organization
            contact needs a password reset. The password should be sent through a secure channel.
          </div>
        </div>
      </div>
    </div>
  );
}