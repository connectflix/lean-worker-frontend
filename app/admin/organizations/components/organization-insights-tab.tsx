"use client";

import type { AdminOrganizationWorkerSummary } from "@/lib/types";

type LeverSortMode = "highlighted" | "most_used" | "name";

type OrganizationInsightsTabProps = {
  selectedWorkerSummary: AdminOrganizationWorkerSummary | null;
  workerSummaryLoading: boolean;

  leverSearch: string;
  leverCategoryFilter: string;
  leverSortMode: LeverSortMode;
  leverCategories: string[];
  filteredLevers: AdminOrganizationWorkerSummary["levers"];
  relatedLeversByRecommendationId: Map<
    number,
    AdminOrganizationWorkerSummary["levers"]
  >;

  onLeverSearchChange: (value: string) => void;
  onLeverCategoryFilterChange: (value: string) => void;
  onLeverSortModeChange: (value: LeverSortMode) => void;
  onScrollToRecommendation: (recommendationId: number) => void;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getWorkerSubscriptionPaidExVat(
  worker: AdminOrganizationWorkerSummary["worker"],
): number {
  const directTotal = Number(worker.subscription_total_paid_eur ?? 0);
  const activeSubscriptionTotal = Number(worker.active_subscription?.total_paid_eur ?? 0);

  if (Number.isFinite(directTotal) && directTotal > 0) {
    return directTotal;
  }

  if (Number.isFinite(activeSubscriptionTotal) && activeSubscriptionTotal > 0) {
    return activeSubscriptionTotal;
  }

  return 0;
}

export function OrganizationInsightsTab({
  selectedWorkerSummary,
  workerSummaryLoading,
  leverSearch,
  leverCategoryFilter,
  leverSortMode,
  leverCategories,
  filteredLevers,
  relatedLeversByRecommendationId,
  onLeverSearchChange,
  onLeverCategoryFilterChange,
  onLeverSortModeChange,
  onScrollToRecommendation,
}: OrganizationInsightsTabProps) {
  if (workerSummaryLoading) {
    return (
      <div className="card stack">
        <div className="section-title">Worker performance workspace</div>
        <div className="muted">Loading worker summary...</div>
      </div>
    );
  }

  if (!selectedWorkerSummary) {
    return (
      <div className="card stack">
        <div className="section-title">Worker performance workspace</div>
        <div className="muted">Select a worker to view details.</div>
      </div>
    );
  }

  const subscriptionPaid = getWorkerSubscriptionPaidExVat(selectedWorkerSummary.worker);

  return (
    <div className="card stack">
      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="section-title">Worker performance workspace</div>
        <div className="muted">
          Selected worker: {selectedWorkerSummary.worker.display_name}
        </div>
      </div>

      <div className="admin-kpi-scroll">
        <div className="admin-kpi-row admin-kpi-row--6">
          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Sessions</div>
            <div className="admin-metric-value" style={{ fontSize: 26 }}>
              {selectedWorkerSummary.session_count}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">External conversations</div>
            <div className="admin-metric-value" style={{ fontSize: 26 }}>
              {selectedWorkerSummary.external_conversation_count}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Recommendations</div>
            <div className="admin-metric-value" style={{ fontSize: 26 }}>
              {selectedWorkerSummary.recommendation_count}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Artifacts</div>
            <div className="admin-metric-value" style={{ fontSize: 26 }}>
              {selectedWorkerSummary.artifact_count}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Levers</div>
            <div className="admin-metric-value" style={{ fontSize: 26 }}>
              {selectedWorkerSummary.lever_count}
            </div>
          </div>

          <div className="card-soft stack admin-kpi-card" style={{ gap: 6 }}>
            <div className="muted">Blueprint</div>
            <div className="admin-metric-value" style={{ fontSize: 18 }}>
              {selectedWorkerSummary.career_blueprint ? "Available" : "Not available"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card-soft stack">
          <div className="section-title">Worker profile</div>

          <div>
            <strong>Name:</strong> {selectedWorkerSummary.worker.display_name}
          </div>
          <div>
            <strong>Email:</strong> {selectedWorkerSummary.worker.email || "—"}
          </div>
          <div>
            <strong>Business ID:</strong>{" "}
            {selectedWorkerSummary.worker.business_id || "—"}
          </div>
          <div>
            <strong>Role:</strong> {selectedWorkerSummary.worker.current_role || "—"}
          </div>
          <div>
            <strong>Industry:</strong> {selectedWorkerSummary.worker.industry || "—"}
          </div>
          <div>
            <strong>Language:</strong> {selectedWorkerSummary.worker.language}
          </div>
          <div>
            <strong>Subscription:</strong>{" "}
            {selectedWorkerSummary.worker.subscription_pack}
          </div>
          <div>
            <strong>Subscription paid:</strong> {formatCurrency(subscriptionPaid)}
          </div>
          <div>
            <strong>Organization share:</strong>{" "}
            {formatCurrency(subscriptionPaid * 0.75)}
          </div>
          <div>
            <strong>Profession:</strong>{" "}
            {selectedWorkerSummary.worker.profession || "—"}
          </div>
          <div>
            <strong>Location:</strong> {selectedWorkerSummary.worker.location || "—"}
          </div>
        </div>

        <div className="card-soft stack">
          <div className="section-title">Career blueprint</div>

          {selectedWorkerSummary.career_blueprint ? (
            <>
              <div>
                <strong>Identity:</strong>{" "}
                {selectedWorkerSummary.career_blueprint.identity_text || "—"}
              </div>
              <div>
                <strong>Vision:</strong>{" "}
                {selectedWorkerSummary.career_blueprint.vision_text || "—"}
              </div>
              <div>
                <strong>Talent focus:</strong>{" "}
                {selectedWorkerSummary.career_blueprint.talent_focus_text || "—"}
              </div>
              <div>
                <strong>Career focus:</strong>{" "}
                {selectedWorkerSummary.career_blueprint.career_focus_text || "—"}
              </div>
              <div>
                <strong>Inspiration person:</strong>{" "}
                {selectedWorkerSummary.career_blueprint.inspiration_person || "—"}
              </div>
              <div>
                <strong>Aspiration person:</strong>{" "}
                {selectedWorkerSummary.career_blueprint.aspiration_person || "—"}
              </div>
            </>
          ) : (
            <div className="muted">No career blueprint available.</div>
          )}
        </div>
      </div>

      <div className="card-soft stack">
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
        >
          <div className="section-title">Levers workspace</div>
          <div className="muted">
            {filteredLevers.length} lever(s) shown / {selectedWorkerSummary.lever_count} total
          </div>
        </div>

        <div className="grid grid-3">
          <input
            className="input"
            placeholder="Search levers by name, category, provider, reason..."
            value={leverSearch}
            onChange={(event) => onLeverSearchChange(event.target.value)}
          />

          <select
            className="select"
            value={leverCategoryFilter}
            onChange={(event) => onLeverCategoryFilterChange(event.target.value)}
          >
            <option value="all">All categories</option>
            {leverCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={leverSortMode}
            onChange={(event) =>
              onLeverSortModeChange(event.target.value as LeverSortMode)
            }
          >
            <option value="highlighted">Sort by highlighted / rank</option>
            <option value="most_used">Sort by most used</option>
            <option value="name">Sort by name</option>
          </select>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card-soft stack">
          <div className="section-title">Sessions</div>

          {selectedWorkerSummary.sessions.length === 0 ? (
            <div className="muted">No sessions found.</div>
          ) : (
            <div
              className="stack"
              style={{ gap: 10, maxHeight: "38vh", overflowY: "auto" }}
            >
              {selectedWorkerSummary.sessions.map((session) => (
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

          {selectedWorkerSummary.recommendations.length === 0 ? (
            <div className="muted">No recommendations found.</div>
          ) : (
            <div
              className="stack"
              style={{ gap: 10, maxHeight: "38vh", overflowY: "auto" }}
            >
              {selectedWorkerSummary.recommendations.map((recommendation) => {
                const relatedLevers =
                  relatedLeversByRecommendationId.get(recommendation.id) ?? [];

                return (
                  <div
                    key={recommendation.id}
                    id={`recommendation-${recommendation.id}`}
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

                    {relatedLevers.length > 0 ? (
                      <div className="stack" style={{ gap: 6 }}>
                        <div className="muted">Related levers</div>

                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          {relatedLevers.map((lever) => (
                            <span
                              key={`${recommendation.id}-${lever.id}`}
                              className="badge"
                            >
                              {lever.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card-soft stack">
          <div className="section-title">Artifacts</div>

          {selectedWorkerSummary.artifacts.length === 0 ? (
            <div className="muted">No artifacts found.</div>
          ) : (
            <div
              className="stack"
              style={{ gap: 10, maxHeight: "38vh", overflowY: "auto" }}
            >
              {selectedWorkerSummary.artifacts.map((artifact) => (
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
                    <div style={{ color: "var(--danger)" }}>
                      {artifact.error_message}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-soft stack">
          <div className="section-title">Levers</div>

          {filteredLevers.length === 0 ? (
            <div className="muted">No levers found.</div>
          ) : (
            <div
              className="stack"
              style={{ gap: 10, maxHeight: "38vh", overflowY: "auto" }}
            >
              {filteredLevers.map((lever) => (
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
                    <span className="badge">
                      {lever.is_active ? "active" : "inactive"}
                    </span>
                    <span className="badge">used {lever.usage_count}x</span>

                    {lever.is_highlighted ? (
                      <span className="badge">highlighted</span>
                    ) : null}

                    {lever.is_default ? (
                      <span className="badge">default</span>
                    ) : null}
                  </div>

                  <div className="section-title" style={{ fontSize: 15 }}>
                    {lever.name}
                  </div>

                  <div>{lever.description}</div>

                  <div className="muted">
                    Provider: {lever.provider_type || "—"} • Paid:{" "}
                    {lever.is_paid ? "yes" : "no"}
                  </div>

                  {lever.price_min_eur != null || lever.price_max_eur != null ? (
                    <div className="muted">
                      Price:{" "}
                      {lever.price_min_eur != null && lever.price_max_eur != null
                        ? `€${lever.price_min_eur} - €${lever.price_max_eur}`
                        : lever.price_min_eur != null
                          ? `from €${lever.price_min_eur}`
                          : `up to €${lever.price_max_eur}`}
                    </div>
                  ) : null}

                  {lever.match_reasons.length > 0 ? (
                    <div className="muted">
                      Match reasons: {lever.match_reasons.join(" • ")}
                    </div>
                  ) : null}

                  {lever.recommendation_ids.length > 0 ? (
                    <div className="stack" style={{ gap: 6 }}>
                      <div className="muted">Linked recommendations</div>

                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        {lever.recommendation_ids.map((recommendationId) => (
                          <button
                            key={`${lever.id}-${recommendationId}`}
                            type="button"
                            className="button ghost"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            onClick={() => onScrollToRecommendation(recommendationId)}
                          >
                            Recommendation #{recommendationId}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

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
  );
}