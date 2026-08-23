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

import { getCareerTrajectoryIntelligence } from "@/lib/api";
import type { CareerTrajectoryIntelligenceResponse } from "@/lib/types";

function emptyCareerTrajectoryIntelligence(): CareerTrajectoryIntelligenceResponse {
  return {
    current_direction: null,
    progression_state: "insufficient_evidence",
    progression_velocity: "insufficient_evidence",
    persistent_blockers: [],
    direction_changes: [],
    stagnation_signals: [],
    career_summary: null,
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

describe("Career Trajectory Intelligence API client", () => {
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

  it("reads Career Trajectory Intelligence with GET and no mutation body", async () => {
    const payload = emptyCareerTrajectoryIntelligence();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getCareerTrajectoryIntelligence();

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/dashboard/career-trajectory-intelligence",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated worker headers", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(emptyCareerTrajectoryIntelligence()),
    );

    await getCareerTrajectoryIntelligence();

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer worker-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("keeps the bounded CTI career dimensions distinct", async () => {
    const payload: CareerTrajectoryIntelligenceResponse = {
      current_direction: "Enterprise Architect",
      progression_state: "progressing",
      progression_velocity: "steady",
      persistent_blockers: [
        {
          blocker: "Limited exposure to strategic decision forums",
          persistence: "persistent",
          evidence: [
            "The same access constraint appeared across multiple professional cycles.",
          ],
        },
      ],
      direction_changes: [
        {
          from_direction: "Deepen delivery specialization",
          to_direction: "Broaden strategic contribution",
          evidence: [
            "Recent professional intentions consistently point toward broader scope.",
          ],
          interpretation:
            "The observed direction has shifted toward broader strategic contribution.",
        },
      ],
      stagnation_signals: [
        "One development area is explicitly stalled in the available talent evidence.",
      ],
      career_summary:
        "The career trajectory is progressing toward broader strategic contribution.",
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getCareerTrajectoryIntelligence();

    expect(result.current_direction).toBe("Enterprise Architect");
    expect(result.progression_state).toBe("progressing");
    expect(result.progression_velocity).toBe("steady");
    expect(result.persistent_blockers).toEqual(payload.persistent_blockers);
    expect(result.direction_changes).toEqual(payload.direction_changes);
    expect(result.stagnation_signals).toEqual(payload.stagnation_signals);
    expect(result.career_summary).toBe(payload.career_summary);
  });

  it("accepts insufficient career evidence without inventing movement", async () => {
    const payload = emptyCareerTrajectoryIntelligence();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getCareerTrajectoryIntelligence();

    expect(result.current_direction).toBeNull();
    expect(result.progression_state).toBe("insufficient_evidence");
    expect(result.progression_velocity).toBe("insufficient_evidence");
    expect(result.persistent_blockers).toEqual([]);
    expect(result.direction_changes).toEqual([]);
    expect(result.stagnation_signals).toEqual([]);
    expect(result.career_summary).toBeNull();
  });

  it("does not send write, commerce, score, ranking or recommendation inputs", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(emptyCareerTrajectoryIntelligence()),
    );

    await getCareerTrajectoryIntelligence();

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
      jsonResponse(emptyCareerTrajectoryIntelligence()),
    );

    await getCareerTrajectoryIntelligence();

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