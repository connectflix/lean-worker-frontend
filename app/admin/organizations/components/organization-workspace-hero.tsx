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

function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={active ? "badge success" : "badge warning"}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function HeroMetricCard({
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
      className="card-soft stack admin-kpi-card"
      style={{
        gap: 7,
        minHeight: 112,
        justifyContent: "space-between",
        background: emphasis ? "var(--admin-accent-softer)" : "var(--admin-surface-muted)",
        borderColor: emphasis ? "rgba(94,106,210,0.16)" : "var(--admin-border)",
      }}
    >
      <div className="muted" style={{ fontSize: 12 }}>
        {label}
      </div>

      <div
        className="admin-metric-value"
        style={{
          fontSize: typeof value === "string" && value.length > 9 ? 23 : 28,
          color: emphasis ? "var(--admin-accent-hover)" : "var(--admin-ink)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={String(value)}
      >
        {value}
      </div>

      {helper ? (
        <div
          className="muted"
          style={{
            fontSize: 12,
            lineHeight: 1.35,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={helper}
        >
          {helper}
        </div>
      ) : (
        <div style={{ height: 16 }} />
      )}
    </div>
  );
}

export function OrganizationWorkspaceHero({
  selectedOrganization,
  selectedWorkerSummary,
  selectedWorkerId,
  organizationRevenueSummary,
  getOrganizationTypeLabel,
  getRequiredSubscriptionForOrganizationType,
}: OrganizationWorkspaceHeroProps) {
  const organizationTypeLabel = getOrganizationTypeLabel(
    selectedOrganization.organization_type,
  );

  const requiredPack = getRequiredSubscriptionForOrganizationType(
    selectedOrganization.organization_type,
  );

  const selectedWorkerDisplayLabel = selectedWorkerSummary?.worker
    ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
    : selectedWorkerId
      ? `#${selectedWorkerId}`
      : "No worker selected";

  const revenueSharePercent = Math.round(
    organizationRevenueSummary.revenueShareRate * 100,
  );

  return (
    <section
      className="card stack"
      style={{
        gap: 16,
        borderColor: "var(--admin-border)",
        background: "var(--admin-surface)",
      }}
    >
      <div
        className="row space-between"
        style={{
          gap: 16,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div
          className="stack"
          style={{
            gap: 8,
            minWidth: 0,
            flex: "1 1 520px",
          }}
        >
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="badge primary">
              {selectedOrganization.code || `ORG-${selectedOrganization.id}`}
            </span>

            <span className="badge">{organizationTypeLabel}</span>

            <StatusBadge active={selectedOrganization.is_active} />

            <span className="badge">Required pack: {requiredPack}</span>
          </div>

          <div
            className="section-title"
            style={{
              fontSize: 26,
              lineHeight: 1.12,
              letterSpacing: "-0.04em",
              maxWidth: 860,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={selectedOrganization.name}
          >
            {selectedOrganization.name}
          </div>

          <div
            className="muted"
            style={{
              maxWidth: 920,
              lineHeight: 1.55,
            }}
          >
            {selectedOrganization.description ||
              "No organization description configured yet."}
          </div>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 10,
            minWidth: 280,
            maxWidth: 420,
            background: "var(--admin-surface-muted)",
          }}
        >
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="badge">
              {organizationRevenueSummary.assignedWorkerCount} worker(s)
            </span>
            <span className="badge">
              {organizationRevenueSummary.paidWorkerCount} paid
            </span>
          </div>

          <div className="stack" style={{ gap: 4 }}>
            <div className="muted" style={{ fontSize: 12 }}>
              Selected worker
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 650,
                lineHeight: 1.35,
                color: "var(--admin-ink)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={selectedWorkerDisplayLabel}
            >
              {selectedWorkerDisplayLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-kpi-scroll">
        <div className="admin-kpi-row admin-kpi-row--6">
          <HeroMetricCard
            label="Assigned workers"
            value={organizationRevenueSummary.assignedWorkerCount}
            helper="Workers linked to this organization"
          />

          <HeroMetricCard
            label="Paid workers"
            value={organizationRevenueSummary.paidWorkerCount}
            helper="Workers with paid subscriptions"
          />

          <HeroMetricCard
            label="Organization revenue"
            value={formatEur(organizationRevenueSummary.organizationRevenueExVat)}
            helper={`${revenueSharePercent}% organization share`}
            emphasis
          />

          <HeroMetricCard
            label="Gross subscriptions"
            value={formatEur(organizationRevenueSummary.grossSubscriptionRevenueExVat)}
            helper="Total subscription revenue ex-VAT"
          />

          <HeroMetricCard
            label="Selected worker sessions"
            value={selectedWorkerSummary?.session_count ?? 0}
            helper="AI coaching sessions"
          />

          <HeroMetricCard
            label="Recommendations"
            value={selectedWorkerSummary?.recommendation_count ?? 0}
            helper="Generated recommendations"
          />
        </div>
      </div>
    </section>
  );
}