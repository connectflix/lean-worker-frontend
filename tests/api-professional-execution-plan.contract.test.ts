import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";


const API_PATH = path.resolve(
  process.cwd(),
  "lib/api.ts",
);

const source = fs.readFileSync(API_PATH, "utf8");


function functionBody(functionName: string): string {
  const signature = new RegExp(
    `export\\s+async\\s+function\\s+${functionName}\\s*\\([^)]*\\)\\s*:\\s*Promise<[^>]+>\\s*\\{`,
  );

  const match = signature.exec(source);

  if (!match || match.index == null) {
    throw new Error(
      `Function ${functionName} not found in lib/api.ts`,
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


describe("Admin Professional Execution Plan API contract", () => {
  it("exports the Admin/Organization Professional Execution Plan reader", () => {
    expect(source).toContain(
      "getAdminWorkerProfessionalExecutionPlan",
    );
  });


  it("uses the public ProfessionalExecutionPlanResponse contract", () => {
    expect(source).toContain(
      "ProfessionalExecutionPlanResponse",
    );
  });


  it("reads the Admin worker Professional Execution Plan endpoint", () => {
    const body = functionBody(
      "getAdminWorkerProfessionalExecutionPlan",
    );

    expect(body).toContain(
      "`/admin/workers/${workerId}/professional-execution-plan`",
    );
  });


  it("is a pure GET read with no mutation body", () => {
    const body = functionBody(
      "getAdminWorkerProfessionalExecutionPlan",
    );

    expect(body).not.toContain("method:");
    expect(body).not.toContain("body:");
    expect(body).not.toContain("JSON.stringify");
  });


  it("does not use the forbidden Worker-facing endpoint", () => {
    expect(source).not.toContain(
      "/professional-context/me/execution-plan",
    );
  });
});
