import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";


const COMPONENT_PATH = path.resolve(
  process.cwd(),
  "app/admin/organizations/components/organization-insights-tab.tsx",
);

const source = fs.readFileSync(COMPONENT_PATH, "utf8");


function compact(value: string): string {
  return value.replace(/\s+/g, " ");
}


function functionBody(functionName: string): string {
  const signature = new RegExp(
    `(?:async\\s+)?function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{`,
  );

  const match = signature.exec(source);

  if (!match || match.index == null) {
    throw new Error(
      `Function ${functionName} not found in organization-insights-tab.tsx`,
    );
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

  throw new Error(
    `Function ${functionName} body could not be parsed`,
  );
}


describe("Organization Insights Professional Execution Plan integration", () => {
  it("imports only the Admin/Organization execution-plan API client", () => {
    expect(source).toContain(
      "getAdminWorkerProfessionalExecutionPlan",
    );

    expect(source).not.toContain(
      "/professional-context/me/execution-plan",
    );
  });


  it("imports the dedicated Professional Execution Plan card", () => {
    expect(source).toContain(
      "ProfessionalExecutionPlanCard",
    );

    expect(source).toContain(
      "./professional-execution-plan-card",
    );
  });


  it("owns independent nullable plan and loading state", () => {
    expect(compact(source)).toContain(
      compact(
        "useState<ProfessionalExecutionPlanResponse | null>(null)",
      ),
    );

    expect(source).toMatch(
      /professionalExecutionPlanLoading[\s\S]*useState\(false\)/,
    );
  });


  it("uses a best-effort read-only loader that clears stale plan first", () => {
    const body = functionBody(
      "loadProfessionalExecutionPlan",
    );

    expect(body).toContain(
      "setProfessionalExecutionPlan(null)",
    );

    expect(body).toContain(
      "setProfessionalExecutionPlanLoading(true)",
    );

    expect(body).toContain(
      "getAdminWorkerProfessionalExecutionPlan(workerId)",
    );

    expect(body).toContain(
      "setProfessionalExecutionPlan(plan)",
    );

    expect(body).toMatch(/catch\s*\{/);

    expect(body).toContain(
      "setProfessionalExecutionPlan(null)",
    );

    expect(body).toContain(
      "setProfessionalExecutionPlanLoading(false)",
    );

    expect(body).not.toContain("throw ");
  });


  it("loads the plan whenever the selected Worker changes", () => {
    expect(source).toContain(
      "loadProfessionalExecutionPlan(",
    );

    expect(source).toContain(
      "selectedWorkerSummary.worker.id",
    );
  });


  it("clears plan state when no Worker is selected", () => {
    expect(source).toContain(
      "setProfessionalExecutionPlan(null)",
    );

    expect(source).toContain(
      "setProfessionalExecutionPlanLoading(false)",
    );
  });


  it("renders the dedicated card with independent plan state", () => {
    expect(source).toContain(
      "plan={professionalExecutionPlan}",
    );

    expect(source).toContain(
      "loading={professionalExecutionPlanLoading}",
    );
  });
});
