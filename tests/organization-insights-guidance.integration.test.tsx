import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrganizationInsightsTab } from "@/app/admin/organizations/components/organization-insights-tab";
import type {
  AdminLever,
  AdminOrganizationWorkerSummary,
  ExternalLeverCandidate,
  OrganizationRecommendationLeverDiscoveryRequest,
  OrganizationWorkerGuidanceResponse,
} from "@/lib/types";


const guidanceCardMock = vi.fn();

vi.mock(
  "@/app/admin/organizations/components/organization-worker-guidance-card",
  () => ({
    OrganizationWorkerGuidanceCard: (props: {
      guidance: OrganizationWorkerGuidanceResponse | null;
      loading: boolean;
      onOrganizationRecommendationCompleted?: (
        recommendationId: number,
      ) => void;
      onOrganizationRecommendationLeverDiscovery?: (
        recommendationId: number,
        payload: OrganizationRecommendationLeverDiscoveryRequest,
      ) => Promise<ExternalLeverCandidate[]>;
      onOrganizationRecommendationLeverSave?: (
        candidate: ExternalLeverCandidate,
      ) => Promise<AdminLever>;
    }) => {
      guidanceCardMock(props);

      return (
        <section data-testid="organization-worker-guidance-card">
          {props.loading
            ? "guidance-loading"
            : props.guidance?.mandate_summary?.mandate_summary ??
              "guidance-empty"}
        </section>
      );
    },
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
      created_at: "2026-08-20T10:00:00Z",
    },
    career_blueprint: null,
    sessions: [],
    recommendations: [],
    artifacts: [],
    levers: [],
    session_count: 0,
    external_conversation_count: 0,
    recommendation_count: 0,
    artifact_count: 0,
    lever_count: 0,
  } as AdminOrganizationWorkerSummary;
}


function guidance(): OrganizationWorkerGuidanceResponse {
  return {
    mandate_summary: {
      mandate_summary:
        "Strengthen strategic contribution while preserving sustainable execution.",
      professional_identity: "Senior contributor",
      expected_outcomes: [],
      success_definition: [],
      meaning_drivers: [],
      engagement_drivers: [],
      contribution_drivers: [],
      hard_constraints: [],
      soft_constraints: [],
      time_capacity: [],
      energy_constraints: [],
      risks_to_avoid: [],
      non_negotiables: [],
    },
    mandate_plan: null,
  };
}


function renderInsights(
  overrides: Partial<{
    selectedWorkerSummary: AdminOrganizationWorkerSummary | null;
    workerSummaryLoading: boolean;
    organizationGuidance: OrganizationWorkerGuidanceResponse | null;
    organizationGuidanceLoading: boolean;
    onOrganizationRecommendationCompleted: (
      recommendationId: number,
    ) => void;
    onOrganizationRecommendationLeverDiscovery: (
      recommendationId: number,
      payload: OrganizationRecommendationLeverDiscoveryRequest,
    ) => Promise<ExternalLeverCandidate[]>;
    onOrganizationRecommendationLeverSave: (
      candidate: ExternalLeverCandidate,
    ) => Promise<AdminLever>;
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
      organizationGuidance={
        overrides.organizationGuidance === undefined
          ? guidance()
          : overrides.organizationGuidance
      }
      organizationGuidanceLoading={
        overrides.organizationGuidanceLoading ?? false
      }
      leverSearch=""
      leverCategoryFilter=""
      leverSortMode="highlighted"
      leverCategories={[]}
      filteredLevers={[]}
      relatedLeversByRecommendationId={new Map()}
      onLeverSearchChange={vi.fn()}
      onLeverCategoryFilterChange={vi.fn()}
      onLeverSortModeChange={vi.fn()}
      onScrollToRecommendation={vi.fn()}
      onOrganizationRecommendationCompleted={
        overrides.onOrganizationRecommendationCompleted ?? vi.fn()
      }
      onOrganizationRecommendationLeverDiscovery={
        overrides.onOrganizationRecommendationLeverDiscovery
      }
      onOrganizationRecommendationLeverSave={
        overrides.onOrganizationRecommendationLeverSave
      }
    />,
  );
}


describe("OrganizationInsightsTab + Organization Guidance", () => {
  it("moves organization guidance out of Overview and into Decision", () => {
    renderInsights({
      organizationGuidance: guidance(),
    });

    const overview = screen.getByRole("tab", {
      name: "Overview",
    });

    const decision = screen.getByRole("tab", {
      name: "Decision",
    });

    expect(overview).toHaveAttribute("aria-selected", "true");
    expect(decision).toHaveAttribute("aria-selected", "false");

    expect(
      screen.queryByTestId("organization-worker-guidance-card"),
    ).not.toBeInTheDocument();

    fireEvent.click(decision);

    expect(overview).toHaveAttribute("aria-selected", "false");
    expect(decision).toHaveAttribute("aria-selected", "true");

    expect(
      screen.getByTestId("organization-worker-guidance-card"),
    ).toBeInTheDocument();
  });

  it("renders the dedicated guidance card for the selected Worker", () => {
    const payload = guidance();

    renderInsights({
      organizationGuidance: payload,
    });

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

    expect(
      screen.getByTestId("organization-worker-guidance-card"),
    ).toBeInTheDocument();

    expect(guidanceCardMock).toHaveBeenCalledWith({
      guidance: payload,
      loading: false,
      onOrganizationRecommendationCompleted: expect.any(Function),
    });
  });


  it("forwards organization recommendation completion to the guidance card", () => {
    const onCompleted = vi.fn();
    const payload = guidance();

    renderInsights({
      organizationGuidance: payload,
      onOrganizationRecommendationCompleted: onCompleted,
    });

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

    expect(guidanceCardMock).toHaveBeenCalledWith({
      guidance: payload,
      loading: false,
      onOrganizationRecommendationCompleted: onCompleted,
    });
  });



  it("forwards recommendation-scoped Lever discovery to the guidance card", () => {
    const onLeverDiscovery = vi.fn(async () => []);
    const payload = guidance();

    renderInsights({
      organizationGuidance: payload,
      onOrganizationRecommendationLeverDiscovery: onLeverDiscovery,
    });

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

    expect(guidanceCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        guidance: payload,
        loading: false,
        onOrganizationRecommendationLeverDiscovery: onLeverDiscovery,
      }),
    );
  });


  it("forwards explicit discovered Lever save to the guidance card", () => {
    const onLeverSave = vi.fn();
    const payload = guidance();

    renderInsights({
      organizationGuidance: payload,
      onOrganizationRecommendationLeverSave: onLeverSave,
    });

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

    expect(guidanceCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        guidance: payload,
        loading: false,
        onOrganizationRecommendationLeverSave: onLeverSave,
      }),
    );
  });


  it("passes the independent guidance loading state to the card", () => {
    renderInsights({
      organizationGuidance: null,
      organizationGuidanceLoading: true,
    });

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

    expect(
      screen.getByText("guidance-loading"),
    ).toBeInTheDocument();

    expect(guidanceCardMock).toHaveBeenCalledWith({
      guidance: null,
      loading: true,
      onOrganizationRecommendationCompleted: expect.any(Function),
    });
  });


  it("keeps guidance visible when the persisted mandate plan is absent", () => {
    const payload = guidance();

    renderInsights({
      organizationGuidance: payload,
    });

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

    expect(
      screen.getByText(
        "Strengthen strategic contribution while preserving sustainable execution.",
      ),
    ).toBeInTheDocument();

    expect(payload.mandate_plan).toBeNull();
  });


  it("does not render stale guidance when no Worker summary is selected", () => {
    renderInsights({
      selectedWorkerSummary: null,
      organizationGuidance: guidance(),
    });

    expect(
      screen.queryByTestId("organization-worker-guidance-card"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Select a worker to view details."),
    ).toBeInTheDocument();
  });


  it("keeps Worker summary loading as the primary empty-state boundary", () => {
    renderInsights({
      workerSummaryLoading: true,
      organizationGuidance: guidance(),
      organizationGuidanceLoading: true,
    });

    expect(
      screen.getByText("Loading worker summary..."),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("organization-worker-guidance-card"),
    ).not.toBeInTheDocument();
  });
});