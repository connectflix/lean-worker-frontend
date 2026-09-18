"use client";

import { getOrganizationOverviewCopy } from "@/lib/i18n/organization-overview";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";
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

function formatEur(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string | number;
  last?: boolean;
}) {
  return (
    <div
      className="row space-between"
      style={{
        gap: 16,
        alignItems: "flex-start",
        padding: "11px 0",
        borderBottom: last ? "0" : "1px solid var(--admin-border)",
      }}
    >
      <div
        className="muted"
        style={{
          fontSize: 12,
          lineHeight: 1.45,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 650,
          lineHeight: 1.45,
          textAlign: "right",
          maxWidth: "62%",
          wordBreak: "break-word",
          color: "var(--admin-ink)",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function SnapshotMetric({
  label,
  value,
  helper,
  emphasis = false,
}: {
  label: string;
  value: string | number;
  helper: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className="stack"
      style={{
        gap: 5,
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
          fontSize: emphasis ? 28 : 24,
          lineHeight: 1.08,
          color: emphasis
            ? "var(--admin-accent-hover)"
            : "var(--admin-ink)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={String(value)}
      >
        {value}
      </div>

      <div
        className="muted"
        style={{
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {helper}
      </div>
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
  const { uiLanguage } = useAdminUiLanguage();
  const copy = getOrganizationOverviewCopy(uiLanguage);

  const organizationCode =
    selectedOrganization.code || `#${selectedOrganization.id}`;

  const organizationTypeLabel = getOrganizationTypeLabel(
    selectedOrganization.organization_type,
  );

  const requiredPack = getRequiredSubscriptionForOrganizationType(
    selectedOrganization.organization_type,
  );

  const selectedWorker = selectedWorkerSummary?.worker ?? null;

  return (
    <div
      className="stack"
      style={{
        gap: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          gap: 16,
          alignItems: "stretch",
        }}
        className="organization-overview-top-grid"
      >
        <section
          data-testid="organization-overview-details"
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
              gap: 14,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div className="stack" style={{ gap: 5 }}>
              <div className="section-title">
                {copy.overview.title}
              </div>

              <div
                className="muted"
                style={{
                  maxWidth: 620,
                  lineHeight: 1.5,
                }}
              >
                {copy.overview.description}
              </div>
            </div>

            <span
              className={
                selectedOrganization.is_active
                  ? "badge success"
                  : "badge warning"
              }
            >
              {selectedOrganization.is_active
                ? copy.status.active
                : copy.status.inactive}
            </span>
          </div>

          <div
            style={{
              padding: "2px 0",
            }}
          >
            <InfoRow
              label={copy.overview.fields.name}
              value={selectedOrganization.name}
            />

            <InfoRow
              label={copy.overview.fields.businessId}
              value={organizationCode}
            />

            <InfoRow
              label={copy.overview.fields.type}
              value={organizationTypeLabel}
            />

            <InfoRow
              label={copy.overview.fields.requiredWorkerPack}
              value={requiredPack}
            />

            <InfoRow
              label={copy.overview.fields.contactEmail}
              value={selectedOrganization.contact_email || "—"}
            />

            <InfoRow
              label={copy.overview.fields.contactPhone}
              value={selectedOrganization.contact_phone || "—"}
            />

            <div
              className="row space-between"
              style={{
                gap: 16,
                alignItems: "center",
                padding: "11px 0",
              }}
            >
              <div className="muted" style={{ fontSize: 12 }}>
                {copy.overview.fields.calendly}
              </div>

              <span
                className={
                  selectedOrganization.calendly_event_type_uri
                    ? "badge success"
                    : "badge warning"
                }
              >
                {selectedOrganization.calendly_event_type_uri
                  ? copy.status.configured
                  : copy.status.notConfigured}
              </span>
            </div>
          </div>
        </section>

        <section
          data-testid="organization-overview-actions"
          className="card stack"
          style={{
            gap: 16,
            borderColor: "var(--admin-border)",
            background: "var(--admin-surface)",
          }}
        >
          <div className="stack" style={{ gap: 5 }}>
            <div className="section-title">
              {copy.overview.actions.title}
            </div>

            <div
              className="muted"
              style={{
                lineHeight: 1.5,
              }}
            >
              {copy.overview.actions.description}
            </div>
          </div>

          <div
            className="stack"
            style={{
              gap: 8,
            }}
          >
            <button
              className="button"
              type="button"
              onClick={() => onNavigate("workers")}
              style={{
                width: "100%",
                justifyContent: "flex-start",
              }}
            >
              {copy.overview.actions.openWorkers}
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("revenue")}
              style={{
                width: "100%",
                justifyContent: "flex-start",
              }}
            >
              {copy.overview.actions.viewRevenue}
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("conversations")}
              disabled={!selectedWorkerId}
              style={{
                width: "100%",
                justifyContent: "flex-start",
              }}
            >
              {copy.overview.actions.reviewConversations}
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("canvases")}
              disabled={!selectedWorkerId}
              style={{
                width: "100%",
                justifyContent: "flex-start",
              }}
            >
              {copy.overview.actions.openCanvases}
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("insights")}
              disabled={!selectedWorkerId}
              style={{
                width: "100%",
                justifyContent: "flex-start",
              }}
            >
              {copy.overview.actions.workerInsights}
            </button>
          </div>
        </section>
      </div>

      <section
        data-testid="organization-overview-snapshot"
        className="card stack"
        style={{
          gap: 18,
          borderColor: "var(--admin-border)",
          background: "var(--admin-surface)",
        }}
      >
        <div className="stack" style={{ gap: 5 }}>
          <div className="section-title">
            {copy.overview.snapshot.title}
          </div>

          <div
            className="muted"
            style={{
              maxWidth: 760,
              lineHeight: 1.5,
            }}
          >
            {copy.overview.snapshot.description}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 0,
            borderTop: "1px solid var(--admin-border)",
            borderBottom: "1px solid var(--admin-border)",
          }}
          className="organization-overview-metrics"
        >
          <div
            style={{
              padding: "18px 20px",
              borderRight: "1px solid var(--admin-border)",
            }}
          >
            <SnapshotMetric
              label={copy.common.assignedWorkers}
              value={organizationRevenueSummary.assignedWorkerCount}
              helper={copy.overview.snapshot.assignedWorkersHelper}
            />
          </div>

          <div
            style={{
              padding: "18px 20px",
              borderRight: "1px solid var(--admin-border)",
            }}
          >
            <SnapshotMetric
              label={copy.common.paidWorkers}
              value={organizationRevenueSummary.paidWorkerCount}
              helper={copy.overview.snapshot.paidWorkersHelper}
            />
          </div>

          <div
            style={{
              padding: "18px 20px",
              borderRight: "1px solid var(--admin-border)",
              background: "var(--admin-accent-softer)",
            }}
          >
            <SnapshotMetric
              label={copy.common.organizationRevenue}
              value={formatEur(
                organizationRevenueSummary.organizationRevenueExVat,
                copy.locale,
              )}
              helper={copy.overview.snapshot.organizationRevenueHelper(
                Math.round(
                  organizationRevenueSummary.revenueShareRate * 100,
                ),
              )}
              emphasis
            />
          </div>

          <div
            style={{
              padding: "18px 20px",
            }}
          >
            <SnapshotMetric
              label={copy.overview.snapshot.platformShare}
              value={formatEur(
                organizationRevenueSummary.platformRevenueExVat,
                copy.locale,
              )}
              helper={copy.overview.snapshot.platformShareHelper}
            />
          </div>
        </div>
      </section>

      <section
        data-testid="organization-overview-worker-context"
        className="card"
        style={{
          borderColor: "var(--admin-border)",
          background: selectedWorker
            ? "var(--admin-surface)"
            : "var(--admin-surface-muted)",
        }}
      >
        <div
          className="row space-between"
          style={{
            gap: 20,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div
            className="stack"
            style={{
              gap: 8,
              flex: "1 1 420px",
              minWidth: 0,
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
              <div
                className="section-title"
                style={{
                  fontSize: 16,
                }}
              >
                {copy.overview.worker.title}
              </div>

              {selectedWorker ? (
                <span className="badge primary">
                  {copy.overview.worker.selected}
                </span>
              ) : (
                <span className="badge warning">
                  {copy.overview.worker.none}
                </span>
              )}
            </div>

            <div
              className="muted"
              style={{
                lineHeight: 1.5,
              }}
            >
              {copy.overview.worker.description}
            </div>

            {selectedWorker ? (
              <>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 750,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.25,
                    color: "var(--admin-ink)",
                  }}
                >
                  {selectedWorker.display_name}
                </div>

                <div
                  className="muted"
                  style={{
                    fontSize: 13,
                  }}
                >
                  {selectedWorker.email || copy.overview.worker.noEmail}
                </div>

                {selectedWorker.current_role ||
                selectedWorker.profession ? (
                  <div
                    className="muted"
                    style={{
                      fontSize: 13,
                    }}
                  >
                    {selectedWorker.current_role ||
                      selectedWorker.profession}
                  </div>
                ) : null}

                <div
                  className="row"
                  style={{
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="badge">
                    {selectedWorker.subscription_pack}
                  </span>

                  <span className="badge">
                    {copy.overview.worker.sessions(
                      selectedWorkerSummary?.session_count ?? 0,
                    )}
                  </span>

                  <span className="badge">
                    {copy.overview.worker.externalConversations(
                      selectedWorkerSummary?.external_conversation_count ??
                        0,
                    )}
                  </span>

                  <span className="badge">
                    {copy.overview.worker.recommendations(
                      selectedWorkerSummary?.recommendation_count ?? 0,
                    )}
                  </span>

                  <span className="badge">
                    {copy.overview.worker.artifacts(
                      selectedWorkerSummary?.artifact_count ?? 0,
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div
                className="muted"
                style={{
                  maxWidth: 720,
                  lineHeight: 1.5,
                }}
              >
                {copy.overview.worker.emptyDescription}
              </div>
            )}
          </div>

          <div
            className="row"
            style={{
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              flex: "0 1 auto",
            }}
          >
            {selectedWorker ? (
              <>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => onNavigate("conversations")}
                >
                  {copy.overview.worker.conversationsAction}
                </button>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => onNavigate("insights")}
                >
                  {copy.overview.worker.insightsAction}
                </button>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => onNavigate("canvases")}
                >
                  {copy.overview.worker.canvasesAction}
                </button>
              </>
            ) : (
              <button
                className="button ghost"
                type="button"
                onClick={() => onNavigate("workers")}
              >
                {copy.overview.worker.selectAction}
              </button>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 980px) {
          .organization-overview-top-grid {
            grid-template-columns: 1fr !important;
          }

          .organization-overview-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .organization-overview-metrics > div:nth-child(2) {
            border-right: 0 !important;
          }

          .organization-overview-metrics > div:nth-child(-n + 2) {
            border-bottom: 1px solid var(--admin-border);
          }
        }

        @media (max-width: 620px) {
          .organization-overview-metrics {
            grid-template-columns: 1fr !important;
          }

          .organization-overview-metrics > div {
            border-right: 0 !important;
            border-bottom: 1px solid var(--admin-border);
          }

          .organization-overview-metrics > div:last-child {
            border-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
