import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminDashboardPage from "@/app/admin/page";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

const apiMocks = vi.hoisted(() => ({
  getAdminMe: vi.fn(),
  getAdminDashboardSummary: vi.fn(),
  getAdminOrchestrationRuns: vi.fn(),
}));

vi.mock("@/lib/api", () => apiMocks);

vi.mock("@/components/admin-guard", () => ({
  AdminGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/admin-shell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => (
    <main data-testid="admin-shell">{children}</main>
  ),
}));

function successfulAdminDefaults() {
  apiMocks.getAdminMe.mockResolvedValue({
    id: 1,
    email: "admin@leanworker.test",
    role: "admin",
    organization_name: null,
  });

  apiMocks.getAdminDashboardSummary.mockResolvedValue({
    total_levers: 12,
    active_levers: 9,
    inactive_levers: 3,
    category_breakdown: [],
    recent_levers: [],
  });

  apiMocks.getAdminOrchestrationRuns.mockResolvedValue([]);
}

function TestAdminLanguageSwitcher() {
  const { uiLanguage, setUiLanguage } = useAdminUiLanguage();

  return (
    <div>
      <span data-testid="dashboard-test-language">{uiLanguage}</span>
      <button type="button" onClick={() => setUiLanguage("fr")}>
        Switch dashboard to French
      </button>
      <button type="button" onClick={() => setUiLanguage("en")}>
        Switch dashboard to English
      </button>
    </div>
  );
}

describe("Admin dashboard B2B UI integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    successfulAdminDefaults();
  });

  it("renders the dashboard through the shared B2B page primitives", async () => {
    render(<AdminDashboardPage />);

    expect(
      await screen.findByTestId("admin-page"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Operations overview" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Monitor platform readiness, operational priorities and recent activity.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getAllByTestId("admin-metric-card"),
    ).toHaveLength(6);
  });

  it("renders the shared loading state while dashboard data is pending", () => {
    apiMocks.getAdminMe.mockReturnValue(new Promise(() => {}));
    apiMocks.getAdminDashboardSummary.mockReturnValue(new Promise(() => {}));
    apiMocks.getAdminOrchestrationRuns.mockReturnValue(new Promise(() => {}));

    render(<AdminDashboardPage />);

    expect(
      screen.getByRole("status", { name: "Loading dashboard" }),
    ).toBeInTheDocument();
  });

  it("renders the shared error state when dashboard loading fails", async () => {
    apiMocks.getAdminDashboardSummary.mockRejectedValue(
      new Error("Dashboard unavailable"),
    );

    render(<AdminDashboardPage />);

    expect(
      await screen.findByRole("alert", {
        name: "Unable to load dashboard",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Dashboard unavailable"),
    ).toBeInTheDocument();
  });

  it("renders the shared empty state when no dashboard summary is available", async () => {
    apiMocks.getAdminDashboardSummary.mockResolvedValue(null);

    render(<AdminDashboardPage />);

    expect(
      await screen.findByRole("status", {
        name: "No admin data available",
      }),
    ).toBeInTheDocument();
  });
});

describe("Admin dashboard B2B content sections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    successfulAdminDefaults();
  });

  it("renders the four operational content blocks as semantic admin sections", async () => {
    render(<AdminDashboardPage />);

    await screen.findByTestId("admin-page");

    const expectedSections = [
      {
        title: "Lever category breakdown",
        action: "Manage catalog",
      },
      {
        title: "Recent levers",
        action: "Open levers",
      },
      {
        title: "Recent founder / critical runs",
        action: "View reports",
      },
      {
        title: "Recent orchestration runs",
        action: "Open orchestration",
      },
    ];

    for (const expected of expectedSections) {
      const heading = screen.getByRole("heading", {
        name: expected.title,
      });

      const section = heading.closest("section");

      expect(section).not.toBeNull();

      expect(
        section?.querySelector(`a`),
      ).toHaveTextContent(expected.action);
    }
  });

  it("renders lever availability through the shared semantic status badge", async () => {
    apiMocks.getAdminDashboardSummary.mockResolvedValue({
      total_levers: 1,
      active_levers: 1,
      inactive_levers: 0,
      category_breakdown: [],
      recent_levers: [
        {
          id: 42,
          name: "Stakeholder alignment",
          category: "leadership",
          is_active: true,
          created_at: "2026-09-18T08:00:00Z",
        },
      ],
    });

    render(<AdminDashboardPage />);

    const activeBadge = await screen.findByText("active");

    expect(activeBadge).toHaveAttribute("data-tone", "success");
  });
});



describe("Admin dashboard internationalization integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    successfulAdminDefaults();
  });

  it("renders the dashboard content in French from the persisted UI language", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(<AdminDashboardPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Vue d’ensemble des opérations",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Leviers au total"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Répartition des leviers par catégorie",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Gérer le catalogue" }),
    ).toBeInTheDocument();
  });

  it("updates the dashboard immediately when another consumer changes language", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "en");

    render(
      <>
        <TestAdminLanguageSwitcher />
        <AdminDashboardPage />
      </>,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Operations overview",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Switch dashboard to French",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Vue d’ensemble des opérations",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Leviers au total"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Operations overview",
      }),
    ).not.toBeInTheDocument();
  });
});

describe("Admin dashboard complete French operational copy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    apiMocks.getAdminMe.mockResolvedValue({
      id: 1,
      email: "admin@leanworker.test",
      role: "admin",
      organization_name: null,
    });

    apiMocks.getAdminDashboardSummary.mockResolvedValue({
      total_levers: 1,
      active_levers: 1,
      inactive_levers: 0,
      category_breakdown: [
        {
          category: "leadership",
          count: 1,
        },
      ],
      recent_levers: [
        {
          id: 42,
          name: "Stakeholder alignment",
          category: "leadership",
          is_active: true,
          created_at: "2026-09-18T08:00:00Z",
        },
      ],
    });

    apiMocks.getAdminOrchestrationRuns.mockResolvedValue([
      {
        id: 77,
        scenario: "professional_decision",
        status: "failed",
        confidence: 0.72,
        escalations: ["Founder review required"],
        created_at: "2026-09-18T08:30:00Z",
      },
    ]);
  });

  it("renders cockpit, alerts and run metadata without English UI copy", async () => {
    render(<AdminDashboardPage />);

    expect(
      await screen.findByText("Centre de contrôle"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cockpit back-office LeanWorker"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Rapports des agents" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Gérer les leviers" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Alertes founder / critiques détectées"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Ouvrir les rapports critiques" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText((_, element) => {
        const text = element?.textContent ?? "";

        return (
          element?.tagName === "DIV" &&
          element.classList.contains("muted") &&
          text.includes("Dernière alerte") &&
          text.includes("#77")
        );
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Créé le /),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/confiance 0\.72/i).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText("1 escalade").length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText("échec").length,
    ).toBeGreaterThan(0);

    expect(
      screen.queryByText("Control center"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("LeanWorker backoffice cockpit"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("No escalation"),
    ).not.toBeInTheDocument();
  });
});
