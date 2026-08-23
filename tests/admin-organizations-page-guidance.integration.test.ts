import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";


const PAGE_PATH = path.resolve(
  process.cwd(),
  "app/admin/organizations/page.tsx",
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


describe("Admin Organizations page + Organization Guidance", () => {
  it("imports the guidance API and public response type", () => {
    expect(source).toContain("getAdminWorkerOrganizationGuidance");

    expect(source).toMatch(
      /OrganizationWorkerGuidanceResponse/,
    );
  });


  it("owns independent nullable guidance and loading state", () => {
    expect(compact(source)).toContain(
      compact(
        "useState<OrganizationWorkerGuidanceResponse | null>(null)",
      ),
    );

    expect(source).toMatch(
      /organizationGuidanceLoading[\s\S]*useState\(false\)/,
    );
  });


  it("uses one best-effort loader that clears stale guidance before reading", () => {
    const body = functionBody("loadOrganizationGuidance");

    expect(body).toContain("setOrganizationGuidance(null)");
    expect(body).toContain("setOrganizationGuidanceLoading(true)");
    expect(body).toContain("getAdminWorkerOrganizationGuidance(workerId)");
    expect(body).toContain("setOrganizationGuidance(guidance)");
    expect(body).toContain("setOrganizationGuidanceLoading(false)");

    expect(body).toMatch(/catch\s*\{/);

    expect(body).not.toContain("setError(");
    expect(body).not.toContain("throw ");
  });


  it("loads guidance for the initially selected Worker without making it part of summary success", () => {
    const loadEffect = source.slice(
      source.indexOf("useEffect(() => {"),
      source.indexOf("function resetEngagementCanvas"),
    );

    expect(loadEffect).toContain(
      "void loadOrganizationGuidance(firstWorkerId)",
    );

    expect(loadEffect).toContain(
      "getAdminOrganizationWorkerSummary(",
    );
  });


  it("loads or clears guidance when opening an organization", () => {
    const body = functionBody("openOrganization");

    expect(body).toContain("setOrganizationGuidance(null)");

    expect(body).toContain(
      "void loadOrganizationGuidance(firstWorkerId)",
    );

    expect(body).toMatch(
      /if\s*\(firstWorkerId\)[\s\S]*loadOrganizationGuidance\(firstWorkerId\)/,
    );
  });


  it("loads guidance whenever a Worker is opened or assigned", () => {
    const openWorkerBody = functionBody("openWorker");
    const assignBody = functionBody("handleAssignWorker");

    expect(openWorkerBody).toContain(
      "void loadOrganizationGuidance(workerId)",
    );

    expect(assignBody).toContain(
      "void loadOrganizationGuidance(assignedWorkerId)",
    );
  });


  it("refreshes guidance for a fallback Worker and clears it when no fallback remains", () => {
    const body = functionBody("handleUnassignWorker");

    expect(body).toContain(
      "void loadOrganizationGuidance(fallbackWorkerId)",
    );

    expect(body).toMatch(
      /else\s*\{[\s\S]*setOrganizationGuidance\(null\)/,
    );
  });


  it("clears guidance when starting a new organization", () => {
    const body = functionBody("handleNewOrganization");

    expect(body).toContain("setOrganizationGuidance(null)");
    expect(body).toContain("setOrganizationGuidanceLoading(false)");
  });


  it("passes guidance and its independent loading state into OrganizationInsightsTab", () => {
    const insightsIndex = source.lastIndexOf("<OrganizationInsightsTab");
    expect(insightsIndex).toBeGreaterThan(-1);

    const insightsBlock = source.slice(
      insightsIndex,
      source.indexOf("/>", insightsIndex) + 2,
    );

    expect(insightsBlock).toContain(
      "organizationGuidance={organizationGuidance}",
    );

    expect(insightsBlock).toContain(
      "organizationGuidanceLoading={organizationGuidanceLoading}",
    );
  });
});