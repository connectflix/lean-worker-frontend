import type { SupportedUiLanguage } from "@/lib/user-locales";

export type OrganizationOverviewCopy = {
  locale: string;
  status: {
    active: string;
    inactive: string;
    configured: string;
    notConfigured: string;
  };
  common: {
    requiredPack: (pack: string) => string;
    noDescription: string;
    selectedWorker: string;
    noWorkerSelected: string;
    assignedWorkers: string;
    paidWorkers: string;
    organizationRevenue: string;
    recommendations: string;
    workerCount: (count: number) => string;
    paidCount: (count: number) => string;
    organizationShare: (percent: number) => string;
  };
  hero: {
    grossSubscriptions: string;
    selectedWorkerSessions: string;
    assignedWorkersHelper: string;
    paidWorkersHelper: string;
    grossSubscriptionsHelper: string;
    sessionsHelper: string;
    recommendationsHelper: string;
  };
  overview: {
    title: string;
    description: string;
    fields: {
      name: string;
      businessId: string;
      type: string;
      requiredWorkerPack: string;
      contactEmail: string;
      contactPhone: string;
      calendly: string;
    };
    actions: {
      title: string;
      description: string;
      openWorkers: string;
      viewRevenue: string;
      reviewConversations: string;
      openCanvases: string;
      workerInsights: string;
    };
    snapshot: {
      title: string;
      description: string;
      assignedWorkersHelper: string;
      paidWorkersHelper: string;
      platformShare: string;
      organizationRevenueHelper: (percent: number) => string;
      platformShareHelper: string;
    };
    worker: {
      title: string;
      description: string;
      selected: string;
      none: string;
      noEmail: string;
      sessions: (count: number) => string;
      externalConversations: (count: number) => string;
      recommendations: (count: number) => string;
      artifacts: (count: number) => string;
      conversationsAction: string;
      insightsAction: string;
      canvasesAction: string;
      emptyDescription: string;
      selectAction: string;
    };
  };
};

const COPY: Record<SupportedUiLanguage, OrganizationOverviewCopy> = {
  en: {
    locale: "en-BE",
    status: {
      active: "Active",
      inactive: "Inactive",
      configured: "Configured",
      notConfigured: "Not configured",
    },
    common: {
      requiredPack: (pack) => `Required pack: ${pack}`,
      noDescription: "No organization description configured yet.",
      selectedWorker: "Selected worker",
      noWorkerSelected: "No worker selected",
      assignedWorkers: "Assigned workers",
      paidWorkers: "Paid workers",
      organizationRevenue: "Organization revenue",
      recommendations: "Recommendations",
      workerCount: (count) => `${count} ${count === 1 ? "worker" : "workers"}`,
      paidCount: (count) => `${count} paid`,
      organizationShare: (percent) => `${percent}% organization share`,
    },
    hero: {
      grossSubscriptions: "Gross subscriptions",
      selectedWorkerSessions: "Selected worker sessions",
      assignedWorkersHelper: "Workers linked to this organization",
      paidWorkersHelper: "Workers with paid subscriptions",
      grossSubscriptionsHelper: "Total subscription revenue ex-VAT",
      sessionsHelper: "AI coaching sessions",
      recommendationsHelper: "Generated recommendations",
    },
    overview: {
      title: "Organization overview",
      description:
        "Core organization configuration, access context, and operational entry points.",
      fields: {
        name: "Name",
        businessId: "Business ID",
        type: "Type",
        requiredWorkerPack: "Required worker pack",
        contactEmail: "Contact email",
        contactPhone: "Contact phone",
        calendly: "Calendly",
      },
      actions: {
        title: "Recommended next actions",
        description:
          "Use this workspace to move from organization setup to worker follow-up, conversation review, coaching canvases, and revenue monitoring.",
        openWorkers: "Open workers",
        viewRevenue: "View revenue",
        reviewConversations: "Review conversations",
        openCanvases: "Open canvases",
        workerInsights: "Worker insights",
      },
      snapshot: {
        title: "Operational snapshot",
        description:
          "A compact view of worker volume, monetization, and selected worker activity.",
        assignedWorkersHelper:
          "Workers currently linked to this organization.",
        paidWorkersHelper:
          "Workers with tracked subscription revenue.",
        platformShare: "Platform share",
        organizationRevenueHelper: (percent) =>
          `${percent}% organization share, ex-VAT.`,
        platformShareHelper: "Remaining platform revenue, ex-VAT.",
      },
      worker: {
        title: "Selected worker",
        description:
          "Current worker context used for insights, conversations, and canvases.",
        selected: "Worker selected",
        none: "No worker",
        noEmail: "No email",
        sessions: (count) => `${count} sessions`,
        externalConversations: (count) =>
          `${count} external conversations`,
        recommendations: (count) => `${count} recommendations`,
        artifacts: (count) => `${count} artifacts`,
        conversationsAction: "Conversations",
        insightsAction: "Insights",
        canvasesAction: "Canvases",
        emptyDescription:
          "No worker selected yet. Open the Workers tab and select one to unlock conversations, canvases, and worker insights.",
        selectAction: "Select a worker",
      },
    },
  },

  fr: {
    locale: "fr-BE",
    status: {
      active: "Actif",
      inactive: "Inactif",
      configured: "Configuré",
      notConfigured: "Non configuré",
    },
    common: {
      requiredPack: (pack) => `Pack requis : ${pack}`,
      noDescription:
        "Aucune description de l’organisation n’est encore configurée.",
      selectedWorker: "Collaborateur sélectionné",
      noWorkerSelected: "Aucun collaborateur sélectionné",
      assignedWorkers: "Collaborateurs assignés",
      paidWorkers: "Collaborateurs payants",
      organizationRevenue: "Revenus de l’organisation",
      recommendations: "Recommandations",
      workerCount: (count) =>
        `${count} ${count === 1 ? "collaborateur" : "collaborateurs"}`,
      paidCount: (count) => `${count} payant${count === 1 ? "" : "s"}`,
      organizationShare: (percent) =>
        `${percent}% pour l’organisation`,
    },
    hero: {
      grossSubscriptions: "Abonnements bruts",
      selectedWorkerSessions: "Sessions du collaborateur",
      assignedWorkersHelper: "Collaborateurs liés à cette organisation",
      paidWorkersHelper: "Collaborateurs avec un abonnement payé",
      grossSubscriptionsHelper: "Revenus totaux d’abonnement hors TVA",
      sessionsHelper: "Sessions de coaching IA",
      recommendationsHelper: "Recommandations générées",
    },
    overview: {
      title: "Vue d’ensemble de l’organisation",
      description:
        "Configuration principale, contexte d’accès et points d’entrée opérationnels de l’organisation.",
      fields: {
        name: "Nom",
        businessId: "Identifiant entreprise",
        type: "Type",
        requiredWorkerPack: "Pack collaborateur requis",
        contactEmail: "E-mail de contact",
        contactPhone: "Téléphone de contact",
        calendly: "Calendly",
      },
      actions: {
        title: "Prochaines actions recommandées",
        description:
          "Utilisez cet espace pour passer de la configuration de l’organisation au suivi des collaborateurs, aux conversations, aux canevas de coaching et au suivi des revenus.",
        openWorkers: "Ouvrir les collaborateurs",
        viewRevenue: "Voir les revenus",
        reviewConversations: "Consulter les conversations",
        openCanvases: "Ouvrir les canevas",
        workerInsights: "Insights collaborateurs",
      },
      snapshot: {
        title: "Aperçu opérationnel",
        description:
          "Vue synthétique des collaborateurs, de la monétisation et de l’activité du collaborateur sélectionné.",
        assignedWorkersHelper:
          "Collaborateurs actuellement liés à cette organisation.",
        paidWorkersHelper:
          "Collaborateurs avec des revenus d’abonnement suivis.",
        platformShare: "Part plateforme",
        organizationRevenueHelper: (percent) =>
          `${percent}% pour l’organisation, hors TVA.`,
        platformShareHelper:
          "Revenus restants pour la plateforme, hors TVA.",
      },
      worker: {
        title: "Collaborateur sélectionné",
        description:
          "Contexte collaborateur utilisé pour les insights, conversations et canevas.",
        selected: "Collaborateur sélectionné",
        none: "Aucun collaborateur",
        noEmail: "Aucun e-mail",
        sessions: (count) => `${count} session${count === 1 ? "" : "s"}`,
        externalConversations: (count) =>
          `${count} conversation${count === 1 ? "" : "s"} externe${count === 1 ? "" : "s"}`,
        recommendations: (count) =>
          `${count} recommandation${count === 1 ? "" : "s"}`,
        artifacts: (count) =>
          `${count} livrable${count === 1 ? "" : "s"}`,
        conversationsAction: "Conversations",
        insightsAction: "Insights",
        canvasesAction: "Canevas",
        emptyDescription:
          "Aucun collaborateur n’est encore sélectionné. Ouvrez l’onglet Collaborateurs et sélectionnez-en un pour accéder aux conversations, canevas et insights.",
        selectAction: "Sélectionner un collaborateur",
      },
    },
  },
};

export function getOrganizationOverviewCopy(
  language: SupportedUiLanguage,
): OrganizationOverviewCopy {
  return COPY[language];
}
