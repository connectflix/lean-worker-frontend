import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminTabs } from "@/components/admin-ui";

describe("AdminTabs", () => {
  it("renders an accessible B2B tablist and changes the active tab", () => {
    const onChange = vi.fn();

    render(
      <AdminTabs
        ariaLabel="Worker intelligence navigation"
        activeTab="overview"
        onChange={onChange}
        tabs={[
          {
            key: "overview",
            label: "Overview",
          },
          {
            key: "context",
            label: "Context",
          },
          {
            key: "decision",
            label: "Decision",
          },
        ]}
      />,
    );

    const tablist = screen.getByRole("tablist", {
      name: "Worker intelligence navigation",
    });

    expect(tablist).toBeInTheDocument();

    const overview = screen.getByRole("tab", {
      name: "Overview",
    });

    const context = screen.getByRole("tab", {
      name: "Context",
    });

    expect(overview).toHaveAttribute("aria-selected", "true");
    expect(context).toHaveAttribute("aria-selected", "false");

    fireEvent.click(context);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("context");
  });

  it("does not activate a disabled tab", () => {
    const onChange = vi.fn();

    render(
      <AdminTabs
        ariaLabel="Worker intelligence navigation"
        activeTab="overview"
        onChange={onChange}
        tabs={[
          {
            key: "overview",
            label: "Overview",
          },
          {
            key: "history",
            label: "History",
            disabled: true,
          },
        ]}
      />,
    );

    const history = screen.getByRole("tab", {
      name: "History",
    });

    expect(history).toBeDisabled();
    expect(history).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(history);

    expect(onChange).not.toHaveBeenCalled();
  });
});
