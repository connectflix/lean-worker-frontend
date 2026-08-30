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

describe("Admin Workers page + Professional Intention Completion Workspace", () => {
  it("imports the completion workspace API and response type", () => {
    expect(source).toContain(
      "getAdminWorkerProfessionalIntentionCompletionWorkspace",
    );

    expect(source).toContain(
      "ProfessionalIntentionCompletionWorkspaceResponse",
    );
  });

  it("owns independent nullable completion workspace and loading state", () => {
    expect(compact(source)).toContain(
      compact(
        "useState<ProfessionalIntentionCompletionWorkspaceResponse | null>(null)",
      ),
    );

    expect(source).toMatch(
      /professionalIntentionCompletionWorkspaceLoading[\s\S]*useState\(false\)/,
    );
  });

  it("uses one best-effort loader that clears stale workspace before reading", () => {
    const body = functionBody(
      "loadProfessionalIntentionCompletionWorkspace",
    );

    expect(body).toContain(
      "setProfessionalIntentionCompletionWorkspace(null)",
    );
    expect(body).toContain(
      "setProfessionalIntentionCompletionWorkspaceLoading(true)",
    );
    expect(body).toContain(
      "getAdminWorkerProfessionalIntentionCompletionWorkspace(workerId)",
    );
    expect(body).toContain(
      "setProfessionalIntentionCompletionWorkspace(workspace)",
    );
    expect(body).toContain(
      "setProfessionalIntentionCompletionWorkspaceLoading(false)",
    );

    expect(body).toMatch(/catch\s*\{/);

    // Supplemental coaching intelligence must never make the whole
    // Admin Workers workspace unusable when this read fails.
    expect(body).not.toContain("setError(");
    expect(body).not.toContain("throw ");
  });

  it("loads the completion workspace whenever a Worker context is opened", () => {
    const body = functionBody("openWorkerContext");

    expect(body).toContain(
      "void loadProfessionalIntentionCompletionWorkspace(worker.id)",
    );
  });

  it("clears the completion workspace when Worker context is cleared", () => {
    const body = functionBody("resetWorkerForm");

    expect(body).toContain(
      "setProfessionalIntentionCompletionWorkspace(null)",
    );
    expect(body).toContain(
      "setProfessionalIntentionCompletionWorkspaceLoading(false)",
    );
  });

  it("renders a dedicated clarification workspace for blocking dimensions", () => {
    expect(source).toContain(
      "Professional Intention Completion Workspace",
    );

    expect(source).toContain(
      "professionalIntentionCompletionWorkspace?.items",
    );

    expect(source).toContain("suggested_question");
    expect(source).toContain("resolution_condition");
    expect(source).toContain("resolution_status");
    expect(source).toContain("current_state");

    expect(source).toContain("evidence");
    expect(source).toContain("source_type");
    expect(source).toContain("source_actor");
    expect(source).toContain("captured_by_actor");
  });

  it("shows completion closure without fabricating a temporal execution plan", () => {
    expect(source).toContain(
      "professionalIntentionCompletionWorkspace?.completion_closed",
    );

    const workspaceStart = source.indexOf(
      "Professional Intention Completion Workspace",
    );

    expect(workspaceStart).toBeGreaterThan(-1);

    const workspaceSection = source.slice(
      workspaceStart,
      Math.min(source.length, workspaceStart + 16000),
    );

    for (const forbidden of [
      "professional_plan",
      "milestones",
      "execution_plan",
      "plan_generation",
      "completeness_score",
      "worker_score",
      "performance_rating",
      "ranking",
    ]) {
      expect(workspaceSection).not.toContain(forbidden);
    }
  });

  it("does not expose internal lineage or transcript identifiers", () => {
    const workspaceStart = source.indexOf(
      "Professional Intention Completion Workspace",
    );

    expect(workspaceStart).toBeGreaterThan(-1);

    const workspaceSection = source.slice(
      workspaceStart,
      Math.min(source.length, workspaceStart + 16000),
    );

    for (const forbidden of [
      "intention_id",
      "intention_version",
      "source_blueprint_id",
      "source_payload",
      "transcript_id",
      "session_id",
    ]) {
      expect(workspaceSection).not.toContain(forbidden);
    }
  });
});