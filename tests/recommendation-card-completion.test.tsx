import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecommendationCard } from "@/components/recommendation-card";
import { updateRecommendation } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  getMyAIArtifacts: vi.fn().mockResolvedValue([]),
  updateRecommendation: vi.fn(),
}));

vi.mock("@/components/offers/ActionNavigator", () => ({
  ActionNavigator: () => <div data-testid="action-navigator" />,
}));

vi.mock("@/components/recommendation/ActionStepNavigator", () => ({
  ActionStepNavigator: () => <div data-testid="action-step-navigator" />,
}));

function recommendation(overrides: Record<string, unknown> = {}) {
  return {
    id: 42,
    title: "Clarifier mon positionnement",
    description: "Rendre mon positionnement plus explicite.",
    primary_problem: null,
    action_track: null,
    why_recommended: null,
    priority: "medium",
    status: "in_progress",
    artifact_generation_available: false,
    artifact_default_format: null,
    artifact_price_min_eur: null,
    artifact_price_max_eur: null,
    user_note: null,
    started_at: null,
    completed_at: null,
    levers: [],
    offers: null,
    ...overrides,
  } as any;
}

describe("RecommendationCard completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows the Worker to mark an in-progress recommendation as completed", async () => {
    const item = recommendation();

    vi.mocked(updateRecommendation).mockResolvedValue({
      ...item,
      status: "completed",
      completed_at: "2026-09-10T08:30:00",
    });

    const onUpdated = vi.fn();

    render(
      <RecommendationCard
        item={item}
        onUpdated={onUpdated}
        uiLanguage="fr"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /marquer.*effectuée/i,
      }),
    );

    await waitFor(() => {
      expect(updateRecommendation).toHaveBeenCalledWith(42, {
        status: "completed",
      });
    });

    expect(onUpdated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 42,
        status: "completed",
      }),
    );
  });

  it("allows the Worker to directly complete an open recommendation", async () => {
    const item = recommendation({ status: "open" });

    vi.mocked(updateRecommendation).mockResolvedValue({
      ...item,
      status: "completed",
      completed_at: "2026-09-10T08:45:00",
    });

    render(
      <RecommendationCard
        item={item}
        onUpdated={vi.fn()}
        uiLanguage="fr"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /marquer.*effectuée/i,
      }),
    );

    await waitFor(() => {
      expect(updateRecommendation).toHaveBeenCalledWith(42, {
        status: "completed",
      });
    });
  });

  it("does not expose completion action once the recommendation is completed", () => {
    render(
      <RecommendationCard
        item={recommendation({
          status: "completed",
          completed_at: "2026-09-10T08:30:00",
        })}
        onUpdated={vi.fn()}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: /marquer.*effectuée/i,
      }),
    ).not.toBeInTheDocument();
  });
});