import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationConversationsTab } from "@/app/admin/organizations/components/organization-conversations-tab";
import type {
  AdminOrganizationWorkerConversations,
  AdminOrganizationWorkerSummary,
} from "@/lib/types";

const selectedWorkerSummary = {
  worker: {
    id: 7,
    display_name: "Alex Worker",
  },
} as unknown as AdminOrganizationWorkerSummary;

const conversations = {
  coach_sessions: [],
  external_conversations: [],
} as unknown as AdminOrganizationWorkerConversations;

function renderConversations() {
  return render(
    <OrganizationConversationsTab
      selectedWorkerId={7}
      selectedWorkerSummary={selectedWorkerSummary}
      conversations={conversations}
      loading={false}
      saving={false}
      editingExternalConversation={null}
      onLoadConversations={vi.fn()}
      onCreateExternalConversation={vi.fn().mockResolvedValue(undefined)}
      onUpdateExternalConversation={vi.fn().mockResolvedValue(undefined)}
      onDeleteExternalConversation={vi.fn().mockResolvedValue(undefined)}
      onEditExternalConversation={vi.fn()}
      onCancelEditExternalConversation={vi.fn()}
    />,
  );
}

describe("OrganizationConversationsTab B2B hierarchy", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "en");
  });

  it("exposes distinct worker context, activity, and capture zones", () => {
    renderConversations();

    expect(
      screen.getByTestId("organization-conversations-summary"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-conversations-activity"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("organization-conversations-capture"),
    ).toBeInTheDocument();
  });

  it("keeps worker identity and conversation controls in the executive summary", () => {
    renderConversations();

    const summary = screen.getByTestId(
      "organization-conversations-summary",
    );

    expect(
      within(summary).getByText("Worker conversations"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("#7 — Alex Worker"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByRole("button", {
        name: "Refresh conversations",
      }),
    ).toBeInTheDocument();
  });

  it("separates conversation history from manual capture", () => {
    renderConversations();

    const activity = screen.getByTestId(
      "organization-conversations-activity",
    );

    const capture = screen.getByTestId(
      "organization-conversations-capture",
    );

    expect(
      within(activity).getByText("Coach sessions"),
    ).toBeInTheDocument();

    expect(
      within(activity).getByText("External conversations"),
    ).toBeInTheDocument();

    expect(
      within(capture).getByText("Add external conversation"),
    ).toBeInTheDocument();

    expect(within(capture).getByText("Title")).toBeInTheDocument();

    expect(
      within(activity).queryByText("Add external conversation"),
    ).not.toBeInTheDocument();
  });
});
