"use client";

import { getOrganizationOverviewCopy } from "@/lib/i18n/organization-overview";
import type {
  AdminOrganization,
  AdminOrganizationWorkerSummary,
} from "@/lib/types";
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

function ExecutiveMetric({
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
      className="stack"
      style={{
        gap: 4,
        minWidth: 0,
      }}
    >
      <div
        className="muted"
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        className="admin-metric-value"
        style={{
          fontSize: emphasis ? 30 : 25,
          lineHeight: 1.05,
          color: emphasis
            ? "var(--admin-accent-hover)"
            : "var(--admin-ink)",
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
            lineHeight: 1.4,
          }}
        >
          {helper}
        </div>
      ) : null}
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
        gap: 0,
        padding: 0,
        overflow: "hidden",
        borderColor: "var(--admin-border)",
        background: "var(--admin-surface)",
      }}
    >
      <div
        data-testid="organization-hero-identity"
        className="stack"
        style={{
          gap: 10,
          padding: "22px 24px 20px",
          borderBottom: "1px solid var(--admin-border)",
        }}
      >
        <div
          className="row"
          style={{
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span className="badge primary">
            {selectedOrganization.code || `ORG-${selectedOrganization.id}`}
          </span>

          <span className="badge">{organizationTypeLabel}</span>

          <StatusBadge
            active={selectedOrganization.is_active}
            activeLabel={copy.status.active}
            inactiveLabel={copy.status.inactive}
          />

          <span className="badge">
            {copy.common.requiredPack(requiredPack)}
          </span>
        </div>

        <div
          className="section-title"
          style={{
            fontSize: 28,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            color: "var(--admin-ink)",
            maxWidth: 920,
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
            fontSize: 14,
          }}
        >
          {selectedOrganization.description || copy.common.noDescription}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
          borderBottom: "1px solid var(--admin-border)",
        }}
      >
        <div
          data-testid="organization-hero-workforce"
          style={{
            padding: "20px 24px",
            borderRight: "1px solid var(--admin-border)",
            background: "var(--admin-surface-subtle)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 24,
            }}
          >
            <ExecutiveMetric
              label={copy.common.assignedWorkers}
              value={organizationRevenueSummary.assignedWorkerCount}
              helper={copy.hero.assignedWorkersHelper}
            />

            <ExecutiveMetric
              label={copy.common.paidWorkers}
              value={organizationRevenueSummary.paidWorkerCount}
              helper={copy.hero.paidWorkersHelper}
            />
          </div>
        </div>

        <div
          data-testid="organization-hero-revenue"
          data-emphasis="primary"
          style={{
            padding: "20px 24px",
            background: "var(--admin-accent-softer)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
              gap: 24,
            }}
          >
            <ExecutiveMetric
              label={copy.common.organizationRevenue}
              value={formatEur(
                organizationRevenueSummary.organizationRevenueExVat,
                copy.locale,
              )}
              helper={copy.common.organizationShare(revenueSharePercent)}
              emphasis
            />

            <ExecutiveMetric
              label={copy.hero.grossSubscriptions}
              value={formatEur(
                organizationRevenueSummary.grossSubscriptionRevenueExVat,
                copy.locale,
              )}
              helper={copy.hero.grossSubscriptionsHelper}
            />
          </div>
        </div>
      </div>

      <div
        data-testid="organization-hero-worker-context"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 1.4fr) repeat(2, minmax(140px, 0.6fr))",
          gap: 24,
          alignItems: "center",
          padding: "18px 24px",
          background: "var(--admin-surface)",
        }}
      >
        <div
          className="stack"
          style={{
            gap: 4,
            minWidth: 0,
          }}
        >
          <div
            className="muted"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {copy.common.selectedWorker}
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
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

        <ExecutiveMetric
          label={copy.hero.selectedWorkerSessions}
          value={selectedWorkerSummary?.session_count ?? 0}
          helper={copy.hero.sessionsHelper}
        />

        <ExecutiveMetric
          label={copy.common.recommendations}
          value={selectedWorkerSummary?.recommendation_count ?? 0}
          helper={copy.hero.recommendationsHelper}
        />
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          section > div:nth-of-type(2) {
            grid-template-columns: 1fr !important;
          }

          section > div:nth-of-type(2) > div:first-child {
            border-right: 0 !important;
            border-bottom: 1px solid var(--admin-border);
          }

          [data-testid="organization-hero-worker-context"] {
            grid-template-columns: 1fr 1fr !important;
          }

          [data-testid="organization-hero-worker-context"] > div:first-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 620px) {
          [data-testid="organization-hero-workforce"] > div,
          [data-testid="organization-hero-revenue"] > div,
          [data-testid="organization-hero-worker-context"] {
            grid-template-columns: 1fr !important;
          }

          [data-testid="organization-hero-worker-context"] > div:first-child {
            grid-column: auto;
          }
        }
      `}</style>
    </section>
  );
}
