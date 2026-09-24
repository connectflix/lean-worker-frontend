"use client";

import { useEffect, useState } from "react";
import { getOrganizationInsightsCopy } from "@/lib/i18n/organization-insights";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";
import { AdminMetricCard, AdminPage, AdminTabs } from "@/components/admin-ui";
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
  const { uiLanguage } = useAdminUiLanguage();
  const copy = getOrganizationInsightsCopy(uiLanguage);

  const [activeIntelligenceTab, setActiveIntelligenceTab] =
    useState("overview");

  const [
    professionalIntentionCompletionWorkspace,
    setProfessionalIntentionCompletionWorkspace,
  ] = useState<ProfessionalIntentionCompletionWorkspaceResponse | null>(null);
  const [
    professionalIntentionCompletionWorkspaceLoading,
    setProfessionalIntentionCompletionWorkspaceLoading,
  ] = useState(false);
  const [
    professionalIntentionCompletionWorkspaceLoaded,
    setProfessionalIntentionCompletionWorkspaceLoaded,
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
    professionalExecutionPlanLoaded,
    setProfessionalExecutionPlanLoaded,
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
    professionalMandateSupportLoaded,
    setProfessionalMandateSupportLoaded,
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
    setProfessionalIntentionCompletionWorkspaceLoaded(false);
    setProfessionalIntentionCompletionWorkspaceLoading(true);

    try {
      const workspace =
        await getAdminWorkerProfessionalIntentionCompletionWorkspace(workerId);
      setProfessionalIntentionCompletionWorkspace(workspace);
    } catch {
      setProfessionalIntentionCompletionWorkspace(null);
    } finally {
      setProfessionalIntentionCompletionWorkspaceLoading(false);
      setProfessionalIntentionCompletionWorkspaceLoaded(true);
    }
  }

  async function loadProfessionalExecutionPlan(workerId: number) {
    setProfessionalExecutionPlan(null);
    setProfessionalExecutionPlanLoaded(false);
    setProfessionalExecutionPlanLoading(true);

    try {
      const plan =
        await getAdminWorkerProfessionalExecutionPlan(workerId);
      setProfessionalExecutionPlan(plan);
    } catch {
      setProfessionalExecutionPlan(null);
    } finally {
      setProfessionalExecutionPlanLoading(false);
      setProfessionalExecutionPlanLoaded(true);
    }
  }

  async function loadProfessionalMandateSupport(workerId: number) {
    setProfessionalMandateSupport(null);
    setProfessionalMandateSupportLoaded(false);
    setProfessionalMandateSupportLoading(true);

    try {
      const support =
        await getAdminWorkerProfessionalMandateSupport(workerId);
      setProfessionalMandateSupport(support);
    } catch {
      setProfessionalMandateSupport(null);
    } finally {
      setProfessionalMandateSupportLoading(false);
      setProfessionalMandateSupportLoaded(true);
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
        copy.errors.intentionInitializationFailed
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
        copy.errors.targetHorizonValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.movementDefinitionValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.targetStateValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.desiredOutcomesValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.recommendationCompletionFailed,
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
        copy.errors.shortTermMissionValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.mandateProfessionalIdentityValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.mandateExpectedOutcomeValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.mandateSuccessDefinitionValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.mandateMeaningValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.mandateConstraintsValidation,
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
        copy.errors.recordingClarificationFailed,
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
        copy.errors.mandateCapacityValidation,
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
        copy.errors.recordingClarificationFailed,
      );
    } finally {
      setProfessionalMandateClarificationLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedWorkerSummary) {
      setProfessionalIntentionCompletionWorkspace(null);
      setProfessionalIntentionCompletionWorkspaceLoading(false);
      setProfessionalIntentionCompletionWorkspaceLoaded(false);
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
      setProfessionalExecutionPlanLoaded(false);

      setProfessionalMandateSupport(null);
      setProfessionalMandateSupportLoading(false);
      setProfessionalMandateSupportLoaded(false);
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
        <div className="section-title">{copy.workspaceTitle}</div>
        <div className="muted">{copy.loadingWorkerSummary}</div>
      </div>
    );
  }

  if (!selectedWorkerSummary) {
    return (
      <div className="card stack">
        <div className="section-title">{copy.workspaceTitle}</div>
        <div className="muted">{copy.selectWorker}</div>
      </div>
    );
  }

  const subscriptionPaid = getWorkerSubscriptionPaidExVat(selectedWorkerSummary.worker);

  const openRecommendationCount =
    selectedWorkerSummary.recommendations.filter(
      (recommendation) =>
        recommendation.status !== "completed" &&
        recommendation.status !== "dismissed" &&
        !completedRecommendationIds.has(recommendation.id),
    ).length;

  const managerAttentionSignals = [
    ...(openRecommendationCount > 0
      ? [copy.openRecommendation(openRecommendationCount)]
      : []),

    ...(!selectedWorkerSummary.career_blueprint
      ? [copy.attentionCareerBlueprintMissing]
      : []),

    ...(professionalMandateSupportLoaded &&
    professionalMandateSupport?.readiness &&
    !professionalMandateSupport.readiness.decision_ready
      ? [copy.attentionMandateClarification]
      : []),

    ...(professionalIntentionCompletionWorkspaceLoaded &&
    professionalIntentionCompletionWorkspace?.items.some(
      (item) => item.resolution_status !== "resolved",
    )
      ? [copy.attentionIntentionClarification]
      : []),

    ...(professionalExecutionPlanLoaded && !professionalExecutionPlan
      ? [copy.attentionExecutionPlanUnavailable]
      : []),
  ];

  return (
    <AdminPage style={{ gap: 16 }}>
      <div
        data-testid="organization-insights-worker-header"
        className="card stack"
        style={{ gap: 16 }}
      >
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 10, minWidth: 0 }}>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
              {copy.workspaceTitle}
            </div>

            <h1
              style={{
                margin: 0,
                color: "var(--admin-ink)",
                fontSize: 24,
                lineHeight: 1.2,
                fontWeight: 850,
                letterSpacing: "-0.03em",
              }}
            >
              {selectedWorkerSummary.worker.display_name}
            </h1>

            <div
              data-testid="organization-insights-worker-context"
              className="muted"
              style={{ fontSize: 14 }}
            >
              {[
                selectedWorkerSummary.worker.current_role,
                selectedWorkerSummary.worker.location,
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge">
                worker #{selectedWorkerSummary.worker.id}
              </span>
              <span className="badge">
                {selectedWorkerSummary.worker.subscription_pack}
              </span>
              {selectedWorkerSummary.worker.business_id ? (
                <span className="badge">
                  {selectedWorkerSummary.worker.business_id}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          data-testid="organization-insights-attention"
          className="card-soft row space-between"
          style={{
            gap: 12,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div className="stack" style={{ gap: 8, minWidth: 0 }}>
            <strong>{copy.attentionTitle}</strong>

            {managerAttentionSignals.length > 0 ? (
              <div className="stack" style={{ gap: 5 }}>
                {managerAttentionSignals.map((signal) => (
                  <div key={signal} className="muted">
                    {signal}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <span
            className={
              managerAttentionSignals.length > 0
                ? "badge primary"
                : "badge"
            }
          >
            {managerAttentionSignals.length}
          </span>
        </div>

        <div
          data-testid="organization-insights-metrics"
          className="admin-kpi-scroll"
        >
          <div className="admin-kpi-row admin-kpi-row--6">
            <AdminMetricCard
              label={copy.metrics.sessions}
              value={selectedWorkerSummary.session_count}
              helper={copy.metrics.sessionsHelper}
            />

            <AdminMetricCard
              label={copy.metrics.externalConversations}
              value={selectedWorkerSummary.external_conversation_count}
              helper={copy.metrics.externalConversationsHelper}
            />

            <AdminMetricCard
              label={copy.metrics.recommendations}
              value={selectedWorkerSummary.recommendation_count}
              helper={copy.metrics.recommendationsHelper}
            />

            <AdminMetricCard
              label={copy.metrics.artifacts}
              value={selectedWorkerSummary.artifact_count}
              helper={copy.metrics.artifactsHelper}
            />

            <AdminMetricCard
              label={copy.metrics.levers}
              value={selectedWorkerSummary.lever_count}
              helper={copy.metrics.leversHelper}
            />

            <AdminMetricCard
              label={copy.metrics.blueprint}
              value={
                selectedWorkerSummary.career_blueprint
                  ? copy.metrics.blueprintAvailable
                  : copy.metrics.blueprintUnavailable
              }
              helper={copy.metrics.blueprintHelper}
            />
          </div>
        </div>
      </div>

      <AdminTabs
        ariaLabel={copy.navigation.ariaLabel}
        activeTab={activeIntelligenceTab}
        onChange={setActiveIntelligenceTab}
        tabs={[
          {
            key: "overview",
            label: copy.navigation.overview,
          },
          {
            key: "context",
            label: copy.navigation.context,
          },
          {
            key: "decision",
            label: copy.navigation.decision,
          },
          {
            key: "execution",
            label: copy.navigation.execution,
          },
          {
            key: "trajectory",
            label: copy.navigation.trajectory,
          },
          {
            key: "history",
            label: copy.navigation.history,
          },
        ]}
      />

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
          <div className="section-title">{copy.workerProfile}</div>

          <div className="card-soft stack" style={{ gap: 0 }}>
            <DetailRow label={copy.profileFields.name} value={selectedWorkerSummary.worker.display_name} />
            <DetailRow label={copy.profileFields.email} value={selectedWorkerSummary.worker.email} />
            <DetailRow label={copy.profileFields.businessId} value={selectedWorkerSummary.worker.business_id} />
            <DetailRow label={copy.profileFields.role} value={selectedWorkerSummary.worker.current_role} />
            <DetailRow label={copy.profileFields.industry} value={selectedWorkerSummary.worker.industry} />
            <DetailRow label={copy.profileFields.language} value={selectedWorkerSummary.worker.language} />
            <DetailRow label={copy.profileFields.subscription} value={selectedWorkerSummary.worker.subscription_pack} />
            <DetailRow label={copy.profileFields.subscriptionPaid} value={formatCurrency(subscriptionPaid)} />
            <DetailRow label={copy.profileFields.organizationShare} value={formatCurrency(subscriptionPaid * 0.75)} />
            <DetailRow label={copy.profileFields.profession} value={selectedWorkerSummary.worker.profession} />
            <DetailRow label={copy.profileFields.location} value={selectedWorkerSummary.worker.location} />
          </div>
        </div>

        <div className="card stack" style={{ gap: 14 }}>
          <div className="section-title">{copy.careerBlueprint}</div>

          {selectedWorkerSummary.career_blueprint ? (
            <div className="card-soft stack" style={{ gap: 0 }}>
              <DetailRow
                label={copy.careerBlueprintFields.identity}
                value={selectedWorkerSummary.career_blueprint.identity_text}
              />
              <DetailRow label={copy.careerBlueprintFields.vision} value={selectedWorkerSummary.career_blueprint.vision_text} />
              <DetailRow
                label={copy.careerBlueprintFields.talentFocus}
                value={selectedWorkerSummary.career_blueprint.talent_focus_text}
              />
              <DetailRow
                label={copy.careerBlueprintFields.careerFocus}
                value={selectedWorkerSummary.career_blueprint.career_focus_text}
              />
              <DetailRow
                label={copy.careerBlueprintFields.inspirationPerson}
                value={selectedWorkerSummary.career_blueprint.inspiration_person}
              />
              <DetailRow
                label={copy.careerBlueprintFields.aspirationPerson}
                value={selectedWorkerSummary.career_blueprint.aspiration_person}
              />
            </div>
          ) : (
            <div className="card-soft muted">{copy.noCareerBlueprint}</div>
          )}
        </div>
      </div>

      <div className="card stack" style={{ gap: 14 }}>
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">{copy.leversWorkspace}</div>
            <div className="muted">
              {copy.leversWorkspaceDescription}
            </div>
          </div>

          <span className="badge">
            {copy.leversShown(
              filteredLevers.length,
              selectedWorkerSummary.lever_count,
            )}
          </span>
        </div>

        <div className="grid grid-3">
          <input
            className="input"
            placeholder={copy.searchLeversPlaceholder}
            value={leverSearch}
            onChange={(event) => onLeverSearchChange(event.target.value)}
          />

          <select
            className="select"
            value={leverCategoryFilter}
            onChange={(event) => onLeverCategoryFilterChange(event.target.value)}
          >
            <option value="all">{copy.allCategories}</option>
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
            <option value="highlighted">{copy.sortHighlighted}</option>
            <option value="most_used">{copy.sortMostUsed}</option>
            <option value="name">{copy.sortName}</option>
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
          title={copy.collections.sessions}
          count={selectedWorkerSummary.sessions.length}
          emptyLabel={copy.collections.noSessions}
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
                  {session.summary || copy.collections.noSummary}
                </div>
              </div>
            </div>
          ))}
        </ScrollSection>

        <ScrollSection
          title={copy.collections.recommendations}
          count={selectedWorkerSummary.recommendations.length}
          emptyLabel={copy.collections.noRecommendations}
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
                        aria-label={copy.collections.markCompletedAria(recommendation.id)}
                        disabled={recommendationCompletionLoadingId === recommendation.id}
                        onClick={() => void handleCompleteRecommendation(recommendation.id)}
                      >
                        {recommendationCompletionLoadingId === recommendation.id
                          ? copy.collections.markingCompleted
                          : copy.collections.markCompleted}
                      </button>
                    </div>
                  ) : null}

                  {relatedLevers.length > 0 ? (
                    <div className="stack" style={{ gap: 6 }}>
                      <div className="muted">{copy.collections.relatedLevers}</div>

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
          title={copy.collections.artifacts}
          count={selectedWorkerSummary.artifacts.length}
          emptyLabel={copy.collections.noArtifacts}
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
          title={copy.collections.levers}
          count={filteredLevers.length}
          emptyLabel={copy.collections.noLevers}
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
                  <span className="badge">{lever.is_active ? copy.collections.active : copy.collections.inactive}</span>
                  <span className="badge">{copy.collections.used(lever.usage_count)}</span>

                  {lever.is_highlighted ? <span className="badge primary">{copy.collections.highlighted}</span> : null}
                  {lever.is_default ? <span className="badge">{copy.collections.defaultLabel}</span> : null}
                </div>

                <div className="section-title" style={{ fontSize: 15 }}>
                  {lever.name}
                </div>

                <div style={{ fontSize: 14, lineHeight: 1.55, wordBreak: "break-word" }}>
                  {lever.description}
                </div>

                <div className="muted">
                  {copy.collections.provider}: {lever.provider_type || "—"} ·{" "}
                  {copy.collections.paid}:{" "}
                  {lever.is_paid ? copy.collections.yes : copy.collections.no}
                </div>

                {lever.price_min_eur != null || lever.price_max_eur != null ? (
                  <div className="muted">
                    {copy.collections.price}:{" "}
                    {lever.price_min_eur != null && lever.price_max_eur != null
                      ? `€${lever.price_min_eur} - €${lever.price_max_eur}`
                      : lever.price_min_eur != null
                        ? copy.collections.fromPrice(lever.price_min_eur)
                        : copy.collections.upToPrice(lever.price_max_eur!)}
                  </div>
                ) : null}

                {lever.match_reasons.length > 0 ? (
                  <div className="muted" style={{ wordBreak: "break-word" }}>
                    {copy.collections.matchReasons}: {lever.match_reasons.join(" • ")}
                  </div>
                ) : null}

                {lever.recommendation_ids.length > 0 ? (
                  <div className="stack" style={{ gap: 6 }}>
                    <div className="muted">{copy.collections.linkedRecommendations}</div>

                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      {lever.recommendation_ids.map((recommendationId) => (
                        <button
                          key={`${lever.id}-${recommendationId}`}
                          type="button"
                          className="button ghost"
                          style={{ padding: "6px 10px", minHeight: 32, fontSize: 12 }}
                          onClick={() => onScrollToRecommendation(recommendationId)}
                        >
                          {copy.collections.recommendation(recommendationId)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {lever.url ? (
                  <div>
                    <a href={lever.url} target="_blank" rel="noreferrer" className="link-button">
                      {copy.collections.openLeverLink}
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
              {copy.mandate.title}
            </div>
            <div className="muted">{copy.mandate.description}</div>
          </div>

          {professionalMandateSupportLoading ? (
            <span className="badge">{copy.clarification.loading}</span>
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
              {copy.mandate.completed}
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
                      <strong>{copy.clarification.suggestedClarification}</strong>
                      <div>{item.prompt}</div>
                    </div>

                    <div className="card-soft stack" style={{ gap: 10 }}>
                      <strong>{copy.mandate.recordSectionTitle}</strong>

                      <label className="stack" style={{ gap: 6 }}>
                        <span>{copy.mandate.workerAnswer}</span>
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
                          placeholder={copy.clarification.recordExactAnswerPlaceholder}
                        />
                      </label>

                      {item.dimension === "professional_identity" ? (
                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.mandate.professionalIdentity}</span>
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
                          <span>{copy.mandate.expectedOutcome}</span>
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
                          <span>{copy.mandate.successDefinition}</span>
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
                            <span>{copy.mandate.meaningDriver}</span>
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
                            <span>{copy.mandate.engagementDriver}</span>
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
                            <span>{copy.mandate.contributionDriver}</span>
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
                            <span>{copy.mandate.hardConstraint}</span>
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
                            <span>{copy.mandate.nonNegotiable}</span>
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
                            <span>{copy.mandate.timeCapacity}</span>
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
                            <span>{copy.mandate.energyConstraint}</span>
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
                            ? copy.clarification.recording
                            : copy.mandate.recordAction}
                        </button>
                      </div>
                    </div>

                    <div className="muted">
                      {copy.clarification.requestedSource}{" "} {item.source_scope.join(", ")}
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
              {copy.intention.title}
            </div>
            <div className="muted">{copy.intention.description}</div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {professionalIntentionCompletionWorkspaceLoading ? (
              <span className="badge">{copy.clarification.loading}</span>
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
                  ? copy.intention.initializing
                  : copy.intention.initializeAction}
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
          <div className="muted">{copy.intention.unavailable}</div>
        ) : null}

        {professionalIntentionCompletionWorkspace?.completion_closed ? (
          <div className="card-soft muted">
            {copy.intention.completed}
          </div>
        ) : null}

        {professionalIntentionCompletionWorkspace?.items ? (
          professionalIntentionCompletionWorkspace.items.length === 0 &&
          !professionalIntentionCompletionWorkspace.completion_closed ? (
            <div className="muted">{copy.intention.noBlockingItem}</div>
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
                      <strong>{copy.clarification.suggestedClarification}</strong>
                      <div>{item.suggested_question}</div>
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <strong>{copy.intention.resolutionCondition}</strong>
                      <div className="muted">{item.resolution_condition}</div>
                    </div>

                    {item.dimension === "target_horizon" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>{copy.intention.recordSectionTitle}</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.workerAnswer}</span>
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
                            placeholder={copy.clarification.recordExactAnswerPlaceholder}
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.targetHorizonMonths}</span>
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
                              ? copy.clarification.recording
                              : copy.intention.recordAction}
                          </button>
                        </div>

                        <div className="fine-print">
                          {copy.intention.targetHorizonHelp}
                        </div>
                      </div>
                    ) : null}

                    {item.dimension === "movement_definition" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>{copy.intention.recordSectionTitle}</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.workerAnswer}</span>
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
                            placeholder={copy.clarification.recordExactAnswerPlaceholder}
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.movementSummary}</span>
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
                            placeholder={copy.intention.movementSummaryPlaceholder}
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
                              ? copy.clarification.recording
                              : copy.intention.recordAction}
                          </button>
                        </div>

                        <div className="fine-print">
                          {copy.intention.movementHelp}
                        </div>
                      </div>
                    ) : null}

                    {item.dimension === "target_state" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>{copy.intention.recordSectionTitle}</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.workerAnswer}</span>
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
                            placeholder={copy.clarification.recordExactAnswerPlaceholder}
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.targetIdentity}</span>
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
                            placeholder={copy.intention.targetIdentityPlaceholder}
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
                              ? copy.clarification.recording
                              : copy.intention.recordAction}
                          </button>
                        </div>

                        <div className="fine-print">
                          {copy.intention.targetIdentityHelp}
                        </div>
                      </div>
                    ) : null}

                    {item.dimension === "desired_outcomes" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>{copy.intention.recordSectionTitle}</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.workerAnswer}</span>
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
                            placeholder={copy.clarification.recordExactAnswerPlaceholder}
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.desiredImpact}</span>
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
                            placeholder={copy.intention.desiredImpactPlaceholder}
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
                              ? copy.clarification.recording
                              : copy.intention.recordAction}
                          </button>
                        </div>

                        <div className="fine-print">
                          {copy.intention.desiredImpactHelp}
                        </div>
                      </div>
                    ) : null}

                    {item.dimension === "progress_markers" ? (
                      <div className="card-soft stack" style={{ gap: 10 }}>
                        <strong>{copy.intention.recordSectionTitle}</strong>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.workerAnswer}</span>
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
                            placeholder={copy.clarification.recordExactAnswerPlaceholder}
                          />
                        </label>

                        <label className="stack" style={{ gap: 6 }}>
                          <span>{copy.intention.shortTermMission}</span>
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
                            placeholder={copy.intention.shortTermMissionPlaceholder}
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
                              ? copy.clarification.recording
                              : copy.intention.recordAction}
                          </button>
                        </div>

                        <div className="fine-print">
                          {copy.intention.shortTermMissionHelp}
                        </div>
                      </div>
                    ) : null}

                    <div className="muted">
                      {copy.clarification.requestedSource}{" "}
                      {item.requested_source_actor.replaceAll("_", " ")}
                    </div>

                    <div className="stack" style={{ gap: 8 }}>
                      <strong>{copy.intention.evidenceAlreadyKnown}</strong>

                      {item.evidence.length === 0 ? (
                        <div className="muted">
                          {copy.intention.noCandidateEvidence}
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
                                {copy.intention.source}{" "}
                                {evidence.source_actor.replaceAll("_", " ")}
                              </span>
                              <span className="badge">
                                {copy.intention.capturedBy}{" "}
                                {evidence.captured_by_actor.replaceAll("_", " ")}
                              </span>
                            </div>

                            <div className="muted">{evidence.summary}</div>

                            <div className="muted">
                              {copy.intention.candidateEvidenceOnly}{" "}
                              {evidence.supports_resolution
                                ? copy.intention.confirmed
                                : copy.intention.notConfirmed}
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
    </AdminPage>
  );
}