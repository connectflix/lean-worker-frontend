import type { SupportedUiLanguage } from "@/lib/user-locales";

export type AdminRole = "admin" | "organization";

export type AdminNavSection =
  | "overview"
  | "operations"
  | "catalog"
  | "enablement"
  | "account";

export type AdminShellCopy = {
  sections: Record<AdminNavSection, string>;
  nav: Record<string, { label: string; description: string }>;
  roleLabel: Record<AdminRole, string>;
  roleBadge: Record<AdminRole, string>;
  roleDescription: Record<AdminRole, string>;
  organizationFallback: string;
  collapseSidebar: string;
  expandSidebar: string;
  collapse: string;
  expand: string;
  logout: string;
  menu: string;
  close: string;
  adminNavigation: string;
  adminMobileNavigation: string;
};

const ADMIN_SHELL_COPY: Record<SupportedUiLanguage, AdminShellCopy> = {
  en: {
    sections: {
      overview: "Overview",
      operations: "Operations",
      catalog: "Catalog",
      enablement: "Enablement",
      account: "Account",
    },
    nav: {
      "/admin": {
        label: "Dashboard",
        description: "Operational overview",
      },
      "/admin/orchestration": {
        label: "Orchestration",
        description: "Agent orchestration runs",
      },
      "/admin/agent-reports": {
        label: "Agent Reports",
        description: "Support, tech, business and CX signals",
      },
      "/admin/experience-ratings": {
        label: "Experience Ratings",
        description: "Worker perceived quality ratings after key interactions",
      },
      "/admin/levers": {
        label: "Manage Levers",
        description: "Coaches, resources and offers catalog",
      },
      "/admin/workers": {
        label: "Manage Workers",
        description: "Worker directory and worker intelligence",
      },
      "/admin/organizations": {
        label: "Manage Organizations",
        description: "Organization workspace and assigned workers",
      },
      "/admin/bookings": {
        label: "Manage Bookings",
        description: "Bookings and appointments",
      },
      "/admin/payment-transactions": {
        label: "Manage Transactions",
        description: "Worker payments, Stripe sessions and transaction ledger",
      },
      "/admin/coaching-plan": {
        label: "Coaching Plan",
        description:
          "First-session coaching intention, concepts and pedagogical plan",
      },
      "/admin/coaching-flow": {
        label: "Coaching Flow",
        description: "Guided coaching execution flow",
      },
      "/admin/coaching-guide": {
        label: "Coaching Guide",
        description: "Coaching methodology and guidance",
      },
      "/admin/change-password": {
        label: "Change password",
        description: "Account security",
      },
    },
    roleLabel: {
      admin: "LeanWorker control",
      organization: "Organization workspace",
    },
    roleBadge: {
      admin: "Platform admin",
      organization: "Organization",
    },
    roleDescription: {
      admin:
        "Centralized operations, orchestration, catalog and governance workspace.",
      organization:
        "Scoped access to organization workers, conversations, bookings and coaching assets.",
    },
    organizationFallback: "Organization",
    collapseSidebar: "Collapse admin sidebar",
    expandSidebar: "Expand admin sidebar",
    collapse: "Collapse",
    expand: "Expand",
    logout: "Log out",
    menu: "Menu",
    close: "Close",
    adminNavigation: "Admin navigation",
    adminMobileNavigation: "Admin mobile navigation",
  },

  fr: {
    sections: {
      overview: "Vue d’ensemble",
      operations: "Opérations",
      catalog: "Catalogue",
      enablement: "Accompagnement",
      account: "Compte",
    },
    nav: {
      "/admin": {
        label: "Tableau de bord",
        description: "Vue d’ensemble opérationnelle",
      },
      "/admin/orchestration": {
        label: "Orchestration",
        description: "Exécutions d’orchestration des agents",
      },
      "/admin/agent-reports": {
        label: "Rapports agents",
        description: "Signaux support, technique, business et expérience client",
      },
      "/admin/experience-ratings": {
        label: "Évaluations d’expérience",
        description:
          "Qualité perçue par les collaborateurs après les interactions clés",
      },
      "/admin/levers": {
        label: "Leviers",
        description: "Catalogue des coachs, ressources et offres",
      },
      "/admin/workers": {
        label: "Collaborateurs",
        description: "Répertoire des collaborateurs et intelligence associée",
      },
      "/admin/organizations": {
        label: "Organisations",
        description: "Espace organisation et collaborateurs associés",
      },
      "/admin/bookings": {
        label: "Réservations",
        description: "Réservations et rendez-vous",
      },
      "/admin/payment-transactions": {
        label: "Transactions",
        description: "Paiements, sessions Stripe et registre des transactions",
      },
      "/admin/coaching-plan": {
        label: "Plan de coaching",
        description:
          "Intention, concepts et plan pédagogique de la première session",
      },
      "/admin/coaching-flow": {
        label: "Parcours de coaching",
        description: "Déroulement guidé du coaching",
      },
      "/admin/coaching-guide": {
        label: "Guide de coaching",
        description: "Méthodologie et accompagnement du coaching",
      },
      "/admin/change-password": {
        label: "Modifier le mot de passe",
        description: "Sécurité du compte",
      },
    },
    roleLabel: {
      admin: "Pilotage LeanWorker",
      organization: "Espace organisation",
    },
    roleBadge: {
      admin: "Administration plateforme",
      organization: "Organisation",
    },
    roleDescription: {
      admin:
        "Espace centralisé pour les opérations, l’orchestration, le catalogue et la gouvernance.",
      organization:
        "Accès limité aux collaborateurs, conversations, réservations et ressources de coaching de l’organisation.",
    },
    organizationFallback: "Organisation",
    collapseSidebar: "Réduire la barre latérale admin",
    expandSidebar: "Déployer la barre latérale admin",
    collapse: "Réduire",
    expand: "Déployer",
    logout: "Se déconnecter",
    menu: "Menu",
    close: "Fermer",
    adminNavigation: "Navigation administrateur",
    adminMobileNavigation: "Navigation administrateur mobile",
  },
};

export function getAdminShellCopy(
  language: SupportedUiLanguage,
): AdminShellCopy {
  return ADMIN_SHELL_COPY[language];
}
