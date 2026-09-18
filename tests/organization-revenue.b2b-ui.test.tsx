import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { OrganizationRevenueTab } from "@/app/admin/organizations/components/organization-revenue-tab";
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
  active_subscription: {
    status: "active",
    total_paid_eur: 120,
  },
} as unknown as AdminWorker;

const revenueSummary = {
  assignedWorkerCount: 1,
  paidWorkerCount: 1,
  grossSubscriptionRevenueExVat: 120,
  organizationRevenueExVat: 30,
  platformRevenueExVat: 90,
  revenueShareRate: 0.25,
};

describe("OrganizationRevenueTab B2B hierarchy", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "en");
  });

  it("exposes distinct revenue summary, metrics, and worker-detail zones", () => {
    render(
      <OrganizationRevenueTab
        selectedOrganization={organization}
        assignedWorkers={[worker]}
        organizationRevenueSummary={revenueSummary}
      />,
    );

    expect(
      screen.getByTestId("organization-revenue-summary"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-revenue-metrics"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-revenue-details"),
    ).toBeInTheDocument();
  });

  it("makes organization revenue the primary financial outcome", () => {
    render(
      <OrganizationRevenueTab
        selectedOrganization={organization}
        assignedWorkers={[worker]}
        organizationRevenueSummary={revenueSummary}
      />,
    );

    const metrics = screen.getByTestId("organization-revenue-metrics");
    const primary = screen.getByTestId(
      "organization-revenue-primary-metric",
    );

    expect(metrics).toHaveTextContent("Gross subscriptions ex-VAT");
    expect(metrics).toHaveTextContent("Organization revenue ex-VAT");
    expect(metrics).toHaveTextContent("Platform share ex-VAT");
    expect(metrics).toHaveTextContent("Average revenue / paid worker");

    expect(primary).toHaveTextContent("Organization revenue ex-VAT");
    expect(primary).toHaveTextContent("€30.00");
    expect(primary).toHaveAttribute("data-emphasis", "primary");
  });

  it("keeps revenue mechanics separate from worker-level detail", () => {
    render(
      <OrganizationRevenueTab
        selectedOrganization={organization}
        assignedWorkers={[worker]}
        organizationRevenueSummary={revenueSummary}
      />,
    );

    const summary = screen.getByTestId("organization-revenue-summary");
    const details = screen.getByTestId("organization-revenue-details");

    expect(summary).toHaveTextContent("Share rate: 25%");
    expect(summary).toHaveTextContent("Calculation rule");
    expect(summary).toHaveTextContent("25% organization / 75% platform");

    expect(details).toHaveTextContent(
      "Revenue details by assigned worker",
    );
    expect(details).toHaveTextContent("Alex Worker");

    expect(details).not.toHaveTextContent("Calculation rule");
  });
});
