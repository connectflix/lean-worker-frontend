"use client";

import type { AdminOrganization, AdminWorker } from "@/lib/types";

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
  detailLoading: boolean;

  onWorkerSearchChange: (value: string) => void;
  onSelectedWorkerIdToAssignChange: (value: string) => void;
  onAssignWorker: () => void;
  onUnassignWorker: (workerId: number) => void;
  onOpenWorker: (workerId: number) => void;

  getOrganizationTypeLabel: (type?: string | null) => string;
  getRequiredSubscriptionForOrganizationType: (
    type?: string | null,
  ) => "classique" | "flix" | "executif";
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-BE", {
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
  detailLoading,
  onWorkerSearchChange,
  onSelectedWorkerIdToAssignChange,
  onAssignWorker,
  onUnassignWorker,
  onOpenWorker,
  getOrganizationTypeLabel,
  getRequiredSubscriptionForOrganizationType,
}: OrganizationWorkersTabProps) {
  const requiredPack = getRequiredSubscriptionForOrganizationType(
    selectedOrganization.organization_type,
  );

  const paidWorkerCount = getPaidWorkerCount(assignedWorkers);
  const totalPaidAmount = getTotalPaidAmount(assignedWorkers);

  return (
    <div className="stack" style={{ gap: 16, minWidth: 0 }}>
      <div className="card stack" style={{ gap: 16 }}>
        <div
          className="row space-between"
          style={{
            gap: 14,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div className="stack" style={{ gap: 6 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">
                {selectedOrganization.code || `#${selectedOrganization.id}`}
              </span>

              <span className="badge">
                {getOrganizationTypeLabel(selectedOrganization.organization_type)}
              </span>

              <span className={selectedOrganization.is_active ? "badge success" : "badge warning"}>
                {selectedOrganization.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="section-title" style={{ fontSize: 20 }}>
              Assigned workers
            </div>

            <div className="muted" style={{ maxWidth: 820 }}>
              Manage the workers attached to this organization. Worker-level tabs such as
              conversations, canvases, and insights are unlocked after selecting a worker.
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="badge">{assignedWorkers.length} assigned</span>
            <span className="badge">{paidWorkerCount} paid</span>
            <span className="badge">required pack: {requiredPack}</span>
          </div>
        </div>

        <div className="admin-kpi-scroll">
          <div
            className="admin-kpi-row"
            style={{
              gridTemplateColumns: "repeat(4, minmax(190px, 1fr))",
              minWidth: 820,
            }}
          >
            <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
              <div className="muted">Assigned workers</div>
              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {assignedWorkers.length}
              </div>
            </div>

            <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
              <div className="muted">Paid workers</div>
              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {paidWorkerCount}
              </div>
            </div>

            <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
              <div className="muted">Subscription paid</div>
              <div className="admin-metric-value" style={{ fontSize: 24 }}>
                {formatCurrency(totalPaidAmount)}
              </div>
            </div>

            <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
              <div className="muted">Compatible pack</div>
              <div className="admin-metric-value" style={{ fontSize: 24 }}>
                {requiredPack}
              </div>
            </div>
          </div>
        </div>
      </div>

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
        <div className="card stack" style={{ gap: 14, minWidth: 0 }}>
          <div
            className="row space-between"
            style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">Worker directory</div>
              <div className="muted">
                {detailLoading
                  ? "Loading assigned workers..."
                  : `${filteredAssignedWorkers.length} worker(s) shown`}
              </div>
            </div>

            {selectedWorkerId ? (
              <span className="badge primary">selected worker #{selectedWorkerId}</span>
            ) : (
              <span className="badge">No worker selected</span>
            )}
          </div>

          <label className="stack" style={{ gap: 6 }}>
            <span className="muted">Search assigned workers</span>
            <input
              className="input"
              placeholder="Search by name, email, role, industry, business ID..."
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
              Standard workers cannot be assigned to any organization. This organization requires
              the <strong>{requiredPack}</strong> subscription pack.
            </div>
          </div>

          {detailLoading ? (
            <div className="card-soft muted">Loading assigned workers...</div>
          ) : filteredAssignedWorkers.length === 0 ? (
            <div className="card-soft muted">
              No assigned workers found for this search or organization.
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

                        {isSelected ? <span className="badge primary">Selected</span> : null}
                      </div>

                      <div
                        className="muted"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={worker.email || "No email"}
                      >
                        {worker.email || "No email"}
                      </div>

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
                            {normalizeLabel(subscriptionStatus)}
                          </span>
                        ) : null}

                        {worker.current_role ? (
                          <span className="badge">{worker.current_role}</span>
                        ) : null}

                        {worker.industry ? <span className="badge">{worker.industry}</span> : null}

                        <span className="badge">paid {formatCurrency(paidAmount)}</span>
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
                        Open
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
                          Unassign
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isPlatformAdmin ? (
          <div
            className="card stack"
            style={{
              gap: 14,
              position: "sticky",
              top: 92,
            }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">Assign compatible worker</div>
              <div className="muted">
                Only unassigned workers with the required subscription pack can be attached here.
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 8 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">
                  {getOrganizationTypeLabel(selectedOrganization.organization_type)}
                </span>
                <span className="badge primary">requires {requiredPack}</span>
              </div>

              <div className="muted">
                {assignableWorkers.length} compatible worker
                {assignableWorkers.length > 1 ? "s" : ""} available for assignment.
              </div>
            </div>

            <label className="stack" style={{ gap: 6 }}>
              <span className="muted">Compatible worker</span>
              <select
                className="select"
                value={selectedWorkerIdToAssign}
                onChange={(event) => onSelectedWorkerIdToAssignChange(event.target.value)}
                disabled={assigning || detailLoading || assignableWorkers.length === 0}
              >
                <option value="">
                  {assignableWorkers.length === 0
                    ? "No compatible worker available"
                    : "Select a worker to assign"}
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
              {assigning ? "Assigning..." : "Assign worker"}
            </button>

            <div className="fine-print">
              After assignment, the worker becomes available in this organization workspace for
              conversations, canvases, insights, bookings, and revenue tracking.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}