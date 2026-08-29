import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  `${process.cwd()}/app/admin/workers/page.tsx`,
  "utf8",
);

function workersListBlock(): string {
  const start = source.indexOf("{filteredWorkers.map((worker) => {");
  const end = source.indexOf(
    '<div className="stack" style={{ gap: 16 }}>',
    start,
  );

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

describe("Admin Workers list Professional Intention context", () => {
  it("reads the Professional Intention context already carried by each worker", () => {
    const block = workersListBlock();

    expect(block).toContain("worker.professional_intention_context");
  });

  it("shows whether a Professional Intention exists", () => {
    const block = workersListBlock();

    expect(block).toContain("Professional Intention");
    expect(block).toContain("exists");
    expect(block).toContain("Not available");
  });

  it("shows the readiness state directly in the worker list", () => {
    const block = workersListBlock();

    expect(block).toContain("readiness_state");
    expect(block).toContain("Readiness");
  });

  it("shows missing information with dimension, state and existing readiness reason", () => {
    const block = workersListBlock();

    expect(block).toContain("missing_information");
    expect(block).toContain("Missing information");
    expect(block).toContain(".dimension");
    expect(block).toContain(".state");
    expect(block).toContain(".reason");
  });

  it("shows next completion guidance without fetching worker detail first", () => {
    const block = workersListBlock();

    expect(block).toContain("next_guidance");
    expect(block).toContain("Next guidance");
    expect(block).toContain(".intervention_type");
    expect(block).toContain(".prompt");
    expect(block).toContain(".completion_priority");
  });

  it("does not render plan, milestone, score, ranking or lineage information in this list context", () => {
    const block = workersListBlock();
    const professionalContextStart = block.indexOf("Professional Intention");

    expect(professionalContextStart).toBeGreaterThanOrEqual(0);

    const professionalContextBlock = block
      .slice(professionalContextStart)
      .toLowerCase();

    for (const forbidden of [
      "completeness_score",
      "worker_score",
      "performance_rating",
      "ranking",
      "professional_plan",
      "milestones",
      "plan_generation_allowed",
      "intention_id",
      "intention_version",
      "source_blueprint_id",
      "source_payload",
      "career_blueprint_id",
    ]) {
      expect(professionalContextBlock).not.toContain(forbidden);
    }
  });

  it("does not trigger a per-worker Professional Intention support request from list rendering", () => {
    const block = workersListBlock();

    expect(block).not.toContain(
      "getAdminWorkerProfessionalIntentionSupport(worker.id)",
    );
    expect(block).not.toContain(
      "loadProfessionalIntentionSupport(worker.id)",
    );
  });
});
