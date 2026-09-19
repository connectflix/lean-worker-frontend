import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationAccessTab } from "@/app/admin/organizations/components/organization-access-tab";
import type { AdminOrganizationAccessAccount } from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

const accessAccountResult = {
  email: "admin@acme.test",
  temporary_password: "TempPassword123",
  message: "Organization access account generated.",
} as unknown as AdminOrganizationAccessAccount;

function AccessHarness({
  result = null,
}: {
  result?: AdminOrganizationAccessAccount | null;
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

      <OrganizationAccessTab
        selectedOrganizationId={42}
        contactEmail="admin@acme.test"
        editingOrganizationId={42}
        accessAccountSaving={false}
        detailLoading={false}
        saving={false}
        accessAccountResult={result}
        onCreateOrResetAccessAccount={vi.fn()}
      />
    </>
  );
}

function NoOrganizationHarness() {
  const { uiLanguage } = useAdminUiLanguage();

  return (
    <>
      <div data-testid="language">{uiLanguage}</div>

      <OrganizationAccessTab
        selectedOrganizationId={null}
        contactEmail=""
        editingOrganizationId={null}
        accessAccountSaving={false}
        detailLoading={false}
        saving={false}
        accessAccountResult={null}
        onCreateOrResetAccessAccount={vi.fn()}
      />
    </>
  );
}

describe("Organization Access internationalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders the access workspace in French", () => {
    render(<AccessHarness />);

    expect(screen.getByTestId("language")).toHaveTextContent("fr");

    expect(
      screen.getByText("Compte d’accès de l’organisation"),
    ).toBeInTheDocument();

    expect(screen.getByText("E-mail de contact")).toBeInTheDocument();
    expect(screen.getByText("Statut d’accès")).toBeInTheDocument();

    expect(
      screen.getByText("Configuration de connexion"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Créer le compte de l’organisation",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Résultat de l’accès")).toBeInTheDocument();
    expect(screen.getByText("Note de sécurité")).toBeInTheDocument();
  });

  it("switches the access workspace immediately to English", () => {
    render(<AccessHarness />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch EN" }),
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");

    expect(
      screen.getByText("Organization access account"),
    ).toBeInTheDocument();

    expect(screen.getByText("Contact email")).toBeInTheDocument();
    expect(screen.getByText("Access status")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Create organization account",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Compte d’accès de l’organisation"),
    ).not.toBeInTheDocument();
  });

  it("renders the no-organization state in French", () => {
    render(<NoOrganizationHarness />);

    expect(screen.getByTestId("language")).toHaveTextContent("fr");

    expect(
      screen.getByText("Aucune organisation sélectionnée"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organisation requise"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Sélectionnez et enregistrez une organisation avant de créer un compte d’accès.",
      ),
    ).toBeInTheDocument();
  });

  it("localizes generated credential controls in French", () => {
    render(<AccessHarness result={accessAccountResult} />);

    expect(
      screen.getByText("Compte d’accès généré"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Mot de passe temporaire"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Afficher" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Copier le mot de passe",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Partagez ce mot de passe de manière sécurisée. Il ne sera plus visible après avoir quitté ce résultat.",
      ),
    ).toBeInTheDocument();
  });
});
