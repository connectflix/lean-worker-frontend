import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

function LanguageConsumer({ name }: { name: string }) {
  const { uiLanguage, setUiLanguage } = useAdminUiLanguage();

  return (
    <div>
      <span data-testid={`${name}-language`}>{uiLanguage}</span>

      <button
        type="button"
        onClick={() => setUiLanguage("fr")}
      >
        {name} French
      </button>

      <button
        type="button"
        onClick={() => setUiLanguage("en")}
      >
        {name} English
      </button>
    </div>
  );
}

describe("useAdminUiLanguage synchronization", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = "";
  });

  it("keeps distinct consumers synchronized in the same browser tab", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "fr");

    render(
      <>
        <LanguageConsumer name="shell" />
        <LanguageConsumer name="page" />
      </>,
    );

    expect(screen.getByTestId("shell-language")).toHaveTextContent("fr");
    expect(screen.getByTestId("page-language")).toHaveTextContent("fr");

    fireEvent.click(
      screen.getByRole("button", { name: "shell English" }),
    );

    expect(screen.getByTestId("shell-language")).toHaveTextContent("en");
    expect(screen.getByTestId("page-language")).toHaveTextContent("en");

    expect(
      window.localStorage.getItem("leanworker.uiLanguage"),
    ).toBe("en");

    expect(document.documentElement.lang).toBe("en");
  });

  it("synchronizes in both directions", () => {
    window.localStorage.setItem("leanworker.uiLanguage", "en");

    render(
      <>
        <LanguageConsumer name="shell" />
        <LanguageConsumer name="page" />
      </>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "page French" }),
    );

    expect(screen.getByTestId("shell-language")).toHaveTextContent("fr");
    expect(screen.getByTestId("page-language")).toHaveTextContent("fr");

    expect(
      window.localStorage.getItem("leanworker.uiLanguage"),
    ).toBe("fr");

    expect(document.documentElement.lang).toBe("fr");
  });
});
