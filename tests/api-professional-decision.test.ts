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

import { getSessionProfessionalDecision } from "@/lib/api";
import type { ProfessionalDecisionBundleResponse } from "@/lib/types";

function decisionBundle(
  overrides: Partial<ProfessionalDecisionBundleResponse> = {},
): ProfessionalDecisionBundleResponse {
  return {
    adaptation_explanation: null,
    action_candidates: [],
    decisive_actions: [],
    execution_gaps: [],
    lever_decisions: [],
    lever_candidate_evaluations: [],
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

describe("Professional Decision API client", () => {
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

  it("reads the session decision bundle with GET and no mutation body", async () => {
    const payload = decisionBundle();

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getSessionProfessionalDecision(33);

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/professional-decision/sessions/33",
    );
    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated worker headers", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(decisionBundle()));

    await getSessionProfessionalDecision(33);

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer worker-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("preserves the worker-facing adaptation explanation unchanged", async () => {
    const adaptationExplanation = {
      previous_learning:
        "Le contact ciblé a produit un signal plus utile que les candidatures larges.",
      focus_change:
        "Le focus passe de candidatures générales à une préparation ciblée de l'échange recruteur.",
      why_this_focus_now:
        "Le signal précédent montre que la conversation recruteur est maintenant le prochain point utile à travailler.",
    };

    const payload = decisionBundle({
      adaptation_explanation: adaptationExplanation,
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getSessionProfessionalDecision(33);

    expect(result.adaptation_explanation).toEqual(adaptationExplanation);
    expect(result).toEqual(payload);
  });

  it("preserves a null adaptation explanation for legacy or non-adapted cycles", async () => {
    const payload = decisionBundle({
      adaptation_explanation: null,
    });

    fetchMock.mockResolvedValueOnce(jsonResponse(payload));

    const result = await getSessionProfessionalDecision(33);

    expect(result.adaptation_explanation).toBeNull();
    expect(result).toEqual(payload);
  });
});