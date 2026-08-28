import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  `${process.cwd()}/lib/types.ts`,
  "utf8",
);

describe("Professional Intention Support public TypeScript contract", () => {
  it("declares the bounded Professional Intention readiness vocabulary", () => {
    expect(source).toContain("export type ProfessionalIntentionReadinessDimensionName");
    expect(source).toContain('"movement_definition"');
    expect(source).toContain('"target_state"');
    expect(source).toContain('"desired_outcomes"');
    expect(source).toContain('"progress_markers"');
    expect(source).toContain('"target_horizon"');

    expect(source).toContain("export type ProfessionalIntentionReadinessDimensionState");
    expect(source).toContain('"unknown"');
    expect(source).toContain('"partial"');
    expect(source).toContain('"sufficient"');
    expect(source).toContain('"conflicting"');
    expect(source).toContain('"stale"');

    expect(source).toContain("export type ProfessionalIntentionReadinessState");
    expect(source).toContain('"insufficient"');
    expect(source).toContain('"partially_ready"');
    expect(source).toContain('"progress_evaluable"');
    expect(source).toContain('"plan_ready"');
  });

  it("declares the public Professional Intention projection without internal lineage", () => {
    expect(source).toContain("export type ProfessionalIntentionPublicResponse");
    expect(source).toMatch(
      /export type ProfessionalIntentionPublicResponse\s*=\s*\{[\s\S]*?intention_summary:\s*string;/,
    );
    expect(source).toMatch(
      /export type ProfessionalIntentionPublicResponse\s*=\s*\{[\s\S]*?target_horizon_months:\s*number\s*\|\s*null;/,
    );

    const block = source.match(
      /export type ProfessionalIntentionPublicResponse\s*=\s*\{([\s\S]*?)\n\};/,
    )?.[1] ?? "";

    expect(block).not.toContain("worker_id");
    expect(block).not.toContain("intention_id");
    expect(block).not.toContain("source_blueprint_id");
    expect(block).not.toContain("source_payload");
  });

  it("declares the public readiness projection and qualitative plan gate", () => {
    expect(source).toContain("export type ProfessionalIntentionReadinessDimension");
    expect(source).toContain("export type ProfessionalIntentionReadinessPublicResponse");

    expect(source).toMatch(
      /export type ProfessionalIntentionReadinessPublicResponse\s*=\s*\{[\s\S]*?readiness_state:\s*ProfessionalIntentionReadinessState;/,
    );
    expect(source).toMatch(
      /export type ProfessionalIntentionReadinessPublicResponse\s*=\s*\{[\s\S]*?blocking_dimensions:\s*ProfessionalIntentionReadinessDimensionName\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalIntentionReadinessPublicResponse\s*=\s*\{[\s\S]*?plan_generation_allowed:\s*boolean;/,
    );
  });

  it("declares bounded Completion Guidance items", () => {
    expect(source).toContain("export type ProfessionalIntentionCompletionGuidanceActor");
    expect(source).toContain('"admin"');
    expect(source).toContain('"organization"');

    expect(source).toContain(
      "export type ProfessionalIntentionCompletionGuidanceInterventionType",
    );
    expect(source).toContain('"question"');
    expect(source).toContain('"validation"');
    expect(source).toContain('"action"');

    expect(source).toContain("export type ProfessionalIntentionCompletionGuidanceSource");
    expect(source).toContain('"worker"');

    expect(source).toContain("export type ProfessionalIntentionCompletionGuidancePriority");
    expect(source).toContain('"now"');
    expect(source).toContain('"next"');
    expect(source).toContain('"later"');

    expect(source).toContain("export type ProfessionalIntentionCompletionGuidanceItem");
    expect(source).toMatch(
      /export type ProfessionalIntentionCompletionGuidanceItem\s*=\s*\{[\s\S]*?recommended_actor:\s*ProfessionalIntentionCompletionGuidanceActor;/,
    );
    expect(source).toMatch(
      /export type ProfessionalIntentionCompletionGuidanceItem\s*=\s*\{[\s\S]*?source_scope:\s*ProfessionalIntentionCompletionGuidanceSource\[\];/,
    );
  });

  it("declares the aggregate Admin support response with exactly the three public concerns", () => {
    expect(source).toContain("export type ProfessionalIntentionCompletionGuidanceResponse");
    expect(source).toContain("export type AdminProfessionalIntentionSupportResponse");

    const block = source.match(
      /export type AdminProfessionalIntentionSupportResponse\s*=\s*\{([\s\S]*?)\n\};/,
    )?.[1] ?? "";

    expect(block).toContain(
      "intention: ProfessionalIntentionPublicResponse | null;",
    );
    expect(block).toContain(
      "readiness: ProfessionalIntentionReadinessPublicResponse | null;",
    );
    expect(block).toContain(
      "completion_guidance: ProfessionalIntentionCompletionGuidanceResponse | null;",
    );

    for (const forbidden of [
      "worker_id",
      "intention_id",
      "intention_version",
      "source_blueprint_id",
      "source_payload",
      "completeness_score",
      "worker_score",
      "performance_rating",
      "ranking",
      "professional_plan",
      "milestones",
    ]) {
      expect(block).not.toContain(forbidden);
    }
  });
});