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

import { getAdminWorkerOrganizationGuidance } from "@/lib/api";
import type { OrganizationWorkerGuidanceResponse } from "@/lib/types";

function guidancePayload(): OrganizationWorkerGuidanceResponse {
  return {
    mandate_summary: {
      mandate_summary:
        "Develop broader strategic contribution while preserving sustainable execution.",
      professional_identity: "Senior cross-functional contributor",
      expected_outcomes: ["Increase strategic contribution"],
      success_definition: ["Contribution is visible in real work"],
      meaning_drivers: ["Useful contribution"],
      engagement_drivers: ["Autonomy"],
      contribution_drivers: ["Improve decision quality"],
      hard_constraints: [],
      soft_constraints: [],
      time_capacity: ["Approximately four focused hours per week"],
      energy_constraints: ["Avoid sustained overload"],
      risks_to_avoid: ["Role expansion without decision authority"],
      non_negotiables: ["Professional sustainability"],
    },
    mandate_plan: {
      plan_summary:
        "Move from clarification to real-work demonstration and consolidation.",
      planning_horizon: "Approximately 4-6 months",
      approach: [
        "Clarify the contribution target",
        "Demonstrate it in real work",
      ],
      milestones: [
        {
          sequence: 1,
          title: "Clarify contribution target",
          objective: "Make the expected contribution explicit.",
          timing: "Weeks 1-2",
          expected_progress: ["The contribution target is explicit"],
          organization_support: ["Clarify decision boundaries"],
          dependencies: [],
        },
      ],
      assumptions: ["Timing should be revisited if the mandate changes."],
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

describe("Admin Worker Organization Guidance API client", () => {
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

  it("reads Organization Guidance with GET and no mutation body", async () => {
    const payload = guidancePayload();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getAdminWorkerOrganizationGuidance(7);

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/admin/workers/7/organization-guidance",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated Admin headers", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(guidancePayload()));

    await getAdminWorkerOrganizationGuidance(7);

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer admin-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("preserves nullable mandate summary and mandate plan", async () => {
    const payload: OrganizationWorkerGuidanceResponse = {
      mandate_summary: null,
      mandate_plan: null,
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getAdminWorkerOrganizationGuidance(44);

    expect(result).toEqual(payload);
    expect(result.mandate_summary).toBeNull();
    expect(result.mandate_plan).toBeNull();
  });

  it("preserves Mandate Summary and Mandate Plan as separate public fields", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(guidancePayload()));

    const result = await getAdminWorkerOrganizationGuidance(7);

    expect(Object.keys(result).sort()).toEqual(
      ["mandate_plan", "mandate_summary"].sort(),
    );

    expect(result.mandate_summary?.mandate_summary).toContain(
      "strategic contribution",
    );
    expect(result.mandate_plan?.milestones[0]?.organization_support).toEqual(
      ["Clarify decision boundaries"],
    );
  });

  it("does not send Worker or organization lineage in the request", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(guidancePayload()));

    await getAdminWorkerOrganizationGuidance(91);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/admin/workers/91/organization-guidance",
    );
    expect(options?.body).toBeUndefined();

    const serializedOptions = JSON.stringify(options ?? {}).toLowerCase();

    expect(serializedOptions).not.toContain("professional_mandate_id");
    expect(serializedOptions).not.toContain("source_canvas_refs");
    expect(serializedOptions).not.toContain("source_payload");
  });
});