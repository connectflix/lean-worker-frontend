import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { OrganizationWorkspaceHero } from "@/app/admin/organizations/components/organization-workspace-hero";
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
} as unknown as AdminOrganization;

const revenueSummary = {
  assignedWorkerCount: 12,
  paidWorkerCount: 8,
  grossSubscriptionRevenueExVat: 2400,
  organizationRevenueExVat: 600,
  platformRevenueExVat: 1800,
  revenueShareRate: 0.25,
};

describe("OrganizationWorkspaceHero B2B hierarchy", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "en");
  });

  it("exposes four distinct executive information zones", () => {
    render(
      <OrganizationWorkspaceHero
        selectedOrganization={organization}
        selectedWorkerSummary={null as AdminOrganizationWorkerSummary | null}
        selectedWorkerId={null}
        organizationRevenueSummary={revenueSummary}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    expect(
      screen.getByTestId("organization-hero-identity"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-hero-workforce"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-hero-revenue"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-hero-worker-context"),
    ).toBeInTheDocument();
  });

  it("promotes organization revenue as the primary financial signal", () => {
    render(
      <OrganizationWorkspaceHero
        selectedOrganization={organization}
        selectedWorkerSummary={null}
        selectedWorkerId={null}
        organizationRevenueSummary={revenueSummary}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    const revenueZone = screen.getByTestId("organization-hero-revenue");

    expect(revenueZone).toHaveAttribute(
      "data-emphasis",
      "primary",
    );

    expect(revenueZone).toHaveTextContent("Organization revenue");
    expect(revenueZone).toHaveTextContent("600");
    expect(revenueZone).toHaveTextContent("25% organization share");
  });

  it("keeps selected-worker signals grouped separately from organization KPIs", () => {
    render(
      <OrganizationWorkspaceHero
        selectedOrganization={organization}
        selectedWorkerSummary={null}
        selectedWorkerId={null}
        organizationRevenueSummary={revenueSummary}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />,
    );

    const workerContext = screen.getByTestId(
      "organization-hero-worker-context",
    );

    expect(workerContext).toHaveTextContent("Selected worker");
    expect(workerContext).toHaveTextContent("No worker selected");
    expect(workerContext).toHaveTextContent("Selected worker sessions");
    expect(workerContext).toHaveTextContent("Recommendations");

    const workforce = screen.getByTestId(
      "organization-hero-workforce",
    );

    expect(workforce).toHaveTextContent("Assigned workers");
    expect(workforce).toHaveTextContent("Paid workers");
    expect(workforce).not.toHaveTextContent("Selected worker sessions");
  });
});
