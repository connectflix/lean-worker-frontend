import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { AdminShell } from "@/components/admin-shell";

describe("AdminShell internationalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the complete admin shell chrome in French from the persisted UI language", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(
      <AdminShell
        activeHref="/admin/organizations"
        title="Organizations"
        subtitle="Organization workspace"
        adminRole="admin"
        adminEmail="admin@leanworker.test"
      >
        <div>Page content</div>
      </AdminShell>,
    );

    const navigation = screen.getByRole("navigation", {
      name: "Navigation administrateur",
    });

    expect(within(navigation).getByText("Vue d’ensemble")).toBeInTheDocument();
    expect(within(navigation).getByText("Opérations")).toBeInTheDocument();
    expect(within(navigation).getByText("Catalogue")).toBeInTheDocument();
    expect(within(navigation).getByText("Accompagnement")).toBeInTheDocument();
    expect(within(navigation).getByText("Compte")).toBeInTheDocument();

    expect(
      within(navigation).getByRole("link", { name: "Organisations" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Réduire la barre latérale admin" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Se déconnecter" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Français" }),
    ).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByRole("button", { name: "Français" }),
    ).toHaveAttribute("data-language-state", "active");

    expect(
      screen.getByRole("button", { name: "English" }),
    ).toHaveAttribute("aria-pressed", "false");

    expect(
      screen.getByRole("button", { name: "English" }),
    ).toHaveAttribute("data-language-state", "inactive");
  });

  it("switches the complete admin shell to English and persists the choice", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(
      <AdminShell
        activeHref="/admin/organizations"
        title="Organizations"
        subtitle="Organization workspace"
        adminRole="admin"
        adminEmail="admin@leanworker.test"
      >
        <div>Page content</div>
      </AdminShell>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "English" }),
    );

    expect(window.localStorage.getItem("leanworker.uiLanguage")).toBe("en");

    const navigation = screen.getByRole("navigation", {
      name: "Admin navigation",
    });

    expect(within(navigation).getByText("Overview")).toBeInTheDocument();
    expect(within(navigation).getByText("Operations")).toBeInTheDocument();
    expect(within(navigation).getByText("Catalog")).toBeInTheDocument();
    expect(within(navigation).getByText("Enablement")).toBeInTheDocument();
    expect(within(navigation).getByText("Account")).toBeInTheDocument();

    expect(
      within(navigation).getByRole("link", { name: "Manage Organizations" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Collapse admin sidebar" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Log out" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "English" }),
    ).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByRole("button", { name: "English" }),
    ).toHaveAttribute("data-language-state", "active");

    expect(
      screen.getByRole("button", { name: "Français" }),
    ).toHaveAttribute("data-language-state", "inactive");
  });

  it("renders the organization role chrome fully in French", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(
      <AdminShell
        activeHref="/admin/organizations"
        title="Organisation"
        subtitle="Espace organisation"
        adminRole="organization"
        adminOrganizationName="Acme Belgium"
        adminEmail="manager@acme.test"
      >
        <div>Organization content</div>
      </AdminShell>,
    );

    expect(
      screen.getAllByText("Acme Belgium").length,
    ).toBeGreaterThanOrEqual(2);

    expect(
      screen.getAllByText("Espace organisation").length,
    ).toBeGreaterThan(0);

    const navigation = screen.getByRole("navigation", {
      name: "Navigation administrateur",
    });

    expect(
      within(navigation).getByRole("link", { name: "Organisations" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("link", { name: "Réservations" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("link", { name: "Plan de coaching" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("link", { name: "Parcours de coaching" }),
    ).toBeInTheDocument();

    expect(
      within(navigation).getByRole("link", { name: "Guide de coaching" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Se déconnecter" }),
    ).toBeInTheDocument();
  });

});
