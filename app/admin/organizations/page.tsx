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
  getAdminWorkers,
  unassignWorkerFromOrganization,
  updateAdminOrganization,
  updateAdminWorkerEngagement,
  updateAdminWorkerPurposeCanvas,
  updateAdminWorkerSignificanceCanvas,
} from "@/lib/api";
import { clearAdminToken } from "@/lib/admin-auth";
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
} from "@/lib/types";

type OrganizationFormState = {
  name: string;
  code: string;
  organization_type: AdminOrganizationType;
  description: string;
  contact_email: string;
  contact_phone: string;
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

type SignificanceDimensionDisplay = AdminWorkerSignificanceDimension;

type AdminWorkerSignificanceQuestionAnswer = {
  value: AdminWorkerSignificanceAnswerValue;
  label: string;
  scores: AdminWorkerSignificanceScoreMap;
};

type NormalizedSignificanceQuestion = {
  id: number;
  text: string;
  answers: AdminWorkerSignificanceQuestionAnswer[];
  options: AdminWorkerSignificanceQuestionAnswer[];
};

const EMPTY_FORM: OrganizationFormState = {
  name: "",
  code: "",
  organization_type: "agent_flix",
  description: "",
  contact_email: "",
  contact_phone: "",
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
  const rawAnswers = (question.answers ??
    question.options ??
    []) as Array<{
    value?: string | null;
    label?: string | null;
    scores?: Partial<AdminWorkerSignificanceScoreMap> | null;
  }>;

  const normalizedAnswers: AdminWorkerSignificanceQuestionAnswer[] = rawAnswers.map(
    (answer) => {
      const value = normalizeSignificanceAnswerValue(answer.value);

      return {
        value,
        label: answer.label || normalizeDisplayLabel(value),
        scores: {
          ...ZERO_SIGNIFICANCE_SCORES,
          ...(answer.scores || {}),
        },
      };
    },
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
  const possibleOrder = (question as { order?: number | null }).order;
  const normalizedId = Number(question.id ?? possibleOrder ?? 0);
  const normalizedAnswers = normalizeQuestionAnswers(question);

  return {
    id: Number.isFinite(normalizedId) && normalizedId > 0 ? normalizedId : 0,
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
    const questionAnswers = normalizeQuestionAnswers(question);

    const option =
      questionAnswers.find((candidate) => candidate.value === selectedValue) ??
      questionAnswers.find((candidate) => candidate.value === "unknown") ??
      questionAnswers[0];

    return {
      question_id: question.id,
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

function normalizeCanvasTone(tone?: string | null): CanvasTone {
  if (
    tone === "blue" ||
    tone === "purple" ||
    tone === "orange" ||
    tone === "teal" ||
    tone === "rose" ||
    tone === "amber" ||
    tone === "indigo" ||
    tone === "green" ||
    tone === "cyan"
  ) {
    return tone;
  }

  return "blue";
}

function getCanvasToneStyles(tone: CanvasTone): {
  border: string;
  background: string;
  title: string;
} {
  switch (tone) {
    case "blue":
      return {
        border: "rgba(59,130,246,0.55)",
        background: "rgba(59,130,246,0.08)",
        title: "#1d4ed8",
      };
    case "purple":
      return {
        border: "rgba(168,85,247,0.55)",
        background: "rgba(168,85,247,0.08)",
        title: "#7e22ce",
      };
    case "orange":
      return {
        border: "rgba(249,115,22,0.55)",
        background: "rgba(249,115,22,0.08)",
        title: "#c2410c",
      };
    case "teal":
      return {
        border: "rgba(20,184,166,0.55)",
        background: "rgba(20,184,166,0.08)",
        title: "#0f766e",
      };
    case "rose":
      return {
        border: "rgba(244,63,94,0.55)",
        background: "rgba(244,63,94,0.08)",
        title: "#be123c",
      };
    case "amber":
      return {
        border: "rgba(245,158,11,0.55)",
        background: "rgba(245,158,11,0.1)",
        title: "#b45309",
      };
    case "indigo":
      return {
        border: "rgba(99,102,241,0.55)",
        background: "rgba(99,102,241,0.08)",
        title: "#4338ca",
      };
    case "green":
      return {
        border: "rgba(34,197,94,0.55)",
        background: "rgba(34,197,94,0.08)",
        title: "#15803d",
      };
    case "cyan":
      return {
        border: "rgba(6,182,212,0.55)",
        background: "rgba(6,182,212,0.08)",
        title: "#0e7490",
      };
  }
}

function SavePill({
  state,
  savedAt,
}: {
  state: SaveIndicator;
  savedAt: string | null;
}) {
  let label = "Idle";
  let color = "var(--muted-foreground, #64748b)";
  let background = "rgba(100,116,139,0.12)";

  if (state === "typing") {
    label = "Editing…";
    color = "#92400e";
    background = "rgba(245,158,11,0.14)";
  } else if (state === "saving") {
    label = "Saving…";
    color = "#1d4ed8";
    background = "rgba(59,130,246,0.14)";
  } else if (state === "saved") {
    label = savedAt ? `Saved ${savedAt}` : "Saved";
    color = "#15803d";
    background = "rgba(34,197,94,0.14)";
  } else if (state === "error") {
    label = "Save error";
    color = "#b91c1c";
    background = "rgba(239,68,68,0.14)";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color,
        background,
      }}
    >
      {label}
    </span>
  );
}

function CoherenceBadge({
  status,
}: {
  status?: "coherent" | "watch" | "critical" | string | null;
}) {
  let label = status || "unknown";
  let color = "#475569";
  let background = "rgba(100,116,139,0.14)";

  if (status === "coherent" || status === "balanced") {
    label = status === "balanced" ? "Balanced" : "Coherent";
    color = "#15803d";
    background = "rgba(34,197,94,0.14)";
  } else if (
    status === "watch" ||
    status === "partially_coherent" ||
    status === "dominant" ||
    status === "tension"
  ) {
    label =
      status === "partially_coherent"
        ? "Partially coherent"
        : status === "dominant"
          ? "Dominant"
          : status === "tension"
            ? "Tension"
            : "Watch";
    color = "#b45309";
    background = "rgba(245,158,11,0.14)";
  } else if (status === "critical" || status === "incoherent" || status === "fragmented") {
    label =
      status === "fragmented"
        ? "Fragmented"
        : status === "incoherent"
          ? "Incoherent"
          : "Critical";
    color = "#b91c1c";
    background = "rgba(239,68,68,0.14)";
  } else if (status === "not_evaluated") {
    label = "Not evaluated";
    color = "#64748b";
    background = "rgba(100,116,139,0.14)";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        color,
        background,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </span>
  );
}

function CanvasTextBlock({
  title,
  value,
  onChange,
  minHeight,
  tone,
  placeholder,
  disabled = false,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  minHeight: number;
  tone: CanvasTone;
  placeholder?: string;
  disabled?: boolean;
}) {
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
      style={{
        border: `2px solid ${toneStyles.border}`,
        background: toneStyles.background,
        borderRadius: 16,
        padding: 12,
        minHeight,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        opacity: disabled ? 0.72 : 1,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: toneStyles.title,
        }}
      >
        {title}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Saisir ici..."}
        disabled={disabled}
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          resize: "none",
          border: "none",
          outline: "none",
          background: "transparent",
          color: "inherit",
          font: "inherit",
          fontSize: 15,
          lineHeight: 1.55,
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
    </div>
  );
}
function CanvasIntentBlock({
  title,
  tone,
  items,
  disabled = false,
}: {
  title: string;
  tone: CanvasTone;
  items: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
  }>;
  disabled?: boolean;
}) {
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
      style={{
        border: `2px solid ${toneStyles.border}`,
        background: toneStyles.background,
        borderRadius: 16,
        padding: 14,
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        opacity: disabled ? 0.72 : 1,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: toneStyles.title,
        }}
      >
        {title}
      </div>

      <div className="stack" style={{ gap: 10, flex: 1 }}>
        {items.map((item) => (
          <label key={item.label} className="stack" style={{ gap: 4 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: toneStyles.title,
                opacity: 0.9,
              }}
            >
              {item.label}
            </span>
            <textarea
              value={item.value}
              onChange={(e) => item.onChange(e.target.value)}
              className="textarea"
              rows={2}
              disabled={disabled}
              style={{
                resize: "vertical",
                background: "rgba(255,255,255,0.72)",
                borderColor: toneStyles.border,
                cursor: disabled ? "not-allowed" : "text",
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function PurposeCanvasVisual({
  form,
  onChange,
}: {
  form: PurposeFormState;
  onChange: (key: PurposeNodeKey, value: string) => void;
}) {
  const relations = useMemo(() => buildPurposeRelations(form), [form]);
  const coherenceScore = getPurposeCoherenceScore(relations);
  const completedRelations = relations.filter((relation) => relation.status !== "pending").length;
  const coherentRelations = relations.filter((relation) => relation.status === "coherent").length;
  const incoherentRelations = relations.filter((relation) => relation.status === "incoherent").length;

  function getNodePosition(key: PurposeNodeKey) {
    return PURPOSE_NODES.find((node) => node.key === key) ?? PURPOSE_NODES[0];
  }

  function getLineColor(status: PurposeRelationStatus): string {
    if (status === "coherent") return "#2563eb";
    if (status === "incoherent") return "#dc2626";
    return "rgba(100,116,139,0.25)";
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div
        className="card-soft"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Global coherence</div>
          <div className="admin-metric-value" style={{ fontSize: 30 }}>
            {coherenceScore}%
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Completed relations</div>
          <div className="admin-metric-value" style={{ fontSize: 30 }}>
            {completedRelations}/15
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Coherent links</div>
          <div className="admin-metric-value" style={{ fontSize: 30, color: "#2563eb" }}>
            {coherentRelations}
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Incoherent links</div>
          <div className="admin-metric-value" style={{ fontSize: 30, color: "#dc2626" }}>
            {incoherentRelations}
          </div>
        </div>
      </div>

      <div
        className="card-soft"
        style={{
          position: "relative",
          minHeight: 860,
          overflow: "hidden",
          border: "1px solid rgba(59,130,246,0.2)",
          background:
            "radial-gradient(circle at center, rgba(59,130,246,0.08), rgba(255,255,255,0.02) 55%)",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {relations.map((relation) => {
            const from = getNodePosition(relation.from);
            const to = getNodePosition(relation.to);

            return (
              <line
                key={`${relation.from}-${relation.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={getLineColor(relation.status)}
                strokeWidth={relation.status === "pending" ? 0.35 : 0.7}
                strokeDasharray={relation.status === "pending" ? "2 2" : "0"}
                opacity={relation.status === "pending" ? 0.55 : 0.9}
              />
            );
          })}
        </svg>

        {PURPOSE_NODES.map((node) => {
          const toneStyles = getCanvasToneStyles(node.tone);

          return (
            <div
              key={node.key}
              style={{
                position: "absolute",
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                width: 250,
                minHeight: 150,
                borderRadius: 22,
                border: `2px solid ${toneStyles.border}`,
                background: "rgba(255,255,255,0.94)",
                boxShadow: "0 16px 36px rgba(15,23,42,0.13)",
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div className="stack" style={{ gap: 2 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: toneStyles.title,
                  }}
                >
                  {node.label}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {node.subtitle}
                </div>
              </div>

              <textarea
                value={form[node.key]}
                onChange={(e) => onChange(node.key, e.target.value)}
                placeholder={node.placeholder}
                style={{
                  width: "100%",
                  flex: 1,
                  minHeight: 74,
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 10,
                  resize: "vertical",
                  outline: "none",
                  font: "inherit",
                  fontSize: 13,
                  lineHeight: 1.45,
                  background: toneStyles.background,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="card-soft stack" style={{ gap: 10 }}>
        <div className="section-title" style={{ fontSize: 15 }}>
          Relation details
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          {relations.map((relation) => {
            const from = getNodePosition(relation.from);
            const to = getNodePosition(relation.to);

            return (
              <div
                key={`${relation.from}-${relation.to}-detail`}
                style={{
                  borderRadius: 12,
                  border:
                    relation.status === "coherent"
                      ? "1px solid rgba(37,99,235,0.3)"
                      : relation.status === "incoherent"
                        ? "1px solid rgba(220,38,38,0.3)"
                        : "1px solid var(--border)",
                  padding: 10,
                  background:
                    relation.status === "coherent"
                      ? "rgba(37,99,235,0.07)"
                      : relation.status === "incoherent"
                        ? "rgba(220,38,38,0.07)"
                        : "rgba(100,116,139,0.06)",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13 }}>
                  {from.label} ↔ {to.label}
                </div>
                <div className="muted">
                  {relation.status === "coherent"
                    ? "Coherent"
                    : relation.status === "incoherent"
                      ? "Incoherent"
                      : "Pending"}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {relation.reason}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SignificanceCanvasVisual({
  form,
  onChange,
  questions,
  dimensions,
  analysisSummary,
}: {
  form: SignificanceFormState;
  onChange: (questionId: number, value: AdminWorkerSignificanceAnswerValue) => void;
  questions: NormalizedSignificanceQuestion[];
  dimensions: SignificanceDimensionDisplay[];
  analysisSummary: string;
}) {
  const dominant = getDominantSignificanceDimension(dimensions);

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div
        className="card-soft"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {dimensions.map((dimension) => {
          const tone = normalizeCanvasTone(dimension.tone);
          const toneStyles = getCanvasToneStyles(tone);

          return (
            <div
              key={dimension.key}
              className="stack"
              style={{
                gap: 8,
                border: `1px solid ${toneStyles.border}`,
                background: toneStyles.background,
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: toneStyles.title,
                }}
              >
                {dimension.label}
              </div>

              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {dimension.percentage}%
              </div>

              <div className="muted">score: {dimension.score}</div>

              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, dimension.percentage))}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: toneStyles.title,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="card-soft stack"
        style={{
          gap: 10,
          border: dominant ? "1px solid rgba(59,130,246,0.25)" : "1px solid var(--border)",
        }}
      >
        <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Significance reading
          </div>

          {dominant ? <span className="badge">dominant: {dominant.label}</span> : null}
        </div>

        <div className="muted">{analysisSummary}</div>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        {questions.map((question) => {
          const selectedValue = form.answers[question.id] || "unknown";
          const questionAnswers = question.answers;

          return (
            <div key={question.id} className="card-soft stack" style={{ gap: 10 }}>
              <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
                <span className="badge">Q{question.id}</span>
                <div style={{ fontWeight: 800, lineHeight: 1.45 }}>{question.text}</div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 10,
                }}
              >
                {questionAnswers.map((answer) => {
                  const isSelected = selectedValue === answer.value;

                  return (
                    <button
                      key={`${question.id}-${answer.value}`}
                      type="button"
                      onClick={() => onChange(question.id, answer.value)}
                      className={isSelected ? "button" : "button ghost"}
                      style={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        whiteSpace: "normal",
                      }}
                    >
                      {answer.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

  const significanceAutoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSignificanceAutosaveRef = useRef<boolean>(true);

  const isPlatformAdmin = admin?.role === "admin";
  const selectedOrganization =
    organizations.find((item) => item.id === selectedOrganizationId) ?? null;

  const isFutureStateLocked =
    engagementCanvasLoaded &&
    engagementSelectionState === "future" &&
    Boolean(editingEngagement?.is_finalized);

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
            resetSignificanceCanvas(firstWorkerId);
          } else {
            setSelectedWorkerSummary(null);
            resetEngagementCanvas(null, "current");
            resetPurposeCanvas(null);
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
    setWorkerSummaryLoading(true);
    setError(null);
    setLeverSearch("");
    setLeverCategoryFilter("all");
    setLeverSortMode("highlighted");
    resetEngagementCanvas(workerId, engagementSelectionState);
    resetPurposeCanvas(workerId);
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
        }));
      } else {
        const payload: AdminOrganizationCreate = {
          name: form.name.trim(),
          organization_type: form.organization_type,
          description: form.description.trim() || null,
          contact_email: form.contact_email.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
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

      const summary = await getAdminOrganizationWorkerSummary(
        selectedOrganizationId,
        assignedWorkerId,
      );

      setSelectedWorkerSummary(summary);
      resetEngagementCanvas(assignedWorkerId, "current");
      resetPurposeCanvas(assignedWorkerId);
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
      subtitle="Organization workspace, worker assignment, and scoped access foundation."
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
              ? "Create organizations and assign workers to them."
              : "Access is limited to your organization and its assigned workers."}
          </div>
        </div>

        <button className="button ghost" onClick={handleLogout}>
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
        <div className="grid grid-2">
          <div className="card stack">
            <div className="section-title">Organizations</div>

            {organizations.length === 0 ? (
              <div className="muted">No organizations found.</div>
            ) : (
              <div
                className="stack"
                style={{
                  maxHeight: "52vh",
                  overflowY: "auto",
                  paddingRight: 6,
                  gap: 12,
                }}
              >
                {organizations.map((organization) => (
                  <button
                    key={organization.id}
                    type="button"
                    className="card-soft stack"
                    onClick={() => void openOrganization(organization.id)}
                    style={{
                      gap: 8,
                      textAlign: "left",
                      cursor: "pointer",
                      border:
                        selectedOrganizationId === organization.id
                          ? "1px solid var(--primary)"
                          : "1px solid var(--border)",
                    }}
                  >
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge">#{organization.id}</span>
                      {organization.code ? <span className="badge">{organization.code}</span> : null}
                      <span className="badge">
                        {getOrganizationTypeLabel(organization.organization_type)}
                      </span>
                      <span className="badge">
                        {organization.is_active ? "active" : "inactive"}
                      </span>
                    </div>

                    <div className="section-title" style={{ fontSize: 16 }}>
                      {organization.name}
                    </div>

                    <div className="muted">
                      Required worker subscription:{" "}
                      {getRequiredSubscriptionForOrganizationType(organization.organization_type)}
                    </div>

                    {organization.contact_email ? (
                      <div className="muted">{organization.contact_email}</div>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card stack">
            <div className="section-title">
              {isPlatformAdmin
                ? editingOrganizationId
                  ? `Edit organization #${editingOrganizationId}`
                  : "Create organization"
                : "Organization profile"}
            </div>

            {!selectedOrganization && !isPlatformAdmin ? (
              <div className="muted">No organization linked to this account.</div>
            ) : (
              <form onSubmit={handleSaveOrganization} className="stack">
                <label className="stack">
                  <strong>Name</strong>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isPlatformAdmin || detailLoading}
                  />
                </label>

                <label className="stack">
                  <strong>Business ID</strong>
                  <input
                    className="input"
                    value={form.code || "Generated automatically"}
                    disabled
                    placeholder="Generated automatically"
                    style={{
                      cursor: "not-allowed",
                      background: "rgba(15,23,42,0.04)",
                    }}
                  />
                  <div className="muted">
                    System-generated identifier. It follows the ORG-xxxxxx convention.
                  </div>
                </label>

                <label className="stack">
                  <strong>Organization type</strong>
                  <select
                    className="select"
                    value={form.organization_type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        organization_type: e.target.value as AdminOrganizationType,
                      }))
                    }
                    disabled={!isPlatformAdmin || detailLoading}
                  >
                    <option value="agent_flix">agent flix — workers classique only</option>
                    <option value="agent_premium">agent premium — workers flix only</option>
                    <option value="agent_de_reve">agent de rêve — workers executif only</option>
                  </select>
                </label>

                <label className="stack">
                  <strong>Description</strong>
                  <textarea
                    className="textarea"
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    disabled={!isPlatformAdmin || detailLoading}
                  />
                </label>

                <label className="stack">
                  <strong>Contact email</strong>
                  <input
                    className="input"
                    value={form.contact_email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, contact_email: e.target.value }))
                    }
                    disabled={!isPlatformAdmin || detailLoading}
                  />
                </label>

                <label className="stack">
                  <strong>Contact phone</strong>
                  <input
                    className="input"
                    value={form.contact_phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, contact_phone: e.target.value }))
                    }
                    disabled={!isPlatformAdmin || detailLoading}
                  />
                </label>

                {isPlatformAdmin ? (
                  <>
                    <label className="row" style={{ gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                        }
                        disabled={detailLoading}
                      />
                      <strong>Active</strong>
                    </label>

                    <div className="row" style={{ flexWrap: "wrap" }}>
                      <button className="button" type="submit" disabled={saving || detailLoading}>
                        {saving
                          ? "Saving..."
                          : editingOrganizationId
                            ? "Save organization"
                            : "Create organization"}
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => {
                          setEditingOrganizationId(null);
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
                          resetEngagementCanvas(null, "current");
                          resetPurposeCanvas(null);
                          resetSignificanceCanvas(null);
                        }}
                        disabled={detailLoading}
                      >
                        New organization
                      </button>
                    </div>

                    {editingOrganizationId ? (
                      <div
                        className="card-soft stack"
                        style={{
                          gap: 10,
                          border: "1px solid rgba(59,130,246,0.25)",
                          background: "rgba(59,130,246,0.06)",
                        }}
                      >
                        <div className="section-title" style={{ fontSize: 15 }}>
                          Organization access account
                        </div>

                        <div className="muted">
                          This creates or resets the organization login account using the contact
                          email above. The temporary password is shown once.
                        </div>

                        <button
                          className="button"
                          type="button"
                          onClick={() => void handleCreateOrResetAccessAccount()}
                          disabled={
                            accessAccountSaving ||
                            detailLoading ||
                            saving ||
                            !selectedOrganizationId ||
                            !form.contact_email.trim()
                          }
                        >
                          {accessAccountSaving
                            ? "Generating account..."
                            : "Create / reset organization account"}
                        </button>

                        {!form.contact_email.trim() ? (
                          <div className="muted" style={{ color: "var(--danger)" }}>
                            Add a contact email before creating an organization account.
                          </div>
                        ) : null}

                        {accessAccountResult ? (
                          <div
                            className="stack"
                            style={{
                              gap: 8,
                              borderRadius: 14,
                              padding: 12,
                              background: "rgba(34,197,94,0.1)",
                              border: "1px solid rgba(34,197,94,0.25)",
                            }}
                          >
                            <div style={{ fontWeight: 800 }}>
                              {accessAccountResult.message}
                            </div>

                            <div>
                              <strong>Login email:</strong> {accessAccountResult.email}
                            </div>

                            <div>
                              <strong>Temporary password:</strong>{" "}
                              <code
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: 8,
                                  background: "rgba(15,23,42,0.08)",
                                }}
                              >
                                {accessAccountResult.temporary_password}
                              </code>
                            </div>

                            <div className="muted">
                              Share this password securely. It will not be visible again after you
                              leave this result.
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : null}
              </form>
            )}
          </div>
        </div>
      )}

      {selectedOrganization ? (
        <>
          <div className="card stack">
            <div
              className="row space-between"
              style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
            >
              <div className="section-title">Assigned workers</div>
              <div className="muted">{assignedWorkers.length} worker(s) assigned</div>
            </div>

            <div className="card-soft stack" style={{ gap: 8 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">
                  {getOrganizationTypeLabel(selectedOrganization.organization_type)}
                </span>
                <span className="badge">
                  required pack:{" "}
                  {getRequiredSubscriptionForOrganizationType(
                    selectedOrganization.organization_type,
                  )}
                </span>
              </div>
              <div className="muted">
                Standard workers can never be assigned to any organization.
              </div>
            </div>

            <input
              className="input"
              placeholder="Search assigned workers..."
              value={workerSearch}
              onChange={(e) => setWorkerSearch(e.target.value)}
            />

            {isPlatformAdmin ? (
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <select
                  className="select"
                  value={selectedWorkerIdToAssign}
                  onChange={(e) => setSelectedWorkerIdToAssign(e.target.value)}
                  disabled={assigning || detailLoading}
                >
                  <option value="">Select a compatible worker to assign</option>
                  {assignableWorkers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      #{worker.id} — {worker.display_name} — {worker.subscription_pack}
                    </option>
                  ))}
                </select>

                <button
                  className="button"
                  type="button"
                  onClick={() => void handleAssignWorker()}
                  disabled={assigning || detailLoading || !selectedWorkerIdToAssign}
                >
                  {assigning ? "Assigning..." : "Assign worker"}
                </button>
              </div>
            ) : null}

            {detailLoading ? (
              <div className="muted">Loading assigned workers...</div>
            ) : filteredAssignedWorkers.length === 0 ? (
              <div className="muted">No assigned workers found.</div>
            ) : (
              <div
                className="stack"
                style={{
                  maxHeight: "56vh",
                  overflowY: "auto",
                  paddingRight: 6,
                  gap: 12,
                }}
              >
                {filteredAssignedWorkers.map((worker) => {
                  const isSelected = selectedWorkerId === worker.id;

                  return (
                    <div
                      key={worker.id}
                      className="card-soft stack"
                      role="button"
                      tabIndex={0}
                      onClick={() => void openWorker(worker.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          void openWorker(worker.id);
                        }
                      }}
                      style={{
                        gap: 8,
                        border: isSelected
                          ? "1px solid var(--primary)"
                          : "1px solid var(--border)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        className="row space-between"
                        style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
                      >
                        <div className="stack" style={{ gap: 6 }}>
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">#{worker.id}</span>
                            {worker.business_id ? (
                              <span className="badge">{worker.business_id}</span>
                            ) : null}
                            <span className="badge">{worker.subscription_pack}</span>
                            {worker.current_role ? (
                              <span className="badge">{worker.current_role}</span>
                            ) : null}
                          </div>

                          <div className="section-title" style={{ fontSize: 16 }}>
                            {worker.display_name}
                          </div>

                          <div className="muted">{worker.email || "No email"}</div>
                        </div>

                        {isPlatformAdmin ? (
                          <button
                            className="button ghost"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleUnassignWorker(worker.id);
                            }}
                            disabled={assigning}
                          >
                            Unassign
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">Engagement Canvas</div>
              <div className="muted">
                Select the worker state, then load the corresponding engagement canvas.
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 12 }}>
              <div className="grid grid-3" style={{ alignItems: "end" }}>
                <label className="stack">
                  <strong>Worker</strong>
                  <input
                    className="input"
                    value={
                      selectedWorkerSummary?.worker
                        ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
                        : ""
                    }
                    disabled
                    placeholder="Select a worker above"
                  />
                </label>

                <label className="stack">
                  <strong>State</strong>
                  <select
                    className="select"
                    value={engagementSelectionState}
                    onChange={(e) => {
                      const nextState = e.target.value as AdminWorkerEngagementState;
                      resetEngagementCanvas(selectedWorkerId, nextState);
                    }}
                    disabled={!selectedWorkerId}
                  >
                    <option value="current">current</option>
                    <option value="future">future</option>
                  </select>
                </label>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="button"
                    type="button"
                    onClick={() => void handleLoadEngagementCanvas()}
                    disabled={!selectedWorkerId || engagementsLoading}
                  >
                    {engagementsLoading ? "Loading..." : "Load canvas"}
                  </button>

                  {engagementCanvasLoaded ? (
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() =>
                        resetEngagementCanvas(selectedWorkerId, engagementSelectionState)
                      }
                    >
                      Clear canvas
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {!selectedWorkerId ? (
              <div className="card-soft">
                <div className="muted">
                  Select a worker in the section above to work on the engagement canvas.
                </div>
              </div>
            ) : !engagementCanvasLoaded ? (
              <div className="card-soft">
                <div className="muted">
                  No canvas displayed yet. Choose the state and click <strong>Load canvas</strong>.
                </div>
              </div>
            ) : (
              <>
                <div
                  className="row space-between"
                  style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
                >
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="muted">
                      Worker #{selectedWorkerId} — state: {engagementSelectionState}
                    </div>
                    <div className="muted">
                      {editingEngagement
                        ? `Existing canvas loaded (${editingEngagement.status})`
                        : "No existing canvas found. You are creating a new one."}
                    </div>
                    {isFutureStateLocked ? (
                      <div className="muted" style={{ color: "var(--danger)" }}>
                        Future state is confirmed and locked from further modification.
                      </div>
                    ) : null}
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <SavePill state={engagementSaveState} savedAt={lastSavedAtLabel} />
                    <CoherenceBadge status={editingEngagement?.coherence_status} />

                    <button
                      className="button"
                      type="button"
                      onClick={() => void handleSaveEngagement()}
                      disabled={engagementSaving || isFutureStateLocked}
                    >
                      {engagementSaving ? "Saving..." : editingEngagementId ? "Save" : "Create"}
                    </button>

                    {engagementSelectionState === "future" && editingEngagementId ? (
                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => void handleFinalizeFutureEngagement()}
                        disabled={engagementFinalizing || isFutureStateLocked}
                      >
                        {engagementFinalizing
                          ? "Confirming..."
                          : isFutureStateLocked
                            ? "Confirmed"
                            : "Confirm future state"}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div
                  className="card-soft stack"
                  style={{
                    gap: 8,
                    border:
                      editingEngagement?.coherence_status === "critical"
                        ? "1px solid rgba(239,68,68,0.35)"
                        : editingEngagement?.coherence_status === "watch"
                          ? "1px solid rgba(245,158,11,0.35)"
                          : "1px solid var(--border)",
                  }}
                >
                  {editingEngagement ? (
                    <>
                      <div
                        className="row"
                        style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}
                      >
                        <div className="muted">
                          Status: {editingEngagement.status}
                          {editingEngagement.is_finalized ? " • finalized" : ""}
                        </div>
                        <CoherenceBadge status={editingEngagement.coherence_status} />
                      </div>

                      <div className="muted">
                        {editingEngagement.coherence_summary || "No summary returned yet."}
                      </div>

                      {editingEngagement.coherence_flags?.length ? (
                        <div className="stack" style={{ gap: 8 }}>
                          {editingEngagement.coherence_flags.map((flag, index) => (
                            <div
                              key={`${flag.code}-${index}`}
                              style={{
                                borderRadius: 12,
                                padding: 10,
                                background:
                                  flag.level === "high"
                                    ? "rgba(239,68,68,0.1)"
                                    : flag.level === "medium"
                                      ? "rgba(245,158,11,0.1)"
                                      : "rgba(59,130,246,0.08)",
                              }}
                            >
                              <div style={{ fontWeight: 700 }}>
                                {flag.code} — {flag.level}
                              </div>
                              <div className="muted">{flag.message}</div>
                              {flag.related_blocks?.length ? (
                                <div className="muted">
                                  Related blocks: {flag.related_blocks.join(", ")}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="muted">
                      New canvas. Coherence will be evaluated by backend when you save.
                    </div>
                  )}
                </div>

                <div className="stack" style={{ gap: 16 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1.08fr 0.95fr 1.08fr 1fr",
                      gap: 12,
                      alignItems: "stretch",
                    }}
                  >
                    <CanvasTextBlock
                      title="Ambitions"
                      value={engagementForm.ambitions_text}
                      onChange={(value) => patchEngagementField("ambitions_text", value)}
                      minHeight={420}
                      tone="orange"
                      placeholder="Ambitions, projection, aspirations..."
                      disabled={isFutureStateLocked}
                    />

                    <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 12 }}>
                      <CanvasTextBlock
                        title="But"
                        value={engagementForm.purpose_text}
                        onChange={(value) => patchEngagementField("purpose_text", value)}
                        minHeight={204}
                        tone="purple"
                        placeholder="But professionnel, raison d’être..."
                        disabled={isFutureStateLocked}
                      />
                      <CanvasTextBlock
                        title="Missions"
                        value={engagementForm.missions_text}
                        onChange={(value) => patchEngagementField("missions_text", value)}
                        minHeight={204}
                        tone="amber"
                        placeholder="Missions clés, apport concret..."
                        disabled={isFutureStateLocked}
                      />
                    </div>

                    <CanvasTextBlock
                      title="Identité"
                      value={engagementForm.identity_text}
                      onChange={(value) => patchEngagementField("identity_text", value)}
                      minHeight={420}
                      tone="blue"
                      placeholder="Identité professionnelle, singularité, posture..."
                      disabled={isFutureStateLocked}
                    />

                    <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 12 }}>
                      <CanvasTextBlock
                        title="Vision"
                        value={engagementForm.vision_text}
                        onChange={(value) => patchEngagementField("vision_text", value)}
                        minHeight={204}
                        tone="teal"
                        placeholder="Vision, cap, horizon..."
                        disabled={isFutureStateLocked}
                      />
                      <CanvasTextBlock
                        title="Actions"
                        value={engagementForm.actions_text}
                        onChange={(value) => patchEngagementField("actions_text", value)}
                        minHeight={204}
                        tone="green"
                        placeholder="Actions immédiates et leviers de mouvement..."
                        disabled={isFutureStateLocked}
                      />
                    </div>

                    <CanvasTextBlock
                      title="Objectifs"
                      value={engagementForm.objectives_text}
                      onChange={(value) => patchEngagementField("objectives_text", value)}
                      minHeight={420}
                      tone="rose"
                      placeholder="Objectifs à atteindre, résultats recherchés..."
                      disabled={isFutureStateLocked}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.05fr 0.95fr",
                      gap: 12,
                      alignItems: "stretch",
                    }}
                  >
                    <CanvasIntentBlock
                      title="Career Intent"
                      tone="indigo"
                      disabled={isFutureStateLocked}
                      items={[
                        {
                          label: "1. Rémunération",
                          value: engagementForm.career_intent_compensation,
                          onChange: (value) =>
                            patchEngagementField("career_intent_compensation", value),
                        },
                        {
                          label: "2. Fonction / rôle",
                          value: engagementForm.career_intent_role,
                          onChange: (value) => patchEngagementField("career_intent_role", value),
                        },
                        {
                          label: "3. Critères de passion au travail",
                          value: engagementForm.career_intent_passion_criteria,
                          onChange: (value) =>
                            patchEngagementField("career_intent_passion_criteria", value),
                        },
                        {
                          label: "4. Profil des collaborations",
                          value: engagementForm.career_intent_collaboration_profile,
                          onChange: (value) =>
                            patchEngagementField("career_intent_collaboration_profile", value),
                        },
                        {
                          label: "5. Niveau de performance",
                          value: engagementForm.career_intent_performance_level,
                          onChange: (value) =>
                            patchEngagementField("career_intent_performance_level", value),
                        },
                        {
                          label: "6. Responsabilités",
                          value: engagementForm.career_intent_responsibilities,
                          onChange: (value) =>
                            patchEngagementField("career_intent_responsibilities", value),
                        },
                      ]}
                    />

                    <CanvasIntentBlock
                      title="Talent Intent"
                      tone="cyan"
                      disabled={isFutureStateLocked}
                      items={[
                        {
                          label: "1. Les bases",
                          value: engagementForm.talent_intent_foundations,
                          onChange: (value) =>
                            patchEngagementField("talent_intent_foundations", value),
                        },
                        {
                          label: "2. La personnalité",
                          value: engagementForm.talent_intent_personality,
                          onChange: (value) =>
                            patchEngagementField("talent_intent_personality", value),
                        },
                        {
                          label: "3. La veille",
                          value: engagementForm.talent_intent_watch,
                          onChange: (value) => patchEngagementField("talent_intent_watch", value),
                        },
                        {
                          label: "4. Le niveau supérieur",
                          value: engagementForm.talent_intent_next_level,
                          onChange: (value) =>
                            patchEngagementField("talent_intent_next_level", value),
                        },
                        {
                          label: "5. Les niches d’impact",
                          value: engagementForm.talent_intent_impact_niches,
                          onChange: (value) =>
                            patchEngagementField("talent_intent_impact_niches", value),
                        },
                        {
                          label: "6. Les contributions sociales",
                          value: engagementForm.talent_intent_social_contributions,
                          onChange: (value) =>
                            patchEngagementField("talent_intent_social_contributions", value),
                        },
                      ]}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">Purpose Workspace</div>
              <div className="muted">
                Fill the six Purpose Canvas nodes during live coaching. Relations are calculated in
                real time.
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 12 }}>
              <div className="grid grid-3" style={{ alignItems: "end" }}>
                <label className="stack">
                  <strong>Worker</strong>
                  <input
                    className="input"
                    value={
                      selectedWorkerSummary?.worker
                        ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
                        : ""
                    }
                    disabled
                    placeholder="Select a worker above"
                  />
                </label>

                <div className="stack">
                  <strong>Canvas rule</strong>
                  <div className="muted">
                    Blue = coherent relation · Red = incoherent relation · Grey = pending
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="button"
                    type="button"
                    onClick={() => void handleLoadPurposeCanvas()}
                    disabled={!selectedWorkerId || purposeLoading}
                  >
                    {purposeLoading ? "Loading..." : "Load canvas"}
                  </button>

                  {purposeCanvasLoaded ? (
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => resetPurposeCanvas(selectedWorkerId)}
                    >
                      Clear canvas
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {!selectedWorkerId ? (
              <div className="card-soft">
                <div className="muted">
                  Select a worker in the section above to work on the Purpose Canvas.
                </div>
              </div>
            ) : !purposeCanvasLoaded ? (
              <div className="card-soft">
                <div className="muted">
                  No purpose canvas displayed yet. Select a worker and click{" "}
                  <strong>Load canvas</strong>.
                </div>
              </div>
            ) : (
              <>
                <div
                  className="row space-between"
                  style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
                >
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="muted">Worker #{selectedWorkerId}</div>
                    <div className="muted">
                      {editingPurposeCanvas
                        ? "Existing purpose canvas loaded."
                        : "No existing purpose canvas found. You are creating a new one."}
                    </div>
                    {editingPurposeCanvas?.coherence_summary ? (
                      <div className="muted">{editingPurposeCanvas.coherence_summary}</div>
                    ) : null}
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <SavePill state={purposeSaveState} savedAt={purposeLastSavedAtLabel} />
                    <CoherenceBadge status={editingPurposeCanvas?.coherence_status} />

                    <button
                      className="button"
                      type="button"
                      onClick={() => void handleSavePurposeCanvas()}
                      disabled={purposeSaving}
                    >
                      {purposeSaving ? "Saving..." : editingPurposeCanvasId ? "Save" : "Create"}
                    </button>
                  </div>
                </div>

                <PurposeCanvasVisual form={purposeForm} onChange={patchPurposeField} />
              </>
            )}
          </div>

          <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">Significance Canvas</div>
              <div className="muted">
                Assess how the selected worker currently relates to work across five dimensions:
                raison, métier, occupation, corvée, and hobby.
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 12 }}>
              <div className="grid grid-3" style={{ alignItems: "end" }}>
                <label className="stack">
                  <strong>Worker</strong>
                  <input
                    className="input"
                    value={
                      selectedWorkerSummary?.worker
                        ? `#${selectedWorkerSummary.worker.id} — ${selectedWorkerSummary.worker.display_name}`
                        : ""
                    }
                    disabled
                    placeholder="Select a worker above"
                  />
                </label>

                <div className="stack">
                  <strong>Canvas rule</strong>
                  <div className="muted">
                    Each answer contributes to a deterministic score. The backend persists the
                    questionnaire, scores, dimensions, dominant profile, and summary.
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="button"
                    type="button"
                    onClick={() => void handleLoadSignificanceCanvas()}
                    disabled={!selectedWorkerId || significanceLoading}
                  >
                    {significanceLoading ? "Loading..." : "Load canvas"}
                  </button>

                  {significanceCanvasLoaded ? (
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => resetSignificanceCanvas(selectedWorkerId)}
                    >
                      Clear canvas
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {!selectedWorkerId ? (
              <div className="card-soft">
                <div className="muted">
                  Select a worker in the section above to work on the Significance Canvas.
                </div>
              </div>
            ) : !significanceCanvasLoaded ? (
              <div className="card-soft">
                <div className="muted">
                  No significance canvas displayed yet. Select a worker and click{" "}
                  <strong>Load canvas</strong>.
                </div>
              </div>
            ) : (
              <>
                <div
                  className="row space-between"
                  style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
                >
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="muted">Worker #{selectedWorkerId}</div>
                    <div className="muted">
                      {editingSignificanceCanvas
                        ? "Existing significance canvas loaded."
                        : "No existing significance canvas found. You are creating a new one."}
                    </div>
                    {editingSignificanceCanvas?.perception_summary ||
                    editingSignificanceCanvas?.analysis_summary ? (
                      <div className="muted">
                        {editingSignificanceCanvas.perception_summary ||
                          editingSignificanceCanvas.analysis_summary}
                      </div>
                    ) : null}

                    {editingSignificanceCanvas?.dominant_section ||
                    editingSignificanceCanvas?.dominant_dimension ? (
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">
                          dominant:{" "}
                          {editingSignificanceCanvas.dominant_section ||
                            editingSignificanceCanvas.dominant_dimension}
                        </span>
                        <CoherenceBadge status={editingSignificanceCanvas.coherence_status} />
                      </div>
                    ) : null}
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <SavePill
                      state={significanceSaveState}
                      savedAt={significanceLastSavedAtLabel}
                    />

                    <button
                      className="button"
                      type="button"
                      onClick={() => void handleSaveSignificanceCanvas()}
                      disabled={significanceSaving}
                    >
                      {significanceSaving
                        ? "Saving..."
                        : editingSignificanceCanvasId
                          ? "Save"
                          : "Create"}
                    </button>
                  </div>
                </div>

                <SignificanceCanvasVisual
                  form={significanceForm}
                  questions={significanceQuestions}
                  onChange={patchSignificanceAnswer}
                  dimensions={significanceDimensions}
                  analysisSummary={significanceAnalysisSummary}
                />
              </>
            )}
          </div>

          <div className="card stack">
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="section-title">Worker performance workspace</div>
              {selectedWorkerSummary?.worker ? (
                <div className="muted">
                  Selected worker: {selectedWorkerSummary.worker.display_name}
                </div>
              ) : null}
            </div>

            {workerSummaryLoading ? (
              <div className="muted">Loading worker summary...</div>
            ) : !selectedWorkerSummary ? (
              <div className="muted">Select a worker to view details.</div>
            ) : (
              <>
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
                      <strong>Subscription:</strong> {selectedWorkerSummary.worker.subscription_pack}
                    </div>
                    <div>
                      <strong>Profession:</strong> {selectedWorkerSummary.worker.profession || "—"}
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
                      {filteredLevers.length} lever(s) shown / {selectedWorkerSummary.lever_count}{" "}
                      total
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <input
                      className="input"
                      placeholder="Search levers by name, category, provider, reason..."
                      value={leverSearch}
                      onChange={(e) => setLeverSearch(e.target.value)}
                    />

                    <select
                      className="select"
                      value={leverCategoryFilter}
                      onChange={(e) => setLeverCategoryFilter(e.target.value)}
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
                      onChange={(e) => setLeverSortMode(e.target.value as LeverSortMode)}
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
                              {lever.is_default ? <span className="badge">default</span> : null}
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
                                      onClick={() => scrollToRecommendation(recommendationId)}
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
              </>
            )}
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}