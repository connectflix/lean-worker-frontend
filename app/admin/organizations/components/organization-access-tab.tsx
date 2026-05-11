"use client";

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
  const normalizedContactEmail = contactEmail.trim();

  return (
    <div className="card stack" style={{ gap: 16 }}>
      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">Organization access account</div>
          <div className="muted">
            Create or reset the organization login account. The account uses the organization
            contact email and generates a temporary password shown once.
          </div>
        </div>

        {editingOrganizationId ? (
          <span className="badge">organization #{editingOrganizationId}</span>
        ) : null}
      </div>

      {!selectedOrganizationId || !editingOrganizationId ? (
        <div className="card-soft">
          <div className="muted">
            Select and save an organization before creating an access account.
          </div>
        </div>
      ) : (
        <>
          <div
            className="card-soft stack"
            style={{
              gap: 10,
              border: "1px solid rgba(59,130,246,0.25)",
              background: "rgba(59,130,246,0.06)",
            }}
          >
            <div className="section-title" style={{ fontSize: 15 }}>
              Login configuration
            </div>

            <div>
              <strong>Login email:</strong>{" "}
              {normalizedContactEmail || "No contact email configured"}
            </div>

            <div className="muted">
              This action creates or resets the organization login account using the contact email.
              The temporary password is shown once and must be shared securely.
            </div>

            <button
              className="button"
              type="button"
              onClick={onCreateOrResetAccessAccount}
              disabled={
                accessAccountSaving ||
                detailLoading ||
                saving ||
                !selectedOrganizationId ||
                !normalizedContactEmail
              }
            >
              {accessAccountSaving
                ? "Generating account..."
                : "Create / reset organization account"}
            </button>

            {!normalizedContactEmail ? (
              <div className="muted" style={{ color: "var(--danger)" }}>
                Add a contact email in the Organization tab before creating an access account.
              </div>
            ) : null}
          </div>

          {accessAccountResult ? (
            <div
              className="card-soft stack"
              style={{
                gap: 8,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
              }}
            >
              <div className="section-title" style={{ fontSize: 15 }}>
                Access account generated
              </div>

              <div style={{ fontWeight: 800 }}>{accessAccountResult.message}</div>

              <div>
                <strong>Login email:</strong> {accessAccountResult.email}
              </div>

              <div>
                <strong>Temporary password:</strong>{" "}
                <code
                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    background: "rgba(15,23,42,0.08)",
                  }}
                >
                  {accessAccountResult.temporary_password}
                </code>
              </div>

              <div className="muted">
                Share this password securely. It will not be visible again after you leave this
                result.
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}