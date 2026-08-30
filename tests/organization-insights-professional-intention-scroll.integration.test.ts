import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const sourcePath = resolve(
  process.cwd(),
  "app/admin/organizations/components/organization-insights-tab.tsx",
);

function getWorkspaceSource(): string {
  const source = readFileSync(sourcePath, "utf8");
  const marker = "Professional Intention Completion Workspace";
  const start = source.indexOf(marker);

  expect(start).toBeGreaterThanOrEqual(0);

  return source.slice(start);
}

describe("Organization Worker Insights Professional Intention workspace scroll", () => {
  it("bounds the workspace body in a reusable vertical scroll panel", () => {
    const workspace = getWorkspaceSource();

    expect(workspace).toContain('className="stack scroll-panel"');
    expect(workspace).toContain("maxHeight: 680");
  });

  it("keeps the workspace heading outside the scrollable body", () => {
    const workspace = getWorkspaceSource();

    const headingIndex = workspace.indexOf(
      "Professional Intention Completion Workspace",
    );
    const scrollIndex = workspace.indexOf('className="stack scroll-panel"');

    expect(scrollIndex).toBeGreaterThan(headingIndex);
  });

  it("renders clarification items inside the scrollable body", () => {
    const workspace = getWorkspaceSource();

    const scrollIndex = workspace.indexOf('className="stack scroll-panel"');
    const itemsIndex = workspace.indexOf(
      "professionalIntentionCompletionWorkspace.items.map",
    );

    expect(scrollIndex).toBeGreaterThanOrEqual(0);
    expect(itemsIndex).toBeGreaterThan(scrollIndex);
  });
});
