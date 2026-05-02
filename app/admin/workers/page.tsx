/* eslint-disable @typescript-eslint/no-unused-vars */
// app/admin/workers/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  createAdminWorker,
  createAdminWorkerConversation,
  createAdminWorkerEngagement,
  createAdminWorkerPurposeCanvas,
  createAdminWorkerSignificanceCanvas,
  createAdminWorkerTimeCanvas,
  finalizeAdminWorkerEngagement,
  getAdminMe,
  getAdminWorkerConversations,
  getAdminWorkerEngagements,
  getAdminWorkerPurposeCanvases,
  getAdminWorkerSignificanceCanvases,
  getAdminWorkerSignificanceQuestions,
  getAdminWorkerTimeCanvases,
  getAdminWorkers,
  updateAdminWorker,
  updateAdminWorkerConversation,
  updateAdminWorkerEngagement,
  updateAdminWorkerPurposeCanvas,
  updateAdminWorkerSignificanceCanvas,
  updateAdminWorkerTimeCanvas,
} from "@/lib/api";
import type {
  AdminMe,
  AdminWorker,
  AdminWorkerCreate,
  AdminWorkerConversation,
  AdminWorkerConversationCreate,
  AdminWorkerConversationUpdate,
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
  AdminWorkerSignificanceQuestion,
  AdminWorkerSignificanceScoreMap,
  AdminWorkerTimeCanvas,
  AdminWorkerTimeCanvasCreate,
  AdminWorkerTimeCanvasUpdate,
  AdminWorkerUpdate,
} from "@/lib/types";

type WorkersViewMode =
  | "workers"
  | "conversations"
  | "engagements"
  | "purpose"
  | "significance"
  | "time";

type SubscriptionPack = "standard" | "classique" | "flix" | "executif";

type WorkerFormState = {
  business_id: string;
  location: string;
  phone_number: string;
  subscription_pack: SubscriptionPack;
  profession: string;
};

type CreateWorkerFormState = {
  email: string;
  display_name: string;
  given_name: string;
  family_name: string;
  language: "en" | "fr";
  location: string;
  phone_number: string;
  subscription_pack: SubscriptionPack;
  profession: string;
  organization_id: string;
};

type ConversationFormState = {
  worker_id: string;
  title: string;
  source_type: "url" | "upload";
  source_label: string;
  video_url: string;
  file_path: string;
  conversation_date: string;
  transcript: string;
  notes: string;
};

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

type SaveIndicator = "idle" | "typing" | "saving" | "saved" | "error";

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

type SignificanceDimensionKey = keyof AdminWorkerSignificanceScoreMap;

type SignificanceDimensionDisplay = {
  key: SignificanceDimensionKey;
  label: string;
  score: number;
  percentage: number;
  tone: CanvasTone;
};

type AdminWorkerSignificanceQuestionAnswer = {
  value: AdminWorkerSignificanceAnswerValue;
  label: string;
  scores: AdminWorkerSignificanceScoreMap;
};

type NormalizedSignificanceQuestion = {
  id: number;
  key: string;
  order: number;
  text: string;
  answers: AdminWorkerSignificanceQuestionAnswer[];
  options: AdminWorkerSignificanceQuestionAnswer[];
};

const SUBSCRIPTION_PACK_PRICING: Record<
  SubscriptionPack,
  {
    label: string;
    monthlyLabel: string;
    annualLabel: string;
    commercialLabel: string;
    isContactSales: boolean;
  }
> = {
  standard: {
    label: "standard",
    monthlyLabel: "0€ / month",
    annualLabel: "Free",
    commercialLabel: "Free plan",
    isContactSales: false,
  },
  classique: {
    label: "classique",
    monthlyLabel: "89,90€ / month",
    annualLabel: "899,00€ / year",
    commercialLabel: "Classic plan",
    isContactSales: false,
  },
  flix: {
    label: "flix",
    monthlyLabel: "290,90€ / month",
    annualLabel: "3 199,90€ / year",
    commercialLabel: "Flix plan",
    isContactSales: false,
  },
  executif: {
    label: "executif",
    monthlyLabel: "Contact sales",
    annualLabel: "Custom pricing",
    commercialLabel: "Executive plan",
    isContactSales: true,
  },
};

const EMPTY_WORKER_FORM: WorkerFormState = {
  business_id: "",
  location: "",
  phone_number: "",
  subscription_pack: "standard",
  profession: "",
};

const EMPTY_CREATE_WORKER_FORM: CreateWorkerFormState = {
  email: "",
  display_name: "",
  given_name: "",
  family_name: "",
  language: "en",
  location: "",
  phone_number: "",
  subscription_pack: "standard",
  profession: "",
  organization_id: "",
};

const EMPTY_CONVERSATION_FORM: ConversationFormState = {
  worker_id: "",
  title: "",
  source_type: "url",
  source_label: "",
  video_url: "",
  file_path: "",
  conversation_date: "",
  transcript: "",
  notes: "",
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

function scores(
  partial: Partial<AdminWorkerSignificanceScoreMap>,
): AdminWorkerSignificanceScoreMap {
  return {
    ...ZERO_SIGNIFICANCE_SCORES,
    ...partial,
  };
}

function option(
  value: AdminWorkerSignificanceAnswerValue,
  label: string,
  scoreMap: AdminWorkerSignificanceScoreMap,
): AdminWorkerSignificanceQuestionAnswer {
  return {
    value,
    label,
    scores: scoreMap,
  };
}

function defaultQuestion(
  id: number,
  text: string,
  answers: AdminWorkerSignificanceQuestionAnswer[],
): NormalizedSignificanceQuestion {
  return {
    id,
    key: String(id),
    order: id,
    text,
    answers,
    options: answers,
  };
}

const DEFAULT_SIGNIFICANCE_QUESTIONS: NormalizedSignificanceQuestion[] = [
  defaultQuestion(1, "Mon travail, c’est toute ma vie", [
    option(
      "yes",
      "Oui",
      scores({ raison: 6, metier: 2, occupation: 1, corvee: 0.5, hobby: 0.5 }),
    ),
    option("no", "Non", scores({ raison: 0, metier: 1, occupation: 3, corvee: 4, hobby: 2 })),
    option(
      "maybe",
      "Peut-être",
      scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
    ),
    option(
      "unknown",
      "Je ne sais pas",
      scores({ raison: 1, metier: 1, occupation: 6, corvee: 1, hobby: 1 }),
    ),
  ]),
  defaultQuestion(
    2,
    "J’aime mon travail, mes activités, mes collègues, ainsi que mes responsabilités",
    [
      option("yes", "Oui", scores({ raison: 4, metier: 3, occupation: 1, corvee: 0, hobby: 2 })),
      option("no", "Non", scores({ raison: 0, metier: 1, occupation: 3, corvee: 4, hobby: 2 })),
      option(
        "maybe",
        "Peut-être",
        scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
      ),
      option(
        "unknown",
        "Je ne sais pas",
        scores({ raison: 0.5, metier: 1, occupation: 4, corvee: 3, hobby: 1.5 }),
      ),
    ],
  ),
  defaultQuestion(
    3,
    "Ce qui compte le plus pour moi, c’est ma famille et mes amis avant toute chose",
    [
      option("yes", "Oui", scores({ raison: 0, metier: 3, occupation: 3, corvee: 3, hobby: 1 })),
      option("no", "Non", scores({ raison: 4, metier: 2, occupation: 1, corvee: 1, hobby: 2 })),
      option(
        "maybe",
        "Peut-être",
        scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
      ),
      option(
        "unknown",
        "Je ne sais pas",
        scores({ raison: 2, metier: 2, occupation: 2, corvee: 3, hobby: 1 }),
      ),
    ],
  ),
  defaultQuestion(4, "Mes valeurs et mes principes s’appliquent surtout dans mon travail", [
    option(
      "yes",
      "Oui",
      scores({ raison: 5, metier: 3, occupation: 1, corvee: 0.5, hobby: 0.5 }),
    ),
    option("no", "Non", scores({ raison: 1, metier: 2, occupation: 4, corvee: 2, hobby: 1 })),
    option(
      "maybe",
      "Peut-être",
      scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
    ),
    option(
      "unknown",
      "Je ne sais pas",
      scores({ raison: 1, metier: 1, occupation: 7, corvee: 0.5, hobby: 0.5 }),
    ),
  ]),
  defaultQuestion(5, "Je travaille surtout pour subvenir à mes besoins et supporter mes charges", [
    option("yes", "Oui", scores({ raison: 1, metier: 2, occupation: 3, corvee: 3, hobby: 0 })),
    option(
      "no",
      "Non",
      scores({ raison: 2, metier: 4, occupation: 2, corvee: 0.5, hobby: 1.5 }),
    ),
    option(
      "maybe",
      "Peut-être",
      scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
    ),
    option(
      "unknown",
      "Je ne sais pas",
      scores({ raison: 2, metier: 3, occupation: 3, corvee: 1, hobby: 1 }),
    ),
  ]),
  defaultQuestion(6, "Mon travail me rémunère comme je le souhaite", [
    option(
      "yes",
      "Oui",
      scores({ raison: 2, metier: 4, occupation: 1, corvee: 2.5, hobby: 0.5 }),
    ),
    option(
      "no",
      "Non",
      scores({ raison: 2, metier: 0.5, occupation: 3.5, corvee: 2, hobby: 2 }),
    ),
    option(
      "maybe",
      "Peut-être",
      scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
    ),
    option(
      "unknown",
      "Je ne sais pas",
      scores({ raison: 0, metier: 0.5, occupation: 6, corvee: 0.5, hobby: 3 }),
    ),
  ]),
  defaultQuestion(7, "Si je pouvais faire autrement, je choisirais un autre travail", [
    option("yes", "Oui", scores({ raison: 3, metier: 4, occupation: 0.5, corvee: 0, hobby: 3 })),
    option("no", "Non", scores({ raison: 4, metier: 3, occupation: 1, corvee: 0, hobby: 2 })),
    option(
      "maybe",
      "Peut-être",
      scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
    ),
    option(
      "unknown",
      "Je ne sais pas",
      scores({ raison: 1, metier: 1, occupation: 7, corvee: 0, hobby: 1 }),
    ),
  ]),
  defaultQuestion(8, "Je fais exactement le travail dont j’ai rêvé depuis ma petite enfance", [
    option("yes", "Oui", scores({ raison: 6, metier: 3, occupation: 1, corvee: 0, hobby: 3 })),
    option("no", "Non", scores({ raison: 0, metier: 1, occupation: 3, corvee: 4, hobby: 2 })),
    option(
      "maybe",
      "Peut-être",
      scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
    ),
    option(
      "unknown",
      "Je ne sais pas",
      scores({ raison: 1, metier: 1, occupation: 6, corvee: 1, hobby: 1 }),
    ),
  ]),
  defaultQuestion(9, "J’ai déjà réalisé de grandes choses dans mon travail", [
    option(
      "yes",
      "Oui",
      scores({ raison: 3, metier: 3, occupation: 0.5, corvee: 0.5, hobby: 3 }),
    ),
    option("no", "Non", scores({ raison: 0, metier: 1, occupation: 5, corvee: 4, hobby: 0 })),
    option(
      "maybe",
      "Peut-être",
      scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
    ),
    option(
      "unknown",
      "Je ne sais pas",
      scores({ raison: 1, metier: 1, occupation: 6, corvee: 1, hobby: 1 }),
    ),
  ]),
  defaultQuestion(
    10,
    "Mon travail est très facile, et je fais aisément toutes les activités y relatives",
    [
      option(
        "yes",
        "Oui",
        scores({ raison: 2, metier: 2, occupation: 0.5, corvee: 0.5, hobby: 5 }),
      ),
      option(
        "no",
        "Non",
        scores({ raison: 1.5, metier: 2.5, occupation: 1, corvee: 5, hobby: 0 }),
      ),
      option(
        "maybe",
        "Peut-être",
        scores({ raison: 2, metier: 2, occupation: 2, corvee: 2, hobby: 2 }),
      ),
      option(
        "unknown",
        "Je ne sais pas",
        scores({ raison: 1, metier: 4, occupation: 4, corvee: 0.5, hobby: 0.5 }),
      ),
    ],
  ),
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
    option("yes", "Oui", scores({})),
    option("no", "Non", scores({})),
    option("maybe", "Peut-être", scores({})),
    option("unknown", "Je ne sais pas", scores({})),
  ];
}

function normalizeSignificanceQuestion(
  question: AdminWorkerSignificanceQuestion | NormalizedSignificanceQuestion,
): NormalizedSignificanceQuestion {
  const maybeQuestionWithOrder = question as AdminWorkerSignificanceQuestion & {
    order?: number | string | null;
    key?: string | null;
  };

  const normalizedId = Number(
    maybeQuestionWithOrder.id ?? maybeQuestionWithOrder.order ?? 0,
  );

  const id = Number.isFinite(normalizedId) && normalizedId > 0 ? normalizedId : 0;
  const normalizedAnswers = normalizeQuestionAnswers(question);

  return {
    id,
    key: maybeQuestionWithOrder.key || String(id),
    order: Number(maybeQuestionWithOrder.order ?? id),
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

function getSubscriptionPackPricing(pack?: string | null) {
  if (
    pack === "standard" ||
    pack === "classique" ||
    pack === "flix" ||
    pack === "executif"
  ) {
    return SUBSCRIPTION_PACK_PRICING[pack];
  }

  return SUBSCRIPTION_PACK_PRICING.standard;
}

function formatEur(value?: number | null): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateLabel(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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
    available_time_text: item.available_time_text ?? "",
    time_constraints_text: item.time_constraints_text ?? "",
    time_energy_text: item.time_energy_text ?? "",
    time_rituals_text: item.time_rituals_text ?? "",
    time_priorities_text: item.time_priorities_text ?? "",
    time_risks_text: item.time_risks_text ?? "",
  };
}

function getTimeCanvasCompletedNodes(form: TimeFormState): number {
  return TIME_NODES.reduce((count, node) => {
    const value = form[node.key] ?? "";
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
      answer_label: option?.label ?? "Je ne sais pas",
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
): SignificanceDimensionDisplay[] {
  const entries: Array<{
    key: SignificanceDimensionKey;
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
  dimensions: SignificanceDimensionDisplay[],
): SignificanceDimensionDisplay | null {
  if (dimensions.length === 0) return null;

  const sorted = [...dimensions].sort((left, right) => right.score - left.score);
  const top = sorted[0];

  if (!top || top.score <= 0) return null;

  return top;
}

function buildSignificanceAnalysisSummary(
  dimensions: SignificanceDimensionDisplay[],
): string {
  const dominant = getDominantSignificanceDimension(dimensions);

  if (!dominant) {
    return "Aucune dominante de perception du travail n’est encore détectée. Complétez le questionnaire pour générer une première lecture.";
  }

  const ranked = [...dimensions]
    .filter((dimension) => dimension.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((dimension) => `${dimension.label} ${dimension.percentage}%`)
    .join(" · ");

  if (dominant.key === "raison") {
    return `Dominante détectée : Raison. Le travail semble porter une dimension forte de sens, de contribution ou d’identité. Distribution : ${ranked}.`;
  }

  if (dominant.key === "metier") {
    return `Dominante détectée : Métier. Le travail semble être vécu comme un espace de compétence, de progression et de valeur professionnelle. Distribution : ${ranked}.`;
  }

  if (dominant.key === "occupation") {
    return `Dominante détectée : Occupation. Le travail semble surtout structurer le quotidien, avec un sens ou une énergie à clarifier. Distribution : ${ranked}.`;
  }

  if (dominant.key === "corvee") {
    return `Dominante détectée : Corvée. Le travail semble contenir une charge, une contrainte ou une fatigue importante à explorer. Distribution : ${ranked}.`;
  }

  if (dominant.key === "hobby") {
    return `Dominante détectée : Hobby. Le travail semble contenir une dimension de plaisir, d’intérêt personnel ou de fluidité. Distribution : ${ranked}.`;
  }

  return `Dominante détectée : ${dominant.label}. Distribution : ${ranked}.`;
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
    default:
      return {
        border: "rgba(59,130,246,0.55)",
        background: "rgba(59,130,246,0.08)",
        title: "#1d4ed8",
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

  if (status === "coherent" || status === "balanced" || status === "ready") {
    label = status === "balanced" ? "Balanced" : status === "ready" ? "Ready" : "Coherent";
    color = "#15803d";
    background = "rgba(34,197,94,0.14)";
  } else if (
    status === "watch" ||
    status === "partially_coherent" ||
    status === "partially_ready" ||
    status === "dominant" ||
    status === "tension"
  ) {
    label =
      status === "partially_coherent"
        ? "Partially coherent"
        : status === "partially_ready"
          ? "Partially ready"
          : status === "dominant"
            ? "Dominant"
            : status === "tension"
              ? "Tension"
              : "Watch";
    color = "#b45309";
    background = "rgba(245,158,11,0.14)";
  } else if (
    status === "critical" ||
    status === "incoherent" ||
    status === "fragmented" ||
    status === "at_risk"
  ) {
    label =
      status === "fragmented"
        ? "Fragmented"
        : status === "incoherent"
          ? "Incoherent"
          : status === "at_risk"
            ? "At risk"
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

function SubscriptionStatusBadge({ status }: { status?: string | null }) {
  let label = normalizeDisplayLabel(status || "unknown");
  let color = "#475569";
  let background = "rgba(100,116,139,0.14)";

  if (status === "active") {
    label = "Active";
    color = "#15803d";
    background = "rgba(34,197,94,0.14)";
  } else if (status === "past_due") {
    label = "Past due";
    color = "#b45309";
    background = "rgba(245,158,11,0.14)";
  } else if (status === "cancelled") {
    label = "Cancelled";
    color = "#b91c1c";
    background = "rgba(239,68,68,0.14)";
  } else if (status === "inactive") {
    label = "Inactive";
    color = "#64748b";
    background = "rgba(100,116,139,0.14)";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 9px",
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

function BusinessIdHint({ businessId }: { businessId?: string | null }) {
  return (
    <div
      className="muted"
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(15,23,42,0.04)",
        border: "1px solid var(--border)",
      }}
    >
      <strong>Business ID</strong> — {businessId || "Generated automatically after creation"}
    </div>
  );
}

function SubscriptionPackPriceHint({
  pack,
  subscription,
  compact = false,
}: {
  pack: string | null | undefined;
  subscription?: AdminWorker["active_subscription"] | null;
  compact?: boolean;
}) {
  const effectivePack = subscription?.pack || pack;
  const pricing = getSubscriptionPackPricing(effectivePack);

  const monthlyPriceLabel =
    subscription && !pricing.isContactSales
      ? `${formatEur(subscription.monthly_price_eur)} / month`
      : pricing.monthlyLabel;

  const annualPriceLabel =
    subscription && subscription.annual_price_eur != null && !pricing.isContactSales
      ? `${formatEur(subscription.annual_price_eur)} / year`
      : pricing.annualLabel;

  return (
    <div
      className="muted"
      style={{
        padding: compact ? "8px 10px" : "10px 12px",
        borderRadius: 12,
        background: "rgba(15,23,42,0.04)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: compact ? 5 : 8,
      }}
    >
      <div>
        <strong>{pricing.commercialLabel}</strong> — {monthlyPriceLabel} · {annualPriceLabel}
      </div>

      {subscription ? (
        <>
          <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <SubscriptionStatusBadge status={subscription.status} />
            <span className="badge">
              cycle: {normalizeDisplayLabel(subscription.billing_cycle)}
            </span>
            <span className="badge">paid: {formatEur(subscription.total_paid_eur)}</span>
          </div>

          {!compact ? (
            <div className="muted">
              Period: {formatDateLabel(subscription.current_period_start)} →{" "}
              {formatDateLabel(subscription.current_period_end)}
            </div>
          ) : null}
        </>
      ) : (
        <div className="muted">No persisted subscription details yet.</div>
      )}
    </div>
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
          minHeight: 720,
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

function TimeCanvasVisual({
  form,
  onChange,
  readinessScore,
  readinessStatus,
  summary,
}: {
  form: TimeFormState;
  onChange: (key: TimeNodeKey, value: string) => void;
  readinessScore: number;
  readinessStatus: string;
  summary: string;
}) {
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div
        className="card-soft"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Readiness score</div>
          <div className="admin-metric-value" style={{ fontSize: 30 }}>
            {readinessScore}%
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Readiness status</div>
          <div>
            <CoherenceBadge status={readinessStatus} />
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Filled blocks</div>
          <div className="admin-metric-value" style={{ fontSize: 30 }}>
            {getTimeCanvasCompletedNodes(form)}/{TIME_NODES.length}
          </div>
        </div>
      </div>

      <div className="card-soft stack" style={{ gap: 10 }}>
        <div className="section-title" style={{ fontSize: 15 }}>
          Time Canvas reading
        </div>
        <div className="muted">{summary}</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {TIME_NODES.map((node) => (
          <CanvasTextBlock
            key={node.key}
            title={node.label}
            value={form[node.key]}
            onChange={(value) => onChange(node.key, value)}
            minHeight={220}
            tone={node.tone}
            placeholder={node.placeholder}
          />
        ))}
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
          const toneStyles = getCanvasToneStyles(dimension.tone);

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
          const questionAnswers: AdminWorkerSignificanceQuestionAnswer[] = question.answers;

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

export default function AdminWorkersPage() {
  return (
    <AdminGuard>
      <AdminWorkersContent />
    </AdminGuard>
  );
}

function AdminWorkersContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);

  const [workers, setWorkers] = useState<AdminWorker[]>([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [workersSaving, setWorkersSaving] = useState(false);
  const [workerCreating, setWorkerCreating] = useState(false);
  const [createWorkerForm, setCreateWorkerForm] =
    useState<CreateWorkerFormState>(EMPTY_CREATE_WORKER_FORM);

  const [conversations, setConversations] = useState<AdminWorkerConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationSaving, setConversationSaving] = useState(false);

  const [viewMode, setViewMode] = useState<WorkersViewMode>("workers");
  const [error, setError] = useState<string | null>(null);

  const [workerSearch, setWorkerSearch] = useState("");
  const [workerPackFilter, setWorkerPackFilter] = useState<
    "all" | "standard" | "classique" | "flix" | "executif"
  >("all");
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [workerForm, setWorkerForm] = useState<WorkerFormState>(EMPTY_WORKER_FORM);

  const [conversationWorkerFilter, setConversationWorkerFilter] = useState<string>("all");
  const [editingConversationId, setEditingConversationId] = useState<number | null>(null);
  const [conversationForm, setConversationForm] =
    useState<ConversationFormState>(EMPTY_CONVERSATION_FORM);

  const [engagementSelectionWorkerId, setEngagementSelectionWorkerId] = useState<string>("");
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

  const [purposeSelectionWorkerId, setPurposeSelectionWorkerId] = useState<string>("");
  const [purposeCanvasLoaded, setPurposeCanvasLoaded] = useState(false);
  const [purposeLoading, setPurposeLoading] = useState(false);
  const [purposeSaving, setPurposeSaving] = useState(false);
  const [editingPurposeCanvasId, setEditingPurposeCanvasId] = useState<number | null>(null);
  const [editingPurposeCanvas, setEditingPurposeCanvas] =
    useState<AdminWorkerPurposeCanvas | null>(null);
  const [purposeForm, setPurposeForm] = useState<PurposeFormState>(EMPTY_PURPOSE_FORM);
  const [purposeSaveState, setPurposeSaveState] = useState<SaveIndicator>("idle");
  const [purposeLastSavedAtLabel, setPurposeLastSavedAtLabel] = useState<string | null>(null);

  const [timeSelectionWorkerId, setTimeSelectionWorkerId] = useState<string>("");
  const [timeCanvasLoaded, setTimeCanvasLoaded] = useState(false);
  const [timeLoading, setTimeLoading] = useState(false);
  const [timeSaving, setTimeSaving] = useState(false);
  const [editingTimeCanvasId, setEditingTimeCanvasId] = useState<number | null>(null);
  const [editingTimeCanvas, setEditingTimeCanvas] =
    useState<AdminWorkerTimeCanvas | null>(null);
  const [timeForm, setTimeForm] = useState<TimeFormState>(EMPTY_TIME_FORM);
  const [timeSaveState, setTimeSaveState] = useState<SaveIndicator>("idle");
  const [timeLastSavedAtLabel, setTimeLastSavedAtLabel] = useState<string | null>(null);

  const [significanceSelectionWorkerId, setSignificanceSelectionWorkerId] =
    useState<string>("");
  const [significanceQuestions, setSignificanceQuestions] = useState<
    NormalizedSignificanceQuestion[]
  >(DEFAULT_SIGNIFICANCE_QUESTIONS);
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

  useEffect(() => {
    async function load() {
      try {
        const [me, workerData, conversationData, questionData] = await Promise.all([
          getAdminMe(),
          getAdminWorkers(),
          getAdminWorkerConversations(),
          getAdminWorkerSignificanceQuestions(),
        ]);

        setAdmin(me);
        setWorkers(workerData);
        setConversations(conversationData);
        setSignificanceQuestions(normalizeSignificanceQuestions(questionData));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workers workspace.");
        setSignificanceQuestions(DEFAULT_SIGNIFICANCE_QUESTIONS);
      } finally {
        setWorkersLoading(false);
        setConversationsLoading(false);
      }
    }

    void load();
  }, []);
    const filteredWorkers = useMemo(() => {
    const q = workerSearch.trim().toLowerCase();

    return workers.filter((worker) => {
      const matchesText =
        !q ||
        worker.display_name.toLowerCase().includes(q) ||
        (worker.email || "").toLowerCase().includes(q) ||
        (worker.given_name || "").toLowerCase().includes(q) ||
        (worker.family_name || "").toLowerCase().includes(q) ||
        (worker.current_role || "").toLowerCase().includes(q) ||
        (worker.industry || "").toLowerCase().includes(q) ||
        (worker.business_id || "").toLowerCase().includes(q) ||
        (worker.location || "").toLowerCase().includes(q) ||
        (worker.profession || "").toLowerCase().includes(q);

      const matchesPack =
        workerPackFilter === "all" || worker.subscription_pack === workerPackFilter;

      return matchesText && matchesPack;
    });
  }, [workers, workerSearch, workerPackFilter]);

  const selectedWorker = useMemo(() => {
    if (selectedWorkerId == null) return null;
    return workers.find((worker) => worker.id === selectedWorkerId) ?? null;
  }, [workers, selectedWorkerId]);

  const filteredConversations = useMemo(() => {
    return conversationWorkerFilter === "all"
      ? conversations
      : conversations.filter((item) => String(item.worker_id) === conversationWorkerFilter);
  }, [conversations, conversationWorkerFilter]);

  const workerConversations = useMemo(() => {
    if (!selectedWorkerId) return [];
    return conversations.filter((item) => item.worker_id === selectedWorkerId);
  }, [conversations, selectedWorkerId]);

  const workersById = useMemo(() => {
    const map = new Map<number, AdminWorker>();
    workers.forEach((worker) => {
      map.set(worker.id, worker);
    });
    return map;
  }, [workers]);

  const stats = useMemo(() => {
    const totalSpent = workers.reduce((sum, worker) => sum + (worker.total_spent_eur ?? 0), 0);
    const artifactRevenue = workers.reduce(
      (sum, worker) => sum + (worker.artifacts_spent_eur ?? 0),
      0,
    );
    const subscriptionRevenue = workers.reduce(
      (sum, worker) => sum + (worker.subscription_total_paid_eur ?? 0),
      0,
    );
    const activeSubscriptions = workers.filter(
      (worker) => worker.active_subscription?.status === "active",
    ).length;

    return {
      totalWorkers: workers.length,
      totalConversations: conversations.length,
      totalSpent,
      artifactRevenue,
      subscriptionRevenue,
      activeSubscriptions,
      flixWorkers: workers.filter((worker) => worker.subscription_pack === "flix").length,
      executiveWorkers: workers.filter((worker) => worker.subscription_pack === "executif").length,
    };
  }, [workers, conversations]);

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

  const timeSummary = useMemo(
    () => buildTimeCanvasSummary(timeForm),
    [timeForm],
  );

  const significanceAnswers = useMemo(
    () => buildSignificanceAnswers(significanceForm, significanceQuestions),
    [significanceForm, significanceQuestions],
  );

  const significanceScores = useMemo(
    () => calculateSignificanceScores(significanceAnswers),
    [significanceAnswers],
  );

  const significanceDimensions = useMemo(
    () => calculateSignificanceDimensions(significanceScores),
    [significanceScores],
  );

  const significanceAnalysisSummary = useMemo(
    () => buildSignificanceAnalysisSummary(significanceDimensions),
    [significanceDimensions],
  );

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

  function fillWorkerForm(worker: AdminWorker) {
    setSelectedWorkerId(worker.id);
    setWorkerForm({
      business_id: worker.business_id || "",
      location: worker.location || "",
      phone_number: worker.phone_number || "",
      subscription_pack: worker.subscription_pack || "standard",
      profession: worker.profession || "",
    });
  }

  function openWorkerContext(worker: AdminWorker, nextViewMode?: WorkersViewMode) {
    fillWorkerForm(worker);

    if (nextViewMode) {
      setViewMode(nextViewMode);
    }

    setConversationWorkerFilter(String(worker.id));
    setConversationForm((prev) => ({
      ...prev,
      worker_id: String(worker.id),
    }));

    setEngagementSelectionWorkerId(String(worker.id));
    setPurposeSelectionWorkerId(String(worker.id));
    setTimeSelectionWorkerId(String(worker.id));
    setSignificanceSelectionWorkerId(String(worker.id));
  }

  function resetWorkerForm() {
    setSelectedWorkerId(null);
    setWorkerForm(EMPTY_WORKER_FORM);
    setConversationWorkerFilter("all");
    setConversationForm((prev) => ({
      ...prev,
      worker_id: "",
    }));
    setEngagementSelectionWorkerId("");
    setPurposeSelectionWorkerId("");
    setTimeSelectionWorkerId("");
    setSignificanceSelectionWorkerId("");
    resetEngagementCanvas();
    resetPurposeCanvas();
    resetTimeCanvas();
    resetSignificanceCanvas();
  }

  function resetCreateWorkerForm() {
    setCreateWorkerForm(EMPTY_CREATE_WORKER_FORM);
  }

  function resetEngagementCanvas() {
    if (engagementAutoSaveTimerRef.current) {
      clearTimeout(engagementAutoSaveTimerRef.current);
      engagementAutoSaveTimerRef.current = null;
    }

    setEditingEngagementId(null);
    setEditingEngagement(null);
    setEngagementForm(EMPTY_ENGAGEMENT_FORM);
    setEngagementCanvasLoaded(false);
    setEngagementSaveState("idle");
    setLastSavedAtLabel(null);
    skipNextEngagementAutosaveRef.current = true;
  }

  function resetPurposeCanvas() {
    if (purposeAutoSaveTimerRef.current) {
      clearTimeout(purposeAutoSaveTimerRef.current);
      purposeAutoSaveTimerRef.current = null;
    }

    setEditingPurposeCanvasId(null);
    setEditingPurposeCanvas(null);
    setPurposeForm(EMPTY_PURPOSE_FORM);
    setPurposeCanvasLoaded(false);
    setPurposeSaveState("idle");
    setPurposeLastSavedAtLabel(null);
    skipNextPurposeAutosaveRef.current = true;
  }

  function resetTimeCanvas() {
    if (timeAutoSaveTimerRef.current) {
      clearTimeout(timeAutoSaveTimerRef.current);
      timeAutoSaveTimerRef.current = null;
    }

    setEditingTimeCanvasId(null);
    setEditingTimeCanvas(null);
    setTimeForm(EMPTY_TIME_FORM);
    setTimeCanvasLoaded(false);
    setTimeSaveState("idle");
    setTimeLastSavedAtLabel(null);
    skipNextTimeAutosaveRef.current = true;
  }

  function resetSignificanceCanvas() {
    if (significanceAutoSaveTimerRef.current) {
      clearTimeout(significanceAutoSaveTimerRef.current);
      significanceAutoSaveTimerRef.current = null;
    }

    setEditingSignificanceCanvasId(null);
    setEditingSignificanceCanvas(null);
    setSignificanceForm(EMPTY_SIGNIFICANCE_FORM);
    setSignificanceCanvasLoaded(false);
    setSignificanceSaveState("idle");
    setSignificanceLastSavedAtLabel(null);
    skipNextSignificanceAutosaveRef.current = true;
  }

  async function handleCreateWorker(e: FormEvent) {
    e.preventDefault();

    const email = createWorkerForm.email.trim().toLowerCase();
    const displayName = createWorkerForm.display_name.trim();

    if (!email || !displayName) {
      setError("Email and display name are required to create a worker.");
      return;
    }

    setWorkerCreating(true);
    setError(null);

    try {
      const payload: AdminWorkerCreate = {
        email,
        display_name: displayName,
        given_name: createWorkerForm.given_name.trim() || null,
        family_name: createWorkerForm.family_name.trim() || null,
        language: createWorkerForm.language,
        location: createWorkerForm.location.trim() || null,
        phone_number: createWorkerForm.phone_number.trim() || null,
        subscription_pack: createWorkerForm.subscription_pack,
        profession: createWorkerForm.profession.trim() || null,
        organization_id: createWorkerForm.organization_id.trim()
          ? Number(createWorkerForm.organization_id.trim())
          : null,
      };

      const created = await createAdminWorker(payload);

      setWorkers((prev) => [created, ...prev]);
      fillWorkerForm(created);
      setWorkerSearch("");
      setWorkerPackFilter("all");
      resetCreateWorkerForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create worker.");
    } finally {
      setWorkerCreating(false);
    }
  }

  async function handleSaveWorker() {
    if (!selectedWorkerId) return;

    setWorkersSaving(true);
    setError(null);

    try {
      const payload: AdminWorkerUpdate = {
        location: workerForm.location.trim() || null,
        phone_number: workerForm.phone_number.trim() || null,
        subscription_pack: workerForm.subscription_pack,
        profession: workerForm.profession.trim() || null,
      };

      const updated = await updateAdminWorker(selectedWorkerId, payload);

      setWorkers((prev) => prev.map((worker) => (worker.id === updated.id ? updated : worker)));
      fillWorkerForm(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update worker.");
    } finally {
      setWorkersSaving(false);
    }
  }

  function fillConversationForm(item: AdminWorkerConversation) {
    setEditingConversationId(item.id);
    setConversationForm({
      worker_id: String(item.worker_id),
      title: item.title,
      source_type: item.source_type,
      source_label: item.source_label || "",
      video_url: item.video_url || "",
      file_path: item.file_path || "",
      conversation_date: item.conversation_date ? item.conversation_date.slice(0, 16) : "",
      transcript: item.transcript || "",
      notes: item.notes || "",
    });

    const linkedWorker = workersById.get(item.worker_id);
    if (linkedWorker) {
      fillWorkerForm(linkedWorker);
    }
  }

  function resetConversationForm(keepWorkerContext = true) {
    setEditingConversationId(null);
    setConversationForm({
      ...EMPTY_CONVERSATION_FORM,
      worker_id: keepWorkerContext && selectedWorkerId ? String(selectedWorkerId) : "",
    });
  }

  async function handleSaveConversation(e: FormEvent) {
    e.preventDefault();
    setConversationSaving(true);
    setError(null);

    try {
      const basePayload = {
        title: conversationForm.title.trim(),
        source_type: conversationForm.source_type,
        source_label: conversationForm.source_label.trim() || null,
        video_url:
          conversationForm.source_type === "url"
            ? conversationForm.video_url.trim() || null
            : null,
        file_path:
          conversationForm.source_type === "upload"
            ? conversationForm.file_path.trim() || null
            : null,
        conversation_date: conversationForm.conversation_date
          ? new Date(conversationForm.conversation_date).toISOString()
          : null,
        transcript: conversationForm.transcript.trim() || null,
        notes: conversationForm.notes.trim() || null,
      };

      if (editingConversationId) {
        const payload: AdminWorkerConversationUpdate = basePayload;
        const updated = await updateAdminWorkerConversation(editingConversationId, payload);
        setConversations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        fillConversationForm(updated);
      } else {
        const payload: AdminWorkerConversationCreate = {
          worker_id: Number(conversationForm.worker_id),
          ...basePayload,
        };
        const created = await createAdminWorkerConversation(payload);
        setConversations((prev) => [created, ...prev]);
        resetConversationForm(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save conversation.");
    } finally {
      setConversationSaving(false);
    }
  }

  async function handleLoadEngagementCanvas() {
    if (!engagementSelectionWorkerId) {
      setError("Please select a worker first.");
      return;
    }

    setEngagementsLoading(true);
    setError(null);
    setEngagementSaveState("idle");
    setLastSavedAtLabel(null);

    try {
      const workerId = Number(engagementSelectionWorkerId);
      const matches = await getAdminWorkerEngagements({
        worker_id: workerId,
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
          worker_id: String(workerId),
          state_type: engagementSelectionState,
        });
      }

      setEngagementCanvasLoaded(true);

      const linkedWorker = workersById.get(workerId);
      if (linkedWorker) {
        fillWorkerForm(linkedWorker);
      }

      skipNextEngagementAutosaveRef.current = true;
    } catch (err) {
      setEngagementCanvasLoaded(false);
      setEditingEngagementId(null);
      setEditingEngagement(null);
      setEngagementForm(EMPTY_ENGAGEMENT_FORM);
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
    if (!purposeSelectionWorkerId) {
      setError("Please select a worker first.");
      return;
    }

    setPurposeLoading(true);
    setError(null);
    setPurposeSaveState("idle");
    setPurposeLastSavedAtLabel(null);

    try {
      const workerId = Number(purposeSelectionWorkerId);
      const matches = await getAdminWorkerPurposeCanvases({
        worker_id: workerId,
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
          worker_id: String(workerId),
        });
      }

      setPurposeCanvasLoaded(true);

      const linkedWorker = workersById.get(workerId);
      if (linkedWorker) {
        fillWorkerForm(linkedWorker);
      }

      skipNextPurposeAutosaveRef.current = true;
    } catch (err) {
      setPurposeCanvasLoaded(false);
      setEditingPurposeCanvasId(null);
      setEditingPurposeCanvas(null);
      setPurposeForm(EMPTY_PURPOSE_FORM);
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
    const coherenceStatus = getPurposeCoherenceStatus(coherenceScore, completedRelations);
    const relationMapJson = buildPurposeRelationMapJson(relations);
    const coherentRelations = relations.filter((relation) => relation.status === "coherent").length;
    const incoherentRelations = relations.filter((relation) => relation.status === "incoherent").length;

    const coherenceSummary =
      completedRelations === 0
        ? "Purpose canvas is not evaluated yet because no completed relation is available."
        : `${coherenceScore}% coherence across ${completedRelations} completed relation(s): ${coherentRelations} coherent and ${incoherentRelations} incoherent.`;

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
        coherence_summary: coherenceSummary,
        relation_map_json: relationMapJson,
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
    if (!timeSelectionWorkerId) {
      setError("Please select a worker first.");
      return;
    }

    setTimeLoading(true);
    setError(null);
    setTimeSaveState("idle");
    setTimeLastSavedAtLabel(null);

    try {
      const workerId = Number(timeSelectionWorkerId);
      const matches = await getAdminWorkerTimeCanvases({
        worker_id: workerId,
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
          worker_id: String(workerId),
        });
      }

      setTimeCanvasLoaded(true);

      const linkedWorker = workersById.get(workerId);
      if (linkedWorker) {
        fillWorkerForm(linkedWorker);
      }

      skipNextTimeAutosaveRef.current = true;
    } catch (err) {
      setTimeCanvasLoaded(false);
      setEditingTimeCanvasId(null);
      setEditingTimeCanvas(null);
      setTimeForm(EMPTY_TIME_FORM);
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
    if (!significanceSelectionWorkerId) {
      setError("Please select a worker first.");
      return;
    }

    setSignificanceLoading(true);
    setError(null);
    setSignificanceSaveState("idle");
    setSignificanceLastSavedAtLabel(null);

    try {
      const workerId = Number(significanceSelectionWorkerId);
      const matches = await getAdminWorkerSignificanceCanvases({
        worker_id: workerId,
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
          worker_id: String(workerId),
        });
      }

      setSignificanceCanvasLoaded(true);

      const linkedWorker = workersById.get(workerId);
      if (linkedWorker) {
        fillWorkerForm(linkedWorker);
      }

      skipNextSignificanceAutosaveRef.current = true;
    } catch (err) {
      setSignificanceCanvasLoaded(false);
      setEditingSignificanceCanvasId(null);
      setEditingSignificanceCanvas(null);
      setSignificanceForm(EMPTY_SIGNIFICANCE_FORM);
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
        raw_scores_json: significanceScores,
        scores_json: significanceScores,
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
    if (viewMode !== "engagements") return;
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
  }, [engagementForm, engagementCanvasLoaded, viewMode, isFutureStateLocked]);

  useEffect(() => {
    if (viewMode !== "purpose") return;
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
  }, [purposeForm, purposeCanvasLoaded, viewMode]);

  useEffect(() => {
    if (viewMode !== "time") return;
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
  }, [timeForm, timeCanvasLoaded, viewMode, timeReadinessScore, timeReadinessStatus, timeSummary]);

  useEffect(() => {
    if (viewMode !== "significance") return;
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
  }, [
    significanceForm,
    significanceCanvasLoaded,
    viewMode,
    significanceAnswers,
    significanceScores,
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

  return (
    <AdminShell
      activeHref="/admin/workers"
      title="Manage Workers"
      subtitle="Worker directory plus off-platform conversation, engagement, purpose, time, and significance management."
      adminEmail={admin?.email ?? null}
    >
      <div className="stack" style={{ gap: 4 }}>
        <div className="section-title">Workers workspace</div>
        <div className="muted">
          Workers can be created manually by admin or automatically from successful LinkedIn
          authentication, then enriched from admin.
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <button
            className={viewMode === "workers" ? "button" : "button ghost"}
            type="button"
            onClick={() => setViewMode("workers")}
          >
            Workers
          </button>

          <button
            className={viewMode === "conversations" ? "button" : "button ghost"}
            type="button"
            onClick={() => setViewMode("conversations")}
          >
            Conversations
          </button>

          <button
            className={viewMode === "engagements" ? "button" : "button ghost"}
            type="button"
            onClick={() => {
              setViewMode("engagements");
              resetEngagementCanvas();
            }}
          >
            Engagements
          </button>

          <button
            className={viewMode === "purpose" ? "button" : "button ghost"}
            type="button"
            onClick={() => {
              setViewMode("purpose");
              resetPurposeCanvas();
            }}
          >
            Purpose
          </button>

          <button
            className={viewMode === "time" ? "button" : "button ghost"}
            type="button"
            onClick={() => {
              setViewMode("time");
              resetTimeCanvas();
            }}
          >
            Time
          </button>

          <button
            className={viewMode === "significance" ? "button" : "button ghost"}
            type="button"
            onClick={() => {
              setViewMode("significance");
              resetSignificanceCanvas();
            }}
          >
            Significance
          </button>
        </div>

        <div
          style={{
            width: "100%",
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(180px, 1fr))",
              gap: 16,
              minWidth: 1180,
            }}
          >
            <div className="card-soft stack" style={{ gap: 6 }}>
              <div className="muted">Total workers</div>
              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {stats.totalWorkers}
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 6 }}>
              <div className="muted">Active subscriptions</div>
              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {stats.activeSubscriptions}
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 6 }}>
              <div className="muted">Total spent</div>
              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {formatEur(stats.totalSpent)}
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 6 }}>
              <div className="muted">Subscription paid</div>
              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {formatEur(stats.subscriptionRevenue)}
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 6 }}>
              <div className="muted">Artifacts spent</div>
              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {formatEur(stats.artifactRevenue)}
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 6 }}>
              <div className="muted">Total conversations</div>
              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {stats.totalConversations}
              </div>
            </div>
          </div>
        </div>
      </div>
            {error ? (
        <div className="card" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : null}

      {selectedWorker ? (
        <div className="card stack">
          <div
            className="row space-between"
            style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">Current worker context</div>
              <div className="muted">
                #{selectedWorker.id} — {selectedWorker.display_name}
              </div>
              <div className="muted">{selectedWorker.email || "No email"}</div>

              <BusinessIdHint businessId={selectedWorker.business_id} />

              <SubscriptionPackPriceHint
                pack={selectedWorker.subscription_pack}
                subscription={selectedWorker.active_subscription}
              />
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  setViewMode("conversations");
                  setConversationWorkerFilter(String(selectedWorker.id));
                  setConversationForm((prev) => ({
                    ...prev,
                    worker_id: String(selectedWorker.id),
                  }));
                }}
              >
                Open conversations ({workerConversations.length})
              </button>

              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  setViewMode("engagements");
                  setEngagementSelectionWorkerId(String(selectedWorker.id));
                  resetEngagementCanvas();
                }}
              >
                Open engagements
              </button>

              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  setViewMode("purpose");
                  setPurposeSelectionWorkerId(String(selectedWorker.id));
                  resetPurposeCanvas();
                }}
              >
                Open purpose
              </button>

              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  setViewMode("time");
                  setTimeSelectionWorkerId(String(selectedWorker.id));
                  resetTimeCanvas();
                }}
              >
                Open time
              </button>

              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  setViewMode("significance");
                  setSignificanceSelectionWorkerId(String(selectedWorker.id));
                  resetSignificanceCanvas();
                }}
              >
                Open significance
              </button>

              <button className="button ghost" type="button" onClick={resetWorkerForm}>
                Clear worker context
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewMode === "workers" ? (
        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div
            className="card stack"
            style={{
              height: "calc(100vh - 310px)",
              minHeight: 520,
              overflow: "hidden",
            }}
          >
            <div className="section-title">Search & filter workers</div>

            <input
              className="input"
              placeholder="Search by name, email, role, industry, business ID, location..."
              value={workerSearch}
              onChange={(e) => setWorkerSearch(e.target.value)}
            />

            <select
              className="select"
              value={workerPackFilter}
              onChange={(e) =>
                setWorkerPackFilter(
                  e.target.value as "all" | "standard" | "classique" | "flix" | "executif",
                )
              }
            >
              <option value="all">All subscription packs</option>
              <option value="standard">standard — 0€ / month</option>
              <option value="classique">classique — 89,90€ / month</option>
              <option value="flix">flix — 290,90€ / month</option>
              <option value="executif">executif — contact sales</option>
            </select>

            <div className="muted">
              {workersLoading ? "Loading..." : `${filteredWorkers.length} worker(s) shown`}
            </div>

            {workersLoading ? (
              <div>Loading workers...</div>
            ) : filteredWorkers.length === 0 ? (
              <div>No workers found.</div>
            ) : (
              <div
                className="stack"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: 6,
                  gap: 14,
                }}
              >
                {filteredWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="card-soft stack"
                    role="button"
                    tabIndex={0}
                    onClick={() => fillWorkerForm(worker)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fillWorkerForm(worker);
                      }
                    }}
                    style={{
                      gap: 8,
                      textAlign: "left",
                      cursor: "pointer",
                      border:
                        selectedWorkerId === worker.id
                          ? "1px solid var(--primary)"
                          : "1px solid var(--border)",
                      flexShrink: 0,
                    }}
                  >
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge">#{worker.id}</span>
                      <span className="badge">{worker.subscription_pack}</span>
                      <SubscriptionStatusBadge status={worker.active_subscription?.status} />
                      {worker.is_manually_created ? <span className="badge">manual</span> : null}
                      {worker.linkedin_linked_at ? (
                        <span className="badge">linkedin linked</span>
                      ) : null}
                      {worker.email_verified ? <span className="badge">verified</span> : null}
                      {worker.onboarding_completed ? <span className="badge">onboarded</span> : null}
                    </div>

                    <div className="section-title" style={{ fontSize: 16 }}>
                      {worker.display_name}
                    </div>

                    <div className="muted">{worker.email || "No email"}</div>

                    {worker.business_id ? (
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">business: {worker.business_id}</span>
                      </div>
                    ) : null}

                    <SubscriptionPackPriceHint
                      pack={worker.subscription_pack}
                      subscription={worker.active_subscription}
                      compact
                    />

                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      {worker.current_role ? (
                        <span className="badge">role: {worker.current_role}</span>
                      ) : null}
                      {worker.industry ? (
                        <span className="badge">industry: {worker.industry}</span>
                      ) : null}
                    </div>

                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge">
                        total spent: {formatEur(worker.total_spent_eur)}
                      </span>
                      <span className="badge">
                        subscriptions: {formatEur(worker.subscription_total_paid_eur)}
                      </span>
                      <span className="badge">
                        artifacts: {formatEur(worker.artifacts_spent_eur)}
                      </span>
                      <span className="badge">
                        paid artifacts: {worker.paid_artifacts_count ?? 0}
                      </span>
                    </div>

                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="button ghost"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWorkerContext(worker, "conversations");
                        }}
                      >
                        Conversations
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWorkerContext(worker, "engagements");
                          setEngagementSelectionWorkerId(String(worker.id));
                          resetEngagementCanvas();
                        }}
                      >
                        Engagements
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWorkerContext(worker, "purpose");
                          setPurposeSelectionWorkerId(String(worker.id));
                          resetPurposeCanvas();
                        }}
                      >
                        Purpose
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWorkerContext(worker, "time");
                          setTimeSelectionWorkerId(String(worker.id));
                          resetTimeCanvas();
                        }}
                      >
                        Time
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWorkerContext(worker, "significance");
                          setSignificanceSelectionWorkerId(String(worker.id));
                          resetSignificanceCanvas();
                        }}
                      >
                        Significance
                      </button>
                    </div>

                    <div className="muted">
                      Created {new Date(worker.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="stack" style={{ gap: 16 }}>
            <div className="card stack">
              <div className="section-title">Create Worker</div>
              <div className="muted">
                Create a worker manually. If they later authenticate with LinkedIn using the same
                email, the account will be linked to this worker instead of creating a duplicate.
              </div>

              <BusinessIdHint />

              <form className="stack" onSubmit={handleCreateWorker}>
                <div className="grid grid-2">
                  <label className="stack">
                    <strong>Email *</strong>
                    <input
                      className="input"
                      type="email"
                      value={createWorkerForm.email}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="worker@example.com"
                      required
                    />
                  </label>

                  <label className="stack">
                    <strong>Display name *</strong>
                    <input
                      className="input"
                      value={createWorkerForm.display_name}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({
                          ...prev,
                          display_name: e.target.value,
                        }))
                      }
                      placeholder="John Doe"
                      required
                    />
                  </label>
                </div>

                <div className="grid grid-2">
                  <label className="stack">
                    <strong>Given name</strong>
                    <input
                      className="input"
                      value={createWorkerForm.given_name}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({
                          ...prev,
                          given_name: e.target.value,
                        }))
                      }
                      placeholder="John"
                    />
                  </label>

                  <label className="stack">
                    <strong>Family name</strong>
                    <input
                      className="input"
                      value={createWorkerForm.family_name}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({
                          ...prev,
                          family_name: e.target.value,
                        }))
                      }
                      placeholder="Doe"
                    />
                  </label>
                </div>

                <div className="grid grid-2">
                  <label className="stack">
                    <strong>Language</strong>
                    <select
                      className="select"
                      value={createWorkerForm.language}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({
                          ...prev,
                          language: e.target.value as "en" | "fr",
                        }))
                      }
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                    </select>
                  </label>

                  <label className="stack">
                    <strong>Subscription pack</strong>
                    <select
                      className="select"
                      value={createWorkerForm.subscription_pack}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({
                          ...prev,
                          subscription_pack: e.target.value as SubscriptionPack,
                        }))
                      }
                    >
                      <option value="standard">standard — 0€ / month</option>
                      <option value="classique">classique — 89,90€ / month</option>
                      <option value="flix">flix — 290,90€ / month</option>
                      <option value="executif">executif — contact sales</option>
                    </select>

                    <SubscriptionPackPriceHint pack={createWorkerForm.subscription_pack} />
                  </label>
                </div>

                <div className="grid grid-2">
                  <label className="stack">
                    <strong>Location</strong>
                    <input
                      className="input"
                      value={createWorkerForm.location}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="Brussels, Belgium"
                    />
                  </label>

                  <label className="stack">
                    <strong>Organization ID</strong>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      value={createWorkerForm.organization_id}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({
                          ...prev,
                          organization_id: e.target.value,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </label>
                </div>

                <div className="grid grid-2">
                  <label className="stack">
                    <strong>Phone number</strong>
                    <input
                      className="input"
                      value={createWorkerForm.phone_number}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({
                          ...prev,
                          phone_number: e.target.value,
                        }))
                      }
                      placeholder="+32 ..."
                    />
                  </label>

                  <label className="stack">
                    <strong>Profession</strong>
                    <input
                      className="input"
                      value={createWorkerForm.profession}
                      onChange={(e) =>
                        setCreateWorkerForm((prev) => ({
                          ...prev,
                          profession: e.target.value,
                        }))
                      }
                      placeholder="Enterprise Architect"
                    />
                  </label>
                </div>

                <div className="row" style={{ flexWrap: "wrap" }}>
                  <button className="button" type="submit" disabled={workerCreating}>
                    {workerCreating ? "Creating..." : "Create worker"}
                  </button>

                  <button
                    className="button ghost"
                    type="button"
                    onClick={resetCreateWorkerForm}
                    disabled={workerCreating}
                  >
                    Reset create form
                  </button>
                </div>
              </form>
            </div>

            <div className="card stack">
              <div className="section-title">
                {selectedWorker ? `Edit worker #${selectedWorker.id}` : "Select a worker"}
              </div>

              {!selectedWorker ? (
                <div className="muted">
                  Select a worker from the list to enrich the profile, or create a new worker above.
                </div>
              ) : (
                <>
                  <div className="card-soft stack" style={{ gap: 8 }}>
                    <div className="section-title" style={{ fontSize: 15 }}>
                      Worker identity
                    </div>
                    <div className="muted">Name: {selectedWorker.display_name}</div>
                    <div className="muted">Email: {selectedWorker.email || "—"}</div>
                    <div className="muted">
                      Provider: {selectedWorker.auth_provider} / {selectedWorker.provider_user_id}
                    </div>
                    <div className="muted">
                      Manual creation: {selectedWorker.is_manually_created ? "yes" : "no"}
                    </div>
                    <div className="muted">
                      LinkedIn linked:{" "}
                      {selectedWorker.linkedin_linked_at
                        ? new Date(selectedWorker.linkedin_linked_at).toLocaleString()
                        : "not yet"}
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="card-soft stack" style={{ gap: 8 }}>
                      <div className="section-title" style={{ fontSize: 15 }}>
                        Worker spending
                      </div>
                      <div className="muted">
                        Total spent combines subscription payments and paid artifacts.
                      </div>
                      <div className="admin-metric-value" style={{ fontSize: 30 }}>
                        {formatEur(selectedWorker.total_spent_eur)}
                      </div>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">
                          subscriptions: {formatEur(selectedWorker.subscription_total_paid_eur)}
                        </span>
                        <span className="badge">
                          artifacts: {formatEur(selectedWorker.artifacts_spent_eur)}
                        </span>
                        <span className="badge">
                          paid artifacts: {selectedWorker.paid_artifacts_count ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="card-soft stack" style={{ gap: 8 }}>
                      <div className="section-title" style={{ fontSize: 15 }}>
                        Subscription status
                      </div>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <SubscriptionStatusBadge
                          status={selectedWorker.active_subscription?.status}
                        />
                        <span className="badge">
                          cycle:{" "}
                          {normalizeDisplayLabel(selectedWorker.active_subscription?.billing_cycle)}
                        </span>
                      </div>
                      <SubscriptionPackPriceHint
                        pack={selectedWorker.subscription_pack}
                        subscription={selectedWorker.active_subscription}
                      />
                    </div>
                  </div>

                  <div className="card-soft stack" style={{ gap: 8 }}>
                    <div className="section-title" style={{ fontSize: 15 }}>
                      Worker context
                    </div>
                    <div className="grid grid-2">
                      <div className="muted">Business ID: {selectedWorker.business_id || "—"}</div>
                      <div className="muted">Role: {selectedWorker.current_role || "—"}</div>
                      <div className="muted">Industry: {selectedWorker.industry || "—"}</div>
                      <div className="muted">Language: {selectedWorker.language}</div>
                      <div className="muted">
                        Organization: {selectedWorker.organization_id || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="stack">
                    <label className="stack">
                      <strong>Business ID</strong>
                      <input
                        className="input"
                        value={workerForm.business_id || selectedWorker.business_id || ""}
                        disabled
                        placeholder="Generated automatically"
                        style={{
                          cursor: "not-allowed",
                          background: "rgba(15,23,42,0.04)",
                        }}
                      />
                      <div className="muted">
                        System-generated identifier. It follows the WK-xxxxxxxx convention and
                        cannot be edited from the backoffice.
                      </div>
                    </label>

                    <label className="stack">
                      <strong>Location</strong>
                      <input
                        className="input"
                        value={workerForm.location}
                        onChange={(e) =>
                          setWorkerForm((prev) => ({ ...prev, location: e.target.value }))
                        }
                        placeholder="Brussels, Belgium"
                      />
                    </label>

                    <label className="stack">
                      <strong>Phone number</strong>
                      <input
                        className="input"
                        value={workerForm.phone_number}
                        onChange={(e) =>
                          setWorkerForm((prev) => ({ ...prev, phone_number: e.target.value }))
                        }
                        placeholder="+32 ..."
                      />
                    </label>

                    <label className="stack">
                      <strong>Subscription pack</strong>
                      <select
                        className="select"
                        value={workerForm.subscription_pack}
                        onChange={(e) =>
                          setWorkerForm((prev) => ({
                            ...prev,
                            subscription_pack: e.target.value as SubscriptionPack,
                          }))
                        }
                      >
                        <option value="standard">standard — 0€ / month</option>
                        <option value="classique">classique — 89,90€ / month</option>
                        <option value="flix">flix — 290,90€ / month</option>
                        <option value="executif">executif — contact sales</option>
                      </select>

                      <SubscriptionPackPriceHint
                        pack={workerForm.subscription_pack}
                        subscription={selectedWorker.active_subscription}
                      />
                    </label>

                    <label className="stack">
                      <strong>Profession</strong>
                      <input
                        className="input"
                        value={workerForm.profession}
                        onChange={(e) =>
                          setWorkerForm((prev) => ({ ...prev, profession: e.target.value }))
                        }
                        placeholder="Enterprise Architect"
                      />
                    </label>

                    <div className="row" style={{ flexWrap: "wrap" }}>
                      <button
                        className="button"
                        type="button"
                        onClick={() => void handleSaveWorker()}
                        disabled={workersSaving}
                      >
                        {workersSaving ? "Saving..." : "Save worker"}
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => {
                          setViewMode("conversations");
                          setConversationWorkerFilter(String(selectedWorker.id));
                          setConversationForm((prev) => ({
                            ...prev,
                            worker_id: String(selectedWorker.id),
                          }));
                        }}
                      >
                        Add / view conversations
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => {
                          setViewMode("engagements");
                          setEngagementSelectionWorkerId(String(selectedWorker.id));
                          resetEngagementCanvas();
                        }}
                      >
                        Open engagements
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => {
                          setViewMode("purpose");
                          setPurposeSelectionWorkerId(String(selectedWorker.id));
                          resetPurposeCanvas();
                        }}
                      >
                        Open purpose
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => {
                          setViewMode("time");
                          setTimeSelectionWorkerId(String(selectedWorker.id));
                          resetTimeCanvas();
                        }}
                      >
                        Open time
                      </button>

                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => {
                          setViewMode("significance");
                          setSignificanceSelectionWorkerId(String(selectedWorker.id));
                          resetSignificanceCanvas();
                        }}
                      >
                        Open significance
                      </button>

                      <button className="button ghost" type="button" onClick={resetWorkerForm}>
                        Clear selection
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {viewMode === "conversations" ? (
        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card stack">
            <div className="section-title">Conversations</div>

            <label className="stack">
              <strong>Filter by worker</strong>
              <select
                className="select"
                value={conversationWorkerFilter}
                onChange={(e) => setConversationWorkerFilter(e.target.value)}
              >
                <option value="all">All workers</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    #{worker.id} — {worker.display_name}
                  </option>
                ))}
              </select>
            </label>

            {conversationsLoading ? (
              <div>Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="muted">No conversation found.</div>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                {filteredConversations.map((item) => {
                  const worker = workersById.get(item.worker_id);

                  return (
                    <div key={item.id} className="card-soft stack" style={{ gap: 8 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{item.id}</span>
                        <span className="badge">{item.source_type}</span>
                        <span className="badge">worker #{item.worker_id}</span>
                      </div>

                      <div className="section-title" style={{ fontSize: 16 }}>
                        {item.title}
                      </div>

                      <div className="muted">{worker?.display_name || "Unknown worker"}</div>

                      {item.source_label ? (
                        <div className="muted">Source: {item.source_label}</div>
                      ) : null}

                      {item.conversation_date ? (
                        <div className="muted">
                          Date: {new Date(item.conversation_date).toLocaleString()}
                        </div>
                      ) : null}

                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <button
                          className="button ghost"
                          type="button"
                          onClick={() => fillConversationForm(item)}
                        >
                          Edit
                        </button>

                        {worker ? (
                          <button
                            className="button ghost"
                            type="button"
                            onClick={() => openWorkerContext(worker)}
                          >
                            Use worker context
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card stack">
            <div className="section-title">
              {editingConversationId
                ? `Edit conversation #${editingConversationId}`
                : "Add conversation"}
            </div>

            <form className="stack" onSubmit={handleSaveConversation}>
              <label className="stack">
                <strong>Worker</strong>
                <select
                  className="select"
                  value={conversationForm.worker_id}
                  onChange={(e) =>
                    setConversationForm((prev) => ({ ...prev, worker_id: e.target.value }))
                  }
                  required
                >
                  <option value="">Select worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      #{worker.id} — {worker.display_name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="stack">
                <strong>Title</strong>
                <input
                  className="input"
                  value={conversationForm.title}
                  onChange={(e) =>
                    setConversationForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="External coaching conversation"
                  required
                />
              </label>

              <div className="grid grid-2">
                <label className="stack">
                  <strong>Source type</strong>
                  <select
                    className="select"
                    value={conversationForm.source_type}
                    onChange={(e) =>
                      setConversationForm((prev) => ({
                        ...prev,
                        source_type: e.target.value as "url" | "upload",
                      }))
                    }
                  >
                    <option value="url">URL</option>
                    <option value="upload">Upload</option>
                  </select>
                </label>

                <label className="stack">
                  <strong>Conversation date</strong>
                  <input
                    className="input"
                    type="datetime-local"
                    value={conversationForm.conversation_date}
                    onChange={(e) =>
                      setConversationForm((prev) => ({
                        ...prev,
                        conversation_date: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className="stack">
                <strong>Source label</strong>
                <input
                  className="input"
                  value={conversationForm.source_label}
                  onChange={(e) =>
                    setConversationForm((prev) => ({
                      ...prev,
                      source_label: e.target.value,
                    }))
                  }
                  placeholder="Zoom, Teams, YouTube, Upload..."
                />
              </label>

              {conversationForm.source_type === "url" ? (
                <label className="stack">
                  <strong>Video URL</strong>
                  <input
                    className="input"
                    value={conversationForm.video_url}
                    onChange={(e) =>
                      setConversationForm((prev) => ({
                        ...prev,
                        video_url: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </label>
              ) : (
                <label className="stack">
                  <strong>File path</strong>
                  <input
                    className="input"
                    value={conversationForm.file_path}
                    onChange={(e) =>
                      setConversationForm((prev) => ({
                        ...prev,
                        file_path: e.target.value,
                      }))
                    }
                    placeholder="/uploads/..."
                  />
                </label>
              )}

              <label className="stack">
                <strong>Transcript</strong>
                <textarea
                  className="textarea"
                  rows={8}
                  value={conversationForm.transcript}
                  onChange={(e) =>
                    setConversationForm((prev) => ({
                      ...prev,
                      transcript: e.target.value,
                    }))
                  }
                  placeholder="Paste transcript..."
                />
              </label>

              <label className="stack">
                <strong>Notes</strong>
                <textarea
                  className="textarea"
                  rows={5}
                  value={conversationForm.notes}
                  onChange={(e) =>
                    setConversationForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Internal notes..."
                />
              </label>

              <div className="row" style={{ flexWrap: "wrap" }}>
                <button className="button" type="submit" disabled={conversationSaving}>
                  {conversationSaving
                    ? "Saving..."
                    : editingConversationId
                      ? "Save conversation"
                      : "Create conversation"}
                </button>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => resetConversationForm(true)}
                  disabled={conversationSaving}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {viewMode === "engagements" ? (
        <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Engagement Canvas</div>
            <div className="muted">
              Capture current and future engagement signals for the worker. Future state can be
              finalized to become a stronger coaching anchor.
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 12 }}>
            <div className="grid grid-3" style={{ alignItems: "end" }}>
              <label className="stack">
                <strong>Worker</strong>
                <select
                  className="select"
                  value={engagementSelectionWorkerId}
                  onChange={(e) => {
                    setEngagementSelectionWorkerId(e.target.value);
                    resetEngagementCanvas();
                  }}
                >
                  <option value="">Select a worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      #{worker.id} — {worker.display_name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="stack">
                <strong>State</strong>
                <select
                  className="select"
                  value={engagementSelectionState}
                  onChange={(e) => {
                    setEngagementSelectionState(e.target.value as AdminWorkerEngagementState);
                    resetEngagementCanvas();
                  }}
                >
                  <option value="current">Current state</option>
                  <option value="future">Future state</option>
                </select>
              </label>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <button
                  className="button"
                  type="button"
                  onClick={() => void handleLoadEngagementCanvas()}
                  disabled={!engagementSelectionWorkerId || engagementsLoading}
                >
                  {engagementsLoading ? "Loading..." : "Load canvas"}
                </button>

                {engagementCanvasLoaded ? (
                  <button className="button ghost" type="button" onClick={resetEngagementCanvas}>
                    Clear canvas
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {!engagementCanvasLoaded ? (
            <div className="card-soft">
              <div className="muted">
                No canvas displayed yet. Select the worker and state, then click{" "}
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
                  <div className="muted">
                    Worker #{engagementSelectionWorkerId} — {engagementSelectionState} state
                  </div>

                  <BusinessIdHint
                    businessId={
                      workersById.get(Number(engagementSelectionWorkerId))?.business_id
                    }
                  />

                  <SubscriptionPackPriceHint
                    pack={
                      workersById.get(Number(engagementSelectionWorkerId))?.subscription_pack
                    }
                    subscription={
                      workersById.get(Number(engagementSelectionWorkerId))?.active_subscription
                    }
                  />

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {editingEngagement ? (
                      <>
                        <CoherenceBadge status={editingEngagement.coherence_status} />
                        <span className="badge">
                          {editingEngagement.is_finalized ? "finalized" : "draft"}
                        </span>
                      </>
                    ) : (
                      <span className="badge">new canvas</span>
                    )}
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <SavePill state={engagementSaveState} savedAt={lastSavedAtLabel} />

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
                        ? "Finalizing..."
                        : isFutureStateLocked
                          ? "Future confirmed"
                          : "Confirm future state"}
                    </button>
                  ) : null}
                </div>
              </div>

              {isFutureStateLocked ? (
                <div className="card-soft" style={{ color: "#15803d" }}>
                  This future-state engagement is finalized and locked for editing.
                </div>
              ) : null}

              <div className="grid grid-2" style={{ alignItems: "start" }}>
                <CanvasTextBlock
                  title="Identity"
                  tone="blue"
                  minHeight={220}
                  value={engagementForm.identity_text}
                  onChange={(value) => patchEngagementField("identity_text", value)}
                  disabled={isFutureStateLocked}
                  placeholder="Who is this worker professionally?"
                />

                <CanvasTextBlock
                  title="Purpose"
                  tone="purple"
                  minHeight={220}
                  value={engagementForm.purpose_text}
                  onChange={(value) => patchEngagementField("purpose_text", value)}
                  disabled={isFutureStateLocked}
                  placeholder="What purpose is visible in their work?"
                />

                <CanvasTextBlock
                  title="Missions"
                  tone="teal"
                  minHeight={220}
                  value={engagementForm.missions_text}
                  onChange={(value) => patchEngagementField("missions_text", value)}
                  disabled={isFutureStateLocked}
                  placeholder="What missions or responsibilities matter?"
                />

                <CanvasTextBlock
                  title="Ambitions"
                  tone="orange"
                  minHeight={220}
                  value={engagementForm.ambitions_text}
                  onChange={(value) => patchEngagementField("ambitions_text", value)}
                  disabled={isFutureStateLocked}
                  placeholder="What ambitions are emerging?"
                />
              </div>

              <div className="grid grid-2" style={{ alignItems: "start" }}>
                <CanvasIntentBlock
                  title="Career intent"
                  tone="indigo"
                  disabled={isFutureStateLocked}
                  items={[
                    {
                      label: "Compensation",
                      value: engagementForm.career_intent_compensation,
                      onChange: (value) =>
                        patchEngagementField("career_intent_compensation", value),
                    },
                    {
                      label: "Role",
                      value: engagementForm.career_intent_role,
                      onChange: (value) => patchEngagementField("career_intent_role", value),
                    },
                    {
                      label: "Passion criteria",
                      value: engagementForm.career_intent_passion_criteria,
                      onChange: (value) =>
                        patchEngagementField("career_intent_passion_criteria", value),
                    },
                    {
                      label: "Collaboration profile",
                      value: engagementForm.career_intent_collaboration_profile,
                      onChange: (value) =>
                        patchEngagementField("career_intent_collaboration_profile", value),
                    },
                    {
                      label: "Performance level",
                      value: engagementForm.career_intent_performance_level,
                      onChange: (value) =>
                        patchEngagementField("career_intent_performance_level", value),
                    },
                    {
                      label: "Responsibilities",
                      value: engagementForm.career_intent_responsibilities,
                      onChange: (value) =>
                        patchEngagementField("career_intent_responsibilities", value),
                    },
                  ]}
                />

                <CanvasIntentBlock
                  title="Talent intent"
                  tone="green"
                  disabled={isFutureStateLocked}
                  items={[
                    {
                      label: "Foundations",
                      value: engagementForm.talent_intent_foundations,
                      onChange: (value) =>
                        patchEngagementField("talent_intent_foundations", value),
                    },
                    {
                      label: "Personality",
                      value: engagementForm.talent_intent_personality,
                      onChange: (value) =>
                        patchEngagementField("talent_intent_personality", value),
                    },
                    {
                      label: "Watch",
                      value: engagementForm.talent_intent_watch,
                      onChange: (value) => patchEngagementField("talent_intent_watch", value),
                    },
                    {
                      label: "Next level",
                      value: engagementForm.talent_intent_next_level,
                      onChange: (value) =>
                        patchEngagementField("talent_intent_next_level", value),
                    },
                    {
                      label: "Impact niches",
                      value: engagementForm.talent_intent_impact_niches,
                      onChange: (value) =>
                        patchEngagementField("talent_intent_impact_niches", value),
                    },
                    {
                      label: "Social contributions",
                      value: engagementForm.talent_intent_social_contributions,
                      onChange: (value) =>
                        patchEngagementField("talent_intent_social_contributions", value),
                    },
                  ]}
                />
              </div>

              <div className="grid grid-3" style={{ alignItems: "start" }}>
                <CanvasTextBlock
                  title="Vision"
                  tone="cyan"
                  minHeight={180}
                  value={engagementForm.vision_text}
                  onChange={(value) => patchEngagementField("vision_text", value)}
                  disabled={isFutureStateLocked}
                  placeholder="What vision should guide the worker?"
                />

                <CanvasTextBlock
                  title="Actions"
                  tone="amber"
                  minHeight={180}
                  value={engagementForm.actions_text}
                  onChange={(value) => patchEngagementField("actions_text", value)}
                  disabled={isFutureStateLocked}
                  placeholder="What actions should be carried?"
                />

                <CanvasTextBlock
                  title="Objectives"
                  tone="rose"
                  minHeight={180}
                  value={engagementForm.objectives_text}
                  onChange={(value) => patchEngagementField("objectives_text", value)}
                  disabled={isFutureStateLocked}
                  placeholder="What objectives should be targeted?"
                />
              </div>
            </>
          )}
        </div>
      ) : null}

      {viewMode === "purpose" ? (
        <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Purpose Canvas</div>
            <div className="muted">
              Capture six purpose signals and let the app compute simple coherence relations.
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 12 }}>
            <div className="grid grid-3" style={{ alignItems: "end" }}>
              <label className="stack">
                <strong>Worker</strong>
                <select
                  className="select"
                  value={purposeSelectionWorkerId}
                  onChange={(e) => {
                    setPurposeSelectionWorkerId(e.target.value);
                    resetPurposeCanvas();
                  }}
                >
                  <option value="">Select a worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      #{worker.id} — {worker.display_name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="stack">
                <strong>Canvas rule</strong>
                <div className="muted">
                  Auto-save is enabled after the canvas is loaded. Relations are recomputed locally.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <button
                  className="button"
                  type="button"
                  onClick={() => void handleLoadPurposeCanvas()}
                  disabled={!purposeSelectionWorkerId || purposeLoading}
                >
                  {purposeLoading ? "Loading..." : "Load canvas"}
                </button>

                {purposeCanvasLoaded ? (
                  <button className="button ghost" type="button" onClick={resetPurposeCanvas}>
                    Clear canvas
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {!purposeCanvasLoaded ? (
            <div className="card-soft">
              <div className="muted">
                No canvas displayed yet. Select the worker, then click{" "}
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
                  <div className="muted">Worker #{purposeSelectionWorkerId}</div>

                  <BusinessIdHint
                    businessId={workersById.get(Number(purposeSelectionWorkerId))?.business_id}
                  />

                  <SubscriptionPackPriceHint
                    pack={workersById.get(Number(purposeSelectionWorkerId))?.subscription_pack}
                    subscription={
                      workersById.get(Number(purposeSelectionWorkerId))?.active_subscription
                    }
                  />

                  <div className="muted">
                    {editingPurposeCanvas
                      ? "Existing purpose canvas loaded."
                      : "No existing purpose canvas found. You are creating a new one."}
                  </div>

                  {editingPurposeCanvas?.coherence_summary ? (
                    <div className="muted">{editingPurposeCanvas.coherence_summary}</div>
                  ) : null}

                  {editingPurposeCanvas?.coherence_status ? (
                    <CoherenceBadge status={editingPurposeCanvas.coherence_status} />
                  ) : null}
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <SavePill state={purposeSaveState} savedAt={purposeLastSavedAtLabel} />

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
      ) : null}

      {viewMode === "time" ? (
        <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Time Canvas</div>
            <div className="muted">
              Capture the worker’s real time availability, constraints, energy windows, focus
              blocks, recovery needs, and planning rituals. This context is transmitted to the
              Coach LLM through memory.
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 12 }}>
            <div className="grid grid-3" style={{ alignItems: "end" }}>
              <label className="stack">
                <strong>Worker</strong>
                <select
                  className="select"
                  value={timeSelectionWorkerId}
                  onChange={(e) => {
                    setTimeSelectionWorkerId(e.target.value);
                    resetTimeCanvas();
                  }}
                >
                  <option value="">Select a worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      #{worker.id} — {worker.display_name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="stack">
                <strong>Canvas rule</strong>
                <div className="muted">
                  Auto-save is enabled after the canvas is loaded. Readiness is computed from filled
                  blocks.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <button
                  className="button"
                  type="button"
                  onClick={() => void handleLoadTimeCanvas()}
                  disabled={!timeSelectionWorkerId || timeLoading}
                >
                  {timeLoading ? "Loading..." : "Load canvas"}
                </button>

                {timeCanvasLoaded ? (
                  <button className="button ghost" type="button" onClick={resetTimeCanvas}>
                    Clear canvas
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {!timeCanvasLoaded ? (
            <div className="card-soft">
              <div className="muted">
                No canvas displayed yet. Select the worker, then click{" "}
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
                  <div className="muted">Worker #{timeSelectionWorkerId}</div>

                  <BusinessIdHint
                    businessId={workersById.get(Number(timeSelectionWorkerId))?.business_id}
                  />

                  <SubscriptionPackPriceHint
                    pack={workersById.get(Number(timeSelectionWorkerId))?.subscription_pack}
                    subscription={
                      workersById.get(Number(timeSelectionWorkerId))?.active_subscription
                    }
                  />

                  <div className="muted">
                    {editingTimeCanvas
                      ? "Existing time canvas loaded."
                      : "No existing time canvas found. You are creating a new one."}
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">readiness: {timeReadinessScore}%</span>
                    <CoherenceBadge status={timeReadinessStatus} />
                  </div>

                  {timeSummary ? <div className="muted">{timeSummary}</div> : null}
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <SavePill state={timeSaveState} savedAt={timeLastSavedAtLabel} />

                  <button
                    className="button"
                    type="button"
                    onClick={() => void handleSaveTimeCanvas()}
                    disabled={timeSaving}
                  >
                    {timeSaving ? "Saving..." : editingTimeCanvasId ? "Save" : "Create"}
                  </button>
                </div>
              </div>

              <TimeCanvasVisual
                form={timeForm}
                onChange={patchTimeField}
                readinessScore={timeReadinessScore}
                readinessStatus={timeReadinessStatus}
                summary={timeSummary}
              />
            </>
          )}
        </div>
      ) : null}

      {viewMode === "significance" ? (
        <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Significance Canvas</div>
            <div className="muted">
              Évalue la manière dont le worker perçoit aujourd’hui son travail à travers cinq
              dimensions : raison, métier, occupation, corvée et hobby.
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 12 }}>
            <div className="grid grid-3" style={{ alignItems: "end" }}>
              <label className="stack">
                <strong>Worker</strong>
                <select
                  className="select"
                  value={significanceSelectionWorkerId}
                  onChange={(e) => {
                    setSignificanceSelectionWorkerId(e.target.value);
                    resetSignificanceCanvas();
                  }}
                >
                  <option value="">Select a worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      #{worker.id} — {worker.display_name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="stack">
                <strong>Canvas rule</strong>
                <div className="muted">
                  Chaque réponse contribue à un score déterministe. Les questions et réponses sont
                  en français.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <button
                  className="button"
                  type="button"
                  onClick={() => void handleLoadSignificanceCanvas()}
                  disabled={!significanceSelectionWorkerId || significanceLoading}
                >
                  {significanceLoading ? "Loading..." : "Load canvas"}
                </button>

                {significanceCanvasLoaded ? (
                  <button
                    className="button ghost"
                    type="button"
                    onClick={resetSignificanceCanvas}
                  >
                    Clear canvas
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {!significanceCanvasLoaded ? (
            <div className="card-soft">
              <div className="muted">
                No canvas displayed yet. Select the worker, then click{" "}
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
                  <div className="muted">Worker #{significanceSelectionWorkerId}</div>

                  <BusinessIdHint
                    businessId={
                      workersById.get(Number(significanceSelectionWorkerId))?.business_id
                    }
                  />

                  <SubscriptionPackPriceHint
                    pack={
                      workersById.get(Number(significanceSelectionWorkerId))?.subscription_pack
                    }
                    subscription={
                      workersById.get(Number(significanceSelectionWorkerId))
                        ?.active_subscription
                    }
                  />

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
      ) : null}
    </AdminShell>
  );
}