import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config", () => ({
  API_BASE_URL: "http://api.test",
}));

vi.mock("@/lib/auth", () => ({
  getToken: vi.fn(() => "worker-token"),
  clearToken: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({
  getAdminToken: vi.fn(() => null),
  clearAdminToken: vi.fn(),
}));

vi.mock("@/lib/user-locales", () => ({
  resolveUiLanguage: vi.fn(() => "fr"),
}));

import { getTalentTrajectoryIntelligence } from "@/lib/api";
import type { TalentTrajectoryIntelligenceResponse } from "@/lib/types";

function emptyTalentIntelligence(): TalentTrajectoryIntelligenceResponse {
  return {
    capability_trajectories: [],
    value_trajectories: [],
    impact_trajectories: [],
    talent_summary: null,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("Talent Trajectory Intelligence API client", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);

    if (typeof document !== "undefined") {
      document.documentElement.lang = "fr";
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads Talent Trajectory Intelligence with GET and no mutation body", async () => {
    const payload = emptyTalentIntelligence();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getTalentTrajectoryIntelligence();

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/talent-trajectory-intelligence",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated worker headers", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(emptyTalentIntelligence()),
    );

    await getTalentTrajectoryIntelligence();

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer worker-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("keeps Capability, Value and Impact as separate response pillars", async () => {
    const payload = {
      capability_trajectories: [
        {
          capability_key: "stakeholder_alignment",
          capability_label: "Stakeholder Alignment",
        },
      ],
      value_trajectories: [
        {
          value_domain: "decision_quality",
          value_label: "Decision quality",
        },
      ],
      impact_trajectories: [
        {
          impact_domain: "decision_acceleration",
          impact_label: "Decision acceleration",
        },
      ],
      talent_summary:
        "Distinct evidence exists for capability, value and impact.",
    } as TalentTrajectoryIntelligenceResponse;

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getTalentTrajectoryIntelligence();

    expect(result.capability_trajectories).toEqual(
      payload.capability_trajectories,
    );
    expect(result.value_trajectories).toEqual(
      payload.value_trajectories,
    );
    expect(result.impact_trajectories).toEqual(
      payload.impact_trajectories,
    );
  });

  it("accepts an empty Talent history without inventing progress", async () => {
    const payload = emptyTalentIntelligence();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getTalentTrajectoryIntelligence();

    expect(result.capability_trajectories).toEqual([]);
    expect(result.value_trajectories).toEqual([]);
    expect(result.impact_trajectories).toEqual([]);
    expect(result.talent_summary).toBeNull();
  });

  it("does not send write, commerce, score, ranking or recommendation inputs", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(emptyTalentIntelligence()),
    );

    await getTalentTrajectoryIntelligence();

    const [url, options] = fetchMock.mock.calls[0];
    const serializedUrl = String(url).toLowerCase();

    expect(serializedUrl).not.toContain("payment");
    expect(serializedUrl).not.toContain("checkout");
    expect(serializedUrl).not.toContain("commercial");
    expect(serializedUrl).not.toContain("score");
    expect(serializedUrl).not.toContain("ranking");
    expect(serializedUrl).not.toContain("recommend");

    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
  });

  it("does not require a worker id or trajectory id from the caller", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(emptyTalentIntelligence()),
    );

    await getTalentTrajectoryIntelligence();

    const [url] = fetchMock.mock.calls[0];
    const serializedUrl = String(url);

    expect(serializedUrl).not.toContain("worker_id");
    expect(serializedUrl).not.toContain("trajectory_update_id");
    expect(serializedUrl).not.toMatch(/\/workers\/\d+/);
    expect(serializedUrl).not.toMatch(/\/trajectory\/\d+/);
  });
});