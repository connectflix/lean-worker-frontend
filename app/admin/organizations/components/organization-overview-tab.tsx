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

function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="row space-between"
      style={{
        gap: 12,
        alignItems: "flex-start",
        padding: "10px 0",
        borderBottom: "1px solid rgba(17,24,39,0.06)",
      }}
    >
      <div className="muted" style={{ fontSize: 13 }}>
        {label}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 650,
          lineHeight: 1.45,
          textAlign: "right",
          maxWidth: "62%",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  emphasis = false,
}: {
  label: string;
  value: string | number;
  helper?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className="card-soft stack"
      style={{
        gap: 8,
        minHeight: 118,
        background: emphasis ? "var(--admin-accent-soft)" : undefined,
        borderColor: emphasis ? "rgba(94,106,210,0.18)" : undefined,
      }}
    >
      <div className="muted" style={{ fontSize: 13 }}>
        {label}
      </div>

      <div
        className="admin-metric-value"
        style={{
          fontSize: 28,
          color: emphasis ? "var(--admin-accent)" : undefined,
        }}
      >
        {value}
      </div>

      {helper ? (
        <div className="muted" style={{ fontSize: 12 }}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}

export function OrganizationOverviewTab({
  selectedOrganization,
  selectedWorkerSummary,
  selectedWorkerId,
  organizationRevenueSummary,
  onNavigate,
  getOrganizationTypeLabel,
  getRequiredSubscriptionForOrganizationType,
}: OrganizationOverviewTabProps) {
  const organizationCode = selectedOrganization.code || `#${selectedOrganization.id}`;
  const organizationTypeLabel = getOrganizationTypeLabel(
    selectedOrganization.organization_type,
  );
  const requiredPack = getRequiredSubscriptionForOrganizationType(
    selectedOrganization.organization_type,
  );

  const selectedWorker = selectedWorkerSummary?.worker ?? null;

  return (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      <div className="card stack" style={{ gap: 18 }}>
        <div
          className="row space-between"
          style={{
            gap: 12,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div className="stack" style={{ gap: 6 }}>
            <div className="section-title">Organization overview</div>
            <div className="muted">
              Core organization configuration, access context, and operational entry points.
            </div>
          </div>

          <span
            className={selectedOrganization.is_active ? "badge success" : "badge warning"}
          >
            {selectedOrganization.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 0,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          <InfoRow label="Name" value={selectedOrganization.name} />
          <InfoRow label="Business ID" value={organizationCode} />
          <InfoRow label="Type" value={organizationTypeLabel} />
          <InfoRow label="Required worker pack" value={requiredPack} />
          <InfoRow
            label="Contact email"
            value={selectedOrganization.contact_email || "—"}
          />
          <InfoRow
            label="Contact phone"
            value={selectedOrganization.contact_phone || "—"}
          />

          <div
            className="row space-between"
            style={{
              gap: 12,
              alignItems: "flex-start",
              padding: "10px 0",
            }}
          >
            <div className="muted" style={{ fontSize: 13 }}>
              Calendly
            </div>

            <span
              className={
                selectedOrganization.calendly_event_type_uri
                  ? "badge success"
                  : "badge warning"
              }
            >
              {selectedOrganization.calendly_event_type_uri
                ? "Configured"
                : "Not configured"}
            </span>
          </div>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 10,
            background: "rgba(255,255,255,0.72)",
          }}
        >
          <div className="section-title" style={{ fontSize: 15 }}>
            Recommended next actions
          </div>

          <div className="muted">
            Use this workspace to move from organization setup to worker follow-up,
            conversation review, coaching canvases, and revenue monitoring.
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
              onClick={() => onNavigate("conversations")}
              disabled={!selectedWorkerId}
            >
              Review conversations
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("canvases")}
              disabled={!selectedWorkerId}
            >
              Open canvases
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("insights")}
              disabled={!selectedWorkerId}
            >
              Worker insights
            </button>
          </div>
        </div>
      </div>

      <div className="card stack" style={{ gap: 18 }}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="section-title">Operational snapshot</div>
          <div className="muted">
            A compact view of worker volume, monetization, and selected worker activity.
          </div>
        </div>

        <div className="grid grid-2">
          <MetricCard
            label="Assigned workers"
            value={organizationRevenueSummary.assignedWorkerCount}
            helper="Workers currently linked to this organization."
          />

          <MetricCard
            label="Paid workers"
            value={organizationRevenueSummary.paidWorkerCount}
            helper="Workers with tracked subscription revenue."
          />

          <MetricCard
            label="Organization revenue"
            value={formatEur(organizationRevenueSummary.organizationRevenueExVat)}
            helper={`${Math.round(
              organizationRevenueSummary.revenueShareRate * 100,
            )}% organization share, ex-VAT.`}
            emphasis
          />

          <MetricCard
            label="Platform share"
            value={formatEur(organizationRevenueSummary.platformRevenueExVat)}
            helper="Remaining platform revenue, ex-VAT."
          />
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 12,
            background: selectedWorker
              ? "rgba(255,255,255,0.78)"
              : "var(--admin-surface-muted)",
          }}
        >
          <div
            className="row space-between"
            style={{
              gap: 10,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title" style={{ fontSize: 15 }}>
                Selected worker
              </div>
              <div className="muted">
                Current worker context used for insights, conversations, and canvases.
              </div>
            </div>

            {selectedWorker ? (
              <span className="badge primary">Worker selected</span>
            ) : (
              <span className="badge warning">No worker</span>
            )}
          </div>

          {selectedWorker ? (
            <>
              <div className="stack" style={{ gap: 4 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 750,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.25,
                  }}
                >
                  {selectedWorker.display_name}
                </div>

                <div className="muted">{selectedWorker.email || "No email"}</div>

                {selectedWorker.current_role || selectedWorker.profession ? (
                  <div className="muted">
                    {selectedWorker.current_role || selectedWorker.profession}
                  </div>
                ) : null}
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">{selectedWorker.subscription_pack}</span>
                <span className="badge">
                  {selectedWorkerSummary?.session_count ?? 0} sessions
                </span>
                <span className="badge">
                  {selectedWorkerSummary?.external_conversation_count ?? 0} external conversations
                </span>
                <span className="badge">
                  {selectedWorkerSummary?.recommendation_count ?? 0} recommendations
                </span>
                <span className="badge">
                  {selectedWorkerSummary?.artifact_count ?? 0} artifacts
                </span>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => onNavigate("conversations")}
                >
                  Conversations
                </button>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => onNavigate("insights")}
                >
                  Insights
                </button>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => onNavigate("canvases")}
                >
                  Canvases
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="muted">
                No worker selected yet. Open the Workers tab and select one to unlock
                conversations, canvases, and worker insights.
              </div>

              <div>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => onNavigate("workers")}
                >
                  Select a worker
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}