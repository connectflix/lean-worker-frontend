"use client";

import { getOrganizationWorkersRevenueCopy } from "@/lib/i18n/organization-workers-revenue";
import type { AdminOrganization, AdminWorker } from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

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

function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
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

export function OrganizationRevenueTab({
  selectedOrganization,
  assignedWorkers,
  organizationRevenueSummary,
}: OrganizationRevenueTabProps) {
  const { uiLanguage } = useAdminUiLanguage();
  const copy = getOrganizationWorkersRevenueCopy(uiLanguage);
  const shareRate = organizationRevenueSummary.revenueShareRate;
  const platformShareRate = 1 - shareRate;

  return (
    <div className="stack" style={{ gap: 16 }}>
      <section
        data-testid="organization-revenue-summary"
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
          className="row space-between"
          style={{
            gap: 18,
            flexWrap: "wrap",
            alignItems: "flex-start",
            padding: "20px 22px",
            borderBottom: "1px solid var(--admin-border)",
          }}
        >
          <div className="stack" style={{ gap: 7, maxWidth: 760 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">
                {selectedOrganization.code || `#${selectedOrganization.id}`}
              </span>

              <span className="badge">
                {copy.revenue.shareRate(
                  formatPercent(organizationRevenueSummary.revenueShareRate),
                )}
              </span>
            </div>

            <div
              className="section-title"
              style={{
                fontSize: 21,
                letterSpacing: "-0.025em",
              }}
            >
              {copy.revenue.title}
            </div>

            <div
              className="muted"
              style={{
                lineHeight: 1.5,
              }}
            >
              {copy.revenue.description(
                formatPercent(shareRate),
                formatPercent(platformShareRate),
              )}
            </div>
          </div>

          <div
            style={{
              minWidth: 260,
              paddingLeft: 18,
              borderLeft: "1px solid var(--admin-border)",
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
              {copy.revenue.calculationRule}
            </div>

            <div
              style={{
                marginTop: 7,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                fontSize: 19,
              }}
            >
              {copy.revenue.calculationSplit(
                formatPercent(shareRate),
                formatPercent(platformShareRate),
              )}
            </div>
          </div>
        </div>

        <div
          data-testid="organization-revenue-metrics"
          className="organization-revenue-metrics"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
          }}
        >
          <div
            data-testid="organization-revenue-primary-metric"
            data-emphasis="primary"
            className="stack"
            style={{
              gap: 7,
              padding: "20px 22px",
              borderRight: "1px solid var(--admin-border)",
              background: "rgba(21, 128, 61, 0.06)",
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
              {copy.revenue.organizationRevenue}
            </div>

            <div
              className="admin-metric-value"
              style={{
                fontSize: 30,
                color: "var(--success)",
                letterSpacing: "-0.04em",
              }}
            >
              {formatCurrency(
                organizationRevenueSummary.organizationRevenueExVat,
                copy.locale,
              )}
            </div>

            <div className="fine-print" style={{ lineHeight: 1.45 }}>
              {copy.revenue.organizationRevenueHelper(
                formatPercent(shareRate),
              )}
            </div>
          </div>

          <div
            className="stack"
            style={{
              gap: 7,
              padding: "20px 22px",
              borderRight: "1px solid var(--admin-border)",
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
              {copy.revenue.grossSubscriptions}
            </div>

            <div className="admin-metric-value" style={{ fontSize: 24 }}>
              {formatCurrency(
                organizationRevenueSummary.grossSubscriptionRevenueExVat,
                copy.locale,
              )}
            </div>

            <div className="fine-print" style={{ lineHeight: 1.45 }}>
              {copy.revenue.grossSubscriptionsHelper}
            </div>
          </div>

          <div
            className="stack"
            style={{
              gap: 7,
              padding: "20px 22px",
              borderRight: "1px solid var(--admin-border)",
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
              {copy.revenue.platformShare}
            </div>

            <div className="admin-metric-value" style={{ fontSize: 24 }}>
              {formatCurrency(
                organizationRevenueSummary.platformRevenueExVat,
                copy.locale,
              )}
            </div>

            <div className="fine-print" style={{ lineHeight: 1.45 }}>
              {copy.revenue.platformShareHelper(
                formatPercent(platformShareRate),
              )}
            </div>
          </div>

          <div
            className="stack"
            style={{
              gap: 7,
              padding: "20px 22px",
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
              {copy.revenue.averageRevenue}
            </div>

            <div className="admin-metric-value" style={{ fontSize: 24 }}>
              {organizationRevenueSummary.paidWorkerCount > 0
                ? formatCurrency(
                    organizationRevenueSummary.organizationRevenueExVat /
                      organizationRevenueSummary.paidWorkerCount,
                    copy.locale,
                  )
                : formatCurrency(0, copy.locale)}
            </div>

            <div className="fine-print" style={{ lineHeight: 1.45 }}>
              {copy.revenue.averageRevenueHelper}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            borderTop: "1px solid var(--admin-border)",
            background: "var(--admin-surface-muted)",
          }}
        >
          <div
            className="stack"
            style={{
              gap: 4,
              padding: "14px 22px",
              borderRight: "1px solid var(--admin-border)",
            }}
          >
            <div className="muted">{copy.revenue.assignedWorkers}</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {organizationRevenueSummary.assignedWorkerCount}
            </div>
            <div className="fine-print">
              {copy.revenue.assignedWorkersHelper}
            </div>
          </div>

          <div
            className="stack"
            style={{
              gap: 4,
              padding: "14px 22px",
            }}
          >
            <div className="muted">{copy.revenue.paidWorkers}</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {organizationRevenueSummary.paidWorkerCount}
            </div>
            <div className="fine-print">
              {copy.revenue.paidWorkersHelper}
            </div>
          </div>
        </div>
      </section>

      <section
        data-testid="organization-revenue-details"
        className="card stack"
        style={{
          gap: 14,
          borderColor: "var(--admin-border)",
          background: "var(--admin-surface)",
        }}
      >
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">{copy.revenue.detailsTitle}</div>
            <div className="muted">
              {copy.revenue.detailsDescription}
            </div>
          </div>

          <span className="badge">{copy.revenue.workerCount(assignedWorkers.length)}</span>
        </div>

        {assignedWorkers.length === 0 ? (
          <div className="card-soft muted">{copy.revenue.empty}</div>
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
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>{copy.revenue.columns.worker}</th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>{copy.revenue.columns.businessId}</th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>{copy.revenue.columns.pack}</th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>
                        {copy.revenue.columns.subscriptionPaid}
                      </th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>
                        {copy.revenue.columns.organizationShare}
                      </th>
                      <th style={{ padding: "12px 14px", fontSize: 12 }}>{copy.revenue.columns.platformShare}</th>
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
                              {worker.email || copy.revenue.noEmail}
                            </div>
                          </td>

                          <td style={{ padding: "13px 14px", verticalAlign: "top" }}>
                            {worker.business_id || "—"}
                          </td>

                          <td style={{ padding: "13px 14px", verticalAlign: "top" }}>
                            <span className="badge">{worker.subscription_pack}</span>
                          </td>

                          <td style={{ padding: "13px 14px", verticalAlign: "top" }}>
                            {formatCurrency(subscriptionPaid, copy.locale)}
                          </td>

                          <td
                            style={{
                              padding: "13px 14px",
                              verticalAlign: "top",
                              fontWeight: 800,
                              color: "var(--success)",
                            }}
                          >
                            {formatCurrency(organizationShare, copy.locale)}
                          </td>

                          <td style={{ padding: "13px 14px", verticalAlign: "top" }}>
                            {formatCurrency(platformShare, copy.locale)}
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
      </section>

      <style jsx>{`
        @media (max-width: 1100px) {
          .organization-revenue-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .organization-revenue-metrics > div:nth-child(2) {
            border-right: 0 !important;
          }

          .organization-revenue-metrics > div:nth-child(-n + 2) {
            border-bottom: 1px solid var(--admin-border);
          }
        }

        @media (max-width: 680px) {
          .organization-revenue-metrics {
            grid-template-columns: 1fr !important;
          }

          .organization-revenue-metrics > div {
            border-right: 0 !important;
            border-bottom: 1px solid var(--admin-border);
          }

          .organization-revenue-metrics > div:last-child {
            border-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}