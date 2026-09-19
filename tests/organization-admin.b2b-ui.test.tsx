import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationAdminTab } from "@/app/admin/organizations/components/organization-admin-tab";
import type {
  AdminCalendlyEventType,
  AdminOrganization,
  AdminOrganizationType,
} from "@/lib/types";

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

const form = {
  name: "Acme Belgium",
  code: "ORG-ACME01",
  organization_type: "agent_flix" as AdminOrganizationType,
  description: "Belgian organization",
  contact_email: "contact@acme.test",
  contact_phone: "+32 2 000 00 00",
  calendly_event_type_uri: calendlyEventType.uri,
  is_active: true,
};

function renderAdmin() {
  return render(
    <OrganizationAdminTab
      organizations={[organization]}
      selectedOrganizationId={42}
      editingOrganizationId={42}
      form={form}
      saving={false}
      detailLoading={false}
      calendlyEventTypes={[calendlyEventType]}
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
    />,
  );
}

describe("OrganizationAdminTab B2B hierarchy", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "en");
  });

  it("exposes distinct portfolio, directory, editor, and booking zones", () => {
    renderAdmin();

    expect(
      screen.getByTestId("organization-admin-summary"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-admin-directory"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-admin-editor"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-admin-booking"),
    ).toBeInTheDocument();
  });

  it("keeps portfolio metrics in the summary zone", () => {
    renderAdmin();

    const summary = screen.getByTestId("organization-admin-summary");

    expect(
      within(summary).getByText("Organizations"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("Total"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("Active"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("Inactive"),
    ).toBeInTheDocument();
  });

  it("isolates organization discovery inside the directory zone", () => {
    renderAdmin();

    const directory = screen.getByTestId("organization-admin-directory");

    expect(
      within(directory).getByText("Search organizations"),
    ).toBeInTheDocument();

    expect(
      within(directory).getByText("Acme Belgium"),
    ).toBeInTheDocument();

    expect(
      within(directory).queryByText("Edit organization #42"),
    ).not.toBeInTheDocument();
  });

  it("keeps identity and organization settings in the editor zone", () => {
    renderAdmin();

    const editor = screen.getByTestId("organization-admin-editor");

    expect(
      within(editor).getByText("Edit organization #42"),
    ).toBeInTheDocument();

    expect(
      within(editor).getByText("Name"),
    ).toBeInTheDocument();

    expect(
      within(editor).getByText("Organization type"),
    ).toBeInTheDocument();

    expect(
      within(editor).getByRole("button", {
        name: "Save organization",
      }),
    ).toBeInTheDocument();
  });

  it("isolates Calendly configuration inside the booking zone", () => {
    renderAdmin();

    const booking = screen.getByTestId("organization-admin-booking");

    expect(
      within(booking).getByText("Calendly event"),
    ).toBeInTheDocument();

    expect(
      within(booking).getAllByText("Manager coaching"),
    ).toHaveLength(2);

    expect(
      within(booking).getByText("Selected"),
    ).toBeInTheDocument();

    expect(
      within(booking).getByRole("button", { name: "Clear" }),
    ).toBeInTheDocument();
  });
});
