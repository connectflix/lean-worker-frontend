import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationWorkersTab } from "@/app/admin/organizations/components/organization-workers-tab";
import type { AdminOrganization, AdminWorker } from "@/lib/types";

const organization = {
  id: 42,
  code: "ACME",
  name: "Acme Belgium",
  organization_type: "premium",
  is_active: true,
} as unknown as AdminOrganization;

const worker = {
  id: 7,
  display_name: "Alex Worker",
  email: "alex@acme.test",
  business_id: "BE-007",
  subscription_pack: "flix",
  subscription_total_paid_eur: 120,
  current_role: "Product Manager",
  industry: "Technology",
  active_subscription: {
    status: "active",
    total_paid_eur: 120,
  },
} as unknown as AdminWorker;

describe("OrganizationWorkersTab B2B hierarchy", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "en");
  });

  it("exposes distinct workforce summary, directory, and assignment zones", () => {
    render(
      <OrganizationWorkersTab
        selectedOrganization={organization}
        assignedWorkers={[worker]}
        filteredAssignedWorkers={[worker]}
        assignableWorkers={[]}
        selectedWorkerId={null}
        selectedWorkerIdToAssign=""
        workerSearch=""
        isPlatformAdmin
        assigning={false}
        updatingWorkerEmail={false}
        detailLoading={false}
        onWorkerSearchChange={vi.fn()}
        onSelectedWorkerIdToAssignChange={vi.fn()}
        onAssignWorker={vi.fn()}
        onUnassignWorker={vi.fn()}
        onOpenWorker={vi.fn()}
        onUpdateWorkerEmail={vi.fn().mockResolvedValue(undefined)}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    expect(
      screen.getByTestId("organization-workers-summary"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-workers-directory"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-workers-assignment"),
    ).toBeInTheDocument();
  });

  it("keeps workforce metrics together in the summary area", () => {
    render(
      <OrganizationWorkersTab
        selectedOrganization={organization}
        assignedWorkers={[worker]}
        filteredAssignedWorkers={[worker]}
        assignableWorkers={[]}
        selectedWorkerId={null}
        selectedWorkerIdToAssign=""
        workerSearch=""
        isPlatformAdmin
        assigning={false}
        updatingWorkerEmail={false}
        detailLoading={false}
        onWorkerSearchChange={vi.fn()}
        onSelectedWorkerIdToAssignChange={vi.fn()}
        onAssignWorker={vi.fn()}
        onUnassignWorker={vi.fn()}
        onOpenWorker={vi.fn()}
        onUpdateWorkerEmail={vi.fn().mockResolvedValue(undefined)}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    const summary = screen.getByTestId("organization-workers-summary");

    expect(summary).toHaveTextContent("Assigned workers");
    expect(summary).toHaveTextContent("Paid workers");
    expect(summary).toHaveTextContent("Subscription paid");
    expect(summary).toHaveTextContent("Compatible pack");
  });

  it("keeps worker discovery separate from assignment administration", () => {
    render(
      <OrganizationWorkersTab
        selectedOrganization={organization}
        assignedWorkers={[worker]}
        filteredAssignedWorkers={[worker]}
        assignableWorkers={[]}
        selectedWorkerId={null}
        selectedWorkerIdToAssign=""
        workerSearch=""
        isPlatformAdmin
        assigning={false}
        updatingWorkerEmail={false}
        detailLoading={false}
        onWorkerSearchChange={vi.fn()}
        onSelectedWorkerIdToAssignChange={vi.fn()}
        onAssignWorker={vi.fn()}
        onUnassignWorker={vi.fn()}
        onOpenWorker={vi.fn()}
        onUpdateWorkerEmail={vi.fn().mockResolvedValue(undefined)}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    const directory = screen.getByTestId("organization-workers-directory");
    const assignment = screen.getByTestId("organization-workers-assignment");

    expect(directory).toHaveTextContent("Worker directory");
    expect(directory).toHaveTextContent("Search assigned workers");
    expect(directory).toHaveTextContent("Alex Worker");

    expect(directory).not.toHaveTextContent("Assign compatible worker");

    expect(assignment).toHaveTextContent("Assign compatible worker");
    expect(assignment).toHaveTextContent("Compatible worker");
  });
});
