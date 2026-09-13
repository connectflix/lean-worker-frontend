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

import { getAdminWorkerProfessionalMandateSupport } from "@/lib/api";
import type { AdminProfessionalMandateSupportResponse } from "@/lib/types";

function supportPayload(): AdminProfessionalMandateSupportResponse {
  return {
    mandate: {
      mandate_summary:
        "Strengthen strategic contribution while preserving sustainable execution.",
      professional_identity: "Senior cross-functional contributor",
      expected_outcomes: [
        "Increase strategic contribution",
      ],
      success_definition: [
        "Contribution is visible in real work",
      ],
      meaning_drivers: [
        "Build durable capability",
      ],
      engagement_drivers: [
        "Complex transformation work",
      ],
      contribution_drivers: [
        "Improve organizational effectiveness",
      ],
      hard_constraints: [],
      soft_constraints: [],
      time_capacity: [
        "Six hours per week",
      ],
      energy_constraints: [
        "Protect recovery time",
      ],
      risks_to_avoid: [],
      non_negotiables: [
        "Strategic decision scope",
      ],
    },
    readiness: {
      readiness_state: "partially_grounded",
      dimensions: [
        {
          dimension: "professional_identity",
          state: "sufficient",
          reason: "Professional identity is explicitly established.",
        },
        {
          dimension: "expected_outcomes",
          state: "unknown",
          reason: "Expected outcomes are not yet sufficiently established.",
        },
      ],
      blocking_dimensions: [
        "expected_outcomes",
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
          prompt:
            "What durable professional outcomes matter most to the worker?",
          purpose:
            "Clarify the durable outcomes that the Professional Mandate must protect or enable.",
          source_scope: [
            "worker",
          ],
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

describe("Admin Worker Professional Mandate Support API client", () => {
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

  it("reads Professional Mandate Support with GET and no mutation body", async () => {
    const payload = supportPayload();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getAdminWorkerProfessionalMandateSupport(7);

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/admin/workers/7/professional-mandate-support",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated Admin headers", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(supportPayload()));

    await getAdminWorkerProfessionalMandateSupport(7);

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer admin-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("preserves nullable mandate readiness and completion guidance", async () => {
    const payload: AdminProfessionalMandateSupportResponse = {
      mandate: null,
      readiness: null,
      completion_guidance: null,
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getAdminWorkerProfessionalMandateSupport(44);

    expect(result).toEqual(payload);
    expect(result.mandate).toBeNull();
    expect(result.readiness).toBeNull();
    expect(result.completion_guidance).toBeNull();
  });

  it("preserves mandate readiness and completion guidance as separate public fields", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(supportPayload()));

    const result = await getAdminWorkerProfessionalMandateSupport(7);

    expect(Object.keys(result).sort()).toEqual(
      ["mandate", "readiness", "completion_guidance"].sort(),
    );

    expect(result.mandate?.mandate_summary).toContain(
      "Strengthen strategic contribution",
    );
    expect(result.readiness?.readiness_state).toBe(
      "partially_grounded",
    );
    expect(result.readiness?.decision_ready).toBe(false);
    expect(result.completion_guidance?.guidance[0]?.dimension).toBe(
      "expected_outcomes",
    );
    expect(
      result.completion_guidance?.guidance[0]?.recommended_actor,
    ).toBe("organization");
  });

  it("does not send lineage scores or execution plan data in the request", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(supportPayload()));

    await getAdminWorkerProfessionalMandateSupport(91);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/admin/workers/91/professional-mandate-support",
    );
    expect(options?.body).toBeUndefined();

    const serializedOptions = JSON.stringify(options ?? {}).toLowerCase();

    for (const token of [
      "worker_id",
      "mandate_id",
      "mandate_version",
      "source_canvas_id",
      "source_payload",
      "completeness_score",
      "readiness_score",
      "worker_score",
      "performance_rating",
      "ranking",
      "professional_plan",
      "execution_plan",
      "milestones",
    ]) {
      expect(serializedOptions).not.toContain(token);
    }
  });
});