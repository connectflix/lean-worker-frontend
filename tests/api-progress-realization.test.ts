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
  createProgressRealization,
  getProgressRealization,
  recordProgressExperience,
} from "@/lib/api";
import type {
  ProgressExperienceRecord,
  ProgressRealizationResponse,
} from "@/lib/types";

function progressRealization(
  overrides: Partial<ProgressRealizationResponse> = {},
): ProgressRealizationResponse {
  return {
    progress_type: "learning_progress",
    progress_confirmed: true,
    change_summary: "Une incertitude a été réduite.",
    why_it_matters_now: "La prochaine décision est mieux informée.",
    intention_connection: "Le signal soutient l'intention.",
    mandate_connection: "Le mandat reste préservé.",
    evidence: [{ text: "signal réel" }],
    learning_value: "Un apprentissage concret a été établi.",
    worker_message: "Tu disposes maintenant d'un signal concret.",
    reflection_prompt: "Qu'est-ce que ce signal change pour toi ?",
    confidence: 0.82,
    experienced_progress: null,
    worker_explanation: null,
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

describe("Progress Realization API client", () => {
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

  it("creates a Progress Realization with POST and no request body", async () => {
    const payload = progressRealization();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await createProgressRealization(51);

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/trajectory/51/progress-realization",
    );
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated worker headers", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(progressRealization()));

    await createProgressRealization(51);

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer worker-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("returns a worker-facing ProgressRealizationResponse without lineage ids", async () => {
    const payload = progressRealization({
      progress_type: "capability_progress",
      worker_message: "Une capacité nouvelle est maintenant observable.",
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await createProgressRealization(99);

    expect(result.progress_type).toBe("capability_progress");
    expect(result.worker_message).toBe(
      "Une capacité nouvelle est maintenant observable.",
    );

    expect("worker_id" in result).toBe(false);
    expect("source_session_id" in result).toBe(false);
    expect("context_snapshot_id" in result).toBe(false);
    expect("decisive_action_id" in result).toBe(false);
    expect("execution_result_id" in result).toBe(false);
    expect("trajectory_update_id" in result).toBe(false);
  });

  it("does not send commerce, payment, execution, or subjective-experience data", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(progressRealization()));

    await createProgressRealization(51);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).not.toContain("payment");
    expect(String(url)).not.toContain("checkout");
    expect(String(url)).not.toContain("commercial");
    expect(String(url)).not.toContain("execution_result_id");
    expect(String(url)).not.toContain("experienced_progress");

    expect(options?.body).toBeUndefined();
  });

  it("preserves a non-confirmed progress response", async () => {
    const payload = progressRealization({
      progress_type: "no_confirmed_progress",
      progress_confirmed: false,
      change_summary: "Aucun progrès professionnel confirmé pour l'instant.",
      learning_value: null,
      experienced_progress: null,
      worker_explanation: null,
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await createProgressRealization(51);

    expect(result.progress_type).toBe("no_confirmed_progress");
    expect(result.progress_confirmed).toBe(false);
    expect(result.experienced_progress).toBeNull();
    expect(result.worker_explanation).toBeNull();
  });

  it("preserves observed progress even when experienced progress is not_really", async () => {
    const payload = progressRealization({
      progress_type: "learning_progress",
      progress_confirmed: true,
      experienced_progress: "not_really",
      worker_explanation: "Je ne le ressens pas encore.",
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await createProgressRealization(51);

    expect(result.progress_confirmed).toBe(true);
    expect(result.experienced_progress).toBe("not_really");
    expect(result.worker_explanation).toBe("Je ne le ressens pas encore.");
  });

  it("propagates backend business errors without inventing a fallback result", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          detail: "TrajectoryUpdate not found for this worker.",
        },
        409,
      ),
    );

    await expect(createProgressRealization(404)).rejects.toThrow(
      "TrajectoryUpdate not found for this worker.",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0];
    expect(options?.body).toBeUndefined();
  });

  it("propagates generic backend failures", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          detail: "Progress Realization failed.",
        },
        500,
      ),
    );

    await expect(createProgressRealization(51)).rejects.toThrow(
      "Progress Realization failed.",
    );
  });

  it("reads an existing Progress Realization with GET and no request body", async () => {
    const payload = progressRealization({
      experienced_progress: "a_little",
      worker_explanation: "Je commence à percevoir le changement.",
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getProgressRealization(51);

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/trajectory/51/progress-realization",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated worker headers for Progress Realization reads", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(progressRealization()));

    await getProgressRealization(51);

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer worker-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("restores persisted experienced progress through the read endpoint", async () => {
    const payload = progressRealization({
      progress_type: "outcome_progress",
      progress_confirmed: true,
      experienced_progress: "not_really",
      worker_explanation:
        "Je comprends le signal, mais je ne ressens pas encore de progression.",
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getProgressRealization(73);

    expect(result.progress_confirmed).toBe(true);
    expect(result.progress_type).toBe("outcome_progress");
    expect(result.experienced_progress).toBe("not_really");
    expect(result.worker_explanation).toBe(
      "Je comprends le signal, mais je ne ressens pas encore de progression.",
    );
  });

  it("propagates a missing persisted Progress Realization as a 404 error", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          detail: "Progress Realization not found for this trajectory.",
        },
        404,
      ),
    );

    await expect(getProgressRealization(404)).rejects.toThrow(
      "Progress Realization not found for this trajectory.",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0];
    expect(options?.body).toBeUndefined();
  });

  it("records experienced progress with PUT and the bounded subjective payload", async () => {
    const payload = progressRealization({
      experienced_progress: "a_little",
      worker_explanation: "Je commence à le ressentir.",
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const record: ProgressExperienceRecord = {
      experienced_progress: "a_little",
      worker_explanation: "Je commence à le ressentir.",
    };

    const result = await recordProgressExperience(51, record);

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-outcome/trajectory/51/progress-realization/experience",
    );
    expect(options?.method).toBe("PUT");
    expect(options?.body).toBe(JSON.stringify(record));
    expect(options?.cache).toBe("no-store");

    const headers = options?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer worker-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it.each([
    ["not_really", null],
    ["a_little", "Un peu, mais pas complètement."],
    ["clearly", "Oui, je vois clairement le changement."],
  ] as const)(
    "supports experienced progress level %s",
    async (experiencedProgress, workerExplanation) => {
      const responsePayload = progressRealization({
        experienced_progress: experiencedProgress,
        worker_explanation: workerExplanation,
      });

      fetchMock.mockResolvedValueOnce(jsonResponse(responsePayload));

      const record: ProgressExperienceRecord = {
        experienced_progress: experiencedProgress,
        worker_explanation: workerExplanation,
      };

      const result = await recordProgressExperience(73, record);

      expect(result.experienced_progress).toBe(experiencedProgress);
      expect(result.worker_explanation).toBe(workerExplanation);

      const [, options] = fetchMock.mock.calls[0];
      expect(JSON.parse(String(options?.body))).toEqual(record);
    },
  );

  it("does not send observed-progress, trajectory, execution, commerce, or payment fields", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        progressRealization({
          experienced_progress: "not_really",
          worker_explanation: "Je ne le ressens pas encore.",
        }),
      ),
    );

    await recordProgressExperience(51, {
      experienced_progress: "not_really",
      worker_explanation: "Je ne le ressens pas encore.",
    });

    const [url, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(options?.body)) as Record<string, unknown>;

    expect(Object.keys(body).sort()).toEqual([
      "experienced_progress",
      "worker_explanation",
    ]);

    for (const forbiddenKey of [
      "progress_type",
      "progress_confirmed",
      "change_summary",
      "confidence",
      "trajectory_update_id",
      "execution_result_id",
      "payment_transaction_id",
      "checkout_session_id",
      "commercial_offer_resolution_id",
    ]) {
      expect(forbiddenKey in body).toBe(false);
      expect(String(url)).not.toContain(forbiddenKey);
    }
  });

  it("preserves disagreement between observed and experienced progress", async () => {
    const payload = progressRealization({
      progress_type: "outcome_progress",
      progress_confirmed: true,
      experienced_progress: "not_really",
      worker_explanation: "Je ne le ressens pas encore.",
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await recordProgressExperience(51, {
      experienced_progress: "not_really",
      worker_explanation: "Je ne le ressens pas encore.",
    });

    expect(result.progress_confirmed).toBe(true);
    expect(result.progress_type).toBe("outcome_progress");
    expect(result.experienced_progress).toBe("not_really");
  });

  it("propagates backend business errors for experienced progress", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          detail:
            "Cannot record experienced progress before an observed Progress Realization exists.",
        },
        409,
      ),
    );

    await expect(
      recordProgressExperience(404, {
        experienced_progress: "clearly",
        worker_explanation: null,
      }),
    ).rejects.toThrow(
      "Cannot record experienced progress before an observed Progress Realization exists.",
    );
  });

});