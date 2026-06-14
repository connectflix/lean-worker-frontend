// frontend/app/admin/experience-ratings/page.tsx
"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  cancelAdminExperienceRatingRequest,
  getAdminExperienceRatings,
  getAdminExperienceRatingSummary,
  getAdminMe,
  sendAdminExperienceRatingEmail,
} from "@/lib/api";
import type {
  AdminMe,
  ExperienceRatingAdminFilters,
  ExperienceRatingAdminItemResponse,
  ExperienceRatingSummaryResponse,
} from "@/lib/types";

type EmailDeliveryInfo = {
  attempted?: boolean;
  success?: boolean;
  reason?: string | null;
  sent_to?: string | null;
  subject?: string | null;
  public_url?: string | null;
  sent_at?: string | null;
  attempted_at?: string | null;
  skipped_at?: string | null;
  error_message?: string | null;
  cooldown_hours?: number | null;
  recent_request_id?: number | null;
  recent_email_sent_at?: string | null;
  marked_as_sent?: boolean;
  marked_at?: string | null;
};

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatScore(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${Number(value).toFixed(2)}/5`;
}

function formatTargetType(value?: string | null): string {
  if (!value) return "Interaction";

  if (value === "conversation") return "Conversation";
  if (value === "session") return "Session";
  if (value === "recommendation") return "Recommendation";
  if (value === "lever") return "Lever";
  if (value === "booking") return "Booking";
  if (value === "artifact") return "AI Artifact";
  if (value === "external_conversation") return "External conversation";
  if (value === "learning_lesson") return "Learning lesson";
  if (value === "learning_course") return "Learning course";

  return value.replaceAll("_", " ");
}

function getStatusLabel(status?: string | null): string {
  if (status === "pending") return "En attente";
  if (status === "completed") return "Complété";
  if (status === "expired") return "Expiré";
  if (status === "cancelled") return "Annulé";

  return status || "—";
}

function getStatusStyle(status?: string | null): CSSProperties {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(15,23,42,0.05)",
    color: "#334155",
  };

  if (status === "completed") {
    return {
      ...base,
      color: "#15803d",
      background: "rgba(34,197,94,0.10)",
      border: "1px solid rgba(34,197,94,0.22)",
    };
  }

  if (status === "pending") {
    return {
      ...base,
      color: "#2563eb",
      background: "rgba(37,99,235,0.10)",
      border: "1px solid rgba(37,99,235,0.22)",
    };
  }

  if (status === "expired") {
    return {
      ...base,
      color: "#b45309",
      background: "rgba(251,191,36,0.12)",
      border: "1px solid rgba(251,191,36,0.26)",
    };
  }

  if (status === "cancelled") {
    return {
      ...base,
      color: "#dc2626",
      background: "rgba(239,68,68,0.10)",
      border: "1px solid rgba(239,68,68,0.22)",
    };
  }

  return base;
}

function getMetadataRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getEmailDeliveryInfo(item: ExperienceRatingAdminItemResponse): EmailDeliveryInfo | null {
  const metadata = getMetadataRecord(item.request.metadata_json);
  const rawDelivery = metadata.email_delivery;

  if (!rawDelivery || typeof rawDelivery !== "object" || Array.isArray(rawDelivery)) {
    return null;
  }

  return rawDelivery as EmailDeliveryInfo;
}

function getEmailDeliveryReasonLabel(reason?: string | null): string {
  if (reason === "missing_worker_email") return "Email Worker manquant";
  if (reason === "skipped_recent_email_sent") return "Cooldown 24h appliqué";

  return reason || "Non précisé";
}

function getEmailStatusLabel(item: ExperienceRatingAdminItemResponse): string {
  const request = item.request;
  const delivery = getEmailDeliveryInfo(item);

  if (!request.worker_email) return "Email manquant";
  if (request.email_sent_to || delivery?.success === true) return "Email envoyé";
  if (delivery?.reason === "skipped_recent_email_sent") return "Cooldown email";
  if (delivery?.attempted === true && delivery?.success === false) return "Erreur email";

  return "Email non envoyé";
}

function getEmailStatusStyle(item: ExperienceRatingAdminItemResponse): CSSProperties {
  const request = item.request;
  const delivery = getEmailDeliveryInfo(item);

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(15,23,42,0.05)",
    color: "#334155",
  };

  if (!request.worker_email || delivery?.reason === "missing_worker_email") {
    return {
      ...base,
      color: "#b45309",
      background: "rgba(251,191,36,0.12)",
      border: "1px solid rgba(251,191,36,0.26)",
    };
  }

  if (request.email_sent_to || delivery?.success === true) {
    return {
      ...base,
      color: "#15803d",
      background: "rgba(34,197,94,0.10)",
      border: "1px solid rgba(34,197,94,0.22)",
    };
  }

  if (delivery?.reason === "skipped_recent_email_sent") {
    return {
      ...base,
      color: "#7c3aed",
      background: "rgba(124,58,237,0.10)",
      border: "1px solid rgba(124,58,237,0.22)",
    };
  }

  if (delivery?.attempted === true && delivery?.success === false) {
    return {
      ...base,
      color: "#dc2626",
      background: "rgba(239,68,68,0.10)",
      border: "1px solid rgba(239,68,68,0.22)",
    };
  }

  return {
    ...base,
    color: "#2563eb",
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.22)",
  };
}

function EmailDeliveryDetailBlock({ item }: { item: ExperienceRatingAdminItemResponse }) {
  const request = item.request;
  const delivery = getEmailDeliveryInfo(item);

  if (!delivery && !request.worker_email && !request.email_sent_to) {
    return (
      <div
        className="card-soft"
        style={{
          border: "1px solid rgba(251,191,36,0.26)",
          background: "rgba(251,191,36,0.10)",
          color: "#92400e",
        }}
      >
        Aucun email Worker n’est disponible pour cette demande. L’email ne peut pas être envoyé
        automatiquement.
      </div>
    );
  }

  if (!delivery && request.email_sent_to) {
    return (
      <div
        className="card-soft stack"
        style={{
          gap: 8,
          border: "1px solid rgba(34,197,94,0.18)",
          background: "rgba(34,197,94,0.07)",
        }}
      >
        <strong>Email delivery</strong>
        <div className="muted" style={{ lineHeight: 1.55 }}>
          Email envoyé à <strong>{request.email_sent_to}</strong>
          {request.email_sent_at ? ` le ${formatDate(request.email_sent_at)}` : ""}.
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="card-soft stack" style={{ gap: 8 }}>
        <strong>Email delivery</strong>
        <div className="muted" style={{ lineHeight: 1.55 }}>
          Aucun statut détaillé d’envoi email n’est encore disponible.
        </div>
      </div>
    );
  }

  const isSuccess = delivery.success === true || Boolean(request.email_sent_to);
  const isSkipped = delivery.reason === "skipped_recent_email_sent";
  const isMissingEmail = delivery.reason === "missing_worker_email" || !request.worker_email;
  const isError = delivery.attempted === true && delivery.success === false && !isSkipped;

  let border = "1px solid rgba(15,23,42,0.08)";
  let background = "rgba(255,255,255,0.80)";
  let color = "#334155";
  let title = "Email delivery";

  if (isSuccess) {
    border = "1px solid rgba(34,197,94,0.18)";
    background = "rgba(34,197,94,0.07)";
    color = "#15803d";
    title = "Email envoyé";
  } else if (isSkipped) {
    border = "1px solid rgba(124,58,237,0.22)";
    background = "rgba(124,58,237,0.08)";
    color = "#6d28d9";
    title = "Email non envoyé automatiquement";
  } else if (isMissingEmail) {
    border = "1px solid rgba(251,191,36,0.26)";
    background = "rgba(251,191,36,0.10)";
    color = "#92400e";
    title = "Email Worker manquant";
  } else if (isError) {
    border = "1px solid rgba(239,68,68,0.22)";
    background = "rgba(239,68,68,0.08)";
    color = "#dc2626";
    title = "Erreur d’envoi email";
  }

  return (
    <div
      className="card-soft stack"
      style={{
        gap: 10,
        border,
        background,
        color,
      }}
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <strong>{title}</strong>
        <span style={getEmailStatusStyle(item)}>{getEmailStatusLabel(item)}</span>
      </div>

      {isSuccess ? (
        <div style={{ lineHeight: 1.6 }}>
          Email envoyé à <strong>{request.email_sent_to || delivery.sent_to || "—"}</strong>
          {(request.email_sent_at || delivery.sent_at)
            ? ` le ${formatDate(request.email_sent_at || delivery.sent_at)}`
            : ""}.
        </div>
      ) : null}

      {isSkipped ? (
        <div style={{ lineHeight: 1.6 }}>
          La demande a été créée, mais l’email automatique a été sauté car un email de rating a
          déjà été envoyé récemment à ce Worker.
          {delivery.cooldown_hours ? ` Cooldown appliqué : ${delivery.cooldown_hours}h.` : ""}
          {delivery.recent_email_sent_at
            ? ` Dernier email envoyé le ${formatDate(delivery.recent_email_sent_at)}.`
            : ""}
        </div>
      ) : null}

      {isMissingEmail ? (
        <div style={{ lineHeight: 1.6 }}>
          Aucun email Worker n’est disponible pour cette demande. L’email ne peut pas être envoyé
          automatiquement.
        </div>
      ) : null}

      {isError ? (
        <div style={{ lineHeight: 1.6 }}>
          L’envoi SMTP a échoué.
          {delivery.error_message ? (
            <>
              {" "}
              Détail : <strong>{delivery.error_message}</strong>
            </>
          ) : null}
        </div>
      ) : null}

      <div
        className="grid grid-4"
        style={{
          gap: 10,
          color: "#334155",
        }}
      >
        <div className="card-soft">
          <div className="muted" style={{ fontSize: 12 }}>
            Attempted
          </div>
          <strong>{delivery.attempted === true ? "Oui" : "Non"}</strong>
        </div>

        <div className="card-soft">
          <div className="muted" style={{ fontSize: 12 }}>
            Success
          </div>
          <strong>{delivery.success === true ? "Oui" : "Non"}</strong>
        </div>

        <div className="card-soft">
          <div className="muted" style={{ fontSize: 12 }}>
            Reason
          </div>
          <strong>{getEmailDeliveryReasonLabel(delivery.reason)}</strong>
        </div>

        <div className="card-soft">
          <div className="muted" style={{ fontSize: 12 }}>
            Last event
          </div>
          <strong>
            {formatDate(
              request.email_sent_at ||
                delivery.sent_at ||
                delivery.attempted_at ||
                delivery.skipped_at ||
                delivery.marked_at,
            )}
          </strong>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div
      className="card-soft stack"
      style={{
        gap: 7,
        border: "1px solid rgba(37,99,235,0.10)",
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(255,255,255,0.94))",
      }}
    >
      <div className="muted" style={{ fontSize: 13 }}>
        {label}
      </div>

      <div
        style={{
          fontSize: 30,
          lineHeight: 1,
          fontWeight: 950,
          letterSpacing: "-0.06em",
          color: "#0f172a",
        }}
      >
        {value}
      </div>

      {helper ? (
        <div className="muted" style={{ fontSize: 12, lineHeight: 1.45 }}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}

function RatingDetailBlock({ item }: { item: ExperienceRatingAdminItemResponse }) {
  const rating = item.rating;

  if (!rating) {
    return (
      <div className="card-soft">
        <div className="muted" style={{ lineHeight: 1.6 }}>
          Aucun retour n’a encore été soumis par le Worker.
        </div>
      </div>
    );
  }

  return (
    <div
      className="card-soft stack"
      style={{
        gap: 12,
        border: "1px solid rgba(34,197,94,0.18)",
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.07), rgba(255,255,255,0.94))",
      }}
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span className="badge">Score global : {formatScore(rating.overall_score)}</span>
        <span className="badge">Soumis le {formatDate(rating.submitted_at)}</span>
      </div>

      <div className="grid grid-3">
        <div className="card-soft stack" style={{ gap: 7 }}>
          <strong>Qualité de l’interlocuteur</strong>
          <div className="admin-metric-value" style={{ fontSize: 24 }}>
            {rating.interlocutor_quality_rating}/5
          </div>
          <div className="muted" style={{ lineHeight: 1.55 }}>
            {rating.interlocutor_quality_comment || "Aucun commentaire."}
          </div>
        </div>

        <div className="card-soft stack" style={{ gap: 7 }}>
          <strong>Qualité du contenu échangé</strong>
          <div className="admin-metric-value" style={{ fontSize: 24 }}>
            {rating.content_quality_rating}/5
          </div>
          <div className="muted" style={{ lineHeight: 1.55 }}>
            {rating.content_quality_comment || "Aucun commentaire."}
          </div>
        </div>

        <div className="card-soft stack" style={{ gap: 7 }}>
          <strong>Qualité du service mis en place</strong>
          <div className="admin-metric-value" style={{ fontSize: 24 }}>
            {rating.service_quality_rating}/5
          </div>
          <div className="muted" style={{ lineHeight: 1.55 }}>
            {rating.service_quality_comment || "Aucun commentaire."}
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingItemCard({
  item,
  onCancel,
  onSendEmail,
  cancellingId,
  sendingEmailId,
}: {
  item: ExperienceRatingAdminItemResponse;
  onCancel: (requestId: number) => Promise<void>;
  onSendEmail: (requestId: number) => Promise<void>;
  cancellingId: number | null;
  sendingEmailId: number | null;
}) {
  const request = item.request;
  const rating = item.rating;

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/rating/${request.rating_token}`
      : `/rating/${request.rating_token}`;

  const canCancel = request.status === "pending";
  const canSendEmail = request.status === "pending" && Boolean(request.worker_email);
  const isCancelling = cancellingId === request.id;
  const isSendingEmail = sendingEmailId === request.id;

  return (
    <article className="card stack" style={{ gap: 14 }}>
      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 6, minWidth: 0 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span style={getStatusStyle(request.status)}>{getStatusLabel(request.status)}</span>
            <span className="badge">{formatTargetType(request.target_type)}</span>
            <span style={getEmailStatusStyle(item)}>{getEmailStatusLabel(item)}</span>
            {rating ? <span className="badge">Score {formatScore(rating.overall_score)}</span> : null}
          </div>

          <div
            className="section-title"
            style={{
              fontSize: 20,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 780,
            }}
            title={request.target_title || undefined}
          >
            {request.target_title || "Interaction LeanWorker"}
          </div>

          <div className="muted" style={{ lineHeight: 1.55 }}>
            Worker : <strong>{request.worker_name || "—"}</strong>
            {request.worker_email ? ` · ${request.worker_email}` : ""}
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <a
            className="button ghost"
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            style={{ minHeight: 38 }}
          >
            Ouvrir le formulaire
          </a>

          {canSendEmail ? (
            <button
              className="button"
              type="button"
              disabled={isSendingEmail}
              onClick={() => void onSendEmail(request.id)}
              style={{
                minHeight: 38,
                borderRadius: 999,
                background: "linear-gradient(135deg, #2563eb, #10b981)",
                color: "#ffffff",
                border: "1px solid rgba(37,99,235,0.22)",
              }}
            >
              {isSendingEmail
                ? "Envoi..."
                : request.email_sent_to
                  ? "Renvoyer l’email"
                  : "Envoyer l’email"}
            </button>
          ) : null}

          {canCancel ? (
            <button
              className="button ghost"
              type="button"
              disabled={isCancelling}
              onClick={() => void onCancel(request.id)}
              style={{
                minHeight: 38,
                color: "var(--danger)",
                borderColor: "rgba(239,68,68,0.24)",
              }}
            >
              {isCancelling ? "Annulation..." : "Annuler"}
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="grid grid-4"
        style={{
          gap: 10,
        }}
      >
        <div className="card-soft">
          <div className="muted" style={{ fontSize: 12 }}>
            Créée le
          </div>
          <strong>{formatDate(request.created_at)}</strong>
        </div>

        <div className="card-soft">
          <div className="muted" style={{ fontSize: 12 }}>
            Expire le
          </div>
          <strong>{formatDate(request.expires_at)}</strong>
        </div>

        <div className="card-soft">
          <div className="muted" style={{ fontSize: 12 }}>
            Email envoyé à
          </div>
          <strong>{request.email_sent_to || "—"}</strong>
          {request.email_sent_at ? (
            <div className="muted" style={{ marginTop: 5, fontSize: 12 }}>
              {formatDate(request.email_sent_at)}
            </div>
          ) : null}
        </div>

        <div className="card-soft">
          <div className="muted" style={{ fontSize: 12 }}>
            Source
          </div>
          <strong>{request.source || "—"}</strong>
        </div>
      </div>

      <EmailDeliveryDetailBlock item={item} />

      {request.target_description ? (
        <div className="card-soft">
          <strong>Description de l’interaction</strong>
          <div className="muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
            {request.target_description}
          </div>
        </div>
      ) : null}

      <RatingDetailBlock item={item} />
    </article>
  );
}

function AdminExperienceRatingsContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<ExperienceRatingSummaryResponse | null>(null);
  const [items, setItems] = useState<ExperienceRatingAdminItemResponse[]>([]);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filters = useMemo<ExperienceRatingAdminFilters>(() => {
    return {
      status: statusFilter || undefined,
      target_type: targetTypeFilter || undefined,
      limit: 100,
      offset: 0,
    };
  }, [statusFilter, targetTypeFilter]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [me, summaryResponse, listResponse] = await Promise.all([
        getAdminMe(),
        getAdminExperienceRatingSummary(),
        getAdminExperienceRatings(filters),
      ]);

      setAdmin(me);
      setSummary(summaryResponse);
      setItems(listResponse.items);
      setTotal(listResponse.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les évaluations d’expérience.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(requestId: number) {
    setCancellingId(requestId);
    setError(null);
    setSuccessMessage(null);

    try {
      await cancelAdminExperienceRatingRequest(requestId);
      setSuccessMessage("La demande d’évaluation a été annulée.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d’annuler cette demande d’évaluation.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  async function handleSendEmail(requestId: number) {
    setSendingEmailId(requestId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await sendAdminExperienceRatingEmail(requestId);

      if (response.email_sent_to) {
        setSuccessMessage(`Email envoyé à ${response.email_sent_to}.`);
      } else {
        setSuccessMessage(
          "La demande a été mise à jour, mais l’email n’a pas été confirmé comme envoyé.",
        );
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d’envoyer l’email d’évaluation.",
      );
    } finally {
      setSendingEmailId(null);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <AdminShell
      activeHref="/admin/experience-ratings"
      title="Experience Ratings"
      subtitle="Measure perceived quality after conversations, sessions, recommendations and lever interactions."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      <div className="stack" style={{ gap: 18 }}>
        <section
          className="card stack"
          style={{
            gap: 16,
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(37,99,235,0.18)",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,64,175,0.92))",
            color: "#ffffff",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -100,
              top: -120,
              width: 300,
              height: 300,
              borderRadius: 999,
              background: "rgba(34,197,94,0.20)",
            }}
          />

          <span
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              borderRadius: 999,
              padding: "8px 12px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              position: "relative",
            }}
          >
            Worker Experience Quality
          </span>

          <h1
            style={{
              margin: 0,
              maxWidth: 900,
              fontSize: 42,
              lineHeight: 1.04,
              fontWeight: 950,
              letterSpacing: "-0.065em",
              position: "relative",
            }}
          >
            Mesurez la qualité perçue par les Workers après chaque interaction clé.
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 900,
              color: "rgba(255,255,255,0.74)",
              lineHeight: 1.75,
              position: "relative",
            }}
          >
            Chaque évaluation permet de comprendre la qualité de l’interlocuteur, du contenu échangé
            et du service mis en place.
          </p>
        </section>

        {error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div
            className="card-soft"
            style={{
              color: "#15803d",
              border: "1px solid rgba(34,197,94,0.22)",
              background: "rgba(34,197,94,0.08)",
            }}
          >
            {successMessage}
          </div>
        ) : null}

        <section className="grid grid-4">
          <MetricCard
            label="Demandes totales"
            value={summary?.total_requests ?? 0}
            helper={`${total} élément(s) affiché(s)`}
          />
          <MetricCard
            label="Complétées"
            value={summary?.completed_requests ?? 0}
            helper={`Score moyen : ${formatScore(summary?.average_overall_score)}`}
          />
          <MetricCard
            label="En attente"
            value={summary?.pending_requests ?? 0}
            helper="Formulaires non encore soumis"
          />
          <MetricCard
            label="Qualité du service"
            value={formatScore(summary?.average_service_quality_rating)}
            helper="Moyenne service perçue"
          />
        </section>

        <section className="card stack" style={{ gap: 14 }}>
          <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
            <div className="stack" style={{ gap: 5 }}>
              <div className="section-title">Filtres</div>
              <div className="muted">
                Filtrez les demandes d’évaluation par statut et type d’interaction.
              </div>
            </div>

            <button className="button ghost" type="button" onClick={() => void loadData()}>
              Rafraîchir
            </button>
          </div>

          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <label className="stack" style={{ gap: 6, minWidth: 220 }}>
              <span className="muted" style={{ fontSize: 13 }}>
                Statut
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{
                  minHeight: 42,
                  borderRadius: 14,
                  border: "1px solid rgba(15,23,42,0.12)",
                  padding: "0 12px",
                  font: "inherit",
                  background: "#ffffff",
                }}
              >
                <option value="">Tous</option>
                <option value="pending">En attente</option>
                <option value="completed">Complété</option>
                <option value="expired">Expiré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </label>

            <label className="stack" style={{ gap: 6, minWidth: 240 }}>
              <span className="muted" style={{ fontSize: 13 }}>
                Type d’interaction
              </span>
              <select
                value={targetTypeFilter}
                onChange={(event) => setTargetTypeFilter(event.target.value)}
                style={{
                  minHeight: 42,
                  borderRadius: 14,
                  border: "1px solid rgba(15,23,42,0.12)",
                  padding: "0 12px",
                  font: "inherit",
                  background: "#ffffff",
                }}
              >
                <option value="">Tous</option>
                <option value="conversation">Conversation</option>
                <option value="session">Session</option>
                <option value="recommendation">Recommendation</option>
                <option value="lever">Lever</option>
                <option value="booking">Booking</option>
                <option value="artifact">AI Artifact</option>
                <option value="external_conversation">External conversation</option>
                <option value="learning_lesson">Learning lesson</option>
                <option value="learning_course">Learning course</option>
              </select>
            </label>
          </div>
        </section>

        {loading ? (
          <div className="card-soft">Chargement des évaluations...</div>
        ) : items.length === 0 ? (
          <div className="card-soft">
            Aucune évaluation d’expérience trouvée pour ces filtres.
          </div>
        ) : (
          <div className="stack" style={{ gap: 14 }}>
            {items.map((item) => (
              <RatingItemCard
                key={item.request.id}
                item={item}
                cancellingId={cancellingId}
                sendingEmailId={sendingEmailId}
                onCancel={handleCancel}
                onSendEmail={handleSendEmail}
              />
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export default function AdminExperienceRatingsPage() {
  return (
    <AdminGuard>
      <AdminExperienceRatingsContent />
    </AdminGuard>
  );
}