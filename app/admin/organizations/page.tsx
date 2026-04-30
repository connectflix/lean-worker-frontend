// app/admin/organizations/[organizationId]/workers/[workerId]/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  getAdminMe,
  getAdminOrganizationWorkerSummary,
} from "@/lib/api";
import type {
  AdminMe,
  AdminOrganizationWorkerSummary,
} from "@/lib/types";

export default function AdminOrganizationWorkerPage() {
  return (
    <AdminGuard>
      <AdminOrganizationWorkerContent />
    </AdminGuard>
  );
}

function AdminOrganizationWorkerContent() {
  const params = useParams();

  const organizationId = useMemo(() => {
    const raw = params?.organizationId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params]);

  const workerId = useMemo(() => {
    const raw = params?.workerId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params]);

  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminOrganizationWorkerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!organizationId || !workerId) {
        setError("Invalid organization or worker identifier.");
        setLoading(false);
        return;
      }

      try {
        const [me, workerSummary] = await Promise.all([
          getAdminMe(),
          getAdminOrganizationWorkerSummary(organizationId, workerId),
        ]);

        setAdmin(me);
        setSummary(workerSummary);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load organization worker detail.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [organizationId, workerId]);

  return (
    <AdminShell
      activeHref="/admin/organizations"
      title="Organization Worker Detail"
      subtitle="Scoped view for a selected worker inside an organization."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
    >
      <div
        className="row space-between"
        style={{ alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">Worker detail</div>
          <div className="muted">
            Organization #{organizationId ?? "—"} · Worker #{workerId ?? "—"}
          </div>
        </div>

        <Link href="/admin/organizations" className="button ghost">
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
      ) : !summary ? (
        <div className="card">
          <div className="muted">No worker detail available.</div>
        </div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          <div className="card stack">
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 6 }}>
                <div className="section-title">{summary.worker.display_name}</div>
                <div className="muted">{summary.worker.email || "No email"}</div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">#{summary.worker.id}</span>
                {summary.worker.business_id ? (
                  <span className="badge">{summary.worker.business_id}</span>
                ) : null}
                <span className="badge">{summary.worker.subscription_pack}</span>
                {summary.worker.current_role ? (
                  <span className="badge">{summary.worker.current_role}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="admin-kpi-scroll">
            <div className="admin-kpi-row admin-kpi-row--6">
              <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
                <div className="muted">Sessions</div>
                <div className="admin-metric-value" style={{ fontSize: 26 }}>
                  {summary.session_count}
                </div>
              </div>

              <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
                <div className="muted">External conversations</div>
                <div className="admin-metric-value" style={{ fontSize: 26 }}>
                  {summary.external_conversation_count}
                </div>
              </div>

              <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
                <div className="muted">Recommendations</div>
                <div className="admin-metric-value" style={{ fontSize: 26 }}>
                  {summary.recommendation_count}
                </div>
              </div>

              <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
                <div className="muted">Artifacts</div>
                <div className="admin-metric-value" style={{ fontSize: 26 }}>
                  {summary.artifact_count}
                </div>
              </div>

              <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
                <div className="muted">Levers</div>
                <div className="admin-metric-value" style={{ fontSize: 26 }}>
                  {summary.lever_count}
                </div>
              </div>

              <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
                <div className="muted">Blueprint</div>
                <div className="admin-metric-value" style={{ fontSize: 18 }}>
                  {summary.career_blueprint ? "Available" : "Not available"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card-soft stack">
              <div className="section-title">Worker profile</div>

              <div>
                <strong>Name:</strong> {summary.worker.display_name}
              </div>

              <div>
                <strong>Email:</strong> {summary.worker.email || "—"}
              </div>

              <div>
                <strong>Business ID:</strong> {summary.worker.business_id || "—"}
              </div>

              <div>
                <strong>Role:</strong> {summary.worker.current_role || "—"}
              </div>

              <div>
                <strong>Industry:</strong> {summary.worker.industry || "—"}
              </div>

              <div>
                <strong>Language:</strong> {summary.worker.language}
              </div>

              <div>
                <strong>Subscription:</strong> {summary.worker.subscription_pack}
              </div>

              <div>
                <strong>Profession:</strong> {summary.worker.profession || "—"}
              </div>

              <div>
                <strong>Location:</strong> {summary.worker.location || "—"}
              </div>
            </div>

            <div className="card-soft stack">
              <div className="section-title">Career blueprint</div>

              {summary.career_blueprint ? (
                <>
                  <div>
                    <strong>Identity:</strong>{" "}
                    {summary.career_blueprint.identity_text || "—"}
                  </div>

                  <div>
                    <strong>Vision:</strong>{" "}
                    {summary.career_blueprint.vision_text || "—"}
                  </div>

                  <div>
                    <strong>Talent focus:</strong>{" "}
                    {summary.career_blueprint.talent_focus_text || "—"}
                  </div>

                  <div>
                    <strong>Career focus:</strong>{" "}
                    {summary.career_blueprint.career_focus_text || "—"}
                  </div>

                  <div>
                    <strong>Inspiration person:</strong>{" "}
                    {summary.career_blueprint.inspiration_person || "—"}
                  </div>

                  <div>
                    <strong>Aspiration person:</strong>{" "}
                    {summary.career_blueprint.aspiration_person || "—"}
                  </div>
                </>
              ) : (
                <div className="muted">No career blueprint available.</div>
              )}
            </div>
          </div>

          <div className="grid grid-4">
            <div className="card-soft stack">
              <div className="section-title">Sessions</div>

              {summary.sessions.length === 0 ? (
                <div className="muted">No sessions found.</div>
              ) : (
                <div className="stack" style={{ gap: 10, maxHeight: "38vh", overflowY: "auto" }}>
                  {summary.sessions.map((session) => (
                    <div
                      key={session.session_id}
                      className="stack"
                      style={{
                        gap: 4,
                        borderTop: "1px solid var(--border)",
                        paddingTop: 10,
                      }}
                    >
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{session.session_id}</span>
                        <span className="badge">{session.status}</span>
                      </div>

                      <div className="muted">
                        {new Date(session.started_at).toLocaleString()}
                      </div>

                      <div>{session.summary || "No summary available."}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-soft stack">
              <div className="section-title">Recommendations</div>

              {summary.recommendations.length === 0 ? (
                <div className="muted">No recommendations found.</div>
              ) : (
                <div className="stack" style={{ gap: 10, maxHeight: "38vh", overflowY: "auto" }}>
                  {summary.recommendations.map((recommendation) => (
                    <div
                      key={recommendation.id}
                      className="stack"
                      style={{
                        gap: 6,
                        borderTop: "1px solid var(--border)",
                        paddingTop: 10,
                      }}
                    >
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{recommendation.id}</span>
                        <span className="badge">{recommendation.status}</span>
                        <span className="badge">{recommendation.priority}</span>
                      </div>

                      <div className="section-title" style={{ fontSize: 15 }}>
                        {recommendation.title}
                      </div>

                      <div>{recommendation.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-soft stack">
              <div className="section-title">Artifacts</div>

              {summary.artifacts.length === 0 ? (
                <div className="muted">No artifacts found.</div>
              ) : (
                <div className="stack" style={{ gap: 10, maxHeight: "38vh", overflowY: "auto" }}>
                  {summary.artifacts.map((artifact) => (
                    <div
                      key={artifact.id}
                      className="stack"
                      style={{
                        gap: 4,
                        borderTop: "1px solid var(--border)",
                        paddingTop: 10,
                      }}
                    >
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{artifact.id}</span>
                        <span className="badge">{artifact.format}</span>
                        <span className="badge">{artifact.status}</span>
                      </div>

                      <div className="section-title" style={{ fontSize: 15 }}>
                        {artifact.title}
                      </div>

                      <div className="muted">€{artifact.price_eur}</div>

                      {artifact.error_message ? (
                        <div style={{ color: "var(--danger)" }}>{artifact.error_message}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-soft stack">
              <div className="section-title">Levers</div>

              {summary.levers.length === 0 ? (
                <div className="muted">No levers found.</div>
              ) : (
                <div className="stack" style={{ gap: 10, maxHeight: "38vh", overflowY: "auto" }}>
                  {summary.levers.map((lever) => (
                    <div
                      key={lever.id}
                      className="stack"
                      style={{
                        gap: 6,
                        borderTop: "1px solid var(--border)",
                        paddingTop: 10,
                      }}
                    >
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{lever.id}</span>
                        <span className="badge">{lever.category}</span>
                        <span className="badge">{lever.is_active ? "active" : "inactive"}</span>
                        <span className="badge">used {lever.usage_count}x</span>
                      </div>

                      <div className="section-title" style={{ fontSize: 15 }}>
                        {lever.name}
                      </div>

                      <div>{lever.description}</div>

                      <div className="muted">
                        Provider: {lever.provider_type || "—"} · Paid:{" "}
                        {lever.is_paid ? "yes" : "no"}
                      </div>

                      {lever.url ? (
                        <div>
                          <a
                            href={lever.url}
                            target="_blank"
                            rel="noreferrer"
                            className="link-button"
                          >
                            Open lever link
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}