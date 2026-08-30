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

import { getAdminWorkerProfessionalIntentionCompletionWorkspace } from "@/lib/api";
import type { ProfessionalIntentionCompletionWorkspaceResponse } from "@/lib/types";

function workspacePayload(): ProfessionalIntentionCompletionWorkspaceResponse {
  return {
    readiness_state: "partially_ready",
    completion_closed: false,
    items: [
      {
        dimension: "target_horizon",
        current_state: "unknown",
        reason: "No reliable target horizon is currently available.",
        suggested_question:
          "Within what time horizon does the worker want this professional movement to be materially achieved?",
        requested_source_actor: "worker",
        resolution_status: "open",
        resolution_condition:
          "A valid target horizon greater than zero is established.",
        evidence: [],
      },
      {
        dimension: "desired_outcomes",
        current_state: "partial",
        reason:
          "Some desired outcomes are visible but remain insufficiently explicit.",
        suggested_question:
          "What professional outcome would make this movement meaningfully successful for the worker?",
        requested_source_actor: "worker",
        resolution_status: "open",
        resolution_condition:
          "At least one sufficiently clear desired professional outcome is established.",
        evidence: [
          {
            dimension: "desired_outcomes",
            source_actor: "worker",
            captured_by_actor: "system",
            source_type: "career_blueprint",
            summary:
              "The worker wants broader strategic contribution and cross-functional impact.",
            supports_resolution: false,
          },
          {
            dimension: "desired_outcomes",
            source_actor: "worker",
            captured_by_actor: "system",
            source_type: "conversation_transcript",
            summary:
              "The worker said they want to influence decisions beyond their current operational scope.",
            supports_resolution: false,
          },
        ],
      },
    ],
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

describe("Admin Worker Professional Intention Completion Workspace API client", () => {
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

  it("reads the completion workspace with GET semantics and no mutation body", async () => {
    const payload = workspacePayload();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result =
      await getAdminWorkerProfessionalIntentionCompletionWorkspace(7);

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/admin/workers/7/professional-intention-completion-workspace",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated Admin headers", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(workspacePayload()));

    await getAdminWorkerProfessionalIntentionCompletionWorkspace(7);

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer admin-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("preserves the bounded completion workspace contract", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(workspacePayload()));

    const result =
      await getAdminWorkerProfessionalIntentionCompletionWorkspace(7);

    expect(Object.keys(result).sort()).toEqual(
      ["readiness_state", "completion_closed", "items"].sort(),
    );

    expect(result.readiness_state).toBe("partially_ready");
    expect(result.completion_closed).toBe(false);
    expect(result.items).toHaveLength(2);

    expect(result.items[0]).toEqual({
      dimension: "target_horizon",
      current_state: "unknown",
      reason: "No reliable target horizon is currently available.",
      suggested_question:
        "Within what time horizon does the worker want this professional movement to be materially achieved?",
      requested_source_actor: "worker",
      resolution_status: "open",
      resolution_condition:
        "A valid target horizon greater than zero is established.",
      evidence: [],
    });
  });

  it("preserves evidence provenance without promoting candidate evidence to truth", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(workspacePayload()));

    const result =
      await getAdminWorkerProfessionalIntentionCompletionWorkspace(7);

    const item = result.items.find(
      (candidate) => candidate.dimension === "desired_outcomes",
    );

    expect(item).toBeDefined();
    expect(item?.evidence).toHaveLength(2);

    expect(item?.evidence[0]).toEqual({
      dimension: "desired_outcomes",
      source_actor: "worker",
      captured_by_actor: "system",
      source_type: "career_blueprint",
      summary:
        "The worker wants broader strategic contribution and cross-functional impact.",
      supports_resolution: false,
    });

    expect(item?.evidence[1]?.source_type).toBe(
      "conversation_transcript",
    );
    expect(item?.evidence[1]?.source_actor).toBe("worker");
    expect(item?.evidence[1]?.captured_by_actor).toBe("system");
    expect(item?.evidence[1]?.supports_resolution).toBe(false);
  });

  it("preserves the closed completion state without inventing plan data", async () => {
    const payload: ProfessionalIntentionCompletionWorkspaceResponse = {
      readiness_state: "plan_ready",
      completion_closed: true,
      items: [],
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result =
      await getAdminWorkerProfessionalIntentionCompletionWorkspace(44);

    expect(result).toEqual(payload);
    expect(result.completion_closed).toBe(true);
    expect(result.items).toEqual([]);

    const serializedResult = JSON.stringify(result).toLowerCase();

    for (const token of [
      "professional_plan",
      "milestones",
      "actions",
      "plan_generation",
    ]) {
      expect(serializedResult).not.toContain(token);
    }
  });

  it("does not send or require internal lineage, scores, rankings, or transcript identifiers", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(workspacePayload()));

    await getAdminWorkerProfessionalIntentionCompletionWorkspace(91);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/admin/workers/91/professional-intention-completion-workspace",
    );
    expect(options?.body).toBeUndefined();

    const serializedOptions = JSON.stringify(options ?? {}).toLowerCase();

    for (const token of [
      "worker_id",
      "intention_id",
      "intention_version",
      "source_blueprint_id",
      "source_payload",
      "transcript_id",
      "session_id",
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