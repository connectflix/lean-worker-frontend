import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationAccessTab } from "@/app/admin/organizations/components/organization-access-tab";
import type { AdminOrganizationAccessAccount } from "@/lib/types";

const accessAccountResult = {
  email: "admin@acme.test",
  temporary_password: "TempPassword123",
  message: "Organization access account generated.",
} as unknown as AdminOrganizationAccessAccount;

function renderAccess({
  result = null,
}: {
  result?: AdminOrganizationAccessAccount | null;
} = {}) {
  return render(
    <OrganizationAccessTab
      selectedOrganizationId={42}
      contactEmail="admin@acme.test"
      editingOrganizationId={42}
      accessAccountSaving={false}
      detailLoading={false}
      saving={false}
      accessAccountResult={result}
      onCreateOrResetAccessAccount={vi.fn()}
    />,
  );
}

describe("OrganizationAccessTab B2B hierarchy", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "en");
  });

  it("exposes distinct access summary, configuration, and credential zones", () => {
    renderAccess();

    expect(
      screen.getByTestId("organization-access-summary"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-access-configuration"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-access-credentials"),
    ).toBeInTheDocument();
  });

  it("keeps organization identity and access status in the summary", () => {
    renderAccess();

    const summary = screen.getByTestId("organization-access-summary");

    expect(
      within(summary).getByText("Organization access account"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("Contact email"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("Access status"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("admin@acme.test"),
    ).toBeInTheDocument();
  });

  it("keeps account-generation controls inside the configuration zone", () => {
    renderAccess();

    const configuration = screen.getByTestId(
      "organization-access-configuration",
    );

    expect(
      within(configuration).getByText("Login configuration"),
    ).toBeInTheDocument();

    expect(
      within(configuration).getByRole("button", {
        name: "Create organization account",
      }),
    ).toBeInTheDocument();

    expect(
      within(configuration).queryByText("Access result"),
    ).not.toBeInTheDocument();
  });

  it("isolates generated credentials and security guidance", () => {
    renderAccess({ result: accessAccountResult });

    const credentials = screen.getByTestId(
      "organization-access-credentials",
    );

    expect(
      within(credentials).getByText("Access result"),
    ).toBeInTheDocument();

    expect(
      within(credentials).getByText("Temporary password"),
    ).toBeInTheDocument();

    expect(
      within(credentials).getByText("Security note"),
    ).toBeInTheDocument();

    expect(
      within(credentials).getByRole("button", {
        name: "Copy password",
      }),
    ).toBeInTheDocument();
  });
});
