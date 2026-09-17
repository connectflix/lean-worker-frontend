"use client";

import { useEffect, useState } from "react";
import {
  completeAdminWorkerRecommendation,
  getAdminWorkerProfessionalExecutionPlan,
  getAdminWorkerProfessionalIntentionCompletionWorkspace,
  getAdminWorkerProfessionalMandateSupport,
  initializeAdminWorkerProfessionalIntention,
  recordAdminWorkerProfessionalIntentionClarification,
  recordAdminWorkerProfessionalMandateClarification,
} from "@/lib/api";
import type {
  AdminOrganizationWorkerSummary,
  AdminProfessionalMandateSupportResponse,
  OrganizationWorkerGuidanceResponse,
  ProfessionalExecutionPlanResponse,
  ProfessionalIntentionCompletionWorkspaceResponse,
} from "@/lib/types";
import { OrganizationWorkerGuidanceCard } from "./organization-worker-guidance-card";
import { ProfessionalExecutionPlanCard } from "./professional-execution-plan-card";

type LeverSortMode = "highlighted" | "most_used" | "name";

type OrganizationInsightsTabProps = {
  selectedWorkerSummary: AdminOrganizationWorkerSummary | null;
  workerSummaryLoading: boolean;

  organizationGuidance: OrganizationWorkerGuidanceResponse | null;
  organizationGuidanceLoading: boolean;

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
  onOrganizationRecommendationCompleted?: (
    recommendationId: number,
  ) => void;
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
  organizationGuidance,
  organizationGuidanceLoading,
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
  onOrganizationRecommendationCompleted,
}: OrganizationInsightsTabProps) {
  const [
    professionalIntentionCompletionWorkspace,
    setProfessionalIntentionCompletionWorkspace,
  ] = useState<ProfessionalIntentionCompletionWorkspaceResponse | null>(null);
  const [
    professionalIntentionCompletionWorkspaceLoading,
    setProfessionalIntentionCompletionWorkspaceLoading,
  ] = useState(false);
  const [
    professionalIntentionInitializationLoading,
    setProfessionalIntentionInitializationLoading,
  ] = useState(false);
  const [
    professionalIntentionInitializationError,
    setProfessionalIntentionInitializationError,
  ] = useState<string | null>(null);
  const [
    professionalIntentionClarificationAnswer,
    setProfessionalIntentionClarificationAnswer,
  ] = useState("");
  const [
    professionalIntentionClarificationHorizonMonths,
    setProfessionalIntentionClarificationHorizonMonths,
  ] = useState("");
  const [
    professionalIntentionClarificationMovementSummary,
    setProfessionalIntentionClarificationMovementSummary,
  ] = useState("");
  const [
    professionalIntentionClarificationTargetIdentity,
    setProfessionalIntentionClarificationTargetIdentity,
  ] = useState("");
  const [
    professionalIntentionClarificationDesiredImpact,
    setProfessionalIntentionClarificationDesiredImpact,
  ] = useState("");
  const [
    professionalIntentionClarificationShortTermMission,
    setProfessionalIntentionClarificationShortTermMission,
  ] = useState("");
  const [
    professionalIntentionClarificationLoading,
    setProfessionalIntentionClarificationLoading,
  ] = useState(false);
  const [
    professionalIntentionClarificationError,
    setProfessionalIntentionClarificationError,
  ] = useState<string | null>(null);

  const [
    professionalExecutionPlan,
    setProfessionalExecutionPlan,
  ] = useState<ProfessionalExecutionPlanResponse | null>(null);
  const [
    professionalExecutionPlanLoading,
    setProfessionalExecutionPlanLoading,
  ] = useState(false);

  const [
    professionalMandateSupport,
    setProfessionalMandateSupport,
  ] = useState<AdminProfessionalMandateSupportResponse | null>(null);
  const [
    professionalMandateSupportLoading,
    setProfessionalMandateSupportLoading,
  ] = useState(false);
  const [
    professionalMandateClarificationAnswer,
    setProfessionalMandateClarificationAnswer,
  ] = useState("");
  const [
    professionalMandateProfessionalIdentity,
    setProfessionalMandateProfessionalIdentity,
  ] = useState("");
  const [
    professionalMandateExpectedOutcome,
    setProfessionalMandateExpectedOutcome,
  ] = useState("");
  const [
    professionalMandateSuccessDefinition,
    setProfessionalMandateSuccessDefinition,
  ] = useState("");
  const [
    professionalMandateMeaningDriver,
    setProfessionalMandateMeaningDriver,
  ] = useState("");
  const [
    professionalMandateEngagementDriver,
    setProfessionalMandateEngagementDriver,
  ] = useState("");
  const [
    professionalMandateContributionDriver,
    setProfessionalMandateContributionDriver,
  ] = useState("");
  const [
    professionalMandateHardConstraint,
    setProfessionalMandateHardConstraint,
  ] = useState("");
  const [
    professionalMandateNonNegotiable,
    setProfessionalMandateNonNegotiable,
  ] = useState("");
  const [
    professionalMandateTimeCapacity,
    setProfessionalMandateTimeCapacity,
  ] = useState("");
  const [
    professionalMandateEnergyConstraint,
    setProfessionalMandateEnergyConstraint,
  ] = useState("");
  const [
    professionalMandateClarificationLoading,
    setProfessionalMandateClarificationLoading,
  ] = useState(false);
  const [
    professionalMandateClarificationError,
    setProfessionalMandateClarificationError,
  ] = useState<string | null>(null);

  const [completedRecommendationIds, setCompletedRecommendationIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [recommendationCompletionLoadingId, setRecommendationCompletionLoadingId] =
    useState<number | null>(null);
  const [recommendationCompletionError, setRecommendationCompletionError] =
    useState<string | null>(null);

  async function loadProfessionalIntentionCompletionWorkspace(workerId: number) {
    setProfessionalIntentionCompletionWorkspace(null);
    setProfessionalIntentionCompletionWorkspaceLoading(true);

    try {
      const workspace =
        await getAdminWorkerProfessionalIntentionCompletionWorkspace(workerId);
      setProfessionalIntentionCompletionWorkspace(workspace);
    } catch {
      setProfessionalIntentionCompletionWorkspace(null);
    } finally {
      setProfessionalIntentionCompletionWorkspaceLoading(false);
    }
  }

  async function loadProfessionalExecutionPlan(workerId: number) {
    setProfessionalExecutionPlan(null);
    setProfessionalExecutionPlanLoading(true);

    try {
      const plan =
        await getAdminWorkerProfessionalExecutionPlan(workerId);
      setProfessionalExecutionPlan(plan);
    } catch {
      setProfessionalExecutionPlan(null);
    } finally {
      setProfessionalExecutionPlanLoading(false);
    }
  }

  async function loadProfessionalMandateSupport(workerId: number) {
    setProfessionalMandateSupport(null);
    setProfessionalMandateSupportLoading(true);

    try {
      const support =
        await getAdminWorkerProfessionalMandateSupport(workerId);
      setProfessionalMandateSupport(support);
    } catch {
      setProfessionalMandateSupport(null);
    } finally {
      setProfessionalMandateSupportLoading(false);
    }
  }

  async function handleInitializeProfessionalIntention() {
    if (!selectedWorkerSummary) {
      return;
    }

    setProfessionalIntentionInitializationError(null);
    setProfessionalIntentionInitializationLoading(true);

    try {
      await initializeAdminWorkerProfessionalIntention(
        selectedWorkerSummary.worker.id
      );
      await loadProfessionalIntentionCompletionWorkspace(
        selectedWorkerSummary.worker.id
      );
    } catch {
      setProfessionalIntentionInitializationError(
        "Professional Intention initialization failed. Please try again."
      );
    } finally {
      setProfessionalIntentionInitializationLoading(false);
    }
  }

  async function handleRecordTargetHorizonClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalIntentionClarificationAnswer.trim();
    const targetHorizonMonths = Number(
      professionalIntentionClarificationHorizonMonths,
    );

    if (
      !answerText ||
      !Number.isInteger(targetHorizonMonths) ||
      targetHorizonMonths < 1
    ) {
      setProfessionalIntentionClarificationError(
        "Enter the worker's answer and a valid target horizon in months.",
      );
      return;
    }

    setProfessionalIntentionClarificationError(null);
    setProfessionalIntentionClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalIntentionClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "target_horizon",
          answer_text: answerText,
          target_horizon_months: targetHorizonMonths,
        },
      );

      setProfessionalIntentionClarificationAnswer("");
      setProfessionalIntentionClarificationHorizonMonths("");

      await loadProfessionalIntentionCompletionWorkspace(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalIntentionClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalIntentionClarificationLoading(false);
    }
  }

  async function handleRecordMovementDefinitionClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalIntentionClarificationAnswer.trim();
    const movementSummary =
      professionalIntentionClarificationMovementSummary.trim();

    if (!answerText || !movementSummary) {
      setProfessionalIntentionClarificationError(
        "Enter the worker's answer and a movement summary.",
      );
      return;
    }

    setProfessionalIntentionClarificationError(null);
    setProfessionalIntentionClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalIntentionClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "movement_definition",
          answer_text: answerText,
          movement_summary: movementSummary,
        },
      );

      setProfessionalIntentionClarificationAnswer("");
      setProfessionalIntentionClarificationMovementSummary("");

      await loadProfessionalIntentionCompletionWorkspace(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalIntentionClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalIntentionClarificationLoading(false);
    }
  }

  async function handleRecordTargetStateClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalIntentionClarificationAnswer.trim();
    const targetIdentity =
      professionalIntentionClarificationTargetIdentity.trim();

    if (!answerText || !targetIdentity) {
      setProfessionalIntentionClarificationError(
        "Enter the worker's answer and a target identity.",
      );
      return;
    }

    setProfessionalIntentionClarificationError(null);
    setProfessionalIntentionClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalIntentionClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "target_state",
          answer_text: answerText,
          target_identity: targetIdentity,
        },
      );

      setProfessionalIntentionClarificationAnswer("");
      setProfessionalIntentionClarificationTargetIdentity("");

      await loadProfessionalIntentionCompletionWorkspace(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalIntentionClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalIntentionClarificationLoading(false);
    }
  }

  async function handleRecordDesiredOutcomesClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalIntentionClarificationAnswer.trim();
    const desiredImpact =
      professionalIntentionClarificationDesiredImpact.trim();

    if (!answerText || !desiredImpact) {
      setProfessionalIntentionClarificationError(
        "Enter the worker's answer and a desired impact.",
      );
      return;
    }

    setProfessionalIntentionClarificationError(null);
    setProfessionalIntentionClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalIntentionClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "desired_outcomes",
          answer_text: answerText,
          desired_impact: [desiredImpact],
        },
      );

      setProfessionalIntentionClarificationAnswer("");
      setProfessionalIntentionClarificationDesiredImpact("");

      await loadProfessionalIntentionCompletionWorkspace(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalIntentionClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalIntentionClarificationLoading(false);
    }
  }

  async function handleCompleteRecommendation(recommendationId: number) {
    if (!selectedWorkerSummary) {
      return;
    }

    setRecommendationCompletionError(null);
    setRecommendationCompletionLoadingId(recommendationId);

    try {
      await completeAdminWorkerRecommendation(
        selectedWorkerSummary.worker.id,
        recommendationId,
      );
      setCompletedRecommendationIds((current) => {
        const next = new Set(current);
        next.add(recommendationId);
        return next;
      });
    } catch {
      setRecommendationCompletionError(
        "Recommendation completion failed. Please try again.",
      );
    } finally {
      setRecommendationCompletionLoadingId(null);
    }
  }

  async function handleRecordProgressMarkersClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalIntentionClarificationAnswer.trim();
    const shortTermMission =
      professionalIntentionClarificationShortTermMission.trim();

    if (!answerText || !shortTermMission) {
      setProfessionalIntentionClarificationError(
        "Enter the worker's answer and a short-term mission.",
      );
      return;
    }

    setProfessionalIntentionClarificationError(null);
    setProfessionalIntentionClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalIntentionClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "progress_markers",
          answer_text: answerText,
          short_term_missions: [shortTermMission],
        },
      );

      setProfessionalIntentionClarificationAnswer("");
      setProfessionalIntentionClarificationShortTermMission("");

      await loadProfessionalIntentionCompletionWorkspace(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalIntentionClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalIntentionClarificationLoading(false);
    }
  }

  async function handleRecordProfessionalIdentityMandateClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalMandateClarificationAnswer.trim();
    const professionalIdentity =
      professionalMandateProfessionalIdentity.trim();

    if (!answerText || !professionalIdentity) {
      setProfessionalMandateClarificationError(
        "Enter the worker's answer and professional identity.",
      );
      return;
    }

    setProfessionalMandateClarificationError(null);
    setProfessionalMandateClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalMandateClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "professional_identity",
          answer_text: answerText,
          professional_identity: professionalIdentity,
        },
      );

      setProfessionalMandateClarificationAnswer("");
      setProfessionalMandateProfessionalIdentity("");

      await loadProfessionalMandateSupport(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalMandateClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalMandateClarificationLoading(false);
    }
  }

  async function handleRecordExpectedOutcomesMandateClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalMandateClarificationAnswer.trim();
    const expectedOutcome =
      professionalMandateExpectedOutcome.trim();

    if (!answerText || !expectedOutcome) {
      setProfessionalMandateClarificationError(
        "Enter the worker's answer and an expected outcome.",
      );
      return;
    }

    setProfessionalMandateClarificationError(null);
    setProfessionalMandateClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalMandateClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "expected_outcomes",
          answer_text: answerText,
          expected_outcomes: [expectedOutcome],
        },
      );

      setProfessionalMandateClarificationAnswer("");
      setProfessionalMandateExpectedOutcome("");

      await loadProfessionalMandateSupport(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalMandateClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalMandateClarificationLoading(false);
    }
  }

  async function handleRecordSuccessDefinitionMandateClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalMandateClarificationAnswer.trim();
    const successDefinition =
      professionalMandateSuccessDefinition.trim();

    if (!answerText || !successDefinition) {
      setProfessionalMandateClarificationError(
        "Enter the worker's answer and a success definition.",
      );
      return;
    }

    setProfessionalMandateClarificationError(null);
    setProfessionalMandateClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalMandateClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "success_definition",
          answer_text: answerText,
          success_definition: [successDefinition],
        },
      );

      setProfessionalMandateClarificationAnswer("");
      setProfessionalMandateSuccessDefinition("");

      await loadProfessionalMandateSupport(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalMandateClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalMandateClarificationLoading(false);
    }
  }

  async function handleRecordMeaningAndContributionMandateClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalMandateClarificationAnswer.trim();
    const meaningDriver = professionalMandateMeaningDriver.trim();
    const engagementDriver =
      professionalMandateEngagementDriver.trim();
    const contributionDriver =
      professionalMandateContributionDriver.trim();

    if (
      !answerText ||
      (!meaningDriver && !engagementDriver && !contributionDriver)
    ) {
      setProfessionalMandateClarificationError(
        "Enter the worker's answer and at least one meaning, engagement, or contribution driver.",
      );
      return;
    }

    setProfessionalMandateClarificationError(null);
    setProfessionalMandateClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalMandateClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "meaning_and_contribution",
          answer_text: answerText,
          ...(meaningDriver
            ? { meaning_drivers: [meaningDriver] }
            : {}),
          ...(engagementDriver
            ? { engagement_drivers: [engagementDriver] }
            : {}),
          ...(contributionDriver
            ? { contribution_drivers: [contributionDriver] }
            : {}),
        },
      );

      setProfessionalMandateClarificationAnswer("");
      setProfessionalMandateMeaningDriver("");
      setProfessionalMandateEngagementDriver("");
      setProfessionalMandateContributionDriver("");

      await loadProfessionalMandateSupport(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalMandateClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalMandateClarificationLoading(false);
    }
  }

  async function handleRecordConstraintsMandateClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalMandateClarificationAnswer.trim();
    const hardConstraint =
      professionalMandateHardConstraint.trim();
    const nonNegotiable =
      professionalMandateNonNegotiable.trim();

    if (!answerText || (!hardConstraint && !nonNegotiable)) {
      setProfessionalMandateClarificationError(
        "Enter the worker's answer and at least one constraint or non-negotiable.",
      );
      return;
    }

    setProfessionalMandateClarificationError(null);
    setProfessionalMandateClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalMandateClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "constraints_and_non_negotiables",
          answer_text: answerText,
          ...(hardConstraint
            ? { hard_constraints: [hardConstraint] }
            : {}),
          ...(nonNegotiable
            ? { non_negotiables: [nonNegotiable] }
            : {}),
        },
      );

      setProfessionalMandateClarificationAnswer("");
      setProfessionalMandateHardConstraint("");
      setProfessionalMandateNonNegotiable("");

      await loadProfessionalMandateSupport(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalMandateClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalMandateClarificationLoading(false);
    }
  }

  async function handleRecordCapacityMandateClarification() {
    if (!selectedWorkerSummary) {
      return;
    }

    const answerText = professionalMandateClarificationAnswer.trim();
    const timeCapacity =
      professionalMandateTimeCapacity.trim();
    const energyConstraint =
      professionalMandateEnergyConstraint.trim();

    if (!answerText || (!timeCapacity && !energyConstraint)) {
      setProfessionalMandateClarificationError(
        "Enter the worker's answer and at least one time capacity or energy constraint.",
      );
      return;
    }

    setProfessionalMandateClarificationError(null);
    setProfessionalMandateClarificationLoading(true);

    try {
      await recordAdminWorkerProfessionalMandateClarification(
        selectedWorkerSummary.worker.id,
        {
          dimension: "capacity_and_sustainability",
          answer_text: answerText,
          ...(timeCapacity
            ? { time_capacity: [timeCapacity] }
            : {}),
          ...(energyConstraint
            ? { energy_constraints: [energyConstraint] }
            : {}),
        },
      );

      setProfessionalMandateClarificationAnswer("");
      setProfessionalMandateTimeCapacity("");
      setProfessionalMandateEnergyConstraint("");

      await loadProfessionalMandateSupport(
        selectedWorkerSummary.worker.id,
      );
    } catch {
      setProfessionalMandateClarificationError(
        "Recording the worker clarification failed. Please try again.",
      );
    } finally {
      setProfessionalMandateClarificationLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedWorkerSummary) {
      setProfessionalIntentionCompletionWorkspace(null);
      setProfessionalIntentionCompletionWorkspaceLoading(false);
      setProfessionalIntentionInitializationError(null);
      setProfessionalIntentionClarificationAnswer("");
      setProfessionalIntentionClarificationHorizonMonths("");
      setProfessionalIntentionClarificationMovementSummary("");
      setProfessionalIntentionClarificationTargetIdentity("");
      setProfessionalIntentionClarificationDesiredImpact("");
      setProfessionalIntentionClarificationShortTermMission("");
      setProfessionalIntentionClarificationError(null);
      setProfessionalIntentionClarificationLoading(false);

      setProfessionalExecutionPlan(null);
      setProfessionalExecutionPlanLoading(false);

      setProfessionalMandateSupport(null);
      setProfessionalMandateSupportLoading(false);
      setProfessionalMandateClarificationAnswer("");
      setProfessionalMandateProfessionalIdentity("");
      setProfessionalMandateExpectedOutcome("");
      setProfessionalMandateSuccessDefinition("");
      setProfessionalMandateMeaningDriver("");
      setProfessionalMandateEngagementDriver("");
      setProfessionalMandateContributionDriver("");
      setProfessionalMandateHardConstraint("");
      setProfessionalMandateNonNegotiable("");
      setProfessionalMandateTimeCapacity("");
      setProfessionalMandateEnergyConstraint("");
      setProfessionalMandateClarificationError(null);
      setProfessionalMandateClarificationLoading(false);

      setCompletedRecommendationIds(new Set());
      setRecommendationCompletionLoadingId(null);
      setRecommendationCompletionError(null);
      return;
    }

    setProfessionalIntentionInitializationError(null);
    setProfessionalIntentionClarificationAnswer("");
    setProfessionalIntentionClarificationHorizonMonths("");
    setProfessionalIntentionClarificationMovementSummary("");
    setProfessionalIntentionClarificationTargetIdentity("");
    setProfessionalIntentionClarificationDesiredImpact("");
    setProfessionalIntentionClarificationShortTermMission("");
    setProfessionalIntentionClarificationError(null);
    setProfessionalIntentionClarificationLoading(false);

    setProfessionalMandateClarificationAnswer("");
    setProfessionalMandateProfessionalIdentity("");
    setProfessionalMandateExpectedOutcome("");
    setProfessionalMandateSuccessDefinition("");
    setProfessionalMandateMeaningDriver("");
    setProfessionalMandateEngagementDriver("");
    setProfessionalMandateContributionDriver("");
    setProfessionalMandateHardConstraint("");
    setProfessionalMandateNonNegotiable("");
    setProfessionalMandateTimeCapacity("");
    setProfessionalMandateEnergyConstraint("");
    setProfessionalMandateClarificationError(null);
    setProfessionalMandateClarificationLoading(false);

    setCompletedRecommendationIds(new Set());
    setRecommendationCompletionLoadingId(null);
    setRecommendationCompletionError(null);

    void loadProfessionalIntentionCompletionWorkspace(
      selectedWorkerSummary.worker.id
    );
    void loadProfessionalMandateSupport(
      selectedWorkerSummary.worker.id,
    );
    void loadProfessionalExecutionPlan(
      selectedWorkerSummary.worker.id,
    );
  }, [selectedWorkerSummary?.worker.id]);

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

      <OrganizationWorkerGuidanceCard
        guidance={organizationGuidance}
        loading={organizationGuidanceLoading}
        onOrganizationRecommendationCompleted={
          onOrganizationRecommendationCompleted
        }
      />

      <ProfessionalExecutionPlanCard
        plan={professionalExecutionPlan}
        loading={professionalExecutionPlanLoading}
      />

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

      {recommendationCompletionError ? (
        <div
          role="alert"
          style={{
            color: "var(--danger)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {recommendationCompletionError}
        </div>
      ) : null}

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
            const isCompleted =
              recommendation.status === "completed" ||
              completedRecommendationIds.has(recommendation.id);

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
                    <span className="badge">
                      {isCompleted ? "completed" : recommendation.status}
                    </span>
                    <span className="badge">{recommendation.priority}</span>
                  </div>

                  <div className="section-title" style={{ fontSize: 15 }}>
                    {recommendation.title}
                  </div>

                  <div style={{ fontSize: 14, lineHeight: 1.55, wordBreak: "break-word" }}>
                    {recommendation.description}
                  </div>

                  {!isCompleted && recommendation.status !== "dismissed" ? (
                    <div>
                      <button
                        type="button"
                        className="button"
                        aria-label={`Mark recommendation ${recommendation.id} as completed`}
                        disabled={recommendationCompletionLoadingId === recommendation.id}
                        onClick={() => void handleCompleteRecommendation(recommendation.id)}
                      >
                        {recommendationCompletionLoadingId === recommendation.id
                          ? "Marking completed..."
                          : "Mark as completed"}
                      </button>
                    </div>
                  ) : null}

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

      <div className="card stack" style={{ gap: 16 }}>
        <div
          className="row space-between"
          style={{
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">
              Professional Mandate Completion Support
            </div>
            <div className="muted">
              Clarification support derived from canonical Professional Mandate
              readiness. Worker-owned professional truth remains authoritative.
            </div>
          </div>

          {professionalMandateSupportLoading ? (
            <span className="badge">Loading...</span>
          ) : professionalMandateSupport?.readiness ? (
            <span className="badge">
              {professionalMandateSupport.readiness.readiness_state
                .replaceAll("_", " ")
                .replace(/\b\w/g, (character) =>
                  character.toUpperCase(),
                )}
            </span>
          ) : null}
        </div>

        {professionalMandateClarificationError ? (
          <div
            style={{
              color: "var(--danger)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {professionalMandateClarificationError}
          </div>
        ) : null}

        <div
          className="stack scroll-panel"
          style={{ gap: 12, maxHeight: 680 }}
        >
          {professionalMandateSupport?.readiness?.decision_ready ? (
            <div className="card-soft muted">
              Professional Mandate clarification is complete. No further
              clarification is currently required.
            </div>
          ) : null}

          {!professionalMandateSupportLoading &&
          !professionalMandateSupport ? (
            <div className="muted">
              No Professional Mandate support is currently available for this
              worker.
            </div>
          ) : null}

          {professionalMandateSupport?.completion_guidance?.guidance?.length ? (
            <div className="stack" style={{ gap: 10 }}>
              {professionalMandateSupport.completion_guidance.guidance.map(
                (item, itemIndex) => (
                  <div
                    key={`${item.dimension}-${itemIndex}`}
                    className="card-soft stack"
                    style={{ gap: 10 }}
                  >
                    <div
                      className="row space-between"
                      style={{
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                      }}
                    >
                      <div className="stack" style={{ gap: 4 }}>
                        <strong>
                          {item.dimension
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (character) =>
                              character.toUpperCase(),
                            )}
                        </strong>

                        <div className="muted">{item.purpose}</div>
                      </div>

                      <div
                        className="row"
                        style={{ gap: 6, flexWrap: "wrap" }}
                      >
                        <span className="badge">
                          {item.state.replaceAll("_", " ")}
                        </span>
                        <span className="badge">
                          {item.completion_priority}
                        </span>
                      </div>
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <strong>Suggested clarification</strong>
                      <div>{item.prompt}</div>
                    </div>

                    <div className="card-soft stack" style={{ gap: 10 }}>
                      <strong>Record mandate worker answer</strong>

                      <label className="stack" style={{ gap: 6 }}>
                        <span>Mandate worker answer</span>
                        <textarea
                          className="input"
                          value={professionalMandateClarificationAnswer}
                          disabled={professionalMandateClarificationLoading}
                          onChange={(event) =>
                            setProfessionalMandateClarificationAnswer(
                              event.target.value,
                            )
                          }
                          rows={3}
                          placeholder="Record the worker's exact answer."
                        />
                      </label>

                      {item.dimension === "professional_identity" ? (
                        <label className="stack" style={{ gap: 6 }}>
                          <span>Professional identity</span>
                          <textarea
                            className="input"
                            value={professionalMandateProfessionalIdentity}
                            disabled={professionalMandateClarificationLoading}
                            onChange={(event) =>
                              setProfessionalMandateProfessionalIdentity(
                                event.target.value,
                              )
                            }
                            rows={2}
                          />
                        </label>
                      ) : null}

                      {item.dimension === "expected_outcomes" ? (
                        <label className="stack" style={{ gap: 6 }}>
                          <span>Expected outcome</span>
                          <textarea
                            className="input"
                            value={professionalMandateExpectedOutcome}
                            disabled={professionalMandateClarificationLoading}
                            onChange={(event) =>
                              setProfessionalMandateExpectedOutcome(
                                event.target.value,
                              )
                            }
                            rows={2}
                          />
                        </label>
                      ) : null}

                      {item.dimension === "success_definition" ? (
                        <label className="stack" style={{ gap: 6 }}>
                          <span>Success definition</span>
                          <textarea
                            className="input"
                            value={professionalMandateSuccessDefinition}
                            disabled={professionalMandateClarificationLoading}
                            onChange={(event) =>
                              setProfessionalMandateSuccessDefinition(
                                event.target.value,
                              )
                            }
                            rows={2}
                          />
                        </label>
                      ) : null}

                      {item.dimension === "meaning_and_contribution" ? (
                        <>
                          <label className="stack" style={{ gap: 6 }}>
                            <span>Meaning driver</span>
                            <textarea
                              className="input"
                              value={professionalMandateMeaningDriver}
                              disabled={professionalMandateClarificationLoading}
                              onChange={(event) =>
                                setProfessionalMandateMeaningDriver(
                                  event.target.value,
                                )
                              }
                              rows={2}
                            />
                          </label>

                          <label className="stack" style={{ gap: 6 }}>
                            <span>Engagement driver</span>
                            <textarea
                              className="input"
                              value={professionalMandateEngagementDriver}
                              disabled={professionalMandateClarificationLoading}
                              onChange={(event) =>
                                setProfessionalMandateEngagementDriver(
                                  event.target.value,
                                )
                              }
                              rows={2}
                            />
                          </label>

                          <label className="stack" style={{ gap: 6 }}>
                            <span>Contribution driver</span>
                            <textarea
                              className="input"
                              value={professionalMandateContributionDriver}
                              disabled={professionalMandateClarificationLoading}
                              onChange={(event) =>
                                setProfessionalMandateContributionDriver(
                                  event.target.value,
                                )
                              }
                              rows={2}
                            />
                          </label>
                        </>
                      ) : null}

                      {item.dimension ===
                      "constraints_and_non_negotiables" ? (
                        <>
                          <label className="stack" style={{ gap: 6 }}>
                            <span>Hard constraint</span>
                            <textarea
                              className="input"
                              value={professionalMandateHardConstraint}
                              disabled={professionalMandateClarificationLoading}
                              onChange={(event) =>
                                setProfessionalMandateHardConstraint(
                                  event.target.value,
                                )
                              }
                              rows={2}
                            />
                          </label>

                          <label className="stack" style={{ gap: 6 }}>
                            <span>Non-negotiable</span>
                            <textarea
                              className="input"
                              value={professionalMandateNonNegotiable}
                              disabled={professionalMandateClarificationLoading}
                              onChange={(event) =>
                                setProfessionalMandateNonNegotiable(
                                  event.target.value,
                                )
                              }
                              rows={2}
                            />
                          </label>
                        </>
                      ) : null}

                      {item.dimension === "capacity_and_sustainability" ? (
                        <>
                          <label className="stack" style={{ gap: 6 }}>
                            <span>Time capacity</span>
                            <textarea
                              className="input"
                              value={professionalMandateTimeCapacity}
                              disabled={professionalMandateClarificationLoading}
                              onChange={(event) =>
                                setProfessionalMandateTimeCapacity(
                                  event.target.value,
                                )
                              }
                              rows={2}
                            />
                          </label>

                          <label className="stack" style={{ gap: 6 }}>
                            <span>Energy constraint</span>
                            <textarea
                              className="input"
                              value={professionalMandateEnergyConstraint}
                              disabled={professionalMandateClarificationLoading}
                              onChange={(event) =>
                                setProfessionalMandateEnergyConstraint(
                                  event.target.value,
                                )
                              }
                              rows={2}
                            />
                          </label>
                        </>
                      ) : null}

                      <div>
                        <button
                          type="button"
                          className="button"
                          disabled={professionalMandateClarificationLoading}
                          onClick={
                            item.dimension === "professional_identity"
                              ? handleRecordProfessionalIdentityMandateClarification
                              : item.dimension === "expected_outcomes"
                                ? handleRecordExpectedOutcomesMandateClarification
                                : item.dimension === "success_definition"
                                  ? handleRecordSuccessDefinitionMandateClarification
                                  : item.dimension === "meaning_and_contribution"
                                    ? handleRecordMeaningAndContributionMandateClarification
                                    : item.dimension ===
                                        "constraints_and_non_negotiables"
                                      ? handleRecordConstraintsMandateClarification
                                      : handleRecordCapacityMandateClarification
                          }
                        >
                          {professionalMandateClarificationLoading
                            ? "Recording..."
                            : "Record mandate worker answer"}
                        </button>
                      </div>
                    </div>

                    <div className="muted">
                      Requested source: {item.source_scope.join(", ")}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="card stack" style={{ gap: 16 }}>
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">
              Professional Intention Completion Workspace
            </div>
            <div className="muted">
              Clarification support for the Organization coach. Candidate evidence
              helps prepare the worker conversation without replacing worker-owned
              professional truth.
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {professionalIntentionCompletionWorkspaceLoading ? (
              <span className="badge">Loading...</span>
            ) : professionalIntentionCompletionWorkspace ? (
              <span className="badge">
                {professionalIntentionCompletionWorkspace.readiness_state
                  .replaceAll("_", " ")
                  .replace(/\b\w/g, (character) => character.toUpperCase())}
              </span>
            ) : null}

            {professionalIntentionCompletionWorkspace?.initialization_available ? (
              <button
                type="button"
                className="button"
                disabled={professionalIntentionInitializationLoading}
                onClick={handleInitializeProfessionalIntention}
              >
                {professionalIntentionInitializationLoading
                  ? "Initializing..."
                  : "Initialize Professional Intention"}
              </button>
            ) : null}
          </div>
        </div>

        {professionalIntentionInitializationError ? (
          <div
            style={{
              color: "var(--danger)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {professionalIntentionInitializationError}
          </div>
        ) : null}

        {professionalIntentionClarificationError ? (
          <div
            style={{
              color: "var(--danger)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {professionalIntentionClarificationError}
          </div>
        ) : null}

        <div
          className="stack scroll-panel"
          style={{ gap: 12, maxHeight: 680 }}
        >
          {!professionalIntentionCompletionWorkspaceLoading &&
        !professionalIntentionCompletionWorkspace ? (
          <div className="muted">
            No clarification workspace is currently available for this worker.
          </div>
        ) : null}

        {professionalIntentionCompletionWorkspace?.completion_closed ? (
          <div className="card-soft muted">
            Professional Intention clarification is complete. No further
            clarification is currently required.
          </div>
        ) : null}

        {professionalIntentionCompletionWorkspace?.items ? (
          professionalIntentionCompletionWorkspace.items.length === 0 &&
          !professionalIntentionCompletionWorkspace.completion_closed ? (
            <div className="muted">
              No blocking clarification item is currently available.
            </div>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {professionalIntentionCompletionWorkspace.items.map(
                (item, itemIndex) => (
                  <div
                    key={`${item.dimension}-${itemIndex}`}
                    className="card-soft stack"
                    style={{ gap: 10 }}
                  >
                    <div
                      className="row space-between"
                      style={{
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                      }}
                    >
                      <div className="stack" style={{ gap: 4 }}>
                        <strong>
                          {item.dimension
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (character) =>
                              character.toUpperCase(),
                            )}
                        </strong>
                        <div className="muted">{item.reason}</div>
                      </div>

                      <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                        <span className="badge">
                          {item.current_state.replaceAll("_", " ")}
                        </span>
                        <span className="badge">
                          {item.resolution_status.replaceAll("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <strong>Suggested clarification</strong>
                      <div>{item.suggested_question}</div>
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <strong>Resolution condition</strong>
                      <div className="muted">{item.resolution_condition}</div>
                    </div>

                    {item.dimension === "target_horizon" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>Record worker answer</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Worker answer</span>
                          <textarea
                            className="input"
                            value={professionalIntentionClarificationAnswer}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationAnswer(
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Record the worker's exact answer."
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Target horizon in months</span>
                          <input
                            className="input"
                            type="number"
                            min={1}
                            step={1}
                            value={professionalIntentionClarificationHorizonMonths}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationHorizonMonths(
                                event.target.value,
                              )
                            }
                          />
                        </label>

                        <div>
                          <button
                            type="button"
                            className="button"
                            disabled={professionalIntentionClarificationLoading}
                            onClick={handleRecordTargetHorizonClarification}
                          >
                            {professionalIntentionClarificationLoading
                              ? "Recording..."
                              : "Record worker answer"}
                          </button>
                        </div>

                        <div className="fine-print">
                          The worker&apos;s exact answer is preserved as worker-authored
                          truth. The horizon in months is the normalized structured
                          value used to update the canonical Professional Intention.
                        </div>
                      </div>
                    ) : null}

                    {item.dimension === "movement_definition" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>Record worker answer</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Worker answer</span>
                          <textarea
                            className="input"
                            value={professionalIntentionClarificationAnswer}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationAnswer(
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Record the worker's exact answer."
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Movement summary</span>
                          <textarea
                            className="input"
                            value={professionalIntentionClarificationMovementSummary}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationMovementSummary(
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Capture the normalized professional movement."
                          />
                        </label>

                        <div>
                          <button
                            type="button"
                            className="button"
                            disabled={professionalIntentionClarificationLoading}
                            onClick={handleRecordMovementDefinitionClarification}
                          >
                            {professionalIntentionClarificationLoading
                              ? "Recording..."
                              : "Record worker answer"}
                          </button>
                        </div>

                        <div className="fine-print">
                          The worker&apos;s exact answer is preserved as worker-authored
                          truth. The movement summary is the normalized structured
                          value used to update the canonical Professional Intention.
                        </div>
                      </div>
                    ) : null}

                    {item.dimension === "target_state" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>Record worker answer</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Worker answer</span>
                          <textarea
                            className="input"
                            value={professionalIntentionClarificationAnswer}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationAnswer(
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Record the worker's exact answer."
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Target identity</span>
                          <textarea
                            className="input"
                            value={professionalIntentionClarificationTargetIdentity}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationTargetIdentity(
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Capture the normalized target professional identity."
                          />
                        </label>

                        <div>
                          <button
                            type="button"
                            className="button"
                            disabled={professionalIntentionClarificationLoading}
                            onClick={handleRecordTargetStateClarification}
                          >
                            {professionalIntentionClarificationLoading
                              ? "Recording..."
                              : "Record worker answer"}
                          </button>
                        </div>

                        <div className="fine-print">
                          The worker&apos;s exact answer is preserved as worker-authored
                          truth. The target identity is the normalized structured
                          value used to update the canonical Professional Intention.
                        </div>
                      </div>
                    ) : null}

                    {item.dimension === "desired_outcomes" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>Record worker answer</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Worker answer</span>
                          <textarea
                            className="input"
                            value={professionalIntentionClarificationAnswer}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationAnswer(
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Record the worker's exact answer."
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Desired impact</span>
                          <textarea
                            className="input"
                            value={professionalIntentionClarificationDesiredImpact}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationDesiredImpact(
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Capture the normalized desired professional impact."
                          />
                        </label>

                        <div>
                          <button
                            type="button"
                            className="button"
                            disabled={professionalIntentionClarificationLoading}
                            onClick={handleRecordDesiredOutcomesClarification}
                          >
                            {professionalIntentionClarificationLoading
                              ? "Recording..."
                              : "Record worker answer"}
                          </button>
                        </div>

                        <div className="fine-print">
                          The worker&apos;s exact answer is preserved as worker-authored
                          truth. The desired impact is the normalized structured
                          value used to update the canonical Professional Intention.
                        </div>
                      </div>
                    ) : null}

                    {item.dimension === "progress_markers" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>Record worker answer</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Worker answer</span>
                          <textarea
                            className="input"
                            value={professionalIntentionClarificationAnswer}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationAnswer(
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Record the worker's exact answer."
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>Short-term mission</span>
                          <textarea
                            className="input"
                            value={professionalIntentionClarificationShortTermMission}
                            disabled={professionalIntentionClarificationLoading}
                            onChange={(event) =>
                              setProfessionalIntentionClarificationShortTermMission(
                                event.target.value,
                              )
                            }
                            rows={3}
                            placeholder="Capture one normalized short-term mission."
                          />
                        </label>

                        <div>
                          <button
                            type="button"
                            className="button"
                            disabled={professionalIntentionClarificationLoading}
                            onClick={handleRecordProgressMarkersClarification}
                          >
                            {professionalIntentionClarificationLoading
                              ? "Recording..."
                              : "Record worker answer"}
                          </button>
                        </div>

                        <div className="fine-print">
                          The worker&apos;s exact answer is preserved as worker-authored
                          truth. The short-term mission is the normalized structured
                          value used to update the canonical Professional Intention.
                        </div>
                      </div>
                    ) : null}

                    <div className="muted">
                      Requested source:{" "}
                      {item.requested_source_actor.replaceAll("_", " ")}
                    </div>

                    <div className="stack" style={{ gap: 8 }}>
                      <strong>Evidence already known</strong>

                      {item.evidence.length === 0 ? (
                        <div className="muted">
                          No candidate evidence is currently available for this
                          dimension.
                        </div>
                      ) : (
                        item.evidence.map((evidence, evidenceIndex) => (
                          <div
                            key={`${item.dimension}-evidence-${evidenceIndex}`}
                            className="card-soft stack"
                            style={{ gap: 6 }}
                          >
                            <div
                              className="row"
                              style={{ gap: 6, flexWrap: "wrap" }}
                            >
                              <span className="badge">
                                {evidence.source_type.replaceAll("_", " ")}
                              </span>
                              <span className="badge">
                                source:{" "}
                                {evidence.source_actor.replaceAll("_", " ")}
                              </span>
                              <span className="badge">
                                captured by:{" "}
                                {evidence.captured_by_actor.replaceAll("_", " ")}
                              </span>
                            </div>

                            <div className="muted">{evidence.summary}</div>

                            <div className="muted">
                              Candidate evidence only — resolution support:{" "}
                              {evidence.supports_resolution
                                ? "confirmed"
                                : "not confirmed"}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )
        ) : null}
        </div>
      </div>
    </div>
  );
}