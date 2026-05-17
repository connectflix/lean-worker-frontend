"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { clearAdminToken } from "@/lib/admin-auth";
import { getAdminMe } from "@/lib/api";
import type {
  AdminMe,
  AdminOrganizationDetail,
  AdminWorker,
  AIArtifactStatusResponse,
  CareerBlueprintResponse,
  Recommendation,
  SessionHistoryItem,
} from "@/lib/types";

type WorkerSummaryResponse = {
  worker: AdminWorker;
  career_blueprint: CareerBlueprintResponse | null;
  sessions: SessionHistoryItem[];
  recommendations: Recommendation[];
  artifacts: AIArtifactStatusResponse[];
  session_count: number;
  recommendation_count: number;
  artifact_count: number;
};

async function fetchWorkerSummary(
  organizationId: number,
  workerId: number,
): Promise<WorkerSummaryResponse> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("leanworker.adminToken")
      : null;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/organizations/${organizationId}/workers/${workerId}/summary`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    },
  );

  if (response.status === 401) {
    clearAdminToken();
    window.location.href = "/admin/login";
    throw new Error("Admin authentication expired. Please sign in again.");
  }

  if (response.status === 403) {
    window.location.href = "/admin/organizations";
    throw new Error("You do not have access to this worker.");
  }

  if (!response.ok) {
    let message = "Failed to load worker summary.";

    try {
      const data = await response.json();
      message = data.detail || JSON.stringify(data);
    } catch {
      message = await response.text();
    }

    throw new Error(message);
  }

  return response.json();
}

async function fetchOrganizationDetail(
  organizationId: number,
): Promise<AdminOrganizationDetail> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("leanworker.adminToken")
      : null;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/organizations/${organizationId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    },
  );

  if (response.status === 401) {
    clearAdminToken();
    window.location.href = "/admin/login";
    throw new Error("Admin authentication expired. Please sign in again.");
  }

  if (!response.ok) {
    let message = "Failed to load organization.";

    try {
      const data = await response.json();
      message = data.detail || JSON.stringify(data);
    } catch {
      message = await response.text();
    }

    throw new Error(message);
  }

  return response.json();
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("fr-BE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value?: number | null): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value ?? 0));
}

function normalizeDisplayLabel(value?: string | null): string {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="card-soft stack" style={{ gap: 6 }}>
      <div className="muted">{label}</div>
      <div
        style={{
          fontWeight: 700,
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function TextPanel({
  title,
  value,
  maxHeight = 180,
}: {
  title: string;
  value?: string | null;
  maxHeight?: number;
}) {
  return (
    <div className="card-soft stack" style={{ gap: 8 }}>
      <strong>{title}</strong>
      <div
        className="muted"
        style={{
          maxHeight,
          overflowY: "auto",
          overflowX: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          paddingRight: 4,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "primary" | "success";
}) {
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "primary"
        ? "var(--admin-accent, var(--primary))"
        : "var(--foreground)";

  return (
    <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
      <div className="muted">{label}</div>
      <div className="admin-metric-value" style={{ fontSize: 28, color }}>
        {value}
      </div>
    </div>
  );
}

export default function AdminOrganizationWorkerDetailPage() {
  return (
    <AdminGuard>
      <AdminOrganizationWorkerDetailContent />
    </AdminGuard>
  );
}

function AdminOrganizationWorkerDetailContent() {
  const params = useParams<{ organizationId: string; workerId: string }>();

  const organizationId = Number(params.organizationId);
  const workerId = Number(params.workerId);

  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [organizationName, setOrganizationName] = useState<string>("");
  const [summary, setSummary] = useState<WorkerSummaryResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const me = await getAdminMe();
        setAdmin(me);

        const [organizationDetail, workerSummary] = await Promise.all([
          fetchOrganizationDetail(organizationId),
          fetchWorkerSummary(organizationId, workerId),
        ]);

        setOrganizationName(organizationDetail.organization.name);
        setSummary(workerSummary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load worker detail.");
      } finally {
        setLoading(false);
      }
    }

    if (!Number.isFinite(organizationId) || !Number.isFinite(workerId)) {
      setError("Invalid organization or worker identifier.");
      setLoading(false);
      return;
    }

    void load();
  }, [organizationId, workerId]);

  const worker = summary?.worker ?? null;
  const blueprint = summary?.career_blueprint ?? null;

  const sessions = useMemo(() => summary?.sessions ?? [], [summary]);
  const recommendations = useMemo(() => summary?.recommendations ?? [], [summary]);
  const artifacts = useMemo(() => summary?.artifacts ?? [], [summary]);

  return (
    <AdminShell
      activeHref="/admin/organizations"
      title="Worker Detail"
      subtitle={
        organizationName
          ? `${organizationName} · Worker performance and journey view`
          : "Worker performance and journey view"
      }
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={organizationName || null}
    >
      <div
        className="row space-between"
        style={{ alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">Organization worker summary</div>
          <div className="muted">
            Consolidated visibility on worker profile, career blueprint, sessions,
            recommendations, and AI artifacts.
          </div>
        </div>

        <Link className="button ghost" href="/admin/organizations">
          Back to organizations
        </Link>
      </div>

      {error ? (
        <div className="card" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="card">Loading worker detail...</div>
      ) : !worker ? (
        <div className="card">Worker not found.</div>
      ) : (
        <>
          <div className="card stack" style={{ gap: 16 }}>
            <div
              className="row space-between"
              style={{ gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}
            >
              <div className="stack" style={{ gap: 8 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">Worker #{worker.id}</span>
                  {worker.business_id ? (
                    <span className="badge">{worker.business_id}</span>
                  ) : null}
                  <span className="badge">{worker.subscription_pack}</span>
                  {worker.organization_id ? (
                    <span className="badge">Org #{worker.organization_id}</span>
                  ) : null}
                  <span className={worker.onboarding_completed ? "badge success" : "badge"}>
                    {worker.onboarding_completed ? "Onboarded" : "Not onboarded"}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 750,
                    lineHeight: 1.08,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {worker.display_name}
                </div>

                <div className="muted">{worker.email || "No email"}</div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">
                  Language: {normalizeDisplayLabel(worker.language)}
                </span>
                {worker.locale ? <span className="badge">Locale: {worker.locale}</span> : null}
              </div>
            </div>

            <div className="admin-kpi-scroll">
              <div className="admin-kpi-row admin-kpi-row--6">
                <KpiCard label="Sessions" value={summary?.session_count ?? 0} tone="primary" />
                <KpiCard
                  label="Recommendations"
                  value={summary?.recommendation_count ?? 0}
                  tone="primary"
                />
                <KpiCard label="AI artifacts" value={summary?.artifact_count ?? 0} />
                <KpiCard
                  label="Blueprint"
                  value={blueprint ? "Available" : "Missing"}
                  tone={blueprint ? "success" : "neutral"}
                />
                <KpiCard
                  label="Profile refresh"
                  value={worker.profile_update_suspected ? "Suspected" : "No"}
                />
                <KpiCard
                  label="Subscription"
                  value={normalizeDisplayLabel(worker.subscription_pack)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card stack" style={{ gap: 16 }}>
              <div className="section-title">Worker profile</div>

              <div className="grid grid-2">
                <InfoTile label="Current role" value={worker.current_role} />
                <InfoTile label="Industry" value={worker.industry} />
                <InfoTile label="Profession" value={worker.profession} />
                <InfoTile label="Location" value={worker.location} />
                <InfoTile label="Business ID" value={worker.business_id} />
                <InfoTile label="Phone" value={worker.phone_number} />
              </div>

              <TextPanel title="Main challenge" value={worker.main_challenge} />
              <TextPanel title="Primary goal" value={worker.primary_goal} />
              <TextPanel
                title="Preferred coaching style"
                value={worker.preferred_coaching_style}
              />
            </div>

            <div className="card stack" style={{ gap: 16 }}>
              <div className="section-title">Worker activity snapshot</div>

              <div className="grid grid-2">
                <InfoTile
                  label="Onboarding completed"
                  value={worker.onboarding_completed ? "Yes" : "No"}
                />
                <InfoTile
                  label="Profile refresh suspected"
                  value={worker.profile_update_suspected ? "Yes" : "No"}
                />
                <InfoTile label="Language" value={worker.language} />
                <InfoTile label="Locale" value={worker.locale} />
              </div>

              <div className="card-soft stack" style={{ gap: 8 }}>
                <div className="section-title" style={{ fontSize: 15 }}>
                  Journey readiness
                </div>
                <div className="muted">
                  This view consolidates the worker’s onboarding context, coaching history,
                  recommendations, and generated artifacts so an organization can follow the full
                  worker journey from one place.
                </div>
              </div>
            </div>
          </div>

          <div className="card stack" style={{ gap: 16 }}>
            <div
              className="row space-between"
              style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
            >
              <div className="section-title">Career blueprint</div>
              <span className={blueprint ? "badge success" : "badge"}>
                {blueprint ? "Available" : "Not available"}
              </span>
            </div>

            {!blueprint ? (
              <div className="muted">No career blueprint available yet.</div>
            ) : (
              <div className="grid grid-2">
                <TextPanel title="Identity" value={blueprint.identity_text} />
                <TextPanel title="Vision" value={blueprint.vision_text} />
                <TextPanel title="Talent focus" value={blueprint.talent_focus_text} />
                <TextPanel title="Career focus" value={blueprint.career_focus_text} />
                <InfoTile label="Inspiration person" value={blueprint.inspiration_person} />
                <InfoTile label="Aspiration person" value={blueprint.aspiration_person} />

                <InfoTile
                  label="Short-term mission"
                  value={
                    blueprint.short_term_mission
                      ? `${blueprint.short_term_mission.target_role || "—"} · ${
                          blueprint.short_term_mission.target_level || "—"
                        } · ${blueprint.short_term_mission.target_compensation || "—"}`
                      : "—"
                  }
                />

                <InfoTile
                  label="Mid-term ambition"
                  value={
                    blueprint.mid_term_ambition
                      ? `${blueprint.mid_term_ambition.target_role || "—"} · ${
                          blueprint.mid_term_ambition.target_level || "—"
                        } · ${blueprint.mid_term_ambition.target_compensation || "—"}`
                      : "—"
                  }
                />

                <InfoTile
                  label="Long-term goal"
                  value={
                    blueprint.long_term_goal
                      ? `${blueprint.long_term_goal.target_role || "—"} · ${
                          blueprint.long_term_goal.target_level || "—"
                        } · ${blueprint.long_term_goal.target_compensation || "—"}`
                      : "—"
                  }
                />

                <InfoTile
                  label="Starting point"
                  value={
                    blueprint.starting_point
                      ? `Profession ${blueprint.starting_point.my_profession_percent}% · Work ${blueprint.starting_point.my_work_percent}% · Chore ${blueprint.starting_point.chore_percent}% · Destiny ${blueprint.starting_point.destiny_percent}% · Hobby ${blueprint.starting_point.hobby_percent}%`
                      : "—"
                  }
                />
              </div>
            )}
          </div>

          <div className="grid grid-2">
            <div className="card stack" style={{ gap: 14 }}>
              <div
                className="row space-between"
                style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
              >
                <div className="section-title">Sessions</div>
                <span className="badge">{sessions.length} session(s)</span>
              </div>

              {sessions.length === 0 ? (
                <div className="muted">No sessions available.</div>
              ) : (
                <div className="stack scroll-panel" style={{ gap: 12, maxHeight: "50vh" }}>
                  {sessions.map((session) => (
                    <div key={session.session_id} className="card-soft stack" style={{ gap: 8 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">Session #{session.session_id}</span>
                        <span className="badge">{session.status}</span>
                      </div>

                      <div
                        className="muted"
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {session.summary || "No summary"}
                      </div>

                      <div className="fine-print">Started: {formatDateTime(session.started_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card stack" style={{ gap: 14 }}>
              <div
                className="row space-between"
                style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
              >
                <div className="section-title">Recommendations</div>
                <span className="badge">{recommendations.length} recommendation(s)</span>
              </div>

              {recommendations.length === 0 ? (
                <div className="muted">No recommendations available.</div>
              ) : (
                <div className="stack scroll-panel" style={{ gap: 12, maxHeight: "50vh" }}>
                  {recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="card-soft stack" style={{ gap: 8 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{recommendation.id}</span>
                        <span className="badge">{recommendation.priority}</span>
                        <span className="badge">{recommendation.status}</span>
                      </div>

                      <div className="section-title" style={{ fontSize: 16 }}>
                        {recommendation.title}
                      </div>

                      <div
                        className="muted"
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {recommendation.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card stack" style={{ gap: 14 }}>
            <div
              className="row space-between"
              style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
            >
              <div className="section-title">AI artifacts</div>
              <span className="badge">{artifacts.length} artifact(s)</span>
            </div>

            {artifacts.length === 0 ? (
              <div className="muted">No AI artifacts available.</div>
            ) : (
              <div className="stack scroll-panel" style={{ gap: 12, maxHeight: "56vh" }}>
                {artifacts.map((artifact) => (
                  <div key={artifact.id} className="card-soft stack" style={{ gap: 8 }}>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge">Artifact #{artifact.id}</span>
                      <span className="badge">{artifact.format}</span>
                      <span className="badge">{artifact.status}</span>
                      <span className="badge">{formatCurrency(artifact.price_eur)}</span>
                    </div>

                    <div className="section-title" style={{ fontSize: 16 }}>
                      {artifact.title}
                    </div>

                    {artifact.error_message ? (
                      <div
                        style={{
                          color: "var(--danger)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {artifact.error_message}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}