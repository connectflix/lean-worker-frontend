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

import {
  finalizeExecutionResult,
  getActionExecutionFollowUp,
  reconcilePendingTrajectory,
  recordActionExecutionResult,
} from "@/lib/api";
import type {
  ExecutionFollowUpResponse,
  ExecutionResultRecord,
  ExecutionResultResponse,
  TrajectoryUpdateResponse,
} from "@/lib/types";

function executionResult(
  overrides: Partial<ExecutionResultResponse> = {},
): ExecutionResultResponse {
  return {
    id: 901,
    worker_id: 7,
    session_id: 77,
    context_snapshot_id: 88,
    decisive_action_id: 501,
    lever_decision_id: 701,
    commercial_offer_resolution_id: null,
    attempt_number: 2,
    execution_status: "in_progress",
    outcome_status: "unknown",
    observed_result: "Premier contact envoyé.",
    worker_reflection: null,
    evidence_json: [],
    blockers_json: [],
    outcome_score: null,
    worker_confidence_after: 0.75,
    lever_used: false,
    lever_helpfulness_score: null,
    lever_usage_evidence_json: [],
    started_at: "2026-08-11T08:00:00Z",
    completed_at: null,
    recorded_at: "2026-08-11T08:05:00Z",
    created_at: "2026-08-11T08:05:00Z",
    updated_at: "2026-08-11T08:05:00Z",
    ...overrides,
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

describe("execution outcome API client", () => {
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

  it("reads the execution follow-up with GET and no mutation body", async () => {
    const payload: ExecutionFollowUpResponse = {
      decisive_action_id: 501,
      execution_results: [executionResult()],
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getActionExecutionFollowUp(501);

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/actions/501/execution-follow-up",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");

    const headers = options?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer worker-token");
    expect(headers.get("Accept-Language")).toBe("fr");
  });

  it("records a new execution attempt with POST and exact lineage query params", async () => {
    const record: ExecutionResultRecord = {
      execution_status: "in_progress",
      outcome_status: "unknown",
      observed_result: "Premier contact envoyé.",
      worker_reflection: null,
      blockers: ["Réponse encore attendue."],
      worker_confidence_after: 0.75,
      lever_used: false,
      started_at: "2026-08-11T08:00:00Z",
      completed_at: null,
    };

    const response = executionResult();

    fetchMock.mockResolvedValueOnce(jsonResponse(response));

    const result = await recordActionExecutionResult(
      501,
      record,
      2,
      701,
    );

    expect(result).toEqual(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/actions/501/execution-results?attempt_number=2&lever_decision_id=701",
    );
    expect(options?.method).toBe("POST");
    expect(options?.body).toBe(JSON.stringify(record));

    const headers = options?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer worker-token");
  });

  it("omits lever and commercial query params when they are absent", async () => {
    const record: ExecutionResultRecord = {
      execution_status: "in_progress",
      outcome_status: "unknown",
    };

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        executionResult({
          lever_decision_id: null,
        }),
      ),
    );

    await recordActionExecutionResult(
      501,
      record,
      3,
      null,
      null,
    );

    const [url] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/actions/501/execution-results?attempt_number=3",
    );
    expect(url).not.toContain("lever_decision_id");
    expect(url).not.toContain("commercial_offer_resolution_id");
  });

  it("includes commercial lineage only when explicitly supplied to the low-level POST helper", async () => {
    const record: ExecutionResultRecord = {
      execution_status: "in_progress",
      outcome_status: "unknown",
    };

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        executionResult({
          commercial_offer_resolution_id: 801,
        }),
      ),
    );

    await recordActionExecutionResult(
      501,
      record,
      4,
      701,
      801,
    );

    const [url] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/actions/501/execution-results?attempt_number=4&lever_decision_id=701&commercial_offer_resolution_id=801",
    );
  });

  it("finalizes an existing execution attempt with PUT and no lineage reconstruction", async () => {
    const record: ExecutionResultRecord = {
      execution_status: "completed",
      outcome_status: "achieved",
      observed_result: "Le contact a abouti.",
      worker_reflection: "Le timing était bon.",
      blockers: [],
      worker_confidence_after: 0.9,
      lever_used: true,
      started_at: "2026-08-11T08:00:00Z",
      completed_at: "2026-08-11T09:00:00Z",
    };

    const response = executionResult({
      execution_status: "completed",
      outcome_status: "achieved",
      observed_result: "Le contact a abouti.",
      completed_at: "2026-08-11T09:00:00Z",
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(response));

    const result = await finalizeExecutionResult(
      901,
      record,
    );

    expect(result).toEqual(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/execution-results/901",
    );
    expect(options?.method).toBe("PUT");
    expect(options?.body).toBe(JSON.stringify(record));

    expect(url).not.toContain("attempt_number");
    expect(url).not.toContain("lever_decision_id");
    expect(url).not.toContain("commercial_offer_resolution_id");
  });

  it("reconciles the latest pending trajectory with POST and no request body", async () => {
    const payload: TrajectoryUpdateResponse = {
      id: 1201,
      worker_id: 7,
      source_session_id: 77,
      context_snapshot_id: 88,
      decisive_action_id: 501,
      execution_result_id: 901,
      trajectory_signal: "positive",
      trajectory_summary: "La tentative confirme une progression.",
      attention_shift_json: {
        from: "clarifier",
        to: "consolider",
      },
      intention_progress_evidence_json: [],
      mandate_preservation_evidence_json: [],
      attention_resolution_score: 0.8,
      intention_progress_score: 0.7,
      mandate_preservation_score: 1,
      learned_constraints_json: [],
      capability_signals_json: [],
      effective_lever_signals_json: [],
      next_attention_candidates_json: [],
      recommended_next_focus: "Consolider le signal obtenu.",
      confidence: 0.82,
      rationale_json: {},
      created_at: "2026-08-11T09:30:00Z",
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await reconcilePendingTrajectory();

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/trajectory/reconcile-pending",
    );
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeUndefined();

    const headers = options?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer worker-token");
    expect(headers.get("Accept-Language")).toBe("fr");
  });

  it("returns null when there is no pending trajectory to reconcile", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null));

    await expect(
      reconcilePendingTrajectory(),
    ).resolves.toBeNull();

    const [, options] = fetchMock.mock.calls[0];

    expect(options?.method).toBe("POST");
    expect(options?.body).toBeUndefined();
  });

  it("propagates reconciliation failures without adding client-side lineage", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          detail: "terminal execution lineage is incomplete",
        },
        409,
      ),
    );

    await expect(
      reconcilePendingTrajectory(),
    ).rejects.toThrow(
      "terminal execution lineage is incomplete",
    );

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).not.toContain("execution_result_id");
    expect(url).not.toContain("commercial_offer_resolution_id");
    expect(url).not.toContain("payment_transaction_id");
    expect(options?.body).toBeUndefined();
  });

  it("propagates backend validation details from execution mutations", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          detail:
            "Completed execution requires a known outcome_status.",
        },
        409,
      ),
    );

    await expect(
      finalizeExecutionResult(901, {
        execution_status: "completed",
        outcome_status: "unknown",
      }),
    ).rejects.toThrow(
      "Completed execution requires a known outcome_status.",
    );
  });
});