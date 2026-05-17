"use client";

import { useMemo, useState } from "react";
import type { AdminOrganization, AdminOrganizationType } from "@/lib/types";

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

function getOrganizationTypeDescription(type?: string | null): string {
  if (type === "agent_premium") {
    return "Premium organization workspace for workers on the Flix subscription pack.";
  }

  if (type === "agent_de_reve") {
    return "Executive organization workspace for workers on the Executif subscription pack.";
  }

  return "Standard organization workspace for workers on the Classique subscription pack.";
}

function getOrganizationTypeTone(type?: string | null): {
  border: string;
  background: string;
  color: string;
} {
  if (type === "agent_premium") {
    return {
      border: "rgba(94,106,210,0.22)",
      background: "rgba(94,106,210,0.08)",
      color: "var(--admin-accent)",
    };
  }

  if (type === "agent_de_reve") {
    return {
      border: "rgba(180,83,9,0.22)",
      background: "rgba(180,83,9,0.08)",
      color: "var(--warning)",
    };
  }

  return {
    border: "rgba(0,102,204,0.18)",
    background: "var(--primary-soft)",
    color: "var(--primary-hover)",
  };
}

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
  const [organizationSearch, setOrganizationSearch] = useState("");

  const filteredOrganizations = useMemo(() => {
    const query = organizationSearch.trim().toLowerCase();

    if (!query) return organizations;

    return organizations.filter((organization) => {
      return (
        organization.name.toLowerCase().includes(query) ||
        (organization.code || "").toLowerCase().includes(query) ||
        (organization.contact_email || "").toLowerCase().includes(query) ||
        getOrganizationTypeLabel(organization.organization_type).toLowerCase().includes(query)
      );
    });
  }, [organizations, organizationSearch, getOrganizationTypeLabel]);

  const activeOrganizations = organizations.filter((organization) => organization.is_active);
  const inactiveOrganizations = organizations.filter((organization) => !organization.is_active);
  const selectedTypeTone = getOrganizationTypeTone(form.organization_type);

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "minmax(360px, 0.92fr) minmax(0, 1.08fr)",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div
        className="card stack"
        style={{
          gap: 16,
          minWidth: 0,
          maxHeight: "calc(100vh - 250px)",
          overflow: "hidden",
        }}
      >
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Organizations</div>
            <div className="muted">
              Create, select, and configure organization workspaces.
            </div>
          </div>

          <button
            className="button"
            type="button"
            onClick={onNewOrganization}
            disabled={detailLoading}
            style={{ minHeight: 38 }}
          >
            New organization
          </button>
        </div>

        <div className="grid grid-3">
          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">Total</div>
            <div className="admin-metric-value" style={{ fontSize: 24 }}>
              {organizations.length}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">Active</div>
            <div className="admin-metric-value" style={{ fontSize: 24, color: "var(--success)" }}>
              {activeOrganizations.length}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">Inactive</div>
            <div className="admin-metric-value" style={{ fontSize: 24, color: "var(--warning)" }}>
              {inactiveOrganizations.length}
            </div>
          </div>
        </div>

        <label className="stack" style={{ gap: 6 }}>
          <span className="muted">Search organizations</span>
          <input
            className="input"
            value={organizationSearch}
            onChange={(event) => setOrganizationSearch(event.target.value)}
            placeholder="Search by name, business ID, email, or type..."
          />
        </label>

        {organizations.length === 0 ? (
          <div className="card-soft muted">No organizations found.</div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="card-soft muted">No organization matches this search.</div>
        ) : (
          <div
            className="stack scroll-panel"
            style={{
              gap: 10,
              flex: 1,
              maxHeight: "calc(100vh - 520px)",
              minHeight: 280,
            }}
          >
            {filteredOrganizations.map((organization) => {
              const isSelected = selectedOrganizationId === organization.id;
              const tone = getOrganizationTypeTone(organization.organization_type);

              return (
                <button
                  key={organization.id}
                  type="button"
                  className="card-soft stack"
                  onClick={() => onOpenOrganization(organization.id)}
                  style={{
                    gap: 10,
                    textAlign: "left",
                    cursor: "pointer",
                    border: isSelected
                      ? "1px solid var(--admin-accent)"
                      : "1px solid var(--admin-border)",
                    background: isSelected ? "rgba(94,106,210,0.07)" : "var(--admin-surface-muted)",
                    boxShadow: "none",
                  }}
                >
                  <div
                    className="row space-between"
                    style={{ gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}
                  >
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge">#{organization.id}</span>

                      {organization.code ? (
                        <span className="badge">{organization.code}</span>
                      ) : null}

                      <span
                        className="badge"
                        style={{
                          borderColor: tone.border,
                          background: tone.background,
                          color: tone.color,
                        }}
                      >
                        {getOrganizationTypeLabel(organization.organization_type)}
                      </span>

                      <span className={organization.is_active ? "badge success" : "badge warning"}>
                        {organization.is_active ? "active" : "inactive"}
                      </span>
                    </div>

                    {isSelected ? <span className="badge primary">selected</span> : null}
                  </div>

                  <div className="stack" style={{ gap: 4 }}>
                    <div
                      className="section-title"
                      style={{
                        fontSize: 16,
                        lineHeight: 1.25,
                        wordBreak: "break-word",
                      }}
                    >
                      {organization.name}
                    </div>

                    <div className="muted">
                      Required worker subscription:{" "}
                      <strong>
                        {getRequiredSubscriptionForOrganizationType(
                          organization.organization_type,
                        )}
                      </strong>
                    </div>

                    {organization.contact_email ? (
                      <div
                        className="muted"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={organization.contact_email}
                      >
                        {organization.contact_email}
                      </div>
                    ) : null}
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {organization.calendly_event_type_uri ? (
                      <span className="badge success">Calendly configured</span>
                    ) : (
                      <span className="badge warning">Calendly missing</span>
                    )}

                    {organization.contact_email ? (
                      <span className="badge success">Contact email</span>
                    ) : (
                      <span className="badge warning">No contact email</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="card stack"
        style={{
          gap: 16,
          minWidth: 0,
          maxHeight: "calc(100vh - 250px)",
          overflowY: "auto",
          overflowX: "hidden",
          position: "sticky",
          top: 92,
        }}
      >
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">
              {editingOrganizationId
                ? `Edit organization #${editingOrganizationId}`
                : "Create organization"}
            </div>

            <div className="muted">
              Configure identity, organization type, contact details, and booking integration.
            </div>
          </div>

          <span
            className={form.is_active ? "badge success" : "badge warning"}
            style={{ flexShrink: 0 }}
          >
            {form.is_active ? "active" : "inactive"}
          </span>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 8,
            borderColor: selectedTypeTone.border,
            background: selectedTypeTone.background,
          }}
        >
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span
              className="badge"
              style={{
                borderColor: selectedTypeTone.border,
                background: "#ffffff",
                color: selectedTypeTone.color,
              }}
            >
              {getOrganizationTypeLabel(form.organization_type)}
            </span>

            <span className="badge">
              required pack: {getRequiredSubscriptionForOrganizationType(form.organization_type)}
            </span>
          </div>

          <div className="muted">{getOrganizationTypeDescription(form.organization_type)}</div>
        </div>

        <form onSubmit={onSubmit} className="stack" style={{ gap: 14 }}>
          <label className="stack" style={{ gap: 6 }}>
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
              placeholder="Example: Acme Coaching Partner"
              required
            />
          </label>

          <label className="stack" style={{ gap: 6 }}>
            <strong>Business ID</strong>
            <input
              className="input"
              value={form.code || "Generated automatically"}
              disabled
              placeholder="Generated automatically"
              style={{
                cursor: "not-allowed",
                background: "var(--admin-surface-muted)",
                color: "var(--admin-muted)",
              }}
            />
            <div className="fine-print">
              System-generated identifier. It follows the ORG-xxxxxx convention.
            </div>
          </label>

          <label className="stack" style={{ gap: 6 }}>
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

          <label className="stack" style={{ gap: 6 }}>
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
              placeholder="Describe the organization, operating model, partnership scope, or worker context..."
              rows={5}
              style={{
                minHeight: 130,
                maxHeight: 240,
                overflowY: "auto",
                lineHeight: 1.55,
              }}
            />
          </label>

          <div className="grid grid-2">
            <label className="stack" style={{ gap: 6 }}>
              <strong>Contact email</strong>
              <input
                className="input"
                type="email"
                value={form.contact_email}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    contact_email: event.target.value,
                  })
                }
                disabled={detailLoading}
                placeholder="contact@organization.com"
              />
            </label>

            <label className="stack" style={{ gap: 6 }}>
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
                placeholder="+32 ..."
              />
            </label>
          </div>

          <label className="stack" style={{ gap: 6 }}>
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
            <div className="fine-print">
              Dedicated Calendly event type used to restrict this organization to its own bookings.
            </div>
          </label>

          <label
            className="card-soft row"
            style={{
              gap: 10,
              alignItems: "center",
              cursor: detailLoading ? "not-allowed" : "pointer",
              padding: 14,
            }}
          >
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
              style={{
                width: 18,
                height: 18,
                flexShrink: 0,
              }}
            />

            <div className="stack" style={{ gap: 2 }}>
              <strong>Active organization</strong>
              <span className="muted">
                Inactive organizations remain saved but should not be used for active worker
                assignment or bookings.
              </span>
            </div>
          </label>

          <div
            className="row"
            style={{
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              position: "sticky",
              bottom: 0,
              paddingTop: 12,
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "saturate(180%) blur(16px)",
            }}
          >
            <button
              className="button ghost"
              type="button"
              onClick={onNewOrganization}
              disabled={detailLoading}
            >
              New organization
            </button>

            <button className="button" type="submit" disabled={saving || detailLoading}>
              {saving
                ? "Saving..."
                : editingOrganizationId
                  ? "Save organization"
                  : "Create organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}