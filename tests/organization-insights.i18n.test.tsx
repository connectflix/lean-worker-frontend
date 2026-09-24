import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationInsightsTab } from "@/app/admin/organizations/components/organization-insights-tab";
import {
  getAdminWorkerProfessionalExecutionPlan,
  getAdminWorkerProfessionalIntentionCompletionWorkspace,
  getAdminWorkerProfessionalMandateSupport,
} from "@/lib/api";
import type { AdminOrganizationWorkerSummary } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  completeAdminWorkerRecommendation: vi.fn(),
  getAdminWorkerProfessionalExecutionPlan: vi.fn(),
  getAdminWorkerProfessionalIntentionCompletionWorkspace: vi.fn(),
  getAdminWorkerProfessionalMandateSupport: vi.fn(),
  initializeAdminWorkerProfessionalIntention: vi.fn(),
  recordAdminWorkerProfessionalIntentionClarification: vi.fn(),
  recordAdminWorkerProfessionalMandateClarification: vi.fn(),
}));

vi.mock(
  "@/app/admin/organizations/components/organization-worker-guidance-card",
  () => ({
    OrganizationWorkerGuidanceCard: () => (
      <div data-testid="organization-worker-guidance-card" />
    ),
  }),
);

vi.mock(
  "@/app/admin/organizations/components/professional-execution-plan-card",
  () => ({
    ProfessionalExecutionPlanCard: () => (
      <div data-testid="professional-execution-plan-card" />
    ),
  }),
);

function workerSummary(): AdminOrganizationWorkerSummary {
  return {
    worker: {
      id: 7,
      email: "worker@example.com",
      display_name: "Alex Worker",
      given_name: "Alex",
      family_name: "Worker",
      language: "en",
      auth_provider: "local",
      provider_user_id: "worker-7",
      profile_update_suspected: false,
      subscription_pack: "flix",
      organization_id: 3,
      business_id: "WK-00000007",
      current_role: "Senior Analyst",
      industry: "Technology",
      profession: "Analyst",
      location: "Brussels",
      subscription_total_paid_eur: 120,
      active_subscription: null,
      created_at: "2026-08-20T10:00:00Z",
    },
    career_blueprint: {
      identity_text: "Strategic leader",
      vision_text: "Broader strategic influence",
      talent_focus_text: "Leadership",
      career_focus_text: "Transformation",
      inspiration_person: null,
      aspiration_person: null,
    },
    sessions: [],
    recommendations: [],
    artifacts: [],
    levers: [],
    session_count: 3,
    external_conversation_count: 2,
    recommendation_count: 4,
    artifact_count: 1,
    lever_count: 5,
  } as AdminOrganizationWorkerSummary;
}

function renderInsights(
  overrides: Partial<{
    selectedWorkerSummary: AdminOrganizationWorkerSummary | null;
    workerSummaryLoading: boolean;
    filteredLevers: AdminOrganizationWorkerSummary["levers"];
    relatedLeversByRecommendationId: Map<
      number,
      AdminOrganizationWorkerSummary["levers"]
    >;
  }> = {},
) {
  return render(
    <OrganizationInsightsTab
      selectedWorkerSummary={
        overrides.selectedWorkerSummary === undefined
          ? workerSummary()
          : overrides.selectedWorkerSummary
      }
      workerSummaryLoading={overrides.workerSummaryLoading ?? false}
      organizationGuidance={null}
      organizationGuidanceLoading={false}
      leverSearch=""
      leverCategoryFilter="all"
      leverSortMode="highlighted"
      leverCategories={[]}
      filteredLevers={overrides.filteredLevers ?? []}
      relatedLeversByRecommendationId={
        overrides.relatedLeversByRecommendationId ?? new Map()
      }
      onLeverSearchChange={vi.fn()}
      onLeverCategoryFilterChange={vi.fn()}
      onLeverSortModeChange={vi.fn()}
      onScrollToRecommendation={vi.fn()}
      onOrganizationRecommendationCompleted={vi.fn()}
    />,
  );
}

describe("Organization Insights internationalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockResolvedValue(null as never);

    vi.mocked(
      getAdminWorkerProfessionalMandateSupport,
    ).mockResolvedValue(null as never);

    vi.mocked(
      getAdminWorkerProfessionalExecutionPlan,
    ).mockResolvedValue(null as never);
  });

  it("renders the worker summary loading boundary in French", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    renderInsights({
      selectedWorkerSummary: null,
      workerSummaryLoading: true,
    });

    expect(
      screen.getByText("Espace de suivi du collaborateur"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Chargement du résumé du collaborateur..."),
    ).toBeInTheDocument();
  });

  it("renders the empty worker selection boundary in French", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    renderInsights({
      selectedWorkerSummary: null,
    });

    expect(
      screen.getByText("Espace de suivi du collaborateur"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Sélectionnez un collaborateur pour afficher ses informations.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the worker intelligence workspace in French", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    renderInsights();

    expect(
      screen.getByText("Espace de suivi du collaborateur"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Alex Worker",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-insights-worker-context"),
    ).toHaveTextContent("Senior Analyst · Brussels");

    expect(
      screen.getByText("Conversations externes"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Profil du collaborateur"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Profil de carrière"),
    ).toHaveLength(2);

    expect(
      screen.getByText("Ressources et leviers"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Rechercher par nom, catégorie, fournisseur ou motif...",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Toutes les catégories" }),
    ).toBeInTheDocument();
  });

  it("uses the shared Admin B2B shell and metric primitives for worker intelligence", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    renderInsights();

    expect(screen.getByTestId("admin-page")).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-insights-worker-header"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-insights-metrics"),
    ).toBeInTheDocument();

    expect(screen.getAllByTestId("admin-metric-card")).toHaveLength(6);
  });

  it("presents an identity-first manager header and attention summary", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    const summary = workerSummary();

    summary.recommendations = [
      {
        id: 11,
        status: "open",
        priority: "high",
        title: "Strengthen leadership positioning",
        description: "Prepare a concrete leadership positioning action.",
      },
    ] as never;

    renderInsights({
      selectedWorkerSummary: summary,
    });

    const header = screen.getByTestId(
      "organization-insights-worker-header",
    );

    expect(
      within(header).getByRole("heading", {
        name: "Alex Worker",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-insights-worker-context"),
    ).toHaveTextContent("Senior Analyst");

    expect(
      screen.getByTestId("organization-insights-worker-context"),
    ).toHaveTextContent("Brussels");

    const attention = screen.getByTestId(
      "organization-insights-attention",
    );

    expect(
      within(attention).getByText("À surveiller"),
    ).toBeInTheDocument();

    expect(
      within(attention).getByText("1 recommandation ouverte"),
    ).toBeInTheDocument();
  });

  it("summarizes manager attention signals from existing worker readiness state", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    const summary = workerSummary();

    summary.career_blueprint = null;
    summary.recommendations = [
      {
        id: 11,
        status: "open",
        priority: "high",
        title: "Strengthen leadership positioning",
        description: "Prepare a concrete leadership positioning action.",
      },
    ] as never;

    vi.mocked(
      getAdminWorkerProfessionalMandateSupport,
    ).mockResolvedValue({
      mandate: null,
      readiness: {
        readiness_state: "partially_grounded",
        dimensions: [],
        blocking_dimensions: ["professional_identity"],
        decision_ready: false,
      },
      completion_guidance: null,
    } as never);

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockResolvedValue({
      readiness_state: "partially_ready",
      completion_closed: false,
      initialization_available: false,
      items: [
        {
          dimension: "target_state",
          current_state: "partial",
          reason: "Target state still needs clarification.",
          suggested_question: "What target state is intended?",
          requested_source_actor: "worker",
          resolution_status: "open",
          resolution_condition: "Target state is explicit.",
          evidence: [],
        },
      ],
    } as never);

    vi.mocked(
      getAdminWorkerProfessionalExecutionPlan,
    ).mockResolvedValue(null as never);

    renderInsights({
      selectedWorkerSummary: summary,
    });

    const attention = screen.getByTestId(
      "organization-insights-attention",
    );

    expect(
      within(attention).getByText("1 recommandation ouverte"),
    ).toBeInTheDocument();

    expect(
      within(attention).getByText("Profil de carrière à compléter"),
    ).toBeInTheDocument();

    expect(
      await within(attention).findByText(
        "Mandat professionnel à clarifier",
      ),
    ).toBeInTheDocument();

    expect(
      await within(attention).findByText(
        "Intention professionnelle à clarifier",
      ),
    ).toBeInTheDocument();

    expect(
      await within(attention).findByText(
        "Plan d’exécution indisponible",
      ),
    ).toBeInTheDocument();
  });

  it("does not surface false manager attention signals for completed worker state", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    vi.mocked(
      getAdminWorkerProfessionalMandateSupport,
    ).mockResolvedValue({
      mandate: null,
      readiness: {
        readiness_state: "decision_ready",
        dimensions: [],
        blocking_dimensions: [],
        decision_ready: true,
      },
      completion_guidance: null,
    } as never);

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockResolvedValue({
      readiness_state: "plan_ready",
      completion_closed: true,
      initialization_available: false,
      items: [],
    } as never);

    vi.mocked(
      getAdminWorkerProfessionalExecutionPlan,
    ).mockResolvedValue({
      plan_summary: "Execution plan available.",
      planning_horizon_months: 6,
      milestones: [],
      guardrails: [],
      assumptions: [],
    } as never);

    renderInsights();

    await waitFor(() => {
      expect(
        getAdminWorkerProfessionalMandateSupport,
      ).toHaveBeenCalledTimes(1);

      expect(
        getAdminWorkerProfessionalIntentionCompletionWorkspace,
      ).toHaveBeenCalledTimes(1);

      expect(
        getAdminWorkerProfessionalExecutionPlan,
      ).toHaveBeenCalledTimes(1);
    });

    const attention = screen.getByTestId(
      "organization-insights-attention",
    );

    expect(
      within(attention).queryByText(/recommandation ouverte/),
    ).not.toBeInTheDocument();

    expect(
      within(attention).queryByText("Profil de carrière à compléter"),
    ).not.toBeInTheDocument();

    expect(
      within(attention).queryByText("Mandat professionnel à clarifier"),
    ).not.toBeInTheDocument();

    expect(
      within(attention).queryByText(
        "Intention professionnelle à clarifier",
      ),
    ).not.toBeInTheDocument();

    expect(
      within(attention).queryByText("Plan d’exécution indisponible"),
    ).not.toBeInTheDocument();

    expect(within(attention).getByText("0")).toBeInTheDocument();
  });

  it("switches the worker intelligence workspace immediately to English", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "en");

    renderInsights();

    expect(
      screen.getByText("Worker performance workspace"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("External conversations"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Worker profile"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Career blueprint"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Levers workspace"),
    ).toBeInTheDocument();
  });

  it("localizes Professional Mandate clarification support in French", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    vi.mocked(
      getAdminWorkerProfessionalMandateSupport,
    ).mockResolvedValue({
      mandate: null,
      readiness: {
        readiness_state: "partially_grounded",
        dimensions: [],
        blocking_dimensions: ["professional_identity"],
        decision_ready: false,
      },
      completion_guidance: {
        readiness_state: "partially_grounded",
        guidance: [
          {
            dimension: "professional_identity",
            state: "unknown",
            recommended_actor: "organization",
            intervention_type: "question",
            prompt:
              "How does the worker describe the professional identity they want to protect?",
            purpose: "Capture worker-owned mandate truth.",
            source_scope: ["worker"],
            completion_priority: "now",
          },
        ],
      },
    } as never);

    renderInsights();

    expect(
      await screen.findByText("Clarification du mandat professionnel"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Clarification suggérée"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Enregistrer la réponse du collaborateur"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Réponse du collaborateur au mandat"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Identité professionnelle"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Enregistrer la réponse au mandat",
      }),
    ).toBeInTheDocument();
  });

  it("localizes the completed Professional Mandate state in French", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    vi.mocked(
      getAdminWorkerProfessionalMandateSupport,
    ).mockResolvedValue({
      mandate: null,
      readiness: {
        readiness_state: "decision_ready",
        dimensions: [],
        blocking_dimensions: [],
        decision_ready: true,
      },
      completion_guidance: {
        readiness_state: "decision_ready",
        guidance: [],
      },
    } as never);

    renderInsights();

    expect(
      await screen.findByText(
        "La clarification du mandat professionnel est terminée. Aucune clarification supplémentaire n’est requise actuellement.",
      ),
    ).toBeInTheDocument();
  });

  it("localizes Professional Intention clarification in French", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockResolvedValue({
      readiness_state: "progress_evaluable",
      completion_closed: false,
      initialization_available: false,
      items: [
        {
          dimension: "target_horizon",
          current_state: "unknown",
          reason: "A valid target horizon is still missing.",
          suggested_question:
            "Within what time horizon does the worker want to reach this professional target?",
          requested_source_actor: "worker",
          resolution_status: "open",
          resolution_condition:
            "A valid target horizon greater than zero is established.",
          evidence: [],
        },
      ],
    } as never);

    renderInsights();

    expect(
      await screen.findByText("Clarification de l’intention professionnelle"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Clarification suggérée"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Condition de résolution"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Enregistrer la réponse du collaborateur"),
    ).toHaveLength(2);

    expect(
      screen.getByLabelText("Réponse du collaborateur"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Horizon cible en mois"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Enregistrer la réponse du collaborateur",
      }),
    ).toBeInTheDocument();
  });

  it("localizes the completed Professional Intention state in French", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockResolvedValue({
      readiness_state: "plan_ready",
      completion_closed: true,
      initialization_available: false,
      items: [],
    } as never);

    renderInsights();

    expect(
      await screen.findByText(
        "La clarification de l’intention professionnelle est terminée. Aucune clarification supplémentaire n’est requise actuellement.",
      ),
    ).toBeInTheDocument();
  });


  it("localizes worker collections and support resource controls in French", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    const summary = workerSummary();

    const lever = {
      id: 21,
      category: "coaching",
      is_active: true,
      usage_count: 2,
      is_highlighted: true,
      is_default: true,
      name: "Leadership coaching",
      description: "Structured leadership support.",
      provider_type: "partner",
      is_paid: true,
      price_min_eur: 100,
      price_max_eur: 250,
      match_reasons: ["Leadership transition"],
      recommendation_ids: [11],
      url: "https://example.com/lever",
    };

    summary.sessions = [
      {
        session_id: 101,
        status: "completed",
        started_at: "2026-09-01T10:00:00Z",
        summary: null,
      },
    ] as never;

    summary.recommendations = [
      {
        id: 11,
        status: "open",
        priority: "high",
        title: "Strengthen leadership positioning",
        description: "Prepare a concrete leadership positioning action.",
      },
    ] as never;

    summary.artifacts = [
      {
        id: 31,
        format: "ebook",
        status: "ready",
        title: "Leadership guide",
        price_eur: 15,
        error_message: null,
      },
    ] as never;

    summary.levers = [lever] as never;

    renderInsights({
      selectedWorkerSummary: summary,
      filteredLevers: [lever] as never,
      relatedLeversByRecommendationId: new Map([
        [11, [lever] as never],
      ]),
    });

    expect(screen.getByText("Aucune synthèse disponible.")).not.toBeNull();

    expect(
      screen.getByRole("button", {
        name: "Marquer la recommandation 11 comme terminée",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Marquer comme terminée"),
    ).toBeInTheDocument();

    expect(screen.getByText("Leviers associés")).toBeInTheDocument();

    expect(screen.getByText("actif")).toBeInTheDocument();
    expect(screen.getByText("utilisé 2×")).toBeInTheDocument();
    expect(screen.getByText("mis en avant")).toBeInTheDocument();
    expect(screen.getByText("par défaut")).toBeInTheDocument();

    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("muted") === true &&
          element.textContent === "Fournisseur: partner · Payant: oui",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("muted") === true &&
          element.textContent === "Prix: €100 - €250",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("muted") === true &&
          element.textContent ===
            "Raisons de correspondance: Leadership transition",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Recommandations liées"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Recommandation #11" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Ouvrir le lien du levier" }),
    ).toBeInTheDocument();
  });

  it("localizes Professional Intention validation errors in French", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockResolvedValue({
      readiness_state: "progress_evaluable",
      completion_closed: false,
      initialization_available: false,
      items: [
        {
          dimension: "target_horizon",
          current_state: "unknown",
          reason: "A valid target horizon is still missing.",
          suggested_question:
            "Within what time horizon does the worker want to reach this professional target?",
          requested_source_actor: "worker",
          resolution_status: "open",
          resolution_condition:
            "A valid target horizon greater than zero is established.",
          evidence: [],
        },
      ],
    } as never);

    renderInsights();

    const button = await screen.findByRole("button", {
      name: "Enregistrer la réponse du collaborateur",
    });

    fireEvent.click(button);

    expect(
      screen.getByText(
        "Saisissez la réponse du collaborateur et un horizon cible valide en mois.",
      ),
    ).toBeInTheDocument();
  });

  it("localizes Professional Mandate validation errors in French", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    vi.mocked(
      getAdminWorkerProfessionalMandateSupport,
    ).mockResolvedValue({
      mandate: null,
      readiness: {
        readiness_state: "partially_grounded",
        dimensions: [],
        blocking_dimensions: ["professional_identity"],
        decision_ready: false,
      },
      completion_guidance: {
        readiness_state: "partially_grounded",
        guidance: [
          {
            dimension: "professional_identity",
            state: "unknown",
            recommended_actor: "organization",
            intervention_type: "question",
            prompt:
              "How does the worker describe the professional identity they want to protect?",
            purpose: "Capture worker-owned mandate truth.",
            source_scope: ["worker"],
            completion_priority: "now",
          },
        ],
      },
    } as never);

    renderInsights();

    const button = await screen.findByRole("button", {
      name: "Enregistrer la réponse au mandat",
    });

    fireEvent.click(button);

    expect(
      screen.getByText(
        "Saisissez la réponse du collaborateur et son identité professionnelle.",
      ),
    ).toBeInTheDocument();
  });


  it("localizes the remaining Professional Intention workspace copy in French", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockResolvedValue({
      readiness_state: "progress_evaluable",
      completion_closed: false,
      initialization_available: true,
      items: [
        {
          dimension: "movement_definition",
          current_state: "unknown",
          reason: "Movement definition is missing.",
          suggested_question: "What professional movement is the worker pursuing?",
          requested_source_actor: "worker",
          resolution_status: "open",
          resolution_condition: "A normalized movement is established.",
          evidence: [
            {
              source_type: "conversation",
              source_actor: "worker",
              captured_by_actor: "organization",
              summary: "The worker described a broader strategic role.",
              supports_resolution: true,
            },
          ],
        },
        {
          dimension: "target_state",
          current_state: "unknown",
          reason: "Target identity is missing.",
          suggested_question: "Who does the worker want to become professionally?",
          requested_source_actor: "worker",
          resolution_status: "open",
          resolution_condition: "A target identity is established.",
          evidence: [],
        },
        {
          dimension: "desired_outcomes",
          current_state: "unknown",
          reason: "Desired impact is missing.",
          suggested_question: "What impact does the worker want to create?",
          requested_source_actor: "worker",
          resolution_status: "open",
          resolution_condition: "A desired impact is established.",
          evidence: [],
        },
        {
          dimension: "progress_markers",
          current_state: "unknown",
          reason: "Progress markers are missing.",
          suggested_question: "What short-term mission would show progress?",
          requested_source_actor: "worker",
          resolution_status: "open",
          resolution_condition: "A short-term mission is established.",
          evidence: [],
        },
      ],
    } as never);

    renderInsights();

    expect(
      await screen.findByText("Clarification de l’intention professionnelle"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Aide à la clarification pour l’organisation. Les éléments disponibles permettent de préparer l’échange avec le collaborateur sans remplacer les informations professionnelles dont il est l’auteur.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Initialiser l’intention professionnelle",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Résumé de l’évolution professionnelle"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Saisissez la synthèse structurée de l’évolution professionnelle.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Identité professionnelle cible"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Saisissez l’identité professionnelle cible structurée.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Impact souhaité")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Saisissez l’impact professionnel souhaité sous forme structurée.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Mission à court terme")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Saisissez une mission à court terme sous forme structurée.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("Éléments déjà disponibles"),
    ).toHaveLength(4);

    expect(
      screen.getAllByText(
        "Aucun élément candidat n’est actuellement disponible pour cette dimension.",
      ),
    ).toHaveLength(3);

    expect(
      screen.getByText(/source : worker/),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/saisi par : organization/),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Élément candidat uniquement — aide à la résolution : confirmée/,
      ),
    ).toBeInTheDocument();
  });

  it("localizes the remaining Professional Mandate workspace copy in French", async () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    vi.mocked(
      getAdminWorkerProfessionalMandateSupport,
    ).mockResolvedValue({
      mandate: null,
      readiness: {
        readiness_state: "partially_grounded",
        dimensions: [],
        blocking_dimensions: [
          "expected_outcomes",
          "success_definition",
          "meaning_and_contribution",
          "constraints_and_non_negotiables",
          "capacity_and_sustainability",
        ],
        decision_ready: false,
      },
      completion_guidance: {
        readiness_state: "partially_grounded",
        guidance: [
          {
            dimension: "expected_outcomes",
            state: "unknown",
            recommended_actor: "organization",
            intervention_type: "question",
            prompt: "What outcome does the worker expect?",
            purpose: "Clarify expected outcomes.",
            source_scope: ["worker"],
            completion_priority: "now",
          },
          {
            dimension: "success_definition",
            state: "unknown",
            recommended_actor: "organization",
            intervention_type: "question",
            prompt: "How does the worker define success?",
            purpose: "Clarify success.",
            source_scope: ["worker"],
            completion_priority: "now",
          },
          {
            dimension: "meaning_and_contribution",
            state: "unknown",
            recommended_actor: "organization",
            intervention_type: "question",
            prompt: "What creates meaning and contribution?",
            purpose: "Clarify meaning.",
            source_scope: ["worker"],
            completion_priority: "now",
          },
          {
            dimension: "constraints_and_non_negotiables",
            state: "unknown",
            recommended_actor: "organization",
            intervention_type: "question",
            prompt: "What constraints are non-negotiable?",
            purpose: "Clarify constraints.",
            source_scope: ["worker"],
            completion_priority: "now",
          },
          {
            dimension: "capacity_and_sustainability",
            state: "unknown",
            recommended_actor: "organization",
            intervention_type: "question",
            prompt: "What capacity must remain sustainable?",
            purpose: "Clarify capacity.",
            source_scope: ["worker"],
            completion_priority: "now",
          },
        ],
      },
    } as never);

    renderInsights();

    expect(
      await screen.findByText("Clarification du mandat professionnel"),
    ).toBeInTheDocument();

    expect(screen.getByText("Résultat attendu")).toBeInTheDocument();
    expect(screen.getByText("Définition de la réussite")).toBeInTheDocument();

    expect(screen.getByText("Facteur de sens")).toBeInTheDocument();
    expect(screen.getByText("Facteur d’engagement")).toBeInTheDocument();
    expect(screen.getByText("Facteur de contribution")).toBeInTheDocument();

    expect(screen.getByText("Contrainte forte")).toBeInTheDocument();
    expect(screen.getByText("Non négociable")).toBeInTheDocument();

    expect(screen.getByText("Capacité temporelle")).toBeInTheDocument();
    expect(screen.getByText("Contrainte d’énergie")).toBeInTheDocument();

    expect(
      screen.getAllByText(/Source demandée : worker/),
    ).toHaveLength(5);
  });

});
