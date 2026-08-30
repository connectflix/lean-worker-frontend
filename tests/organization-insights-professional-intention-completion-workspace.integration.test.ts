import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const SOURCE_PATH = path.resolve(
  process.cwd(),
  "app/admin/organizations/components/organization-insights-tab.tsx",
);

const source = fs.readFileSync(SOURCE_PATH, "utf8");

function compact(value: string): string {
  return value.replace(/\s+/g, " ");
}

function functionBody(functionName: string): string {
  const signature = new RegExp(
    `(?:async\\s+)?function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{`,
  );

  const match = signature.exec(source);

  if (!match || match.index == null) {
    throw new Error(`Function ${functionName} not found`);
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

describe(
  "Organization Worker Insights + Professional Intention Completion Workspace",
  () => {
    it("imports the shared completion workspace API and response type", () => {
      expect(source).toContain(
        "getAdminWorkerProfessionalIntentionCompletionWorkspace",
      );
      expect(source).toContain(
        "ProfessionalIntentionCompletionWorkspaceResponse",
      );
    });

    it("owns independent nullable workspace and loading state", () => {
      expect(compact(source)).toContain(
        compact(
          "useState<ProfessionalIntentionCompletionWorkspaceResponse | null>(null)",
        ),
      );

      expect(source).toMatch(
        /professionalIntentionCompletionWorkspaceLoading[\s\S]*useState\(false\)/,
      );
    });

    it("loads the workspace through the bounded shared Admin endpoint", () => {
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
      expect(body).not.toContain("throw ");
    });

    it("refreshes completion support when the selected worker changes", () => {
      expect(source).toContain(
        "loadProfessionalIntentionCompletionWorkspace",
      );

      expect(source).toMatch(
        /loadProfessionalIntentionCompletionWorkspace\s*\(\s*selectedWorkerSummary\.worker\.id\s*\)/,
      );
    });

    it("renders the clarification workspace directly in Worker Insights", () => {
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
      expect(source).toContain("requested_source_actor");
    });

    it("renders candidate evidence with explicit provenance", () => {
      expect(source).toContain("evidence");
      expect(source).toContain("source_type");
      expect(source).toContain("source_actor");
      expect(source).toContain("captured_by_actor");
      expect(source).toContain("supports_resolution");
    });

    it("supports the hard-stop completion state", () => {
      expect(source).toContain(
        "professionalIntentionCompletionWorkspace?.completion_closed",
      );
    });

    it("keeps the Worker Insights workspace read-only and bounded", () => {
      const workspaceStart = source.indexOf(
        "Professional Intention Completion Workspace",
      );

      expect(workspaceStart).toBeGreaterThan(-1);

      const workspaceSection = source.slice(
        workspaceStart,
        Math.min(source.length, workspaceStart + 16000),
      );

      for (const forbidden of [
        "record worker answer",
        "save clarification",
        "submit clarification",
        "professional_plan",
        "execution_plan",
        "plan_generation",
        "completeness_score",
        "worker_score",
        "performance_rating",
        "ranking",
      ]) {
        expect(workspaceSection.toLowerCase()).not.toContain(
          forbidden.toLowerCase(),
        );
      }
    });

    it("does not expose internal lineage or transcript identifiers in the workspace", () => {
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
  },
);