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

import { initializeAdminWorkerProfessionalIntention } from "@/lib/api";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("Admin Worker Professional Intention initialization API client", () => {
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

  it("initializes Professional Intention with POST semantics and no mutation body", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        initialized: true,
      }),
    );

    const result = await initializeAdminWorkerProfessionalIntention(7);

    expect(result).toEqual({
      initialized: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "http://api.test/admin/workers/7/professional-intention/initialize",
    );
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");
  });

  it("uses the standard authenticated Admin or Organization headers", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        initialized: true,
      }),
    );

    await initializeAdminWorkerProfessionalIntention(7);

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer admin-token");
    expect(headers.get("Accept-Language")).toBe("fr");
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("propagates the backend conflict when the Career Blueprint is not completed", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          detail:
            "Career Blueprint must be completed before Professional Intention initialization",
        },
        409,
      ),
    );

    await expect(
      initializeAdminWorkerProfessionalIntention(7),
    ).rejects.toThrow(
      "Career Blueprint must be completed before Professional Intention initialization",
    );
  });

  it("propagates forbidden access for an Organization that does not own the worker", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          detail: "You do not have access to this worker",
        },
        403,
      ),
    );

    await expect(
      initializeAdminWorkerProfessionalIntention(7),
    ).rejects.toThrow("You do not have access to this worker");
  });
});
