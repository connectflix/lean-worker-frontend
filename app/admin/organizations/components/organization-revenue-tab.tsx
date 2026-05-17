"use client";

import type { AdminOrganization, AdminWorker } from "@/lib/types";

export type OrganizationRevenueSummary = {
  assignedWorkerCount: number;
  paidWorkerCount: number;
  grossSubscriptionRevenueExVat: number;
  organizationRevenueExVat: number;
  platformRevenueExVat: number;
  revenueShareRate: number;
};

type OrganizationRevenueTabProps = {
  selectedOrganization: AdminOrganization;
  assignedWorkers: AdminWorker[];
  organizationRevenueSummary: OrganizationRevenueSummary;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function getWorkerSubscriptionPaidExVat(worker: AdminWorker): number {
  const directTotal = Number(worker.subscription_total_paid_eur ?? 0);
  const activeSubscriptionTotal = Number(worker.active_subscription?.total_paid_eur ?? 0);

  if (Number.isFinite(directTotal) && directTotal > 0) {
    return directTotal;
  }

  if (Number.isFinite(activeSubscriptionTotal) && activeSubscriptionTotal > 0) {
    return activeSubscriptionTotal;
  }

  return 0;
}

function RevenueMetricCard({
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
        minHeight: 116,
        borderColor: emphasis ? "rgba(21,128,61,0.22)" : "var(--admin-border)",
        background: emphasis ? "rgba(21,128,61,0.07)" : "var(--admin-surface-muted)",
      }}
    >
      <div className="muted">{label}</div>

      <div
        className="admin-metric-value"
        style={{
          fontSize: typeof value === "number" ? 28 : 24,
          color: emphasis ? "var(--success)" : "var(--foreground)",
          letterSpacing: "-0.04em",
        }}
      >
        {value}
      </div>

      {helper ? (
        <div className="fine-print" style={{ lineHeight: 1.45 }}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}

export function OrganizationRevenueTab({
  selectedOrganization,
  assignedWorkers,
  organizationRevenueSummary,
}: OrganizationRevenueTabProps) {
  const shareRate = organizationRevenueSummary.revenueShareRate;
  const platformShareRate = 1 - shareRate;

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="card stack" style={{ gap: 16 }}>
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 5, maxWidth: 820 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">
                {selectedOrganization.code || `#${selectedOrganization.id}`}
              </span>
              <span className="badge">
                Share rate: {formatPercent(organizationRevenueSummary.revenueShareRate)}
              </span>
            </div>

            <div className="section-title" style={{ fontSize: 20 }}>
              Organization revenue dashboard
            </div>

            <div className="muted">
              Revenue is calculated from paid subscription amounts of assigned workers. The
              organization receives {formatPercent(shareRate)} ex-VAT and the platform keeps{" "}
              {formatPercent(platformShareRate)}.
            </div>
          </div>

          <div
            className="card-soft"
            style={{
              minWidth: 240,
              background: "#ffffff",
            }}
          >
            <div className="muted">Calculation rule</div>
            <div
              style={{
                marginTop: 6,
                fontWeight: 750,
                letterSpacing: "-0.03em",
                fontSize: 18,
              }}
            >
              {formatPercent(shareRate)} organization / {formatPercent(platformShareRate)} platform
            </div>
          </div>
        </div>

        <div className="admin-kpi-scroll">
          <div className="admin-kpi-row admin-kpi-row--6">
            <RevenueMetricCard
              label="Assigned workers"
              value={organizationRevenueSummary.assignedWorkerCount}
              helper="Workers currently linked to this organization."
            />

            <RevenueMetricCard
              label="Paid workers"
              value={organizationRevenueSummary.paidWorkerCount}
              helper="Assigned workers with subscription payment captured."
            />

            <RevenueMetricCard
              label="Gross subscriptions ex-VAT"
              value={formatCurrency(organizationRevenueSummary.grossSubscriptionRevenueExVat)}
              helper="Total subscription revenue before revenue sharing."
            />

            <RevenueMetricCard
              label="Organization revenue ex-VAT"
              value={formatCurrency(organizationRevenueSummary.organizationRevenueExVat)}
              helper={`${formatPercent(shareRate)} of gross subscription revenue.`}
              emphasis
            />

            <RevenueMetricCard
              label="Platform share ex-VAT"
              value={formatCurrency(organizationRevenueSummary.platformRevenueExVat)}
              helper={`${formatPercent(platformShareRate)} retained by LeanWorker platform.`}
            />

            <RevenueMetricCard
              label="Average revenue / paid worker"
              value={
                organizationRevenueSummary.paidWorkerCount > 0
                  ? formatCurrency(
                      organizationRevenueSummary.organizationRevenueExVat /
                        organizationRevenueSummary.paidWorkerCount,
                    )
                  : formatCurrency(0)
              }
              helper="Organization revenue divided by paid workers."
            />
          </div>
        </div>
      </div>

      <div className="card stack" style={{ gap: 14 }}>
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Revenue details by assigned worker</div>
            <div className="muted">
              Worker-level subscription contribution and calculated revenue split.
            </div>
          </div>

          <span className="badge">{assignedWorkers.length} worker(s)</span>
        </div>

        {assignedWorkers.length === 0 ? (
          <div className="card-soft muted">No assigned worker yet. Revenue is currently zero.</div>
        ) : (
          <div
            className="card-soft"
            style={{
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  maxHeight: "calc(100vh - 420px)",
                  minHeight: 260,
                  overflowY: "auto",
                  minWidth: 920,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "var(--admin-surface-muted)",
                    }}
                  >
                    <tr
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid var(--admin-border)",
                      }}
                    >
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>Worker</th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>Business ID</th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>Pack</th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>
                        Subscription paid
                      </th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>
                        Organization share
                      </th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>Platform share</th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignedWorkers.map((worker) => {
                      const subscriptionPaid = getWorkerSubscriptionPaidExVat(worker);
                      const organizationShare = subscriptionPaid * shareRate;
                      const platformShare = subscriptionPaid * platformShareRate;

                      return (
                        <tr
                          key={worker.id}
                          style={{
                            borderBottom: "1px solid var(--admin-border)",
                            background: "#ffffff",
                          }}
                        >
                          <td style={{ padding: "13px 14px", verticalAlign: "top" }}>
                            <div style={{ fontWeight: 750 }}>{worker.display_name}</div>
                            <div className="muted" style={{ fontSize: 12 }}>
                              {worker.email || "No email"}
                            </div>
                          </td>

                          <td style={{ padding: "13px 14px", verticalAlign: "top" }}>
                            {worker.business_id || "—"}
                          </td>

                          <td style={{ padding: "13px 14px", verticalAlign: "top" }}>
                            <span className="badge">{worker.subscription_pack}</span>
                          </td>

                          <td style={{ padding: "13px 14px", verticalAlign: "top" }}>
                            {formatCurrency(subscriptionPaid)}
                          </td>

                          <td
                            style={{
                              padding: "13px 14px",
                              verticalAlign: "top",
                              fontWeight: 800,
                              color: "var(--success)",
                            }}
                          >
                            {formatCurrency(organizationShare)}
                          </td>

                          <td style={{ padding: "13px 14px", verticalAlign: "top" }}>
                            {formatCurrency(platformShare)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}