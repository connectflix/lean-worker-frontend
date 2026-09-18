import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationOverviewTab } from "@/app/admin/organizations/components/organization-overview-tab";
import { OrganizationWorkspaceHero } from "@/app/admin/organizations/components/organization-workspace-hero";
import type {
  AdminOrganization,
  AdminOrganizationWorkerSummary,
} from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

const organization = {
  id: 42,
  code: "ACME",
  name: "Acme Belgium",
  description: "",
  organization_type: "premium",
  is_active: true,
  contact_email: "people@acme.test",
  contact_phone: "+32 2 000 00 00",
  calendly_event_type_uri: null,
} as unknown as AdminOrganization;

const workerSummary = null as AdminOrganizationWorkerSummary | null;

const revenueSummary = {
  assignedWorkerCount: 12,
  paidWorkerCount: 8,
  grossSubscriptionRevenueExVat: 2400,
  organizationRevenueExVat: 600,
  platformRevenueExVat: 1800,
  revenueShareRate: 0.25,
};

function HeroHarness() {
  const { uiLanguage, setUiLanguage } = useAdminUiLanguage();

  return (
    <>
      <button type="button" onClick={() => setUiLanguage("fr")}>
        Switch FR
      </button>
      <button type="button" onClick={() => setUiLanguage("en")}>
        Switch EN
      </button>

      <div data-testid="language">{uiLanguage}</div>

      <OrganizationWorkspaceHero
        selectedOrganization={organization}
        selectedWorkerSummary={workerSummary}
        selectedWorkerId={null}
        organizationRevenueSummary={revenueSummary}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />
    </>
  );
}

function OverviewHarness() {
  const { uiLanguage, setUiLanguage } = useAdminUiLanguage();

  return (
    <>
      <button type="button" onClick={() => setUiLanguage("fr")}>
        Switch FR
      </button>
      <button type="button" onClick={() => setUiLanguage("en")}>
        Switch EN
      </button>

      <div data-testid="language">{uiLanguage}</div>

      <OrganizationOverviewTab
        selectedOrganization={organization}
        selectedWorkerSummary={workerSummary}
        selectedWorkerId={null}
        organizationRevenueSummary={revenueSummary}
        onNavigate={vi.fn()}
        getOrganizationTypeLabel={() => "Premium"}
        getRequiredSubscriptionForOrganizationType={() => "flix"}
      />
    </>
  );
}

describe("Organization workspace Hero internationalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the Hero in French from the persisted UI language", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(<HeroHarness />);

    expect(screen.getByText("Actif")).toBeInTheDocument();
    expect(screen.getByText("Pack requis : flix")).toBeInTheDocument();
    expect(screen.getByText("Aucun collaborateur sélectionné")).toBeInTheDocument();

    expect(screen.getByText("Collaborateurs assignés")).toBeInTheDocument();
    expect(screen.getByText("Collaborateurs payants")).toBeInTheDocument();
    expect(screen.getByText("Revenus de l’organisation")).toBeInTheDocument();
    expect(screen.getByText("Abonnements bruts")).toBeInTheDocument();
    expect(screen.getByText("Sessions du collaborateur")).toBeInTheDocument();
    expect(screen.getByText("Recommandations")).toBeInTheDocument();

    expect(
      screen.getByText("Aucune description de l’organisation n’est encore configurée."),
    ).toBeInTheDocument();
  });

  it("switches the Hero immediately from French to English", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(<HeroHarness />);

    expect(screen.getByText("Collaborateurs assignés")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Switch EN" }));

    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(screen.getByText("Assigned workers")).toBeInTheDocument();
    expect(screen.getByText("Required pack: flix")).toBeInTheDocument();
    expect(screen.getByText("No worker selected")).toBeInTheDocument();

    expect(
      screen.queryByText("Collaborateurs assignés"),
    ).not.toBeInTheDocument();
  });
});

describe("Organization Overview internationalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the executive Overview in French", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(<OverviewHarness />);

    expect(screen.getByText("Vue d’ensemble de l’organisation")).toBeInTheDocument();
    expect(screen.getByText("Actif")).toBeInTheDocument();

    expect(screen.getByText("Nom")).toBeInTheDocument();
    expect(screen.getByText("Identifiant entreprise")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Pack collaborateur requis")).toBeInTheDocument();
    expect(screen.getByText("E-mail de contact")).toBeInTheDocument();
    expect(screen.getByText("Téléphone de contact")).toBeInTheDocument();

    expect(screen.getByText("Non configuré")).toBeInTheDocument();

    expect(screen.getByText("Prochaines actions recommandées")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ouvrir les collaborateurs" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Voir les revenus" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Aperçu opérationnel")).toBeInTheDocument();
    expect(screen.getByText("Collaborateur sélectionné")).toBeInTheDocument();
    expect(screen.getByText("Aucun collaborateur")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Sélectionner un collaborateur" }),
    ).toBeInTheDocument();
  });

  it("switches the Overview immediately to English", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(<OverviewHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Switch EN" }));

    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(screen.getByText("Organization overview")).toBeInTheDocument();
    expect(screen.getByText("Recommended next actions")).toBeInTheDocument();
    expect(screen.getByText("Operational snapshot")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Open workers" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Vue d’ensemble de l’organisation"),
    ).not.toBeInTheDocument();
  });
});
