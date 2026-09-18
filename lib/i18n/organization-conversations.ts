import type { SupportedUiLanguage } from "@/lib/user-locales";

type ConversationValidationCopy = {
  saveFallback: string;
  titleRequired: string;
  secretCodeCharacters: string;
  secretCodeTooLong: string;
  filePathVideoRequired: string;
  filePathAudioRequired: string;
  filePathUploadRequired: string;
};

export type OrganizationConversationsCopy = {
  locale: "fr-BE" | "en-BE";
  badge: string;
  workerConversations: string;
  description: (workerLabel: string) => string;
  noWorkerSelected: string;
  load: string;
  loading: string;
  refresh: string;

  notLoadedTitle: string;
  notLoadedDescription: string;
  noWorkerDescription: string;

  coach: {
    title: string;
    available: (count: number) => string;
    count: (count: number) => string;
    emptyTitle: string;
    emptyDescription: string;
    session: (id: number) => string;
    turns: (count: number) => string;
    sessionTitle: string;
    started: (date: string) => string;
    noSummary: string;
    noTranscript: string;
    worker: string;
    coach: string;
  };

  external: {
    title: string;
    captured: (count: number) => string;
    count: (count: number) => string;
    emptyTitle: string;
    emptyDescription: string;
    noMaterialTitle: string;
    noMaterialDescription: string;
    videoBadge: string;
    transcriptBadge: string;
    notesBadge: string;
    secretCodeBadge: string;
    video: string;
    filePath: string;
    secretCode: string;
    transcript: string;
    notes: string;
    watchVideo: string;
    openVideoTitle: string;
  };

  common: {
    open: string;
    hide: string;
    edit: string;
    delete: string;
    chars: (count: number) => string;
  };

  form: {
    editingBadge: string;
    newBadge: string;
    editTitle: string;
    addTitle: string;
    description: string;
    title: string;
    titlePlaceholder: string;
    sourceType: string;
    sourceLabel: string;
    sourceLabelPlaceholder: string;
    sourceTypes: {
      manual: string;
      meeting: string;
      video: string;
      audio: string;
      url: string;
      upload: string;
      note: string;
    };
    secretCode: string;
    secretCodePlaceholder: string;
    secretCodeTitle: string;
    secretCodeHelp: string;
    conversationDate: string;
    conversationDateHelp: string;
    videoUrl: string;
    filePath: string;
    filePathPlaceholder: string;
    filePathHelp: string;
    transcript: string;
    transcriptPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    cancel: string;
    saving: string;
    update: string;
    add: string;
  };

  validation: ConversationValidationCopy;
};

const COPY: Record<SupportedUiLanguage, OrganizationConversationsCopy> = {
  en: {
    locale: "en-BE",
    badge: "Conversations",
    workerConversations: "Worker conversations",
    description: (workerLabel) =>
      `Review AI coach sessions and add external conversation material for ${workerLabel}.`,
    noWorkerSelected: "No worker selected",
    load: "Load conversations",
    loading: "Loading...",
    refresh: "Refresh conversations",

    notLoadedTitle: "Conversations not loaded",
    notLoadedDescription:
      "Click “Load conversations” to fetch coach sessions and manually captured conversations.",
    noWorkerDescription:
      "Select a worker first to review coach sessions and external conversations.",

    coach: {
      title: "Coach sessions",
      available: (count) =>
        `${count} AI coaching session${count === 1 ? "" : "s"} available.`,
      count: (count) => `${count} session${count === 1 ? "" : "s"}`,
      emptyTitle: "No coach session",
      emptyDescription: "No AI coach session was found for this worker.",
      session: (id) => `session #${id}`,
      turns: (count) => `${count} turn${count === 1 ? "" : "s"}`,
      sessionTitle: "AI coaching session",
      started: (date) => `Started: ${date}`,
      noSummary: "No summary available.",
      noTranscript: "No transcript available.",
      worker: "Worker",
      coach: "Coach",
    },

    external: {
      title: "External conversations",
      captured: (count) =>
        `${count} external conversation${count === 1 ? "" : "s"} captured manually.`,
      count: (count) => `${count} captured`,
      emptyTitle: "No external conversation",
      emptyDescription:
        "No external conversation has been added for this worker yet.",
      noMaterialTitle: "No conversation material",
      noMaterialDescription:
        "This worker has no AI session transcript and no external conversation material yet.",
      videoBadge: "video",
      transcriptBadge: "transcript",
      notesBadge: "notes",
      secretCodeBadge: "secret code",
      video: "Video",
      filePath: "File path",
      secretCode: "Secret code",
      transcript: "Transcript",
      notes: "Notes",
      watchVideo: "Watch video",
      openVideoTitle: "Open video in a new tab",
    },

    common: {
      open: "Open",
      hide: "Hide",
      edit: "Edit",
      delete: "Delete",
      chars: (count) => `${count} chars`,
    },

    form: {
      editingBadge: "editing",
      newBadge: "new",
      editTitle: "Edit external conversation",
      addTitle: "Add external conversation",
      description:
        "Add notes, transcript, video link, meeting context, or imported conversation material.",
      title: "Title",
      titlePlaceholder: "Example: Initial discovery call",
      sourceType: "Source type",
      sourceLabel: "Source label",
      sourceLabelPlaceholder: "Example: Zoom, Teams, YouTube",
      sourceTypes: {
        manual: "Manual",
        meeting: "Meeting",
        video: "Video",
        audio: "Audio",
        url: "URL",
        upload: "Upload",
        note: "Note",
      },
      secretCode: "Secret code",
      secretCodePlaceholder: "Example: ABC123_XYZ",
      secretCodeTitle: "Letters, numbers, hyphens and underscores only",
      secretCodeHelp:
        "Optional. Letters, numbers, hyphens and underscores only. Maximum 100 characters.",
      conversationDate: "Conversation date",
      conversationDateHelp:
        "Stored without timezone conversion to preserve the exact local date and time.",
      videoUrl: "Video URL",
      filePath: "File path",
      filePathPlaceholder: "/uploads/conversation...",
      filePathHelp:
        "Required for Video, Audio and Upload sources. Manual, Meeting and Note can be saved without a file.",
      transcript: "Transcript",
      transcriptPlaceholder: "Paste transcript or conversation content...",
      notes: "Notes",
      notesPlaceholder: "Internal notes, observations, key signals...",
      cancel: "Cancel",
      saving: "Saving...",
      update: "Update conversation",
      add: "Add conversation",
    },

    validation: {
      saveFallback: "Unable to save the external conversation.",
      titleRequired:
        "Title is required before saving the external conversation.",
      secretCodeCharacters:
        "Secret code can contain only letters, numbers, hyphens and underscores.",
      secretCodeTooLong: "Secret code cannot exceed 100 characters.",
      filePathVideoRequired:
        "File path is required when Source type is Video. Add the stored video file path, or change Source type if this is only a web link.",
      filePathAudioRequired:
        "File path is required when Source type is Audio.",
      filePathUploadRequired:
        "File path is required when Source type is Upload.",
    },
  },

  fr: {
    locale: "fr-BE",
    badge: "Conversations",
    workerConversations: "Conversations du collaborateur",
    description: (workerLabel) =>
      `Consultez les sessions de coaching IA et ajoutez du contenu de conversation externe pour ${workerLabel}.`,
    noWorkerSelected: "Aucun collaborateur sélectionné",
    load: "Charger les conversations",
    loading: "Chargement...",
    refresh: "Actualiser les conversations",

    notLoadedTitle: "Conversations non chargées",
    notLoadedDescription:
      "Cliquez sur « Charger les conversations » pour récupérer les sessions de coaching et les conversations ajoutées manuellement.",
    noWorkerDescription:
      "Sélectionnez d’abord un collaborateur pour consulter les sessions de coaching et les conversations externes.",

    coach: {
      title: "Sessions de coaching",
      available: (count) =>
        `${count} session${count === 1 ? "" : "s"} de coaching IA disponible${count === 1 ? "" : "s"}.`,
      count: (count) => `${count} session${count === 1 ? "" : "s"}`,
      emptyTitle: "Aucune session de coaching",
      emptyDescription:
        "Aucune session de coaching IA n’a été trouvée pour ce collaborateur.",
      session: (id) => `session n°${id}`,
      turns: (count) => `${count} tour${count === 1 ? "" : "s"}`,
      sessionTitle: "Session de coaching IA",
      started: (date) => `Démarrée : ${date}`,
      noSummary: "Aucun résumé disponible.",
      noTranscript: "Aucune transcription disponible.",
      worker: "Collaborateur",
      coach: "Coach",
    },

    external: {
      title: "Conversations externes",
      captured: (count) =>
        `${count} conversation${count === 1 ? "" : "s"} externe${count === 1 ? "" : "s"} ajoutée${count === 1 ? "" : "s"} manuellement.`,
      count: (count) => `${count} enregistrée${count === 1 ? "" : "s"}`,
      emptyTitle: "Aucune conversation externe",
      emptyDescription:
        "Aucune conversation externe n’a encore été ajoutée pour ce collaborateur.",
      noMaterialTitle: "Aucun contenu de conversation",
      noMaterialDescription:
        "Ce collaborateur ne dispose encore d’aucune transcription de session IA ni d’aucun contenu de conversation externe.",
      videoBadge: "vidéo",
      transcriptBadge: "transcription",
      notesBadge: "notes",
      secretCodeBadge: "code secret",
      video: "Vidéo",
      filePath: "Chemin du fichier",
      secretCode: "Code secret",
      transcript: "Transcription",
      notes: "Notes",
      watchVideo: "Voir la vidéo",
      openVideoTitle: "Ouvrir la vidéo dans un nouvel onglet",
    },

    common: {
      open: "Ouvrir",
      hide: "Masquer",
      edit: "Modifier",
      delete: "Supprimer",
      chars: (count) => `${count} caractères`,
    },

    form: {
      editingBadge: "modification",
      newBadge: "nouvelle",
      editTitle: "Modifier la conversation externe",
      addTitle: "Ajouter une conversation externe",
      description:
        "Ajoutez des notes, une transcription, un lien vidéo, le contexte d’une réunion ou du contenu de conversation importé.",
      title: "Titre",
      titlePlaceholder: "Exemple : appel de découverte initial",
      sourceType: "Type de source",
      sourceLabel: "Libellé de la source",
      sourceLabelPlaceholder: "Exemple : Zoom, Teams, YouTube",
      sourceTypes: {
        manual: "Manuel",
        meeting: "Réunion",
        video: "Vidéo",
        audio: "Audio",
        url: "URL",
        upload: "Fichier importé",
        note: "Note",
      },
      secretCode: "Code secret",
      secretCodePlaceholder: "Exemple : ABC123_XYZ",
      secretCodeTitle:
        "Lettres, chiffres, tirets et traits de soulignement uniquement",
      secretCodeHelp:
        "Facultatif. Lettres, chiffres, tirets et traits de soulignement uniquement. Maximum 100 caractères.",
      conversationDate: "Date de la conversation",
      conversationDateHelp:
        "Enregistrée sans conversion de fuseau horaire afin de préserver exactement la date et l’heure locales.",
      videoUrl: "URL de la vidéo",
      filePath: "Chemin du fichier",
      filePathPlaceholder: "/uploads/conversation...",
      filePathHelp:
        "Obligatoire pour les sources Vidéo, Audio et Fichier importé. Les sources Manuel, Réunion et Note peuvent être enregistrées sans fichier.",
      transcript: "Transcription",
      transcriptPlaceholder:
        "Collez la transcription ou le contenu de la conversation...",
      notes: "Notes",
      notesPlaceholder:
        "Notes internes, observations, signaux importants...",
      cancel: "Annuler",
      saving: "Enregistrement...",
      update: "Mettre à jour la conversation",
      add: "Ajouter la conversation",
    },

    validation: {
      saveFallback:
        "Impossible d’enregistrer la conversation externe.",
      titleRequired:
        "Le titre est obligatoire avant d’enregistrer la conversation externe.",
      secretCodeCharacters:
        "Le code secret ne peut contenir que des lettres, des chiffres, des tirets et des traits de soulignement.",
      secretCodeTooLong:
        "Le code secret ne peut pas dépasser 100 caractères.",
      filePathVideoRequired:
        "Le chemin du fichier est obligatoire lorsque le type de source est Vidéo. Ajoutez le chemin du fichier vidéo enregistré ou changez le type de source s’il s’agit uniquement d’un lien web.",
      filePathAudioRequired:
        "Le chemin du fichier est obligatoire lorsque le type de source est Audio.",
      filePathUploadRequired:
        "Le chemin du fichier est obligatoire lorsque le type de source est Fichier importé.",
    },
  },
};

export function getOrganizationConversationsCopy(
  language: SupportedUiLanguage,
): OrganizationConversationsCopy {
  return COPY[language];
}
