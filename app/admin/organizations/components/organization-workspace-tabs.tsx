// app/admin/organizations/components/organization-workspace-tabs.tsx
"use client";

export type OrganizationWorkspaceTab =
  | "overview"
  | "organizations"
  | "workers"
  | "revenue"
  | "canvases"
  | "conversations"
  | "insights"
  | "access";

type OrganizationWorkspaceTabsProps = {
  activeTab: OrganizationWorkspaceTab;
  onChange: (tab: OrganizationWorkspaceTab) => void;
  isPlatformAdmin: boolean;
  selectedWorkerAvailable: boolean;
};

export function OrganizationWorkspaceTabs({
  activeTab,
  onChange,
  isPlatformAdmin,
  selectedWorkerAvailable,
}: OrganizationWorkspaceTabsProps) {
  const tabs: Array<{
    key: OrganizationWorkspaceTab;
    label: string;
    description: string;
    adminOnly?: boolean;
    disabled?: boolean;
  }> = [
    {
      key: "overview",
      label: "Overview",
      description: "Executive summary of the selected organization.",
    },
    {
      key: "organizations",
      label: "Organizations",
      description: "Create, edit, and configure organizations.",
      adminOnly: true,
    },
    {
      key: "workers",
      label: "Workers",
      description: "Manage assigned workers.",
    },
    {
      key: "revenue",
      label: "Revenue",
      description: "Track subscription revenue and organization share.",
    },
    {
      key: "canvases",
      label: "Canvases",
      description: "Work on engagement, purpose, time, and significance canvases.",
      disabled: !selectedWorkerAvailable,
    },
    {
      key: "conversations",
      label: "Conversations",
      description: "Review coach sessions and manage external worker conversations.",
      disabled: !selectedWorkerAvailable,
    },
    {
      key: "insights",
      label: "Worker Insights",
      description: "Review worker profile, sessions, recommendations, artifacts, and levers.",
      disabled: !selectedWorkerAvailable,
    },
    {
      key: "access",
      label: "Access",
      description: "Create or reset organization access account.",
      adminOnly: true,
    },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isPlatformAdmin);

  return (
    <div
      className="card-soft"
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(10px)",
      }}
    >
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            className={isActive ? "button" : "button ghost"}
            onClick={() => {
              if (!tab.disabled) {
                onChange(tab.key);
              }
            }}
            title={tab.description}
            disabled={tab.disabled}
            style={{
              borderRadius: 999,
              whiteSpace: "nowrap",
              opacity: tab.disabled ? 0.5 : 1,
              cursor: tab.disabled ? "not-allowed" : "pointer",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}