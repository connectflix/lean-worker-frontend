"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import {
  createAdminLever,
  deleteAdminLever,
  getAdminLevers,
  getAdminMe,
  toggleAdminLeverStatus,
  updateAdminLever,
} from "@/lib/api";
import { clearAdminToken } from "@/lib/admin-auth";
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
        item.target_problem.some((p) => p.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active) ||
        (statusFilter === "inactive" && !item.is_active);

      return matchesText && matchesStatus;
    });
  }, [items, filter, statusFilter]);

  function updateForm<K extends keyof LeverFormState>(key: K, value: LeverFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function fillFormFromLever(item: AdminLever) {
    setEditingId(item.id);
    setForm({
      category: item.category,
      name: item.name,
      description: item.description,
      url: item.url || "",
      tagsText: item.tags.join(", "),
      targetProblemText: item.target_problem.join(", "),
      provider_type: item.provider_type || "external",
      is_paid: item.is_paid ?? false,
      price_min_eur:
        item.price_min_eur != null ? String(item.price_min_eur) : "",
      price_max_eur:
        item.price_max_eur != null ? String(item.price_max_eur) : "",
      currency: item.currency || "EUR",
      is_default: item.is_default ?? false,
      priority_score:
        item.priority_score != null ? String(item.priority_score) : "0",
      is_active: item.is_active,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  function handleAdminLogout() {
    clearAdminToken();
    window.location.href = "/admin/login";
  }

  return (
    <main className="page">
      <div className="container stack">
        <div className="card stack">
          <div className="row space-between" style={{ alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 className="title">Admin · Levers</h1>
              <p className="subtitle">
                Manage the catalog that powers recommendation matching
              </p>
              {admin ? <div className="muted">Signed in as {admin.email}</div> : null}
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/intelligence")}>
                Intelligence
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/coverage")}>
                Coverage
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/quality")}>
                Quality
              </button>
              <button className="button ghost" onClick={handleAdminLogout}>
                Log out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card stack">
            <div className="section-title">
              {editingId ? `Edit lever #${editingId}` : "Create a new lever"}
            </div>

            <form onSubmit={handleSubmit} className="stack">
              <label className="stack">
                <strong>Category</strong>
                <select
                  className="textarea"
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                >
                  <option value="ai-enabled-developer">ai-enabled-developer</option>
                  <option value="engager">engager</option>
                  <option value="developer">developer</option>
                  <option value="transformer">transformer</option>
                  <option value="employer">employer</option>
                </select>
              </label>

              <label className="stack">
                <strong>Name</strong>
                <input
                  className="textarea"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Lever name"
                />
              </label>

              <label className="stack">
                <strong>Description</strong>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="What this lever does and why it helps..."
                />
              </label>

              <label className="stack">
                <strong>URL</strong>
                <input
                  className="textarea"
                  value={form.url}
                  onChange={(e) => updateForm("url", e.target.value)}
                  placeholder="https://... (optional for system lever)"
                />
              </label>

              <label className="stack">
                <strong>Tags</strong>
                <input
                  className="textarea"
                  value={form.tagsText}
                  onChange={(e) => updateForm("tagsText", e.target.value)}
                  placeholder="work, reduce_overload, improve_focus"
                />
              </label>

              <label className="stack">
                <strong>Target problems</strong>
                <input
                  className="textarea"
                  value={form.targetProblemText}
                  onChange={(e) => updateForm("targetProblemText", e.target.value)}
                  placeholder="overload, burnout_risk, prioritization_gap"
                />
              </label>

              <label className="stack">
                <strong>Provider type</strong>
                <select
                  className="textarea"
                  value={form.provider_type}
                  onChange={(e) => updateForm("provider_type", e.target.value)}
                >
                  <option value="external">external</option>
                  <option value="system">system</option>
                  <option value="organization">organization</option>
                  <option value="individual">individual</option>
                </select>
              </label>

              <label className="row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.is_paid}
                  onChange={(e) => updateForm("is_paid", e.target.checked)}
                />
                <strong>Paid lever</strong>
              </label>

              <div className="grid grid-2">
                <label className="stack">
                  <strong>Min price (EUR)</strong>
                  <input
                    className="textarea"
                    value={form.price_min_eur}
                    onChange={(e) => updateForm("price_min_eur", e.target.value)}
                    placeholder="1"
                    disabled={!form.is_paid}
                  />
                </label>

                <label className="stack">
                  <strong>Max price (EUR)</strong>
                  <input
                    className="textarea"
                    value={form.price_max_eur}
                    onChange={(e) => updateForm("price_max_eur", e.target.value)}
                    placeholder="15"
                    disabled={!form.is_paid}
                  />
                </label>
              </div>

              <label className="stack">
                <strong>Currency</strong>
                <input
                  className="textarea"
                  value={form.currency}
                  onChange={(e) => updateForm("currency", e.target.value)}
                  placeholder="EUR"
                />
              </label>

              <label className="row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => updateForm("is_default", e.target.checked)}
                />
                <strong>Default lever</strong>
              </label>

              <label className="stack">
                <strong>Priority score</strong>
                <input
                  className="textarea"
                  value={form.priority_score}
                  onChange={(e) => updateForm("priority_score", e.target.value)}
                  placeholder="0"
                />
              </label>

              <label className="row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateForm("is_active", e.target.checked)}
                />
                <strong>Active</strong>
              </label>

              <div className="row" style={{ flexWrap: "wrap" }}>
                <button className="button" type="submit" disabled={saving}>
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

          <div className="card stack">
            <div className="section-title">Search & filter</div>

            <input
              className="textarea"
              placeholder="Search by name, category, provider, tags, or problem..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />

            <select
              className="textarea"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            >
              <option value="all">All statuses</option>
              <option value="active">Only active</option>
              <option value="inactive">Only inactive</option>
            </select>

            <div className="muted">
              {loading ? "Loading..." : `${filteredItems.length} lever(s) shown`}
            </div>

            {error && <div style={{ color: "var(--danger)" }}>{error}</div>}
          </div>
        </div>

        <div className="card stack">
          <div className="section-title">Lever catalog</div>

          {loading ? (
            <div>Loading levers...</div>
          ) : filteredItems.length === 0 ? (
            <div>No levers found.</div>
          ) : (
            <div className="stack">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="stack"
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 16,
                  }}
                >
                  <div className="row space-between" style={{ alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div className="stack" style={{ gap: 8, flex: 1 }}>
                      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                        <span className="badge">#{item.id}</span>
                        <span className="badge">{item.category}</span>
                        <span className="badge">{item.is_active ? "active" : "inactive"}</span>
                        <span className="badge">{item.provider_type || "external"}</span>
                        {item.is_default ? <span className="badge">default</span> : null}
                        {item.is_paid ? <span className="badge">paid</span> : null}
                        {item.priority_score ? (
                          <span className="badge">priority {item.priority_score}</span>
                        ) : null}
                      </div>

                      <div className="section-title">{item.name}</div>
                      <div>{item.description}</div>

                      <div className="muted" style={{ wordBreak: "break-all" }}>
                        {item.url || "No external URL"}
                      </div>

                      <div className="muted">
                        Price: {formatPriceRange(item)}
                      </div>

                      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                        {item.tags.map((tag) => (
                          <span key={tag} className="badge">
                            tag: {tag}
                          </span>
                        ))}
                      </div>

                      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                        {item.target_problem.map((problem) => (
                          <span key={problem} className="badge">
                            problem: {problem}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="stack" style={{ minWidth: 180 }}>
                      <button className="button ghost" onClick={() => fillFormFromLever(item)}>
                        Edit
                      </button>
                      <button className="button secondary" onClick={() => handleToggleStatus(item)}>
                        {item.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button className="button ghost" onClick={() => handleDelete(item)}>
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
    </main>
  );
}