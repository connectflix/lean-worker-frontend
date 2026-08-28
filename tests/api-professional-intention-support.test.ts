import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config", () => ({
  API_BASE_URL: "http://api.test",
}));

vi.mock("@/lib/auth", () => ({
  getToken: vi.fn(() => "worker-token"),
  clearToken: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({
  getAdminToken: vi.fn(() => "admin-token"),
  clearAdminToken: vi.fn(),
}));

vi.mock("@/lib/user-locales", () => ({
  resolveUiLanguage: vi.fn(() => "fr"),
}));

import { getAdminWorkerProfessionalIntentionSupport } from "@/lib/api";
import type { AdminProfessionalIntentionSupportResponse } from "@/lib/types";

function supportPayload(): AdminProfessionalIntentionSupportResponse {
  return {
    intention: {
      intention_summary:
        "Change employer and move into a more strategic professional role.",
      target_identity: "Strategic cross-functional leader",
      long_term_vision: null,
      long_term_goals: [],
      medium_term_ambitions: [],
      short_term_missions: [],
      desired_roles: ["Strategic transformation lead"],
      desired_capabilities: [],
      desired_impact: ["Broader strategic contribution"],
      career_direction: ["Move toward strategic leadership"],
      identity_shifts: [],
      target_horizon_months: null,
    },
    readiness: {
      readiness_state: "partially_ready",
      dimensions: [
        {
          dimension: "movement_definition",
          state: "sufficient",
          reason: "The professional movement is explicit.",
        },
        {
          dimension: "target_horizon",
          state: "unknown",
          reason: "No reliable target horizon is currently available.",
        },
      ],
      blocking_dimensions: ["target_horizon"],
      plan_generation_allowed: false,
    },
    completion_guidance: {
      readiness_state: "partially_ready",
      guidance: [
        {
          dimension: "target_horizon",
          state: "unknown",
          recommended_actor: "admin",
          intervention_type: "question",
          prompt:
            "Within what time horizon does the worker want this professional movement to be materially achieved?",
          purpose:
            "Clarify the temporal boundary required before milestone planning.",
          source_scope: ["worker"],
          completion_priority: "now",
        },
      ],
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

describe("Admin Worker Professional Intention Support API client", () => {
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

  it("reads Professional Intention Support with GET and no mutation body", async () => {
    const payload = supportPayload();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getAdminWorkerProfessionalIntentionSupport(7);

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/admin/workers/7/professional-intention-support",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated Admin headers", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(supportPayload()));

    await getAdminWorkerProfessionalIntentionSupport(7);

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer admin-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("preserves nullable intention readiness and completion guidance", async () => {
    const payload: AdminProfessionalIntentionSupportResponse = {
      intention: null,
      readiness: null,
      completion_guidance: null,
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getAdminWorkerProfessionalIntentionSupport(44);

    expect(result).toEqual(payload);
    expect(result.intention).toBeNull();
    expect(result.readiness).toBeNull();
    expect(result.completion_guidance).toBeNull();
  });

  it("preserves intention readiness and completion guidance as separate public fields", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(supportPayload()));

    const result = await getAdminWorkerProfessionalIntentionSupport(7);

    expect(Object.keys(result).sort()).toEqual(
      ["intention", "readiness", "completion_guidance"].sort(),
    );

    expect(result.intention?.intention_summary).toContain(
      "Change employer",
    );
    expect(result.readiness?.readiness_state).toBe("partially_ready");
    expect(result.readiness?.plan_generation_allowed).toBe(false);
    expect(result.completion_guidance?.guidance[0]?.dimension).toBe(
      "target_horizon",
    );
    expect(
      result.completion_guidance?.guidance[0]?.recommended_actor,
    ).toBe("admin");
  });

  it("does not send lineage scores or plan data in the request", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(supportPayload()));

    await getAdminWorkerProfessionalIntentionSupport(91);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/admin/workers/91/professional-intention-support",
    );
    expect(options?.body).toBeUndefined();

    const serializedOptions = JSON.stringify(options ?? {}).toLowerCase();

    for (const token of [
      "worker_id",
      "intention_id",
      "intention_version",
      "source_blueprint_id",
      "source_payload",
      "completeness_score",
      "worker_score",
      "performance_rating",
      "ranking",
      "professional_plan",
      "milestones",
    ]) {
      expect(serializedOptions).not.toContain(token);
    }
  });
});