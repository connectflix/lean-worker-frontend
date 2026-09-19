import type { SupportedUiLanguage } from "@/lib/user-locales";

export type OrganizationAccessCopy = {
  title: string;
  description: string;

  organization: string;
  organizationBadge: (id: number) => string;
  noOrganizationSelected: string;

  contactEmail: string;
  notConfigured: string;

  accessStatus: string;
  generated: string;
  readyToGenerate: string;
  emailRequired: string;

  organizationRequired: string;
  organizationRequiredDescription: string;

  loginConfiguration: string;
  loginConfigurationDescription: string;
  emailAvailable: string;
  missingEmail: string;
  loginEmail: string;
  noContactEmailConfigured: string;
  missingEmailDescription: string;

  generatingAccount: string;
  resetOrganizationAccount: string;
  createOrganizationAccount: string;
  resetsPassword: string;

  resultTitle: string;
  resultDescription: string;

  accountGenerated: string;
  shownOnce: string;

  temporaryPassword: string;
  noTemporaryPassword: string;
  show: string;
  hide: string;
  copied: string;
  copyFailed: string;
  copyPassword: string;

  secureShareWarning: string;

  noCredentialTitle: string;
  noCredentialDescription: string;

  securityNote: string;
  securityDescription: string;
};

const COPY: Record<SupportedUiLanguage, OrganizationAccessCopy> = {
  en: {
    title: "Organization access account",
    description:
      "Create or reset the organization login account. The account uses the organization contact email and generates a temporary password shown once.",

    organization: "Organization",
    organizationBadge: (id) => `organization #${id}`,
    noOrganizationSelected: "no organization selected",

    contactEmail: "Contact email",
    notConfigured: "Not configured",

    accessStatus: "Access status",
    generated: "generated",
    readyToGenerate: "ready to generate",
    emailRequired: "email required",

    organizationRequired: "Organization required",
    organizationRequiredDescription:
      "Select and save an organization before creating an access account.",

    loginConfiguration: "Login configuration",
    loginConfigurationDescription:
      "This action creates or resets the organization login account using the contact email.",
    emailAvailable: "email available",
    missingEmail: "missing email",
    loginEmail: "Login email",
    noContactEmailConfigured: "No contact email configured",
    missingEmailDescription:
      "Add a contact email in the Organization tab before creating an access account.",

    generatingAccount: "Generating account...",
    resetOrganizationAccount: "Reset organization account",
    createOrganizationAccount: "Create organization account",
    resetsPassword: "resets password",

    resultTitle: "Access result",
    resultDescription:
      "Temporary credentials are displayed here only after generation or reset.",

    accountGenerated: "Access account generated",
    shownOnce: "shown once",

    temporaryPassword: "Temporary password",
    noTemporaryPassword: "No temporary password returned.",
    show: "Show",
    hide: "Hide",
    copied: "Copied",
    copyFailed: "Copy failed",
    copyPassword: "Copy password",

    secureShareWarning:
      "Share this password securely. It will not be visible again after you leave this result.",

    noCredentialTitle: "No credential generated yet",
    noCredentialDescription:
      "Once you create or reset an organization account, the email and temporary password will appear here.",

    securityNote: "Security note",
    securityDescription:
      "Use this action only when onboarding an organization user or when the organization contact needs a password reset. The password should be sent through a secure channel.",
  },

  fr: {
    title: "Compte d’accès de l’organisation",
    description:
      "Créez ou réinitialisez le compte de connexion de l’organisation. Le compte utilise l’e-mail de contact de l’organisation et génère un mot de passe temporaire affiché une seule fois.",

    organization: "Organisation",
    organizationBadge: (id) => `organisation n°${id}`,
    noOrganizationSelected: "Aucune organisation sélectionnée",

    contactEmail: "E-mail de contact",
    notConfigured: "Non configuré",

    accessStatus: "Statut d’accès",
    generated: "généré",
    readyToGenerate: "prêt à générer",
    emailRequired: "e-mail requis",

    organizationRequired: "Organisation requise",
    organizationRequiredDescription:
      "Sélectionnez et enregistrez une organisation avant de créer un compte d’accès.",

    loginConfiguration: "Configuration de connexion",
    loginConfigurationDescription:
      "Cette action crée ou réinitialise le compte de connexion de l’organisation à partir de l’e-mail de contact.",
    emailAvailable: "e-mail disponible",
    missingEmail: "e-mail manquant",
    loginEmail: "E-mail de connexion",
    noContactEmailConfigured: "Aucun e-mail de contact configuré",
    missingEmailDescription:
      "Ajoutez un e-mail de contact dans l’onglet Organisation avant de créer un compte d’accès.",

    generatingAccount: "Génération du compte...",
    resetOrganizationAccount: "Réinitialiser le compte de l’organisation",
    createOrganizationAccount: "Créer le compte de l’organisation",
    resetsPassword: "réinitialise le mot de passe",

    resultTitle: "Résultat de l’accès",
    resultDescription:
      "Les identifiants temporaires sont affichés ici uniquement après leur génération ou leur réinitialisation.",

    accountGenerated: "Compte d’accès généré",
    shownOnce: "affiché une seule fois",

    temporaryPassword: "Mot de passe temporaire",
    noTemporaryPassword: "Aucun mot de passe temporaire n’a été retourné.",
    show: "Afficher",
    hide: "Masquer",
    copied: "Copié",
    copyFailed: "Échec de la copie",
    copyPassword: "Copier le mot de passe",

    secureShareWarning:
      "Partagez ce mot de passe de manière sécurisée. Il ne sera plus visible après avoir quitté ce résultat.",

    noCredentialTitle: "Aucun identifiant généré",
    noCredentialDescription:
      "Après la création ou la réinitialisation d’un compte d’organisation, l’e-mail et le mot de passe temporaire apparaîtront ici.",

    securityNote: "Note de sécurité",
    securityDescription:
      "Utilisez cette action uniquement lors de l’intégration d’un utilisateur de l’organisation ou lorsque le contact de l’organisation a besoin de réinitialiser son mot de passe. Le mot de passe doit être transmis par un canal sécurisé.",
  },
};

export function getOrganizationAccessCopy(
  language: SupportedUiLanguage,
): OrganizationAccessCopy {
  return COPY[language];
}
