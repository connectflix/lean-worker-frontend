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

type OrganizationWorkspaceTabItem = {
  key: OrganizationWorkspaceTab;
  label: string;
  shortLabel: string;
  description: string;
  adminOnly?: boolean;
  requiresWorker?: boolean;
};

const TABS: OrganizationWorkspaceTabItem[] = [
  {
    key: "overview",
    label: "Overview",
    shortLabel: "Overview",
    description: "Executive summary of the selected organization.",
  },
  {
    key: "organizations",
    label: "Organizations",
    shortLabel: "Orgs",
    description: "Create, edit, and configure organizations.",
    adminOnly: true,
  },
  {
    key: "workers",
    label: "Workers",
    shortLabel: "Workers",
    description: "Manage assigned workers.",
  },
  {
    key: "revenue",
    label: "Revenue",
    shortLabel: "Revenue",
    description: "Track subscription revenue and organization share.",
  },
  {
    key: "canvases",
    label: "Canvases",
    shortLabel: "Canvases",
    description: "Work on engagement, purpose, time, and significance canvases.",
    requiresWorker: true,
  },
  {
    key: "conversations",
    label: "Conversations",
    shortLabel: "Convos",
    description: "Review coach sessions and manage external worker conversations.",
    requiresWorker: true,
  },
  {
    key: "insights",
    label: "Worker Insights",
    shortLabel: "Insights",
    description: "Review worker profile, sessions, recommendations, artifacts, and levers.",
    requiresWorker: true,
  },
  {
    key: "access",
    label: "Access",
    shortLabel: "Access",
    description: "Create or reset organization access account.",
    adminOnly: true,
  },
];

export function OrganizationWorkspaceTabs({
  activeTab,
  onChange,
  isPlatformAdmin,
  selectedWorkerAvailable,
}: OrganizationWorkspaceTabsProps) {
  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || isPlatformAdmin).map((tab) => ({
    ...tab,
    disabled: Boolean(tab.requiresWorker && !selectedWorkerAvailable),
  }));

  const activeTabDescription =
    visibleTabs.find((tab) => tab.key === activeTab)?.description ??
    "Organization workspace navigation.";

  const lockedWorkerTabsCount = visibleTabs.filter(
    (tab) => tab.requiresWorker && !selectedWorkerAvailable,
  ).length;

  return (
    <div
      className="organization-workspace-tabs"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 0,
        padding: 10,
        borderRadius: 18,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "saturate(180%) blur(16px)",
      }}
    >
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 2,
        }}
      >
        <div
          role="tablist"
          aria-label="Organization workspace tabs"
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexWrap: "nowrap",
            minWidth: "max-content",
          }}
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const isDisabled = Boolean(tab.disabled);

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-disabled={isDisabled}
                className={isActive ? "button" : "button ghost"}
                onClick={() => {
                  if (!isDisabled) {
                    onChange(tab.key);
                  }
                }}
                title={
                  isDisabled
                    ? `${tab.description} Select a worker first.`
                    : tab.description
                }
                disabled={isDisabled}
                style={{
                  minHeight: 36,
                  borderRadius: 999,
                  padding: "8px 13px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: "-0.01em",
                  opacity: isDisabled ? 0.44 : 1,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  boxShadow: isActive ? "0 8px 18px rgba(37,99,235,0.14)" : "none",
                }}
              >
                <span className="organization-tab-label-full">{tab.label}</span>
                <span className="organization-tab-label-short">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          padding: "0 4px 2px",
        }}
      >
        <div
          className="muted"
          style={{
            fontSize: 12,
            lineHeight: 1.45,
            minWidth: 0,
            flex: "1 1 320px",
          }}
        >
          {activeTabDescription}
        </div>

        {lockedWorkerTabsCount > 0 ? (
          <span
            className="badge"
            style={{
              fontSize: 12,
              background: "rgba(15,23,42,0.04)",
              color: "var(--foreground-soft)",
              borderColor: "var(--border)",
            }}
          >
            Select a worker to unlock {lockedWorkerTabsCount} workspace tabs
          </span>
        ) : (
          <span
            className="badge"
            style={{
              fontSize: 12,
              background: "var(--primary-soft)",
              color: "var(--primary-hover)",
              borderColor: "rgba(37,99,235,0.14)",
            }}
          >
            Worker context active
          </span>
        )}
      </div>

      <style jsx>{`
        .organization-workspace-tabs :global(button) {
          transition:
            background 0.16s ease,
            border-color 0.16s ease,
            transform 0.12s ease,
            box-shadow 0.16s ease,
            opacity 0.16s ease;
        }

        .organization-workspace-tabs :global(button:not(:disabled):active) {
          transform: scale(0.97);
        }

        .organization-tab-label-short {
          display: none;
        }

        @media (max-width: 720px) {
          .organization-tab-label-full {
            display: none;
          }

          .organization-tab-label-short {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}