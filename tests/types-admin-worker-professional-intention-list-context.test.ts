import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  `${process.cwd()}/lib/types.ts`,
  "utf8",
);

function typeBody(typeName: string): string {
  const match = source.match(
    new RegExp(
      `export type ${typeName}\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`,
      "m",
    ),
  );

  expect(match, `Missing type ${typeName}`).not.toBeNull();
  return match?.[1] ?? "";
}

describe("AdminWorker Professional Intention list context types", () => {
  it("defines a compact missing-information type", () => {
    const body = typeBody(
      "AdminWorkerProfessionalIntentionMissingInformation",
    );

    expect(body).toContain(
      "dimension: ProfessionalIntentionReadinessDimensionName;",
    );
    expect(body).toContain(
      "state: ProfessionalIntentionReadinessDimensionState;",
    );
    expect(body).toContain("reason: string;");
  });

  it("defines a compact next-guidance type", () => {
    const body = typeBody(
      "AdminWorkerProfessionalIntentionNextGuidance",
    );

    expect(body).toContain(
      "dimension: ProfessionalIntentionReadinessDimensionName;",
    );
    expect(body).toContain(
      "intervention_type: ProfessionalIntentionCompletionGuidanceInterventionType;",
    );
    expect(body).toContain("prompt: string;");
    expect(body).toContain(
      "completion_priority: ProfessionalIntentionCompletionGuidancePriority;",
    );
  });

  it("defines the Professional Intention context carried by an AdminWorker", () => {
    const body = typeBody(
      "AdminWorkerProfessionalIntentionContext",
    );

    expect(body).toContain("exists: boolean;");
    expect(body).toContain(
      "readiness_state: ProfessionalIntentionReadinessState | null;",
    );
    expect(body).toContain(
      "missing_information: AdminWorkerProfessionalIntentionMissingInformation[];",
    );
    expect(body).toContain(
      "next_guidance: AdminWorkerProfessionalIntentionNextGuidance[];",
    );
  });

  it("adds the Professional Intention context to AdminWorker", () => {
    const body = typeBody("AdminWorker");

    expect(body).toContain(
      "professional_intention_context?: AdminWorkerProfessionalIntentionContext | null;",
    );
  });

  it("keeps the Admin list contract free of scores, lineage and plan fields", () => {
    const contract = [
      typeBody("AdminWorkerProfessionalIntentionMissingInformation"),
      typeBody("AdminWorkerProfessionalIntentionNextGuidance"),
      typeBody("AdminWorkerProfessionalIntentionContext"),
    ]
      .join("\n")
      .toLowerCase();

    for (const forbidden of [
      "worker_id",
      "intention_id",
      "intention_version",
      "source_blueprint_id",
      "source_payload",
      "career_blueprint_id",
      "completeness_score",
      "worker_score",
      "performance_rating",
      "ranking",
      "professional_plan",
      "milestones",
      "plan_generation_allowed",
    ]) {
      expect(contract).not.toContain(forbidden);
    }
  });
});
