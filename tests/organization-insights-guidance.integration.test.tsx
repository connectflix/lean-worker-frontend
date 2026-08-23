import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrganizationInsightsTab } from "@/app/admin/organizations/components/organization-insights-tab";
import type {
  AdminOrganizationWorkerSummary,
  OrganizationWorkerGuidanceResponse,
} from "@/lib/types";


const guidanceCardMock = vi.fn();

vi.mock(
  "@/app/admin/organizations/components/organization-worker-guidance-card",
  () => ({
    OrganizationWorkerGuidanceCard: (props: {
      guidance: OrganizationWorkerGuidanceResponse | null;
      loading: boolean;
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
    />,
  );
}


describe("OrganizationInsightsTab + Organization Guidance", () => {
  it("renders the dedicated guidance card for the selected Worker", () => {
    const payload = guidance();

    renderInsights({
      organizationGuidance: payload,
    });

    expect(
      screen.getByTestId("organization-worker-guidance-card"),
    ).toBeInTheDocument();

    expect(guidanceCardMock).toHaveBeenCalledWith({
      guidance: payload,
      loading: false,
    });
  });


  it("passes the independent guidance loading state to the card", () => {
    renderInsights({
      organizationGuidance: null,
      organizationGuidanceLoading: true,
    });

    expect(
      screen.getByText("guidance-loading"),
    ).toBeInTheDocument();

    expect(guidanceCardMock).toHaveBeenCalledWith({
      guidance: null,
      loading: true,
    });
  });


  it("keeps guidance visible when the persisted mandate plan is absent", () => {
    const payload = guidance();

    renderInsights({
      organizationGuidance: payload,
    });

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