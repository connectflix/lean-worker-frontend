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

import { getLongTermCareerTrajectory } from "@/lib/api";
import type { LongTermCareerTrajectoryRead } from "@/lib/types";

function emptyLongTermCareerTrajectory(): LongTermCareerTrajectoryRead {
  return {
    temporal_profile: {
      temporal_evidence_state: "insufficient_evidence",
      episode_count: 0,
      ignored_episode_count: 0,
      recent_episode_count: 0,
      historical_episode_count: 0,
      active_day_count: 0,
      coverage_days: 0,
      first_observed_at: null,
      last_observed_at: null,
      temporal_trend: "insufficient_evidence",
    },
    temporal_windows: {
      recent: {
        episode_count: 0,
        active_day_count: 0,
      },
      previous: {
        episode_count: 0,
        active_day_count: 0,
      },
    },
    activity_comparison: {
      activity_change: "insufficient_evidence",
    },
    velocity_evidence: {
      velocity_evidence_state: "insufficient_evidence",
    },
    velocity_interpretation: {
      activity_velocity: "insufficient_evidence",
    },
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

describe("Long-Term Career Trajectory API client", () => {
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

  it("reads Long-Term Career Trajectory with GET and no mutation body", async () => {
    const payload = emptyLongTermCareerTrajectory();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getLongTermCareerTrajectory();

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/dashboard/long-term-career-trajectory",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated worker headers", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(emptyLongTermCareerTrajectory()),
    );

    await getLongTermCareerTrajectory();

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer worker-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("keeps factual temporal activity dimensions distinct", async () => {
    const payload: LongTermCareerTrajectoryRead = {
      temporal_profile: {
        temporal_evidence_state: "longitudinal",
        episode_count: 8,
        ignored_episode_count: 1,
        recent_episode_count: 4,
        historical_episode_count: 4,
        active_day_count: 7,
        coverage_days: 90,
        first_observed_at: "2026-05-25T12:00:00Z",
        last_observed_at: "2026-08-22T12:00:00Z",
        temporal_trend: "insufficient_evidence",
      },
      temporal_windows: {
        recent: {
          episode_count: 4,
          active_day_count: 3,
        },
        previous: {
          episode_count: 4,
          active_day_count: 3,
        },
      },
      activity_comparison: {
        activity_change: "similar_activity",
      },
      velocity_evidence: {
        velocity_evidence_state: "comparable_windows",
      },
      velocity_interpretation: {
        activity_velocity: "steady",
      },
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getLongTermCareerTrajectory();

    expect(result.temporal_profile.temporal_evidence_state).toBe(
      "longitudinal",
    );
    expect(result.temporal_windows.recent.episode_count).toBe(4);
    expect(result.activity_comparison.activity_change).toBe(
      "similar_activity",
    );
    expect(result.velocity_evidence.velocity_evidence_state).toBe(
      "comparable_windows",
    );
    expect(result.velocity_interpretation.activity_velocity).toBe("steady");
  });

  it("accepts mixed activity without inventing steady career movement", async () => {
    const payload: LongTermCareerTrajectoryRead = {
      ...emptyLongTermCareerTrajectory(),
      temporal_profile: {
        ...emptyLongTermCareerTrajectory().temporal_profile,
        temporal_evidence_state: "longitudinal",
        episode_count: 8,
        active_day_count: 6,
        coverage_days: 90,
        first_observed_at: "2026-05-25T12:00:00Z",
        last_observed_at: "2026-08-22T12:00:00Z",
      },
      temporal_windows: {
        recent: {
          episode_count: 6,
          active_day_count: 2,
        },
        previous: {
          episode_count: 4,
          active_day_count: 3,
        },
      },
      activity_comparison: {
        activity_change: "mixed_activity",
      },
      velocity_evidence: {
        velocity_evidence_state: "comparable_windows",
      },
      velocity_interpretation: {
        activity_velocity: "insufficient_evidence",
      },
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getLongTermCareerTrajectory();

    expect(result.activity_comparison.activity_change).toBe("mixed_activity");
    expect(result.velocity_interpretation.activity_velocity).toBe(
      "insufficient_evidence",
    );
  });

  it("does not expose progression semantics in the Long-Term contract", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(emptyLongTermCareerTrajectory()),
    );

    const result = await getLongTermCareerTrajectory();
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("progression_state");
    expect(serialized).not.toContain("progression_velocity");
    expect(serialized).not.toContain("career_progress");
    expect(serialized).not.toContain("stagnation");
  });

  it("does not send write, commerce, score, ranking or recommendation inputs", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(emptyLongTermCareerTrajectory()),
    );

    await getLongTermCareerTrajectory();

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

  it("does not require worker, session or lineage ids from the caller", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(emptyLongTermCareerTrajectory()),
    );

    await getLongTermCareerTrajectory();

    const [url] = fetchMock.mock.calls[0];
    const serializedUrl = String(url);

    expect(serializedUrl).not.toContain("worker_id");
    expect(serializedUrl).not.toContain("user_id");
    expect(serializedUrl).not.toContain("session_id");
    expect(serializedUrl).not.toContain("trajectory_update_id");
    expect(serializedUrl).not.toContain("snapshot_id");
    expect(serializedUrl).not.toMatch(/\/workers\/\d+/);
    expect(serializedUrl).not.toMatch(/\/trajectory\/\d+/);
  });
});