// frontend/app/rating/[token]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useUiLanguage } from "@/lib/use-ui-language";
import {
  getPublicExperienceRatingForm,
  submitPublicExperienceRatingForm,
} from "@/lib/api";
import type {
  ExperienceRatingQuestionResponse,
  ExperienceRatingScaleOptionResponse,
  ExperienceRatingSubmitRequest,
  PublicExperienceRatingFormResponse,
} from "@/lib/types";

type RatingFormState = {
  interlocutor_quality_rating: number | null;
  interlocutor_quality_comment: string;
  content_quality_rating: number | null;
  content_quality_comment: string;
  service_quality_rating: number | null;
  service_quality_comment: string;
};

const DEFAULT_FORM_STATE: RatingFormState = {
  interlocutor_quality_rating: null,
  interlocutor_quality_comment: "",
  content_quality_rating: null,
  content_quality_comment: "",
  service_quality_rating: null,
  service_quality_comment: "",
};

function getQuestionFieldNames(key: string): {
  ratingField: keyof RatingFormState;
  commentField: keyof RatingFormState;
} | null {
  if (key === "interlocutor_quality") {
    return {
      ratingField: "interlocutor_quality_rating",
      commentField: "interlocutor_quality_comment",
    };
  }

  if (key === "content_quality") {
    return {
      ratingField: "content_quality_rating",
      commentField: "content_quality_comment",
    };
  }

  if (key === "service_quality") {
    return {
      ratingField: "service_quality_rating",
      commentField: "service_quality_comment",
    };
  }

  return null;
}

function formatTargetType(
  value: string | null | undefined,
  uiLanguage: "fr" | "en",
): string {
  const labels: Record<string, { fr: string; en: string }> = {
    interaction: { fr: "Interaction", en: "Interaction" },
    conversation: { fr: "Conversation", en: "Conversation" },
    session: { fr: "Session", en: "Session" },
    recommendation: { fr: "Recommandation", en: "Recommendation" },
    lever: { fr: "Levier", en: "Lever" },
    booking: { fr: "Rendez-vous", en: "Appointment" },
    artifact: { fr: "Contenu personnalisé", en: "Personalized content" },
    external_conversation: {
      fr: "Conversation externe",
      en: "External conversation",
    },
  };

  const key = value || "interaction";
  return labels[key]?.[uiLanguage] ?? key.replaceAll("_", " ");
}

function RatingOptionButton({
  option,
  selected,
  onClick,
}: {
  option: ExperienceRatingScaleOptionResponse;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 54,
        borderRadius: 16,
        border: selected
          ? "1px solid rgba(37,99,235,0.42)"
          : "1px solid rgba(15,23,42,0.10)",
        background: selected
          ? "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.08))"
          : "rgba(255,255,255,0.82)",
        color: selected ? "#1d4ed8" : "#334155",
        cursor: "pointer",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        boxShadow: selected ? "0 12px 28px rgba(37,99,235,0.10)" : "none",
        font: "inherit",
      }}
    >
      <strong style={{ fontSize: 20, lineHeight: 1 }}>{option.value}</strong>
      <span style={{ fontSize: 12, fontWeight: 800 }}>{option.label}</span>
    </button>
  );
}

function RatingQuestionCard({
  index,
  question,
  scaleOptions,
  form,
  setForm,
  uiLanguage,
}: {
  index: number;
  question: ExperienceRatingQuestionResponse;
  scaleOptions: ExperienceRatingScaleOptionResponse[];
  form: RatingFormState;
  setForm: React.Dispatch<React.SetStateAction<RatingFormState>>;
  uiLanguage: "fr" | "en";
}) {
  const fieldNames = getQuestionFieldNames(question.key);
  const selectedRating = fieldNames ? form[fieldNames.ratingField] : null;
  const commentValue = fieldNames ? String(form[fieldNames.commentField] ?? "") : "";

  if (!fieldNames) return null;

  return (
    <section
      className="stack"
      style={{
        gap: 14,
        padding: "clamp(16px, 3vw, 20px)",
        borderRadius: 24,
        border: "1px solid rgba(15,23,42,0.08)",
        background: "rgba(255,255,255,0.84)",
        boxShadow: "0 18px 44px rgba(15,23,42,0.06)",
      }}
    >
      <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "rgba(37,99,235,0.10)",
            color: "#2563eb",
            fontWeight: 950,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>

        <div className="stack" style={{ gap: 4 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 21,
              lineHeight: 1.18,
              letterSpacing: "-0.045em",
              color: "#0f172a",
            }}
          >
            {question.label}
          </h2>

          <div style={{ color: "#64748b", lineHeight: 1.55 }}>
            {uiLanguage === "fr"
              ? "Choisissez une note de 1 à 5. Le commentaire est optionnel."
              : "Choose a rating from 1 to 5. The comment is optional."}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 10,
        }}
      >
        {scaleOptions.map((option) => (
          <RatingOptionButton
            key={option.value}
            option={option}
            selected={selectedRating === option.value}
            onClick={() =>
              setForm((current) => ({
                ...current,
                [fieldNames.ratingField]: option.value,
              }))
            }
          />
        ))}
      </div>

      <label className="stack" style={{ gap: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 850, color: "#334155" }}>
          {uiLanguage === "fr" ? "Commentaire" : "Comment"}
        </span>

        <textarea
          value={commentValue}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              [fieldNames.commentField]: event.target.value,
            }))
          }
          rows={4}
          placeholder={uiLanguage === "fr" ? "Ajoutez un commentaire..." : "Add a comment..."}
          style={{
            width: "100%",
            resize: "vertical",
            borderRadius: 18,
            border: "1px solid rgba(15,23,42,0.12)",
            padding: 14,
            font: "inherit",
            lineHeight: 1.55,
            outline: "none",
            background: "rgba(248,250,252,0.82)",
            color: "#0f172a",
          }}
        />
      </label>
    </section>
  );
}

function buildSubmitPayload(form: RatingFormState): ExperienceRatingSubmitRequest {
  return {
    interlocutor_quality_rating: Number(form.interlocutor_quality_rating),
    interlocutor_quality_comment: form.interlocutor_quality_comment.trim() || null,

    content_quality_rating: Number(form.content_quality_rating),
    content_quality_comment: form.content_quality_comment.trim() || null,

    service_quality_rating: Number(form.service_quality_rating),
    service_quality_comment: form.service_quality_comment.trim() || null,

    metadata_json: {
      source: "public_rating_form",
      submitted_from: "frontend",
    },
  };
}

function isFormComplete(form: RatingFormState): boolean {
  return (
    Number(form.interlocutor_quality_rating) >= 1 &&
    Number(form.content_quality_rating) >= 1 &&
    Number(form.service_quality_rating) >= 1
  );
}

function RatingExpiredOrCompleted({
  formData,
  uiLanguage,
}: {
  formData: PublicExperienceRatingFormResponse;
  uiLanguage: "fr" | "en";
}) {
  const isCompleted = formData.status === "completed";

  return (
    <section
      className="stack"
      style={{
        gap: 14,
        padding: 28,
        borderRadius: 32,
        background: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 22px 60px rgba(15,23,42,0.08)",
        textAlign: "center",
        alignItems: "center",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          borderRadius: 999,
          padding: "8px 12px",
          background: isCompleted ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
          color: isCompleted ? "#16a34a" : "#dc2626",
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {isCompleted
          ? uiLanguage === "fr"
            ? "Évaluation déjà envoyée"
            : "Rating already submitted"
          : uiLanguage === "fr"
            ? "Lien non disponible"
            : "Link unavailable"}
      </span>

      <h1
        style={{
          margin: 0,
          fontSize: 34,
          lineHeight: 1.05,
          letterSpacing: "-0.06em",
          color: "#0f172a",
        }}
      >
        {isCompleted
          ? uiLanguage === "fr"
            ? "Merci, votre retour a déjà été enregistré."
            : "Thank you, your feedback has already been recorded."
          : uiLanguage === "fr"
            ? "Cette demande d’évaluation n’est plus active."
            : "This rating request is no longer active."}
      </h1>

      <p style={{ maxWidth: 680, margin: 0, lineHeight: 1.7, color: "#64748b" }}>
        {isCompleted
          ? uiLanguage === "fr"
            ? "Votre retour contribue à améliorer l’expérience LeanWorker."
            : "Your feedback helps improve the LeanWorker experience."
          : uiLanguage === "fr"
            ? "Le lien a peut-être expiré, été annulé ou déjà clôturé."
            : "The link may have expired, been cancelled, or already been closed."}
      </p>
    </section>
  );
}

export default function PublicExperienceRatingPage() {
  const params = useParams();
  const { uiLanguage } = useUiLanguage("fr");

  const ratingToken = useMemo(() => {
    const raw = params?.token;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value || "";
  }, [params]);

  const [formData, setFormData] = useState<PublicExperienceRatingFormResponse | null>(null);
  const [form, setForm] = useState<RatingFormState>(DEFAULT_FORM_STATE);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = useMemo(
    () =>
      uiLanguage === "fr"
        ? {
            badge: "Évaluation LeanWorker",
            heroTitle: "Votre retour nous aide à améliorer LeanWorker.",
            heroBody:
              "Trois questions rapides pour évaluer la qualité de l’échange, du contenu et du service.",
            invalidLink: "Lien d’évaluation invalide.",
            loadError: "Impossible de charger le formulaire d’évaluation.",
            incompleteForm:
              "Merci de répondre aux trois questions avant d’envoyer votre évaluation.",
            submitError: "Impossible d’envoyer votre évaluation.",
            loading: "Chargement du formulaire...",
            submittedBadge: "Évaluation envoyée",
            submittedTitle: "Merci pour votre retour.",
            overallScore: "Score global",
            greeting: (name: string) => `Bonjour ${name},`,
            intro: "Merci d’évaluer votre expérience récente avec LeanWorker.",
            footerHint:
              "Les commentaires sont optionnels. Les trois notes sont obligatoires.",
            submitting: "Envoi en cours...",
            submit: "Envoyer mon évaluation",
          }
        : {
            badge: "LeanWorker rating",
            heroTitle: "Your feedback helps us improve LeanWorker.",
            heroBody:
              "Three quick questions to rate the quality of the interaction, content, and service.",
            invalidLink: "Invalid rating link.",
            loadError: "Unable to load the rating form.",
            incompleteForm:
              "Please answer all three questions before submitting your rating.",
            submitError: "Unable to submit your rating.",
            loading: "Loading the rating form...",
            submittedBadge: "Rating submitted",
            submittedTitle: "Thank you for your feedback.",
            overallScore: "Overall score",
            greeting: (name: string) => `Hello ${name},`,
            intro: "Please rate your recent experience with LeanWorker.",
            footerHint: "Comments are optional. All three ratings are required.",
            submitting: "Submitting...",
            submit: "Submit my rating",
          },
    [uiLanguage],
  );

  async function loadForm() {
    if (!ratingToken) {
      setError(copy.invalidLink);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getPublicExperienceRatingForm(ratingToken);
      setFormData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : copy.loadError,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingToken]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormComplete(form)) {
      setError(copy.incompleteForm);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await submitPublicExperienceRatingForm(
        ratingToken,
        buildSubmitPayload(form),
      );

      setSubmittedMessage(result.message);
      setSubmittedScore(result.overall_score);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : copy.submitError,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      lang={uiLanguage}
      translate="no"
      suppressHydrationWarning
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 32%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "clamp(14px, 3vw, 24px)",
      }}
    >
      <div
        className="stack"
        style={{
          gap: 16,
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <section
          className="stack"
          style={{
            gap: 16,
            position: "relative",
            overflow: "hidden",
            padding: "clamp(22px, 4vw, 28px)",
            borderRadius: 24,
            background:
              "linear-gradient(135deg, rgba(43,33,24,0.97), rgba(88,180,174,0.90))",
            color: "#ffffff",
            boxShadow: "0 26px 70px rgba(15,23,42,0.18)",
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
              background: "rgba(34,197,94,0.22)",
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
            LeanWorker Experience Rating
          </span>

          <h1
            style={{
              margin: 0,
              maxWidth: 840,
              fontSize: "clamp(34px, 5vw, 42px)",
              lineHeight: 1.04,
              fontWeight: 950,
              letterSpacing: "-0.065em",
              position: "relative",
            }}
          >
            {copy.heroTitle}
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 780,
              color: "rgba(255,255,255,0.74)",
              lineHeight: 1.75,
              position: "relative",
            }}
          >
            {copy.heroBody}
          </p>
        </section>

        {loading ? (
          <section
            style={{
              padding: 22,
              borderRadius: 28,
              background: "rgba(255,255,255,0.86)",
              border: "1px solid rgba(15,23,42,0.08)",
              color: "#334155",
            }}
          >
            {copy.loading}
          </section>
        ) : error && !formData ? (
          <section
            style={{
              padding: 22,
              borderRadius: 28,
              background: "rgba(255,255,255,0.86)",
              border: "1px solid rgba(239,68,68,0.20)",
              color: "#dc2626",
            }}
          >
            {error}
          </section>
        ) : submittedMessage ? (
          <section
            className="stack"
            style={{
              gap: 14,
              padding: 28,
              borderRadius: 32,
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(255,255,255,0.92))",
              border: "1px solid rgba(34,197,94,0.22)",
              boxShadow: "0 22px 60px rgba(15,23,42,0.08)",
              textAlign: "center",
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                borderRadius: 999,
                padding: "8px 12px",
                background: "rgba(34,197,94,0.12)",
                color: "#16a34a",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {copy.submittedBadge}
            </span>

            <h2
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.05,
                letterSpacing: "-0.06em",
                color: "#0f172a",
              }}
            >
              {copy.submittedTitle}
            </h2>

            <p style={{ maxWidth: 680, margin: 0, lineHeight: 1.7, color: "#64748b" }}>
              {submittedMessage}
            </p>

            {submittedScore !== null ? (
              <div
                style={{
                  marginTop: 4,
                  padding: "12px 16px",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.76)",
                  border: "1px solid rgba(15,23,42,0.08)",
                  color: "#0f172a",
                  fontWeight: 900,
                }}
              >
                {copy.overallScore}: {submittedScore}/5
              </div>
            ) : null}
          </section>
        ) : formData && !formData.is_submittable ? (
          <RatingExpiredOrCompleted formData={formData} uiLanguage={uiLanguage} />
        ) : formData ? (
          <form className="stack" style={{ gap: 18 }} onSubmit={handleSubmit}>
            <section
              className="stack"
              style={{
                gap: 10,
                padding: 20,
                borderRadius: 28,
                border: "1px solid rgba(15,23,42,0.08)",
                background: "rgba(255,255,255,0.86)",
                boxShadow: "0 18px 44px rgba(15,23,42,0.06)",
              }}
            >
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-flex",
                    borderRadius: 999,
                    padding: "7px 10px",
                    background: "rgba(37,99,235,0.10)",
                    color: "#2563eb",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {formatTargetType(formData.target_type, uiLanguage)}
                </span>

                {formData.target_title ? (
                  <span
                    style={{
                      display: "inline-flex",
                      borderRadius: 999,
                      padding: "7px 10px",
                      background: "rgba(15,23,42,0.05)",
                      color: "#334155",
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {formData.target_title}
                  </span>
                ) : null}
              </div>

              {formData.worker_name ? (
                <div style={{ color: "#0f172a", fontSize: 20, fontWeight: 900 }}>
                  {copy.greeting(formData.worker_name)}
                </div>
              ) : null}

              <div style={{ color: "#64748b", lineHeight: 1.65 }}>
                {copy.intro}
              </div>
            </section>

            {formData.questions.map((question, index) => (
              <RatingQuestionCard
                key={question.key}
                index={index}
                question={question}
                scaleOptions={formData.scale_options}
                form={form}
                setForm={setForm}
                uiLanguage={uiLanguage}
              />
            ))}

            {error ? (
              <section
                style={{
                  padding: 16,
                  borderRadius: 22,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.20)",
                  color: "#dc2626",
                  fontWeight: 800,
                }}
              >
                {error}
              </section>
            ) : null}

            <section
              className="row space-between"
              style={{
                gap: 12,
                flexWrap: "wrap",
                padding: 18,
                borderRadius: 28,
                background: "rgba(255,255,255,0.86)",
                border: "1px solid rgba(15,23,42,0.08)",
                boxShadow: "0 18px 44px rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ color: "#64748b", lineHeight: 1.55 }}>
                {copy.footerHint}
              </div>

              <button
                type="submit"
                disabled={submitting || !isFormComplete(form)}
                style={{
                  minHeight: 46,
                  borderRadius: 999,
                  border: "1px solid rgba(37,99,235,0.22)",
                  background:
                    submitting || !isFormComplete(form)
                      ? "rgba(148,163,184,0.30)"
                      : "linear-gradient(135deg, #2563eb, #10b981)",
                  color: "#ffffff",
                  fontWeight: 900,
                  padding: "0 18px",
                  cursor: submitting || !isFormComplete(form) ? "not-allowed" : "pointer",
                  font: "inherit",
                }}
              >
                {submitting ? copy.submitting : copy.submit}
              </button>
            </section>
          </form>
        ) : null}
      </div>
    </main>
  );
}