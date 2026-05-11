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
  return (
    <div className="card stack">
      <div
        className="row space-between"
        style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
      >
        <div className="section-title">Assigned workers</div>
        <div className="muted">{assignedWorkers.length} worker(s) assigned</div>
      </div>

      <div className="card-soft stack" style={{ gap: 8 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="badge">
            {getOrganizationTypeLabel(selectedOrganization.organization_type)}
          </span>

          <span className="badge">
            required pack:{" "}
            {getRequiredSubscriptionForOrganizationType(
              selectedOrganization.organization_type,
            )}
          </span>
        </div>

        <div className="muted">
          Standard workers can never be assigned to any organization.
        </div>
      </div>

      <input
        className="input"
        placeholder="Search assigned workers..."
        value={workerSearch}
        onChange={(event) => onWorkerSearchChange(event.target.value)}
      />

      {isPlatformAdmin ? (
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <select
            className="select"
            value={selectedWorkerIdToAssign}
            onChange={(event) => onSelectedWorkerIdToAssignChange(event.target.value)}
            disabled={assigning || detailLoading}
          >
            <option value="">Select a compatible worker to assign</option>

            {assignableWorkers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                #{worker.id} — {worker.display_name} — {worker.subscription_pack}
              </option>
            ))}
          </select>

          <button
            className="button"
            type="button"
            onClick={onAssignWorker}
            disabled={assigning || detailLoading || !selectedWorkerIdToAssign}
          >
            {assigning ? "Assigning..." : "Assign worker"}
          </button>
        </div>
      ) : null}

      {detailLoading ? (
        <div className="muted">Loading assigned workers...</div>
      ) : filteredAssignedWorkers.length === 0 ? (
        <div className="muted">No assigned workers found.</div>
      ) : (
        <div
          className="stack"
          style={{ maxHeight: "56vh", overflowY: "auto", paddingRight: 6, gap: 12 }}
        >
          {filteredAssignedWorkers.map((worker) => {
            const isSelected = selectedWorkerId === worker.id;
            const paidAmount = getWorkerSubscriptionPaidExVat(worker);

            return (
              <div
                key={worker.id}
                className="card-soft stack"
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
                  gap: 8,
                  border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  className="row space-between"
                  style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
                >
                  <div className="stack" style={{ gap: 6 }}>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge">#{worker.id}</span>

                      {worker.business_id ? (
                        <span className="badge">{worker.business_id}</span>
                      ) : null}

                      <span className="badge">{worker.subscription_pack}</span>

                      {worker.current_role ? (
                        <span className="badge">{worker.current_role}</span>
                      ) : null}

                      <span className="badge">paid {formatCurrency(paidAmount)}</span>
                    </div>

                    <div className="section-title" style={{ fontSize: 16 }}>
                      {worker.display_name}
                    </div>

                    <div className="muted">{worker.email || "No email"}</div>
                  </div>

                  {isPlatformAdmin ? (
                    <button
                      className="button ghost"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onUnassignWorker(worker.id);
                      }}
                      disabled={assigning}
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
  );
}