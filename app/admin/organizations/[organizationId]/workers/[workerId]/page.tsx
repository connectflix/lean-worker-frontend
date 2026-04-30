"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { clearAdminToken } from "@/lib/admin-auth";
import { getAdminMe } from "@/lib/api";
import Link from "next/link";
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
    typeof window !== "undefined" ? window.localStorage.getItem("leanworker.adminToken") : null;

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
    typeof window !== "undefined" ? window.localStorage.getItem("leanworker.adminToken") : null;

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

  function handleLogout() {
    clearAdminToken();
    window.location.href = "/admin/login";
  }

  useEffect(() => {
    async function load() {
      try {
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
    >
      <div
        className="row space-between"
        style={{ alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">Organization worker summary</div>
          <div className="muted">
            Consolidated visibility on profile, blueprint, sessions, recommendations, and artifacts.
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Link className="button ghost" href="/admin/organizations">
            Back to organizations
          </Link>
          <button className="button ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
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
          <div className="grid grid-2">
            <div className="card stack">
              <div className="section-title">Worker profile</div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">#{worker.id}</span>
                <span className="badge">{worker.subscription_pack}</span>
                {worker.organization_id ? (
                  <span className="badge">Org #{worker.organization_id}</span>
                ) : null}
              </div>

              <div className="stack" style={{ gap: 6 }}>
                <div className="section-title" style={{ fontSize: 18 }}>
                  {worker.display_name}
                </div>
                <div className="muted">{worker.email || "No email"}</div>
              </div>

              <div className="grid grid-2">
                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Current role</strong>
                  <div className="muted">{worker.current_role || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Industry</strong>
                  <div className="muted">{worker.industry || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Profession</strong>
                  <div className="muted">{worker.profession || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Location</strong>
                  <div className="muted">{worker.location || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Business ID</strong>
                  <div className="muted">{worker.business_id || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Phone</strong>
                  <div className="muted">{worker.phone_number || "—"}</div>
                </div>
              </div>

              <div className="stack" style={{ gap: 6 }}>
                <strong>Main challenge</strong>
                <div className="muted">{worker.main_challenge || "—"}</div>
              </div>

              <div className="stack" style={{ gap: 6 }}>
                <strong>Primary goal</strong>
                <div className="muted">{worker.primary_goal || "—"}</div>
              </div>

              <div className="stack" style={{ gap: 6 }}>
                <strong>Preferred coaching style</strong>
                <div className="muted">{worker.preferred_coaching_style || "—"}</div>
              </div>
            </div>

            <div className="card stack">
              <div className="section-title">Worker activity snapshot</div>

              <div className="grid grid-3">
                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Sessions</strong>
                  <div className="topbar-title">{summary?.session_count ?? 0}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Recommendations</strong>
                  <div className="topbar-title">{summary?.recommendation_count ?? 0}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Artifacts</strong>
                  <div className="topbar-title">{summary?.artifact_count ?? 0}</div>
                </div>
              </div>

              <div className="card-soft stack" style={{ gap: 6 }}>
                <strong>Onboarding completed</strong>
                <div className="muted">{worker.onboarding_completed ? "Yes" : "No"}</div>
              </div>

              <div className="card-soft stack" style={{ gap: 6 }}>
                <strong>Profile refresh suspected</strong>
                <div className="muted">{worker.profile_update_suspected ? "Yes" : "No"}</div>
              </div>

              <div className="card-soft stack" style={{ gap: 6 }}>
                <strong>Language</strong>
                <div className="muted">{worker.language || "—"}</div>
              </div>

              <div className="card-soft stack" style={{ gap: 6 }}>
                <strong>Locale</strong>
                <div className="muted">{worker.locale || "—"}</div>
              </div>
            </div>
          </div>

          <div className="card stack">
            <div className="section-title">Career blueprint</div>

            {!blueprint ? (
              <div className="muted">No career blueprint available yet.</div>
            ) : (
              <div className="grid grid-2">
                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Identity</strong>
                  <div className="muted">{blueprint.identity_text || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Vision</strong>
                  <div className="muted">{blueprint.vision_text || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Talent focus</strong>
                  <div className="muted">{blueprint.talent_focus_text || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Career focus</strong>
                  <div className="muted">{blueprint.career_focus_text || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Inspiration person</strong>
                  <div className="muted">{blueprint.inspiration_person || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Aspiration person</strong>
                  <div className="muted">{blueprint.aspiration_person || "—"}</div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Short-term mission</strong>
                  <div className="muted">
                    {blueprint.short_term_mission
                      ? `${blueprint.short_term_mission.target_role || "—"} · ${blueprint.short_term_mission.target_level || "—"} · ${blueprint.short_term_mission.target_compensation || "—"}`
                      : "—"}
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Mid-term ambition</strong>
                  <div className="muted">
                    {blueprint.mid_term_ambition
                      ? `${blueprint.mid_term_ambition.target_role || "—"} · ${blueprint.mid_term_ambition.target_level || "—"} · ${blueprint.mid_term_ambition.target_compensation || "—"}`
                      : "—"}
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Long-term goal</strong>
                  <div className="muted">
                    {blueprint.long_term_goal
                      ? `${blueprint.long_term_goal.target_role || "—"} · ${blueprint.long_term_goal.target_level || "—"} · ${blueprint.long_term_goal.target_compensation || "—"}`
                      : "—"}
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 6 }}>
                  <strong>Starting point</strong>
                  <div className="muted">
                    {blueprint.starting_point
                      ? `Profession ${blueprint.starting_point.my_profession_percent}% · Work ${blueprint.starting_point.my_work_percent}% · Chore ${blueprint.starting_point.chore_percent}% · Destiny ${blueprint.starting_point.destiny_percent}% · Hobby ${blueprint.starting_point.hobby_percent}%`
                      : "—"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-2">
            <div className="card stack">
              <div className="section-title">Sessions</div>

              {sessions.length === 0 ? (
                <div className="muted">No sessions available.</div>
              ) : (
                <div className="stack" style={{ gap: 12, maxHeight: "50vh", overflowY: "auto" }}>
                  {sessions.map((session) => (
                    <div key={session.session_id} className="card-soft stack" style={{ gap: 6 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">Session #{session.session_id}</span>
                        <span className="badge">{session.status}</span>
                      </div>
                      <div className="muted">{session.summary || "No summary"}</div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        Started: {new Date(session.started_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card stack">
              <div className="section-title">Recommendations</div>

              {recommendations.length === 0 ? (
                <div className="muted">No recommendations available.</div>
              ) : (
                <div className="stack" style={{ gap: 12, maxHeight: "50vh", overflowY: "auto" }}>
                  {recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="card-soft stack" style={{ gap: 6 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{recommendation.id}</span>
                        <span className="badge">{recommendation.priority}</span>
                        <span className="badge">{recommendation.status}</span>
                      </div>
                      <div className="section-title" style={{ fontSize: 16 }}>
                        {recommendation.title}
                      </div>
                      <div className="muted">{recommendation.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card stack">
            <div className="section-title">AI artifacts</div>

            {artifacts.length === 0 ? (
              <div className="muted">No AI artifacts available.</div>
            ) : (
              <div className="stack" style={{ gap: 12 }}>
                {artifacts.map((artifact) => (
                  <div key={artifact.id} className="card-soft stack" style={{ gap: 6 }}>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge">Artifact #{artifact.id}</span>
                      <span className="badge">{artifact.format}</span>
                      <span className="badge">{artifact.status}</span>
                    </div>
                    <div className="section-title" style={{ fontSize: 16 }}>
                      {artifact.title}
                    </div>
                    <div className="muted">Price: €{artifact.price_eur}</div>
                    {artifact.error_message ? (
                      <div style={{ color: "var(--danger)" }}>{artifact.error_message}</div>
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