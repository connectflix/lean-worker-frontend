"use client";

import { useEffect, useState } from "react";
import { getOrganizationWorkersRevenueCopy } from "@/lib/i18n/organization-workers-revenue";
import type { AdminOrganization, AdminWorker } from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

type OrganizationWorkersTabProps = {
  selectedOrganization: AdminOrganization;
  assignedWorkers: AdminWorker[];
  filteredAssignedWorkers: AdminWorker[];
  assignableWorkers: AdminWorker[];

  selectedWorkerId: number | null;
  selectedWorkerIdToAssign: string;
  workerSearch: string;

  isPlatformAdmin: boolean;
  assigning: boolean;
  updatingWorkerEmail: boolean;
  detailLoading: boolean;

  onWorkerSearchChange: (value: string) => void;
  onSelectedWorkerIdToAssignChange: (value: string) => void;
  onAssignWorker: () => void;
  onUnassignWorker: (workerId: number) => void;
  onOpenWorker: (workerId: number) => void;
  onUpdateWorkerEmail: (workerId: number, email: string) => Promise<void>;

  getOrganizationTypeLabel: (type?: string | null) => string;
  getRequiredSubscriptionForOrganizationType: (
    type?: string | null,
  ) => "classique" | "flix" | "executif";
};

function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
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

function normalizeLabel(value?: string | null): string {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(value?: string | null): string {
  const cleaned = (value || "").trim();

  if (!cleaned) return "W";

  const parts = cleaned.split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return "W";

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function getPaidWorkerCount(workers: AdminWorker[]): number {
  return workers.filter((worker) => getWorkerSubscriptionPaidExVat(worker) > 0).length;
}

function getTotalPaidAmount(workers: AdminWorker[]): number {
  return workers.reduce((total, worker) => total + getWorkerSubscriptionPaidExVat(worker), 0);
}

export function OrganizationWorkersTab({
  selectedOrganization,
  assignedWorkers,
  filteredAssignedWorkers,
  assignableWorkers,
  selectedWorkerId,
  selectedWorkerIdToAssign,
  workerSearch,
  isPlatformAdmin,
  assigning,
  updatingWorkerEmail,
  detailLoading,
  onWorkerSearchChange,
  onSelectedWorkerIdToAssignChange,
  onAssignWorker,
  onUnassignWorker,
  onOpenWorker,
  onUpdateWorkerEmail,
  getOrganizationTypeLabel,
  getRequiredSubscriptionForOrganizationType,
}: OrganizationWorkersTabProps) {
  const { uiLanguage } = useAdminUiLanguage();
  const copy = getOrganizationWorkersRevenueCopy(uiLanguage);

  const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (
      editingWorkerId !== null &&
      !assignedWorkers.some((worker) => worker.id === editingWorkerId)
    ) {
      setEditingWorkerId(null);
      setEmailDraft("");
      setEmailError(null);
    }
  }, [assignedWorkers, editingWorkerId]);

  function startEditingEmail(worker: AdminWorker) {
    setEditingWorkerId(worker.id);
    setEmailDraft(worker.email || "");
    setEmailError(null);
  }

  function cancelEditingEmail() {
    setEditingWorkerId(null);
    setEmailDraft("");
    setEmailError(null);
  }

  async function saveWorkerEmail(worker: AdminWorker) {
    const normalizedEmail = emailDraft.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError(copy.workers.emailRequired);
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setEmailError(copy.workers.invalidEmail);
      return;
    }

    try {
      setEmailError(null);
      await onUpdateWorkerEmail(worker.id, normalizedEmail);
      cancelEditingEmail();
    } catch (error) {
      setEmailError(
        error instanceof Error ? error.message : copy.workers.updateEmailError,
      );
    }
  }

  const requiredPack = getRequiredSubscriptionForOrganizationType(
    selectedOrganization.organization_type,
  );

  const paidWorkerCount = getPaidWorkerCount(assignedWorkers);
  const totalPaidAmount = getTotalPaidAmount(assignedWorkers);

  return (
    <div className="stack" style={{ gap: 16, minWidth: 0 }}>
      <section
        data-testid="organization-workers-summary"
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
          <div className="stack" style={{ gap: 7, minWidth: 0 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">
                {selectedOrganization.code || `#${selectedOrganization.id}`}
              </span>

              <span className="badge">
                {getOrganizationTypeLabel(selectedOrganization.organization_type)}
              </span>

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
              className="section-title"
              style={{
                fontSize: 21,
                letterSpacing: "-0.025em",
              }}
            >
              {copy.workers.title}
            </div>

            <div
              className="muted"
              style={{
                maxWidth: 760,
                lineHeight: 1.5,
              }}
            >
              {copy.workers.description}
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="badge">
              {copy.workers.assignedCount(assignedWorkers.length)}
            </span>
            <span className="badge">
              {copy.workers.paidCount(paidWorkerCount)}
            </span>
            <span className="badge">
              {copy.workers.requiredPack(requiredPack)}
            </span>
          </div>
        </div>

        <div
          className="organization-workers-metrics"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          }}
        >
          <div
            className="stack"
            style={{
              gap: 5,
              padding: "18px 22px",
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
              {copy.workers.assignedWorkers}
            </div>
            <div className="admin-metric-value" style={{ fontSize: 27 }}>
              {assignedWorkers.length}
            </div>
          </div>

          <div
            className="stack"
            style={{
              gap: 5,
              padding: "18px 22px",
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
              {copy.workers.paidWorkers}
            </div>
            <div className="admin-metric-value" style={{ fontSize: 27 }}>
              {paidWorkerCount}
            </div>
          </div>

          <div
            className="stack"
            style={{
              gap: 5,
              padding: "18px 22px",
              borderRight: "1px solid var(--admin-border)",
              background: "var(--admin-accent-softer)",
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
              {copy.workers.subscriptionPaid}
            </div>
            <div
              className="admin-metric-value"
              style={{
                fontSize: 25,
                color: "var(--admin-accent-hover)",
              }}
            >
              {formatCurrency(totalPaidAmount, copy.locale)}
            </div>
          </div>

          <div
            className="stack"
            style={{
              gap: 5,
              padding: "18px 22px",
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
              {copy.workers.compatiblePack}
            </div>
            <div
              className="admin-metric-value"
              style={{
                fontSize: 25,
                textTransform: "capitalize",
              }}
            >
              {requiredPack}
            </div>
          </div>
        </div>
      </section>

      <div
        className="grid"
        style={{
          gridTemplateColumns: isPlatformAdmin
            ? "minmax(0, 1fr) minmax(340px, 0.72fr)"
            : "minmax(0, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <section
          data-testid="organization-workers-directory"
          className="card stack"
          style={{
            gap: 14,
            minWidth: 0,
            borderColor: "var(--admin-border)",
            background: "var(--admin-surface)",
          }}
        >
          <div
            className="row space-between"
            style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">{copy.workers.directoryTitle}</div>
              <div className="muted">
                {detailLoading
                  ? copy.workers.loadingAssignedWorkers
                  : copy.workers.workersShown(filteredAssignedWorkers.length)}
              </div>
            </div>

            {selectedWorkerId ? (
              <span className="badge primary">{copy.workers.selectedWorker(selectedWorkerId)}</span>
            ) : (
              <span className="badge">{copy.workers.noWorkerSelected}</span>
            )}
          </div>

          <label className="stack" style={{ gap: 6 }}>
            <span className="muted">{copy.workers.searchLabel}</span>
            <input
              className="input"
              placeholder={copy.workers.searchPlaceholder}
              value={workerSearch}
              onChange={(event) => onWorkerSearchChange(event.target.value)}
            />
          </label>

          <div
            className="card-soft"
            style={{
              padding: 12,
              borderRadius: 16,
            }}
          >
            <div className="muted">
              {copy.workers.compatibilityNotice(requiredPack)}
            </div>
          </div>

          {detailLoading ? (
            <div className="card-soft muted">{copy.workers.loadingAssignedWorkers}</div>
          ) : filteredAssignedWorkers.length === 0 ? (
            <div className="card-soft muted">
              {copy.workers.emptySearch}
            </div>
          ) : (
            <div
              className="stack scroll-panel"
              style={{
                maxHeight: "calc(100vh - 430px)",
                minHeight: 360,
                gap: 10,
              }}
            >
              {filteredAssignedWorkers.map((worker) => {
                const isSelected = selectedWorkerId === worker.id;
                const paidAmount = getWorkerSubscriptionPaidExVat(worker);
                const subscriptionStatus = worker.active_subscription?.status ?? null;

                return (
                  <div
                    key={worker.id}
                    className="card-soft"
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenWorker(worker.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpenWorker(worker.id);
                      }
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto minmax(0, 1fr) auto",
                      gap: 12,
                      alignItems: "center",
                      border: isSelected
                        ? "1px solid var(--admin-accent)"
                        : "1px solid var(--admin-border)",
                      background: isSelected ? "var(--admin-accent-soft)" : "#ffffff",
                      cursor: "pointer",
                      textAlign: "left",
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <div
                      className="avatar-circle"
                      style={{
                        width: 38,
                        height: 38,
                        background: isSelected ? "var(--admin-accent)" : "var(--primary-soft)",
                        color: isSelected ? "#ffffff" : "var(--primary)",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(worker.display_name)}
                    </div>

                    <div className="stack" style={{ gap: 5, minWidth: 0 }}>
                      <div
                        className="row"
                        style={{
                          gap: 8,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: 15,
                            letterSpacing: "-0.02em",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 340,
                          }}
                          title={worker.display_name}
                        >
                          {worker.display_name}
                        </strong>

                        {isSelected ? <span className="badge primary">{copy.workers.selected}</span> : null}
                      </div>

                      {editingWorkerId === worker.id ? (
                        <div
                          className="stack"
                          style={{ gap: 8 }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            className="input"
                            type="email"
                            value={emailDraft}
                            autoFocus
                            disabled={updatingWorkerEmail}
                            onChange={(event) => {
                              setEmailDraft(event.target.value);
                              setEmailError(null);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                void saveWorkerEmail(worker);
                              }

                              if (event.key === "Escape") {
                                event.preventDefault();
                                cancelEditingEmail();
                              }
                            }}
                            aria-label={copy.workers.emailAriaLabel(worker.display_name)}
                          />

                          {emailError ? (
                            <div className="fine-print" style={{ color: "var(--danger)" }}>
                              {emailError}
                            </div>
                          ) : null}

                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <button
                              className="button"
                              type="button"
                              disabled={updatingWorkerEmail}
                              onClick={() => void saveWorkerEmail(worker)}
                            >
                              {updatingWorkerEmail
                                ? copy.workers.saving
                                : copy.workers.saveEmail}
                            </button>

                            <button
                              className="button ghost"
                              type="button"
                              disabled={updatingWorkerEmail}
                              onClick={cancelEditingEmail}
                            >
                              {copy.workers.cancel}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <div
                            className="muted"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              minWidth: 0,
                              flex: "1 1 auto",
                            }}
                            title={worker.email || copy.workers.noEmail}
                          >
                            {worker.email || copy.workers.noEmail}
                          </div>

                          {isPlatformAdmin ? (
                            <button
                              className="button ghost"
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                startEditingEmail(worker);
                              }}
                              style={{ minHeight: 32, padding: "6px 10px" }}
                            >
                              {copy.workers.editEmail}
                            </button>
                          ) : null}
                        </div>
                      )}

                      <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                        <span className="badge">#{worker.id}</span>

                        {worker.business_id ? (
                          <span className="badge">{worker.business_id}</span>
                        ) : null}

                        <span className="badge">{worker.subscription_pack}</span>

                        {subscriptionStatus ? (
                          <span
                            className={
                              subscriptionStatus === "active"
                                ? "badge success"
                                : subscriptionStatus === "past_due"
                                  ? "badge warning"
                                  : "badge"
                            }
                          >
                            {copy.workers.subscriptionStatuses[subscriptionStatus] ??
                            normalizeLabel(subscriptionStatus)}
                          </span>
                        ) : null}

                        {worker.current_role ? (
                          <span className="badge">{worker.current_role}</span>
                        ) : null}

                        {worker.industry ? <span className="badge">{worker.industry}</span> : null}

                        <span className="badge">{copy.workers.paidAmount(
                          formatCurrency(paidAmount, copy.locale),
                        )}</span>
                      </div>
                    </div>

                    <div
                      className="row"
                      style={{
                        gap: 8,
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className={isSelected ? "button" : "button ghost"}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenWorker(worker.id);
                        }}
                      >
                        {copy.workers.open}
                      </button>

                      {isPlatformAdmin ? (
                        <button
                          className="button ghost"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onUnassignWorker(worker.id);
                          }}
                          disabled={assigning}
                          style={{ color: "var(--danger)" }}
                        >
                          {copy.workers.unassign}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {isPlatformAdmin ? (
          <section
            data-testid="organization-workers-assignment"
            className="card stack"
            style={{
              gap: 14,
              position: "sticky",
              top: 92,
            }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">{copy.workers.assignTitle}</div>
              <div className="muted">
                {copy.workers.assignDescription}
              </div>
            </div>

            <div
              className="stack"
              style={{
                gap: 9,
                padding: "12px 0",
                borderTop: "1px solid var(--admin-border)",
                borderBottom: "1px solid var(--admin-border)",
              }}
            >
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">
                  {getOrganizationTypeLabel(selectedOrganization.organization_type)}
                </span>
                <span className="badge primary">
                  {copy.workers.requiresPack(requiredPack)}
                </span>
              </div>

              <div className="muted">
                {copy.workers.compatibleAvailable(assignableWorkers.length)}
              </div>
            </div>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">{copy.workers.compatibleWorker}</span>
              <select
                className="select"
                value={selectedWorkerIdToAssign}
                onChange={(event) => onSelectedWorkerIdToAssignChange(event.target.value)}
                disabled={assigning || detailLoading || assignableWorkers.length === 0}
              >
                <option value="">
                  {assignableWorkers.length === 0
                    ? copy.workers.noCompatibleWorker
                    : copy.workers.selectWorkerToAssign}
                </option>

                {assignableWorkers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    #{worker.id} — {worker.display_name} — {worker.subscription_pack}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="button"
              type="button"
              onClick={onAssignWorker}
              disabled={
                assigning ||
                detailLoading ||
                !selectedWorkerIdToAssign ||
                assignableWorkers.length === 0
              }
              style={{
                width: "100%",
              }}
            >
              {assigning ? copy.workers.assigning : copy.workers.assignWorker}
            </button>

            <div className="fine-print">
              {copy.workers.assignFooter}
            </div>
          </section>
        ) : null}
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          .organization-workers-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .organization-workers-metrics > div:nth-child(2) {
            border-right: 0 !important;
          }

          .organization-workers-metrics > div:nth-child(-n + 2) {
            border-bottom: 1px solid var(--admin-border);
          }
        }

        @media (max-width: 620px) {
          .organization-workers-metrics {
            grid-template-columns: 1fr !important;
          }

          .organization-workers-metrics > div {
            border-right: 0 !important;
            border-bottom: 1px solid var(--admin-border);
          }

          .organization-workers-metrics > div:last-child {
            border-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}