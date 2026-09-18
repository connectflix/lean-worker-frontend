import type { SupportedUiLanguage } from "@/lib/user-locales";

export type OrganizationWorkspaceTabKey =
  | "overview"
  | "organizations"
  | "workers"
  | "revenue"
  | "canvases"
  | "conversations"
  | "insights"
  | "access";

export type OrganizationWorkspaceTabCopy = {
  key: OrganizationWorkspaceTabKey;
  label: string;
  shortLabel: string;
  description: string;
  adminOnly?: boolean;
  requiresWorker?: boolean;
};

export type OrganizationWorkspaceCopy = {
  navigationLabel: string;
  fallbackDescription: string;
  selectWorkerSuffix: string;
  lockedWorkerTabs: (count: number) => string;
  workerContextActive: string;
  tabs: OrganizationWorkspaceTabCopy[];
};

const COPY: Record<SupportedUiLanguage, OrganizationWorkspaceCopy> = {
  en: {
    navigationLabel: "Organization workspace navigation",
    fallbackDescription: "Organization workspace navigation.",
    selectWorkerSuffix: "Select a worker first.",
    lockedWorkerTabs: (count) =>
      `Select a worker to unlock ${count} workspace ${count === 1 ? "area" : "areas"}`,
    workerContextActive: "Worker context active",
    tabs: [
      {
        key: "overview",
        label: "Overview",
        shortLabel: "Overview",
        description: "Executive summary of the selected organization.",
      },
      {
        key: "organizations",
        label: "Organizations",
        shortLabel: "Orgs",
        description: "Create, edit, and configure organizations.",
        adminOnly: true,
      },
      {
        key: "workers",
        label: "Workers",
        shortLabel: "Workers",
        description: "Manage assigned workers.",
      },
      {
        key: "revenue",
        label: "Revenue",
        shortLabel: "Revenue",
        description: "Track subscription revenue and organization share.",
      },
      {
        key: "canvases",
        label: "Canvases",
        shortLabel: "Canvases",
        description:
          "Work on engagement, purpose, time, and significance canvases.",
        requiresWorker: true,
      },
      {
        key: "conversations",
        label: "Conversations",
        shortLabel: "Convos",
        description:
          "Review coach sessions and manage external worker conversations.",
        requiresWorker: true,
      },
      {
        key: "insights",
        label: "Worker Insights",
        shortLabel: "Insights",
        description:
          "Review worker profile, sessions, recommendations, artifacts, and levers.",
        requiresWorker: true,
      },
      {
        key: "access",
        label: "Access",
        shortLabel: "Access",
        description: "Create or reset organization access account.",
        adminOnly: true,
      },
    ],
  },

  fr: {
    navigationLabel: "Navigation de l’espace organisation",
    fallbackDescription: "Navigation de l’espace organisation.",
    selectWorkerSuffix: "Sélectionnez d’abord un collaborateur.",
    lockedWorkerTabs: (count) =>
      `Sélectionnez un collaborateur pour déverrouiller ${count} ${
        count === 1 ? "espace" : "espaces"
      }`,
    workerContextActive: "Contexte collaborateur actif",
    tabs: [
      {
        key: "overview",
        label: "Vue d’ensemble",
        shortLabel: "Vue d’ensemble",
        description: "Synthèse exécutive de l’organisation sélectionnée.",
      },
      {
        key: "organizations",
        label: "Organisations",
        shortLabel: "Orgas",
        description: "Créer, modifier et configurer les organisations.",
        adminOnly: true,
      },
      {
        key: "workers",
        label: "Collaborateurs",
        shortLabel: "Collaborateurs",
        description: "Gérer les collaborateurs assignés.",
      },
      {
        key: "revenue",
        label: "Revenus",
        shortLabel: "Revenus",
        description:
          "Suivre les revenus d’abonnement et la part de l’organisation.",
      },
      {
        key: "canvases",
        label: "Canevas",
        shortLabel: "Canevas",
        description:
          "Travailler sur les canevas d’engagement, de raison d’être, de temps et de contribution.",
        requiresWorker: true,
      },
      {
        key: "conversations",
        label: "Conversations",
        shortLabel: "Conversations",
        description:
          "Consulter les sessions de coaching et gérer les conversations externes du collaborateur.",
        requiresWorker: true,
      },
      {
        key: "insights",
        label: "Insights collaborateurs",
        shortLabel: "Insights",
        description:
          "Consulter le profil, les sessions, recommandations, livrables et leviers du collaborateur.",
        requiresWorker: true,
      },
      {
        key: "access",
        label: "Accès",
        shortLabel: "Accès",
        description:
          "Créer ou réinitialiser le compte d’accès de l’organisation.",
        adminOnly: true,
      },
    ],
  },
};

export function getOrganizationWorkspaceCopy(
  language: SupportedUiLanguage,
): OrganizationWorkspaceCopy {
  return COPY[language];
}
