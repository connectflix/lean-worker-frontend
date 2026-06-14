"use client";

import { useMemo, useState } from "react";
import type {
  AdminCalendlyEventType,
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

  calendlyEventTypes?: AdminCalendlyEventType[];
  calendlyEventTypesLoading?: boolean;
  calendlyEventTypesError?: string | null;

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

function getCalendlySearchText(eventType: AdminCalendlyEventType): string {
  return [
    eventType.name,
    eventType.slug,
    eventType.scheduling_url,
    eventType.uri,
    eventType.duration ? `${eventType.duration}` : "",
    eventType.active ? "active" : "inactive",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getShortCalendlyUrl(value?: string | null): string {
  if (!value) return "No scheduling URL";

  return value
    .replace("https://", "")
    .replace("http://", "")
    .replace("www.", "");
}

export function OrganizationAdminTab({
  organizations,
  selectedOrganizationId,
  editingOrganizationId,
  form,
  saving,
  detailLoading,
  calendlyEventTypes = [],
  calendlyEventTypesLoading = false,
  calendlyEventTypesError = null,
  onOpenOrganization,
  onSubmit,
  onFormChange,
  onNewOrganization,
  getOrganizationTypeLabel,
  getRequiredSubscriptionForOrganizationType,
}: OrganizationAdminTabProps) {
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [calendlySearch, setCalendlySearch] = useState("");

  const safeOrganizations = Array.isArray(organizations) ? organizations : [];
  const safeCalendlyEventTypes = Array.isArray(calendlyEventTypes)
    ? calendlyEventTypes
    : [];

  const filteredOrganizations = useMemo(() => {
    const query = organizationSearch.trim().toLowerCase();

    if (!query) return safeOrganizations;

    return safeOrganizations.filter((organization) => {
      return (
        organization.name.toLowerCase().includes(query) ||
        (organization.code || "").toLowerCase().includes(query) ||
        (organization.contact_email || "").toLowerCase().includes(query) ||
        getOrganizationTypeLabel(organization.organization_type)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [safeOrganizations, organizationSearch, getOrganizationTypeLabel]);

  const filteredCalendlyEventTypes = useMemo(() => {
    const query = calendlySearch.trim().toLowerCase();

    if (!query) return safeCalendlyEventTypes;

    return safeCalendlyEventTypes.filter((eventType) =>
      getCalendlySearchText(eventType).includes(query),
    );
  }, [safeCalendlyEventTypes, calendlySearch]);

  const visibleCalendlyEventTypes = filteredCalendlyEventTypes.slice(0, 25);
  const hiddenCalendlyEventTypeCount = Math.max(
    filteredCalendlyEventTypes.length - visibleCalendlyEventTypes.length,
    0,
  );

  const activeOrganizations = safeOrganizations.filter(
    (organization) => organization.is_active,
  );

  const inactiveOrganizations = safeOrganizations.filter(
    (organization) => !organization.is_active,
  );

  const selectedTypeTone = getOrganizationTypeTone(form.organization_type);

  const selectedCalendlyEventType = safeCalendlyEventTypes.find(
    (eventType) => eventType.uri === form.calendly_event_type_uri,
  );

  const shouldShowUnknownCalendlyValue =
    Boolean(form.calendly_event_type_uri) && !selectedCalendlyEventType;

  function selectCalendlyEventType(eventType: AdminCalendlyEventType) {
    onFormChange({
      ...form,
      calendly_event_type_uri: eventType.uri,
    });

    setCalendlySearch("");
  }

  function clearCalendlySelection() {
    onFormChange({
      ...form,
      calendly_event_type_uri: "",
    });

    setCalendlySearch("");
  }

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
              {safeOrganizations.length}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">Active</div>
            <div
              className="admin-metric-value"
              style={{ fontSize: 24, color: "var(--success)" }}
            >
              {activeOrganizations.length}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6, padding: 14 }}>
            <div className="muted">Inactive</div>
            <div
              className="admin-metric-value"
              style={{ fontSize: 24, color: "var(--warning)" }}
            >
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

        {safeOrganizations.length === 0 ? (
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
                    background: isSelected
                      ? "rgba(94,106,210,0.07)"
                      : "var(--admin-surface-muted)",
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

          <div className="stack" style={{ gap: 8 }}>
            <strong>Calendly event</strong>

            <div className="card-soft stack" style={{ gap: 10 }}>
              {selectedCalendlyEventType ? (
                <div
                  className="card-soft stack"
                  style={{
                    gap: 8,
                    border: "1px solid rgba(34,197,94,0.20)",
                    background: "rgba(34,197,94,0.07)",
                  }}
                >
                  <div className="row space-between" style={{ gap: 10, flexWrap: "wrap" }}>
                    <div className="stack" style={{ gap: 4, minWidth: 0 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge success">Selected</span>

                        {selectedCalendlyEventType.duration ? (
                          <span className="badge">
                            {selectedCalendlyEventType.duration} min
                          </span>
                        ) : null}

                        <span
                          className={
                            selectedCalendlyEventType.active
                              ? "badge success"
                              : "badge warning"
                          }
                        >
                          {selectedCalendlyEventType.active ? "active" : "inactive"}
                        </span>
                      </div>

                      <strong>{selectedCalendlyEventType.name}</strong>

                      <div
                        className="muted"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={selectedCalendlyEventType.scheduling_url || undefined}
                      >
                        {getShortCalendlyUrl(selectedCalendlyEventType.scheduling_url)}
                      </div>
                    </div>

                    <button
                      className="button ghost"
                      type="button"
                      onClick={clearCalendlySelection}
                      disabled={detailLoading}
                      style={{
                        minHeight: 36,
                        color: "var(--danger)",
                        borderColor: "rgba(239,68,68,0.22)",
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  {selectedCalendlyEventType.scheduling_url ? (
                    <a
                      href={selectedCalendlyEventType.scheduling_url}
                      target="_blank"
                      rel="noreferrer"
                      className="fine-print"
                      style={{
                        color: "var(--primary-hover)",
                        textDecoration: "none",
                      }}
                    >
                      Open Calendly scheduling page
                    </a>
                  ) : null}
                </div>
              ) : shouldShowUnknownCalendlyValue ? (
                <div
                  className="card-soft stack"
                  style={{
                    gap: 8,
                    border: "1px solid rgba(251,191,36,0.26)",
                    background: "rgba(251,191,36,0.10)",
                  }}
                >
                  <span className="badge warning">Current saved event not found</span>
                  <div className="muted" style={{ lineHeight: 1.5, wordBreak: "break-all" }}>
                    {form.calendly_event_type_uri}
                  </div>

                  <button
                    className="button ghost"
                    type="button"
                    onClick={clearCalendlySelection}
                    disabled={detailLoading}
                    style={{
                      alignSelf: "flex-start",
                      minHeight: 36,
                      color: "var(--danger)",
                      borderColor: "rgba(239,68,68,0.22)",
                    }}
                  >
                    Clear saved value
                  </button>
                </div>
              ) : (
                <div className="muted" style={{ lineHeight: 1.5 }}>
                  No Calendly event selected yet.
                </div>
              )}

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Search Calendly events</span>
                <input
                  className="input"
                  value={calendlySearch}
                  onChange={(event) => setCalendlySearch(event.target.value)}
                  disabled={detailLoading || calendlyEventTypesLoading}
                  placeholder={
                    calendlyEventTypesLoading
                      ? "Loading Calendly events..."
                      : "Search by name, slug, duration or URL..."
                  }
                />
              </label>

              {calendlyEventTypesError ? (
                <div
                  className="fine-print"
                  style={{
                    color: "var(--danger)",
                    lineHeight: 1.45,
                  }}
                >
                  Calendly events could not be loaded: {calendlyEventTypesError}
                </div>
              ) : null}

              {!calendlyEventTypesLoading &&
              !calendlyEventTypesError &&
              safeCalendlyEventTypes.length === 0 ? (
                <div className="fine-print">
                  No Calendly event type was found. Check your Calendly API token and scope.
                </div>
              ) : null}

              {!calendlyEventTypesLoading &&
              !calendlyEventTypesError &&
              safeCalendlyEventTypes.length > 0 &&
              filteredCalendlyEventTypes.length === 0 ? (
                <div className="card-soft muted">
                  No Calendly event matches this search.
                </div>
              ) : null}

              {visibleCalendlyEventTypes.length > 0 ? (
                <div className="stack" style={{ gap: 8 }}>
                  <div
                    className="stack"
                    style={{
                      gap: 8,
                      maxHeight: 360,
                      overflowY: "auto",
                      overflowX: "hidden",
                      paddingRight: 6,
                      borderRadius: 16,
                    }}
                  >
                    {visibleCalendlyEventTypes.map((eventType) => {
                      const isSelected = eventType.uri === form.calendly_event_type_uri;

                      return (
                        <button
                          key={eventType.uri}
                          type="button"
                          className="card-soft stack"
                          onClick={() => selectCalendlyEventType(eventType)}
                          disabled={detailLoading}
                          style={{
                            gap: 7,
                            textAlign: "left",
                            cursor: detailLoading ? "not-allowed" : "pointer",
                            border: isSelected
                              ? "1px solid rgba(34,197,94,0.42)"
                              : "1px solid var(--admin-border)",
                            background: isSelected
                              ? "rgba(34,197,94,0.08)"
                              : "var(--admin-surface-muted)",
                            boxShadow: "none",
                            flexShrink: 0,
                          }}
                        >
                          <div className="row space-between" style={{ gap: 10 }}>
                            <strong>{eventType.name}</strong>

                            {isSelected ? (
                              <span className="badge success">selected</span>
                            ) : null}
                          </div>

                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            {eventType.duration ? (
                              <span className="badge">{eventType.duration} min</span>
                            ) : null}

                            <span
                              className={eventType.active ? "badge success" : "badge warning"}
                            >
                              {eventType.active ? "active" : "inactive"}
                            </span>

                            {eventType.slug ? (
                              <span className="badge">{eventType.slug}</span>
                            ) : null}
                          </div>

                          <div
                            className="muted"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={eventType.scheduling_url || eventType.uri}
                          >
                            {getShortCalendlyUrl(eventType.scheduling_url || eventType.uri)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {hiddenCalendlyEventTypeCount > 0 ? (
                    <div className="fine-print">
                      {hiddenCalendlyEventTypeCount} more result(s). Refine your search to narrow
                      the list.
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="fine-print">
                Dedicated Calendly event type used to restrict this organization to its own
                bookings.
              </div>
            </div>
          </div>

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