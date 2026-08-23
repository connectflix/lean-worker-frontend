import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";


const TYPES_PATH = path.resolve(
  process.cwd(),
  "lib/types.ts",
);

const source = fs.readFileSync(TYPES_PATH, "utf8");


function exportedTypeBody(typeName: string): string {
  const signature = new RegExp(
    `export\\s+type\\s+${typeName}\\s*=\\s*\\{`,
  );

  const match = signature.exec(source);

  if (!match || match.index == null) {
    throw new Error(`Type ${typeName} not found in lib/types.ts`);
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

  throw new Error(`Type ${typeName} body could not be parsed`);
}


describe("Organization Worker Guidance recommendation types", () => {
  it("defines a dedicated qualitative organization support recommendation type", () => {
    const body = exportedTypeBody(
      "OrganizationSupportRecommendation",
    );

    expect(body).toMatch(/\btitle\s*:\s*string\s*;/);
    expect(body).toMatch(/\baction\s*:\s*string\s*;/);
    expect(body).toMatch(/\brationale\s*:\s*string\s*;/);
    expect(body).toMatch(
      /\btiming\s*(?:\?)?\s*:\s*string\s*\|\s*null\s*;/,
    );
  });


  it("adds organization recommendations to the public guidance response", () => {
    const body = exportedTypeBody(
      "OrganizationWorkerGuidanceResponse",
    );

    expect(body).toMatch(
      /\borganization_recommendations\s*:\s*OrganizationSupportRecommendation\[\]\s*;/,
    );
  });


  it("keeps mandate summary and mandate plan in the guidance response", () => {
    const body = exportedTypeBody(
      "OrganizationWorkerGuidanceResponse",
    );

    expect(body).toMatch(
      /\bmandate_summary\s*:\s*OrganizationWorkerMandateSummary\s*\|\s*null\s*;/,
    );
    expect(body).toMatch(
      /\bmandate_plan\s*:\s*OrganizationWorkerMandatePlan\s*\|\s*null\s*;/,
    );
  });


  it("does not put lineage or assessment fields in the support recommendation type", () => {
    const body = exportedTypeBody(
      "OrganizationSupportRecommendation",
    ).toLowerCase();

    for (const forbidden of [
      "worker_id",
      "session_id",
      "decisive_action_id",
      "context_snapshot_id",
      "context_alignment_id",
      "selected_candidate_id",
      "worker_score",
      "performance_score",
      "performance_rating",
      "priority_score",
      "ranking",
      "assessment",
      "judgment",
    ]) {
      expect(body).not.toContain(forbidden);
    }
  });


  it("does not put Lever or commerce fields in the support recommendation type", () => {
    const body = exportedTypeBody(
      "OrganizationSupportRecommendation",
    ).toLowerCase();

    for (const forbidden of [
      "lever_id",
      "selected_lever_id",
      "price",
      "amount",
      "revenue",
      "payment",
      "checkout",
      "purchase",
    ]) {
      expect(body).not.toContain(forbidden);
    }
  });
});