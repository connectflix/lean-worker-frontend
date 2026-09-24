import type { SupportedUiLanguage } from "@/lib/user-locales";

export type OrganizationInsightsCopy = {
  workspaceTitle: string;
  loadingWorkerSummary: string;
  selectWorker: string;
  selectedWorker: string;
  attentionTitle: string;
  openRecommendation: (count: number) => string;
  attentionCareerBlueprintMissing: string;
  attentionMandateClarification: string;
  attentionIntentionClarification: string;
  attentionExecutionPlanUnavailable: string;

  metrics: {
    sessions: string;
    sessionsHelper: string;
    externalConversations: string;
    externalConversationsHelper: string;
    recommendations: string;
    recommendationsHelper: string;
    artifacts: string;
    artifactsHelper: string;
    levers: string;
    leversHelper: string;
    blueprint: string;
    blueprintAvailable: string;
    blueprintUnavailable: string;
    blueprintHelper: string;
  };

  workerProfile: string;
  profileFields: {
    name: string;
    email: string;
    businessId: string;
    role: string;
    industry: string;
    language: string;
    subscription: string;
    subscriptionPaid: string;
    organizationShare: string;
    profession: string;
    location: string;
  };

  careerBlueprint: string;
  careerBlueprintFields: {
    identity: string;
    vision: string;
    talentFocus: string;
    careerFocus: string;
    inspirationPerson: string;
    aspirationPerson: string;
  };
  noCareerBlueprint: string;

  leversWorkspace: string;
  leversWorkspaceDescription: string;
  leversShown: (shown: number, total: number) => string;
  searchLeversPlaceholder: string;
  allCategories: string;
  sortHighlighted: string;
  sortMostUsed: string;
  sortName: string;

  collections: {
    sessions: string;
    noSessions: string;
    noSummary: string;
    recommendations: string;
    noRecommendations: string;
    markCompleted: string;
    markingCompleted: string;
    markCompletedAria: (id: number) => string;
    relatedLevers: string;
    artifacts: string;
    noArtifacts: string;
    levers: string;
    noLevers: string;
    active: string;
    inactive: string;
    used: (count: number) => string;
    highlighted: string;
    defaultLabel: string;
    provider: string;
    paid: string;
    yes: string;
    no: string;
    price: string;
    fromPrice: (value: number) => string;
    upToPrice: (value: number) => string;
    matchReasons: string;
    linkedRecommendations: string;
    recommendation: (id: number) => string;
    openLeverLink: string;
  };

  errors: {
    intentionInitializationFailed: string;
    targetHorizonValidation: string;
    movementDefinitionValidation: string;
    targetStateValidation: string;
    desiredOutcomesValidation: string;
    shortTermMissionValidation: string;
    mandateProfessionalIdentityValidation: string;
    mandateExpectedOutcomeValidation: string;
    mandateSuccessDefinitionValidation: string;
    mandateMeaningValidation: string;
    mandateConstraintsValidation: string;
    mandateCapacityValidation: string;
    recordingClarificationFailed: string;
    recommendationCompletionFailed: string;
  };

  clarification: {
    loading: string;
    suggestedClarification: string;
    recordExactAnswerPlaceholder: string;
    recording: string;
    requestedSource: string;
  };

  mandate: {
    title: string;
    description: string;
    completed: string;
    unavailable: string;
    recordSectionTitle: string;
    workerAnswer: string;
    professionalIdentity: string;
    expectedOutcome: string;
    successDefinition: string;
    meaningDriver: string;
    engagementDriver: string;
    contributionDriver: string;
    hardConstraint: string;
    nonNegotiable: string;
    timeCapacity: string;
    energyConstraint: string;
    recordAction: string;
  };

  intention: {
    title: string;
    description: string;
    initializing: string;
    initializeAction: string;
    unavailable: string;
    completed: string;
    noBlockingItem: string;
    resolutionCondition: string;
    recordSectionTitle: string;
    workerAnswer: string;
    targetHorizonMonths: string;
    movementSummary: string;
    movementSummaryPlaceholder: string;
    targetIdentity: string;
    targetIdentityPlaceholder: string;
    desiredImpact: string;
    desiredImpactPlaceholder: string;
    shortTermMission: string;
    shortTermMissionPlaceholder: string;
    recordAction: string;
    targetHorizonHelp: string;
    movementHelp: string;
    targetIdentityHelp: string;
    desiredImpactHelp: string;
    shortTermMissionHelp: string;
    evidenceAlreadyKnown: string;
    noCandidateEvidence: string;
    source: string;
    capturedBy: string;
    candidateEvidenceOnly: string;
    confirmed: string;
    notConfirmed: string;
  };
};

const COPY: Record<SupportedUiLanguage, OrganizationInsightsCopy> = {
  en: {
    workspaceTitle: "Worker performance workspace",
    loadingWorkerSummary: "Loading worker summary...",
    selectWorker: "Select a worker to view details.",
    selectedWorker: "Selected worker:",
    attentionTitle: "Needs attention",
    openRecommendation: (count) =>
      `${count} open ${count === 1 ? "recommendation" : "recommendations"}`,
    attentionCareerBlueprintMissing: "Career profile needs completion",
    attentionMandateClarification: "Professional mandate needs clarification",
    attentionIntentionClarification:
      "Professional intention needs clarification",
    attentionExecutionPlanUnavailable: "Execution plan unavailable",

    metrics: {
      sessions: "Sessions",
      sessionsHelper: "AI coach sessions",
      externalConversations: "External conversations",
      externalConversationsHelper: "Manually added material",
      recommendations: "Recommendations",
      recommendationsHelper: "Generated actions",
      artifacts: "Artifacts",
      artifactsHelper: "Ebooks, audio or paid assets",
      levers: "Levers",
      leversHelper: "Matched support resources",
      blueprint: "Blueprint",
      blueprintAvailable: "Available",
      blueprintUnavailable: "Not available",
      blueprintHelper: "Career identity signal",
    },

    workerProfile: "Worker profile",
    profileFields: {
      name: "Name",
      email: "Email",
      businessId: "Business ID",
      role: "Role",
      industry: "Industry",
      language: "Language",
      subscription: "Subscription",
      subscriptionPaid: "Subscription paid",
      organizationShare: "Organization share",
      profession: "Profession",
      location: "Location",
    },

    careerBlueprint: "Career blueprint",
    careerBlueprintFields: {
      identity: "Identity",
      vision: "Vision",
      talentFocus: "Talent focus",
      careerFocus: "Career focus",
      inspirationPerson: "Inspiration person",
      aspirationPerson: "Aspiration person",
    },
    noCareerBlueprint: "No career blueprint available.",

    leversWorkspace: "Levers workspace",
    leversWorkspaceDescription:
      "Search, filter and review levers connected to the selected worker.",
    leversShown: (shown, total) => `${shown} shown / ${total} total`,
    searchLeversPlaceholder:
      "Search levers by name, category, provider, reason...",
    allCategories: "All categories",
    sortHighlighted: "Sort by highlighted / rank",
    sortMostUsed: "Sort by most used",
    sortName: "Sort by name",

    collections: {
      sessions: "Sessions",
      noSessions: "No sessions found.",
      noSummary: "No summary available.",
      recommendations: "Recommendations",
      noRecommendations: "No recommendations found.",
      markCompleted: "Mark as completed",
      markingCompleted: "Marking completed...",
      markCompletedAria: (id) =>
        `Mark recommendation ${id} as completed`,
      relatedLevers: "Related levers",
      artifacts: "Artifacts",
      noArtifacts: "No artifacts found.",
      levers: "Levers",
      noLevers: "No levers found.",
      active: "active",
      inactive: "inactive",
      used: (count) => `used ${count}x`,
      highlighted: "highlighted",
      defaultLabel: "default",
      provider: "Provider",
      paid: "Paid",
      yes: "yes",
      no: "no",
      price: "Price",
      fromPrice: (value) => `from €${value}`,
      upToPrice: (value) => `up to €${value}`,
      matchReasons: "Match reasons",
      linkedRecommendations: "Linked recommendations",
      recommendation: (id) => `Recommendation #${id}`,
      openLeverLink: "Open lever link",
    },

    errors: {
      intentionInitializationFailed:
        "Professional Intention initialization failed. Please try again.",
      targetHorizonValidation:
        "Enter the worker's answer and a valid target horizon in months.",
      movementDefinitionValidation:
        "Enter the worker's answer and a movement summary.",
      targetStateValidation:
        "Enter the worker's answer and a target identity.",
      desiredOutcomesValidation:
        "Enter the worker's answer and a desired impact.",
      shortTermMissionValidation:
        "Enter the worker's answer and a short-term mission.",
      mandateProfessionalIdentityValidation:
        "Enter the worker's answer and professional identity.",
      mandateExpectedOutcomeValidation:
        "Enter the worker's answer and an expected outcome.",
      mandateSuccessDefinitionValidation:
        "Enter the worker's answer and a success definition.",
      mandateMeaningValidation:
        "Enter the worker's answer and at least one meaning, engagement, or contribution driver.",
      mandateConstraintsValidation:
        "Enter the worker's answer and at least one constraint or non-negotiable.",
      mandateCapacityValidation:
        "Enter the worker's answer and at least one time capacity or energy constraint.",
      recordingClarificationFailed:
        "Recording the worker clarification failed. Please try again.",
      recommendationCompletionFailed:
        "Recommendation completion failed. Please try again.",
    },

    clarification: {
      loading: "Loading...",
      suggestedClarification: "Suggested clarification",
      recordExactAnswerPlaceholder: "Record the worker's exact answer.",
      recording: "Recording...",
      requestedSource: "Requested source:",
    },

    mandate: {
      title: "Professional Mandate Completion Support",
      description:
        "Clarification support derived from canonical Professional Mandate readiness. Worker-owned professional truth remains authoritative.",
      completed:
        "Professional Mandate clarification is complete. No further clarification is currently required.",
      unavailable:
        "No Professional Mandate support is currently available for this worker.",
      recordSectionTitle: "Record mandate worker answer",
      workerAnswer: "Mandate worker answer",
      professionalIdentity: "Professional identity",
      expectedOutcome: "Expected outcome",
      successDefinition: "Success definition",
      meaningDriver: "Meaning driver",
      engagementDriver: "Engagement driver",
      contributionDriver: "Contribution driver",
      hardConstraint: "Hard constraint",
      nonNegotiable: "Non-negotiable",
      timeCapacity: "Time capacity",
      energyConstraint: "Energy constraint",
      recordAction: "Record mandate worker answer",
    },

    intention: {
      title: "Professional Intention Completion Workspace",
      description:
        "Clarification support for the Organization coach. Candidate evidence helps prepare the worker conversation without replacing worker-owned professional truth.",
      initializing: "Initializing...",
      initializeAction: "Initialize Professional Intention",
      unavailable:
        "No clarification workspace is currently available for this worker.",
      completed:
        "Professional Intention clarification is complete. No further clarification is currently required.",
      noBlockingItem:
        "No blocking clarification item is currently available.",
      resolutionCondition: "Resolution condition",
      recordSectionTitle: "Record worker answer",
      workerAnswer: "Worker answer",
      targetHorizonMonths: "Target horizon in months",
      movementSummary: "Movement summary",
      movementSummaryPlaceholder:
        "Capture the normalized professional movement.",
      targetIdentity: "Target identity",
      targetIdentityPlaceholder:
        "Capture the normalized target professional identity.",
      desiredImpact: "Desired impact",
      desiredImpactPlaceholder:
        "Capture the normalized desired professional impact.",
      shortTermMission: "Short-term mission",
      shortTermMissionPlaceholder:
        "Capture one normalized short-term mission.",
      recordAction: "Record worker answer",
      targetHorizonHelp:
        "The worker's exact answer is preserved as worker-authored truth. The horizon in months is the normalized structured value used to update the canonical Professional Intention.",
      movementHelp:
        "The worker's exact answer is preserved as worker-authored truth. The movement summary is the normalized structured value used to update the canonical Professional Intention.",
      targetIdentityHelp:
        "The worker's exact answer is preserved as worker-authored truth. The target identity is the normalized structured value used to update the canonical Professional Intention.",
      desiredImpactHelp:
        "The worker's exact answer is preserved as worker-authored truth. The desired impact is the normalized structured value used to update the canonical Professional Intention.",
      shortTermMissionHelp:
        "The worker's exact answer is preserved as worker-authored truth. The short-term mission is the normalized structured value used to update the canonical Professional Intention.",
      evidenceAlreadyKnown: "Evidence already known",
      noCandidateEvidence:
        "No candidate evidence is currently available for this dimension.",
      source: "source:",
      capturedBy: "captured by:",
      candidateEvidenceOnly:
        "Candidate evidence only — resolution support:",
      confirmed: "confirmed",
      notConfirmed: "not confirmed",
    },
  },

  fr: {
    workspaceTitle: "Espace de suivi du collaborateur",
    loadingWorkerSummary: "Chargement du résumé du collaborateur...",
    selectWorker:
      "Sélectionnez un collaborateur pour afficher ses informations.",
    selectedWorker: "Collaborateur sélectionné :",
    attentionTitle: "À surveiller",
    openRecommendation: (count) =>
      `${count} ${count === 1 ? "recommandation ouverte" : "recommandations ouvertes"}`,
    attentionCareerBlueprintMissing: "Profil de carrière à compléter",
    attentionMandateClarification: "Mandat professionnel à clarifier",
    attentionIntentionClarification:
      "Intention professionnelle à clarifier",
    attentionExecutionPlanUnavailable: "Plan d’exécution indisponible",

    metrics: {
      sessions: "Sessions",
      sessionsHelper: "Sessions avec le coach IA",
      externalConversations: "Conversations externes",
      externalConversationsHelper: "Contenus ajoutés manuellement",
      recommendations: "Recommandations",
      recommendationsHelper: "Actions générées",
      artifacts: "Ressources",
      artifactsHelper: "Ebooks, audio ou ressources payantes",
      levers: "Leviers",
      leversHelper: "Ressources de soutien correspondantes",
      blueprint: "Profil de carrière",
      blueprintAvailable: "Disponible",
      blueprintUnavailable: "Non disponible",
      blueprintHelper: "Signal d’identité professionnelle",
    },

    workerProfile: "Profil du collaborateur",
    profileFields: {
      name: "Nom",
      email: "E-mail",
      businessId: "Identifiant entreprise",
      role: "Rôle",
      industry: "Secteur",
      language: "Langue",
      subscription: "Abonnement",
      subscriptionPaid: "Abonnement payé",
      organizationShare: "Part de l’organisation",
      profession: "Profession",
      location: "Localisation",
    },

    careerBlueprint: "Profil de carrière",
    careerBlueprintFields: {
      identity: "Identité",
      vision: "Vision",
      talentFocus: "Axe talents",
      careerFocus: "Axe carrière",
      inspirationPerson: "Personne inspirante",
      aspirationPerson: "Personne de référence",
    },
    noCareerBlueprint: "Aucun profil de carrière disponible.",

    leversWorkspace: "Ressources et leviers",
    leversWorkspaceDescription:
      "Recherchez, filtrez et examinez les leviers associés au collaborateur sélectionné.",
    leversShown: (shown, total) => `${shown} affichés / ${total} au total`,
    searchLeversPlaceholder:
      "Rechercher par nom, catégorie, fournisseur ou motif...",
    allCategories: "Toutes les catégories",
    sortHighlighted: "Trier par mise en avant / rang",
    sortMostUsed: "Trier par utilisation",
    sortName: "Trier par nom",

    collections: {
      sessions: "Sessions",
      noSessions: "Aucune session trouvée.",
      noSummary: "Aucune synthèse disponible.",
      recommendations: "Recommandations",
      noRecommendations: "Aucune recommandation trouvée.",
      markCompleted: "Marquer comme terminée",
      markingCompleted: "Marquage en cours...",
      markCompletedAria: (id) =>
        `Marquer la recommandation ${id} comme terminée`,
      relatedLevers: "Leviers associés",
      artifacts: "Ressources",
      noArtifacts: "Aucune ressource trouvée.",
      levers: "Leviers",
      noLevers: "Aucun levier trouvé.",
      active: "actif",
      inactive: "inactif",
      used: (count) => `utilisé ${count}×`,
      highlighted: "mis en avant",
      defaultLabel: "par défaut",
      provider: "Fournisseur",
      paid: "Payant",
      yes: "oui",
      no: "non",
      price: "Prix",
      fromPrice: (value) => `à partir de €${value}`,
      upToPrice: (value) => `jusqu’à €${value}`,
      matchReasons: "Raisons de correspondance",
      linkedRecommendations: "Recommandations liées",
      recommendation: (id) => `Recommandation #${id}`,
      openLeverLink: "Ouvrir le lien du levier",
    },

    errors: {
      intentionInitializationFailed:
        "L’initialisation de l’intention professionnelle a échoué. Veuillez réessayer.",
      targetHorizonValidation:
        "Saisissez la réponse du collaborateur et un horizon cible valide en mois.",
      movementDefinitionValidation:
        "Saisissez la réponse du collaborateur et un résumé de l’évolution professionnelle.",
      targetStateValidation:
        "Saisissez la réponse du collaborateur et une identité professionnelle cible.",
      desiredOutcomesValidation:
        "Saisissez la réponse du collaborateur et un impact souhaité.",
      shortTermMissionValidation:
        "Saisissez la réponse du collaborateur et une mission à court terme.",
      mandateProfessionalIdentityValidation:
        "Saisissez la réponse du collaborateur et son identité professionnelle.",
      mandateExpectedOutcomeValidation:
        "Saisissez la réponse du collaborateur et un résultat attendu.",
      mandateSuccessDefinitionValidation:
        "Saisissez la réponse du collaborateur et une définition de la réussite.",
      mandateMeaningValidation:
        "Saisissez la réponse du collaborateur et au moins un facteur de sens, d’engagement ou de contribution.",
      mandateConstraintsValidation:
        "Saisissez la réponse du collaborateur et au moins une contrainte ou un élément non négociable.",
      mandateCapacityValidation:
        "Saisissez la réponse du collaborateur et au moins une contrainte de temps ou d’énergie.",
      recordingClarificationFailed:
        "L’enregistrement de la clarification du collaborateur a échoué. Veuillez réessayer.",
      recommendationCompletionFailed:
        "La complétion de la recommandation a échoué. Veuillez réessayer.",
    },

    clarification: {
      loading: "Chargement...",
      suggestedClarification: "Clarification suggérée",
      recordExactAnswerPlaceholder:
        "Saisissez la réponse exacte du collaborateur.",
      recording: "Enregistrement...",
      requestedSource: "Source demandée :",
    },

    mandate: {
      title: "Clarification du mandat professionnel",
      description:
        "Aide à la clarification fondée sur l’état de préparation du mandat professionnel de référence. Les informations professionnelles fournies par le collaborateur restent la source faisant autorité.",
      completed:
        "La clarification du mandat professionnel est terminée. Aucune clarification supplémentaire n’est requise actuellement.",
      unavailable:
        "Aucune aide à la clarification du mandat professionnel n’est actuellement disponible pour ce collaborateur.",
      recordSectionTitle: "Enregistrer la réponse du collaborateur",
      workerAnswer: "Réponse du collaborateur au mandat",
      professionalIdentity: "Identité professionnelle",
      expectedOutcome: "Résultat attendu",
      successDefinition: "Définition de la réussite",
      meaningDriver: "Facteur de sens",
      engagementDriver: "Facteur d’engagement",
      contributionDriver: "Facteur de contribution",
      hardConstraint: "Contrainte forte",
      nonNegotiable: "Non négociable",
      timeCapacity: "Capacité temporelle",
      energyConstraint: "Contrainte d’énergie",
      recordAction: "Enregistrer la réponse au mandat",
    },

    intention: {
      title: "Clarification de l’intention professionnelle",
      description:
        "Aide à la clarification pour l’organisation. Les éléments disponibles permettent de préparer l’échange avec le collaborateur sans remplacer les informations professionnelles dont il est l’auteur.",
      initializing: "Initialisation...",
      initializeAction: "Initialiser l’intention professionnelle",
      unavailable:
        "Aucun espace de clarification n’est actuellement disponible pour ce collaborateur.",
      completed:
        "La clarification de l’intention professionnelle est terminée. Aucune clarification supplémentaire n’est requise actuellement.",
      noBlockingItem:
        "Aucun élément de clarification bloquant n’est actuellement disponible.",
      resolutionCondition: "Condition de résolution",
      recordSectionTitle: "Enregistrer la réponse du collaborateur",
      workerAnswer: "Réponse du collaborateur",
      targetHorizonMonths: "Horizon cible en mois",
      movementSummary: "Résumé de l’évolution professionnelle",
      movementSummaryPlaceholder:
        "Saisissez la synthèse structurée de l’évolution professionnelle.",
      targetIdentity: "Identité professionnelle cible",
      targetIdentityPlaceholder:
        "Saisissez l’identité professionnelle cible structurée.",
      desiredImpact: "Impact souhaité",
      desiredImpactPlaceholder:
        "Saisissez l’impact professionnel souhaité sous forme structurée.",
      shortTermMission: "Mission à court terme",
      shortTermMissionPlaceholder:
        "Saisissez une mission à court terme sous forme structurée.",
      recordAction: "Enregistrer la réponse du collaborateur",
      targetHorizonHelp:
        "La réponse exacte du collaborateur est conservée comme information dont il est l’auteur. L’horizon en mois est la valeur structurée utilisée pour mettre à jour l’intention professionnelle de référence.",
      movementHelp:
        "La réponse exacte du collaborateur est conservée comme information dont il est l’auteur. Le résumé de l’évolution est la valeur structurée utilisée pour mettre à jour l’intention professionnelle de référence.",
      targetIdentityHelp:
        "La réponse exacte du collaborateur est conservée comme information dont il est l’auteur. L’identité cible est la valeur structurée utilisée pour mettre à jour l’intention professionnelle de référence.",
      desiredImpactHelp:
        "La réponse exacte du collaborateur est conservée comme information dont il est l’auteur. L’impact souhaité est la valeur structurée utilisée pour mettre à jour l’intention professionnelle de référence.",
      shortTermMissionHelp:
        "La réponse exacte du collaborateur est conservée comme information dont il est l’auteur. La mission à court terme est la valeur structurée utilisée pour mettre à jour l’intention professionnelle de référence.",
      evidenceAlreadyKnown: "Éléments déjà disponibles",
      noCandidateEvidence:
        "Aucun élément candidat n’est actuellement disponible pour cette dimension.",
      source: "source :",
      capturedBy: "saisi par :",
      candidateEvidenceOnly:
        "Élément candidat uniquement — aide à la résolution :",
      confirmed: "confirmée",
      notConfirmed: "non confirmée",
    },
  },
};

export function getOrganizationInsightsCopy(
  language: SupportedUiLanguage,
): OrganizationInsightsCopy {
  return COPY[language];
}
