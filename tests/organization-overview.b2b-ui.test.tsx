import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationOverviewTab } from "@/app/admin/organizations/components/organization-overview-tab";
import type {
  AdminOrganization,
  AdminOrganizationWorkerSummary,
} from "@/lib/types";

const organization = {
  id: 42,
  code: "ACME",
  name: "Acme Belgium",
  description: "European transformation program.",
  organization_type: "premium",
  is_active: true,
  contact_email: "people@acme.test",
  contact_phone: "+32 2 000 00 00",
  calendly_event_type_uri: null,
} as unknown as AdminOrganization;

const revenueSummary = {
  assignedWorkerCount: 12,
  paidWorkerCount: 8,
  grossSubscriptionRevenueExVat: 2400,
  organizationRevenueExVat: 600,
  platformRevenueExVat: 1800,
  revenueShareRate: 0.25,
};

describe("OrganizationOverviewTab B2B hierarchy", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "en");
  });

  it("exposes four distinct executive overview zones", () => {
    render(
      <OrganizationOverviewTab
        selectedOrganization={organization}
        selectedWorkerSummary={null as AdminOrganizationWorkerSummary | null}
        selectedWorkerId={null}
        organizationRevenueSummary={revenueSummary}
        onNavigate={vi.fn()}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    expect(
      screen.getByTestId("organization-overview-details"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-overview-actions"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-overview-snapshot"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-overview-worker-context"),
    ).toBeInTheDocument();
  });

  it("keeps operational metrics separate from organization configuration", () => {
    render(
      <OrganizationOverviewTab
        selectedOrganization={organization}
        selectedWorkerSummary={null}
        selectedWorkerId={null}
        organizationRevenueSummary={revenueSummary}
        onNavigate={vi.fn()}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    const details = screen.getByTestId("organization-overview-details");
    const snapshot = screen.getByTestId("organization-overview-snapshot");

    expect(details).toHaveTextContent("Name");
    expect(details).toHaveTextContent("Business ID");
    expect(details).toHaveTextContent("Contact email");
    expect(details).toHaveTextContent("Calendly");

    expect(details).not.toHaveTextContent("Organization revenue");

    expect(snapshot).toHaveTextContent("Assigned workers");
    expect(snapshot).toHaveTextContent("Paid workers");
    expect(snapshot).toHaveTextContent("Organization revenue");
    expect(snapshot).toHaveTextContent("Platform share");
  });

  it("presents navigation actions as a dedicated workspace action area", () => {
    const onNavigate = vi.fn();

    render(
      <OrganizationOverviewTab
        selectedOrganization={organization}
        selectedWorkerSummary={null}
        selectedWorkerId={null}
        organizationRevenueSummary={revenueSummary}
        onNavigate={onNavigate}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    const actions = screen.getByTestId("organization-overview-actions");

    expect(actions).toHaveTextContent("Recommended next actions");

    const workersButton = screen.getByRole("button", {
      name: "Open workers",
    });

    const revenueButton = screen.getByRole("button", {
      name: "View revenue",
    });

    expect(workersButton).toBeEnabled();
    expect(revenueButton).toBeEnabled();

    expect(
      screen.getByRole("button", { name: "Review conversations" }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: "Open canvases" }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: "Worker insights" }),
    ).toBeDisabled();

    fireEvent.click(workersButton);
    expect(onNavigate).toHaveBeenCalledWith("workers");
  });

  it("isolates the selected worker context from organization-level information", () => {
    render(
      <OrganizationOverviewTab
        selectedOrganization={organization}
        selectedWorkerSummary={null}
        selectedWorkerId={null}
        organizationRevenueSummary={revenueSummary}
        onNavigate={vi.fn()}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    const workerContext = screen.getByTestId(
      "organization-overview-worker-context",
    );

    expect(workerContext).toHaveTextContent("Selected worker");
    expect(workerContext).toHaveTextContent("No worker");
    expect(workerContext).toHaveTextContent(
      "No worker selected yet",
    );

    expect(
      screen.getByRole("button", { name: "Select a worker" }),
    ).toBeInTheDocument();
  });
});
