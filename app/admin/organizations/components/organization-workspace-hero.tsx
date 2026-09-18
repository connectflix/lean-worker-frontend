"use client";

import { getOrganizationOverviewCopy } from "@/lib/i18n/organization-overview";
import type { AdminOrganization, AdminOrganizationWorkerSummary } from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

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

function formatEur(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span className={active ? "badge success" : "badge warning"}>
      {active ? activeLabel : inactiveLabel}
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
  const { uiLanguage } = useAdminUiLanguage();
  const copy = getOrganizationOverviewCopy(uiLanguage);

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
      : copy.common.noWorkerSelected;

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

            <StatusBadge
              active={selectedOrganization.is_active}
              activeLabel={copy.status.active}
              inactiveLabel={copy.status.inactive}
            />

            <span className="badge">{copy.common.requiredPack(requiredPack)}</span>
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
              copy.common.noDescription}
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
              {copy.common.workerCount(
                organizationRevenueSummary.assignedWorkerCount,
              )}
            </span>
            <span className="badge">
              {copy.common.paidCount(
                organizationRevenueSummary.paidWorkerCount,
              )}
            </span>
          </div>

          <div className="stack" style={{ gap: 4 }}>
            <div className="muted" style={{ fontSize: 12 }}>
              {copy.common.selectedWorker}
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
            label={copy.common.assignedWorkers}
            value={organizationRevenueSummary.assignedWorkerCount}
            helper={copy.hero.assignedWorkersHelper}
          />

          <HeroMetricCard
            label={copy.common.paidWorkers}
            value={organizationRevenueSummary.paidWorkerCount}
            helper={copy.hero.paidWorkersHelper}
          />

          <HeroMetricCard
            label={copy.common.organizationRevenue}
            value={formatEur(
              organizationRevenueSummary.organizationRevenueExVat,
              copy.locale,
            )}
            helper={copy.common.organizationShare(revenueSharePercent)}
            emphasis
          />

          <HeroMetricCard
            label={copy.hero.grossSubscriptions}
            value={formatEur(
              organizationRevenueSummary.grossSubscriptionRevenueExVat,
              copy.locale,
            )}
            helper={copy.hero.grossSubscriptionsHelper}
          />

          <HeroMetricCard
            label={copy.hero.selectedWorkerSessions}
            value={selectedWorkerSummary?.session_count ?? 0}
            helper={copy.hero.sessionsHelper}
          />

          <HeroMetricCard
            label={copy.common.recommendations}
            value={selectedWorkerSummary?.recommendation_count ?? 0}
            helper={copy.hero.recommendationsHelper}
          />
        </div>
      </div>
    </section>
  );
}