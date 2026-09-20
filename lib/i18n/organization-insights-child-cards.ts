import type { SupportedUiLanguage } from "@/lib/user-locales";

export type OrganizationInsightsChildCardsCopy = {
  guidance: {
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    summaryUnavailable: string;
    planUnavailable: string;

    badge: string;
    workspaceTitle: string;
    workspaceDescription: string;

    mandateAvailable: string;
    mandateMissing: string;
    planMissing: string;

    item: string;
    items: string;
    principle: string;
    principles: string;
    assumption: string;
    assumptions: string;
    step: string;
    steps: string;
    recommendation: string;
    recommendations: string;

    mandateLabel: string;
    mandateSummary: string;
    mandateSummaryDescription: string;
    professionalIdentity: string;
    expectedOutcomes: string;
    successDefinition: string;
    contributionDrivers: string;

    operatingFrame: string;
    atAGlance: string;
    timeCapacity: string;
    nonNegotiables: string;
    risksToAvoid: string;

    drivers: string;
    sustainsWorker: string;
    meaningDrivers: string;
    engagementDrivers: string;
    energyConstraints: string;

    guardrails: string;
    constraints: string;
    hardConstraints: string;
    softConstraints: string;

    mandatePlan: string;
    mandatePlanDescription: string;
    planOverview: string;
    approach: string;
    objective: string;
    expectedProgress: string;
    organizationSupport: string;
    dependencies: string;
    planningAssumptions: string;

    currentSupportActions: string;
    organizationRecommendations: string;
    organizationRecommendationsDescription: string;
    recommendationNumber: (index: number) => string;
    organizationAction: string;
    example: string;
    rationale: string;
    completed: string;
    markCompletedButton: string;
    markCompleted: (title: string) => string;
    historicalExampleUnavailable: string;
  };

  executionPlan: {
    loading: string;
    emptyTitle: string;
    emptyDescription: string;

    badge: string;
    title: string;
    description: string;

    month: string;
    months: string;
    step: string;
    steps: string;

    overview: string;
    roadmap: string;
    selectStep: string;

    objective: string;
    expectedProgress: string;
    completionEvidence: string;
    dependencies: string;

    planningContext: string;
    guardrails: string;
    guardrailsDescription: string;
    planningAssumptions: string;
    planningAssumptionsDescription: string;
  };
};

const COPY: Record<
  SupportedUiLanguage,
  OrganizationInsightsChildCardsCopy
> = {
  en: {
    guidance: {
      loading: "Loading organization guidance...",
      emptyTitle: "No mandate guidance available yet.",
      emptyDescription:
        "Guidance will appear after a professional mandate has been established for this Worker.",
      summaryUnavailable: "No mandate summary available yet.",
      planUnavailable: "No mandate plan available yet.",

      badge: "Organization guidance",
      workspaceTitle: "Worker guidance workspace",
      workspaceDescription:
        "Executive view of the Worker's professional mandate, organization-side support path, and current support recommendations.",

      mandateAvailable: "Mandate available",
      mandateMissing: "Mandate missing",
      planMissing: "Plan missing",

      item: "item",
      items: "items",
      principle: "principle",
      principles: "principles",
      assumption: "assumption",
      assumptions: "assumptions",
      step: "step",
      steps: "steps",
      recommendation: "recommendation",
      recommendations: "recommendations",

      mandateLabel: "Mandate",
      mandateSummary: "Mandate summary",
      mandateSummaryDescription:
        "The Worker's current professional success frame.",
      professionalIdentity: "Professional identity",
      expectedOutcomes: "Expected outcomes",
      successDefinition: "Success definition",
      contributionDrivers: "Contribution drivers",

      operatingFrame: "Operating frame",
      atAGlance: "At a glance",
      timeCapacity: "Time capacity",
      nonNegotiables: "Non-negotiables",
      risksToAvoid: "Risks to avoid",

      drivers: "Drivers",
      sustainsWorker: "What sustains the Worker",
      meaningDrivers: "Meaning drivers",
      engagementDrivers: "Engagement drivers",
      energyConstraints: "Energy constraints",

      guardrails: "Guardrails",
      constraints: "Constraints",
      hardConstraints: "Hard constraints",
      softConstraints: "Soft constraints",

      mandatePlan: "Mandate plan",
      mandatePlanDescription:
        "Adaptive organization-side support path for helping the Worker realize the mandate.",
      planOverview: "Plan overview",
      approach: "Approach",
      objective: "Objective",
      expectedProgress: "Expected progress",
      organizationSupport: "Organization support",
      dependencies: "Dependencies",
      planningAssumptions: "Planning assumptions",

      currentSupportActions: "Current support actions",
      organizationRecommendations: "Organization recommendations",
      organizationRecommendationsDescription:
        "What the organization can do to improve the conditions for the Worker's next action.",
      recommendationNumber: (index) => `Recommendation ${index}`,
      organizationAction: "Organization action",
      example: "Example",
      rationale: "Rationale",
      completed: "Completed",
      markCompletedButton: "Mark completed",
      markCompleted: (title) => `Mark ${title} completed`,
      historicalExampleUnavailable:
        "Example not available for this historical recommendation.",
    },

    executionPlan: {
      loading: "Loading Professional Execution Plan...",
      emptyTitle: "No Professional Execution Plan available yet.",
      emptyDescription:
        "The persisted plan will appear here once Professional Mandate and Professional Intention are ready for plan generation.",

      badge: "Professional planning",
      title: "Professional Execution Plan",
      description:
        "Durable professional path derived from the current Professional Mandate and Professional Intention.",

      month: "month",
      months: "months",
      step: "step",
      steps: "steps",

      overview: "Plan overview",
      roadmap: "Roadmap",
      selectStep: "Select a step to view details",

      objective: "Objective",
      expectedProgress: "Expected progress",
      completionEvidence: "Completion evidence",
      dependencies: "Dependencies",

      planningContext: "Planning context",
      guardrails: "Guardrails",
      guardrailsDescription:
        "Constraints and boundaries that the plan must preserve.",
      planningAssumptions: "Planning assumptions",
      planningAssumptionsDescription:
        "Assumptions used where the canonical sources do not provide certainty.",
    },
  },

  fr: {
    guidance: {
      loading: "Chargement de l’accompagnement de l’organisation...",
      emptyTitle:
        "Aucun accompagnement lié au mandat disponible pour le moment.",
      emptyDescription:
        "L’accompagnement apparaîtra lorsqu’un mandat professionnel aura été établi pour ce collaborateur.",
      summaryUnavailable:
        "Aucune synthèse du mandat disponible pour le moment.",
      planUnavailable:
        "Aucun plan lié au mandat disponible pour le moment.",

      badge: "Accompagnement de l’organisation",
      workspaceTitle: "Espace d’accompagnement du collaborateur",
      workspaceDescription:
        "Vue d’ensemble du mandat professionnel du collaborateur, du parcours de soutien de l’organisation et des recommandations d’accompagnement actuelles.",

      mandateAvailable: "Mandat disponible",
      mandateMissing: "Mandat manquant",
      planMissing: "Plan manquant",

      item: "élément",
      items: "éléments",
      principle: "principe",
      principles: "principes",
      assumption: "hypothèse",
      assumptions: "hypothèses",
      step: "étape",
      steps: "étapes",
      recommendation: "recommandation",
      recommendations: "recommandations",

      mandateLabel: "Mandat",
      mandateSummary: "Synthèse du mandat",
      mandateSummaryDescription:
        "Le cadre actuel de réussite professionnelle du collaborateur.",
      professionalIdentity: "Identité professionnelle",
      expectedOutcomes: "Résultats attendus",
      successDefinition: "Définition de la réussite",
      contributionDrivers: "Facteurs de contribution",

      operatingFrame: "Cadre opérationnel",
      atAGlance: "En un coup d’œil",
      timeCapacity: "Capacité temporelle",
      nonNegotiables: "Non négociables",
      risksToAvoid: "Risques à éviter",

      drivers: "Facteurs moteurs",
      sustainsWorker: "Ce qui soutient durablement le collaborateur",
      meaningDrivers: "Facteurs de sens",
      engagementDrivers: "Facteurs d’engagement",
      energyConstraints: "Contraintes d’énergie",

      guardrails: "Garde-fous",
      constraints: "Contraintes",
      hardConstraints: "Contraintes fortes",
      softConstraints: "Contraintes souples",

      mandatePlan: "Plan du mandat",
      mandatePlanDescription:
        "Plan d’étapes adaptatif permettant d’aider le collaborateur à concrétiser son mandat.",
      planOverview: "Vue d’ensemble du plan",
      approach: "Approche",
      objective: "Objectif",
      expectedProgress: "Progression attendue",
      organizationSupport: "Soutien de l’organisation",
      dependencies: "Dépendances",
      planningAssumptions: "Hypothèses de planification",

      currentSupportActions: "Actions de soutien actuelles",
      organizationRecommendations: "Recommandations pour l’organisation",
      organizationRecommendationsDescription:
        "Ce que l’organisation peut faire pour améliorer les conditions de la prochaine action du collaborateur.",
      recommendationNumber: (index) => `Recommandation ${index}`,
      organizationAction: "Action de l’organisation",
      example: "Exemple",
      rationale: "Justification",
      completed: "Terminée",
      markCompletedButton: "Marquer comme terminée",
      markCompleted: (title) => `Marquer ${title} comme terminée`,
      historicalExampleUnavailable:
        "Exemple non disponible pour cette recommandation historique.",
    },

    executionPlan: {
      loading: "Chargement du plan d’exécution professionnelle...",
      emptyTitle:
        "Aucun plan d’exécution professionnelle disponible pour le moment.",
      emptyDescription:
        "Le plan enregistré apparaîtra ici lorsque le mandat professionnel et l’intention professionnelle permettront sa génération.",

      badge: "Planification professionnelle",
      title: "Plan d’exécution professionnelle",
      description:
        "Parcours professionnel durable dérivé du mandat professionnel et de l’intention professionnelle actuels.",

      month: "mois",
      months: "mois",
      step: "étape",
      steps: "étapes",

      overview: "Vue d’ensemble du plan",
      roadmap: "Feuille de route",
      selectStep: "Sélectionnez une étape pour afficher les détails",

      objective: "Objectif",
      expectedProgress: "Progression attendue",
      completionEvidence: "Preuves de réalisation",
      dependencies: "Dépendances",

      planningContext: "Contexte de planification",
      guardrails: "Garde-fous",
      guardrailsDescription:
        "Contraintes et limites que le plan doit préserver.",
      planningAssumptions: "Hypothèses de planification",
      planningAssumptionsDescription:
        "Hypothèses utilisées lorsque les sources de référence ne permettent pas d’établir une certitude.",
    },
  },
};

export function getOrganizationInsightsChildCardsCopy(
  language: SupportedUiLanguage,
): OrganizationInsightsChildCardsCopy {
  return COPY[language];
}
