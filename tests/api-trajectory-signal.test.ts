import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  clearToken: vi.fn(),
  getToken: vi.fn(),
}));

const adminAuthMocks = vi.hoisted(() => ({
  clearAdminToken: vi.fn(),
  getAdminToken: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
  API_BASE_URL: "https://api.leanworker.test",
}));

vi.mock("@/lib/auth", () => authMocks);

vi.mock("@/lib/admin-auth", () => adminAuthMocks);

vi.mock("@/lib/user-locales", () => ({
  resolveUiLanguage: () => "en",
}));

import { getMyTrajectorySignal } from "@/lib/api";

describe("getMyTrajectorySignal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    authMocks.clearToken.mockReset();
    authMocks.getToken.mockReset();
    adminAuthMocks.clearAdminToken.mockReset();
    adminAuthMocks.getAdminToken.mockReset();

    authMocks.getToken.mockReturnValue("worker-test-token");
  });

  it("performs an authenticated worker GET on the canonical trajectory endpoint", async () => {
    const payload = {
      trajectory_signal: "positive",
      trajectory_summary:
        "Recent execution evidence shows forward movement.",
      recommended_next_focus:
        "Protect the next decisive action.",
      confidence: 0.82,
    };

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );

    await expect(
      getMyTrajectorySignal(),
    ).resolves.toEqual(payload);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe(
      "https://api.leanworker.test/professional-context/me/trajectory-signal",
    );

    expect(options?.method).toBeUndefined();
    expect(options?.body).toBeUndefined();
    expect(options?.cache).toBe("no-store");

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer worker-test-token",
    );
    expect(headers.get("Accept-Language")).toBe("en");
    expect(headers.has("Content-Type")).toBe(false);

    expect(adminAuthMocks.getAdminToken).not.toHaveBeenCalled();
  });

  it("returns the empty-history contract without manufacturing frontend state", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    await expect(
      getMyTrajectorySignal(),
    ).resolves.toEqual({});
  });

  it("propagates a worker API error without retrying or switching to an admin request", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            detail: "Trajectory signal unavailable.",
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    await expect(
      getMyTrajectorySignal(),
    ).rejects.toThrow(
      "Trajectory signal unavailable.",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(adminAuthMocks.getAdminToken).not.toHaveBeenCalled();
  });

  it("uses the standard worker authentication-expiry behavior on 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: "Not authenticated",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await expect(
      getMyTrajectorySignal(),
    ).rejects.toThrow(
      "Authentication expired. Please sign in again.",
    );

    expect(authMocks.clearToken).toHaveBeenCalledTimes(1);
    expect(adminAuthMocks.clearAdminToken).not.toHaveBeenCalled();
  });
});