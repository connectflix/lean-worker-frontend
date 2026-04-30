import type { SupportedUiLanguage } from "@/lib/user-locales";


export type UiCopy = {
  common: {
    loading: string;
    back: string;
    continue: string;
    cancel: string;
    save: string;
    close: string;
    open: string;
    start: string;
    complete: string;
    dismiss: string;
    dashboard: string;
    recommendations: string;
    session: string;
    voiceOn: string;
    voiceOff: string;
  };
  home: {
    badge: string;
    title: string;
    subtitle: string;
    linkedinTitle: string;
    linkedinBody: string;
    checkingSession: string;
    continueWithLinkedIn: string;
    redirecting: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    resumeOpenSession: string;
    startNewSession: string;
    recentSessions: string;
    topLeverTypes: string;
    noSessions: string;
    loading: string;
  };
  session: {
    noSessionFound: string;
    noSessionBody: string;
    backToDashboard: string;
    viewRecommendations: string;
    conversation: string;
    open: string;
    loadingSession: string;
    noMessages: string;
    typeMessage: string;
    sendTextTurn: string;
    sending: string;
    startContinuousMode: string;
    stopContinuousMode: string;
    closeSession: string;
    closing: string;
    preparingMicrophone: string;
    listening: string;
    userSpeaking: string;
    agentThinking: string;
    agentSpeaking: string;
    voiceModeError: string;
    voiceModeOff: string;
    voiceModeTitle: string;
    voiceModeBody: string;
  };
  recommendations: {
    title: string;
    subtitle: string;
    loading: string;
    empty: string;
    suggestedResources: string;
    bestMatch: string;
    yourNote: string;
    saveNote: string;
    status: string;
    started: string;
    completed: string;
  };
};

export const UI_COPY: Record<SupportedUiLanguage, UiCopy> = {
  fr: {
    common: {
      loading: "Chargement...",
      back: "Retour",
      continue: "Continuer",
      cancel: "Annuler",
      save: "Enregistrer",
      close: "Fermer",
      open: "Ouvrir",
      start: "Démarrer",
      complete: "Terminer",
      dismiss: "Ignorer",
      dashboard: "Tableau de bord",
      recommendations: "Recommandations",
      session: "Session",
      voiceOn: "Voix activée",
      voiceOff: "Voix désactivée",
    },
    home: {
      badge: "MVP",
      title: "Plateforme Voice AI persistante",
      subtitle:
        "Conversation authentifiée, contexte longitudinal, résumés de session et recommandations personnalisées.",
      linkedinTitle: "Continuer avec LinkedIn",
      linkedinBody: "Utilise ton compte LinkedIn pour accéder au produit.",
      checkingSession: "Vérification de ta session...",
      continueWithLinkedIn: "Continuer avec LinkedIn",
      redirecting: "Redirection...",
    },
    dashboard: {
      title: "Tableau de bord",
      subtitle: "Suis ta progression, tes sessions et tes recommandations.",
      resumeOpenSession: "Reprendre la session ouverte",
      startNewSession: "Démarrer une nouvelle session",
      recentSessions: "Sessions récentes",
      topLeverTypes: "Types de leviers les plus utilisés",
      noSessions: "Aucune session pour le moment.",
      loading: "Chargement du tableau de bord...",
    },
    session: {
      noSessionFound: "Aucune session trouvée",
      noSessionBody:
        "Démarre une nouvelle session depuis le tableau de bord ou reprends une session ouverte depuis l’historique.",
      backToDashboard: "Retour au tableau de bord",
      viewRecommendations: "Voir les recommandations",
      conversation: "Conversation",
      open: "Ouverte",
      loadingSession: "Chargement de la session existante...",
      noMessages: "Aucun message pour le moment.",
      typeMessage: "Tape ton message ou active le mode vocal continu.",
      sendTextTurn: "Envoyer le message",
      sending: "Envoi...",
      startContinuousMode: "🎙️ Activer le mode continu",
      stopContinuousMode: "⏹ Stopper le mode continu",
      closeSession: "Clôturer la session",
      closing: "Clôture...",
      preparingMicrophone: "Préparation du microphone...",
      listening: "Écoute en continu...",
      userSpeaking: "Tu es en train de parler...",
      agentThinking: "Le coach réfléchit...",
      agentSpeaking: "Le coach parle...",
      voiceModeError: "Erreur du mode vocal.",
      voiceModeOff: "Le mode vocal est désactivé.",
      voiceModeTitle: "Mode vocal continu",
      voiceModeBody:
        "Le microphone reste ouvert, attend plus patiemment que tu aies terminé, et stocke chaque échange dans la même session pour l’analyse.",
    },
    recommendations: {
      title: "Recommandations",
      subtitle: "Actions générées à partir de tes sessions de conversation passées.",
      loading: "Chargement des recommandations...",
      empty: "Aucune recommandation pour le moment.",
      suggestedResources: "Ressources suggérées",
      bestMatch: "Meilleur choix",
      yourNote: "Ta note",
      saveNote: "Enregistrer la note",
      status: "Statut",
      started: "Commencé",
      completed: "Terminé",
    },
  },
  en: {
    common: {
      loading: "Loading...",
      back: "Back",
      continue: "Continue",
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      open: "Open",
      start: "Start",
      complete: "Complete",
      dismiss: "Dismiss",
      dashboard: "Dashboard",
      recommendations: "Recommendations",
      session: "Session",
      voiceOn: "Voice On",
      voiceOff: "Voice Off",
    },
    home: {
      badge: "MVP",
      title: "Persistent Voice AI Platform",
      subtitle:
        "Authenticated conversation, longitudinal context, session summaries and personalized recommendations.",
      linkedinTitle: "Continue with LinkedIn",
      linkedinBody: "Use your LinkedIn account to access the product.",
      checkingSession: "Checking your session...",
      continueWithLinkedIn: "Continue with LinkedIn",
      redirecting: "Redirecting...",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Track your progress, sessions, and recommendations.",
      resumeOpenSession: "Resume open session",
      startNewSession: "Start a new session",
      recentSessions: "Recent sessions",
      topLeverTypes: "Top lever types used",
      noSessions: "No sessions yet.",
      loading: "Loading dashboard...",
    },
    session: {
      noSessionFound: "No session found",
      noSessionBody:
        "Start a new session from the dashboard or resume an open one from history.",
      backToDashboard: "Back to dashboard",
      viewRecommendations: "View recommendations",
      conversation: "Conversation",
      open: "Open",
      loadingSession: "Loading existing session...",
      noMessages: "No messages yet.",
      typeMessage: "Type your message or activate continuous voice mode.",
      sendTextTurn: "Send text turn",
      sending: "Sending...",
      startContinuousMode: "🎙️ Start continuous mode",
      stopContinuousMode: "⏹ Stop continuous mode",
      closeSession: "Close session",
      closing: "Closing...",
      preparingMicrophone: "Preparing microphone...",
      listening: "Listening continuously...",
      userSpeaking: "You are speaking...",
      agentThinking: "Agent is thinking...",
      agentSpeaking: "Agent is speaking...",
      voiceModeError: "Voice mode error.",
      voiceModeOff: "Voice mode is off.",
      voiceModeTitle: "Continuous voice mode",
      voiceModeBody:
        "The microphone stays open, waits more patiently before concluding that you are done, and stores each spoken exchange in the same session for later analysis.",
    },
    recommendations: {
      title: "Recommendations",
      subtitle: "Actions generated from your past conversation sessions.",
      loading: "Loading recommendations...",
      empty: "Your coach is analyzing your sessions. Recommendations will appear as your trajectory becomes clearer.",
      suggestedResources: "Suggested resources",
      bestMatch: "Best match",
      yourNote: "Your note",
      saveNote: "Save note",
      status: "Status",
      started: "Started",
      completed: "Completed",
    },
  },
};

export function getUiCopy(language: SupportedUiLanguage): UiCopy {
  return UI_COPY[language];
}