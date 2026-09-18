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
  const { uiLanguage } = useAdminUiLanguage();
  const copy = getOrganizationOverviewCopy(uiLanguage);

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
            <div className="section-title">{copy.overview.title}</div>
            <div className="muted">
              {copy.overview.description}
            </div>
          </div>

          <span
            className={selectedOrganization.is_active ? "badge success" : "badge warning"}
          >
            {selectedOrganization.is_active
              ? copy.status.active
              : copy.status.inactive}
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
          <InfoRow label={copy.overview.fields.name} value={selectedOrganization.name} />
          <InfoRow label={copy.overview.fields.businessId} value={organizationCode} />
          <InfoRow label={copy.overview.fields.type} value={organizationTypeLabel} />
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
              gap: 12,
              alignItems: "flex-start",
              padding: "10px 0",
            }}
          >
            <div className="muted" style={{ fontSize: 13 }}>
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

        <div
          className="card-soft stack"
          style={{
            gap: 10,
            background: "rgba(255,255,255,0.72)",
          }}
        >
          <div className="section-title" style={{ fontSize: 15 }}>
            {copy.overview.actions.title}
          </div>

          <div className="muted">
            {copy.overview.actions.description}
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button"
              type="button"
              onClick={() => onNavigate("workers")}
            >
              {copy.overview.actions.openWorkers}
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("revenue")}
            >
              {copy.overview.actions.viewRevenue}
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("conversations")}
              disabled={!selectedWorkerId}
            >
              {copy.overview.actions.reviewConversations}
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("canvases")}
              disabled={!selectedWorkerId}
            >
              {copy.overview.actions.openCanvases}
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => onNavigate("insights")}
              disabled={!selectedWorkerId}
            >
              {copy.overview.actions.workerInsights}
            </button>
          </div>
        </div>
      </div>

      <div className="card stack" style={{ gap: 18 }}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="section-title">{copy.overview.snapshot.title}</div>
          <div className="muted">
            {copy.overview.snapshot.description}
          </div>
        </div>

        <div className="grid grid-2">
          <MetricCard
            label={copy.common.assignedWorkers}
            value={organizationRevenueSummary.assignedWorkerCount}
            helper={copy.overview.snapshot.assignedWorkersHelper}
          />

          <MetricCard
            label={copy.common.paidWorkers}
            value={organizationRevenueSummary.paidWorkerCount}
            helper={copy.overview.snapshot.paidWorkersHelper}
          />

          <MetricCard
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

          <MetricCard
            label={copy.overview.snapshot.platformShare}
            value={formatEur(
              organizationRevenueSummary.platformRevenueExVat,
              copy.locale,
            )}
            helper={copy.overview.snapshot.platformShareHelper}
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
                {copy.overview.worker.title}
              </div>
              <div className="muted">
                {copy.overview.worker.description}
              </div>
            </div>

            {selectedWorker ? (
              <span className="badge primary">{copy.overview.worker.selected}</span>
            ) : (
              <span className="badge warning">{copy.overview.worker.none}</span>
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

                <div className="muted">
                  {selectedWorker.email || copy.overview.worker.noEmail}
                </div>

                {selectedWorker.current_role || selectedWorker.profession ? (
                  <div className="muted">
                    {selectedWorker.current_role || selectedWorker.profession}
                  </div>
                ) : null}
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">{selectedWorker.subscription_pack}</span>
                <span className="badge">
                  {copy.overview.worker.sessions(
                    selectedWorkerSummary?.session_count ?? 0,
                  )}
                </span>
                <span className="badge">
                  {copy.overview.worker.externalConversations(
                    selectedWorkerSummary?.external_conversation_count ?? 0,
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

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
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
              </div>
            </>
          ) : (
            <>
              <div className="muted">
                {copy.overview.worker.emptyDescription}
              </div>

              <div>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => onNavigate("workers")}
                >
                  {copy.overview.worker.selectAction}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}