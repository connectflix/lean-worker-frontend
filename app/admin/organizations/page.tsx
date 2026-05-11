// app/admin/organizations/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  assignWorkerToOrganization,
  createAdminOrganization,
  createAdminWorkerEngagement,
  createAdminWorkerPurposeCanvas,
  createAdminWorkerSignificanceCanvas,
  createAdminWorkerTimeCanvas,
  createOrResetAdminOrganizationAccessAccount,
  finalizeAdminWorkerEngagement,
  getAdminMe,
  getAdminOrganizationDetail,
  getAdminOrganizationWorkerSummary,
  getAdminOrganizations,
  getAdminWorkerEngagements,
  getAdminWorkerPurposeCanvases,
  getAdminWorkerSignificanceCanvases,
  getAdminWorkerSignificanceQuestions,
  getAdminWorkerTimeCanvases,
  getAdminWorkers,
  unassignWorkerFromOrganization,
  updateAdminOrganization,
  updateAdminWorkerEngagement,
  updateAdminWorkerPurposeCanvas,
  updateAdminWorkerSignificanceCanvas,
  updateAdminWorkerTimeCanvas,
} from "@/lib/api";
import { clearAdminToken } from "@/lib/admin-auth";
import { OrganizationOverviewTab } from "./components/organization-overview-tab";
import { OrganizationWorkspaceHero } from "./components/organization-workspace-hero";
import { OrganizationWorkersTab } from "./components/organization-workers-tab";
import { OrganizationInsightsTab } from "./components/organization-insights-tab";
import { OrganizationAccessTab } from "./components/organization-access-tab";
import { OrganizationAdminTab } from "./components/organization-admin-tab";
import { OrganizationEngagementCanvasTab } from "./components/organization-engagement-canvas-tab";
import { OrganizationPurposeCanvasTab } from "./components/organization-purpose-canvas-tab";
import { OrganizationTimeCanvasTab } from "./components/organization-time-canvas-tab";
import { OrganizationSignificanceCanvasTab } from "./components/organization-significance-canvas-tab";
import { OrganizationTimeCanvasVisual } from "./components/organization-time-canvas-visual";
import { OrganizationPurposeCanvasVisual } from "./components/organization-purpose-canvas-visual";
import { OrganizationEngagementCanvasVisual } from "./components/organization-engagement-canvas-visual";
import {
  OrganizationSignificanceCanvasVisual,
  type NormalizedSignificanceQuestion,
} from "./components/organization-significance-canvas-visual";
import {
  OrganizationCanvasesTab,
  type OrganizationCanvasTab,
} from "./components/organization-canvases-tab";
import {
  OrganizationRevenueTab,
  type OrganizationRevenueSummary,
} from "./components/organization-revenue-tab";
import {
  OrganizationWorkspaceTabs,
  type OrganizationWorkspaceTab,
} from "./components/organization-workspace-tabs";
import type {
  AdminMe,
  AdminOrganization,
  AdminOrganizationAccessAccount,
  AdminOrganizationCreate,
  AdminOrganizationType,
  AdminOrganizationUpdate,
  AdminOrganizationWorkerSummary,
  AdminWorker,
  AdminWorkerEngagement,
  AdminWorkerEngagementCreate,
  AdminWorkerEngagementState,
  AdminWorkerEngagementUpdate,
  AdminWorkerPurposeCanvas,
  AdminWorkerPurposeCanvasCreate,
  AdminWorkerPurposeCanvasUpdate,
  AdminWorkerSignificanceAnswer,
  AdminWorkerSignificanceAnswerValue,
  AdminWorkerSignificanceCanvas,
  AdminWorkerSignificanceCanvasCreate,
  AdminWorkerSignificanceCanvasUpdate,
  AdminWorkerSignificanceDimension,
  AdminWorkerSignificanceDimensionKey,
  AdminWorkerSignificanceQuestion,
  AdminWorkerSignificanceScoreMap,
  AdminWorkerTimeCanvas,
  AdminWorkerTimeCanvasCreate,
  AdminWorkerTimeCanvasUpdate,
} from "@/lib/types";

type OrganizationFormState = {
  name: string;
  code: string;
  organization_type: AdminOrganizationType;
  description: string;
  contact_email: string;
  contact_phone: string;
  calendly_event_type_uri: string;
  is_active: boolean;
};

type LeverSortMode = "highlighted" | "most_used" | "name";
type SaveIndicator = "idle" | "typing" | "saving" | "saved" | "error";


type EngagementFormState = {
  worker_id: string;
  state_type: AdminWorkerEngagementState;

  identity_text: string;
  purpose_text: string;
  missions_text: string;
  ambitions_text: string;

  career_intent_compensation: string;
  career_intent_role: string;
  career_intent_passion_criteria: string;
  career_intent_collaboration_profile: string;
  career_intent_performance_level: string;
  career_intent_responsibilities: string;

  vision_text: string;
  actions_text: string;
  objectives_text: string;

  talent_intent_foundations: string;
  talent_intent_personality: string;
  talent_intent_watch: string;
  talent_intent_next_level: string;
  talent_intent_impact_niches: string;
  talent_intent_social_contributions: string;
};

type PurposeFormState = {
  worker_id: string;
  travail_text: string;
  aspiration_text: string;
  inspiration_text: string;
  passion_text: string;
  vocation_text: string;
  formation_text: string;
};

type PurposeNodeKey =
  | "travail_text"
  | "aspiration_text"
  | "inspiration_text"
  | "passion_text"
  | "vocation_text"
  | "formation_text";

type PurposeRelationStatus = "pending" | "coherent" | "incoherent";

type PurposeRelation = {
  from: PurposeNodeKey;
  to: PurposeNodeKey;
  status: PurposeRelationStatus;
  reason: string;
};

type SignificanceFormState = {
  worker_id: string;
  answers: Record<number, AdminWorkerSignificanceAnswerValue>;
};

type TimeFormState = {
  worker_id: string;
  available_time_text: string;
  time_constraints_text: string;
  time_energy_text: string;
  time_rituals_text: string;
  time_priorities_text: string;
  time_risks_text: string;
};

type TimeNodeKey =
  | "available_time_text"
  | "time_constraints_text"
  | "time_energy_text"
  | "time_rituals_text"
  | "time_priorities_text"
  | "time_risks_text";

type CanvasTone =
  | "blue"
  | "purple"
  | "orange"
  | "teal"
  | "rose"
  | "amber"
  | "indigo"
  | "green"
  | "cyan";


type AdminWorkerSignificanceQuestionAnswer = {
  value: AdminWorkerSignificanceAnswerValue;
  label: string;
  scores: AdminWorkerSignificanceScoreMap;
};


const ORGANIZATION_REVENUE_SHARE_RATE = 0.75;

const EMPTY_FORM: OrganizationFormState = {
  name: "",
  code: "",
  organization_type: "agent_flix",
  description: "",
  contact_email: "",
  contact_phone: "",
  calendly_event_type_uri: "",
  is_active: true,
};

const EMPTY_ENGAGEMENT_FORM: EngagementFormState = {
  worker_id: "",
  state_type: "current",

  identity_text: "",
  purpose_text: "",
  missions_text: "",
  ambitions_text: "",

  career_intent_compensation: "",
  career_intent_role: "",
  career_intent_passion_criteria: "",
  career_intent_collaboration_profile: "",
  career_intent_performance_level: "",
  career_intent_responsibilities: "",

  vision_text: "",
  actions_text: "",
  objectives_text: "",

  talent_intent_foundations: "",
  talent_intent_personality: "",
  talent_intent_watch: "",
  talent_intent_next_level: "",
  talent_intent_impact_niches: "",
  talent_intent_social_contributions: "",
};

const EMPTY_PURPOSE_FORM: PurposeFormState = {
  worker_id: "",
  travail_text: "",
  aspiration_text: "",
  inspiration_text: "",
  passion_text: "",
  vocation_text: "",
  formation_text: "",
};

const EMPTY_SIGNIFICANCE_FORM: SignificanceFormState = {
  worker_id: "",
  answers: {},
};

const EMPTY_TIME_FORM: TimeFormState = {
  worker_id: "",
  available_time_text: "",
  time_constraints_text: "",
  time_energy_text: "",
  time_rituals_text: "",
  time_priorities_text: "",
  time_risks_text: "",
};

const PURPOSE_NODES: Array<{
  key: PurposeNodeKey;
  label: string;
  subtitle: string;
  placeholder: string;
  tone: CanvasTone;
  x: number;
  y: number;
}> = [
  {
    key: "travail_text",
    label: "Travail",
    subtitle: "Ce que le worker fait, produit ou porte concrètement",
    placeholder: "Phrase courte sur le travail réel, le rôle ou l’activité portée...",
    tone: "blue",
    x: 50,
    y: 10,
  },
  {
    key: "aspiration_text",
    label: "Aspiration",
    subtitle: "Ce vers quoi le worker souhaite évoluer",
    placeholder: "Phrase courte sur l’aspiration professionnelle ou personnelle...",
    tone: "purple",
    x: 85,
    y: 32,
  },
  {
    key: "inspiration_text",
    label: "Inspiration",
    subtitle: "Ce qui nourrit, influence ou élève sa trajectoire",
    placeholder: "Phrase courte sur ce qui inspire le worker...",
    tone: "teal",
    x: 85,
    y: 72,
  },
  {
    key: "passion_text",
    label: "Passion",
    subtitle: "Ce qui donne de l’énergie et de l’élan",
    placeholder: "Phrase courte sur ce qui donne de l’énergie...",
    tone: "orange",
    x: 50,
    y: 90,
  },
  {
    key: "vocation_text",
    label: "Vocation",
    subtitle: "La contribution profonde que le worker sent devoir porter",
    placeholder: "Phrase courte sur la vocation ou la contribution profonde...",
    tone: "green",
    x: 15,
    y: 72,
  },
  {
    key: "formation_text",
    label: "Formation",
    subtitle: "Ce qu’il faut apprendre, renforcer ou développer",
    placeholder: "Phrase courte sur les apprentissages ou développements nécessaires...",
    tone: "rose",
    x: 15,
    y: 32,
  },
];

const TIME_NODES: Array<{
  key: TimeNodeKey;
  label: string;
  subtitle: string;
  placeholder: string;
  tone: CanvasTone;
}> = [
  {
    key: "available_time_text",
    label: "Available Time",
    subtitle: "Temps réellement disponible pour exécuter les actions",
    placeholder: "Ex: 3 créneaux de 45 minutes par semaine, plutôt le matin...",
    tone: "blue",
  },
  {
    key: "time_constraints_text",
    label: "Time Constraints",
    subtitle: "Contraintes horaires, charge, obligations et limites",
    placeholder: "Ex: réunions longues, enfants le soir, fatigue après 18h...",
    tone: "rose",
  },
  {
    key: "time_energy_text",
    label: "Energy Rhythm",
    subtitle: "Moments d’énergie haute/basse et rythme naturel",
    placeholder: "Ex: énergie forte le matin, baisse après déjeuner...",
    tone: "amber",
  },
  {
    key: "time_rituals_text",
    label: "Execution Rituals",
    subtitle: "Rituels, habitudes et routines d’exécution",
    placeholder: "Ex: revue du lundi, bloc focus mercredi, bilan vendredi...",
    tone: "teal",
  },
  {
    key: "time_priorities_text",
    label: "Priorities",
    subtitle: "Priorités temporelles et arbitrages importants",
    placeholder: "Ex: privilégier la progression carrière avant les tâches secondaires...",
    tone: "purple",
  },
  {
    key: "time_risks_text",
    label: "Risks",
    subtitle: "Risques de décrochage, surcharge ou non-exécution",
    placeholder: "Ex: procrastination, imprévus, fatigue, manque de clarté...",
    tone: "orange",
  },
];

const ZERO_SIGNIFICANCE_SCORES: AdminWorkerSignificanceScoreMap = {
  raison: 0,
  metier: 0,
  occupation: 0,
  corvee: 0,
  hobby: 0,
};

function significanceScores(
  partial: Partial<AdminWorkerSignificanceScoreMap>,
): AdminWorkerSignificanceScoreMap {
  return {
    ...ZERO_SIGNIFICANCE_SCORES,
    ...partial,
  };
}

function makeSignificanceQuestion(params: {
  id: number;
  text: string;
  answers: AdminWorkerSignificanceQuestionAnswer[];
}): NormalizedSignificanceQuestion {
  return {
    id: params.id,
    key: String(params.id),
    order: params.id,
    text: params.text,
    answers: params.answers,
    options: params.answers,
  };
}

const DEFAULT_SIGNIFICANCE_QUESTIONS: NormalizedSignificanceQuestion[] = [
  makeSignificanceQuestion({
    id: 1,
    text: "Le travail du worker est-il vécu comme une source de sens, de contribution ou de direction de vie ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ raison: 3 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ raison: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({ raison: 0 }) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
  makeSignificanceQuestion({
    id: 2,
    text: "Le worker parle-t-il de son activité comme d’un métier à maîtriser, avec progression et expertise ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ metier: 3 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ metier: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({ metier: 0 }) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
  makeSignificanceQuestion({
    id: 3,
    text: "Le travail semble-t-il surtout structurer le quotidien, sans forcément porter beaucoup de sens ou d’énergie ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ occupation: 3 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ occupation: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({ occupation: 0 }) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
  makeSignificanceQuestion({
    id: 4,
    text: "Le travail est-il vécu comme une contrainte, une charge, une obligation ou une corvée ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ corvee: 3 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ corvee: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({ corvee: 0 }) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
  makeSignificanceQuestion({
    id: 5,
    text: "Le worker décrit-il certains aspects de son travail comme un plaisir, un hobby ou une activité librement choisie ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ hobby: 3 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ hobby: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({ hobby: 0 }) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
  makeSignificanceQuestion({
    id: 6,
    text: "Quand le worker parle de ses difficultés, sont-elles surtout liées à un manque de sens ou d’alignement profond ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ raison: 2, corvee: 1 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ raison: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({}) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
  makeSignificanceQuestion({
    id: 7,
    text: "Les irritants exprimés concernent-ils surtout la maîtrise du métier, les compétences ou la reconnaissance professionnelle ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ metier: 2 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ metier: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({}) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
  makeSignificanceQuestion({
    id: 8,
    text: "Le worker semble-t-il fonctionner en pilote automatique, avec un travail qui occupe mais ne mobilise pas vraiment ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ occupation: 2 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ occupation: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({}) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
  makeSignificanceQuestion({
    id: 9,
    text: "Le worker montre-t-il des signes de rejet, d’épuisement ou de sentiment d’être coincé dans son travail ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ corvee: 2 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ corvee: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({}) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
  makeSignificanceQuestion({
    id: 10,
    text: "Y a-t-il une activité ou une dimension du travail que le worker ferait même sans pression externe ?",
    answers: [
      { value: "yes", label: "Oui", scores: significanceScores({ hobby: 2, raison: 1 }) },
      { value: "maybe", label: "Partiellement", scores: significanceScores({ hobby: 1 }) },
      { value: "no", label: "Non", scores: significanceScores({}) },
      { value: "unknown", label: "Non renseigné", scores: significanceScores({}) },
    ],
  }),
];


function getWorkerSubscriptionPaidExVat(worker: AdminWorker): number {
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

function normalizeSignificanceAnswerValue(
  value?: string | null,
): AdminWorkerSignificanceAnswerValue {
  if (value === "yes" || value === "no" || value === "maybe" || value === "unknown") {
    return value;
  }

  return "unknown";
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

function normalizeQuestionAnswers(
  question: AdminWorkerSignificanceQuestion | NormalizedSignificanceQuestion,
): AdminWorkerSignificanceQuestionAnswer[] {
  const rawAnswers = [
    ...((question.answers ?? []) as Array<{
      value?: string | null;
      label?: string | null;
      scores?: Partial<AdminWorkerSignificanceScoreMap> | null;
    }>),
    ...((question.options ?? []) as Array<{
      value?: string | null;
      label?: string | null;
      scores?: Partial<AdminWorkerSignificanceScoreMap> | null;
    }>),
  ];

  const normalizedAnswers = rawAnswers
    .map((answer): AdminWorkerSignificanceQuestionAnswer => {
      const value = normalizeSignificanceAnswerValue(answer.value ?? "unknown");

      return {
        value,
        label: answer.label || normalizeDisplayLabel(value),
        scores: {
          ...ZERO_SIGNIFICANCE_SCORES,
          ...(answer.scores || {}),
        },
      };
    })
    .filter(
      (answer, index, array) =>
        array.findIndex((candidate) => candidate.value === answer.value) === index,
    );

  if (normalizedAnswers.length > 0) {
    return normalizedAnswers;
  }

  return [
    {
      value: "yes",
      label: "Oui",
      scores: significanceScores({}),
    },
    {
      value: "no",
      label: "Non",
      scores: significanceScores({}),
    },
    {
      value: "maybe",
      label: "Partiellement",
      scores: significanceScores({}),
    },
    {
      value: "unknown",
      label: "Non renseigné",
      scores: significanceScores({}),
    },
  ];
}

function normalizeSignificanceQuestion(
  question: AdminWorkerSignificanceQuestion | NormalizedSignificanceQuestion,
): NormalizedSignificanceQuestion {
  const candidate = question as AdminWorkerSignificanceQuestion & {
    key?: string | null;
    order?: number | string | null;
  };

  const normalizedId = Number(candidate.id ?? candidate.order ?? 0);
  const id = Number.isFinite(normalizedId) && normalizedId > 0 ? normalizedId : 0;
  const normalizedAnswers = normalizeQuestionAnswers(question);

  return {
    id,
    key: candidate.key || String(id),
    order: Number(candidate.order ?? id),
    text: question.text || "Question non renseignée",
    answers: normalizedAnswers,
    options: normalizedAnswers,
  };
}

function normalizeSignificanceQuestions(
  questions?: Array<AdminWorkerSignificanceQuestion | NormalizedSignificanceQuestion> | null,
): NormalizedSignificanceQuestion[] {
  const normalized = (questions || [])
    .map((question) => normalizeSignificanceQuestion(question))
    .filter((question) => question.id > 0);

  return normalized.length > 0 ? normalized : DEFAULT_SIGNIFICANCE_QUESTIONS;
}

function getOrganizationTypeLabel(type?: string | null): string {
  if (type === "agent_premium") return "agent premium";
  if (type === "agent_de_reve") return "agent de rêve";
  return "agent flix";
}

function getRequiredSubscriptionForOrganizationType(
  type?: string | null,
): "classique" | "flix" | "executif" {
  if (type === "agent_premium") return "flix";
  if (type === "agent_de_reve") return "executif";
  return "classique";
}

function isWorkerCompatibleWithOrganization(
  worker: AdminWorker,
  organization: AdminOrganization | null,
): boolean {
  if (!organization) return false;

  const requiredPack = getRequiredSubscriptionForOrganizationType(
    organization.organization_type,
  );

  return worker.subscription_pack === requiredPack;
}

function normalizePurposeText(value?: string | null): string {
  return (value || "").trim();
}

function tokenizePurposeText(value: string): Set<string> {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "dans",
    "pour",
    "avec",
    "les",
    "des",
    "une",
    "sur",
    "qui",
    "que",
    "est",
    "mon",
    "mes",
    "aux",
    "par",
    "leur",
    "être",
    "etre",
    "work",
    "job",
    "role",
    "faire",
    "plus",
    "bien",
  ]);

  return new Set(
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 4 && !stopWords.has(item)),
  );
}

function getPurposeRelationStatus(
  left: string,
  right: string,
): { status: PurposeRelationStatus; reason: string } {
  const normalizedLeft = normalizePurposeText(left);
  const normalizedRight = normalizePurposeText(right);

  if (!normalizedLeft || !normalizedRight) {
    return {
      status: "pending",
      reason: "Relation pending until both nodes are filled.",
    };
  }

  const leftTokens = tokenizePurposeText(normalizedLeft);
  const rightTokens = tokenizePurposeText(normalizedRight);

  const overlap = [...leftTokens].filter((token) => rightTokens.has(token));

  if (overlap.length > 0) {
    return {
      status: "coherent",
      reason: `Shared meaning detected through: ${overlap.slice(0, 4).join(", ")}.`,
    };
  }

  const leftLower = normalizedLeft.toLowerCase();
  const rightLower = normalizedRight.toLowerCase();

  if (leftLower.includes(rightLower) || rightLower.includes(leftLower)) {
    return {
      status: "coherent",
      reason: "One statement reinforces or contains the other.",
    };
  }

  return {
    status: "incoherent",
    reason: "No obvious coherence detected between both statements.",
  };
}

function buildPurposeRelations(form: PurposeFormState): PurposeRelation[] {
  const relations: PurposeRelation[] = [];

  PURPOSE_NODES.forEach((fromNode, fromIndex) => {
    PURPOSE_NODES.slice(fromIndex + 1).forEach((toNode) => {
      const result = getPurposeRelationStatus(form[fromNode.key], form[toNode.key]);

      relations.push({
        from: fromNode.key,
        to: toNode.key,
        status: result.status,
        reason: result.reason,
      });
    });
  });

  return relations;
}

function getPurposeCoherenceScore(relations: PurposeRelation[]): number {
  const completedRelations = relations.filter((relation) => relation.status !== "pending");

  if (completedRelations.length === 0) {
    return 0;
  }

  const coherentRelations = completedRelations.filter(
    (relation) => relation.status === "coherent",
  );

  return Math.round((coherentRelations.length / completedRelations.length) * 100);
}

function getPurposeCoherenceStatus(score: number, completedRelations: number): string {
  if (completedRelations === 0) return "not_evaluated";
  if (score >= 75) return "coherent";
  if (score >= 40) return "partially_coherent";
  return "incoherent";
}

function buildPurposeRelationMapJson(relations: PurposeRelation[]) {
  return relations.map((relation) => {
    const fromNode = PURPOSE_NODES.find((node) => node.key === relation.from);
    const toNode = PURPOSE_NODES.find((node) => node.key === relation.to);

    return {
      from: relation.from,
      to: relation.to,
      source_node_key: relation.from,
      target_node_key: relation.to,
      source_label: fromNode?.label ?? relation.from,
      target_label: toNode?.label ?? relation.to,
      status: relation.status,
      is_coherent: relation.status === "coherent",
      reason: relation.reason,
      rationale: relation.reason,
    };
  });
}

function purposeFormFromItem(item: AdminWorkerPurposeCanvas): PurposeFormState {
  return {
    worker_id: String(item.worker_id),
    travail_text: item.travail_text || "",
    aspiration_text: item.aspiration_text || "",
    inspiration_text: item.inspiration_text || "",
    passion_text: item.passion_text || "",
    vocation_text: item.vocation_text || "",
    formation_text: item.formation_text || "",
  };
}

function timeFormFromItem(item: AdminWorkerTimeCanvas): TimeFormState {
  return {
    worker_id: String(item.worker_id),
    available_time_text: item.available_time_text || "",
    time_constraints_text: item.time_constraints_text || "",
    time_energy_text: item.time_energy_text || "",
    time_rituals_text: item.time_rituals_text || "",
    time_priorities_text: item.time_priorities_text || "",
    time_risks_text: item.time_risks_text || "",
  };
}

function getTimeCanvasCompletedNodes(form: TimeFormState): number {
  return TIME_NODES.reduce((count, node) => {
    const value = form[node.key] || "";
    return value.trim() ? count + 1 : count;
  }, 0);
}

function getTimeCanvasReadinessScore(form: TimeFormState): number {
  const completedNodes = getTimeCanvasCompletedNodes(form);

  if (completedNodes === 0) {
    return 0;
  }

  const baseScore = Math.round((completedNodes / TIME_NODES.length) * 100);

  const hasAvailableTime = Boolean(form.available_time_text.trim());
  const hasPriorities = Boolean(form.time_priorities_text.trim());
  const hasConstraints = Boolean(form.time_constraints_text.trim());
  const hasRisks = Boolean(form.time_risks_text.trim());

  let adjustment = 0;

  if (hasAvailableTime) adjustment += 5;
  if (hasPriorities) adjustment += 5;
  if (hasConstraints) adjustment += 3;
  if (hasRisks) adjustment += 2;

  return Math.min(100, baseScore + adjustment);
}

function getTimeCanvasReadinessStatus(score: number, completedNodes: number): string {
  if (completedNodes === 0) return "not_evaluated";
  if (score >= 80) return "ready";
  if (score >= 50) return "partially_ready";
  return "at_risk";
}

function buildTimeCanvasSummary(form: TimeFormState): string {
  const completedNodes = getTimeCanvasCompletedNodes(form);
  const readinessScore = getTimeCanvasReadinessScore(form);
  const readinessStatus = getTimeCanvasReadinessStatus(readinessScore, completedNodes);

  if (completedNodes === 0) {
    return "Time Canvas is not evaluated yet because no time execution signal is available.";
  }

  const parts: string[] = [
    `Time Canvas readiness score: ${readinessScore}%.`,
    `Readiness status: ${readinessStatus}.`,
    `${completedNodes}/${TIME_NODES.length} time execution node(s) completed.`,
  ];

  if (form.available_time_text.trim()) {
    parts.push("Available execution time has been captured.");
  }

  if (form.time_constraints_text.trim()) {
    parts.push("Time constraints have been identified.");
  }

  if (form.time_energy_text.trim()) {
    parts.push("Energy rhythm has been captured.");
  }

  if (form.time_rituals_text.trim()) {
    parts.push("Execution rituals or routines have been captured.");
  }

  if (form.time_priorities_text.trim()) {
    parts.push("Time priorities have been clarified.");
  }

  if (form.time_risks_text.trim()) {
    parts.push("Execution risks have been identified.");
  }

  return parts.join(" ");
}

function engagementFormFromItem(item: AdminWorkerEngagement): EngagementFormState {
  return {
    worker_id: String(item.worker_id),
    state_type: item.state_type,

    identity_text: item.identity_text || "",
    purpose_text: item.purpose_text || "",
    missions_text: item.missions_text || "",
    ambitions_text: item.ambitions_text || "",

    career_intent_compensation: item.career_intent_compensation || "",
    career_intent_role: item.career_intent_role || "",
    career_intent_passion_criteria: item.career_intent_passion_criteria || "",
    career_intent_collaboration_profile: item.career_intent_collaboration_profile || "",
    career_intent_performance_level: item.career_intent_performance_level || "",
    career_intent_responsibilities: item.career_intent_responsibilities || "",

    vision_text: item.vision_text || "",
    actions_text: item.actions_text || "",
    objectives_text: item.objectives_text || "",

    talent_intent_foundations: item.talent_intent_foundations || "",
    talent_intent_personality: item.talent_intent_personality || "",
    talent_intent_watch: item.talent_intent_watch || "",
    talent_intent_next_level: item.talent_intent_next_level || "",
    talent_intent_impact_niches: item.talent_intent_impact_niches || "",
    talent_intent_social_contributions: item.talent_intent_social_contributions || "",
  };
}

function significanceFormFromItem(item: AdminWorkerSignificanceCanvas): SignificanceFormState {
  const answers: Record<number, AdminWorkerSignificanceAnswerValue> = {};

  (item.answers_json || []).forEach((rawAnswer) => {
    const answer = rawAnswer as AdminWorkerSignificanceAnswer;
    const questionId = Number(answer.question_id);
    const rawValue = answer.answer ?? answer.answer_value ?? answer.answer_key ?? "unknown";
    const value = normalizeSignificanceAnswerValue(String(rawValue));

    if (Number.isFinite(questionId) && questionId > 0) {
      answers[questionId] = value;
    }
  });

  return {
    worker_id: String(item.worker_id),
    answers,
  };
}

function buildSignificanceAnswers(
  form: SignificanceFormState,
  questions: NormalizedSignificanceQuestion[],
): AdminWorkerSignificanceAnswer[] {
  return normalizeSignificanceQuestions(questions).map((question) => {
    const selectedValue = form.answers[question.id] || "unknown";
    const questionAnswers = question.answers;

    const option =
      questionAnswers.find((candidate) => candidate.value === selectedValue) ??
      questionAnswers.find((candidate) => candidate.value === "unknown") ??
      questionAnswers[0];

    return {
      question_id: question.id,
      question_key: question.key,
      question_text: question.text,
      answer: selectedValue,
      answer_value: selectedValue,
      answer_key: selectedValue,
      answer_label: option?.label ?? "Non renseigné",
      scores: option?.scores ?? ZERO_SIGNIFICANCE_SCORES,
    };
  });
}

function calculateSignificanceScores(
  answers: AdminWorkerSignificanceAnswer[],
): AdminWorkerSignificanceScoreMap {
  return answers.reduce<AdminWorkerSignificanceScoreMap>(
    (acc, answer) => {
      return {
        raison: acc.raison + Number(answer.scores?.raison ?? 0),
        metier: acc.metier + Number(answer.scores?.metier ?? 0),
        occupation: acc.occupation + Number(answer.scores?.occupation ?? 0),
        corvee: acc.corvee + Number(answer.scores?.corvee ?? 0),
        hobby: acc.hobby + Number(answer.scores?.hobby ?? 0),
      };
    },
    { ...ZERO_SIGNIFICANCE_SCORES },
  );
}

function calculateSignificanceDimensions(
  scoresMap: AdminWorkerSignificanceScoreMap,
): AdminWorkerSignificanceDimension[] {
  const entries: Array<{
    key: AdminWorkerSignificanceDimensionKey;
    label: string;
    tone: CanvasTone;
  }> = [
    { key: "raison", label: "Raison", tone: "blue" },
    { key: "metier", label: "Métier", tone: "teal" },
    { key: "occupation", label: "Occupation", tone: "orange" },
    { key: "corvee", label: "Corvée", tone: "rose" },
    { key: "hobby", label: "Hobby", tone: "purple" },
  ];

  const total = entries.reduce((sum, item) => sum + Number(scoresMap[item.key] ?? 0), 0);

  return entries.map((item) => {
    const value = Number(scoresMap[item.key] ?? 0);
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return {
      key: item.key,
      label: item.label,
      score: value,
      percentage,
      tone: item.tone,
    };
  });
}

function getDominantSignificanceDimension(
  dimensions: AdminWorkerSignificanceDimension[],
): AdminWorkerSignificanceDimension | null {
  if (dimensions.length === 0) return null;

  const sorted = [...dimensions].sort((left, right) => right.score - left.score);
  const top = sorted[0];

  if (!top || top.score <= 0) return null;

  return top;
}

function buildSignificanceAnalysisSummary(
  dimensions: AdminWorkerSignificanceDimension[],
): string {
  const dominant = getDominantSignificanceDimension(dimensions);

  if (!dominant) {
    return "No dominant significance pattern detected yet. Complete the questionnaire to generate a first reading.";
  }

  const ranked = [...dimensions]
    .filter((dimension) => dimension.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((dimension) => `${dimension.label} ${dimension.percentage}%`)
    .join(" · ");

  return `Dominant significance pattern: ${dominant.label}. Distribution: ${ranked}.`;
}

export default function AdminOrganizationsPage() {
  return (
    <AdminGuard>
      <AdminOrganizationsContent />
    </AdminGuard>
  );
}

function AdminOrganizationsContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [workers, setWorkers] = useState<AdminWorker[]>([]);
  const [assignedWorkers, setAssignedWorkers] = useState<AdminWorker[]>([]);

  const [selectedWorkerSummary, setSelectedWorkerSummary] =
    useState<AdminOrganizationWorkerSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [workerSummaryLoading, setWorkerSummaryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [accessAccountSaving, setAccessAccountSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [accessAccountResult, setAccessAccountResult] =
    useState<AdminOrganizationAccessAccount | null>(null);

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [editingOrganizationId, setEditingOrganizationId] = useState<number | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<OrganizationWorkspaceTab>("overview");

  const [activeCanvasTab, setActiveCanvasTab] =
  useState<OrganizationCanvasTab>("engagement");

  const [workerSearch, setWorkerSearch] = useState("");
  const [selectedWorkerIdToAssign, setSelectedWorkerIdToAssign] = useState<string>("");

  const [leverSearch, setLeverSearch] = useState("");
  const [leverCategoryFilter, setLeverCategoryFilter] = useState<string>("all");
  const [leverSortMode, setLeverSortMode] = useState<LeverSortMode>("highlighted");

  const [form, setForm] = useState<OrganizationFormState>(EMPTY_FORM);

  const [engagementSelectionState, setEngagementSelectionState] =
    useState<AdminWorkerEngagementState>("current");
  const [engagementCanvasLoaded, setEngagementCanvasLoaded] = useState(false);
  const [engagementsLoading, setEngagementsLoading] = useState(false);
  const [engagementSaving, setEngagementSaving] = useState(false);
  const [engagementFinalizing, setEngagementFinalizing] = useState(false);
  const [editingEngagementId, setEditingEngagementId] = useState<number | null>(null);
  const [editingEngagement, setEditingEngagement] = useState<AdminWorkerEngagement | null>(null);
  const [engagementForm, setEngagementForm] =
    useState<EngagementFormState>(EMPTY_ENGAGEMENT_FORM);
  const [engagementSaveState, setEngagementSaveState] = useState<SaveIndicator>("idle");
  const [lastSavedAtLabel, setLastSavedAtLabel] = useState<string | null>(null);

  const [purposeCanvasLoaded, setPurposeCanvasLoaded] = useState(false);
  const [purposeLoading, setPurposeLoading] = useState(false);
  const [purposeSaving, setPurposeSaving] = useState(false);
  const [editingPurposeCanvasId, setEditingPurposeCanvasId] = useState<number | null>(null);
  const [editingPurposeCanvas, setEditingPurposeCanvas] =
    useState<AdminWorkerPurposeCanvas | null>(null);
  const [purposeForm, setPurposeForm] = useState<PurposeFormState>(EMPTY_PURPOSE_FORM);
  const [purposeSaveState, setPurposeSaveState] = useState<SaveIndicator>("idle");
  const [purposeLastSavedAtLabel, setPurposeLastSavedAtLabel] = useState<string | null>(null);

  const [timeCanvasLoaded, setTimeCanvasLoaded] = useState(false);
  const [timeLoading, setTimeLoading] = useState(false);
  const [timeSaving, setTimeSaving] = useState(false);
  const [editingTimeCanvasId, setEditingTimeCanvasId] = useState<number | null>(null);
  const [editingTimeCanvas, setEditingTimeCanvas] =
    useState<AdminWorkerTimeCanvas | null>(null);
  const [timeForm, setTimeForm] = useState<TimeFormState>(EMPTY_TIME_FORM);
  const [timeSaveState, setTimeSaveState] = useState<SaveIndicator>("idle");
  const [timeLastSavedAtLabel, setTimeLastSavedAtLabel] = useState<string | null>(null);

  const [significanceQuestions, setSignificanceQuestions] =
    useState<NormalizedSignificanceQuestion[]>(DEFAULT_SIGNIFICANCE_QUESTIONS);
  const [significanceCanvasLoaded, setSignificanceCanvasLoaded] = useState(false);
  const [significanceLoading, setSignificanceLoading] = useState(false);
  const [significanceSaving, setSignificanceSaving] = useState(false);
  const [editingSignificanceCanvasId, setEditingSignificanceCanvasId] =
    useState<number | null>(null);
  const [editingSignificanceCanvas, setEditingSignificanceCanvas] =
    useState<AdminWorkerSignificanceCanvas | null>(null);
  const [significanceForm, setSignificanceForm] =
    useState<SignificanceFormState>(EMPTY_SIGNIFICANCE_FORM);
  const [significanceSaveState, setSignificanceSaveState] = useState<SaveIndicator>("idle");
  const [significanceLastSavedAtLabel, setSignificanceLastSavedAtLabel] =
    useState<string | null>(null);

  const engagementAutoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextEngagementAutosaveRef = useRef<boolean>(true);

  const purposeAutoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextPurposeAutosaveRef = useRef<boolean>(true);

  const timeAutoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextTimeAutosaveRef = useRef<boolean>(true);

  const significanceAutoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSignificanceAutosaveRef = useRef<boolean>(true);

  const isPlatformAdmin = admin?.role === "admin";
  const selectedOrganization =
    organizations.find((item) => item.id === selectedOrganizationId) ?? null;

  const organizationRevenueSummary = useMemo<OrganizationRevenueSummary>(() => {
    const grossSubscriptionRevenueExVat = assignedWorkers.reduce((total, worker) => {
      return total + getWorkerSubscriptionPaidExVat(worker);
    }, 0);

    const paidWorkerCount = assignedWorkers.filter(
      (worker) => getWorkerSubscriptionPaidExVat(worker) > 0,
    ).length;

    const organizationRevenueExVat =
      grossSubscriptionRevenueExVat * ORGANIZATION_REVENUE_SHARE_RATE;

    return {
      assignedWorkerCount: assignedWorkers.length,
      paidWorkerCount,
      grossSubscriptionRevenueExVat,
      organizationRevenueExVat,
      platformRevenueExVat: grossSubscriptionRevenueExVat - organizationRevenueExVat,
      revenueShareRate: ORGANIZATION_REVENUE_SHARE_RATE,
    };
  }, [assignedWorkers]);

  const isFutureStateLocked =
    engagementCanvasLoaded &&
    engagementSelectionState === "future" &&
    Boolean(editingEngagement?.is_finalized);

  const timeCompletedNodes = useMemo(
    () => getTimeCanvasCompletedNodes(timeForm),
    [timeForm],
  );

  const timeReadinessScore = useMemo(
    () => getTimeCanvasReadinessScore(timeForm),
    [timeForm],
  );

  const timeReadinessStatus = useMemo(
    () => getTimeCanvasReadinessStatus(timeReadinessScore, timeCompletedNodes),
    [timeReadinessScore, timeCompletedNodes],
  );

  const timeSummary = useMemo(() => buildTimeCanvasSummary(timeForm), [timeForm]);

  const significanceAnswers = useMemo(
    () => buildSignificanceAnswers(significanceForm, significanceQuestions),
    [significanceForm, significanceQuestions],
  );

  const significanceScoresMap = useMemo(
    () => calculateSignificanceScores(significanceAnswers),
    [significanceAnswers],
  );

  const significanceDimensions = useMemo(
    () => calculateSignificanceDimensions(significanceScoresMap),
    [significanceScoresMap],
  );

  const significanceAnalysisSummary = useMemo(
    () => buildSignificanceAnalysisSummary(significanceDimensions),
    [significanceDimensions],
  );

  useEffect(() => {
    async function load() {
      try {
        setError(null);

        const me = await getAdminMe();
        setAdmin(me);

        const orgs = await getAdminOrganizations();
        const sortedOrgs = [...orgs].sort((a, b) => a.name.localeCompare(b.name));
        setOrganizations(sortedOrgs);

        try {
          const questionData = await getAdminWorkerSignificanceQuestions();
          setSignificanceQuestions(normalizeSignificanceQuestions(questionData));
        } catch {
          setSignificanceQuestions(DEFAULT_SIGNIFICANCE_QUESTIONS);
        }

        const firstOrganizationId =
          me.role === "organization"
            ? me.organization_id ?? sortedOrgs[0]?.id ?? null
            : sortedOrgs[0]?.id ?? null;

        setSelectedOrganizationId(firstOrganizationId);

        if (firstOrganizationId) {
          const detail = await getAdminOrganizationDetail(firstOrganizationId);

          setAssignedWorkers(detail.workers);
          setForm({
            name: detail.organization.name,
            code: detail.organization.code || "",
            organization_type: detail.organization.organization_type || "agent_flix",
            description: detail.organization.description || "",
            contact_email: detail.organization.contact_email || "",
            contact_phone: detail.organization.contact_phone || "",
            calendly_event_type_uri: detail.organization.calendly_event_type_uri || "",
            is_active: detail.organization.is_active,
          });
          setEditingOrganizationId(detail.organization.id);

          const firstWorkerId = detail.workers[0]?.id ?? null;
          setSelectedWorkerId(firstWorkerId);

          if (firstWorkerId) {
            const summary = await getAdminOrganizationWorkerSummary(
              firstOrganizationId,
              firstWorkerId,
            );
            setSelectedWorkerSummary(summary);
            resetEngagementCanvas(firstWorkerId, "current");
            resetPurposeCanvas(firstWorkerId);
            resetTimeCanvas(firstWorkerId);
            resetSignificanceCanvas(firstWorkerId);
          } else {
            setSelectedWorkerSummary(null);
            resetEngagementCanvas(null, "current");
            resetPurposeCanvas(null);
            resetTimeCanvas(null);
            resetSignificanceCanvas(null);
          }
        } else {
          setAssignedWorkers([]);
          setEditingOrganizationId(null);
          setSelectedWorkerId(null);
          setSelectedWorkerSummary(null);
          setForm(EMPTY_FORM);
          resetEngagementCanvas(null, "current");
          resetPurposeCanvas(null);
          resetTimeCanvas(null);
          resetSignificanceCanvas(null);
        }

        if (me.role === "admin") {
          const allWorkers = await getAdminWorkers();
          setWorkers(allWorkers);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load organizations.");
      } finally {
        setLoading(false);
      }
    }

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogout() {
    clearAdminToken();
    window.location.href = "/admin/login";
  }

  function resetEngagementCanvas(
    nextWorkerId?: number | null,
    nextState?: AdminWorkerEngagementState,
  ) {
    if (engagementAutoSaveTimerRef.current) {
      clearTimeout(engagementAutoSaveTimerRef.current);
      engagementAutoSaveTimerRef.current = null;
    }

    const effectiveState = nextState ?? engagementSelectionState;

    if (nextState && nextState !== engagementSelectionState) {
      setEngagementSelectionState(nextState);
    }

    setEditingEngagementId(null);
    setEditingEngagement(null);
    setEngagementForm({
      ...EMPTY_ENGAGEMENT_FORM,
      worker_id: nextWorkerId ? String(nextWorkerId) : "",
      state_type: effectiveState,
    });
    setEngagementCanvasLoaded(false);
    setEngagementSaveState("idle");
    setLastSavedAtLabel(null);
    skipNextEngagementAutosaveRef.current = true;
  }

  function resetPurposeCanvas(nextWorkerId?: number | null) {
    if (purposeAutoSaveTimerRef.current) {
      clearTimeout(purposeAutoSaveTimerRef.current);
      purposeAutoSaveTimerRef.current = null;
    }

    setEditingPurposeCanvasId(null);
    setEditingPurposeCanvas(null);
    setPurposeForm({
      ...EMPTY_PURPOSE_FORM,
      worker_id: nextWorkerId ? String(nextWorkerId) : "",
    });
    setPurposeCanvasLoaded(false);
    setPurposeSaveState("idle");
    setPurposeLastSavedAtLabel(null);
    skipNextPurposeAutosaveRef.current = true;
  }

  function resetTimeCanvas(nextWorkerId?: number | null) {
    if (timeAutoSaveTimerRef.current) {
      clearTimeout(timeAutoSaveTimerRef.current);
      timeAutoSaveTimerRef.current = null;
    }

    setEditingTimeCanvasId(null);
    setEditingTimeCanvas(null);
    setTimeForm({
      ...EMPTY_TIME_FORM,
      worker_id: nextWorkerId ? String(nextWorkerId) : "",
    });
    setTimeCanvasLoaded(false);
    setTimeSaveState("idle");
    setTimeLastSavedAtLabel(null);
    skipNextTimeAutosaveRef.current = true;
  }

  function resetSignificanceCanvas(nextWorkerId?: number | null) {
    if (significanceAutoSaveTimerRef.current) {
      clearTimeout(significanceAutoSaveTimerRef.current);
      significanceAutoSaveTimerRef.current = null;
    }

    setEditingSignificanceCanvasId(null);
    setEditingSignificanceCanvas(null);
    setSignificanceForm({
      ...EMPTY_SIGNIFICANCE_FORM,
      worker_id: nextWorkerId ? String(nextWorkerId) : "",
    });
    setSignificanceCanvasLoaded(false);
    setSignificanceSaveState("idle");
    setSignificanceLastSavedAtLabel(null);
    skipNextSignificanceAutosaveRef.current = true;
  }

  function stampEngagementSavedNow() {
    setLastSavedAtLabel(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setEngagementSaveState("saved");
  }

  function stampPurposeSavedNow() {
    setPurposeLastSavedAtLabel(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setPurposeSaveState("saved");
  }

  function stampTimeSavedNow() {
    setTimeLastSavedAtLabel(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setTimeSaveState("saved");
  }

  function stampSignificanceSavedNow() {
    setSignificanceLastSavedAtLabel(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setSignificanceSaveState("saved");
  }

    async function openOrganization(organizationId: number) {
    setSelectedOrganizationId(organizationId);
    setActiveWorkspaceTab("overview");
    setActiveCanvasTab("engagement");
    setError(null);
    setAccessAccountResult(null);
    setDetailLoading(true);
    setSelectedWorkerIdToAssign("");
    setSelectedWorkerId(null);
    setSelectedWorkerSummary(null);
    setLeverSearch("");
    setLeverCategoryFilter("all");
    setLeverSortMode("highlighted");
    resetEngagementCanvas(null, "current");
    resetPurposeCanvas(null);
    resetTimeCanvas(null);
    resetSignificanceCanvas(null);

    try {
      const detail = await getAdminOrganizationDetail(organizationId);

      setAssignedWorkers(detail.workers);
      setEditingOrganizationId(detail.organization.id);
      setForm({
        name: detail.organization.name,
        code: detail.organization.code || "",
        organization_type: detail.organization.organization_type || "agent_flix",
        description: detail.organization.description || "",
        contact_email: detail.organization.contact_email || "",
        contact_phone: detail.organization.contact_phone || "",
        calendly_event_type_uri: detail.organization.calendly_event_type_uri || "",
        is_active: detail.organization.is_active,
      });

      const firstWorkerId = detail.workers[0]?.id ?? null;
      setSelectedWorkerId(firstWorkerId);

      if (firstWorkerId) {
        setWorkerSummaryLoading(true);
        try {
          const summary = await getAdminOrganizationWorkerSummary(organizationId, firstWorkerId);
          setSelectedWorkerSummary(summary);
          resetEngagementCanvas(firstWorkerId, "current");
          resetPurposeCanvas(firstWorkerId);
          resetTimeCanvas(firstWorkerId);
          resetSignificanceCanvas(firstWorkerId);
        } finally {
          setWorkerSummaryLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load organization detail.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function openWorker(workerId: number) {
    if (!selectedOrganizationId) return;

    setSelectedWorkerId(workerId);
    setActiveWorkspaceTab("insights");
    setActiveCanvasTab("engagement");
    setWorkerSummaryLoading(true);
    setError(null);
    setLeverSearch("");
    setLeverCategoryFilter("all");
    setLeverSortMode("highlighted");
    resetEngagementCanvas(workerId, engagementSelectionState);
    resetPurposeCanvas(workerId);
    resetTimeCanvas(workerId);
    resetSignificanceCanvas(workerId);

    try {
      const summary = await getAdminOrganizationWorkerSummary(selectedOrganizationId, workerId);
      setSelectedWorkerSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load worker summary.");
    } finally {
      setWorkerSummaryLoading(false);
    }
  }

  function handleNewOrganization() {
  setEditingOrganizationId(null);
  setActiveWorkspaceTab("organizations");
  setActiveCanvasTab("engagement");
  setSelectedOrganizationId(null);
  setAssignedWorkers([]);
  setSelectedWorkerId(null);
  setSelectedWorkerSummary(null);
  setSelectedWorkerIdToAssign("");
  setAccessAccountResult(null);
  setForm(EMPTY_FORM);
  setLeverSearch("");
  setLeverCategoryFilter("all");
  setLeverSortMode("highlighted");
  setActiveWorkspaceTab("organizations");
  resetEngagementCanvas(null, "current");
  resetPurposeCanvas(null);
  resetTimeCanvas(null);
  resetSignificanceCanvas(null);
}

  async function handleSaveOrganization(e: React.FormEvent) {
    e.preventDefault();
    if (!isPlatformAdmin) return;

    setSaving(true);
    setError(null);
    setAccessAccountResult(null);

    try {
      if (editingOrganizationId) {
        const payload: AdminOrganizationUpdate = {
          name: form.name.trim() || null,
          organization_type: form.organization_type,
          description: form.description.trim() || null,
          contact_email: form.contact_email.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
          calendly_event_type_uri: form.calendly_event_type_uri.trim() || null,
          is_active: form.is_active,
        };

        const updated = await updateAdminOrganization(editingOrganizationId, payload);

        setOrganizations((prev) =>
          prev
            .map((item) => (item.id === updated.id ? updated : item))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );

        setForm((prev) => ({
          ...prev,
          code: updated.code || "",
          organization_type: updated.organization_type || "agent_flix",
          calendly_event_type_uri: updated.calendly_event_type_uri || "",
        }));
      } else {
        const payload: AdminOrganizationCreate = {
          name: form.name.trim(),
          organization_type: form.organization_type,
          description: form.description.trim() || null,
          contact_email: form.contact_email.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
          calendly_event_type_uri: form.calendly_event_type_uri.trim() || null,
          is_active: form.is_active,
        };

        const created = await createAdminOrganization(payload);

        setOrganizations((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
        );

        await openOrganization(created.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save organization.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateOrResetAccessAccount() {
    if (!isPlatformAdmin || !selectedOrganizationId) return;

    setAccessAccountSaving(true);
    setError(null);
    setAccessAccountResult(null);

    try {
      const result = await createOrResetAdminOrganizationAccessAccount(selectedOrganizationId, {
        email: form.contact_email.trim() || null,
      });

      setAccessAccountResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create or reset organization access account.",
      );
    } finally {
      setAccessAccountSaving(false);
    }
  }

  async function handleAssignWorker() {
    if (!isPlatformAdmin || !selectedOrganizationId || !selectedWorkerIdToAssign) return;

    setAssigning(true);
    setError(null);

    try {
      const assignedWorkerId = Number(selectedWorkerIdToAssign);

      await assignWorkerToOrganization(selectedOrganizationId, assignedWorkerId);

      const detail = await getAdminOrganizationDetail(selectedOrganizationId);
      setAssignedWorkers(detail.workers);

      const allWorkers = await getAdminWorkers();
      setWorkers(allWorkers);

      setSelectedWorkerIdToAssign("");
      setSelectedWorkerId(assignedWorkerId);
      setActiveCanvasTab("engagement");
      setActiveWorkspaceTab("insights");

      const summary = await getAdminOrganizationWorkerSummary(
        selectedOrganizationId,
        assignedWorkerId,
      );

      setSelectedWorkerSummary(summary);
      resetEngagementCanvas(assignedWorkerId, "current");
      resetPurposeCanvas(assignedWorkerId);
      resetTimeCanvas(assignedWorkerId);
      resetSignificanceCanvas(assignedWorkerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign worker.");
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassignWorker(workerId: number) {
    if (!isPlatformAdmin || !selectedOrganizationId) return;

    setAssigning(true);
    setError(null);

    try {
      await unassignWorkerFromOrganization(selectedOrganizationId, workerId);

      const detail = await getAdminOrganizationDetail(selectedOrganizationId);
      setAssignedWorkers(detail.workers);

      const allWorkers = await getAdminWorkers();
      setWorkers(allWorkers);

      if (selectedWorkerId === workerId) {
        const fallbackWorkerId = detail.workers[0]?.id ?? null;

        setSelectedWorkerId(fallbackWorkerId);
        resetEngagementCanvas(fallbackWorkerId, "current");
        resetPurposeCanvas(fallbackWorkerId);
        resetTimeCanvas(fallbackWorkerId);
        resetSignificanceCanvas(fallbackWorkerId);

        if (fallbackWorkerId) {
          const summary = await getAdminOrganizationWorkerSummary(
            selectedOrganizationId,
            fallbackWorkerId,
          );
          setSelectedWorkerSummary(summary);
        } else {
          setSelectedWorkerSummary(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unassign worker.");
    } finally {
      setAssigning(false);
    }
  }

  async function handleLoadEngagementCanvas() {
    if (!selectedWorkerId) {
      setError("Please select a worker first.");
      return;
    }

    setEngagementsLoading(true);
    setError(null);
    setEngagementSaveState("idle");
    setLastSavedAtLabel(null);

    try {
      const matches = await getAdminWorkerEngagements({
        worker_id: selectedWorkerId,
        state_type: engagementSelectionState,
      });

      const existing = matches[0] ?? null;

      if (existing) {
        setEditingEngagementId(existing.id);
        setEditingEngagement(existing);
        setEngagementForm(engagementFormFromItem(existing));
      } else {
        setEditingEngagementId(null);
        setEditingEngagement(null);
        setEngagementForm({
          ...EMPTY_ENGAGEMENT_FORM,
          worker_id: String(selectedWorkerId),
          state_type: engagementSelectionState,
        });
      }

      setEngagementCanvasLoaded(true);
      skipNextEngagementAutosaveRef.current = true;
    } catch (err) {
      setEngagementCanvasLoaded(false);
      setEditingEngagementId(null);
      setEditingEngagement(null);
      setEngagementForm({
        ...EMPTY_ENGAGEMENT_FORM,
        worker_id: selectedWorkerId ? String(selectedWorkerId) : "",
        state_type: engagementSelectionState,
      });
      setError(err instanceof Error ? err.message : "Failed to load engagement canvas.");
    } finally {
      setEngagementsLoading(false);
    }
  }

  async function handleSaveEngagement(options?: { silent?: boolean }) {
    const silent = Boolean(options?.silent);

    if (!engagementForm.worker_id || !engagementCanvasLoaded || isFutureStateLocked) return;

    if (!silent) {
      setEngagementSaving(true);
    }

    setError(null);
    setEngagementSaveState("saving");

    try {
      const generatedTitle =
        engagementForm.state_type === "current" ? "Current engagement" : "Future engagement";

      const basePayload = {
        title: generatedTitle,
        identity_text: engagementForm.identity_text.trim() || null,
        purpose_text: engagementForm.purpose_text.trim() || null,
        missions_text: engagementForm.missions_text.trim() || null,
        ambitions_text: engagementForm.ambitions_text.trim() || null,

        career_intent_compensation: engagementForm.career_intent_compensation.trim() || null,
        career_intent_role: engagementForm.career_intent_role.trim() || null,
        career_intent_passion_criteria:
          engagementForm.career_intent_passion_criteria.trim() || null,
        career_intent_collaboration_profile:
          engagementForm.career_intent_collaboration_profile.trim() || null,
        career_intent_performance_level:
          engagementForm.career_intent_performance_level.trim() || null,
        career_intent_responsibilities:
          engagementForm.career_intent_responsibilities.trim() || null,

        vision_text: engagementForm.vision_text.trim() || null,
        actions_text: engagementForm.actions_text.trim() || null,
        objectives_text: engagementForm.objectives_text.trim() || null,

        talent_intent_foundations: engagementForm.talent_intent_foundations.trim() || null,
        talent_intent_personality: engagementForm.talent_intent_personality.trim() || null,
        talent_intent_watch: engagementForm.talent_intent_watch.trim() || null,
        talent_intent_next_level: engagementForm.talent_intent_next_level.trim() || null,
        talent_intent_impact_niches: engagementForm.talent_intent_impact_niches.trim() || null,
        talent_intent_social_contributions:
          engagementForm.talent_intent_social_contributions.trim() || null,
      };

      if (editingEngagementId) {
        const payload: AdminWorkerEngagementUpdate = basePayload;
        const updated = await updateAdminWorkerEngagement(editingEngagementId, payload);

        setEditingEngagement(updated);
        setEngagementForm(engagementFormFromItem(updated));
        stampEngagementSavedNow();
      } else {
        const payload: AdminWorkerEngagementCreate = {
          worker_id: Number(engagementForm.worker_id),
          state_type: engagementForm.state_type,
          ...basePayload,
          is_finalized: false,
        };

        const created = await createAdminWorkerEngagement(payload);

        setEditingEngagementId(created.id);
        setEditingEngagement(created);
        setEngagementForm(engagementFormFromItem(created));
        stampEngagementSavedNow();
      }
    } catch (err) {
      setEngagementSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save engagement.");
    } finally {
      if (!silent) {
        setEngagementSaving(false);
      }
    }
  }

  async function handleFinalizeFutureEngagement() {
    if (!editingEngagementId || engagementSelectionState !== "future") return;

    setEngagementFinalizing(true);
    setError(null);

    try {
      const updated = await finalizeAdminWorkerEngagement(editingEngagementId);

      setEditingEngagement(updated);
      setEngagementForm(engagementFormFromItem(updated));
      stampEngagementSavedNow();
      skipNextEngagementAutosaveRef.current = true;
    } catch (err) {
      setEngagementSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to confirm future state.");
    } finally {
      setEngagementFinalizing(false);
    }
  }

  async function handleLoadPurposeCanvas() {
    if (!selectedWorkerId) {
      setError("Please select a worker first.");
      return;
    }

    setPurposeLoading(true);
    setError(null);
    setPurposeSaveState("idle");
    setPurposeLastSavedAtLabel(null);

    try {
      const matches = await getAdminWorkerPurposeCanvases({
        worker_id: selectedWorkerId,
      });

      const existing = matches[0] ?? null;

      if (existing) {
        setEditingPurposeCanvasId(existing.id);
        setEditingPurposeCanvas(existing);
        setPurposeForm(purposeFormFromItem(existing));
      } else {
        setEditingPurposeCanvasId(null);
        setEditingPurposeCanvas(null);
        setPurposeForm({
          ...EMPTY_PURPOSE_FORM,
          worker_id: String(selectedWorkerId),
        });
      }

      setPurposeCanvasLoaded(true);
      skipNextPurposeAutosaveRef.current = true;
    } catch (err) {
      setPurposeCanvasLoaded(false);
      setEditingPurposeCanvasId(null);
      setEditingPurposeCanvas(null);
      setPurposeForm({
        ...EMPTY_PURPOSE_FORM,
        worker_id: selectedWorkerId ? String(selectedWorkerId) : "",
      });
      setError(err instanceof Error ? err.message : "Failed to load purpose canvas.");
    } finally {
      setPurposeLoading(false);
    }
  }

  async function handleSavePurposeCanvas(options?: { silent?: boolean }) {
    const silent = Boolean(options?.silent);

    if (!purposeForm.worker_id || !purposeCanvasLoaded) return;

    const relations = buildPurposeRelations(purposeForm);
    const coherenceScore = getPurposeCoherenceScore(relations);
    const completedRelations = relations.filter((relation) => relation.status !== "pending").length;
    const coherentRelations = relations.filter((relation) => relation.status === "coherent").length;
    const incoherentRelations = relations.filter((relation) => relation.status === "incoherent").length;
    const coherenceStatus = getPurposeCoherenceStatus(coherenceScore, completedRelations);

    if (!silent) {
      setPurposeSaving(true);
    }

    setError(null);
    setPurposeSaveState("saving");

    try {
      const basePayload = {
        travail_text: purposeForm.travail_text.trim() || null,
        aspiration_text: purposeForm.aspiration_text.trim() || null,
        inspiration_text: purposeForm.inspiration_text.trim() || null,
        passion_text: purposeForm.passion_text.trim() || null,
        vocation_text: purposeForm.vocation_text.trim() || null,
        formation_text: purposeForm.formation_text.trim() || null,
        coherence_score: coherenceScore,
        coherence_status: coherenceStatus,
        coherence_summary:
          completedRelations === 0
            ? "No relation evaluated yet."
            : `${coherentRelations} coherent relation(s), ${incoherentRelations} incoherent relation(s), ${completedRelations}/15 completed relation(s).`,
        relation_map_json: buildPurposeRelationMapJson(relations),
      };

      if (editingPurposeCanvasId) {
        const payload = basePayload as AdminWorkerPurposeCanvasUpdate;
        const updated = await updateAdminWorkerPurposeCanvas(editingPurposeCanvasId, payload);

        setEditingPurposeCanvas(updated);
        setPurposeForm(purposeFormFromItem(updated));
        stampPurposeSavedNow();
      } else {
        const payload = {
          worker_id: Number(purposeForm.worker_id),
          ...basePayload,
        } as AdminWorkerPurposeCanvasCreate;

        const created = await createAdminWorkerPurposeCanvas(payload);

        setEditingPurposeCanvasId(created.id);
        setEditingPurposeCanvas(created);
        setPurposeForm(purposeFormFromItem(created));
        stampPurposeSavedNow();
      }
    } catch (err) {
      setPurposeSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save purpose canvas.");
    } finally {
      if (!silent) {
        setPurposeSaving(false);
      }
    }
  }

  async function handleLoadTimeCanvas() {
    if (!selectedWorkerId) {
      setError("Please select a worker first.");
      return;
    }

    setTimeLoading(true);
    setError(null);
    setTimeSaveState("idle");
    setTimeLastSavedAtLabel(null);

    try {
      const matches = await getAdminWorkerTimeCanvases({
        worker_id: selectedWorkerId,
      });

      const existing = matches[0] ?? null;

      if (existing) {
        setEditingTimeCanvasId(existing.id);
        setEditingTimeCanvas(existing);
        setTimeForm(timeFormFromItem(existing));
      } else {
        setEditingTimeCanvasId(null);
        setEditingTimeCanvas(null);
        setTimeForm({
          ...EMPTY_TIME_FORM,
          worker_id: String(selectedWorkerId),
        });
      }

      setTimeCanvasLoaded(true);
      skipNextTimeAutosaveRef.current = true;
    } catch (err) {
      setTimeCanvasLoaded(false);
      setEditingTimeCanvasId(null);
      setEditingTimeCanvas(null);
      setTimeForm({
        ...EMPTY_TIME_FORM,
        worker_id: selectedWorkerId ? String(selectedWorkerId) : "",
      });
      setError(err instanceof Error ? err.message : "Failed to load time canvas.");
    } finally {
      setTimeLoading(false);
    }
  }

  async function handleSaveTimeCanvas(options?: { silent?: boolean }) {
    const silent = Boolean(options?.silent);

    if (!timeForm.worker_id || !timeCanvasLoaded) return;

    if (!silent) {
      setTimeSaving(true);
    }

    setError(null);
    setTimeSaveState("saving");

    try {
      const basePayload = {
        available_time_text: timeForm.available_time_text.trim() || null,
        time_constraints_text: timeForm.time_constraints_text.trim() || null,
        time_energy_text: timeForm.time_energy_text.trim() || null,
        time_rituals_text: timeForm.time_rituals_text.trim() || null,
        time_priorities_text: timeForm.time_priorities_text.trim() || null,
        time_risks_text: timeForm.time_risks_text.trim() || null,
        readiness_score: timeReadinessScore,
        readiness_status: timeReadinessStatus,
        summary_text: timeSummary,
      };

      if (editingTimeCanvasId) {
        const payload = basePayload as AdminWorkerTimeCanvasUpdate;
        const updated = await updateAdminWorkerTimeCanvas(editingTimeCanvasId, payload);

        setEditingTimeCanvas(updated);
        setTimeForm(timeFormFromItem(updated));
        stampTimeSavedNow();
      } else {
        const payload = {
          worker_id: Number(timeForm.worker_id),
          ...basePayload,
        } as AdminWorkerTimeCanvasCreate;

        const created = await createAdminWorkerTimeCanvas(payload);

        setEditingTimeCanvasId(created.id);
        setEditingTimeCanvas(created);
        setTimeForm(timeFormFromItem(created));
        stampTimeSavedNow();
      }
    } catch (err) {
      setTimeSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save time canvas.");
    } finally {
      if (!silent) {
        setTimeSaving(false);
      }
    }
  }

  async function handleLoadSignificanceCanvas() {
    if (!selectedWorkerId) {
      setError("Please select a worker first.");
      return;
    }

    setSignificanceLoading(true);
    setError(null);
    setSignificanceSaveState("idle");
    setSignificanceLastSavedAtLabel(null);

    try {
      const matches = await getAdminWorkerSignificanceCanvases({
        worker_id: selectedWorkerId,
      });

      const existing = matches[0] ?? null;

      if (existing) {
        setEditingSignificanceCanvasId(existing.id);
        setEditingSignificanceCanvas(existing);
        setSignificanceForm(significanceFormFromItem(existing));
      } else {
        setEditingSignificanceCanvasId(null);
        setEditingSignificanceCanvas(null);
        setSignificanceForm({
          ...EMPTY_SIGNIFICANCE_FORM,
          worker_id: String(selectedWorkerId),
        });
      }

      setSignificanceCanvasLoaded(true);
      skipNextSignificanceAutosaveRef.current = true;
    } catch (err) {
      setSignificanceCanvasLoaded(false);
      setEditingSignificanceCanvasId(null);
      setEditingSignificanceCanvas(null);
      setSignificanceForm({
        ...EMPTY_SIGNIFICANCE_FORM,
        worker_id: selectedWorkerId ? String(selectedWorkerId) : "",
      });
      setError(err instanceof Error ? err.message : "Failed to load significance canvas.");
    } finally {
      setSignificanceLoading(false);
    }
  }

  async function handleSaveSignificanceCanvas(options?: { silent?: boolean }) {
    const silent = Boolean(options?.silent);

    if (!significanceForm.worker_id || !significanceCanvasLoaded) return;

    if (!silent) {
      setSignificanceSaving(true);
    }

    setError(null);
    setSignificanceSaveState("saving");

    try {
      const dominant = getDominantSignificanceDimension(significanceDimensions);

      const percentages = significanceDimensions.reduce<AdminWorkerSignificanceScoreMap>(
        (acc, dimension) => ({
          ...acc,
          [dimension.key]: dimension.percentage,
        }),
        { ...ZERO_SIGNIFICANCE_SCORES },
      );

      const basePayload = {
        title: "Significance Canvas",
        answers_json: significanceAnswers,
        raw_scores_json: significanceScoresMap,
        scores_json: significanceScoresMap,
        percentages_json: percentages,
        dimensions_json: significanceDimensions,
        dominant_section: dominant?.key ?? null,
        dominant_dimension: dominant?.key ?? null,
        perception_summary: significanceAnalysisSummary,
        analysis_summary: significanceAnalysisSummary,
        coherence_status: dominant ? "dominant" : "not_evaluated",
      };

      if (editingSignificanceCanvasId) {
        const payload = basePayload as AdminWorkerSignificanceCanvasUpdate;
        const updated = await updateAdminWorkerSignificanceCanvas(
          editingSignificanceCanvasId,
          payload,
        );

        setEditingSignificanceCanvas(updated);
        setSignificanceForm(significanceFormFromItem(updated));
        stampSignificanceSavedNow();
      } else {
        const payload = {
          worker_id: Number(significanceForm.worker_id),
          ...basePayload,
        } as AdminWorkerSignificanceCanvasCreate;

        const created = await createAdminWorkerSignificanceCanvas(payload);

        setEditingSignificanceCanvasId(created.id);
        setEditingSignificanceCanvas(created);
        setSignificanceForm(significanceFormFromItem(created));
        stampSignificanceSavedNow();
      }
    } catch (err) {
      setSignificanceSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save significance canvas.");
    } finally {
      if (!silent) {
        setSignificanceSaving(false);
      }
    }
  }

  useEffect(() => {
    if (!engagementCanvasLoaded) return;
    if (!engagementForm.worker_id) return;
    if (isFutureStateLocked) return;

    if (skipNextEngagementAutosaveRef.current) {
      skipNextEngagementAutosaveRef.current = false;
      return;
    }

    setEngagementSaveState("typing");

    if (engagementAutoSaveTimerRef.current) {
      clearTimeout(engagementAutoSaveTimerRef.current);
    }

    engagementAutoSaveTimerRef.current = setTimeout(() => {
      void handleSaveEngagement({ silent: true });
    }, 1200);

    return () => {
      if (engagementAutoSaveTimerRef.current) {
        clearTimeout(engagementAutoSaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagementForm, engagementCanvasLoaded, isFutureStateLocked]);

  useEffect(() => {
    if (!purposeCanvasLoaded) return;
    if (!purposeForm.worker_id) return;

    if (skipNextPurposeAutosaveRef.current) {
      skipNextPurposeAutosaveRef.current = false;
      return;
    }

    setPurposeSaveState("typing");

    if (purposeAutoSaveTimerRef.current) {
      clearTimeout(purposeAutoSaveTimerRef.current);
    }

    purposeAutoSaveTimerRef.current = setTimeout(() => {
      void handleSavePurposeCanvas({ silent: true });
    }, 1200);

    return () => {
      if (purposeAutoSaveTimerRef.current) {
        clearTimeout(purposeAutoSaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purposeForm, purposeCanvasLoaded]);

  useEffect(() => {
    if (!timeCanvasLoaded) return;
    if (!timeForm.worker_id) return;

    if (skipNextTimeAutosaveRef.current) {
      skipNextTimeAutosaveRef.current = false;
      return;
    }

    setTimeSaveState("typing");

    if (timeAutoSaveTimerRef.current) {
      clearTimeout(timeAutoSaveTimerRef.current);
    }

    timeAutoSaveTimerRef.current = setTimeout(() => {
      void handleSaveTimeCanvas({ silent: true });
    }, 1200);

    return () => {
      if (timeAutoSaveTimerRef.current) {
        clearTimeout(timeAutoSaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeForm, timeCanvasLoaded, timeReadinessScore, timeReadinessStatus, timeSummary]);

  useEffect(() => {
    if (!significanceCanvasLoaded) return;
    if (!significanceForm.worker_id) return;

    if (skipNextSignificanceAutosaveRef.current) {
      skipNextSignificanceAutosaveRef.current = false;
      return;
    }

    setSignificanceSaveState("typing");

    if (significanceAutoSaveTimerRef.current) {
      clearTimeout(significanceAutoSaveTimerRef.current);
    }

    significanceAutoSaveTimerRef.current = setTimeout(() => {
      void handleSaveSignificanceCanvas({ silent: true });
    }, 1200);

    return () => {
      if (significanceAutoSaveTimerRef.current) {
        clearTimeout(significanceAutoSaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    significanceForm,
    significanceCanvasLoaded,
    significanceAnswers,
    significanceScoresMap,
    significanceDimensions,
    significanceAnalysisSummary,
  ]);

  function patchEngagementField<K extends keyof EngagementFormState>(
    key: K,
    value: EngagementFormState[K],
  ) {
    setEngagementForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function patchPurposeField(key: PurposeNodeKey, value: string) {
    setPurposeForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function patchTimeField(key: TimeNodeKey, value: string) {
    setTimeForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function patchSignificanceAnswer(
    questionId: number,
    value: AdminWorkerSignificanceAnswerValue,
  ) {
    setSignificanceForm((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      },
    }));
  }

  function scrollToRecommendation(recommendationId: number) {
    const element = document.getElementById(`recommendation-${recommendationId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const assignableWorkers = useMemo(() => {
    if (!isPlatformAdmin || !selectedOrganization) return [];

    return workers
      .filter((worker) => worker.organization_id == null)
      .filter((worker) => isWorkerCompatibleWithOrganization(worker, selectedOrganization))
      .sort((a, b) => a.display_name.localeCompare(b.display_name));
  }, [isPlatformAdmin, workers, selectedOrganization]);

  const filteredAssignedWorkers = useMemo(() => {
    const q = workerSearch.trim().toLowerCase();
    if (!q) return assignedWorkers;

    return assignedWorkers.filter((worker) => {
      return (
        worker.display_name.toLowerCase().includes(q) ||
        (worker.email || "").toLowerCase().includes(q) ||
        (worker.current_role || "").toLowerCase().includes(q) ||
        (worker.industry || "").toLowerCase().includes(q) ||
        (worker.business_id || "").toLowerCase().includes(q)
      );
    });
  }, [assignedWorkers, workerSearch]);

  const leverCategories = useMemo(() => {
    const values =
      selectedWorkerSummary?.levers.map((lever) => lever.category).filter(Boolean) ?? [];
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [selectedWorkerSummary]);

  const filteredLevers = useMemo(() => {
    const levers = selectedWorkerSummary?.levers ?? [];
    const q = leverSearch.trim().toLowerCase();

    const filtered = levers.filter((lever) => {
      const matchesSearch =
        !q ||
        lever.name.toLowerCase().includes(q) ||
        lever.category.toLowerCase().includes(q) ||
        lever.description.toLowerCase().includes(q) ||
        (lever.provider_type || "").toLowerCase().includes(q) ||
        lever.match_reasons.some((reason) => reason.toLowerCase().includes(q));

      const matchesCategory =
        leverCategoryFilter === "all" || lever.category === leverCategoryFilter;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (leverSortMode === "name") {
        return a.name.localeCompare(b.name);
      }

      if (leverSortMode === "most_used") {
        if (b.usage_count !== a.usage_count) return b.usage_count - a.usage_count;
        return a.name.localeCompare(b.name);
      }

      const aHighlighted = a.is_highlighted ? 1 : 0;
      const bHighlighted = b.is_highlighted ? 1 : 0;
      if (bHighlighted !== aHighlighted) return bHighlighted - aHighlighted;

      const aRank = a.best_display_rank ?? Number.MAX_SAFE_INTEGER;
      const bRank = b.best_display_rank ?? Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;

      if (b.usage_count !== a.usage_count) return b.usage_count - a.usage_count;

      return a.name.localeCompare(b.name);
    });
  }, [selectedWorkerSummary, leverSearch, leverCategoryFilter, leverSortMode]);

const relatedLeversByRecommendationId = useMemo(() => {
  const map = new Map<number, AdminOrganizationWorkerSummary["levers"]>();

  (selectedWorkerSummary?.levers ?? []).forEach((lever) => {
    lever.recommendation_ids.forEach((recommendationId) => {
      const current = map.get(recommendationId) ?? [];
      current.push(lever);
      map.set(recommendationId, current);
    });
  });

  return map;
}, [selectedWorkerSummary]);
    return (
  <AdminShell
    activeHref="/admin/organizations"
    title="Manage Organizations"
    subtitle="Organization workspace, worker assignment, revenue dashboard, and scoped access foundation."
    adminEmail={admin?.email ?? null}
    adminRole={admin?.role ?? "admin"}
  >
    <div
      className="row space-between"
      style={{ alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}
    >
      <div className="stack" style={{ gap: 4 }}>
        <div className="section-title">Organizations workspace</div>
        <div className="muted">
          {isPlatformAdmin
            ? "Create organizations, assign workers, and monitor organization revenue."
            : "Access is limited to your organization, assigned workers, and organization revenue."}
        </div>
      </div>

      <button className="button ghost" type="button" onClick={handleLogout}>
        Log out
      </button>
    </div>

    {error ? (
      <div className="card" style={{ color: "var(--danger)" }}>
        {error}
      </div>
    ) : null}

    {loading ? (
      <div className="card">Loading organizations...</div>
    ) : (
      <>
        {selectedOrganization ? (
          <>
            <OrganizationWorkspaceHero
              selectedOrganization={selectedOrganization}
              selectedWorkerSummary={selectedWorkerSummary}
              selectedWorkerId={selectedWorkerId}
              organizationRevenueSummary={organizationRevenueSummary}
              getOrganizationTypeLabel={getOrganizationTypeLabel}
              getRequiredSubscriptionForOrganizationType={
                getRequiredSubscriptionForOrganizationType
              }
            />

            <OrganizationWorkspaceTabs
              activeTab={activeWorkspaceTab}
              onChange={setActiveWorkspaceTab}
              isPlatformAdmin={isPlatformAdmin}
              selectedWorkerAvailable={Boolean(selectedWorkerId)}
            />

            {activeWorkspaceTab === "overview" ? (
              <OrganizationOverviewTab
                selectedOrganization={selectedOrganization}
                selectedWorkerSummary={selectedWorkerSummary}
                selectedWorkerId={selectedWorkerId}
                organizationRevenueSummary={organizationRevenueSummary}
                onNavigate={setActiveWorkspaceTab}
                getOrganizationTypeLabel={getOrganizationTypeLabel}
                getRequiredSubscriptionForOrganizationType={
                  getRequiredSubscriptionForOrganizationType
                }
              />
            ) : null}

            {activeWorkspaceTab === "revenue" ? (
              <OrganizationRevenueTab
                selectedOrganization={selectedOrganization}
                assignedWorkers={assignedWorkers}
                organizationRevenueSummary={organizationRevenueSummary}
              />
            ) : null}

            {activeWorkspaceTab === "workers" ? (
              <OrganizationWorkersTab
                selectedOrganization={selectedOrganization}
                assignedWorkers={assignedWorkers}
                filteredAssignedWorkers={filteredAssignedWorkers}
                assignableWorkers={assignableWorkers}
                selectedWorkerId={selectedWorkerId}
                selectedWorkerIdToAssign={selectedWorkerIdToAssign}
                workerSearch={workerSearch}
                isPlatformAdmin={isPlatformAdmin}
                assigning={assigning}
                detailLoading={detailLoading}
                onWorkerSearchChange={setWorkerSearch}
                onSelectedWorkerIdToAssignChange={setSelectedWorkerIdToAssign}
                onAssignWorker={() => void handleAssignWorker()}
                onUnassignWorker={(workerId) => void handleUnassignWorker(workerId)}
                onOpenWorker={(workerId) => void openWorker(workerId)}
                getOrganizationTypeLabel={getOrganizationTypeLabel}
                getRequiredSubscriptionForOrganizationType={
                  getRequiredSubscriptionForOrganizationType
                }
              />
            ) : null}

            {activeWorkspaceTab === "canvases" ? (
              <OrganizationCanvasesTab
                selectedWorkerId={selectedWorkerId}
                selectedWorkerSummary={selectedWorkerSummary}
                activeCanvasTab={activeCanvasTab}
                onCanvasTabChange={setActiveCanvasTab}
              >
                {activeCanvasTab === "engagement" ? (
                  <OrganizationEngagementCanvasTab
                    selectedWorkerId={selectedWorkerId}
                    workerDisplayValue={
                      selectedWorkerSummary?.worker
                        ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
                        : ""
                    }
                    engagementSelectionState={engagementSelectionState}
                    engagementCanvasLoaded={engagementCanvasLoaded}
                    engagementsLoading={engagementsLoading}
                    editingEngagement={editingEngagement}
                    editingEngagementId={editingEngagementId}
                    engagementSaveState={engagementSaveState}
                    lastSavedAtLabel={lastSavedAtLabel}
                    engagementSaving={engagementSaving}
                    engagementFinalizing={engagementFinalizing}
                    isFutureStateLocked={isFutureStateLocked}
                    onStateChange={(nextState) => {
                      resetEngagementCanvas(selectedWorkerId, nextState);
                    }}
                    onLoadCanvas={() => void handleLoadEngagementCanvas()}
                    onClearCanvas={() =>
                      resetEngagementCanvas(selectedWorkerId, engagementSelectionState)
                    }
                    onSaveCanvas={() => void handleSaveEngagement()}
                    onFinalizeFutureState={() => void handleFinalizeFutureEngagement()}
                  >
                    <OrganizationEngagementCanvasVisual
                      form={engagementForm}
                      onChange={patchEngagementField}
                      disabled={isFutureStateLocked}
                    />
                  </OrganizationEngagementCanvasTab>
                ) : null}

                {activeCanvasTab === "purpose" ? (
                  <OrganizationPurposeCanvasTab
                    selectedWorkerId={selectedWorkerId}
                    workerDisplayValue={
                      selectedWorkerSummary?.worker
                        ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
                        : ""
                    }
                    purposeCanvasLoaded={purposeCanvasLoaded}
                    purposeLoading={purposeLoading}
                    purposeSaving={purposeSaving}
                    editingPurposeCanvas={editingPurposeCanvas}
                    editingPurposeCanvasId={editingPurposeCanvasId}
                    purposeSaveState={purposeSaveState}
                    purposeLastSavedAtLabel={purposeLastSavedAtLabel}
                    onLoadCanvas={() => void handleLoadPurposeCanvas()}
                    onClearCanvas={() => resetPurposeCanvas(selectedWorkerId)}
                    onSaveCanvas={() => void handleSavePurposeCanvas()}
                  >
                    <OrganizationPurposeCanvasVisual
                      form={purposeForm}
                      onChange={patchPurposeField}
                    />
                  </OrganizationPurposeCanvasTab>
                ) : null}

                {activeCanvasTab === "time" ? (
                  <OrganizationTimeCanvasTab
                    selectedWorkerId={selectedWorkerId}
                    workerDisplayValue={
                      selectedWorkerSummary?.worker
                        ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
                        : ""
                    }
                    timeCanvasLoaded={timeCanvasLoaded}
                    timeLoading={timeLoading}
                    timeSaving={timeSaving}
                    editingTimeCanvas={editingTimeCanvas}
                    editingTimeCanvasId={editingTimeCanvasId}
                    timeSaveState={timeSaveState}
                    timeLastSavedAtLabel={timeLastSavedAtLabel}
                    timeReadinessScore={timeReadinessScore}
                    timeReadinessStatus={timeReadinessStatus}
                    timeSummary={timeSummary}
                    onLoadCanvas={() => void handleLoadTimeCanvas()}
                    onClearCanvas={() => resetTimeCanvas(selectedWorkerId)}
                    onSaveCanvas={() => void handleSaveTimeCanvas()}
                  >
                    <OrganizationTimeCanvasVisual
                      form={timeForm}
                      onChange={patchTimeField}
                      readinessScore={timeReadinessScore}
                      readinessStatus={timeReadinessStatus}
                      summary={timeSummary}
                    />
                  </OrganizationTimeCanvasTab>
                ) : null}

                {activeCanvasTab === "significance" ? (
                  <OrganizationSignificanceCanvasTab
                    selectedWorkerId={selectedWorkerId}
                    workerDisplayValue={
                      selectedWorkerSummary?.worker
                        ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
                        : ""
                    }
                    significanceCanvasLoaded={significanceCanvasLoaded}
                    significanceLoading={significanceLoading}
                    significanceSaving={significanceSaving}
                    editingSignificanceCanvas={editingSignificanceCanvas}
                    editingSignificanceCanvasId={editingSignificanceCanvasId}
                    significanceSaveState={significanceSaveState}
                    significanceLastSavedAtLabel={significanceLastSavedAtLabel}
                    onLoadCanvas={() => void handleLoadSignificanceCanvas()}
                    onClearCanvas={() => resetSignificanceCanvas(selectedWorkerId)}
                    onSaveCanvas={() => void handleSaveSignificanceCanvas()}
                  >
                    <OrganizationSignificanceCanvasVisual
                      form={significanceForm}
                      questions={significanceQuestions}
                      onChange={patchSignificanceAnswer}
                      dimensions={significanceDimensions}
                      analysisSummary={significanceAnalysisSummary}
                    />
                  </OrganizationSignificanceCanvasTab>
                ) : null}
              </OrganizationCanvasesTab>
            ) : null}

            {activeWorkspaceTab === "insights" ? (
              <OrganizationInsightsTab
                selectedWorkerSummary={selectedWorkerSummary}
                workerSummaryLoading={workerSummaryLoading}
                leverSearch={leverSearch}
                leverCategoryFilter={leverCategoryFilter}
                leverSortMode={leverSortMode}
                leverCategories={leverCategories}
                filteredLevers={filteredLevers}
                relatedLeversByRecommendationId={relatedLeversByRecommendationId}
                onLeverSearchChange={setLeverSearch}
                onLeverCategoryFilterChange={setLeverCategoryFilter}
                onLeverSortModeChange={setLeverSortMode}
                onScrollToRecommendation={scrollToRecommendation}
              />
            ) : null}

            {activeWorkspaceTab === "access" ? (
              <OrganizationAccessTab
                selectedOrganizationId={selectedOrganizationId}
                contactEmail={form.contact_email}
                editingOrganizationId={editingOrganizationId}
                accessAccountSaving={accessAccountSaving}
                detailLoading={detailLoading}
                saving={saving}
                accessAccountResult={accessAccountResult}
                onCreateOrResetAccessAccount={() =>
                  void handleCreateOrResetAccessAccount()
                }
              />
            ) : null}
          </>
        ) : null}

        {isPlatformAdmin && activeWorkspaceTab === "organizations" ? (
          <OrganizationAdminTab
            organizations={organizations}
            selectedOrganizationId={selectedOrganizationId}
            editingOrganizationId={editingOrganizationId}
            form={form}
            saving={saving}
            detailLoading={detailLoading}
            onOpenOrganization={(organizationId) => void openOrganization(organizationId)}
            onSubmit={(event) => void handleSaveOrganization(event)}
            onFormChange={setForm}
            onNewOrganization={handleNewOrganization}
            getOrganizationTypeLabel={getOrganizationTypeLabel}
            getRequiredSubscriptionForOrganizationType={
              getRequiredSubscriptionForOrganizationType
            }
          />
        ) : null}
      </>
    )}
  </AdminShell>
);
}