import type { CSSProperties, ReactNode } from "react";

type AdminTone = "default" | "primary" | "success" | "warning" | "danger";

type AdminPageProps = {
  children: ReactNode;
  style?: CSSProperties;
};

type AdminSectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
};

type AdminMetricCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: AdminTone;
};

type AdminStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

const metricToneStyles: Record<AdminTone, CSSProperties> = {
  default: {
    borderColor: "var(--admin-border)",
    background: "var(--admin-surface)",
  },
  primary: {
    borderColor: "rgba(94, 106, 210, 0.22)",
    background: "var(--admin-accent-softer)",
  },
  success: {
    borderColor: "rgba(22, 163, 74, 0.20)",
    background: "rgba(22, 163, 74, 0.05)",
  },
  warning: {
    borderColor: "rgba(217, 119, 6, 0.22)",
    background: "rgba(217, 119, 6, 0.06)",
  },
  danger: {
    borderColor: "rgba(220, 38, 38, 0.20)",
    background: "rgba(220, 38, 38, 0.05)",
  },
};

const stateBaseStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 8,
  padding: 24,
  borderRadius: 18,
  background: "var(--admin-surface)",
  border: "1px solid var(--admin-border)",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
};

export function AdminPage({ children, style }: AdminPageProps) {
  return (
    <div
      data-testid="admin-page"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        width: "100%",
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function AdminSection({
  title,
  description,
  actions,
  children,
  style,
}: AdminSectionProps) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minWidth: 0,
        padding: 20,
        borderRadius: 20,
        background: "var(--admin-surface)",
        border: "1px solid var(--admin-border)",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "var(--admin-ink)",
              fontSize: 16,
              lineHeight: 1.35,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>

          {description ? (
            <p
              style={{
                margin: 0,
                color: "var(--admin-muted)",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {actions}
          </div>
        ) : null}
      </div>

      {children}
    </section>
  );
}

export function AdminMetricCard({
  label,
  value,
  helper,
  tone = "default",
}: AdminMetricCardProps) {
  return (
    <div
      data-testid="admin-metric-card"
      data-tone={tone}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
        minWidth: 0,
        padding: 16,
        borderRadius: 16,
        border: "1px solid var(--admin-border)",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.025)",
        ...metricToneStyles[tone],
      }}
    >
      <div
        style={{
          color: "var(--admin-muted)",
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "var(--admin-ink)",
          fontSize: 28,
          lineHeight: 1.05,
          fontWeight: 850,
          letterSpacing: "-0.045em",
        }}
      >
        {value}
      </div>

      {helper ? (
        <div
          style={{
            color: "var(--admin-muted)",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          {helper}
        </div>
      ) : null}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: AdminStateProps) {
  return (
    <div
      role="status"
      aria-label={title}
      style={stateBaseStyle}
    >
      <div
        style={{
          color: "var(--admin-ink)",
          fontSize: 15,
          fontWeight: 800,
        }}
      >
        {title}
      </div>

      {description ? (
        <div
          style={{
            maxWidth: 620,
            color: "var(--admin-muted)",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {description}
        </div>
      ) : null}

      {action}
    </div>
  );
}

export function AdminErrorState({
  title,
  description,
  action,
}: AdminStateProps) {
  return (
    <div
      role="alert"
      aria-label={title}
      style={{
        ...stateBaseStyle,
        borderColor: "rgba(220, 38, 38, 0.20)",
        background: "rgba(220, 38, 38, 0.04)",
      }}
    >
      <div
        style={{
          color: "#b91c1c",
          fontSize: 15,
          fontWeight: 800,
        }}
      >
        {title}
      </div>

      {description ? (
        <div
          style={{
            maxWidth: 620,
            color: "var(--admin-muted-strong)",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {description}
        </div>
      ) : null}

      {action}
    </div>
  );
}

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

type AdminStatusBadgeProps = {
  children: ReactNode;
  tone?: AdminTone;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        padding: "4px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          minWidth: 0,
          maxWidth: 760,
        }}
      >
        {eyebrow ? (
          <div
            style={{
              color: "var(--admin-accent)",
              fontSize: 12,
              lineHeight: 1.4,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {eyebrow}
          </div>
        ) : null}

        <h1
          style={{
            margin: 0,
            color: "var(--admin-ink)",
            fontSize: 28,
            lineHeight: 1.12,
            fontWeight: 850,
            letterSpacing: "-0.04em",
          }}
        >
          {title}
        </h1>

        {description ? (
          <p
            style={{
              margin: 0,
              color: "var(--admin-muted)",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function AdminLoadingState({
  title,
  description,
  action,
}: AdminStateProps) {
  return (
    <div
      role="status"
      aria-label={title}
      aria-live="polite"
      style={{
        ...stateBaseStyle,
        background: "var(--admin-surface-subtle)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          border: "3px solid var(--admin-border-strong)",
          borderTopColor: "var(--admin-accent)",
        }}
      />

      <div
        style={{
          color: "var(--admin-ink)",
          fontSize: 15,
          fontWeight: 800,
        }}
      >
        {title}
      </div>

      {description ? (
        <div
          style={{
            maxWidth: 620,
            color: "var(--admin-muted)",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {description}
        </div>
      ) : null}

      {action}
    </div>
  );
}

export function AdminStatusBadge({
  children,
  tone = "default",
}: AdminStatusBadgeProps) {
  const toneStyle: Record<AdminTone, CSSProperties> = {
    default: {
      color: "var(--admin-muted-strong)",
      background: "var(--admin-surface-muted)",
      borderColor: "var(--admin-border)",
    },
    primary: {
      color: "var(--admin-accent)",
      background: "var(--admin-accent-soft)",
      borderColor: "rgba(94, 106, 210, 0.18)",
    },
    success: {
      color: "#15803d",
      background: "rgba(22, 163, 74, 0.08)",
      borderColor: "rgba(22, 163, 74, 0.20)",
    },
    warning: {
      color: "#b45309",
      background: "rgba(217, 119, 6, 0.09)",
      borderColor: "rgba(217, 119, 6, 0.22)",
    },
    danger: {
      color: "#b91c1c",
      background: "rgba(220, 38, 38, 0.08)",
      borderColor: "rgba(220, 38, 38, 0.20)",
    },
  };

  return (
    <span
      data-tone={tone}
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
        minHeight: 26,
        padding: "4px 9px",
        borderRadius: 999,
        border: "1px solid var(--admin-border)",
        fontSize: 12,
        lineHeight: 1.3,
        fontWeight: 800,
        whiteSpace: "nowrap",
        ...toneStyle[tone],
      }}
    >
      {children}
    </span>
  );
}

type AdminTabItem = {
  key: string;
  label: string;
  disabled?: boolean;
};

type AdminTabsProps = {
  ariaLabel: string;
  activeTab: string;
  tabs: AdminTabItem[];
  onChange: (tabKey: string) => void;
};

export function AdminTabs({
  ariaLabel,
  activeTab,
  tabs,
  onChange,
}: AdminTabsProps) {
  return (
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
        aria-label={ariaLabel}
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "nowrap",
          minWidth: "max-content",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isDisabled = Boolean(tab.disabled);

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              className={isActive ? "button" : "button ghost"}
              onClick={() => {
                if (!isDisabled) {
                  onChange(tab.key);
                }
              }}
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
                boxShadow: isActive
                  ? "0 8px 18px rgba(94, 106, 210, 0.14)"
                  : "none",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
