"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminCoverageSummary, getAdminMe } from "@/lib/api";
import type { AdminCoverageSummary, AdminMe } from "@/lib/types";

type CoverageSeverity = "critical" | "high" | "medium" | "low" | string;

export default function AdminCoveragePage() {
  return (
    <AdminGuard>
      <AdminCoverageContent />
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

function severityLabel(severity: CoverageSeverity): string {
  switch (severity) {
    case "critical":
      return "Critical gap";
    case "high":
      return "High gap";
    case "medium":
      return "Medium gap";
    default:
      return "Low gap";
  }
}

function severityTone(severity: CoverageSeverity): CSSProperties {
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

  if (severity === "critical") {
    return {
      ...base,
      color: "var(--danger)",
      background: "rgba(220,38,38,0.08)",
      border: "1px solid rgba(220,38,38,0.22)",
    };
  }

  if (severity === "high") {
    return {
      ...base,
      color: "var(--warning, #b45309)",
      background: "rgba(245,158,11,0.10)",
      border: "1px solid rgba(245,158,11,0.24)",
    };
  }

  if (severity === "medium") {
    return {
      ...base,
      color: "var(--primary-hover)",
      background: "var(--primary-soft)",
      border: "1px solid rgba(37,99,235,0.16)",
    };
  }

  return {
    ...base,
    color: "var(--success)",
    background: "rgba(21,128,61,0.08)",
    border: "1px solid rgba(21,128,61,0.20)",
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
  tone?: "default" | "danger" | "warning" | "success" | "primary";
}) {
  const toneStyle =
    tone === "danger"
      ? {
          color: "var(--danger)",
          background: "rgba(220,38,38,0.07)",
          border: "1px solid rgba(220,38,38,0.18)",
        }
      : tone === "warning"
        ? {
            color: "var(--warning, #b45309)",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.20)",
          }
        : tone === "success"
          ? {
              color: "var(--success)",
              background: "rgba(21,128,61,0.07)",
              border: "1px solid rgba(21,128,61,0.18)",
            }
          : tone === "primary"
            ? {
                color: "var(--primary-hover)",
                background: "var(--primary-soft)",
                border: "1px solid rgba(37,99,235,0.16)",
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

function AdminCoverageContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminCoverageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCoverage() {
    setLoading(true);
    setError(null);

    try {
      const [me, coverage] = await Promise.all([getAdminMe(), getAdminCoverageSummary()]);
      setAdmin(me);
      setSummary(coverage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin coverage.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCoverage();
  }, []);

  const severityCounts = useMemo(() => {
    const gaps = summary?.coverage_gaps ?? [];

    return {
      critical: gaps.filter((item) => item.severity === "critical").length,
      high: gaps.filter((item) => item.severity === "high").length,
      medium: gaps.filter((item) => item.severity === "medium").length,
      low: gaps.filter(
        (item) =>
          item.severity !== "critical" &&
          item.severity !== "high" &&
          item.severity !== "medium",
      ).length,
    };
  }, [summary]);

  const uncoveredGaps = useMemo(() => {
    return (summary?.coverage_gaps ?? []).filter((item) => item.active_lever_count === 0).length;
  }, [summary]);

  const totalDetections = useMemo(() => {
    return (summary?.coverage_gaps ?? []).reduce(
      (total, item) => total + item.detection_count,
      0,
    );
  }, [summary]);

  const coverageHealthLabel = useMemo(() => {
    if (!summary) return "Unknown";

    if (summary.coverage_gaps.length === 0) return "Healthy";
    if (severityCounts.critical > 0) return "Critical";
    if (severityCounts.high > 0 || uncoveredGaps > 0) return "Needs review";
    return "Watch";
  }, [summary, severityCounts.critical, severityCounts.high, uncoveredGaps]);

  return (
    <AdminShell
      activeHref="/admin/coverage"
      title="Coverage Gaps"
      subtitle="Identify frequent worker problems that are not sufficiently covered by active levers."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      <div className="stack" style={{ gap: 18 }}>
        <div
          className="card stack"
          style={{
            gap: 16,
            border: "1px solid rgba(37,99,235,0.18)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(239,246,255,0.94))",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -110,
              top: -150,
              width: 340,
              height: 340,
              borderRadius: 999,
              background: "rgba(37,99,235,0.08)",
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
                <span className="badge">Problem coverage</span>
                <span className="badge">Lever matching</span>
                <span className="badge">Catalog gaps</span>
              </div>

              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1.08,
                  fontWeight: 950,
                  letterSpacing: "-0.05em",
                }}
              >
                Detect where LeanWorker lacks the right support levers.
              </div>

              <div className="muted" style={{ maxWidth: 980, lineHeight: 1.7 }}>
                This view highlights recurring worker problems that are not sufficiently covered by
                active levers. Use it to prioritize new coaches, resources, AI artifacts, trainings
                or default fallback options.
              </div>
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 4,
                minWidth: 190,
                background: "rgba(255,255,255,0.78)",
                position: "relative",
              }}
            >
              <div className="muted">Coverage health</div>
              <div className="section-title" style={{ fontSize: 22 }}>
                {coverageHealthLabel}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Based on severity, detected gaps and active lever coverage.
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card-soft">Loading coverage analysis...</div>
        ) : error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : !summary ? (
          <div className="card-soft">No coverage data available.</div>
        ) : (
          <>
            <div className="grid grid-4">
              <MetricCard
                label="Distinct problems"
                value={summary.total_distinct_problems}
                tone="primary"
                hint="Unique problems detected from worker signals."
              />

              <MetricCard
                label="Coverage gaps"
                value={summary.coverage_gaps.length}
                tone={summary.coverage_gaps.length > 0 ? "warning" : "success"}
                hint="Problems requiring catalog attention."
              />

              <MetricCard
                label="Uncovered gaps"
                value={uncoveredGaps}
                tone={uncoveredGaps > 0 ? "danger" : "success"}
                hint="Gaps with no active matching lever."
              />

              <MetricCard
                label="Total detections"
                value={totalDetections}
                hint="Total frequency across listed gaps."
              />
            </div>

            <div className="card stack" style={{ gap: 14 }}>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Severity overview</div>
                  <div className="muted">
                    Prioritize critical and high gaps before expanding low-severity catalog
                    coverage.
                  </div>
                </div>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => void loadCoverage()}
                  disabled={loading}
                >
                  Refresh
                </button>
              </div>

              <div className="grid grid-4">
                <MetricCard
                  label="Critical"
                  value={severityCounts.critical}
                  tone={severityCounts.critical > 0 ? "danger" : "success"}
                />
                <MetricCard
                  label="High"
                  value={severityCounts.high}
                  tone={severityCounts.high > 0 ? "warning" : "success"}
                />
                <MetricCard label="Medium" value={severityCounts.medium} tone="primary" />
                <MetricCard label="Low" value={severityCounts.low} />
              </div>
            </div>

            <div className="card stack" style={{ gap: 14 }}>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Problem coverage analysis</div>
                  <div className="muted">
                    Review each problem, its detection volume, current lever coverage and matching
                    catalog entries.
                  </div>
                </div>

                <a className="button" href="/admin/levers">
                  Update catalog
                </a>
              </div>

              {summary.coverage_gaps.length === 0 ? (
                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>No coverage gaps detected.</strong>
                  <div className="muted">
                    The current active lever catalog appears to cover the detected problem areas.
                  </div>
                </div>
              ) : (
                <div
                  className="stack"
                  style={{
                    gap: 12,
                    maxHeight: "calc(100vh - 410px)",
                    minHeight: 420,
                    overflowY: "auto",
                    paddingRight: 6,
                  }}
                >
                  {summary.coverage_gaps.map((item) => {
                    const hasActiveCoverage = item.active_lever_count > 0;
                    const hasMatchingLevers = item.matching_lever_names.length > 0;

                    return (
                      <div key={item.problem} className="card-soft stack" style={{ gap: 12 }}>
                        <div
                          className="row space-between"
                          style={{
                            alignItems: "flex-start",
                            gap: 14,
                            flexWrap: "wrap",
                          }}
                        >
                          <div className="stack" style={{ gap: 8, minWidth: 0, flex: 1 }}>
                            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                              <span style={severityTone(item.severity)}>
                                {severityLabel(item.severity)}
                              </span>

                              <span className="badge">detected {item.detection_count}x</span>

                              <span
                                className="badge"
                                style={
                                  hasActiveCoverage
                                    ? {
                                        color: "var(--success)",
                                        borderColor: "rgba(21,128,61,0.20)",
                                        background: "rgba(21,128,61,0.08)",
                                      }
                                    : {
                                        color: "var(--danger)",
                                        borderColor: "rgba(220,38,38,0.20)",
                                        background: "rgba(220,38,38,0.08)",
                                      }
                                }
                              >
                                active levers: {item.active_lever_count}
                              </span>

                              <span className="badge">
                                inactive levers: {item.inactive_lever_count}
                              </span>
                            </div>

                            <div className="section-title" style={{ fontSize: 18 }}>
                              {normalizeLabel(item.problem)}
                            </div>

                            {hasMatchingLevers ? (
                              <div className="stack" style={{ gap: 8 }}>
                                <div className="muted">Matching levers</div>
                                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                                  {item.matching_lever_names.map((name) => (
                                    <span key={`${item.problem}-${name}`} className="badge">
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div
                                className="card-soft"
                                style={{
                                  color: "var(--danger)",
                                  border: "1px solid rgba(220,38,38,0.18)",
                                  background: "rgba(220,38,38,0.06)",
                                }}
                              >
                                No lever currently targets this problem. Create or map a relevant
                                lever in the catalog.
                              </div>
                            )}
                          </div>

                          <div className="stack" style={{ gap: 8, minWidth: 180 }}>
                            <a className="button ghost" href="/admin/levers">
                              Manage levers
                            </a>

                            <a className="button ghost" href="/admin/levers">
                              Add coverage
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}