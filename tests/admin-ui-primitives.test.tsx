import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminMetricCard,
  AdminPage,
  AdminPageHeader,
  AdminSection,
  AdminStatusBadge,
} from "@/components/admin-ui";

describe("Admin B2B UI primitives", () => {
  it("renders a structured admin page and section", () => {
    render(
      <AdminPage>
        <AdminSection
          title="Operational overview"
          description="Signals requiring administrator attention."
        >
          <div>Section content</div>
        </AdminSection>
      </AdminPage>,
    );

    expect(screen.getByTestId("admin-page")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Operational overview" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Signals requiring administrator attention."),
    ).toBeInTheDocument();

    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("renders a reusable metric card with its supporting context", () => {
    render(
      <AdminMetricCard
        label="Critical alerts"
        value={3}
        helper="Founder / P1 / failed"
        tone="danger"
      />,
    );

    expect(screen.getByText("Critical alerts")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Founder / P1 / failed")).toBeInTheDocument();

    expect(screen.getByTestId("admin-metric-card")).toHaveAttribute(
      "data-tone",
      "danger",
    );
  });

  it("renders accessible empty and error states", () => {
    render(
      <>
        <AdminEmptyState
          title="No admin data available"
          description="There is no dashboard data to display yet."
        />

        <AdminErrorState
          title="Unable to load dashboard"
          description="The dashboard could not be loaded."
        />
      </>,
    );

    expect(
      screen.getByRole("status", { name: "No admin data available" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("alert", { name: "Unable to load dashboard" }),
    ).toBeInTheDocument();
  });
});

describe("Admin B2B UI primitives — extended states", () => {
  it("renders a professional page header with actions", () => {
    render(
      <AdminPageHeader
        eyebrow="Platform operations"
        title="Admin dashboard"
        description="Monitor platform health and operational priorities."
        actions={<button type="button">Refresh</button>}
      />,
    );

    expect(screen.getByText("Platform operations")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Admin dashboard" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Monitor platform health and operational priorities."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Refresh" }),
    ).toBeInTheDocument();
  });

  it("renders an accessible loading state", () => {
    render(
      <AdminLoadingState
        title="Loading dashboard"
        description="Fetching the latest platform information."
      />,
    );

    expect(
      screen.getByRole("status", { name: "Loading dashboard" }),
    ).toBeInTheDocument();
  });

  it("renders semantic status badges", () => {
    render(
      <>
        <AdminStatusBadge tone="success">Completed</AdminStatusBadge>
        <AdminStatusBadge tone="warning">Partial</AdminStatusBadge>
        <AdminStatusBadge tone="danger">Failed</AdminStatusBadge>
      </>,
    );

    expect(screen.getByText("Completed")).toHaveAttribute(
      "data-tone",
      "success",
    );

    expect(screen.getByText("Partial")).toHaveAttribute(
      "data-tone",
      "warning",
    );

    expect(screen.getByText("Failed")).toHaveAttribute(
      "data-tone",
      "danger",
    );
  });
});
