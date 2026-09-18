import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationRevenueTab } from "@/app/admin/organizations/components/organization-revenue-tab";
import { OrganizationWorkersTab } from "@/app/admin/organizations/components/organization-workers-tab";
import type { AdminOrganization, AdminWorker } from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

const organization = {
  id: 42,
  code: "ACME",
  name: "Acme Belgium",
  organization_type: "premium",
  is_active: true,
} as unknown as AdminOrganization;

const assignedWorker = {
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

const revenueSummary = {
  assignedWorkerCount: 1,
  paidWorkerCount: 1,
  grossSubscriptionRevenueExVat: 120,
  organizationRevenueExVat: 30,
  platformRevenueExVat: 90,
  revenueShareRate: 0.25,
};

function WorkersHarness() {
  const { uiLanguage, setUiLanguage } = useAdminUiLanguage();

  return (
    <>
      <div data-testid="language">{uiLanguage}</div>

      <button type="button" onClick={() => setUiLanguage("fr")}>
        Switch FR
      </button>

      <button type="button" onClick={() => setUiLanguage("en")}>
        Switch EN
      </button>

      <OrganizationWorkersTab
        selectedOrganization={organization}
        assignedWorkers={[assignedWorker]}
        filteredAssignedWorkers={[assignedWorker]}
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
      />
    </>
  );
}

function RevenueHarness() {
  const { uiLanguage, setUiLanguage } = useAdminUiLanguage();

  return (
    <>
      <div data-testid="language">{uiLanguage}</div>

      <button type="button" onClick={() => setUiLanguage("fr")}>
        Switch FR
      </button>

      <button type="button" onClick={() => setUiLanguage("en")}>
        Switch EN
      </button>

      <OrganizationRevenueTab
        selectedOrganization={organization}
        assignedWorkers={[assignedWorker]}
        organizationRevenueSummary={revenueSummary}
      />
    </>
  );
}

describe("Organization Workers and Revenue internationalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "fr");
  });

  it("renders the Workers workspace in French", () => {
    render(<WorkersHarness />);

    expect(screen.getByTestId("language")).toHaveTextContent("fr");

    expect(
      screen.getAllByText("Collaborateurs assignés").length,
    ).toBeGreaterThan(0);

    expect(
      screen.getByText("Annuaire des collaborateurs"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Rechercher les collaborateurs assignés"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Aucun collaborateur sélectionné"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Affecter un collaborateur compatible"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Ouvrir" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Désaffecter" }),
    ).toBeInTheDocument();
  });

  it("switches the Workers workspace immediately to English", () => {
    render(<WorkersHarness />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch EN" }),
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");

    expect(
      screen.getAllByText("Assigned workers").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Worker directory")).toBeInTheDocument();
    expect(screen.getByText("No worker selected")).toBeInTheDocument();

    expect(
      screen.queryByText("Collaborateurs assignés"),
    ).not.toBeInTheDocument();
  });

  it("renders the Revenue workspace in French", () => {
    render(<RevenueHarness />);

    expect(screen.getByTestId("language")).toHaveTextContent("fr");

    expect(
      screen.getByText("Tableau de bord des revenus de l’organisation"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Règle de calcul"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Abonnements bruts hors TVA"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Revenus de l’organisation hors TVA"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Part plateforme hors TVA"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Détail des revenus par collaborateur assigné"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Collaborateur" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Part organisation" }),
    ).toBeInTheDocument();
  });

  it("switches the Revenue workspace immediately to English", () => {
    render(<RevenueHarness />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch EN" }),
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");

    expect(
      screen.getByText("Organization revenue dashboard"),
    ).toBeInTheDocument();

    expect(screen.getByText("Calculation rule")).toBeInTheDocument();

    expect(
      screen.getByText("Revenue details by assigned worker"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Tableau de bord des revenus de l’organisation",
      ),
    ).not.toBeInTheDocument();
  });
});
