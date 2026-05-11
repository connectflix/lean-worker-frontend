"use client";

import type {
  AdminOrganization,
  AdminOrganizationType,
} from "@/lib/types";

type OrganizationFormState = {
  name: string;
  code: string;
  organization_type: AdminOrganizationType;
  description: string;
  contact_email: string;
  contact_phone: string;
  calendly_event_type_uri: string;
  is_active: boolean;
};

type OrganizationAdminTabProps = {
  organizations: AdminOrganization[];
  selectedOrganizationId: number | null;
  editingOrganizationId: number | null;
  form: OrganizationFormState;

  saving: boolean;
  detailLoading: boolean;

  onOpenOrganization: (organizationId: number) => void;
  onSubmit: (event: React.FormEvent) => void;
  onFormChange: (form: OrganizationFormState) => void;
  onNewOrganization: () => void;

  getOrganizationTypeLabel: (type?: string | null) => string;
  getRequiredSubscriptionForOrganizationType: (
    type?: string | null,
  ) => "classique" | "flix" | "executif";
};

export function OrganizationAdminTab({
  organizations,
  selectedOrganizationId,
  editingOrganizationId,
  form,
  saving,
  detailLoading,
  onOpenOrganization,
  onSubmit,
  onFormChange,
  onNewOrganization,
  getOrganizationTypeLabel,
  getRequiredSubscriptionForOrganizationType,
}: OrganizationAdminTabProps) {
  return (
    <div className="grid grid-2">
      <div className="card stack">
        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="section-title">Organizations</div>
          <div className="muted">{organizations.length} organization(s)</div>
        </div>

        {organizations.length === 0 ? (
          <div className="muted">No organizations found.</div>
        ) : (
          <div
            className="stack"
            style={{ maxHeight: "52vh", overflowY: "auto", paddingRight: 6, gap: 12 }}
          >
            {organizations.map((organization) => (
              <button
                key={organization.id}
                type="button"
                className="card-soft stack"
                onClick={() => onOpenOrganization(organization.id)}
                style={{
                  gap: 8,
                  textAlign: "left",
                  cursor: "pointer",
                  border:
                    selectedOrganizationId === organization.id
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                }}
              >
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">#{organization.id}</span>

                  {organization.code ? (
                    <span className="badge">{organization.code}</span>
                  ) : null}

                  <span className="badge">
                    {getOrganizationTypeLabel(organization.organization_type)}
                  </span>

                  <span className="badge">
                    {organization.is_active ? "active" : "inactive"}
                  </span>
                </div>

                <div className="section-title" style={{ fontSize: 16 }}>
                  {organization.name}
                </div>

                <div className="muted">
                  Required worker subscription:{" "}
                  {getRequiredSubscriptionForOrganizationType(
                    organization.organization_type,
                  )}
                </div>

                {organization.contact_email ? (
                  <div className="muted">{organization.contact_email}</div>
                ) : null}

                {organization.calendly_event_type_uri ? (
                  <div
                    className="muted"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={organization.calendly_event_type_uri}
                  >
                    Calendly event type configured
                  </div>
                ) : (
                  <div className="muted" style={{ color: "#b45309" }}>
                    No Calendly event type configured
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card stack">
        <div className="section-title">
          {editingOrganizationId
            ? `Edit organization #${editingOrganizationId}`
            : "Create organization"}
        </div>

        <form onSubmit={onSubmit} className="stack">
          <label className="stack">
            <strong>Name</strong>
            <input
              className="input"
              value={form.name}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  name: event.target.value,
                })
              }
              disabled={detailLoading}
            />
          </label>

          <label className="stack">
            <strong>Business ID</strong>
            <input
              className="input"
              value={form.code || "Generated automatically"}
              disabled
              placeholder="Generated automatically"
              style={{ cursor: "not-allowed", background: "rgba(15,23,42,0.04)" }}
            />
            <div className="muted">
              System-generated identifier. It follows the ORG-xxxxxx convention.
            </div>
          </label>

          <label className="stack">
            <strong>Organization type</strong>
            <select
              className="select"
              value={form.organization_type}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  organization_type: event.target.value as AdminOrganizationType,
                })
              }
              disabled={detailLoading}
            >
              <option value="agent_flix">agent flix — workers classique only</option>
              <option value="agent_premium">agent premium — workers flix only</option>
              <option value="agent_de_reve">agent de rêve — workers executif only</option>
            </select>
          </label>

          <label className="stack">
            <strong>Description</strong>
            <textarea
              className="textarea"
              value={form.description}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  description: event.target.value,
                })
              }
              disabled={detailLoading}
            />
          </label>

          <label className="stack">
            <strong>Contact email</strong>
            <input
              className="input"
              value={form.contact_email}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  contact_email: event.target.value,
                })
              }
              disabled={detailLoading}
            />
          </label>

          <label className="stack">
            <strong>Contact phone</strong>
            <input
              className="input"
              value={form.contact_phone}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  contact_phone: event.target.value,
                })
              }
              disabled={detailLoading}
            />
          </label>

          <label className="stack">
            <strong>Calendly Event Type URI</strong>
            <input
              className="input"
              value={form.calendly_event_type_uri}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  calendly_event_type_uri: event.target.value,
                })
              }
              disabled={detailLoading}
              placeholder="https://api.calendly.com/event_types/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
            <div className="muted">
              Dedicated Calendly event type used to restrict this organization to its own bookings.
            </div>
          </label>

          <label className="row" style={{ gap: 8 }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  is_active: event.target.checked,
                })
              }
              disabled={detailLoading}
            />
            <strong>Active</strong>
          </label>

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="button" type="submit" disabled={saving || detailLoading}>
              {saving
                ? "Saving..."
                : editingOrganizationId
                  ? "Save organization"
                  : "Create organization"}
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={onNewOrganization}
              disabled={detailLoading}
            >
              New organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}