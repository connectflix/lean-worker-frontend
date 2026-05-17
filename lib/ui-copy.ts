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
      badge: "Coaching carrière",
      title: "Clarifie ta trajectoire. Avance avec calme.",
      subtitle:
        "LeanWorker t’aide à comprendre ce que tu vis au travail, à relier tes enjeux à ta trajectoire, puis à transformer tes sessions en actions utiles.",
      linkedinTitle: "Continuer avec LinkedIn",
      linkedinBody:
        "Utilise ton compte LinkedIn pour créer ton espace personnel et contextualiser ton coaching dès le départ.",
      checkingSession: "Vérification de ta session...",
      continueWithLinkedIn: "Continuer avec LinkedIn",
      redirecting: "Redirection...",
    },
    dashboard: {
      title: "Tableau de bord",
      subtitle:
        "Un espace calme pour suivre tes sessions, ta trajectoire, tes recommandations et tes prochains mouvements.",
      resumeOpenSession: "Reprendre ma session",
      startNewSession: "Démarrer une session",
      recentSessions: "Sessions récentes",
      topLeverTypes: "Leviers les plus utiles",
      noSessions: "Aucune session pour le moment.",
      loading: "Préparation de ton espace...",
    },
    session: {
      noSessionFound: "Aucune session trouvée",
      noSessionBody:
        "Démarre une nouvelle session depuis ton tableau de bord ou reprends une session ouverte depuis ton historique.",
      backToDashboard: "Retour au tableau de bord",
      viewRecommendations: "Voir les recommandations",
      conversation: "Conversation",
      open: "Ouverte",
      loadingSession: "Préparation de ta session...",
      noMessages: "Aucun message pour le moment.",
      typeMessage: "Écris naturellement ce qui te préoccupe ou ce que tu veux clarifier.",
      sendTextTurn: "Envoyer",
      sending: "Envoi...",
      startContinuousMode: "Démarrer le mode vocal",
      stopContinuousMode: "Arrêter le mode vocal",
      closeSession: "Clôturer la session",
      closing: "Clôture...",
      preparingMicrophone: "Préparation du microphone...",
      listening: "Je t’écoute.",
      userSpeaking: "Tu parles...",
      agentThinking: "Le coach réfléchit...",
      agentSpeaking: "Le coach parle...",
      voiceModeError: "Erreur du mode vocal.",
      voiceModeOff: "Le mode vocal est désactivé.",
      voiceModeTitle: "Session vocale",
      voiceModeBody:
        "Parle naturellement. Le coach détecte la fin de ton tour, répond vocalement, puis conserve l’échange dans la même session pour l’analyse.",
    },
    recommendations: {
      title: "Recommandations",
      subtitle:
        "Des actions personnalisées pour transformer tes sessions en mouvement concret.",
      loading: "Chargement de tes recommandations...",
      empty:
        "Ton coach analyse encore tes signaux. Les recommandations apparaîtront quand ta trajectoire deviendra plus claire.",
      suggestedResources: "Ressources utiles",
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
      voiceOn: "Voice on",
      voiceOff: "Voice off",
    },
    home: {
      badge: "Career coaching",
      title: "Clarify your trajectory. Move forward calmly.",
      subtitle:
        "LeanWorker helps you understand what is happening at work, connect your challenges to your trajectory, and turn your sessions into useful action.",
      linkedinTitle: "Continue with LinkedIn",
      linkedinBody:
        "Use your LinkedIn account to create your personal space and contextualize your coaching from day one.",
      checkingSession: "Checking your session...",
      continueWithLinkedIn: "Continue with LinkedIn",
      redirecting: "Redirecting...",
    },
    dashboard: {
      title: "Dashboard",
      subtitle:
        "A calm space to follow your sessions, trajectory, recommendations, and next moves.",
      resumeOpenSession: "Resume my session",
      startNewSession: "Start a session",
      recentSessions: "Recent sessions",
      topLeverTypes: "Most useful levers",
      noSessions: "No sessions yet.",
      loading: "Preparing your workspace...",
    },
    session: {
      noSessionFound: "No session found",
      noSessionBody:
        "Start a new session from your dashboard or resume an open one from your history.",
      backToDashboard: "Back to dashboard",
      viewRecommendations: "View recommendations",
      conversation: "Conversation",
      open: "Open",
      loadingSession: "Preparing your session...",
      noMessages: "No messages yet.",
      typeMessage: "Write naturally about what you want to clarify or move forward.",
      sendTextTurn: "Send",
      sending: "Sending...",
      startContinuousMode: "Start voice mode",
      stopContinuousMode: "Stop voice mode",
      closeSession: "Close session",
      closing: "Closing...",
      preparingMicrophone: "Preparing microphone...",
      listening: "Listening.",
      userSpeaking: "You are speaking...",
      agentThinking: "Coach is thinking...",
      agentSpeaking: "Coach is speaking...",
      voiceModeError: "Voice mode error.",
      voiceModeOff: "Voice mode is off.",
      voiceModeTitle: "Voice session",
      voiceModeBody:
        "Speak naturally. Your coach detects the end of your turn, responds with voice, and keeps each exchange in the same session for analysis.",
    },
    recommendations: {
      title: "Recommendations",
      subtitle:
        "Personalized actions to turn your sessions into concrete movement.",
      loading: "Loading your recommendations...",
      empty:
        "Your coach is still reading the signals. Recommendations will appear as your trajectory becomes clearer.",
      suggestedResources: "Useful resources",
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