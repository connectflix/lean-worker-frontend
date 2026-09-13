import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin-auth", () => ({
  getAdminToken: () => "test-admin-token",
  clearAdminToken: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getToken: () => null,
  clearToken: vi.fn(),
}));

import { recordAdminWorkerProfessionalMandateClarification } from "@/lib/api";

describe("recordAdminWorkerProfessionalMandateClarification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts an explicit professional identity clarification for the worker", async () => {
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
      await recordAdminWorkerProfessionalMandateClarification(
        7,
        {
          dimension: "professional_identity",
          answer_text:
            "I see myself as an enterprise architect.",
          professional_identity: "Enterprise architect",
        },
      );

    expect(response).toEqual({
      recorded: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).toContain(
      "/admin/workers/7/professional-mandate/clarifications",
    );

    expect(options).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        dimension: "professional_identity",
        answer_text:
          "I see myself as an enterprise architect.",
        professional_identity: "Enterprise architect",
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("posts explicit expected outcomes clarification for the worker", async () => {
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
      await recordAdminWorkerProfessionalMandateClarification(
        7,
        {
          dimension: "expected_outcomes",
          answer_text:
            "I want to lead enterprise transformation and own strategic architecture decisions.",
          expected_outcomes: [
            "Lead enterprise transformation",
            "Own strategic architecture decisions",
          ],
        },
      );

    expect(response).toEqual({
      recorded: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).toContain(
      "/admin/workers/7/professional-mandate/clarifications",
    );

    expect(options).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        dimension: "expected_outcomes",
        answer_text:
          "I want to lead enterprise transformation and own strategic architecture decisions.",
        expected_outcomes: [
          "Lead enterprise transformation",
          "Own strategic architecture decisions",
        ],
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("posts an explicit success definition clarification for the worker", async () => {
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
      await recordAdminWorkerProfessionalMandateClarification(
        7,
        {
          dimension: "success_definition",
          answer_text:
            "Success means owning strategic decisions.",
          success_definition: [
            "Own strategic decisions",
          ],
        },
      );

    expect(response).toEqual({
      recorded: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).toContain(
      "/admin/workers/7/professional-mandate/clarifications",
    );

    expect(options).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        dimension: "success_definition",
        answer_text:
          "Success means owning strategic decisions.",
        success_definition: [
          "Own strategic decisions",
        ],
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("posts a meaning and contribution clarification for the worker", async () => {
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
      await recordAdminWorkerProfessionalMandateClarification(
        7,
        {
          dimension: "meaning_and_contribution",
          answer_text:
            "Meaningful transformation work keeps me engaged and lets me build durable capability.",
          meaning_drivers: [
            "Build durable capability",
          ],
          engagement_drivers: [
            "Complex transformation work",
          ],
          contribution_drivers: [
            "Improve organizational effectiveness",
          ],
        },
      );

    expect(response).toEqual({
      recorded: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).toContain(
      "/admin/workers/7/professional-mandate/clarifications",
    );

    expect(options).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        dimension: "meaning_and_contribution",
        answer_text:
          "Meaningful transformation work keeps me engaged and lets me build durable capability.",
        meaning_drivers: [
          "Build durable capability",
        ],
        engagement_drivers: [
          "Complex transformation work",
        ],
        contribution_drivers: [
          "Improve organizational effectiveness",
        ],
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("posts constraints and non-negotiables clarification for the worker", async () => {
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
      await recordAdminWorkerProfessionalMandateClarification(
        7,
        {
          dimension: "constraints_and_non_negotiables",
          answer_text:
            "Strategic decision scope is non-negotiable and I want to avoid relocation.",
          hard_constraints: [
            "No relocation",
          ],
          non_negotiables: [
            "Strategic decision scope",
          ],
        },
      );

    expect(response).toEqual({
      recorded: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).toContain(
      "/admin/workers/7/professional-mandate/clarifications",
    );

    expect(options).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        dimension: "constraints_and_non_negotiables",
        answer_text:
          "Strategic decision scope is non-negotiable and I want to avoid relocation.",
        hard_constraints: [
          "No relocation",
        ],
        non_negotiables: [
          "Strategic decision scope",
        ],
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("posts capacity and sustainability clarification for the worker", async () => {
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
      await recordAdminWorkerProfessionalMandateClarification(
        7,
        {
          dimension: "capacity_and_sustainability",
          answer_text:
            "I can dedicate six hours per week and need to protect recovery time.",
          time_capacity: [
            "Six hours per week",
          ],
          energy_constraints: [
            "Protect recovery time",
          ],
        },
      );

    expect(response).toEqual({
      recorded: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).toContain(
      "/admin/workers/7/professional-mandate/clarifications",
    );

    expect(options).toMatchObject({
      method: "POST",
      body: JSON.stringify({
        dimension: "capacity_and_sustainability",
        answer_text:
          "I can dedicate six hours per week and need to protect recovery time.",
        time_capacity: [
          "Six hours per week",
        ],
        energy_constraints: [
          "Protect recovery time",
        ],
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});