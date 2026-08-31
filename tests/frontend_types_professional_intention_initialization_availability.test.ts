import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("ProfessionalIntentionCompletionWorkspaceResponse type contract", () => {
  it("exposes initialization_available as a required boolean", () => {
    const source = readFileSync(resolve(process.cwd(), "lib/types.ts"), "utf8");

    const match = source.match(
      /export type ProfessionalIntentionCompletionWorkspaceResponse = \{([\s\S]*?)\n\};/,
    );

    expect(match).not.toBeNull();
    expect(match?.[1]).toContain("initialization_available: boolean;");
  });
});
