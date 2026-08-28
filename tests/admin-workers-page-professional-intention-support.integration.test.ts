import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const PAGE_PATH = path.resolve(
  process.cwd(),
  "app/admin/workers/page.tsx",
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

describe("Admin Workers page + Professional Intention Support", () => {
  it("imports the Admin support API and public response type", () => {
    expect(source).toContain(
      "getAdminWorkerProfessionalIntentionSupport",
    );

    expect(source).toMatch(
      /AdminProfessionalIntentionSupportResponse/,
    );
  });

  it("owns independent nullable support and loading state", () => {
    expect(compact(source)).toContain(
      compact(
        "useState<AdminProfessionalIntentionSupportResponse | null>(null)",
      ),
    );

    expect(source).toMatch(
      /professionalIntentionSupportLoading[\s\S]*useState\(false\)/,
    );
  });

  it("uses one best-effort loader that clears stale support before reading", () => {
    const body = functionBody("loadProfessionalIntentionSupport");

    expect(body).toContain("setProfessionalIntentionSupport(null)");
    expect(body).toContain("setProfessionalIntentionSupportLoading(true)");
    expect(body).toContain(
      "getAdminWorkerProfessionalIntentionSupport(workerId)",
    );
    expect(body).toContain(
      "setProfessionalIntentionSupport(support)",
    );
    expect(body).toContain(
      "setProfessionalIntentionSupportLoading(false)",
    );

    expect(body).toMatch(/catch\s*\{/);

    // This read is supplemental Admin intelligence. Failure must not make
    // the entire Workers workspace unusable.
    expect(body).not.toContain("setError(");
    expect(body).not.toContain("throw ");
  });

  it("loads support whenever a Worker context is opened", () => {
    const body = functionBody("openWorkerContext");

    expect(body).toContain(
      "void loadProfessionalIntentionSupport(worker.id)",
    );
  });

  it("clears Professional Intention Support when Worker context is cleared", () => {
    const body = functionBody("resetWorkerForm");

    expect(body).toContain("setProfessionalIntentionSupport(null)");
    expect(body).toContain(
      "setProfessionalIntentionSupportLoading(false)",
    );
  });

  it("renders Intention, Readiness and Completion Guidance without premature plan content", () => {
    expect(source).toContain("Professional Intention");
    expect(source).toContain("Intention Readiness");
    expect(source).toContain("Completion Guidance");

    expect(source).toContain(
      "professionalIntentionSupport?.intention",
    );
    expect(source).toContain(
      "professionalIntentionSupport?.readiness",
    );
    expect(source).toContain(
      "professionalIntentionSupport?.completion_guidance",
    );

    expect(source).toContain("plan_generation_allowed");

    // The current backend contract is readiness + completion support only.
    // The temporal Professional Execution Plan is a later capability and
    // must not be fabricated by this page.
    expect(source).not.toContain(
      "professionalIntentionSupport?.professional_plan",
    );
    expect(source).not.toContain(
      "professionalIntentionSupport?.milestones",
    );
  });

  it("does not expose internal Professional Intention lineage or ranking fields", () => {
    const supportSectionStart = source.indexOf("Professional Intention");

    expect(supportSectionStart).toBeGreaterThan(-1);

    const supportSection = source.slice(
      supportSectionStart,
      Math.min(source.length, supportSectionStart + 12000),
    );

    for (const forbidden of [
      "source_blueprint_id",
      "source_payload",
      "intention_version",
      "completeness_score",
      "worker_score",
      "performance_rating",
      "ranking",
    ]) {
      expect(supportSection).not.toContain(forbidden);
    }
  });
});