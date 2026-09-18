import type { SupportedUiLanguage } from "@/lib/user-locales";

export type AdminDashboardCopy = {
  page: {
    eyebrow: string;
    title: string;
    description: string;
    refresh: string;
  };
  states: {
    loadingTitle: string;
    loadingDescription: string;
    errorTitle: string;
    fallbackError: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  cockpit: {
    controlCenter: string;
    noCriticalAlert: string;
    alertSingular: string;
    alertPlural: string;
    title: string;
    description: string;
    agentReports: string;
    orchestration: string;
    manageLevers: string;
    criticalTitle: string;
    latestAlert: string;
    openCriticalReports: string;
    founderAndHighRisk: (founderCount: number, criticalCount: number) => string;
    highRiskOnly: (criticalCount: number) => string;
  };
  metrics: {
    totalLevers: string;
    totalLeversHelper: string;
    activeLevers: string;
    activeLeversHelper: string;
    inactiveLevers: string;
    inactiveLeversHelper: string;
    recentRuns: string;
    recentRunsHelper: string;
    failedRuns: string;
    failedRunsHelper: string;
    criticalAlerts: string;
    criticalAlertsHelper: string;
  };
  sections: {
    categories: {
      title: string;
      description: string;
      action: string;
      empty: string;
    };
    recentLevers: {
      title: string;
      description: string;
      action: string;
      empty: string;
    };
    criticalRuns: {
      title: string;
      description: string;
      action: string;
      empty: string;
    };
    orchestration: {
      title: string;
      description: string;
      action: string;
      empty: string;
    };
  };
  status: {
    active: string;
    inactive: string;
    completed: string;
    success: string;
    partial: string;
    failed: string;
    unknown: string;
  };
  severity: {
    founder: string;
    critical: string;
    p1: string;
    alert: string;
  };
  runMeta: {
    created: string;
    confidence: string;
    escalationSingular: string;
    escalationPlural: string;
    noEscalation: string;
  };
  locale: string;
};

const COPY: Record<SupportedUiLanguage, AdminDashboardCopy> = {
  en: {
    page: {
      eyebrow: "Platform operations",
      title: "Operations overview",
      description:
        "Monitor platform readiness, operational priorities and recent activity.",
      refresh: "Refresh dashboard",
    },
    states: {
      loadingTitle: "Loading dashboard",
      loadingDescription: "Fetching the latest platform information.",
      errorTitle: "Unable to load dashboard",
      fallbackError: "Failed to load admin dashboard.",
      emptyTitle: "No admin data available",
      emptyDescription: "There is no dashboard data to display yet.",
    },
    cockpit: {
      controlCenter: "Control center",
      noCriticalAlert: "No critical alert",
      alertSingular: "alert",
      alertPlural: "alerts",
      title: "LeanWorker backoffice cockpit",
      description:
        "Monitor platform readiness, catalog coverage, recent lever activity and orchestration risks from one place. Use this page as the first operational checkpoint before drilling into reports, workers, organizations or levers.",
      agentReports: "Agent reports",
      orchestration: "Orchestration",
      manageLevers: "Manage levers",
      criticalTitle: "Founder / critical alerts detected",
      latestAlert: "Latest alert",
      openCriticalReports: "Open critical reports",
      founderAndHighRisk: (founderCount, criticalCount) =>
        `${founderCount} founder escalation(s) and ${criticalCount} high-risk run(s) need attention.`,
      highRiskOnly: (criticalCount) =>
        `${criticalCount} high-risk orchestration run(s) need attention.`,
    },
    metrics: {
      totalLevers: "Total levers",
      totalLeversHelper: "Catalog size",
      activeLevers: "Active levers",
      activeLeversHelper: "Available to recommendations",
      inactiveLevers: "Inactive levers",
      inactiveLeversHelper: "Disabled or under review",
      recentRuns: "Recent runs",
      recentRunsHelper: "Last orchestration checks",
      failedRuns: "Failed runs",
      failedRunsHelper: "In latest loaded runs",
      criticalAlerts: "Critical alerts",
      criticalAlertsHelper: "Founder / P1 / failed",
    },
    sections: {
      categories: {
        title: "Lever category breakdown",
        description: "Distribution of configured levers by category.",
        action: "Manage catalog",
        empty: "No lever categories yet.",
      },
      recentLevers: {
        title: "Recent levers",
        description: "Latest catalog items created in the platform.",
        action: "Open levers",
        empty: "No levers yet.",
      },
      criticalRuns: {
        title: "Recent founder / critical runs",
        description: "Runs requiring attention from operations or leadership.",
        action: "View reports",
        empty: "No founder or critical runs detected recently.",
      },
      orchestration: {
        title: "Recent orchestration runs",
        description: "Latest execution signals from agent orchestration.",
        action: "Open orchestration",
        empty: "No orchestration run found.",
      },
    },
    status: {
      active: "active",
      inactive: "inactive",
      completed: "completed",
      success: "success",
      partial: "partial",
      failed: "failed",
      unknown: "unknown",
    },
    severity: {
      founder: "founder",
      critical: "critical",
      p1: "p1",
      alert: "alert",
    },
    runMeta: {
      created: "Created",
      confidence: "confidence",
      escalationSingular: "escalation",
      escalationPlural: "escalations",
      noEscalation: "No escalation",
    },
    locale: "en-US",
  },
  fr: {
    page: {
      eyebrow: "Opérations plateforme",
      title: "Vue d’ensemble des opérations",
      description:
        "Suivez l’état de préparation de la plateforme, les priorités opérationnelles et l’activité récente.",
      refresh: "Actualiser le tableau de bord",
    },
    states: {
      loadingTitle: "Chargement du tableau de bord",
      loadingDescription:
        "Récupération des informations les plus récentes de la plateforme.",
      errorTitle: "Impossible de charger le tableau de bord",
      fallbackError: "Impossible de charger le tableau de bord administrateur.",
      emptyTitle: "Aucune donnée d’administration disponible",
      emptyDescription:
        "Aucune donnée du tableau de bord n’est disponible pour le moment.",
    },
    cockpit: {
      controlCenter: "Centre de contrôle",
      noCriticalAlert: "Aucune alerte critique",
      alertSingular: "alerte",
      alertPlural: "alertes",
      title: "Cockpit back-office LeanWorker",
      description:
        "Suivez l’état de préparation de la plateforme, la couverture du catalogue, l’activité récente des leviers et les risques d’orchestration depuis un seul endroit.",
      agentReports: "Rapports des agents",
      orchestration: "Orchestration",
      manageLevers: "Gérer les leviers",
      criticalTitle: "Alertes founder / critiques détectées",
      latestAlert: "Dernière alerte",
      openCriticalReports: "Ouvrir les rapports critiques",
      founderAndHighRisk: (founderCount, criticalCount) =>
        `${founderCount} escalade${founderCount > 1 ? "s" : ""} founder et ${criticalCount} exécution${criticalCount > 1 ? "s" : ""} à haut risque nécessitent une attention.`,
      highRiskOnly: (criticalCount) =>
        `${criticalCount} exécution${criticalCount > 1 ? "s" : ""} d’orchestration à haut risque nécessitent une attention.`,
    },
    metrics: {
      totalLevers: "Leviers au total",
      totalLeversHelper: "Taille du catalogue",
      activeLevers: "Leviers actifs",
      activeLeversHelper: "Disponibles pour les recommandations",
      inactiveLevers: "Leviers inactifs",
      inactiveLeversHelper: "Désactivés ou en cours de révision",
      recentRuns: "Exécutions récentes",
      recentRunsHelper: "Dernières vérifications d’orchestration",
      failedRuns: "Exécutions en échec",
      failedRunsHelper: "Dans les dernières exécutions chargées",
      criticalAlerts: "Alertes critiques",
      criticalAlertsHelper: "Founder / P1 / échec",
    },
    sections: {
      categories: {
        title: "Répartition des leviers par catégorie",
        description: "Répartition des leviers configurés par catégorie.",
        action: "Gérer le catalogue",
        empty: "Aucune catégorie de levier pour le moment.",
      },
      recentLevers: {
        title: "Leviers récents",
        description: "Derniers éléments du catalogue créés sur la plateforme.",
        action: "Ouvrir les leviers",
        empty: "Aucun levier pour le moment.",
      },
      criticalRuns: {
        title: "Exécutions founder / critiques récentes",
        description:
          "Exécutions nécessitant l’attention des opérations ou du leadership.",
        action: "Voir les rapports",
        empty: "Aucune exécution founder ou critique détectée récemment.",
      },
      orchestration: {
        title: "Exécutions d’orchestration récentes",
        description:
          "Derniers signaux d’exécution issus de l’orchestration des agents.",
        action: "Ouvrir l’orchestration",
        empty: "Aucune exécution d’orchestration trouvée.",
      },
    },
    status: {
      active: "actif",
      inactive: "inactif",
      completed: "terminé",
      success: "réussi",
      partial: "partiel",
      failed: "échec",
      unknown: "inconnu",
    },
    severity: {
      founder: "founder",
      critical: "critique",
      p1: "p1",
      alert: "alerte",
    },
    runMeta: {
      created: "Créé le",
      confidence: "confiance",
      escalationSingular: "escalade",
      escalationPlural: "escalades",
      noEscalation: "Aucune escalade",
    },
    locale: "fr-BE",
  },
};

export function getAdminDashboardCopy(
  language: SupportedUiLanguage,
): AdminDashboardCopy {
  return COPY[language];
}
