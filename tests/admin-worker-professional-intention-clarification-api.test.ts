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

  it("posts an explicit movement definition clarification for the worker", async () => {
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
          dimension: "movement_definition",
          answer_text:
            "Je veux passer d'un rôle principalement opérationnel à un rôle de Business Architect.",
          movement_summary:
            "Passer d'un rôle principalement opérationnel à un rôle de Business Architect.",
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
        dimension: "movement_definition",
        answer_text:
          "Je veux passer d'un rôle principalement opérationnel à un rôle de Business Architect.",
        movement_summary:
          "Passer d'un rôle principalement opérationnel à un rôle de Business Architect.",
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("posts an explicit target state clarification for the worker", async () => {
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
          dimension: "target_state",
          answer_text:
            "Je veux devenir Business Architect avec un rôle plus stratégique et transverse.",
          target_identity:
            "Business Architect avec un rôle stratégique et transverse.",
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
        dimension: "target_state",
        answer_text:
          "Je veux devenir Business Architect avec un rôle plus stratégique et transverse.",
        target_identity:
          "Business Architect avec un rôle stratégique et transverse.",
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("posts an explicit desired outcomes clarification for the worker", async () => {
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
          dimension: "desired_outcomes",
          answer_text:
            "Je veux avoir davantage d'impact sur les décisions stratégiques et sur la transformation de l'organisation.",
          desired_impact: [
            "Influencer les décisions stratégiques et contribuer directement à la transformation de l'organisation.",
          ],
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
        dimension: "desired_outcomes",
        answer_text:
          "Je veux avoir davantage d'impact sur les décisions stratégiques et sur la transformation de l'organisation.",
        desired_impact: [
          "Influencer les décisions stratégiques et contribuer directement à la transformation de l'organisation.",
        ],
      }),
    });

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-admin-token",
    );
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("posts an explicit progress markers clarification for the worker", async () => {
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
          dimension: "progress_markers",
          answer_text:
            "Je saurai que j'avance si j'obtiens des échanges qualifiés pour des rôles de Business Architect.",
          short_term_missions: [
            "Obtenir des échanges qualifiés pour des rôles de Business Architect.",
          ],
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
        dimension: "progress_markers",
        answer_text:
          "Je saurai que j'avance si j'obtiens des échanges qualifiés pour des rôles de Business Architect.",
        short_term_missions: [
          "Obtenir des échanges qualifiés pour des rôles de Business Architect.",
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
