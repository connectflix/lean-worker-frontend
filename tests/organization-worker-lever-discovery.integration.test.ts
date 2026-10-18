import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const PAGE_PATH = path.resolve(
  process.cwd(),
  "app/admin/organizations/[organizationId]/workers/[workerId]/page.tsx",
);

const source = fs.readFileSync(PAGE_PATH, "utf8");

function compact(value: string): string {
  return value.replace(/\s+/g, " ");
}

function functionBody(functionName: string): string {
  const signature = new RegExp(
    `(?:async\\s+)?function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{`,
  );

  const match = signature.exec(source);

  if (!match || match.index == null) {
    throw new Error(`Function ${functionName} not found in page.tsx`);
  }

  const start = source.indexOf("{", match.index);
  let depth = 0;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (char === "{") depth += 1;

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(match.index, index + 1);
      }
    }
  }

  throw new Error(`Function ${functionName} body could not be parsed`);
}

describe("Organization Worker detail + Lever discovery", () => {
  it("imports the canonical Organization Guidance, Lever discovery, and save boundaries", () => {
    expect(source).toContain("getAdminWorkerOrganizationGuidance");
    expect(source).toContain(
      "discoverAdminWorkerOrganizationRecommendationLevers",
    );
    expect(source).toContain("saveAdminDiscoveredLever");

    expect(source).toContain("OrganizationWorkerGuidanceResponse");
    expect(source).toContain(
      "OrganizationRecommendationLeverDiscoveryRequest",
    );
    expect(source).toContain("ExternalLeverCandidate");

    expect(source).toContain("OrganizationWorkerGuidanceCard");
  });

  it("owns independent Organization Guidance and loading state", () => {
    expect(compact(source)).toContain(
      compact(
        "useState<OrganizationWorkerGuidanceResponse | null>(null)",
      ),
    );

    expect(source).toMatch(
      /organizationGuidanceLoading[\s\S]*useState\(false\)/,
    );
  });

  it("loads Organization Guidance as best-effort supplemental support", () => {
    const body = functionBody("loadOrganizationGuidance");

    expect(body).toContain("setOrganizationGuidance(null)");
    expect(body).toContain("setOrganizationGuidanceLoading(true)");
    expect(body).toContain(
      "getAdminWorkerOrganizationGuidance(workerId)",
    );
    expect(body).toContain("setOrganizationGuidance(guidance)");
    expect(body).toContain("setOrganizationGuidance(null)");
    expect(body).toContain("setOrganizationGuidanceLoading(false)");

    expect(body).toMatch(/catch\s*\{/);

    // Guidance is supplemental Organization support. Failure must not make
    // the entire Worker detail unavailable.
    expect(body).not.toContain("throw ");
    expect(body).not.toContain("setError(");
  });

  it("loads Organization Guidance independently for the current Worker", () => {
    expect(source).toMatch(
      /loadOrganizationGuidance\s*\(\s*workerId\s*\)/,
    );
  });

  it("delegates recommendation-scoped Lever discovery without mutating page projections", () => {
    const body = functionBody(
      "handleDiscoverOrganizationRecommendationLevers",
    );

    expect(body).toMatch(
      /return\s+discoverAdminWorkerOrganizationRecommendationLevers\s*\(\s*workerId\s*,\s*recommendationId\s*,\s*payload\s*,?\s*\)/,
    );

    expect(body).not.toContain("setSummary");
    expect(body).not.toContain("setOrganizationGuidance");
    expect(body).not.toContain("loadOrganizationGuidance");
    expect(body).not.toContain(
      "getAdminWorkerOrganizationGuidance",
    );
  });

  it("saves an approved discovered Lever without triggering Worker recommendation or unrelated refreshes", () => {
    const body = functionBody("handleSaveDiscoveredLever");

    expect(body).toMatch(
      /return\s+saveAdminDiscoveredLever\s*\(\s*candidate\s*\)/,
    );

    expect(body).not.toContain("fetchWorkerSummary");
    expect(body).not.toContain("getAdminOrganizationWorkerSummary");
    expect(body).not.toContain("loadOrganizationGuidance");
    expect(body).not.toContain(
      "completeAdminWorkerOrganizationRecommendation",
    );
    expect(body).not.toContain("setSummary");
  });

  it("renders the canonical OrganizationWorkerGuidanceCard with discovery and save callbacks", () => {
    const cardIndex = source.indexOf("<OrganizationWorkerGuidanceCard");

    expect(cardIndex).toBeGreaterThan(-1);

    const cardBlock = source.slice(
      cardIndex,
      source.indexOf("/>", cardIndex) + 2,
    );

    expect(cardBlock).toMatch(
      /guidance\s*=\s*\{\s*organizationGuidance\s*\}/,
    );

    expect(cardBlock).toMatch(
      /loading\s*=\s*\{\s*organizationGuidanceLoading\s*\}/,
    );

    expect(cardBlock).toMatch(
      /onOrganizationRecommendationLeverDiscovery\s*=\s*\{\s*handleDiscoverOrganizationRecommendationLevers\s*\}/,
    );

    expect(cardBlock).toMatch(
      /onOrganizationRecommendationLeverSave\s*=\s*\{\s*handleSaveDiscoveredLever\s*\}/,
    );
  });
});
