"use client";

import { useState } from "react";
import { getOrganizationAccessCopy } from "@/lib/i18n/organization-access";
import type { AdminOrganizationAccessAccount } from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

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
  emptyLabel,
}: {
  value?: string | null;
  visible: boolean;
  emptyLabel: string;
}) {
  if (!value) {
    return <span className="muted">{emptyLabel}</span>;
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
  const { uiLanguage } = useAdminUiLanguage();
  const copy = getOrganizationAccessCopy(uiLanguage);

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
      <div className="stack" style={{ gap: 16, minWidth: 0 }}>
        <section
          data-testid="organization-access-summary"
          className="card stack"
          style={{
            gap: 16,
            minWidth: 0,
            padding: 20,
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
          }}
        >
          <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">{copy.title}</div>
            <div className="muted">
              {copy.description}
            </div>
          </div>

          {editingOrganizationId ? (
            <span className="badge primary">
              {copy.organizationBadge(editingOrganizationId)}
            </span>
          ) : (
            <span className="badge warning">{copy.noOrganizationSelected}</span>
          )}
        </div>

        <div className="grid grid-3">
          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">{copy.organization}</div>
            <div className="admin-metric-value" style={{ fontSize: 22 }}>
              {editingOrganizationId ? `#${editingOrganizationId}` : "—"}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">{copy.contactEmail}</div>
            <div
              style={{
                fontWeight: 700,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={normalizedContactEmail || copy.notConfigured}
            >
              {normalizedContactEmail || copy.notConfigured}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">{copy.accessStatus}</div>
            <div>
              {accessAccountResult ? (
                <span className="badge success">{copy.generated}</span>
              ) : normalizedContactEmail ? (
                <span className="badge warning">{copy.readyToGenerate}</span>
              ) : (
                <span className="badge danger">{copy.emailRequired}</span>
              )}
            </div>
          </div>
        </div>
        </section>

        <section
          data-testid="organization-access-configuration"
          className="card stack"
          style={{
            gap: 14,
            minWidth: 0,
            padding: 20,
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
          }}
        >
        {!selectedOrganizationId || !editingOrganizationId ? (
          <div className="card-soft stack" style={{ gap: 8 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              {copy.organizationRequired}
            </div>
            <div className="muted">
              {copy.organizationRequiredDescription}
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
                  {copy.loginConfiguration}
                </div>

                <div className="muted">
                  {copy.loginConfigurationDescription}
                </div>
              </div>

              {normalizedContactEmail ? (
                <span className="badge primary">{copy.emailAvailable}</span>
              ) : (
                <span className="badge danger">{copy.missingEmail}</span>
              )}
            </div>

            <div className="card-soft stack" style={{ gap: 6, background: "#ffffff" }}>
              <div className="muted">{copy.loginEmail}</div>
              <div
                style={{
                  fontWeight: 800,
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                }}
              >
                {normalizedContactEmail || copy.noContactEmailConfigured}
              </div>
            </div>

            {!normalizedContactEmail ? (
              <div className="muted" style={{ color: "var(--danger)" }}>
                {copy.missingEmailDescription}
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
                  ? copy.generatingAccount
                  : accessAccountResult
                    ? copy.resetOrganizationAccount
                    : copy.createOrganizationAccount}
              </button>

              {accessAccountResult ? (
                <span className="badge warning">{copy.resetsPassword}</span>
              ) : null}
            </div>
          </div>
        )}
        </section>
      </div>

      <section
        data-testid="organization-access-credentials"
        className="card stack"
        style={{
          gap: 16,
          minWidth: 0,
          position: "sticky",
          top: 92,
        }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">{copy.resultTitle}</div>
          <div className="muted">
            {copy.resultDescription}
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
                {copy.accountGenerated}
              </div>

              <span className="badge success">{copy.shownOnce}</span>
            </div>

            <div style={{ fontWeight: 800, lineHeight: 1.45 }}>
              {accessAccountResult.message}
            </div>

            <div className="card-soft stack" style={{ gap: 8, background: "#ffffff" }}>
              <div className="muted">{copy.loginEmail}</div>
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
                <div className="muted">{copy.temporaryPassword}</div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                    style={{ minHeight: 34, padding: "7px 11px", fontSize: 12 }}
                  >
                    {passwordVisible ? copy.hide : copy.show}
                  </button>

                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => void handleCopyPassword()}
                    style={{ minHeight: 34, padding: "7px 11px", fontSize: 12 }}
                  >
                    {copyState === "copied"
                      ? copy.copied
                      : copyState === "failed"
                        ? copy.copyFailed
                        : copy.copyPassword}
                  </button>
                </div>
              </div>

              <MaskedPassword
                value={accessAccountResult.temporary_password}
                visible={passwordVisible}
                emptyLabel={copy.noTemporaryPassword}
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
                {copy.secureShareWarning}
              </div>
            </div>
          </div>
        ) : (
          <div className="card-soft stack" style={{ gap: 8 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              {copy.noCredentialTitle}
            </div>
            <div className="muted">
              {copy.noCredentialDescription}
            </div>
          </div>
        )}

        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            {copy.securityNote}
          </div>

          <div className="muted">
            {copy.securityDescription}
          </div>
        </div>
      </section>
    </div>
  );
}