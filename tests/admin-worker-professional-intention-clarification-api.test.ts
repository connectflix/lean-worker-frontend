import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin-auth", () => ({
  getAdminToken: () => "test-admin-token",
  clearAdminToken: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getToken: () => null,
  clearToken: vi.fn(),
}));

import { recordAdminWorkerProfessionalIntentionClarification } from "@/lib/api";

describe("recordAdminWorkerProfessionalIntentionClarification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts an explicit target horizon clarification for the worker", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            recorded: true,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    const response =
      await recordAdminWorkerProfessionalIntentionClarification(
        7,
        {
          dimension: "target_horizon",
          answer_text:
            "I want to achieve this within the next 12 months.",
          target_horizon_months: 12,
        },
      );

    expect(response).toEqual({
      recorded: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).toContain(
      "/admin/workers/7/professional-intention/clarifications",
    );

    expect(options).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        dimension: "target_horizon",
        answer_text:
          "I want to achieve this within the next 12 months.",
        target_horizon_months: 12,
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});