"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  createAdminLever,
  deleteAdminLever,
  getAdminLevers,
  getAdminMe,
  toggleAdminLeverStatus,
  updateAdminLever,
} from "@/lib/api";
import type { AdminLever, AdminMe } from "@/lib/types";

type LeverFormState = {
  category: string;
  name: string;
  description: string;
  url: string;
  tagsText: string;
  targetProblemText: string;
  provider_type: string;
  is_paid: boolean;
  price_min_eur: string;
  price_max_eur: string;
  currency: string;
  is_default: boolean;
  priority_score: string;
  is_active: boolean;
};

type LeverViewMode = "catalog" | "intelligence" | "coverage" | "quality";

const EMPTY_FORM: LeverFormState = {
  category: "developer",
  name: "",
  description: "",
  url: "",
  tagsText: "",
  targetProblemText: "",
  provider_type: "external",
  is_paid: false,
  price_min_eur: "",
  price_max_eur: "",
  currency: "EUR",
  is_default: false,
  priority_score: "0",
  is_active: true,
};

function formatPriceRange(item: AdminLever): string {
  const min = item.price_min_eur;
  const max = item.price_max_eur;
  const currency = item.currency || "EUR";

  if (min == null && max == null) return "—";

  const symbol = currency === "EUR" ? "€" : currency;

  if (min != null && max != null) {
    if (min === max) return `${min}${symbol}`;
    return `${min}${symbol} - ${max}${symbol}`;
  }

  if (min != null) return `${min}${symbol}`;
  return `${max}${symbol}`;
}

function parseCsv(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
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

function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "purple";
}) {
  const toneStyle =
    tone === "success"
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
          : tone === "purple"
            ? {
                color: "#6d28d9",
                background: "rgba(124,58,237,0.07)",
                border: "1px solid rgba(124,58,237,0.18)",
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

function BreakdownList({
  title,
  emptyLabel,
  items,
}: {
  title: string;
  emptyLabel: string;
  items: Array<{ label: string; count: number }>;
}) {
  return (
    <div className="card stack" style={{ gap: 12 }}>
      <div className="section-title">{title}</div>

      {items.length === 0 ? (
        <div className="muted">{emptyLabel}</div>
      ) : (
        <div className="stack" style={{ gap: 0 }}>
          {items.map((item, index) => (
            <div
              key={item.label}
              className="row space-between"
              style={{
                gap: 12,
                borderTop: index === 0 ? "none" : "1px solid var(--border)",
                paddingTop: index === 0 ? 0 : 12,
                paddingBottom: 12,
              }}
            >
              <span>{normalizeLabel(item.label)}</span>
              <span className="badge">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLeversPage() {
  return (
    <AdminGuard>
      <AdminLeversContent />
    </AdminGuard>
  );
}

function AdminLeversContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [items, setItems] = useState<AdminLever[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<LeverFormState>(EMPTY_FORM);

  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<LeverViewMode>("catalog");

  useEffect(() => {
    async function load() {
      try {
        const [me, levers] = await Promise.all([getAdminMe(), getAdminLevers()]);
        setAdmin(me);
        setItems(levers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = filter.trim().toLowerCase();

      const matchesText =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.provider_type || "").toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        item.target_problem.some((problem) => problem.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active) ||
        (statusFilter === "inactive" && !item.is_active);

      return matchesText && matchesStatus;
    });
  }, [items, filter, statusFilter]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();

    items.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const providerBreakdown = useMemo(() => {
    const counts = new Map<string, number>();

    items.forEach((item) => {
      const key = item.provider_type || "external";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const problemCoverage = useMemo(() => {
    const counts = new Map<string, number>();

    items.forEach((item) => {
      item.target_problem.forEach((problem) => {
        counts.set(problem, (counts.get(problem) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const qualityStats = useMemo(() => {
    const missingDescription = items.filter((item) => !item.description.trim()).length;
    const missingUrl = items.filter((item) => !(item.url || "").trim()).length;
    const lowTags = items.filter((item) => item.tags.length < 2).length;
    const noProblemMapping = items.filter((item) => item.target_problem.length === 0).length;
    const inactiveDefaults = items.filter((item) => item.is_default && !item.is_active).length;

    return {
      missingDescription,
      missingUrl,
      lowTags,
      noProblemMapping,
      inactiveDefaults,
    };
  }, [items]);

  const activeCount = useMemo(() => {
    return items.filter((item) => item.is_active).length;
  }, [items]);

  const inactiveCount = useMemo(() => {
    return items.filter((item) => !item.is_active).length;
  }, [items]);

  const pricedLevers = useMemo(() => {
    return items.filter((item) => item.is_paid);
  }, [items]);

  const avgPriorityScore = useMemo(() => {
    if (items.length === 0) return 0;

    const total = items.reduce((acc, item) => acc + (item.priority_score ?? 0), 0);
    return total / items.length;
  }, [items]);

  const catalogHealthLabel = useMemo(() => {
    const issues =
      qualityStats.missingDescription +
      qualityStats.lowTags +
      qualityStats.noProblemMapping +
      qualityStats.inactiveDefaults;

    if (items.length === 0) return "Empty";
    if (issues === 0) return "Healthy";
    if (issues <= 3) return "Watch";
    return "Needs review";
  }, [items.length, qualityStats]);

  function updateForm<K extends keyof LeverFormState>(key: K, value: LeverFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function fillFormFromLever(item: AdminLever) {
    setEditingId(item.id);
    setViewMode("catalog");

    setForm({
      category: item.category,
      name: item.name,
      description: item.description,
      url: item.url || "",
      tagsText: item.tags.join(", "),
      targetProblemText: item.target_problem.join(", "),
      provider_type: item.provider_type || "external",
      is_paid: item.is_paid ?? false,
      price_min_eur: item.price_min_eur != null ? String(item.price_min_eur) : "",
      price_max_eur: item.price_max_eur != null ? String(item.price_max_eur) : "",
      currency: item.currency || "EUR",
      is_default: item.is_default ?? false,
      priority_score: item.priority_score != null ? String(item.priority_score) : "0",
      is_active: item.is_active,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      category: form.category,
      name: form.name.trim(),
      description: form.description.trim(),
      url: form.url.trim() || null,
      tags: parseCsv(form.tagsText),
      target_problem: parseCsv(form.targetProblemText),
      provider_type: form.provider_type,
      is_paid: form.is_paid,
      price_min_eur: form.is_paid ? parseOptionalNumber(form.price_min_eur) : null,
      price_max_eur: form.is_paid ? parseOptionalNumber(form.price_max_eur) : null,
      currency: (form.currency || "EUR").trim() || "EUR",
      is_default: form.is_default,
      priority_score: Number(form.priority_score || "0"),
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        const updated = await updateAdminLever(editingId, payload);
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createAdminLever(payload);
        setItems((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lever.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(item: AdminLever) {
    setError(null);

    try {
      const result = await toggleAdminLeverStatus(item.id);

      setItems((prev) =>
        prev.map((lever) =>
          lever.id === item.id ? { ...lever, is_active: result.is_active } : lever,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lever status.");
    }
  }

  async function handleDelete(item: AdminLever) {
    const confirmed = window.confirm(`Delete lever "${item.name}"?`);
    if (!confirmed) return;

    setError(null);

    try {
      await deleteAdminLever(item.id);
      setItems((prev) => prev.filter((lever) => lever.id !== item.id));

      if (editingId === item.id) {
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lever.");
    }
  }

  return (
    <AdminShell
      activeHref="/admin/levers"
      title="Manage Levers"
      subtitle="Catalog management plus internal intelligence, coverage, and quality views."
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
              right: -100,
              top: -140,
              width: 320,
              height: 320,
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
            <div className="stack" style={{ gap: 10, maxWidth: 920 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">Lever catalog</span>
                <span className="badge">Matching intelligence</span>
                <span className="badge">Quality control</span>
              </div>

              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1.08,
                  fontWeight: 950,
                  letterSpacing: "-0.05em",
                }}
              >
                Manage the resources LeanWorker can recommend to workers.
              </div>

              <div className="muted" style={{ maxWidth: 980, lineHeight: 1.7 }}>
                Maintain coaches, mentors, books, trainings, AI artifacts and opportunities.
                Each lever should be mapped to clear problems, tagged properly and prioritized so
                the recommendation engine can make better decisions.
              </div>
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 4,
                minWidth: 180,
                background: "rgba(255,255,255,0.78)",
                position: "relative",
              }}
            >
              <div className="muted">Catalog health</div>
              <div className="section-title" style={{ fontSize: 22 }}>
                {catalogHealthLabel}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Based on tags, mappings, descriptions and defaults.
              </div>
            </div>
          </div>
        </div>

        <div className="card stack" style={{ gap: 14 }}>
          <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              {[
                { key: "catalog", label: "Catalog" },
                { key: "intelligence", label: "Intelligence" },
                { key: "coverage", label: "Coverage" },
                { key: "quality", label: "Quality" },
              ].map((item) => (
                <button
                  key={item.key}
                  className={viewMode === item.key ? "button" : "button ghost"}
                  type="button"
                  onClick={() => setViewMode(item.key as LeverViewMode)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="muted">
              {loading ? "Loading catalog..." : `${items.length} lever(s) loaded`}
            </div>
          </div>

          <div className="grid grid-4">
            <MetricCard label="Total levers" value={items.length} />
            <MetricCard label="Active levers" value={activeCount} tone="success" />
            <MetricCard label="Paid levers" value={pricedLevers.length} tone="purple" />
            <MetricCard label="Avg priority" value={avgPriorityScore.toFixed(1)} />
          </div>
        </div>

        {error ? (
          <div className="card" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : null}

        {viewMode === "catalog" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(360px, 0.9fr) minmax(0, 1.1fr)",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div
              className="card stack"
              style={{
                gap: 16,
                position: "sticky",
                top: 96,
                maxHeight: "calc(100vh - 120px)",
                overflowY: "auto",
              }}
            >
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">
                  {editingId ? `Edit lever #${editingId}` : "Create a new lever"}
                </div>
                <div className="muted">
                  Add or update a lever used by the recommendation engine.
                </div>
              </div>

              <form onSubmit={handleSubmit} className="stack" style={{ gap: 14 }}>
                <label className="stack" style={{ gap: 6 }}>
                  <strong>Category</strong>
                  <select
                    className="select"
                    value={form.category}
                    onChange={(event) => updateForm("category", event.target.value)}
                  >
                    <option value="ai-enabled-developer">ai-enabled-developer</option>
                    <option value="engager">engager</option>
                    <option value="developer">developer</option>
                    <option value="transformer">transformer</option>
                    <option value="employer">employer</option>
                  </select>
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <strong>Name</strong>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="Lever name"
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <strong>Description</strong>
                  <textarea
                    className="textarea"
                    value={form.description}
                    onChange={(event) => updateForm("description", event.target.value)}
                    placeholder="What this lever does and why it helps..."
                    rows={5}
                    style={{ resize: "vertical", lineHeight: 1.55 }}
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <strong>URL</strong>
                  <input
                    className="input"
                    value={form.url}
                    onChange={(event) => updateForm("url", event.target.value)}
                    placeholder="https://... optional for system lever"
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <strong>Tags</strong>
                  <input
                    className="input"
                    value={form.tagsText}
                    onChange={(event) => updateForm("tagsText", event.target.value)}
                    placeholder="work, reduce_overload, improve_focus"
                  />
                  <div className="muted" style={{ fontSize: 12 }}>
                    Comma-separated values.
                  </div>
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <strong>Target problems</strong>
                  <input
                    className="input"
                    value={form.targetProblemText}
                    onChange={(event) => updateForm("targetProblemText", event.target.value)}
                    placeholder="overload, burnout_risk, prioritization_gap"
                  />
                  <div className="muted" style={{ fontSize: 12 }}>
                    These mappings improve recommendation precision.
                  </div>
                </label>

                <div className="grid grid-2">
                  <label className="stack" style={{ gap: 6 }}>
                    <strong>Provider type</strong>
                    <select
                      className="select"
                      value={form.provider_type}
                      onChange={(event) => updateForm("provider_type", event.target.value)}
                    >
                      <option value="external">external</option>
                      <option value="system">system</option>
                      <option value="organization">organization</option>
                      <option value="individual">individual</option>
                    </select>
                  </label>

                  <label className="stack" style={{ gap: 6 }}>
                    <strong>Priority score</strong>
                    <input
                      className="input"
                      value={form.priority_score}
                      onChange={(event) => updateForm("priority_score", event.target.value)}
                      placeholder="0"
                    />
                  </label>
                </div>

                <div className="card-soft stack" style={{ gap: 12 }}>
                  <label className="row" style={{ gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.is_paid}
                      onChange={(event) => updateForm("is_paid", event.target.checked)}
                    />
                    <strong>Paid lever</strong>
                  </label>

                  <div className="grid grid-3">
                    <label className="stack" style={{ gap: 6 }}>
                      <strong>Min</strong>
                      <input
                        className="input"
                        value={form.price_min_eur}
                        onChange={(event) => updateForm("price_min_eur", event.target.value)}
                        placeholder="1"
                        disabled={!form.is_paid}
                      />
                    </label>

                    <label className="stack" style={{ gap: 6 }}>
                      <strong>Max</strong>
                      <input
                        className="input"
                        value={form.price_max_eur}
                        onChange={(event) => updateForm("price_max_eur", event.target.value)}
                        placeholder="15"
                        disabled={!form.is_paid}
                      />
                    </label>

                    <label className="stack" style={{ gap: 6 }}>
                      <strong>Currency</strong>
                      <input
                        className="input"
                        value={form.currency}
                        onChange={(event) => updateForm("currency", event.target.value)}
                        placeholder="EUR"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-2">
                  <label className="row" style={{ gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.is_default}
                      onChange={(event) => updateForm("is_default", event.target.checked)}
                    />
                    <strong>Default</strong>
                  </label>

                  <label className="row" style={{ gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) => updateForm("is_active", event.target.checked)}
                    />
                    <strong>Active</strong>
                  </label>
                </div>

                <div
                  className="row"
                  style={{
                    flexWrap: "wrap",
                    gap: 8,
                    position: "sticky",
                    bottom: 0,
                    background: "rgba(255,255,255,0.94)",
                    backdropFilter: "blur(10px)",
                    paddingTop: 10,
                    paddingBottom: 4,
                  }}
                >
                  <button className="button" type="submit" disabled={saving || !form.name.trim()}>
                    {saving ? "Saving..." : editingId ? "Save changes" : "Create lever"}
                  </button>

                  {editingId ? (
                    <button className="button ghost" type="button" onClick={resetForm}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="card stack" style={{ gap: 14, minWidth: 0 }}>
              <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Lever catalog</div>
                  <div className="muted">
                    Search, filter and maintain the recommendation catalog.
                  </div>
                </div>

                <div className="badge">
                  {filteredItems.length} visible / {items.length} total
                </div>
              </div>

              <div className="grid grid-2">
                <input
                  className="input"
                  placeholder="Search by name, category, provider, tags, or problem..."
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                />

                <select
                  className="select"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "all" | "active" | "inactive")
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="active">Only active</option>
                  <option value="inactive">Only inactive</option>
                </select>
              </div>

              {loading ? (
                <div className="card-soft">Loading levers...</div>
              ) : filteredItems.length === 0 ? (
                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>No levers found.</strong>
                  <div className="muted">
                    Adjust the filters or create a new lever from the form.
                  </div>
                </div>
              ) : (
                <div
                  className="stack"
                  style={{
                    gap: 12,
                    maxHeight: "calc(100vh - 350px)",
                    minHeight: 520,
                    overflowY: "auto",
                    paddingRight: 6,
                  }}
                >
                  {filteredItems.map((item) => (
                    <div key={item.id} className="card-soft stack" style={{ gap: 12 }}>
                      <div
                        className="row space-between"
                        style={{
                          alignItems: "flex-start",
                          gap: 14,
                          flexWrap: "wrap",
                        }}
                      >
                        <div className="stack" style={{ gap: 8, minWidth: 0, flex: 1 }}>
                          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                            <span className="badge">#{item.id}</span>
                            <span className="badge">{normalizeLabel(item.category)}</span>
                            <span
                              className="badge"
                              style={
                                item.is_active
                                  ? {
                                      color: "var(--success)",
                                      background: "rgba(21,128,61,0.08)",
                                      borderColor: "rgba(21,128,61,0.2)",
                                    }
                                  : {
                                      color: "var(--danger)",
                                      background: "rgba(220,38,38,0.08)",
                                      borderColor: "rgba(220,38,38,0.2)",
                                    }
                              }
                            >
                              {item.is_active ? "active" : "inactive"}
                            </span>
                            <span className="badge">
                              {normalizeLabel(item.provider_type || "external")}
                            </span>
                            {item.is_default ? <span className="badge">default</span> : null}
                            {item.is_paid ? <span className="badge">paid</span> : null}
                            {item.priority_score ? (
                              <span className="badge">priority {item.priority_score}</span>
                            ) : null}
                          </div>

                          <div className="section-title" style={{ fontSize: 18 }}>
                            {item.name}
                          </div>

                          <div className="muted" style={{ lineHeight: 1.6 }}>
                            {item.description || "No description provided."}
                          </div>

                          <div className="muted" style={{ wordBreak: "break-all" }}>
                            {item.url || "No external URL"}
                          </div>

                          <div className="muted">Price: {formatPriceRange(item)}</div>

                          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                            {item.tags.length === 0 ? (
                              <span className="muted">No tags</span>
                            ) : (
                              item.tags.map((tag) => (
                                <span key={`${item.id}-tag-${tag}`} className="badge">
                                  tag: {tag}
                                </span>
                              ))
                            )}
                          </div>

                          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                            {item.target_problem.length === 0 ? (
                              <span className="muted">No mapped problem</span>
                            ) : (
                              item.target_problem.map((problem) => (
                                <span key={`${item.id}-problem-${problem}`} className="badge">
                                  problem: {problem}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="stack" style={{ minWidth: 180, gap: 8 }}>
                          <button
                            className="button ghost"
                            type="button"
                            onClick={() => fillFormFromLever(item)}
                          >
                            Edit
                          </button>

                          <button
                            className="button secondary"
                            type="button"
                            onClick={() => void handleToggleStatus(item)}
                          >
                            {item.is_active ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            className="button ghost"
                            type="button"
                            onClick={() => void handleDelete(item)}
                            style={{ color: "var(--danger)" }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {viewMode === "intelligence" ? (
          <div className="grid grid-2">
            <BreakdownList
              title="Category breakdown"
              emptyLabel="No category data yet."
              items={categoryBreakdown}
            />

            <BreakdownList
              title="Provider breakdown"
              emptyLabel="No provider data yet."
              items={providerBreakdown}
            />

            <div className="card stack" style={{ gap: 12 }}>
              <div className="section-title">Monetization overview</div>

              <div className="grid grid-2">
                <MetricCard label="Paid" value={pricedLevers.length} tone="purple" />
                <MetricCard
                  label="Free / unknown"
                  value={items.length - pricedLevers.length}
                />
              </div>

              <div className="card-soft muted" style={{ lineHeight: 1.6 }}>
                Paid levers are useful for AI artifact monetization, premium resources, external
                coaches, trainings and specialized programs. Free levers can act as first-step
                recommendations or default support.
              </div>
            </div>

            <div className="card stack" style={{ gap: 12 }}>
              <div className="section-title">Activation overview</div>

              <div className="grid grid-2">
                <MetricCard label="Active" value={activeCount} tone="success" />
                <MetricCard label="Inactive" value={inactiveCount} tone="danger" />
              </div>

              <div className="card-soft muted" style={{ lineHeight: 1.6 }}>
                Inactive levers remain in the catalog but should not be suggested to users. Review
                inactive defaults carefully because they can weaken fallback recommendation logic.
              </div>
            </div>
          </div>
        ) : null}

        {viewMode === "coverage" ? (
          <div className="grid grid-2">
            <BreakdownList
              title="Problem coverage"
              emptyLabel="No problem mapping data yet."
              items={problemCoverage}
            />

            <div className="card stack" style={{ gap: 12 }}>
              <div className="section-title">Coverage insights</div>

              <div className="grid grid-2">
                <MetricCard
                  label="Problem areas"
                  value={problemCoverage.length}
                  hint="Distinct mapped problem areas."
                />
                <MetricCard
                  label="Unmapped levers"
                  value={qualityStats.noProblemMapping}
                  tone={qualityStats.noProblemMapping > 0 ? "warning" : "success"}
                  hint="Levers without target_problem mapping."
                />
              </div>

              <div className="card-soft stack" style={{ gap: 8 }}>
                <div className="muted">
                  {problemCoverage.length === 0
                    ? "No mapped problems are available yet."
                    : `${problemCoverage.length} distinct problem area(s) are currently covered by the lever catalog.`}
                </div>

                <div className="muted">
                  {categoryBreakdown.length === 0
                    ? "No category coverage yet."
                    : `${categoryBreakdown.length} lever category(ies) are represented in the catalog.`}
                </div>

                <div className="muted">
                  {qualityStats.noProblemMapping > 0
                    ? `${qualityStats.noProblemMapping} lever(s) currently have no explicit problem mapping.`
                    : "All levers currently have at least one mapped problem."}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {viewMode === "quality" ? (
          <div className="grid grid-2">
            <div className="card stack" style={{ gap: 12 }}>
              <div className="section-title">Quality signals</div>

              <div className="grid grid-2">
                <MetricCard
                  label="Missing description"
                  value={qualityStats.missingDescription}
                  tone={qualityStats.missingDescription > 0 ? "warning" : "success"}
                />
                <MetricCard
                  label="Missing URL"
                  value={qualityStats.missingUrl}
                  tone={qualityStats.missingUrl > 0 ? "warning" : "success"}
                />
                <MetricCard
                  label="Low tags"
                  value={qualityStats.lowTags}
                  tone={qualityStats.lowTags > 0 ? "warning" : "success"}
                  hint="Less than 2 tags."
                />
                <MetricCard
                  label="No mapping"
                  value={qualityStats.noProblemMapping}
                  tone={qualityStats.noProblemMapping > 0 ? "danger" : "success"}
                />
              </div>
            </div>

            <div className="card stack" style={{ gap: 12 }}>
              <div className="section-title">Quality interpretation</div>

              <div className="card-soft stack" style={{ gap: 10, lineHeight: 1.6 }}>
                <div className="muted">
                  {qualityStats.inactiveDefaults > 0
                    ? `${qualityStats.inactiveDefaults} default lever(s) are inactive and should be reviewed.`
                    : "No inactive default levers detected."}
                </div>

                <div className="muted">
                  {qualityStats.lowTags > 0
                    ? `${qualityStats.lowTags} lever(s) may need richer tagging for better matching precision.`
                    : "Tag coverage looks acceptable for the current catalog."}
                </div>

                <div className="muted">
                  {qualityStats.noProblemMapping > 0
                    ? `${qualityStats.noProblemMapping} lever(s) should be linked to clearer target problems.`
                    : "Problem mapping coverage looks complete."}
                </div>

                <div className="muted">
                  {qualityStats.missingDescription > 0
                    ? `${qualityStats.missingDescription} lever(s) need clearer descriptions so admins can understand their purpose.`
                    : "Descriptions are available across the catalog."}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}