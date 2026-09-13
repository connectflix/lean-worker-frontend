import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  `${process.cwd()}/lib/types.ts`,
  "utf8",
);

describe("Professional Mandate Support public TypeScript contract", () => {
  it("declares the bounded Professional Mandate readiness vocabulary", () => {
    expect(source).toContain("export type ProfessionalMandateReadinessDimensionName");
    expect(source).toContain('"professional_identity"');
    expect(source).toContain('"expected_outcomes"');
    expect(source).toContain('"success_definition"');
    expect(source).toContain('"meaning_and_contribution"');
    expect(source).toContain('"constraints_and_non_negotiables"');
    expect(source).toContain('"capacity_and_sustainability"');

    expect(source).toContain("export type ProfessionalMandateReadinessDimensionState");
    expect(source).toContain('"unknown"');
    expect(source).toContain('"partial"');
    expect(source).toContain('"sufficient"');
    expect(source).toContain('"conflicting"');
    expect(source).toContain('"stale"');

    expect(source).toContain("export type ProfessionalMandateReadinessState");
    expect(source).toContain('"insufficient"');
    expect(source).toContain('"partially_grounded"');
    expect(source).toContain('"decision_ready"');
  });

  it("declares the public Professional Mandate projection without internal lineage", () => {
    expect(source).toContain("export type ProfessionalMandatePublicResponse");
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?mandate_summary:\s*string;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?professional_identity:\s*string\s*\|\s*null;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?expected_outcomes:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?success_definition:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?meaning_drivers:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?engagement_drivers:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?contribution_drivers:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?hard_constraints:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?soft_constraints:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?time_capacity:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?energy_constraints:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?risks_to_avoid:\s*unknown\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{[\s\S]*?non_negotiables:\s*unknown\[\];/,
    );

    const block = source.match(
      /export type ProfessionalMandatePublicResponse\s*=\s*\{([\s\S]*?)\n\};/,
    )?.[1] ?? "";

    expect(block).not.toContain("worker_id");
    expect(block).not.toContain("mandate_id");
    expect(block).not.toContain("mandate_version");
    expect(block).not.toContain("source_canvas_id");
    expect(block).not.toContain("source_payload");
  });

  it("declares the public readiness projection and qualitative decision gate", () => {
    expect(source).toContain("export type ProfessionalMandateReadinessDimension");
    expect(source).toContain("export type ProfessionalMandateReadinessPublicResponse");

    expect(source).toMatch(
      /export type ProfessionalMandateReadinessDimension\s*=\s*\{[\s\S]*?dimension:\s*ProfessionalMandateReadinessDimensionName;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateReadinessDimension\s*=\s*\{[\s\S]*?state:\s*ProfessionalMandateReadinessDimensionState;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateReadinessDimension\s*=\s*\{[\s\S]*?reason:\s*string;/,
    );

    expect(source).toMatch(
      /export type ProfessionalMandateReadinessPublicResponse\s*=\s*\{[\s\S]*?readiness_state:\s*ProfessionalMandateReadinessState;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateReadinessPublicResponse\s*=\s*\{[\s\S]*?dimensions:\s*ProfessionalMandateReadinessDimension\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateReadinessPublicResponse\s*=\s*\{[\s\S]*?blocking_dimensions:\s*ProfessionalMandateReadinessDimensionName\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateReadinessPublicResponse\s*=\s*\{[\s\S]*?decision_ready:\s*boolean;/,
    );
  });

  it("declares bounded Completion Guidance items", () => {
    expect(source).toContain("export type ProfessionalMandateCompletionGuidanceActor");
    expect(source).toContain('"admin"');
    expect(source).toContain('"organization"');

    expect(source).toContain(
      "export type ProfessionalMandateCompletionGuidanceInterventionType",
    );
    expect(source).toContain('"question"');
    expect(source).toContain('"validation"');
    expect(source).toContain('"action"');

    expect(source).toContain("export type ProfessionalMandateCompletionGuidanceSource");
    expect(source).toContain('"worker"');

    expect(source).toContain("export type ProfessionalMandateCompletionGuidancePriority");
    expect(source).toContain('"now"');
    expect(source).toContain('"next"');
    expect(source).toContain('"later"');

    expect(source).toContain("export type ProfessionalMandateCompletionGuidanceItem");
    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceItem\s*=\s*\{[\s\S]*?dimension:\s*ProfessionalMandateReadinessDimensionName;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceItem\s*=\s*\{[\s\S]*?state:\s*ProfessionalMandateReadinessDimensionState;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceItem\s*=\s*\{[\s\S]*?recommended_actor:\s*ProfessionalMandateCompletionGuidanceActor;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceItem\s*=\s*\{[\s\S]*?intervention_type:\s*ProfessionalMandateCompletionGuidanceInterventionType;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceItem\s*=\s*\{[\s\S]*?prompt:\s*string;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceItem\s*=\s*\{[\s\S]*?purpose:\s*string;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceItem\s*=\s*\{[\s\S]*?source_scope:\s*ProfessionalMandateCompletionGuidanceSource\[\];/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceItem\s*=\s*\{[\s\S]*?completion_priority:\s*ProfessionalMandateCompletionGuidancePriority;/,
    );
  });

  it("declares the aggregate Admin support response with exactly the three public concerns", () => {
    expect(source).toContain("export type ProfessionalMandateCompletionGuidanceResponse");
    expect(source).toContain("export type AdminProfessionalMandateSupportResponse");

    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceResponse\s*=\s*\{[\s\S]*?readiness_state:\s*ProfessionalMandateReadinessState;/,
    );
    expect(source).toMatch(
      /export type ProfessionalMandateCompletionGuidanceResponse\s*=\s*\{[\s\S]*?guidance:\s*ProfessionalMandateCompletionGuidanceItem\[\];/,
    );

    const block = source.match(
      /export type AdminProfessionalMandateSupportResponse\s*=\s*\{([\s\S]*?)\n\};/,
    )?.[1] ?? "";

    expect(block).toContain(
      "mandate: ProfessionalMandatePublicResponse | null;",
    );
    expect(block).toContain(
      "readiness: ProfessionalMandateReadinessPublicResponse | null;",
    );
    expect(block).toContain(
      "completion_guidance: ProfessionalMandateCompletionGuidanceResponse | null;",
    );

    for (const forbidden of [
      "worker_id",
      "mandate_id",
      "mandate_version",
      "source_canvas_id",
      "source_payload",
      "completeness_score",
      "readiness_score",
      "worker_score",
      "performance_rating",
      "ranking",
      "professional_plan",
      "execution_plan",
      "milestones",
    ]) {
      expect(block).not.toContain(forbidden);
    }
  });
});