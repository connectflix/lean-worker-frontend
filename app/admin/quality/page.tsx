"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminMe, getAdminQualitySummary } from "@/lib/api";
import type { AdminLeverQualitySummary, AdminMe } from "@/lib/types";

export default function AdminQualityPage() {
  return (
    <AdminGuard>
      <AdminQualityContent />
    </AdminGuard>
  );
}

function normalizeLabel(value?: string | null): string {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(isActive: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontWeight: 800,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: isActive ? "var(--success)" : "var(--muted)",
    background: isActive ? "rgba(21,128,61,0.08)" : "rgba(100,116,139,0.10)",
    border: isActive
      ? "1px solid rgba(21,128,61,0.20)"
      : "1px solid rgba(100,116,139,0.18)",
  };
}

function qualityTone(label?: string | null, score?: number | null): CSSProperties {
  const normalized = (label || "").toLowerCase();
  const safeScore = Number(score ?? 0);

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontWeight: 800,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  if (normalized.includes("high") || normalized.includes("excellent") || safeScore >= 75) {
    return {
      ...base,
      color: "var(--success)",
      background: "rgba(21,128,61,0.08)",
      border: "1px solid rgba(21,128,61,0.20)",
    };
  }

  if (normalized.includes("low") || normalized.includes("poor") || safeScore < 40) {
    return {
      ...base,
      color: "var(--danger)",
      background: "rgba(220,38,38,0.08)",
      border: "1px solid rgba(220,38,38,0.20)",
    };
  }

  return {
    ...base,
    color: "var(--warning, #b45309)",
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.20)",
  };
}

function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
}) {
  const toneStyle =
    tone === "primary"
      ? {
          color: "var(--primary-hover)",
          background: "var(--primary-soft)",
          border: "1px solid rgba(37,99,235,0.16)",
        }
      : tone === "success"
        ? {
            color: "var(--success)",
            background: "rgba(21,128,61,0.07)",
            border: "1px solid rgba(21,128,61,0.18)",
          }
        : tone === "warning"
          ? {
              color: "var(--warning, #b45309)",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.20)",
            }
          : tone === "danger"
            ? {
                color: "var(--danger)",
                background: "rgba(220,38,38,0.07)",
                border: "1px solid rgba(220,38,38,0.18)",
              }
            : {
                color: "var(--foreground)",
                background: "rgba(15,23,42,0.03)",
                border: "1px solid var(--border)",
              };

  return (
    <div className="card-soft stack" style={{ gap: 6, ...toneStyle }}>
      <div className="muted">{label}</div>
      <div className="admin-metric-value" style={{ fontSize: 28, color: toneStyle.color }}>
        {value}
      </div>
      {hint ? (
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-soft">
      <div className="muted">{children}</div>
    </div>
  );
}

function QualityLeverCard({
  item,
  variant,
}: {
  item: AdminLeverQualitySummary["top_quality_levers"][number];
  variant: "top" | "low";
}) {
  return (
    <div
      className="card-soft stack"
      style={{
        gap: 10,
        border:
          variant === "top"
            ? "1px solid rgba(21,128,61,0.16)"
            : "1px solid rgba(245,158,11,0.20)",
        background:
          variant === "top"
            ? "linear-gradient(180deg, rgba(240,253,244,0.72), rgba(255,255,255,0.96))"
            : "linear-gradient(180deg, rgba(255,251,235,0.74), rgba(255,255,255,0.96))",
      }}
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span className="badge">#{item.lever_id}</span>
        <span className="badge">{normalizeLabel(item.category)}</span>
        <span style={qualityTone(item.quality_label, item.quality_score)}>
          {normalizeLabel(item.quality_label)}
        </span>
        <span style={statusTone(item.is_active)}>{item.is_active ? "Active" : "Inactive"}</span>
      </div>

      <div className="section-title" style={{ fontSize: 17 }}>
        {item.name}
      </div>

      <div className="grid grid-3">
        <div className="card-soft stack" style={{ gap: 4, boxShadow: "none" }}>
          <div className="muted">Quality score</div>
          <strong>{item.quality_score}</strong>
        </div>

        <div className="card-soft stack" style={{ gap: 4, boxShadow: "none" }}>
          <div className="muted">Usage</div>
          <strong>{item.usage_count}x</strong>
        </div>

        <div className="card-soft stack" style={{ gap: 4, boxShadow: "none" }}>
          <div className="muted">Readiness</div>
          <strong>
            {item.target_problem_count} problems · {item.tag_count} tags
          </strong>
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span className="badge">problems: {item.target_problem_count}</span>
        <span className="badge">tags: {item.tag_count}</span>
        <span className="badge">used {item.usage_count}x</span>
      </div>

      {item.reasons.length > 0 ? (
        <div
          className="card-soft stack"
          style={{
            gap: 6,
            background: "rgba(15,23,42,0.035)",
            boxShadow: "none",
          }}
        >
          <div className="muted">Quality rationale</div>

          <div className="stack" style={{ gap: 6 }}>
            {item.reasons.map((reason, index) => (
              <div
                key={`${item.lever_id}-${reason}-${index}`}
                className="muted"
                style={{ lineHeight: 1.5 }}
              >
                • {reason}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {variant === "low" ? (
        <div
          className="card-soft"
          style={{
            color: "var(--warning, #b45309)",
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.20)",
            boxShadow: "none",
          }}
        >
          Review targeting, tags, description, problem mapping, activation status and matching
          priority before relying on this lever in recommendations.
        </div>
      ) : null}
    </div>
  );
}

function AdminQualityContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminLeverQualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadQuality() {
    setLoading(true);
    setError(null);

    try {
      const [me, quality] = await Promise.all([getAdminMe(), getAdminQualitySummary()]);
      setAdmin(me);
      setSummary(quality);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin quality.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuality();
  }, []);

  const averageTopScore = useMemo(() => {
    if (!summary || summary.top_quality_levers.length === 0) return 0;

    const total = summary.top_quality_levers.reduce(
      (acc, item) => acc + Number(item.quality_score ?? 0),
      0,
    );

    return total / summary.top_quality_levers.length;
  }, [summary]);

  const averageLowestScore = useMemo(() => {
    if (!summary || summary.lowest_quality_levers.length === 0) return 0;

    const total = summary.lowest_quality_levers.reduce(
      (acc, item) => acc + Number(item.quality_score ?? 0),
      0,
    );

    return total / summary.lowest_quality_levers.length;
  }, [summary]);

  const inactiveLowQualityCount = useMemo(() => {
    return summary?.lowest_quality_levers.filter((item) => !item.is_active).length ?? 0;
  }, [summary]);

  const activeLowQualityCount = useMemo(() => {
    return summary?.lowest_quality_levers.filter((item) => item.is_active).length ?? 0;
  }, [summary]);

  const qualityHealthLabel = useMemo(() => {
    if (!summary) return "Unknown";
    if (summary.total_levers === 0) return "No levers yet";
    if (activeLowQualityCount > 0) return "Needs review";
    if (averageTopScore >= 75) return "Healthy";
    return "Moderate";
  }, [summary, activeLowQualityCount, averageTopScore]);

  return (
    <AdminShell
      activeHref="/admin/quality"
      title="Admin Lever Quality"
      subtitle="Rank levers by usefulness, usage, targeting richness, and readiness for recommendation matching."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      <div className="stack" style={{ gap: 18 }}>
        <div
          className="card stack"
          style={{
            gap: 16,
            border: "1px solid rgba(20,184,166,0.18)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,253,250,0.94))",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -120,
              top: -150,
              width: 350,
              height: 350,
              borderRadius: 999,
              background: "rgba(20,184,166,0.08)",
            }}
          />

          <div
            className="row space-between"
            style={{
              gap: 14,
              flexWrap: "wrap",
              alignItems: "flex-start",
              position: "relative",
            }}
          >
            <div className="stack" style={{ gap: 10, maxWidth: 940 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">Lever readiness</span>
                <span className="badge">Recommendation quality</span>
                <span className="badge">Catalog governance</span>
              </div>

              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1.08,
                  fontWeight: 950,
                  letterSpacing: "-0.05em",
                }}
              >
                Improve matching quality before recommendations reach workers.
              </div>

              <div className="muted" style={{ maxWidth: 980, lineHeight: 1.7 }}>
                This view highlights which levers are ready for reliable recommendation matching
                and which ones need richer targeting, stronger tagging, better problem mapping or
                operational cleanup.
              </div>
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 4,
                minWidth: 210,
                background: "rgba(255,255,255,0.78)",
                position: "relative",
              }}
            >
              <div className="muted">Quality health</div>
              <div className="section-title" style={{ fontSize: 22 }}>
                {qualityHealthLabel}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Based on active low-quality levers and average top score.
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card-soft">Loading quality analysis...</div>
        ) : error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : !summary ? (
          <div className="card-soft">No quality data available.</div>
        ) : (
          <>
            <div className="grid grid-4">
              <MetricCard
                label="Total levers evaluated"
                value={summary.total_levers}
                tone="primary"
                hint="Number of catalog entries included in the quality analysis."
              />

              <MetricCard
                label="Top avg score"
                value={averageTopScore.toFixed(1)}
                tone="success"
                hint="Average score of the strongest lever candidates."
              />

              <MetricCard
                label="Lowest avg score"
                value={averageLowestScore.toFixed(1)}
                tone={averageLowestScore < 40 ? "danger" : "warning"}
                hint="Average score of the weakest lever candidates."
              />

              <MetricCard
                label="Active low-quality"
                value={activeLowQualityCount}
                tone={activeLowQualityCount > 0 ? "warning" : "success"}
                hint="Active levers that may weaken recommendation quality."
              />
            </div>

            <div className="card stack" style={{ gap: 14 }}>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Quality signal overview</div>
                  <div className="muted">
                    Use this summary to identify where the catalog is strong, where matching is
                    fragile, and which levers should be improved first.
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <a className="button ghost" href="/admin/levers">
                    Manage levers
                  </a>

                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => void loadQuality()}
                    disabled={loading}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-4">
                <MetricCard
                  label="Top candidates"
                  value={summary.top_quality_levers.length}
                  tone="success"
                />
                <MetricCard
                  label="Weak candidates"
                  value={summary.lowest_quality_levers.length}
                  tone={summary.lowest_quality_levers.length > 0 ? "warning" : "success"}
                />
                <MetricCard
                  label="Inactive weak"
                  value={inactiveLowQualityCount}
                  tone="default"
                />
                <MetricCard
                  label="Active weak"
                  value={activeLowQualityCount}
                  tone={activeLowQualityCount > 0 ? "warning" : "success"}
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card stack" style={{ gap: 14 }}>
                <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="section-title">Top quality levers</div>
                    <div className="muted">
                      Stronger candidates for recommendation matching and catalog promotion.
                    </div>
                  </div>
                </div>

                {summary.top_quality_levers.length === 0 ? (
                  <EmptyState>No levers available.</EmptyState>
                ) : (
                  <div
                    className="stack"
                    style={{
                      gap: 12,
                      maxHeight: "62vh",
                      overflowY: "auto",
                      paddingRight: 6,
                    }}
                  >
                    {summary.top_quality_levers.map((item) => (
                      <QualityLeverCard key={item.lever_id} item={item} variant="top" />
                    ))}
                  </div>
                )}
              </div>

              <div className="card stack" style={{ gap: 14 }}>
                <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="section-title">Lowest quality levers</div>
                    <div className="muted">
                      Entries that may need richer content, tagging, targeting or activation
                      review.
                    </div>
                  </div>
                </div>

                {summary.lowest_quality_levers.length === 0 ? (
                  <EmptyState>No levers available.</EmptyState>
                ) : (
                  <div
                    className="stack"
                    style={{
                      gap: 12,
                      maxHeight: "62vh",
                      overflowY: "auto",
                      paddingRight: 6,
                    }}
                  >
                    {summary.lowest_quality_levers.map((item) => (
                      <QualityLeverCard key={item.lever_id} item={item} variant="low" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}