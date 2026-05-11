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

export function OrganizationRevenueTab({
  selectedOrganization,
  assignedWorkers,
  organizationRevenueSummary,
}: OrganizationRevenueTabProps) {
  return (
    <div className="card stack" style={{ gap: 16 }}>
      <div
        className="row space-between"
        style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">Organization revenue dashboard</div>
          <div className="muted">
            Revenue is calculated from the total paid subscription amount of assigned workers.
            Organization share is 75% ex-VAT.
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="badge">
            {selectedOrganization.code || `#${selectedOrganization.id}`}
          </span>
          <span className="badge">
            share rate: {Math.round(organizationRevenueSummary.revenueShareRate * 100)}%
          </span>
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
            <div className="muted">Gross subscriptions ex-VAT</div>
            <div className="admin-metric-value" style={{ fontSize: 24 }}>
              {formatCurrency(organizationRevenueSummary.grossSubscriptionRevenueExVat)}
            </div>
          </div>

          <div
            className="card-soft stack admin-kpi-card"
            style={{
              gap: 6,
              border: "1px solid rgba(34,197,94,0.3)",
              background: "rgba(34,197,94,0.08)",
            }}
          >
            <div className="muted">Organization revenue ex-VAT</div>
            <div className="admin-metric-value" style={{ fontSize: 24, color: "#15803d" }}>
              {formatCurrency(organizationRevenueSummary.organizationRevenueExVat)}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Platform share ex-VAT</div>
            <div className="admin-metric-value" style={{ fontSize: 24 }}>
              {formatCurrency(organizationRevenueSummary.platformRevenueExVat)}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Calculation rule</div>
            <div className="admin-metric-value" style={{ fontSize: 16 }}>
              75% organization / 25% platform
            </div>
          </div>
        </div>
      </div>

      <div className="card-soft stack" style={{ gap: 10 }}>
        <div className="section-title" style={{ fontSize: 15 }}>
          Revenue details by assigned worker
        </div>

        {assignedWorkers.length === 0 ? (
          <div className="muted">No assigned worker yet. Revenue is currently zero.</div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 860,
              }}
            >
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "10px 8px" }}>Worker</th>
                  <th style={{ padding: "10px 8px" }}>Business ID</th>
                  <th style={{ padding: "10px 8px" }}>Pack</th>
                  <th style={{ padding: "10px 8px" }}>Total paid subscription ex-VAT</th>
                  <th style={{ padding: "10px 8px" }}>Organization share 75%</th>
                  <th style={{ padding: "10px 8px" }}>Platform share 25%</th>
                </tr>
              </thead>

              <tbody>
                {assignedWorkers.map((worker) => {
                  const subscriptionPaid = getWorkerSubscriptionPaidExVat(worker);
                  const organizationShare = subscriptionPaid * 0.75;
                  const platformShare = subscriptionPaid * 0.25;

                  return (
                    <tr key={worker.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ fontWeight: 800 }}>{worker.display_name}</div>
                        <div className="muted">{worker.email || "No email"}</div>
                      </td>

                      <td style={{ padding: "10px 8px" }}>{worker.business_id || "—"}</td>

                      <td style={{ padding: "10px 8px" }}>
                        <span className="badge">{worker.subscription_pack}</span>
                      </td>

                      <td style={{ padding: "10px 8px" }}>
                        {formatCurrency(subscriptionPaid)}
                      </td>

                      <td style={{ padding: "10px 8px", fontWeight: 800, color: "#15803d" }}>
                        {formatCurrency(organizationShare)}
                      </td>

                      <td style={{ padding: "10px 8px" }}>
                        {formatCurrency(platformShare)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}