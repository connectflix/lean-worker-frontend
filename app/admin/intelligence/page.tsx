"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminIntelligenceSummary, getAdminMe } from "@/lib/api";
import type { AdminIntelligenceSummary, AdminMe } from "@/lib/types";

export default function AdminIntelligencePage() {
  return (
    <AdminGuard>
      <AdminIntelligenceContent />
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

function AdminIntelligenceContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminIntelligenceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadIntelligence() {
    setLoading(true);
    setError(null);

    try {
      const [me, intelligence] = await Promise.all([
        getAdminMe(),
        getAdminIntelligenceSummary(),
      ]);

      setAdmin(me);
      setSummary(intelligence);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin intelligence.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIntelligence();
  }, []);

  const activeMostUsedLevers = useMemo(() => {
    return summary?.most_used_levers.filter((item) => item.is_active).length ?? 0;
  }, [summary]);

  const inactiveMostUsedLevers = useMemo(() => {
    return summary?.most_used_levers.filter((item) => !item.is_active).length ?? 0;
  }, [summary]);

  const activeUnusedLevers = useMemo(() => {
    return summary?.unused_levers.filter((item) => item.is_active).length ?? 0;
  }, [summary]);

  const intelligenceHealthLabel = useMemo(() => {
    if (!summary) return "Unknown";

    if (summary.total_problem_detections === 0) return "No signal yet";
    if (summary.unused_levers.length > 0 && activeUnusedLevers > 0) return "Needs catalog review";
    if (inactiveMostUsedLevers > 0) return "Needs activation review";
    return "Healthy";
  }, [summary, activeUnusedLevers, inactiveMostUsedLevers]);

  return (
    <AdminShell
      activeHref="/admin/intelligence"
      title="Admin Intelligence"
      subtitle="Understand detected worker problems, lever usage, and catalog performance signals."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      <div className="stack" style={{ gap: 18 }}>
        <div
          className="card stack"
          style={{
            gap: 16,
            border: "1px solid rgba(124,58,237,0.18)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(245,243,255,0.94))",
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
              background: "rgba(124,58,237,0.08)",
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
                <span className="badge">Problem detection</span>
                <span className="badge">Lever usage</span>
                <span className="badge">Catalog intelligence</span>
              </div>

              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1.08,
                  fontWeight: 950,
                  letterSpacing: "-0.05em",
                }}
              >
                Turn worker signals into lever catalog decisions.
              </div>

              <div className="muted" style={{ maxWidth: 980, lineHeight: 1.7 }}>
                This page helps you understand which problems are detected most often, which
                levers are actually used, and which catalog entries may need better activation,
                tagging, positioning or replacement.
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
              <div className="muted">Intelligence health</div>
              <div className="section-title" style={{ fontSize: 22 }}>
                {intelligenceHealthLabel}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Based on detections, usage, inactive popular levers and unused active levers.
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card-soft">Loading admin intelligence...</div>
        ) : error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : !summary ? (
          <div className="card-soft">No intelligence data available.</div>
        ) : (
          <>
            <div className="grid grid-4">
              <MetricCard
                label="Problem detections"
                value={summary.total_problem_detections}
                tone="primary"
                hint="Total detected worker problem signals."
              />

              <MetricCard
                label="Most used levers"
                value={summary.most_used_levers.length}
                tone="success"
                hint="Levers currently receiving usage."
              />

              <MetricCard
                label="Unused levers"
                value={summary.unused_levers.length}
                tone={summary.unused_levers.length > 0 ? "warning" : "success"}
                hint="Catalog entries not used yet."
              />

              <MetricCard
                label="Active unused"
                value={activeUnusedLevers}
                tone={activeUnusedLevers > 0 ? "warning" : "success"}
                hint="Active levers that may need review."
              />
            </div>

            <div className="card stack" style={{ gap: 14 }}>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Lever signal overview</div>
                  <div className="muted">
                    Use this summary to detect whether the catalog is active, relevant and aligned
                    with actual worker problems.
                  </div>
                </div>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => void loadIntelligence()}
                  disabled={loading}
                >
                  Refresh
                </button>
              </div>

              <div className="grid grid-4">
                <MetricCard label="Active used" value={activeMostUsedLevers} tone="success" />
                <MetricCard
                  label="Inactive used"
                  value={inactiveMostUsedLevers}
                  tone={inactiveMostUsedLevers > 0 ? "danger" : "success"}
                />
                <MetricCard
                  label="Primary problems"
                  value={summary.top_primary_problems.length}
                  tone="primary"
                />
                <MetricCard
                  label="Secondary problems"
                  value={summary.top_secondary_problems.length}
                  tone="primary"
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card stack" style={{ gap: 14 }}>
                <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="section-title">Top primary problems</div>
                    <div className="muted">
                      Main problems detected as the worker’s dominant issue.
                    </div>
                  </div>
                </div>

                {summary.top_primary_problems.length === 0 ? (
                  <EmptyState>No primary problems recorded yet.</EmptyState>
                ) : (
                  <div className="stack" style={{ gap: 10 }}>
                    {summary.top_primary_problems.map((item, index) => (
                      <div key={item.problem} className="card-soft stack" style={{ gap: 8 }}>
                        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">#{index + 1}</span>
                            <span className="badge">{item.count} detection(s)</span>
                          </div>
                        </div>

                        <div className="section-title" style={{ fontSize: 16 }}>
                          {normalizeLabel(item.problem)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card stack" style={{ gap: 14 }}>
                <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="section-title">Top secondary problems</div>
                    <div className="muted">
                      Recurring adjacent problems detected alongside the main issue.
                    </div>
                  </div>
                </div>

                {summary.top_secondary_problems.length === 0 ? (
                  <EmptyState>No secondary problems recorded yet.</EmptyState>
                ) : (
                  <div className="stack" style={{ gap: 10 }}>
                    {summary.top_secondary_problems.map((item, index) => (
                      <div key={item.problem} className="card-soft stack" style={{ gap: 8 }}>
                        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">#{index + 1}</span>
                            <span className="badge">{item.count} detection(s)</span>
                          </div>
                        </div>

                        <div className="section-title" style={{ fontSize: 16 }}>
                          {normalizeLabel(item.problem)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card stack" style={{ gap: 14 }}>
                <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="section-title">Most used levers</div>
                    <div className="muted">
                      Levers currently generating traction in recommendations.
                    </div>
                  </div>

                  <a className="button ghost" href="/admin/levers">
                    Manage catalog
                  </a>
                </div>

                {summary.most_used_levers.length === 0 ? (
                  <EmptyState>No lever usage yet.</EmptyState>
                ) : (
                  <div
                    className="stack"
                    style={{
                      gap: 10,
                      maxHeight: "56vh",
                      overflowY: "auto",
                      paddingRight: 6,
                    }}
                  >
                    {summary.most_used_levers.map((item) => (
                      <div key={item.lever_id} className="card-soft stack" style={{ gap: 10 }}>
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{item.lever_id}</span>
                          <span className="badge">{normalizeLabel(item.category)}</span>
                          <span style={statusTone(item.is_active)}>
                            {item.is_active ? "Active" : "Inactive"}
                          </span>
                          <span className="badge">used {item.usage_count}x</span>
                        </div>

                        <div className="section-title" style={{ fontSize: 17 }}>
                          {item.name}
                        </div>

                        {!item.is_active ? (
                          <div
                            className="card-soft"
                            style={{
                              color: "var(--danger)",
                              background: "rgba(220,38,38,0.06)",
                              border: "1px solid rgba(220,38,38,0.18)",
                            }}
                          >
                            This lever is used but inactive. Review whether it should be
                            reactivated, replaced, or removed from matching logic.
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card stack" style={{ gap: 14 }}>
                <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="section-title">Unused levers</div>
                    <div className="muted">
                      Levers that may need better tagging, positioning or problem mapping.
                    </div>
                  </div>

                  <a className="button ghost" href="/admin/levers">
                    Review levers
                  </a>
                </div>

                {summary.unused_levers.length === 0 ? (
                  <EmptyState>Every lever has been used at least once.</EmptyState>
                ) : (
                  <div
                    className="stack"
                    style={{
                      gap: 10,
                      maxHeight: "56vh",
                      overflowY: "auto",
                      paddingRight: 6,
                    }}
                  >
                    {summary.unused_levers.map((item) => (
                      <div key={item.lever_id} className="card-soft stack" style={{ gap: 10 }}>
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{item.lever_id}</span>
                          <span className="badge">{normalizeLabel(item.category)}</span>
                          <span style={statusTone(item.is_active)}>
                            {item.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="section-title" style={{ fontSize: 17 }}>
                          {item.name}
                        </div>

                        {item.is_active ? (
                          <div
                            className="card-soft"
                            style={{
                              color: "var(--warning, #b45309)",
                              background: "rgba(245,158,11,0.07)",
                              border: "1px solid rgba(245,158,11,0.20)",
                            }}
                          >
                            This active lever is not used yet. Check tags, target problems, default
                            status and matching priority.
                          </div>
                        ) : null}
                      </div>
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