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
  completeAdminWorkerOrganizationRecommendation,
} from "@/lib/api";

describe("completeAdminWorkerOrganizationRecommendation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => "fr"),
      },
      configurable: true,
    });
  });

  it("calls the canonical organization support completion endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ completed: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const result = await completeAdminWorkerOrganizationRecommendation(
      7,
      801,
    );

    expect(result).toEqual({ completed: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://localhost:8000/admin/workers/7/organization-recommendations/801/complete",
    );

    expect(options).toEqual(
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
      }),
    );

    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer admin-token");
    expect(headers.get("Accept-Language")).toBe("fr");
  });
});
