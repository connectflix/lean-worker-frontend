"use client";

import type {
  AdminOrganization,
  AdminOrganizationWorkerSummary,
} from "@/lib/types";
import type { OrganizationWorkspaceTab } from "./organization-workspace-tabs";

type OrganizationRevenueSummary = {
  assignedWorkerCount: number;
  paidWorkerCount: number;
  grossSubscriptionRevenueExVat: number;
  organizationRevenueExVat: number;
  platformRevenueExVat: number;
  revenueShareRate: number;
};

type OrganizationOverviewTabProps = {
  selectedOrganization: AdminOrganization;
  selectedWorkerSummary: AdminOrganizationWorkerSummary | null;
  selectedWorkerId: number | null;
  organizationRevenueSummary: OrganizationRevenueSummary;
  onNavigate: (tab: OrganizationWorkspaceTab) => void;
  getOrganizationTypeLabel: (type?: string | null) => string;
  getRequiredSubscriptionForOrganizationType: (
    type?: string | null,
  ) => "classique" | "flix" | "executif";
};

export function OrganizationOverviewTab({
  selectedOrganization,
  selectedWorkerSummary,
  selectedWorkerId,
  organizationRevenueSummary,
  onNavigate,
  getOrganizationTypeLabel,
  getRequiredSubscriptionForOrganizationType,
}: OrganizationOverviewTabProps) {
  return (
    <div className="grid grid-2">
      <div className="card stack" style={{ gap: 14 }}>
        <div className="section-title">Organization overview</div>

        <div className="card-soft stack" style={{ gap: 8 }}>
          <div>
            <strong>Name:</strong> {selectedOrganization.name}
          </div>
          <div>
            <strong>Business ID:</strong>{" "}
            {selectedOrganization.code || `#${selectedOrganization.id}`}
          </div>
          <div>
            <strong>Type:</strong>{" "}
            {getOrganizationTypeLabel(selectedOrganization.organization_type)}
          </div>
          <div>
            <strong>Required worker pack:</strong>{" "}
            {getRequiredSubscriptionForOrganizationType(
              selectedOrganization.organization_type,
            )}
          </div>
          <div>
            <strong>Contact email:</strong>{" "}
            {selectedOrganization.contact_email || "—"}
          </div>
          <div>
            <strong>Contact phone:</strong>{" "}
            {selectedOrganization.contact_phone || "—"}
          </div>
          <div>
            <strong>Calendly:</strong>{" "}
            {selectedOrganization.calendly_event_type_uri
              ? "Event type configured"
              : "Not configured"}
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <button
            className="button"
            type="button"
            onClick={() => onNavigate("workers")}
          >
            Open workers
          </button>

          <button
            className="button ghost"
            type="button"
            onClick={() => onNavigate("revenue")}
          >
            View revenue
          </button>

          <button
            className="button ghost"
            type="button"
            onClick={() => onNavigate("insights")}
            disabled={!selectedWorkerId}
          >
            View worker insights
          </button>

          <button
            className="button ghost"
            type="button"
            onClick={() => onNavigate("canvases")}
            disabled={!selectedWorkerId}
          >
            Open canvases
          </button>
        </div>
      </div>

      <div className="card stack" style={{ gap: 14 }}>
        <div className="section-title">Operational snapshot</div>

        <div className="grid grid-2">
          <div className="card-soft stack" style={{ gap: 6 }}>
            <div className="muted">Assigned workers</div>
            <div className="admin-metric-value">
              {organizationRevenueSummary.assignedWorkerCount}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6 }}>
            <div className="muted">Paid workers</div>
            <div className="admin-metric-value">
              {organizationRevenueSummary.paidWorkerCount}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6 }}>
            <div className="muted">Organization revenue</div>
            <div className="admin-metric-value" style={{ color: "#15803d" }}>
              {new Intl.NumberFormat("fr-BE", {
                style: "currency",
                currency: "EUR",
              }).format(organizationRevenueSummary.organizationRevenueExVat)}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 6 }}>
            <div className="muted">Platform share</div>
            <div className="admin-metric-value">
              {new Intl.NumberFormat("fr-BE", {
                style: "currency",
                currency: "EUR",
              }).format(organizationRevenueSummary.platformRevenueExVat)}
            </div>
          </div>
        </div>

        <div className="card-soft stack" style={{ gap: 10 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Selected worker
          </div>

          {selectedWorkerSummary?.worker ? (
            <>
              <div style={{ fontWeight: 800 }}>
                {selectedWorkerSummary.worker.display_name}
              </div>
              <div className="muted">
                {selectedWorkerSummary.worker.email || "No email"}
              </div>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">
                  {selectedWorkerSummary.worker.subscription_pack}
                </span>
                <span className="badge">
                  {selectedWorkerSummary.session_count} sessions
                </span>
                <span className="badge">
                  {selectedWorkerSummary.recommendation_count} recommendations
                </span>
                <span className="badge">
                  {selectedWorkerSummary.artifact_count} artifacts
                </span>
              </div>
            </>
          ) : (
            <div className="muted">
              No worker selected yet. Open the Workers tab and select one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}