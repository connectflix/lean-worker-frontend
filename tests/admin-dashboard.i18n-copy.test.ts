import { describe, expect, it } from "vitest";

import { getAdminDashboardCopy } from "@/lib/i18n/admin-dashboard";

describe("Admin dashboard internationalization copy", () => {
  it("provides the complete English dashboard copy", () => {
    const copy = getAdminDashboardCopy("en");

    expect(copy.page.eyebrow).toBe("Platform operations");
    expect(copy.page.title).toBe("Operations overview");
    expect(copy.page.refresh).toBe("Refresh dashboard");

    expect(copy.states.loadingTitle).toBe("Loading dashboard");
    expect(copy.states.errorTitle).toBe("Unable to load dashboard");
    expect(copy.states.emptyTitle).toBe("No admin data available");

    expect(copy.metrics.totalLevers).toBe("Total levers");
    expect(copy.metrics.activeLevers).toBe("Active levers");
    expect(copy.metrics.criticalAlerts).toBe("Critical alerts");

    expect(copy.sections.categories.title).toBe("Lever category breakdown");
    expect(copy.sections.recentLevers.title).toBe("Recent levers");
    expect(copy.sections.criticalRuns.title).toBe(
      "Recent founder / critical runs",
    );
    expect(copy.sections.orchestration.title).toBe(
      "Recent orchestration runs",
    );

    expect(copy.status.active).toBe("active");
    expect(copy.status.inactive).toBe("inactive");
  });

  it("provides the complete French dashboard copy", () => {
    const copy = getAdminDashboardCopy("fr");

    expect(copy.page.eyebrow).toBe("Opérations plateforme");
    expect(copy.page.title).toBe("Vue d’ensemble des opérations");
    expect(copy.page.refresh).toBe("Actualiser le tableau de bord");

    expect(copy.states.loadingTitle).toBe("Chargement du tableau de bord");
    expect(copy.states.errorTitle).toBe(
      "Impossible de charger le tableau de bord",
    );
    expect(copy.states.emptyTitle).toBe(
      "Aucune donnée d’administration disponible",
    );

    expect(copy.metrics.totalLevers).toBe("Leviers au total");
    expect(copy.metrics.activeLevers).toBe("Leviers actifs");
    expect(copy.metrics.criticalAlerts).toBe("Alertes critiques");

    expect(copy.sections.categories.title).toBe(
      "Répartition des leviers par catégorie",
    );
    expect(copy.sections.recentLevers.title).toBe("Leviers récents");
    expect(copy.sections.criticalRuns.title).toBe(
      "Exécutions founder / critiques récentes",
    );
    expect(copy.sections.orchestration.title).toBe(
      "Exécutions d’orchestration récentes",
    );

    expect(copy.status.active).toBe("actif");
    expect(copy.status.inactive).toBe("inactif");
  });
});
