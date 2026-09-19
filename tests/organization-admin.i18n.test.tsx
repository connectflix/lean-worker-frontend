import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationAdminTab } from "@/app/admin/organizations/components/organization-admin-tab";
import type {
  AdminCalendlyEventType,
  AdminOrganization,
  AdminOrganizationType,
} from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

const organization = {
  id: 42,
  name: "Acme Belgium",
  code: "ORG-ACME01",
  organization_type: "agent_flix",
  description: "Belgian organization",
  contact_email: "contact@acme.test",
  contact_phone: "+32 2 000 00 00",
  calendly_event_type_uri: null,
  is_active: true,
} as unknown as AdminOrganization;

const calendlyEventType = {
  uri: "https://api.calendly.com/event_types/123",
  name: "Manager coaching",
  slug: "manager-coaching",
  scheduling_url: "https://calendly.com/acme/manager-coaching",
  duration: 30,
  active: true,
} as unknown as AdminCalendlyEventType;

const baseForm = {
  name: "Acme Belgium",
  code: "ORG-ACME01",
  organization_type: "agent_flix" as AdminOrganizationType,
  description: "Belgian organization",
  contact_email: "contact@acme.test",
  contact_phone: "+32 2 000 00 00",
  calendly_event_type_uri: "",
  is_active: true,
};

function AdminHarness({
  organizations = [organization],
  editingOrganizationId = 42,
  calendlyEventTypes = [],
}: {
  organizations?: AdminOrganization[];
  editingOrganizationId?: number | null;
  calendlyEventTypes?: AdminCalendlyEventType[];
}) {
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

      <OrganizationAdminTab
        organizations={organizations}
        selectedOrganizationId={editingOrganizationId}
        editingOrganizationId={editingOrganizationId}
        form={{
          ...baseForm,
          calendly_event_type_uri:
            calendlyEventTypes[0]?.uri ?? "",
        }}
        saving={false}
        detailLoading={false}
        calendlyEventTypes={calendlyEventTypes}
        calendlyEventTypesLoading={false}
        calendlyEventTypesError={null}
        onOpenOrganization={vi.fn()}
        onSubmit={vi.fn()}
        onFormChange={vi.fn()}
        onNewOrganization={vi.fn()}
        getOrganizationTypeLabel={(type) =>
          type === "agent_premium"
            ? "Agent Premium"
            : type === "agent_de_reve"
              ? "Agent de rêve"
              : "Agent Flix"
        }
        getRequiredSubscriptionForOrganizationType={(type) =>
          type === "agent_premium"
            ? "flix"
            : type === "agent_de_reve"
              ? "executif"
              : "classique"
        }
      />
    </>
  );
}

describe("Organization Admin internationalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "fr");
  });

  it("renders the organization administration workspace in French", () => {
    render(<AdminHarness />);

    expect(screen.getByTestId("language")).toHaveTextContent("fr");

    expect(screen.getByText("Organisations")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Nouvelle organisation" }),
    ).toHaveLength(2);

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Actives")).toBeInTheDocument();
    expect(screen.getByText("Inactives")).toBeInTheDocument();

    expect(
      screen.getByText("Rechercher des organisations"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Modifier l’organisation #42"),
    ).toBeInTheDocument();

    expect(screen.getByText("Nom")).toBeInTheDocument();
    expect(screen.getByText("Identifiant entreprise")).toBeInTheDocument();
    expect(screen.getByText("Type d’organisation")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Enregistrer l’organisation",
      }),
    ).toBeInTheDocument();
  });

  it("switches the organization administration workspace immediately to English", () => {
    render(<AdminHarness />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch EN" }),
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");

    expect(screen.getByText("Organizations")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "New organization" }),
    ).toHaveLength(2);

    expect(
      screen.getByText("Edit organization #42"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Save organization",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Modifier l’organisation #42"),
    ).not.toBeInTheDocument();
  });

  it("localizes organization list states and the empty state in French", () => {
    render(<AdminHarness organizations={[]} editingOrganizationId={null} />);

    expect(
      screen.getByText("Aucune organisation trouvée."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Créer une organisation"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Créer l’organisation",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organisation active"),
    ).toBeInTheDocument();
  });

  it("localizes Calendly configuration in French", () => {
    render(
      <AdminHarness calendlyEventTypes={[calendlyEventType]} />,
    );

    expect(screen.getByText("Événement Calendly")).toBeInTheDocument();

    expect(
      screen.getByText("Sélectionné"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Effacer" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Rechercher des événements Calendly"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ouvrir la page de réservation Calendly"),
    ).toBeInTheDocument();
  });
});
