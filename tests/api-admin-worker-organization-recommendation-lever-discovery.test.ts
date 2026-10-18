import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config", () => ({
  API_BASE_URL: "http://localhost:8000",
}));

vi.mock("@/lib/auth", () => ({
  clearToken: vi.fn(),
  getToken: vi.fn(() => null),
}));

vi.mock("@/lib/admin-auth", () => ({
  clearAdminToken: vi.fn(),
  getAdminToken: vi.fn(() => "admin-token"),
}));

import {
  discoverAdminWorkerOrganizationRecommendationLevers,
  saveAdminDiscoveredLever,
} from "@/lib/api";

import type {
  ExternalLeverCandidate,
  OrganizationRecommendationLeverDiscoveryRequest,
} from "@/lib/types";


describe("organization recommendation Lever discovery API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => "fr"),
      },
      configurable: true,
    });
  });


  it("discovers external Lever candidates for one persisted organization recommendation", async () => {
    const payload: OrganizationRecommendationLeverDiscoveryRequest = {
      provider_name: "apollo",
      lever_type: "transformation",
      entity_kind: "person",
      category: "mentor",
      limit: 10,
    };

    const candidate: ExternalLeverCandidate = {
      category: "mentor",
      lever_type: "transformation",
      entity_kind: "person",
      name: "Enterprise Architecture Mentor",
      description: "Experienced architecture mentor.",
      url: "https://example.com/profile",
      tags: ["architecture"],
      target_problem: ["decision clarity"],
      source_provider: "apollo",
      source_external_id: "person-123",
      source_url: "https://example.com/profile",
      source_payload_json: {
        provider_rank: 1,
      },
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([candidate]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const result =
      await discoverAdminWorkerOrganizationRecommendationLevers(
        7,
        801,
        payload,
      );

    expect(result).toEqual([candidate]);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://localhost:8000/admin/workers/7/"
      + "organization-recommendations/801/lever-discovery",
    );

    expect(options).toEqual(
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        body: JSON.stringify(payload),
      }),
    );

    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer admin-token");
    expect(headers.get("Accept-Language")).toBe("fr");

    expect(JSON.parse(String(options?.body))).not.toHaveProperty("query");
  });


  it("saves an approved external candidate to the canonical Lever catalog", async () => {
    const candidate: ExternalLeverCandidate = {
      category: "company",
      lever_type: "impact",
      entity_kind: "organization",
      name: "Transformation Partner",
      description: "Organization discovered externally.",
      url: "https://example.com/company",
      tags: ["transformation"],
      target_problem: [],
      source_provider: "apollo",
      source_external_id: "organization-456",
      source_url: "https://example.com/company",
      source_payload_json: {},
    };

    const savedLever = {
      id: 44,
      ...candidate,
      provider_type: "external",
      is_paid: false,
      price_min_eur: null,
      price_max_eur: null,
      currency: "EUR",
      is_default: false,
      priority_score: 0,
      is_active: true,
      created_at: "2026-10-18T12:00:00",
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(savedLever), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const result = await saveAdminDiscoveredLever(candidate);

    expect(result).toEqual(savedLever);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://localhost:8000/admin/levers/discovery/save",
    );

    expect(options).toEqual(
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        body: JSON.stringify(candidate),
      }),
    );

    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer admin-token");
    expect(headers.get("Accept-Language")).toBe("fr");
  });
});
