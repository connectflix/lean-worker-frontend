import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrganizationWorkerGuidanceCard } from "@/app/admin/organizations/components/organization-worker-guidance-card";
import type {
  AdminLever,
  ExternalLeverCandidate,
  OrganizationWorkerGuidanceResponse,
} from "@/lib/types";


function guidance(
  overrides: Partial<OrganizationWorkerGuidanceResponse> = {},
): OrganizationWorkerGuidanceResponse {
  return {
    mandate_summary: null,
    mandate_plan: null,
    organization_recommendations: [
      {
        id: 801,
        title: "Clarify decision boundaries",
        action: (
          "Make explicit which decisions the Worker can take "
          + "without additional approval."
        ),
        example: (
          "For example: allow the Worker to approve decisions "
          + "up to a defined threshold without additional approval."
        ),
        rationale: "This removes an avoidable organizational dependency.",
        timing: "Before the next execution step",
        completed_at: null,
      },
      {
        id: 802,
        title: "Protect focused execution time",
        action: "Reserve focused time for the selected action.",
        example: null,
        rationale: "This improves the conditions for execution.",
        timing: null,
        completed_at: null,
      },
    ],
    ...overrides,
  };
}


describe("OrganizationWorkerGuidanceCard organization recommendations", () => {
  it("renders organization recommendations even when mandate summary and plan are absent", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Organization recommendations",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Clarify decision boundaries"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Protect focused execution time"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("No mandate guidance available yet."),
    ).not.toBeInTheDocument();
  });


  it("renders action, rationale and optional timing for each recommendation", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByText(
        "Make explicit which decisions the Worker can take without additional approval.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This removes an avoidable organizational dependency.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Before the next execution step"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Reserve focused time for the selected action."),
    ).toBeInTheDocument();
  });


  it("renders a concrete example when the recommendation provides one", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getAllByText("Example"),
    ).toHaveLength(2);

    expect(
      screen.getByText(
        "For example: allow the Worker to approve decisions up to a defined threshold without additional approval.",
      ),
    ).toBeInTheDocument();
  });


  it("renders an explicit Example placeholder for legacy recommendations without one", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance({
          organization_recommendations: [
            {
              id: 799,
              title: "Historical recommendation",
              action: "Clarify the execution condition.",
              example: null,
              rationale: "Historical grounded rationale.",
              timing: null,
              completed_at: null,
            },
          ],
        })}
        loading={false}
      />,
    );

    expect(
      screen.getByText("Historical recommendation"),
    ).toBeInTheDocument();
  });


  it("keeps recommendations explicitly organization-facing rather than Worker instructions", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByText(
        /what the organization can do to improve the conditions for the Worker's next action/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Worker recommendations" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Worker actions" }),
    ).not.toBeInTheDocument();
  });


  it("does not render an empty recommendation section", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance({
          organization_recommendations: [],
          mandate_summary: {
            mandate_summary: "Current mandate.",
            professional_identity: null,
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
        })}
        loading={false}
      />,
    );

    expect(
      screen.queryByRole("heading", {
        name: "Organization recommendations",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Mandate summary" }),
    ).toBeInTheDocument();
  });


  it("offers a completion action for an open organization recommendation", () => {
    const onCompleted = vi.fn();

    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
        onOrganizationRecommendationCompleted={onCompleted}
      />,
    );

    const button = screen.getByRole("button", {
      name: /mark clarify decision boundaries completed/i,
    });

    expect(button).toBeVisible();

    fireEvent.click(button);

    expect(onCompleted).toHaveBeenCalledTimes(1);
    expect(onCompleted).toHaveBeenCalledWith(801);
  });


  it("keeps completed recommendations visible and removes their completion action", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance({
          organization_recommendations: [
            {
              ...guidance().organization_recommendations[0],
              completed_at: "2026-09-17T20:00:00",
            },
          ],
        })}
        loading={false}
        onOrganizationRecommendationCompleted={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Clarify decision boundaries"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Completed"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /mark clarify decision boundaries completed/i,
      }),
    ).not.toBeInTheDocument();
  });


  it("renders every organization recommendation as a fully visible card rather than a collapsible details element", () => {
    const { container } = render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
        onOrganizationRecommendationCompleted={vi.fn()}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Organization recommendations",
    });

    const section = heading.closest("section");

    expect(section).not.toBeNull();
    expect(section?.querySelector("details")).toBeNull();

    expect(
      screen.getByText(
        "Make explicit which decisions the Worker can take without additional approval.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "For example: allow the Worker to approve decisions up to a defined threshold without additional approval.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This removes an avoidable organizational dependency.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Reserve focused time for the selected action."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("This improves the conditions for execution."),
    ).toBeInTheDocument();
  });


  it("keeps the Example section visible for historical recommendations without persisted example data", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance({
          organization_recommendations: [
            {
              id: 799,
              title: "Historical recommendation",
              action: "Clarify the execution condition.",
              example: null,
              rationale: "Historical grounded rationale.",
              timing: null,
              completed_at: null,
            },
          ],
        })}
        loading={false}
        onOrganizationRecommendationCompleted={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Example not available for this historical recommendation."),
    ).toBeInTheDocument();
  });


  it("keeps organization recommendations inside a bounded scroll panel", () => {
    const { container } = render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Organization recommendations",
    });

    const section = heading.closest("section");

    expect(section).not.toBeNull();

    const scrollPanel = section?.querySelector(".scroll-panel");

    expect(scrollPanel).not.toBeNull();
    expect(scrollPanel).toHaveClass("stack");
    expect(scrollPanel).toHaveStyle({
      maxHeight: "430px",
    });
  });


  it("keeps a persistent scroll gutter for organization recommendations", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Organization recommendations",
    });

    const section = heading.closest("section");
    const scrollPanel = section?.querySelector(".scroll-panel");

    expect(scrollPanel).not.toBeNull();
    expect(scrollPanel).toHaveClass("organization-recommendations-scroll");
    expect(scrollPanel).toHaveStyle({
      overflowY: "scroll",
      scrollbarGutter: "stable",
    });
  });


  it("discovers transformation Levers from an explicit recommendation-scoped identity", async () => {
    const onLeverDiscovery = vi.fn(async () => []);

    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
        onOrganizationRecommendationLeverDiscovery={onLeverDiscovery}
      />,
    );

    const typeSelect = screen.getByRole("combobox", {
      name: /lever type for clarify decision boundaries/i,
    });

    const categorySelect = screen.getByRole("combobox", {
      name: /lever category for clarify decision boundaries/i,
    });

    expect(typeSelect).toHaveValue("transformation");
    expect(categorySelect).toHaveValue("mentor");

    fireEvent.click(
      screen.getByRole("button", {
        name: /discover levers for clarify decision boundaries/i,
      }),
    );

    await screen.findByText(/no external lever candidates found/i);

    expect(onLeverDiscovery).toHaveBeenCalledTimes(1);
    expect(onLeverDiscovery).toHaveBeenCalledWith(
      801,
      {
        provider_name: "apollo",
        lever_type: "transformation",
        entity_kind: "person",
        category: "mentor",
        limit: 10,
      },
    );
  });


  it("constrains Impact discovery to organization company Levers", async () => {
    const onLeverDiscovery = vi.fn(async () => []);

    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
        onOrganizationRecommendationLeverDiscovery={onLeverDiscovery}
      />,
    );

    fireEvent.change(
      screen.getByRole("combobox", {
        name: /lever type for clarify decision boundaries/i,
      }),
      {
        target: {
          value: "impact",
        },
      },
    );

    expect(
      screen.getByRole("combobox", {
        name: /lever category for clarify decision boundaries/i,
      }),
    ).toHaveValue("company");

    fireEvent.click(
      screen.getByRole("button", {
        name: /discover levers for clarify decision boundaries/i,
      }),
    );

    await screen.findByText(/no external lever candidates found/i);

    expect(onLeverDiscovery).toHaveBeenCalledWith(
      801,
      {
        provider_name: "apollo",
        lever_type: "impact",
        entity_kind: "organization",
        category: "company",
        limit: 10,
      },
    );
  });


  it("renders discovered candidates read-only without implying Worker selection or catalog save", async () => {
    const candidate: ExternalLeverCandidate = {
      category: "mentor",
      lever_type: "transformation",
      entity_kind: "person",
      name: "Enterprise Architecture Mentor",
      description: "Experienced architecture mentor.",
      url: "https://example.com/profile",
      tags: ["architecture"],
      target_problem: ["decision clarity"],
      source_provider: "apollo",
      source_external_id: "person-123",
      source_url: "https://example.com/profile",
      source_payload_json: {},
    };

    const onLeverDiscovery = vi.fn(async () => [candidate]);

    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
        onOrganizationRecommendationLeverDiscovery={onLeverDiscovery}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /discover levers for clarify decision boundaries/i,
      }),
    );

    expect(
      await screen.findByText("Enterprise Architecture Mentor"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Experienced architecture mentor."),
    ).toBeInTheDocument();

    expect(screen.getByText(/apollo/i)).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /save.*catalog/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(/selected for worker/i),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(/recommended to worker/i),
    ).not.toBeInTheDocument();
  });



  it("saves a discovered candidate only through an explicit catalog action", async () => {
    const candidate: ExternalLeverCandidate = {
      category: "mentor",
      lever_type: "transformation",
      entity_kind: "person",
      name: "Enterprise Architecture Mentor",
      description: "Experienced architecture mentor.",
      url: "https://example.com/profile",
      tags: ["architecture"],
      target_problem: ["decision clarity"],
      source_provider: "apollo",
      source_external_id: "person-123",
      source_url: "https://example.com/profile",
      source_payload_json: {},
    };

    const savedLever: AdminLever = {
      id: 44,
      ...candidate,
      provider_type: "external",
      is_paid: false,
      price_min_eur: null,
      price_max_eur: null,
      currency: "EUR",
      is_default: false,
      priority_score: 0,
      is_active: true,
      created_at: "2026-10-18T12:00:00",
    };

    const onLeverDiscovery = vi.fn(async () => [candidate]);
    const onLeverSave = vi.fn(async () => savedLever);

    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
        onOrganizationRecommendationLeverDiscovery={onLeverDiscovery}
        onOrganizationRecommendationLeverSave={onLeverSave}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /discover levers for clarify decision boundaries/i,
      }),
    );

    expect(
      await screen.findByText("Enterprise Architecture Mentor"),
    ).toBeInTheDocument();

    const saveButton = screen.getByRole("button", {
      name: /save enterprise architecture mentor to lever catalog/i,
    });

    expect(onLeverSave).not.toHaveBeenCalled();

    fireEvent.click(saveButton);

    expect(
      await screen.findByText(/saved to lever catalog/i),
    ).toBeInTheDocument();

    expect(onLeverSave).toHaveBeenCalledTimes(1);
    expect(onLeverSave).toHaveBeenCalledWith(candidate);
  });


  it("makes catalog persistence semantics explicit after save", async () => {
    const candidate: ExternalLeverCandidate = {
      category: "company",
      lever_type: "impact",
      entity_kind: "organization",
      name: "Transformation Partner",
      description: "Organization discovered externally.",
      url: "https://example.com/company",
      tags: ["transformation"],
      target_problem: [],
      source_provider: "apollo",
      source_external_id: "organization-456",
      source_url: "https://example.com/company",
      source_payload_json: {},
    };

    const savedLever: AdminLever = {
      id: 45,
      ...candidate,
      provider_type: "external",
      is_paid: false,
      price_min_eur: null,
      price_max_eur: null,
      currency: "EUR",
      is_default: false,
      priority_score: 0,
      is_active: true,
      created_at: "2026-10-18T12:00:00",
    };

    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
        onOrganizationRecommendationLeverDiscovery={vi.fn(async () => [
          candidate,
        ])}
        onOrganizationRecommendationLeverSave={vi.fn(async () => savedLever)}
      />,
    );

    fireEvent.change(
      screen.getByRole("combobox", {
        name: /lever type for clarify decision boundaries/i,
      }),
      {
        target: {
          value: "impact",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /discover levers for clarify decision boundaries/i,
      }),
    );

    await screen.findByText("Transformation Partner");

    fireEvent.click(
      screen.getByRole("button", {
        name: /save transformation partner to lever catalog/i,
      }),
    );

    expect(
      await screen.findByText(/saved to lever catalog/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /saving this lever makes it available to the canonical catalog/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /does not select or recommend it to the worker/i,
      ),
    ).toBeInTheDocument();
  });


  it("keeps a discovered candidate available when catalog save fails", async () => {
    const candidate: ExternalLeverCandidate = {
      category: "mentor",
      lever_type: "transformation",
      entity_kind: "person",
      name: "Enterprise Architecture Mentor",
      description: "Experienced architecture mentor.",
      url: "https://example.com/profile",
      tags: ["architecture"],
      target_problem: [],
      source_provider: "apollo",
      source_external_id: "person-123",
      source_url: "https://example.com/profile",
      source_payload_json: {},
    };

    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
        onOrganizationRecommendationLeverDiscovery={vi.fn(async () => [
          candidate,
        ])}
        onOrganizationRecommendationLeverSave={vi.fn(async () => {
          throw new Error("save failed");
        })}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /discover levers for clarify decision boundaries/i,
      }),
    );

    await screen.findByText("Enterprise Architecture Mentor");

    fireEvent.click(
      screen.getByRole("button", {
        name: /save enterprise architecture mentor to lever catalog/i,
      }),
    );

    expect(
      await screen.findByText(/saving lever to catalog failed/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Enterprise Architecture Mentor"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /save enterprise architecture mentor to lever catalog/i,
      }),
    ).toBeEnabled();
  });


  it("preserves the existing loading state", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={true}
      />,
    );

    expect(
      screen.getByText("Loading organization guidance..."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Organization recommendations",
      }),
    ).not.toBeInTheDocument();
  });
});

it("shows current organization recommendations before the mandate plan", () => {
  render(
    <OrganizationWorkerGuidanceCard
      guidance={guidance({
        mandate_summary: {
          mandate_summary: "Current professional mandate.",
          professional_identity: "Program coordinator",
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
        mandate_plan: {
          plan_summary: "A multi-step organization support path.",
          planning_horizon: "8 to 12 weeks",
          approach: [],
          milestones: [],
          assumptions: [],
        } as any,
      })}
      loading={false}
    />,
  );

  const recommendationsHeading = screen.getByRole("heading", {
    name: "Organization recommendations",
  });

  const mandatePlanHeading = screen.getByRole("heading", {
    name: "Mandate plan",
  });

  expect(
    recommendationsHeading.compareDocumentPosition(mandatePlanHeading)
      & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
