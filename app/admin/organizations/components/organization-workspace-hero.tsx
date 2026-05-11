"use client";

import type { AdminOrganization, AdminOrganizationWorkerSummary } from "@/lib/types";

type OrganizationRevenueSummary = {
  assignedWorkerCount: number;
  paidWorkerCount: number;
  grossSubscriptionRevenueExVat: number;
  organizationRevenueExVat: number;
  platformRevenueExVat: number;
  revenueShareRate: number;
};

type OrganizationWorkspaceHeroProps = {
  selectedOrganization: AdminOrganization;
  selectedWorkerSummary: AdminOrganizationWorkerSummary | null;
  selectedWorkerId: number | null;
  organizationRevenueSummary: OrganizationRevenueSummary;
  getOrganizationTypeLabel: (type?: string | null) => string;
  getRequiredSubscriptionForOrganizationType: (
    type?: string | null,
  ) => "classique" | "flix" | "executif";
};

export function OrganizationWorkspaceHero({
  selectedOrganization,
  selectedWorkerSummary,
  selectedWorkerId,
  organizationRevenueSummary,
  getOrganizationTypeLabel,
  getRequiredSubscriptionForOrganizationType,
}: OrganizationWorkspaceHeroProps) {
  const selectedWorkerDisplayLabel = selectedWorkerSummary?.worker
    ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
    : selectedWorkerId
      ? `#${selectedWorkerId}`
      : "No worker selected";

  return (
    <div
      className="card-soft stack"
      style={{
        gap: 14,
        border: "1px solid rgba(59,130,246,0.22)",
        background:
          "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(255,255,255,0.92))",
      }}
    >
      <div
        className="row space-between"
        style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
      >
        <div className="stack" style={{ gap: 6 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="badge">
              {selectedOrganization.code || `#${selectedOrganization.id}`}
            </span>
            <span className="badge">
              {getOrganizationTypeLabel(selectedOrganization.organization_type)}
            </span>
            <span className="badge">
              {selectedOrganization.is_active ? "active" : "inactive"}
            </span>
            <span className="badge">
              required pack:{" "}
              {getRequiredSubscriptionForOrganizationType(
                selectedOrganization.organization_type,
              )}
            </span>
          </div>

          <div className="section-title" style={{ fontSize: 22 }}>
            {selectedOrganization.name}
          </div>

          <div className="muted">
            {selectedOrganization.description ||
              "No organization description configured yet."}
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="badge">
            {organizationRevenueSummary.assignedWorkerCount} worker(s)
          </span>
          <span className="badge">
            {organizationRevenueSummary.paidWorkerCount} paid
          </span>
          <span className="badge">{selectedWorkerDisplayLabel}</span>
        </div>
      </div>

      <div className="admin-kpi-scroll">
        <div className="admin-kpi-row admin-kpi-row--6">
          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Assigned workers</div>
            <div className="admin-metric-value" style={{ fontSize: 26 }}>
              {organizationRevenueSummary.assignedWorkerCount}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Paid workers</div>
            <div className="admin-metric-value" style={{ fontSize: 26 }}>
              {organizationRevenueSummary.paidWorkerCount}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Organization revenue</div>
            <div className="admin-metric-value" style={{ fontSize: 24, color: "#15803d" }}>
              {new Intl.NumberFormat("fr-BE", {
                style: "currency",
                currency: "EUR",
              }).format(organizationRevenueSummary.organizationRevenueExVat)}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Gross subscriptions</div>
            <div className="admin-metric-value" style={{ fontSize: 24 }}>
              {new Intl.NumberFormat("fr-BE", {
                style: "currency",
                currency: "EUR",
              }).format(organizationRevenueSummary.grossSubscriptionRevenueExVat)}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Selected worker sessions</div>
            <div className="admin-metric-value" style={{ fontSize: 26 }}>
              {selectedWorkerSummary?.session_count ?? 0}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Recommendations</div>
            <div className="admin-metric-value" style={{ fontSize: 26 }}>
              {selectedWorkerSummary?.recommendation_count ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}