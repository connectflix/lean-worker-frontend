import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  OrganizationWorkspaceTabs,
} from "@/app/admin/organizations/components/organization-workspace-tabs";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

function LanguageHarness() {
  const { uiLanguage, setUiLanguage } = useAdminUiLanguage();

  return (
    <>
      <button type="button" onClick={() => setUiLanguage("fr")}>
        Switch FR
      </button>
      <button type="button" onClick={() => setUiLanguage("en")}>
        Switch EN
      </button>

      <div data-testid="current-language">{uiLanguage}</div>

      <OrganizationWorkspaceTabs
        activeTab="overview"
        onChange={() => undefined}
        isPlatformAdmin
        selectedWorkerAvailable={false}
      />
    </>
  );
}

describe("OrganizationWorkspaceTabs internationalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the organization workspace navigation fully in French", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(<LanguageHarness />);

    const navigation = screen.getByRole("tablist", {
      name: "Navigation de l’espace organisation",
    });

    expect(
      within(navigation).getByRole("tab", { name: "Vue d’ensemble" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Organisations" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Collaborateurs" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Revenus" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Canevas" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Conversations" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", {
        name: "Insights collaborateurs",
      }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Accès" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Sélectionnez un collaborateur pour déverrouiller 3 espaces",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Synthèse exécutive de l’organisation sélectionnée.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the organization workspace navigation in English", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "en");

    render(<LanguageHarness />);

    const navigation = screen.getByRole("tablist", {
      name: "Organization workspace navigation",
    });

    expect(
      within(navigation).getByRole("tab", { name: "Overview" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Organizations" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Workers" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Revenue" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Canvases" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Conversations" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Worker Insights" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("tab", { name: "Access" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Select a worker to unlock 3 workspace areas"),
    ).toBeInTheDocument();
  });

  it("updates the workspace navigation immediately when the UI language changes", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(<LanguageHarness />);

    expect(
      screen.getByRole("tab", { name: "Vue d’ensemble" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Switch EN" }),
    );

    expect(screen.getByTestId("current-language")).toHaveTextContent("en");

    expect(
      screen.getByRole("tablist", {
        name: "Organization workspace navigation",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("tab", { name: "Overview" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("tab", { name: "Vue d’ensemble" }),
    ).not.toBeInTheDocument();
  });
});
