import type { SupportedUiLanguage } from "@/lib/user-locales";

export type OrganizationWorkersRevenueCopy = {
  locale: string;
  status: {
    active: string;
    inactive: string;
  };
  workers: {
    title: string;
    description: string;
    assignedCount: (count: number) => string;
    paidCount: (count: number) => string;
    requiredPack: (pack: string) => string;
    assignedWorkers: string;
    paidWorkers: string;
    subscriptionPaid: string;
    compatiblePack: string;
    directoryTitle: string;
    loadingAssignedWorkers: string;
    workersShown: (count: number) => string;
    selectedWorker: (id: number) => string;
    noWorkerSelected: string;
    searchLabel: string;
    searchPlaceholder: string;
    compatibilityNotice: (pack: string) => string;
    emptySearch: string;
    selected: string;
    emailAriaLabel: (name: string) => string;
    emailRequired: string;
    invalidEmail: string;
    updateEmailError: string;
    saving: string;
    saveEmail: string;
    cancel: string;
    noEmail: string;
    editEmail: string;
    paidAmount: (amount: string) => string;
    open: string;
    unassign: string;
    assignTitle: string;
    assignDescription: string;
    requiresPack: (pack: string) => string;
    compatibleAvailable: (count: number) => string;
    compatibleWorker: string;
    noCompatibleWorker: string;
    selectWorkerToAssign: string;
    assigning: string;
    assignWorker: string;
    assignFooter: string;
    subscriptionStatuses: Record<string, string>;
  };
  revenue: {
    shareRate: (percent: string) => string;
    title: string;
    description: (
      organizationPercent: string,
      platformPercent: string,
    ) => string;
    calculationRule: string;
    calculationSplit: (
      organizationPercent: string,
      platformPercent: string,
    ) => string;
    assignedWorkers: string;
    assignedWorkersHelper: string;
    paidWorkers: string;
    paidWorkersHelper: string;
    grossSubscriptions: string;
    grossSubscriptionsHelper: string;
    organizationRevenue: string;
    organizationRevenueHelper: (percent: string) => string;
    platformShare: string;
    platformShareHelper: (percent: string) => string;
    averageRevenue: string;
    averageRevenueHelper: string;
    detailsTitle: string;
    detailsDescription: string;
    workerCount: (count: number) => string;
    empty: string;
    columns: {
      worker: string;
      businessId: string;
      pack: string;
      subscriptionPaid: string;
      organizationShare: string;
      platformShare: string;
    };
    noEmail: string;
  };
};

const COPY: Record<SupportedUiLanguage, OrganizationWorkersRevenueCopy> = {
  en: {
    locale: "en-BE",
    status: {
      active: "Active",
      inactive: "Inactive",
    },
    workers: {
      title: "Assigned workers",
      description:
        "Manage the workers attached to this organization. Worker-level tabs such as conversations, canvases, and insights are unlocked after selecting a worker.",
      assignedCount: (count) => `${count} assigned`,
      paidCount: (count) => `${count} paid`,
      requiredPack: (pack) => `required pack: ${pack}`,
      assignedWorkers: "Assigned workers",
      paidWorkers: "Paid workers",
      subscriptionPaid: "Subscription paid",
      compatiblePack: "Compatible pack",
      directoryTitle: "Worker directory",
      loadingAssignedWorkers: "Loading assigned workers...",
      workersShown: (count) => `${count} worker${count === 1 ? "" : "s"} shown`,
      selectedWorker: (id) => `selected worker #${id}`,
      noWorkerSelected: "No worker selected",
      searchLabel: "Search assigned workers",
      searchPlaceholder:
        "Search by name, email, role, industry, business ID...",
      compatibilityNotice: (pack) =>
        `Standard workers cannot be assigned to any organization. This organization requires the ${pack} subscription pack.`,
      emptySearch:
        "No assigned workers found for this search or organization.",
      selected: "Selected",
      emailAriaLabel: (name) => `Email for ${name}`,
      emailRequired: "Email is required.",
      invalidEmail: "Please enter a valid email address.",
      updateEmailError: "Unable to update worker email.",
      saving: "Saving...",
      saveEmail: "Save email",
      cancel: "Cancel",
      noEmail: "No email",
      editEmail: "Edit email",
      paidAmount: (amount) => `paid ${amount}`,
      open: "Open",
      unassign: "Unassign",
      assignTitle: "Assign compatible worker",
      assignDescription:
        "Only unassigned workers with the required subscription pack can be attached here.",
      requiresPack: (pack) => `requires ${pack}`,
      compatibleAvailable: (count) =>
        `${count} compatible worker${count === 1 ? "" : "s"} available for assignment.`,
      compatibleWorker: "Compatible worker",
      noCompatibleWorker: "No compatible worker available",
      selectWorkerToAssign: "Select a worker to assign",
      assigning: "Assigning...",
      assignWorker: "Assign worker",
      assignFooter:
        "After assignment, the worker becomes available in this organization workspace for conversations, canvases, insights, bookings, and revenue tracking.",
      subscriptionStatuses: {
        active: "Active",
        past_due: "Past due",
        canceled: "Canceled",
        cancelled: "Cancelled",
        inactive: "Inactive",
      },
    },
    revenue: {
      shareRate: (percent) => `Share rate: ${percent}`,
      title: "Organization revenue dashboard",
      description: (organizationPercent, platformPercent) =>
        `Revenue is calculated from paid subscription amounts of assigned workers. The organization receives ${organizationPercent} ex-VAT and the platform keeps ${platformPercent}.`,
      calculationRule: "Calculation rule",
      calculationSplit: (organizationPercent, platformPercent) =>
        `${organizationPercent} organization / ${platformPercent} platform`,
      assignedWorkers: "Assigned workers",
      assignedWorkersHelper:
        "Workers currently linked to this organization.",
      paidWorkers: "Paid workers",
      paidWorkersHelper:
        "Assigned workers with subscription payment captured.",
      grossSubscriptions: "Gross subscriptions ex-VAT",
      grossSubscriptionsHelper:
        "Total subscription revenue before revenue sharing.",
      organizationRevenue: "Organization revenue ex-VAT",
      organizationRevenueHelper: (percent) =>
        `${percent} of gross subscription revenue.`,
      platformShare: "Platform share ex-VAT",
      platformShareHelper: (percent) =>
        `${percent} retained by LeanWorker platform.`,
      averageRevenue: "Average revenue / paid worker",
      averageRevenueHelper:
        "Organization revenue divided by paid workers.",
      detailsTitle: "Revenue details by assigned worker",
      detailsDescription:
        "Worker-level subscription contribution and calculated revenue split.",
      workerCount: (count) => `${count} worker${count === 1 ? "" : "s"}`,
      empty:
        "No assigned worker yet. Revenue is currently zero.",
      columns: {
        worker: "Worker",
        businessId: "Business ID",
        pack: "Pack",
        subscriptionPaid: "Subscription paid",
        organizationShare: "Organization share",
        platformShare: "Platform share",
      },
      noEmail: "No email",
    },
  },

  fr: {
    locale: "fr-BE",
    status: {
      active: "Actif",
      inactive: "Inactif",
    },
    workers: {
      title: "Collaborateurs assignés",
      description:
        "Gérez les collaborateurs rattachés à cette organisation. Les espaces individuels tels que les conversations, les canevas et les insights deviennent accessibles après la sélection d’un collaborateur.",
      assignedCount: (count) => `${count} assigné${count === 1 ? "" : "s"}`,
      paidCount: (count) => `${count} payant${count === 1 ? "" : "s"}`,
      requiredPack: (pack) => `pack requis : ${pack}`,
      assignedWorkers: "Collaborateurs assignés",
      paidWorkers: "Collaborateurs payants",
      subscriptionPaid: "Abonnements payés",
      compatiblePack: "Pack compatible",
      directoryTitle: "Annuaire des collaborateurs",
      loadingAssignedWorkers: "Chargement des collaborateurs assignés...",
      workersShown: (count) =>
        `${count} collaborateur${count === 1 ? "" : "s"} affiché${count === 1 ? "" : "s"}`,
      selectedWorker: (id) => `collaborateur sélectionné #${id}`,
      noWorkerSelected: "Aucun collaborateur sélectionné",
      searchLabel: "Rechercher les collaborateurs assignés",
      searchPlaceholder:
        "Rechercher par nom, e-mail, rôle, secteur, identifiant entreprise...",
      compatibilityNotice: (pack) =>
        `Les collaborateurs Standard ne peuvent être rattachés à aucune organisation. Cette organisation requiert le pack d’abonnement ${pack}.`,
      emptySearch:
        "Aucun collaborateur assigné ne correspond à cette recherche ou à cette organisation.",
      selected: "Sélectionné",
      emailAriaLabel: (name) => `E-mail de ${name}`,
      emailRequired: "L’adresse e-mail est obligatoire.",
      invalidEmail: "Veuillez saisir une adresse e-mail valide.",
      updateEmailError:
        "Impossible de mettre à jour l’adresse e-mail du collaborateur.",
      saving: "Enregistrement...",
      saveEmail: "Enregistrer l’e-mail",
      cancel: "Annuler",
      noEmail: "Aucun e-mail",
      editEmail: "Modifier l’e-mail",
      paidAmount: (amount) => `payé ${amount}`,
      open: "Ouvrir",
      unassign: "Désaffecter",
      assignTitle: "Affecter un collaborateur compatible",
      assignDescription:
        "Seuls les collaborateurs non assignés disposant du pack requis peuvent être rattachés ici.",
      requiresPack: (pack) => `requiert ${pack}`,
      compatibleAvailable: (count) =>
        `${count} collaborateur${count === 1 ? "" : "s"} compatible${count === 1 ? "" : "s"} disponible${count === 1 ? "" : "s"} pour affectation.`,
      compatibleWorker: "Collaborateur compatible",
      noCompatibleWorker: "Aucun collaborateur compatible disponible",
      selectWorkerToAssign: "Sélectionner un collaborateur à affecter",
      assigning: "Affectation...",
      assignWorker: "Affecter le collaborateur",
      assignFooter:
        "Après affectation, le collaborateur devient disponible dans cet espace organisation pour les conversations, les canevas, les insights, les réservations et le suivi des revenus.",
      subscriptionStatuses: {
        active: "Actif",
        past_due: "Paiement en retard",
        canceled: "Annulé",
        cancelled: "Annulé",
        inactive: "Inactif",
      },
    },
    revenue: {
      shareRate: (percent) => `Taux de partage : ${percent}`,
      title: "Tableau de bord des revenus de l’organisation",
      description: (organizationPercent, platformPercent) =>
        `Les revenus sont calculés à partir des montants d’abonnement payés par les collaborateurs assignés. L’organisation reçoit ${organizationPercent} hors TVA et la plateforme conserve ${platformPercent}.`,
      calculationRule: "Règle de calcul",
      calculationSplit: (organizationPercent, platformPercent) =>
        `${organizationPercent} organisation / ${platformPercent} plateforme`,
      assignedWorkers: "Collaborateurs assignés",
      assignedWorkersHelper:
        "Collaborateurs actuellement rattachés à cette organisation.",
      paidWorkers: "Collaborateurs payants",
      paidWorkersHelper:
        "Collaborateurs assignés pour lesquels un paiement d’abonnement a été enregistré.",
      grossSubscriptions: "Abonnements bruts hors TVA",
      grossSubscriptionsHelper:
        "Total des revenus d’abonnement avant partage des revenus.",
      organizationRevenue: "Revenus de l’organisation hors TVA",
      organizationRevenueHelper: (percent) =>
        `${percent} des revenus bruts d’abonnement.`,
      platformShare: "Part plateforme hors TVA",
      platformShareHelper: (percent) =>
        `${percent} conservés par la plateforme LeanWorker.`,
      averageRevenue: "Revenu moyen / collaborateur payant",
      averageRevenueHelper:
        "Revenus de l’organisation divisés par le nombre de collaborateurs payants.",
      detailsTitle: "Détail des revenus par collaborateur assigné",
      detailsDescription:
        "Contribution de chaque collaborateur aux abonnements et répartition calculée des revenus.",
      workerCount: (count) =>
        `${count} collaborateur${count === 1 ? "" : "s"}`,
      empty:
        "Aucun collaborateur assigné pour le moment. Les revenus sont actuellement nuls.",
      columns: {
        worker: "Collaborateur",
        businessId: "Identifiant entreprise",
        pack: "Pack",
        subscriptionPaid: "Abonnement payé",
        organizationShare: "Part organisation",
        platformShare: "Part plateforme",
      },
      noEmail: "Aucun e-mail",
    },
  },
};

export function getOrganizationWorkersRevenueCopy(
  language: SupportedUiLanguage,
): OrganizationWorkersRevenueCopy {
  return COPY[language];
}
