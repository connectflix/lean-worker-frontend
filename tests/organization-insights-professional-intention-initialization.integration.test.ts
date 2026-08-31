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
  "Organization Worker Insights Professional Intention initialization action",
  () => {
    it("imports the canonical initialization API", () => {
      expect(source).toContain(
        "initializeAdminWorkerProfessionalIntention",
      );
    });

    it("owns independent initialization loading state", () => {
      expect(compact(source)).toMatch(
        /professionalIntentionInitializationLoading[\s\S]*useState\(false\)/,
      );
    });

    it("owns nullable initialization error state", () => {
      expect(compact(source)).toMatch(
        /professionalIntentionInitializationError[\s\S]*useState<string \| null>\(null\)/,
      );
    });

    it("initializes the selected worker and reloads the completion workspace", () => {
      const body = compact(
        functionBody("handleInitializeProfessionalIntention"),
      );

      expect(body).toContain(
        "setProfessionalIntentionInitializationError(null)",
      );
      expect(body).toContain(
        "setProfessionalIntentionInitializationLoading(true)",
      );
      expect(body).toContain(
        "initializeAdminWorkerProfessionalIntention( selectedWorkerSummary.worker.id )",
      );
      expect(body).toContain(
        "loadProfessionalIntentionCompletionWorkspace( selectedWorkerSummary.worker.id )",
      );
      expect(body).toContain(
        "setProfessionalIntentionInitializationLoading(false)",
      );
    });

    it("captures a visible initialization error when the mutation fails", () => {
      const body = compact(
        functionBody("handleInitializeProfessionalIntention"),
      );

      expect(body).toContain("catch");
      expect(body).toContain(
        'setProfessionalIntentionInitializationError( "Professional Intention initialization failed. Please try again." )',
      );
      expect(source).toContain(
        "{professionalIntentionInitializationError ? (",
      );
      expect(source).toContain(
        "{professionalIntentionInitializationError}",
      );
    });

    it("renders the action only from the explicit backend initialization signal", () => {
      expect(source).toContain(
        "professionalIntentionCompletionWorkspace?.initialization_available",
      );

      const initializationSignalIndex = source.indexOf(
        "professionalIntentionCompletionWorkspace?.initialization_available",
      );
      const buttonIndex = source.indexOf(
        "Initialize Professional Intention",
        initializationSignalIndex,
      );

      expect(initializationSignalIndex).toBeGreaterThan(-1);
      expect(buttonIndex).toBeGreaterThan(initializationSignalIndex);
    });

    it("disables the initialization button while initialization is running", () => {
      const initializationSignalIndex = source.indexOf(
        "professionalIntentionCompletionWorkspace?.initialization_available",
      );

      expect(initializationSignalIndex).toBeGreaterThan(-1);

      const actionSection = source.slice(
        initializationSignalIndex,
        Math.min(source.length, initializationSignalIndex + 5000),
      );

      expect(actionSection).toContain(
        "disabled={professionalIntentionInitializationLoading}",
      );
      expect(actionSection).toContain(
        "onClick={handleInitializeProfessionalIntention}",
      );
    });
  },
);
