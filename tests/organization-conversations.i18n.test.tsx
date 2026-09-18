import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationConversationsTab } from "@/app/admin/organizations/components/organization-conversations-tab";
import type {
  AdminOrganizationWorkerConversations,
  AdminOrganizationWorkerSummary,
} from "@/lib/types";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

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

function ConversationsHarness() {
  const { uiLanguage, setUiLanguage } = useAdminUiLanguage();

  return (
    <>
      <div data-testid="language">{uiLanguage}</div>

      <button type="button" onClick={() => setUiLanguage("fr")}>
        Switch FR
      </button>

      <button type="button" onClick={() => setUiLanguage("en")}>
        Switch EN
      </button>

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
      />
    </>
  );
}

function NoWorkerHarness() {
  const { uiLanguage } = useAdminUiLanguage();

  return (
    <>
      <div data-testid="language">{uiLanguage}</div>

      <OrganizationConversationsTab
        selectedWorkerId={null}
        selectedWorkerSummary={null}
        conversations={null}
        loading={false}
        saving={false}
        editingExternalConversation={null}
        onLoadConversations={vi.fn()}
        onCreateExternalConversation={vi.fn().mockResolvedValue(undefined)}
        onUpdateExternalConversation={vi.fn().mockResolvedValue(undefined)}
        onDeleteExternalConversation={vi.fn().mockResolvedValue(undefined)}
        onEditExternalConversation={vi.fn()}
        onCancelEditExternalConversation={vi.fn()}
      />
    </>
  );
}

describe("Organization Conversations internationalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "fr");
  });

  it("renders the Conversations workspace in French", () => {
    render(<ConversationsHarness />);

    expect(screen.getByTestId("language")).toHaveTextContent("fr");

    expect(
      screen.getByText("Conversations du collaborateur"),
    ).toBeInTheDocument();

    expect(screen.getByText("Sessions de coaching")).toBeInTheDocument();

    expect(
      screen.getByText("Conversations externes"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ajouter une conversation externe"),
    ).toBeInTheDocument();

    expect(screen.getByText("Titre")).toBeInTheDocument();
    expect(screen.getByText("Type de source")).toBeInTheDocument();
    expect(screen.getByText("Date de la conversation")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Ajouter la conversation" }),
    ).toBeInTheDocument();
  });

  it("switches the Conversations workspace immediately to English", () => {
    render(<ConversationsHarness />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch EN" }),
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");

    expect(screen.getByText("Worker conversations")).toBeInTheDocument();
    expect(screen.getByText("Coach sessions")).toBeInTheDocument();
    expect(screen.getByText("External conversations")).toBeInTheDocument();
    expect(
      screen.getByText("Add external conversation"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Conversations du collaborateur"),
    ).not.toBeInTheDocument();
  });

  it("renders the no-worker state in French", () => {
    render(<NoWorkerHarness />);

    expect(screen.getByTestId("language")).toHaveTextContent("fr");

    expect(
      screen.getByText("Aucun collaborateur sélectionné"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Sélectionnez d’abord un collaborateur pour consulter les sessions de coaching et les conversations externes.",
      ),
    ).toBeInTheDocument();
  });

  it("localizes external-conversation validation errors in French", () => {
    render(<ConversationsHarness />);

    fireEvent.change(
      screen.getByPlaceholderText("Exemple : appel de découverte initial"),
      {
        target: {
          value: "Conversation test",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Ajouter la conversation" }),
    );

    expect(
      screen.getByText(
        "Le chemin du fichier est obligatoire lorsque le type de source est Vidéo. Ajoutez le chemin du fichier vidéo enregistré ou changez le type de source s’il s’agit uniquement d’un lien web.",
      ),
    ).toBeInTheDocument();
  });
});
