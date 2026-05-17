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
  relatedLeversByRecommendationId: Map<number, AdminOrganizationWorkerSummary["levers"]>;

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

function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
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

function InsightMetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="card-soft stack admin-kpi-card" style={{ gap: 7, minHeight: 108 }}>
      <div className="muted">{label}</div>

      <div
        className="admin-metric-value"
        style={{
          fontSize: typeof value === "number" ? 28 : 18,
          letterSpacing: "-0.04em",
        }}
      >
        {value}
      </div>

      {helper ? <div className="fine-print">{helper}</div> : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div
      className="row space-between"
      style={{
        gap: 12,
        padding: "9px 0",
        borderBottom: "1px solid var(--admin-border)",
        alignItems: "flex-start",
      }}
    >
      <span className="muted" style={{ flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontWeight: 650, textAlign: "right", wordBreak: "break-word" }}>
        {value || "—"}
      </span>
    </div>
  );
}

function ScrollSection({
  title,
  count,
  emptyLabel,
  children,
}: {
  title: string;
  count: number;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-soft stack" style={{ gap: 12, minHeight: 0 }}>
      <div className="row space-between" style={{ gap: 10, alignItems: "center" }}>
        <div className="section-title" style={{ fontSize: 15 }}>
          {title}
        </div>
        <span className="badge">{count}</span>
      </div>

      {count === 0 ? (
        <div className="muted">{emptyLabel}</div>
      ) : (
        <div className="stack scroll-panel" style={{ gap: 10, maxHeight: 430 }}>
          {children}
        </div>
      )}
    </div>
  );
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
    <div className="stack" style={{ gap: 16 }}>
      <div className="card stack" style={{ gap: 16 }}>
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 5 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">
                worker #{selectedWorkerSummary.worker.id}
              </span>
              <span className="badge">{selectedWorkerSummary.worker.subscription_pack}</span>
              {selectedWorkerSummary.worker.business_id ? (
                <span className="badge">{selectedWorkerSummary.worker.business_id}</span>
              ) : null}
            </div>

            <div className="section-title" style={{ fontSize: 20 }}>
              Worker performance workspace
            </div>

            <div className="muted">
              Selected worker: <strong>{selectedWorkerSummary.worker.display_name}</strong>
            </div>
          </div>
        </div>

        <div className="admin-kpi-scroll">
          <div className="admin-kpi-row admin-kpi-row--6">
            <InsightMetricCard
              label="Sessions"
              value={selectedWorkerSummary.session_count}
              helper="AI coach sessions"
            />

            <InsightMetricCard
              label="External conversations"
              value={selectedWorkerSummary.external_conversation_count}
              helper="Manually added material"
            />

            <InsightMetricCard
              label="Recommendations"
              value={selectedWorkerSummary.recommendation_count}
              helper="Generated actions"
            />

            <InsightMetricCard
              label="Artifacts"
              value={selectedWorkerSummary.artifact_count}
              helper="Ebooks, audio or paid assets"
            />

            <InsightMetricCard
              label="Levers"
              value={selectedWorkerSummary.lever_count}
              helper="Matched support resources"
            />

            <InsightMetricCard
              label="Blueprint"
              value={selectedWorkerSummary.career_blueprint ? "Available" : "Not available"}
              helper="Career identity signal"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card stack" style={{ gap: 14 }}>
          <div className="section-title">Worker profile</div>

          <div className="card-soft stack" style={{ gap: 0 }}>
            <DetailRow label="Name" value={selectedWorkerSummary.worker.display_name} />
            <DetailRow label="Email" value={selectedWorkerSummary.worker.email} />
            <DetailRow label="Business ID" value={selectedWorkerSummary.worker.business_id} />
            <DetailRow label="Role" value={selectedWorkerSummary.worker.current_role} />
            <DetailRow label="Industry" value={selectedWorkerSummary.worker.industry} />
            <DetailRow label="Language" value={selectedWorkerSummary.worker.language} />
            <DetailRow label="Subscription" value={selectedWorkerSummary.worker.subscription_pack} />
            <DetailRow label="Subscription paid" value={formatCurrency(subscriptionPaid)} />
            <DetailRow label="Organization share" value={formatCurrency(subscriptionPaid * 0.75)} />
            <DetailRow label="Profession" value={selectedWorkerSummary.worker.profession} />
            <DetailRow label="Location" value={selectedWorkerSummary.worker.location} />
          </div>
        </div>

        <div className="card stack" style={{ gap: 14 }}>
          <div className="section-title">Career blueprint</div>

          {selectedWorkerSummary.career_blueprint ? (
            <div className="card-soft stack" style={{ gap: 0 }}>
              <DetailRow
                label="Identity"
                value={selectedWorkerSummary.career_blueprint.identity_text}
              />
              <DetailRow label="Vision" value={selectedWorkerSummary.career_blueprint.vision_text} />
              <DetailRow
                label="Talent focus"
                value={selectedWorkerSummary.career_blueprint.talent_focus_text}
              />
              <DetailRow
                label="Career focus"
                value={selectedWorkerSummary.career_blueprint.career_focus_text}
              />
              <DetailRow
                label="Inspiration person"
                value={selectedWorkerSummary.career_blueprint.inspiration_person}
              />
              <DetailRow
                label="Aspiration person"
                value={selectedWorkerSummary.career_blueprint.aspiration_person}
              />
            </div>
          ) : (
            <div className="card-soft muted">No career blueprint available.</div>
          )}
        </div>
      </div>

      <div className="card stack" style={{ gap: 14 }}>
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Levers workspace</div>
            <div className="muted">
              Search, filter and review levers connected to the selected worker.
            </div>
          </div>

          <span className="badge">
            {filteredLevers.length} shown / {selectedWorkerSummary.lever_count} total
          </span>
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
            onChange={(event) => onLeverSortModeChange(event.target.value as LeverSortMode)}
          >
            <option value="highlighted">Sort by highlighted / rank</option>
            <option value="most_used">Sort by most used</option>
            <option value="name">Sort by name</option>
          </select>
        </div>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, minmax(260px, 1fr))",
          alignItems: "start",
        }}
      >
        <ScrollSection
          title="Sessions"
          count={selectedWorkerSummary.sessions.length}
          emptyLabel="No sessions found."
        >
          {selectedWorkerSummary.sessions.map((session) => (
            <div
              key={session.session_id}
              className="card"
              style={{
                padding: 14,
                boxShadow: "none",
              }}
            >
              <div className="stack" style={{ gap: 7 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">#{session.session_id}</span>
                  <span className="badge">{session.status}</span>
                </div>

                <div className="muted">{formatDateTime(session.started_at)}</div>

                <div style={{ fontSize: 14, lineHeight: 1.55, wordBreak: "break-word" }}>
                  {session.summary || "No summary available."}
                </div>
              </div>
            </div>
          ))}
        </ScrollSection>

        <ScrollSection
          title="Recommendations"
          count={selectedWorkerSummary.recommendations.length}
          emptyLabel="No recommendations found."
        >
          {selectedWorkerSummary.recommendations.map((recommendation) => {
            const relatedLevers = relatedLeversByRecommendationId.get(recommendation.id) ?? [];

            return (
              <div
                key={recommendation.id}
                id={`recommendation-${recommendation.id}`}
                className="card"
                style={{
                  padding: 14,
                  boxShadow: "none",
                }}
              >
                <div className="stack" style={{ gap: 8 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">#{recommendation.id}</span>
                    <span className="badge">{recommendation.status}</span>
                    <span className="badge">{recommendation.priority}</span>
                  </div>

                  <div className="section-title" style={{ fontSize: 15 }}>
                    {recommendation.title}
                  </div>

                  <div style={{ fontSize: 14, lineHeight: 1.55, wordBreak: "break-word" }}>
                    {recommendation.description}
                  </div>

                  {relatedLevers.length > 0 ? (
                    <div className="stack" style={{ gap: 6 }}>
                      <div className="muted">Related levers</div>

                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        {relatedLevers.map((lever) => (
                          <span key={`${recommendation.id}-${lever.id}`} className="badge">
                            {lever.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </ScrollSection>

        <ScrollSection
          title="Artifacts"
          count={selectedWorkerSummary.artifacts.length}
          emptyLabel="No artifacts found."
        >
          {selectedWorkerSummary.artifacts.map((artifact) => (
            <div
              key={artifact.id}
              className="card"
              style={{
                padding: 14,
                boxShadow: "none",
              }}
            >
              <div className="stack" style={{ gap: 7 }}>
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
                  <div style={{ color: "var(--danger)", fontSize: 13, lineHeight: 1.5 }}>
                    {artifact.error_message}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </ScrollSection>

        <ScrollSection
          title="Levers"
          count={filteredLevers.length}
          emptyLabel="No levers found."
        >
          {filteredLevers.map((lever) => (
            <div
              key={lever.id}
              className="card"
              style={{
                padding: 14,
                boxShadow: "none",
              }}
            >
              <div className="stack" style={{ gap: 8 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">#{lever.id}</span>
                  <span className="badge">{lever.category}</span>
                  <span className="badge">{lever.is_active ? "active" : "inactive"}</span>
                  <span className="badge">used {lever.usage_count}x</span>

                  {lever.is_highlighted ? <span className="badge primary">highlighted</span> : null}
                  {lever.is_default ? <span className="badge">default</span> : null}
                </div>

                <div className="section-title" style={{ fontSize: 15 }}>
                  {lever.name}
                </div>

                <div style={{ fontSize: 14, lineHeight: 1.55, wordBreak: "break-word" }}>
                  {lever.description}
                </div>

                <div className="muted">
                  Provider: {lever.provider_type || "—"} · Paid: {lever.is_paid ? "yes" : "no"}
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
                  <div className="muted" style={{ wordBreak: "break-word" }}>
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
                          style={{ padding: "6px 10px", minHeight: 32, fontSize: 12 }}
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
                    <a href={lever.url} target="_blank" rel="noreferrer" className="link-button">
                      Open lever link
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </ScrollSection>
      </div>
    </div>
  );
}