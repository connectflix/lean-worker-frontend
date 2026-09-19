import type { SupportedUiLanguage } from "@/lib/user-locales";

export type OrganizationAdminCopy = {
  organizations: string;
  organizationsDescription: string;
  newOrganization: string;

  total: string;
  activePlural: string;
  inactivePlural: string;

  searchOrganizations: string;
  searchOrganizationsPlaceholder: string;
  noOrganizationsFound: string;
  noOrganizationMatchesSearch: string;

  active: string;
  inactive: string;
  selected: string;

  requiredWorkerSubscription: string;
  calendlyConfigured: string;
  calendlyMissing: string;
  contactEmailAvailable: string;
  noContactEmail: string;

  editOrganization: (id: number) => string;
  createOrganization: string;
  editorDescription: string;

  requiredPack: string;

  organizationTypeDescription: {
    agentFlix: string;
    agentPremium: string;
    agentDeReve: string;
  };

  name: string;
  namePlaceholder: string;

  businessId: string;
  generatedAutomatically: string;
  businessIdDescription: string;

  organizationType: string;
  organizationTypeOptions: {
    agentFlix: string;
    agentPremium: string;
    agentDeReve: string;
  };

  description: string;
  descriptionPlaceholder: string;

  contactEmail: string;
  contactPhone: string;

  calendlyEvent: string;
  calendlySelected: string;
  clear: string;
  openCalendlyPage: string;

  currentSavedEventNotFound: string;
  clearSavedValue: string;
  noCalendlySelected: string;

  searchCalendlyEvents: string;
  loadingCalendlyEvents: string;
  searchCalendlyPlaceholder: string;

  calendlyLoadError: string;
  noCalendlyEventTypes: string;
  noCalendlyMatchesSearch: string;
  moreResults: (count: number) => string;
  calendlyPurpose: string;
  noSchedulingUrl: string;

  activeOrganization: string;
  activeOrganizationDescription: string;

  saving: string;
  saveOrganization: string;
  createOrganizationAction: string;
};

const copies: Record<SupportedUiLanguage, OrganizationAdminCopy> = {
  en: {
    organizations: "Organizations",
    organizationsDescription:
      "Create, select, and configure organization workspaces.",
    newOrganization: "New organization",

    total: "Total",
    activePlural: "Active",
    inactivePlural: "Inactive",

    searchOrganizations: "Search organizations",
    searchOrganizationsPlaceholder:
      "Search by name, business ID, email, or type...",
    noOrganizationsFound: "No organizations found.",
    noOrganizationMatchesSearch:
      "No organization matches this search.",

    active: "active",
    inactive: "inactive",
    selected: "selected",

    requiredWorkerSubscription: "Required worker subscription:",
    calendlyConfigured: "Calendly configured",
    calendlyMissing: "Calendly missing",
    contactEmailAvailable: "Contact email",
    noContactEmail: "No contact email",

    editOrganization: (id) => `Edit organization #${id}`,
    createOrganization: "Create organization",
    editorDescription:
      "Configure identity, organization type, contact details, and booking integration.",

    requiredPack: "required pack:",

    organizationTypeDescription: {
      agentFlix:
        "Standard organization workspace for workers on the Classique subscription pack.",
      agentPremium:
        "Premium organization workspace for workers on the Flix subscription pack.",
      agentDeReve:
        "Executive organization workspace for workers on the Executif subscription pack.",
    },

    name: "Name",
    namePlaceholder: "Example: Acme Coaching Partner",

    businessId: "Business ID",
    generatedAutomatically: "Generated automatically",
    businessIdDescription:
      "System-generated identifier. It follows the ORG-xxxxxx convention.",

    organizationType: "Organization type",
    organizationTypeOptions: {
      agentFlix: "agent flix — workers classique only",
      agentPremium: "agent premium — workers flix only",
      agentDeReve: "agent de rêve — workers executif only",
    },

    description: "Description",
    descriptionPlaceholder:
      "Describe the organization, operating model, partnership scope, or worker context...",

    contactEmail: "Contact email",
    contactPhone: "Contact phone",

    calendlyEvent: "Calendly event",
    calendlySelected: "Selected",
    clear: "Clear",
    openCalendlyPage: "Open Calendly scheduling page",

    currentSavedEventNotFound: "Current saved event not found",
    clearSavedValue: "Clear saved value",
    noCalendlySelected: "No Calendly event selected yet.",

    searchCalendlyEvents: "Search Calendly events",
    loadingCalendlyEvents: "Loading Calendly events...",
    searchCalendlyPlaceholder:
      "Search by name, slug, duration or URL...",

    calendlyLoadError: "Calendly events could not be loaded:",
    noCalendlyEventTypes:
      "No Calendly event type was found. Check your Calendly API token and scope.",
    noCalendlyMatchesSearch:
      "No Calendly event matches this search.",
    moreResults: (count) =>
      `${count} more result(s). Refine your search to narrow the list.`,
    calendlyPurpose:
      "Dedicated Calendly event type used to restrict this organization to its own bookings.",
    noSchedulingUrl: "No scheduling URL",

    activeOrganization: "Active organization",
    activeOrganizationDescription:
      "Inactive organizations remain saved but should not be used for active worker assignment or bookings.",

    saving: "Saving...",
    saveOrganization: "Save organization",
    createOrganizationAction: "Create organization",
  },

  fr: {
    organizations: "Organisations",
    organizationsDescription:
      "Créez, sélectionnez et configurez les espaces de travail des organisations.",
    newOrganization: "Nouvelle organisation",

    total: "Total",
    activePlural: "Actives",
    inactivePlural: "Inactives",

    searchOrganizations: "Rechercher des organisations",
    searchOrganizationsPlaceholder:
      "Rechercher par nom, identifiant entreprise, e-mail ou type...",
    noOrganizationsFound: "Aucune organisation trouvée.",
    noOrganizationMatchesSearch:
      "Aucune organisation ne correspond à cette recherche.",

    active: "active",
    inactive: "inactive",
    selected: "sélectionnée",

    requiredWorkerSubscription: "Abonnement collaborateur requis :",
    calendlyConfigured: "Calendly configuré",
    calendlyMissing: "Calendly non configuré",
    contactEmailAvailable: "E-mail de contact",
    noContactEmail: "Aucun e-mail de contact",

    editOrganization: (id) => `Modifier l’organisation #${id}`,
    createOrganization: "Créer une organisation",
    editorDescription:
      "Configurez l’identité, le type d’organisation, les coordonnées et l’intégration de réservation.",

    requiredPack: "forfait requis :",

    organizationTypeDescription: {
      agentFlix:
        "Espace de travail standard pour les collaborateurs disposant du forfait Classique.",
      agentPremium:
        "Espace de travail Premium pour les collaborateurs disposant du forfait Flix.",
      agentDeReve:
        "Espace de travail Executive pour les collaborateurs disposant du forfait Executif.",
    },

    name: "Nom",
    namePlaceholder: "Exemple : Acme Coaching Partner",

    businessId: "Identifiant entreprise",
    generatedAutomatically: "Généré automatiquement",
    businessIdDescription:
      "Identifiant généré par le système selon la convention ORG-xxxxxx.",

    organizationType: "Type d’organisation",
    organizationTypeOptions: {
      agentFlix: "agent flix — collaborateurs classique uniquement",
      agentPremium: "agent premium — collaborateurs flix uniquement",
      agentDeReve: "agent de rêve — collaborateurs executif uniquement",
    },

    description: "Description",
    descriptionPlaceholder:
      "Décrivez l’organisation, son modèle opérationnel, le périmètre du partenariat ou le contexte collaborateur...",

    contactEmail: "E-mail de contact",
    contactPhone: "Téléphone de contact",

    calendlyEvent: "Événement Calendly",
    calendlySelected: "Sélectionné",
    clear: "Effacer",
    openCalendlyPage: "Ouvrir la page de réservation Calendly",

    currentSavedEventNotFound:
      "L’événement actuellement enregistré est introuvable",
    clearSavedValue: "Effacer la valeur enregistrée",
    noCalendlySelected:
      "Aucun événement Calendly sélectionné pour le moment.",

    searchCalendlyEvents: "Rechercher des événements Calendly",
    loadingCalendlyEvents: "Chargement des événements Calendly...",
    searchCalendlyPlaceholder:
      "Rechercher par nom, slug, durée ou URL...",

    calendlyLoadError:
      "Les événements Calendly n’ont pas pu être chargés :",
    noCalendlyEventTypes:
      "Aucun type d’événement Calendly n’a été trouvé. Vérifiez le jeton API Calendly et ses autorisations.",
    noCalendlyMatchesSearch:
      "Aucun événement Calendly ne correspond à cette recherche.",
    moreResults: (count) =>
      `${count} résultat(s) supplémentaire(s). Affinez la recherche pour réduire la liste.`,
    calendlyPurpose:
      "Type d’événement Calendly dédié permettant de limiter cette organisation à ses propres réservations.",
    noSchedulingUrl: "Aucune URL de réservation",

    activeOrganization: "Organisation active",
    activeOrganizationDescription:
      "Les organisations inactives restent enregistrées mais ne doivent pas être utilisées pour l’affectation active de collaborateurs ou les réservations.",

    saving: "Enregistrement...",
    saveOrganization: "Enregistrer l’organisation",
    createOrganizationAction: "Créer l’organisation",
  },
};

export function getOrganizationAdminCopy(
  language: SupportedUiLanguage,
): OrganizationAdminCopy {
  return copies[language];
}
