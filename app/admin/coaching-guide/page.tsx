"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

type GuideSectionType = "stage" | "canvas" | "practice";

type GuideQuestion = {
  text: string;
  canvasBlocks?: string[];
  fillGuidance?: string;
};

type GuideNode = {
  id: string;
  type: GuideSectionType;
  title: string;
  subtitle: string;
  objective: string;
  mindset: string;
  content: string[];
  questions: GuideQuestion[];
  examples: Array<{
    label: string;
    weak?: string;
    strong: string;
  }>;
  checklist: string[];
};

const GUIDE_NODES: GuideNode[] = [
  {
    id: "prepare",
    type: "stage",
    title: "1. Préparer la session",
    subtitle: "Comprendre le contexte avant de coacher.",
    objective:
      "Arriver en session avec une première lecture du worker, de son contexte et de la raison probable de l’accompagnement.",
    mindset:
      "Ne commence pas par remplir les canvas. Commence par comprendre la personne, son contexte et ce qui la préoccupe réellement.",
    content: [
      "Relire le profil du worker avant la session.",
      "Identifier son rôle, son secteur, son objectif principal et ses signaux de difficulté.",
      "Préparer quelques questions ouvertes.",
      "Clarifier l’intention de la session : comprendre, structurer, décider ou suivre.",
    ],
    questions: [
      { text: "Qu’est-ce qui t’amène aujourd’hui dans cet accompagnement ?" },
      { text: "Qu’aimerais-tu clarifier en priorité pendant cette session ?" },
      { text: "Quel sujet professionnel te prend le plus d’énergie en ce moment ?" },
      { text: "Qu’est-ce qui ferait que cette session serait utile pour toi ?" },
      { text: "Si tu devais résumer ta situation actuelle en une phrase, que dirais-tu ?" },
      {
        text: "Quel est le principal changement que tu aimerais voir dans ta manière de travailler ?",
      },
      { text: "Qu’est-ce que tu attends concrètement de cet accompagnement ?" },
      { text: "Y a-t-il un sujet que tu veux absolument aborder aujourd’hui ?" },
      { text: "Qu’est-ce qui te semble urgent, important ou bloquant actuellement ?" },
      {
        text: "À la fin de cette session, qu’aimerais-tu avoir compris, décidé ou clarifié ?",
      },
    ],
    examples: [
      {
        label: "Ouverture de session",
        weak: "On va remplir ton canvas.",
        strong:
          "Avant de regarder les canvas, j’aimerais comprendre ce que tu vis actuellement et ce que tu veux clarifier en priorité.",
      },
      {
        label: "Clarifier l’attente du worker",
        weak: "Dis-moi ce que tu veux faire.",
        strong:
          "À la fin de cette session, qu’aimerais-tu avoir clarifié : ton problème principal, tes priorités, une décision ou une prochaine action ?",
      },
      {
        label: "Identifier le sujet prioritaire",
        weak: "On va parler de ton travail en général.",
        strong:
          "Parmi tous les sujets que tu pourrais aborder, lequel te prend le plus d’énergie en ce moment et mérite qu’on commence par lui ?",
      },
      {
        label: "Créer un cadre rassurant",
        weak: "Je vais analyser ton cas.",
        strong:
          "L’objectif n’est pas de te juger, mais de comprendre ta situation avec précision pour t’aider à la structurer et à avancer.",
      },
      {
        label: "Définir l’intention de la session",
        weak: "On verra où ça nous mène.",
        strong:
          "Aujourd’hui, on peut choisir de comprendre le problème, structurer ta situation, décider d’une action ou faire le suivi d’un engagement précédent.",
      },
    ],
    checklist: [
      "J’ai relu le profil du worker.",
      "J’ai identifié le sujet principal probable.",
      "Je sais si la session vise à comprendre, structurer, décider ou suivre.",
    ],
  },
  {
    id: "explore",
    type: "stage",
    title: "2. Explorer la situation actuelle",
    subtitle: "Faire émerger les faits, ressentis, irritants et aspirations.",
    objective:
      "Comprendre ce que le worker vit réellement aujourd’hui dans son travail, sans forcer immédiatement une solution.",
    mindset:
      "Le worker peut parler en désordre. Le rôle du coach est d’écouter, reformuler et distinguer les faits, les ressentis et les interprétations.",
    content: [
      "Laisser le worker raconter sa situation avec ses propres mots.",
      "Repérer les irritants, frustrations, contraintes et sources d’énergie.",
      "Identifier ce qui est factuel et ce qui relève de la perception.",
      "Noter les formulations fortes qui révèlent une tension ou une aspiration.",
    ],
    questions: [
      { text: "Qu’est-ce qui est le plus difficile dans ton travail actuellement ?" },
      { text: "Qu’est-ce qui te fatigue ou te frustre le plus ?" },
      { text: "À quel moment te sens-tu utile ou à ta place ?" },
      { text: "Qu’est-ce qui revient souvent comme problème ?" },
      { text: "Qu’est-ce que tu aimerais ne plus subir ?" },
      { text: "Quels sont les moments où tu as l’impression de perdre le contrôle ?" },
      { text: "Quelles situations te donnent le sentiment de ne pas avancer ?" },
      { text: "Quelles tâches prennent trop de place par rapport à leur vraie valeur ?" },
      { text: "Qu’est-ce qui te semble flou dans ton rôle ou tes priorités ?" },
      { text: "Quels types de demandes ou d’interactions te mettent sous pression ?" },
      { text: "Qu’est-ce qui te donne encore de l’énergie dans ton travail actuel ?" },
      { text: "Qu’est-ce que tu fais bien mais qui n’est pas suffisamment reconnu ?" },
      { text: "Quels problèmes se répètent malgré tes efforts ?" },
      { text: "Qu’est-ce qui t’empêche de travailler comme tu le voudrais ?" },
      {
        text: "Si tu pouvais changer une seule chose dans ton quotidien professionnel, laquelle choisirais-tu ?",
      },
    ],
    examples: [
      {
        label: "Clarification d’un problème vague",
        weak: "Je suis débordé.",
        strong:
          "Je suis surtout débordé par les interruptions imprévues et les demandes qui arrivent sans priorité claire.",
      },
      {
        label: "Identifier une tension répétitive",
        weak: "Il y a trop de problèmes.",
        strong:
          "Le problème qui revient le plus souvent est que je dois gérer des urgences alors que mes objectifs de fond ne sont jamais protégés.",
      },
      {
        label: "Distinguer fait et ressenti",
        weak: "Personne ne respecte mon travail.",
        strong:
          "Je ressens un manque de reconnaissance parce que mes analyses sont souvent utilisées, mais rarement associées à mon nom ou à mon rôle.",
      },
      {
        label: "Identifier une source d’énergie",
        weak: "Il y a quand même des choses que j’aime.",
        strong:
          "Ce qui me donne de l’énergie, c’est quand je peux clarifier une situation confuse et aider une équipe à prendre une décision.",
      },
      {
        label: "Repérer un blocage opérationnel",
        weak: "Je n’avance pas.",
        strong:
          "Je n’avance pas parce que mes tâches importantes sont constamment repoussées par des demandes courtes mais urgentes.",
      },
    ],
    checklist: [
      "J’ai compris le problème avec des exemples concrets.",
      "J’ai distingué faits, ressentis et interprétations.",
      "J’ai identifié au moins une tension principale.",
    ],
  },
  {
    id: "engagement-canvas",
    type: "canvas",
    title: "3. Engagement Canvas",
    subtitle: "Structurer identité, missions, ambitions, vision, actions et objectifs.",
    objective:
      "Transformer une conversation parfois floue en une représentation claire de la situation actuelle ou future du worker.",
    mindset:
      "L’Engagement Canvas n’est pas un formulaire. C’est une carte de lecture pour relier qui est le worker, ce qu’il fait, ce qu’il veut et comment il peut avancer.",
    content: [
      "Utiliser ce canvas pour structurer la situation actuelle du worker.",
      "L’utiliser ensuite pour construire un état futur plus aligné.",
      "Bien distinguer les ambitions générales des actions concrètes.",
      "Terminer avec des objectifs observables.",
    ],
    questions: [
      {
        text: "Comment te décrirais-tu professionnellement aujourd’hui ?",
        canvasBlocks: ["Engagement Canvas → Identité"],
        fillGuidance:
          "Utiliser la réponse pour formuler l’identité professionnelle du Worker au-delà de son simple intitulé de poste.",
      },
      {
        text: "Quel rôle joues-tu réellement pour ton équipe, tes clients ou ton organisation ?",
        canvasBlocks: ["Engagement Canvas → Identité", "Engagement Canvas → Missions"],
        fillGuidance:
          "Si la réponse décrit qui il est professionnellement, remplir Identité. Si elle décrit ce qu’il fait concrètement, remplir Missions.",
      },
      {
        text: "Qu’est-ce que les autres viennent chercher chez toi ?",
        canvasBlocks: ["Engagement Canvas → Identité", "Engagement Canvas → Missions"],
        fillGuidance:
          "La réponse peut révéler sa valeur distinctive, son rôle réel ou ses contributions principales.",
      },
      {
        text: "Qu’est-ce qui te différencie dans ta manière de travailler ?",
        canvasBlocks: ["Engagement Canvas → Identité"],
        fillGuidance:
          "Utiliser la réponse pour capturer le style professionnel, les forces et la posture du Worker.",
      },
      {
        text: "Quelles sont tes missions les plus importantes aujourd’hui ?",
        canvasBlocks: ["Engagement Canvas → Missions"],
        fillGuidance:
          "Lister les responsabilités, activités ou contributions réellement centrales dans son rôle actuel.",
      },
      {
        text: "Quelles responsabilités portes-tu réellement, même si elles ne sont pas toujours visibles ?",
        canvasBlocks: ["Engagement Canvas → Missions", "Engagement Canvas → Identité"],
        fillGuidance:
          "Remplir Missions avec les responsabilités concrètes. Remplir Identité si la réponse révèle une posture ou un rôle informel.",
      },
      {
        text: "Quelles activités ont le plus d’impact dans ton rôle actuel ?",
        canvasBlocks: ["Engagement Canvas → Missions", "Engagement Canvas → But"],
        fillGuidance:
          "Les activités vont dans Missions. Leur impact ou finalité peut alimenter le bloc But.",
      },
      {
        text: "Qu’est-ce qui prend le plus de place dans ton quotidien professionnel ?",
        canvasBlocks: ["Engagement Canvas → Missions"],
        fillGuidance:
          "Utiliser la réponse pour distinguer le travail réel du job théorique.",
      },
      {
        text: "Qu’aimerais-tu atteindre dans les prochains mois ?",
        canvasBlocks: ["Engagement Canvas → Ambitions", "Engagement Canvas → Objectifs"],
        fillGuidance:
          "Si la réponse est aspirationnelle, remplir Ambitions. Si elle est mesurable ou datée, remplir Objectifs.",
      },
      {
        text: "Dans quoi veux-tu progresser concrètement ?",
        canvasBlocks: ["Engagement Canvas → Ambitions", "Engagement Canvas → Objectifs"],
        fillGuidance:
          "Utiliser Ambitions pour la direction de progression et Objectifs si un résultat observable est mentionné.",
      },
      {
        text: "Quel type de rôle aimerais-tu jouer demain ?",
        canvasBlocks: ["Engagement Canvas → Ambitions", "Engagement Canvas → Vision"],
        fillGuidance:
          "Remplir Ambitions avec le rôle souhaité. Remplir Vision si le Worker décrit une situation cible plus large.",
      },
      {
        text: "Qu’est-ce que tu ne veux plus accepter dans ta trajectoire professionnelle ?",
        canvasBlocks: ["Engagement Canvas → Ambitions", "Engagement Canvas → Vision"],
        fillGuidance:
          "La réponse aide à clarifier la rupture souhaitée entre situation actuelle et état futur.",
      },
      {
        text: "À quoi ressemblerait une meilleure situation professionnelle pour toi ?",
        canvasBlocks: ["Engagement Canvas → Vision"],
        fillGuidance:
          "Utiliser la réponse pour décrire l’état futur désirable de manière claire et concrète.",
      },
      {
        text: "Si les choses évoluaient positivement, qu’est-ce qui aurait changé ?",
        canvasBlocks: ["Engagement Canvas → Vision", "Engagement Canvas → Objectifs"],
        fillGuidance:
          "Vision si la réponse décrit un état cible. Objectifs si elle décrit un résultat vérifiable.",
      },
      {
        text: "Quelle image as-tu de ton prochain niveau professionnel ?",
        canvasBlocks: ["Engagement Canvas → Vision", "Engagement Canvas → Ambitions"],
        fillGuidance:
          "Capturer la projection du Worker vers son prochain niveau professionnel.",
      },
      {
        text: "Quelle première action concrète peux-tu lancer cette semaine ?",
        canvasBlocks: ["Engagement Canvas → Actions"],
        fillGuidance:
          "Remplir uniquement si l’action est concrète, réalisable et formulée comme un comportement observable.",
      },
      {
        text: "Quel petit changement pourrait produire un effet important ?",
        canvasBlocks: ["Engagement Canvas → Actions"],
        fillGuidance:
          "Identifier une action légère mais à fort effet sur la situation du Worker.",
      },
      {
        text: "De quelle aide aurais-tu besoin pour avancer plus vite ou plus sereinement ?",
        canvasBlocks: ["Engagement Canvas → Actions", "Engagement Canvas → Objectifs"],
        fillGuidance:
          "La réponse peut alimenter une action de support ou préciser une condition de réussite.",
      },
      {
        text: "Comment sauras-tu que tu as réellement progressé ?",
        canvasBlocks: ["Engagement Canvas → Objectifs"],
        fillGuidance:
          "Transformer la réponse en indicateur de progression observable.",
      },
      {
        text: "Quel résultat observable veux-tu obtenir dans les prochaines semaines ou prochains mois ?",
        canvasBlocks: ["Engagement Canvas → Objectifs"],
        fillGuidance:
          "Utiliser la réponse pour formuler un objectif clair, temporel et vérifiable.",
      },
    ],
    examples: [
      {
        label: "Identité professionnelle",
        weak: "Je suis chef de projet.",
        strong:
          "Je suis quelqu’un qui structure les problèmes complexes et aide les équipes à transformer des idées floues en plans concrets.",
      },
      {
        label: "Missions principales",
        weak: "Je gère plusieurs sujets.",
        strong:
          "Mes missions principales sont d’analyser les besoins, coordonner les parties prenantes et sécuriser la livraison fonctionnelle.",
      },
      {
        label: "Ambition professionnelle",
        weak: "Je veux évoluer.",
        strong:
          "Je veux devenir plus autonome dans la prise de décision et être reconnu comme référent sur mon périmètre.",
      },
      {
        label: "Action concrète",
        weak: "Je dois mieux m’organiser.",
        strong:
          "Je vais bloquer deux créneaux par semaine pour traiter les sujets stratégiques avant les urgences opérationnelles.",
      },
      {
        label: "Objectif observable",
        weak: "Je veux être plus efficace.",
        strong:
          "Dans trois mois, je veux avoir repris le contrôle de mes priorités et réduire les interruptions non planifiées.",
      },
    ],
    checklist: [
      "L’identité est formulée au-delà du job title.",
      "Les missions sont concrètes.",
      "Les ambitions sont reliées à une vision.",
      "Les actions sont réalistes et observables.",
      "Les objectifs permettent de mesurer une progression.",
    ],
  },
  {
    id: "purpose-canvas",
    type: "canvas",
    title: "4. Purpose Canvas",
    subtitle: "Clarifier l’alignement profond du worker.",
    objective:
      "Comprendre l’alignement entre travail, aspiration, inspiration, passion, vocation et formation.",
    mindset:
      "Une difficulté professionnelle peut cacher une tension plus profonde entre ce que la personne fait, ce qu’elle veut devenir et ce qui lui donne réellement de l’énergie.",
    content: [
      "Explorer ce que le worker fait réellement aujourd’hui.",
      "Identifier vers quoi il aspire.",
      "Comprendre ce qui l’inspire et ce qui le passionne.",
      "Faire émerger une contribution plus profonde.",
      "Identifier ce qu’il doit apprendre ou renforcer.",
    ],
    questions: [
      {
        text: "Que fais-tu réellement au quotidien dans ton travail ?",
        canvasBlocks: ["Purpose Canvas → Travail"],
        fillGuidance:
          "Décrire le travail réel tel qu’il est vécu, pas seulement l’intitulé officiel du poste.",
      },
      {
        text: "Quelles activités occupent le plus ton temps et ton attention ?",
        canvasBlocks: ["Purpose Canvas → Travail"],
        fillGuidance:
          "Capturer les activités dominantes du quotidien professionnel.",
      },
      {
        text: "Qu’est-ce qui est visible dans ton rôle et qu’est-ce qui reste invisible ?",
        canvasBlocks: ["Purpose Canvas → Travail", "Engagement Canvas → Missions"],
        fillGuidance:
          "Purpose Travail pour le vécu réel. Engagement Missions si cela révèle des responsabilités importantes.",
      },
      {
        text: "Vers quoi aimerais-tu évoluer professionnellement ?",
        canvasBlocks: ["Purpose Canvas → Aspiration"],
        fillGuidance:
          "Formuler l’évolution souhaitée, même si elle est encore partiellement floue.",
      },
      {
        text: "Quelle situation professionnelle t’attire vraiment ?",
        canvasBlocks: ["Purpose Canvas → Aspiration", "Engagement Canvas → Vision"],
        fillGuidance:
          "Aspiration si la réponse parle de désir d’évolution. Vision si elle décrit un état futur structuré.",
      },
      {
        text: "Qu’aimerais-tu pouvoir faire plus souvent dans ton travail ?",
        canvasBlocks: ["Purpose Canvas → Aspiration", "Purpose Canvas → Passion"],
        fillGuidance:
          "Aspiration si la réponse indique une direction. Passion si elle révèle une source d’énergie.",
      },
      {
        text: "Qui ou quoi t’inspire professionnellement ?",
        canvasBlocks: ["Purpose Canvas → Inspiration"],
        fillGuidance:
          "Capturer les personnes, modèles, environnements ou façons de travailler qui inspirent le Worker.",
      },
      {
        text: "Quel type de parcours ou de personne te donne envie d’avancer ?",
        canvasBlocks: ["Purpose Canvas → Inspiration", "Purpose Canvas → Aspiration"],
        fillGuidance:
          "Inspiration pour le modèle. Aspiration si le Worker se projette vers ce type de trajectoire.",
      },
      {
        text: "Qu’est-ce qui te rappelle pourquoi tu veux progresser ?",
        canvasBlocks: ["Purpose Canvas → Inspiration", "Purpose Canvas → Vocation"],
        fillGuidance:
          "Inspiration si la réponse nourrit l’élan. Vocation si elle révèle une contribution profonde.",
      },
      {
        text: "Quelles activités te donnent naturellement de l’énergie ?",
        canvasBlocks: ["Purpose Canvas → Passion"],
        fillGuidance:
          "Identifier les activités qui génèrent énergie, plaisir ou engagement naturel.",
      },
      {
        text: "Qu’est-ce que tu pourrais faire longtemps sans te sentir vidé ?",
        canvasBlocks: ["Purpose Canvas → Passion"],
        fillGuidance:
          "Utiliser la réponse pour repérer les activités durablement énergisantes.",
      },
      {
        text: "Dans ton travail, quels moments te plaisent vraiment ?",
        canvasBlocks: ["Purpose Canvas → Passion", "Significance Canvas → Hobby"],
        fillGuidance:
          "Passion pour l’énergie profonde. Hobby si la réponse montre une activité vécue comme plaisir ou choix libre.",
      },
      {
        text: "À quoi aimerais-tu contribuer au fond ?",
        canvasBlocks: ["Purpose Canvas → Vocation"],
        fillGuidance:
          "Formuler la contribution profonde que le Worker souhaite porter.",
      },
      {
        text: "Quel problème aimerais-tu aider à résoudre autour de toi ?",
        canvasBlocks: ["Purpose Canvas → Vocation", "Engagement Canvas → But"],
        fillGuidance:
          "Vocation si la réponse touche la contribution profonde. But si elle décrit une finalité professionnelle concrète.",
      },
      {
        text: "Qu’as-tu besoin d’apprendre, renforcer ou développer pour avancer ?",
        canvasBlocks: ["Purpose Canvas → Formation"],
        fillGuidance:
          "Identifier les compétences, comportements ou apprentissages nécessaires.",
      },
    ],
    examples: [
      {
        label: "Travail réel",
        weak: "Je fais mon travail habituel.",
        strong:
          "Je passe beaucoup de temps à clarifier les demandes, coordonner les équipes et résoudre les incompréhensions entre métiers et IT.",
      },
      {
        label: "Aspiration",
        weak: "Je veux évoluer.",
        strong:
          "J’aimerais évoluer vers un rôle où je peux influencer davantage les décisions et moins subir les urgences.",
      },
      {
        label: "Inspiration",
        weak: "Je suis inspiré par les bons leaders.",
        strong:
          "Je suis inspiré par des personnes capables de rester calmes, structurées et influentes dans des environnements complexes.",
      },
      {
        label: "Passion",
        weak: "J’aime bien résoudre des problèmes.",
        strong:
          "Ce qui me donne de l’énergie, c’est d’analyser un problème confus, trouver une logique simple et aider les autres à mieux comprendre.",
      },
      {
        label: "Formation",
        weak: "Je dois me former.",
        strong:
          "Je dois renforcer ma capacité à prioriser, dire non et structurer mes décisions de manière plus visible.",
      },
    ],
    checklist: [
      "Le travail réel est décrit concrètement.",
      "L’aspiration est spécifique.",
      "Les sources d’énergie sont identifiées.",
      "Les tensions d’alignement sont visibles.",
      "Un besoin de développement est formulé.",
    ],
  },
  {
    id: "significance-canvas",
    type: "canvas",
    title: "5. Significance Canvas",
    subtitle: "Comprendre la relation du worker à son travail.",
    objective:
      "Identifier si le travail est vécu comme une raison, un métier, une occupation, une corvée ou un hobby.",
    mindset:
      "Deux workers peuvent avoir le même job mais une relation totalement différente à leur travail. Il faut comprendre ce que le travail représente pour chacun.",
    content: [
      "Repérer les signaux de sens, de maîtrise, de routine, de contrainte ou de plaisir.",
      "Comprendre si le travail nourrit ou épuise le worker.",
      "Adapter ensuite les recommandations selon la perception dominante.",
    ],
    questions: [
      {
        text: "Est-ce que ton travail te donne du sens aujourd’hui ?",
        canvasBlocks: ["Significance Canvas → Raison"],
        fillGuidance:
          "Remplir Raison si le Worker relie son travail à du sens, une contribution ou une direction de vie.",
      },
      {
        text: "As-tu le sentiment que ton travail contribue à quelque chose d’important ?",
        canvasBlocks: ["Significance Canvas → Raison", "Purpose Canvas → Vocation"],
        fillGuidance:
          "Raison pour la perception du sens. Vocation si la réponse révèle une contribution profonde.",
      },
      {
        text: "Quand ton travail est réussi, qu’est-ce que cela signifie pour toi ?",
        canvasBlocks: ["Significance Canvas → Raison", "Engagement Canvas → But"],
        fillGuidance:
          "Raison pour la signification personnelle. But si la réponse décrit l’effet concret du travail.",
      },
      {
        text: "As-tu le sentiment d’exercer un vrai métier ou simplement d’occuper une fonction ?",
        canvasBlocks: ["Significance Canvas → Métier", "Significance Canvas → Occupation"],
        fillGuidance:
          "Métier si la réponse parle de maîtrise/expertise. Occupation si le travail est surtout vu comme fonction ou routine.",
      },
      {
        text: "Dans quoi veux-tu devenir meilleur professionnellement ?",
        canvasBlocks: ["Significance Canvas → Métier", "Purpose Canvas → Formation"],
        fillGuidance:
          "Métier pour la maîtrise. Formation pour les compétences à développer.",
      },
      {
        text: "Quelle expertise aimerais-tu renforcer ou faire reconnaître ?",
        canvasBlocks: ["Significance Canvas → Métier"],
        fillGuidance:
          "Utiliser la réponse pour identifier le rapport du Worker à son expertise professionnelle.",
      },
      {
        text: "Ton travail te donne-t-il surtout une structure quotidienne ?",
        canvasBlocks: ["Significance Canvas → Occupation"],
        fillGuidance:
          "Remplir Occupation si le travail est décrit comme une routine ou un cadre plus que comme une source d’élan.",
      },
      {
        text: "As-tu parfois le sentiment d’être en pilote automatique ?",
        canvasBlocks: ["Significance Canvas → Occupation", "Significance Canvas → Corvée"],
        fillGuidance:
          "Occupation si le Worker parle de routine neutre. Corvée si la réponse exprime rejet, fatigue ou contrainte.",
      },
      {
        text: "Qu’est-ce qui occupe ton temps sans vraiment t’engager ?",
        canvasBlocks: ["Significance Canvas → Occupation", "Time Canvas → Time Constraints"],
        fillGuidance:
          "Occupation pour les tâches peu engageantes. Time Constraints si elles consomment du temps et limitent l’exécution.",
      },
      {
        text: "Qu’est-ce qui te pèse le plus dans ton travail ?",
        canvasBlocks: ["Significance Canvas → Corvée"],
        fillGuidance:
          "Remplir Corvée si la réponse exprime charge, contrainte, rejet ou fatigue.",
      },
      {
        text: "As-tu parfois le sentiment de subir ton travail ?",
        canvasBlocks: ["Significance Canvas → Corvée"],
        fillGuidance:
          "Capturer les éléments vécus comme subis, imposés ou démotivants.",
      },
      {
        text: "Quelles situations te donnent envie de décrocher ?",
        canvasBlocks: ["Significance Canvas → Corvée", "Time Canvas → Risks"],
        fillGuidance:
          "Corvée pour le vécu négatif. Risks si la réponse indique un risque de décrochage ou non-exécution.",
      },
      {
        text: "Quelles activités ferais-tu même sans pression externe ?",
        canvasBlocks: ["Significance Canvas → Hobby", "Purpose Canvas → Passion"],
        fillGuidance:
          "Hobby si l’activité est vécue comme plaisir libre. Passion si elle donne une énergie profonde.",
      },
      {
        text: "Y a-t-il une partie de ton travail qui ressemble à un plaisir ou à une activité choisie ?",
        canvasBlocks: ["Significance Canvas → Hobby", "Purpose Canvas → Passion"],
        fillGuidance:
          "Remplir Hobby pour la dimension plaisir. Remplir Passion si cela révèle une source d’énergie durable.",
      },
      {
        text: "Qu’est-ce que tu fais naturellement avec curiosité, envie ou enthousiasme ?",
        canvasBlocks: ["Significance Canvas → Hobby", "Purpose Canvas → Passion"],
        fillGuidance:
          "Identifier les activités spontanées, choisies ou énergisantes.",
      },
    ],
    examples: [
      {
        label: "Travail vécu comme raison",
        weak: "Mon travail a du sens.",
        strong:
          "Mon travail a du sens quand je vois que mes actions aident réellement les autres à avancer avec plus de clarté et moins de stress.",
      },
      {
        label: "Travail vécu comme métier",
        weak: "Je veux être meilleur.",
        strong:
          "Je veux mieux maîtriser mon domaine pour être reconnu comme une personne fiable sur les sujets complexes.",
      },
      {
        label: "Travail vécu comme occupation",
        weak: "Je fais ce qu’on me demande.",
        strong:
          "Mon travail structure mes journées, mais j’ai parfois l’impression d’être en pilote automatique sans vraie progression.",
      },
      {
        label: "Travail vécu comme corvée",
        weak: "Je n’aime plus mon travail.",
        strong:
          "Ce qui me pèse le plus, c’est d’avoir l’impression de subir des demandes sans marge de décision.",
      },
      {
        label: "Travail vécu comme hobby",
        weak: "Il y a des choses que j’aime.",
        strong:
          "Même sans pression externe, je continuerais à analyser des situations complexes et à chercher des solutions plus simples.",
      },
    ],
    checklist: [
      "La perception dominante du travail est identifiée.",
      "Les signaux de contrainte ou de sens sont visibles.",
      "La recommandation peut être adaptée à cette perception.",
    ],
  },
  {
    id: "time-canvas",
    type: "canvas",
    title: "6. Time Canvas",
    subtitle: "Vérifier la capacité réelle d’exécution.",
    objective:
      "Transformer les intentions en plan d’exécution réaliste, compatible avec le temps, l’énergie, les contraintes et les priorités du worker.",
    mindset:
      "Une bonne action qui ne peut pas être exécutée devient une frustration supplémentaire. Le Time Canvas sert à rendre l’action faisable.",
    content: [
      "Identifier le temps réellement disponible.",
      "Repérer les contraintes et les risques.",
      "Tenir compte du rythme d’énergie du worker.",
      "Définir des rituels simples d’exécution.",
    ],
    questions: [
      {
        text: "Combien de temps peux-tu réellement consacrer à cette action ?",
        canvasBlocks: ["Time Canvas → Available Time"],
        fillGuidance:
          "Capturer une disponibilité réaliste, idéalement exprimée en durée ou fréquence.",
      },
      {
        text: "À quels moments de la semaine peux-tu avancer sans trop de friction ?",
        canvasBlocks: ["Time Canvas → Available Time", "Time Canvas → Execution Rituals"],
        fillGuidance:
          "Available Time pour les créneaux. Execution Rituals si le Worker propose un rythme récurrent.",
      },
      {
        text: "Quel créneau serait le plus réaliste pour toi ?",
        canvasBlocks: ["Time Canvas → Available Time"],
        fillGuidance:
          "Transformer la réponse en créneau concret exploitable.",
      },
      {
        text: "Qu’est-ce qui limite ton temps aujourd’hui ?",
        canvasBlocks: ["Time Canvas → Time Constraints"],
        fillGuidance:
          "Capturer les contraintes horaires, charge de travail, obligations ou interruptions.",
      },
      {
        text: "Quelles obligations risquent de bloquer ton exécution ?",
        canvasBlocks: ["Time Canvas → Time Constraints", "Time Canvas → Risks"],
        fillGuidance:
          "Constraints pour les obligations. Risks si elles peuvent empêcher l’action.",
      },
      {
        text: "Quels moments sont impossibles pour toi ?",
        canvasBlocks: ["Time Canvas → Time Constraints"],
        fillGuidance:
          "Identifier les plages à éviter pour construire un plan réaliste.",
      },
      {
        text: "À quel moment de la journée as-tu le plus d’énergie ?",
        canvasBlocks: ["Time Canvas → Energy Rhythm"],
        fillGuidance:
          "Capturer les moments d’énergie haute pour positionner les actions importantes.",
      },
      {
        text: "Quand es-tu le moins disponible mentalement ?",
        canvasBlocks: ["Time Canvas → Energy Rhythm", "Time Canvas → Time Constraints"],
        fillGuidance:
          "Energy Rhythm pour les baisses d’énergie. Constraints si elles imposent des limites de planification.",
      },
      {
        text: "Quel type d’action convient le mieux à ton niveau d’énergie actuel ?",
        canvasBlocks: ["Time Canvas → Energy Rhythm", "Time Canvas → Priorities"],
        fillGuidance:
          "Relier l’action au niveau d’énergie et à la priorité réelle.",
      },
      {
        text: "Quel rituel simple pourrait t’aider à avancer régulièrement ?",
        canvasBlocks: ["Time Canvas → Execution Rituals"],
        fillGuidance:
          "Décrire une routine simple, répétable et compatible avec le quotidien du Worker.",
      },
      {
        text: "Comment peux-tu te rappeler de passer à l’action ?",
        canvasBlocks: ["Time Canvas → Execution Rituals", "Time Canvas → Risks"],
        fillGuidance:
          "Execution Rituals pour le rappel. Risks si l’oubli ou la dispersion est un risque explicite.",
      },
      {
        text: "Quel moment fixe peux-tu réserver chaque semaine ?",
        canvasBlocks: ["Time Canvas → Execution Rituals", "Time Canvas → Available Time"],
        fillGuidance:
          "Utiliser la réponse pour créer un rythme d’exécution récurrent.",
      },
      {
        text: "Qu’est-ce qui est vraiment prioritaire maintenant ?",
        canvasBlocks: ["Time Canvas → Priorities"],
        fillGuidance:
          "Capturer l’arbitrage prioritaire qui doit guider l’exécution.",
      },
      {
        text: "Qu’est-ce qui pourrait t’empêcher d’exécuter cette action ?",
        canvasBlocks: ["Time Canvas → Risks"],
        fillGuidance:
          "Identifier les risques concrets de non-exécution, surcharge ou abandon.",
      },
      {
        text: "Que faut-il simplifier pour rendre l’action faisable ?",
        canvasBlocks: [
          "Time Canvas → Risks",
          "Time Canvas → Priorities",
          "Engagement Canvas → Actions",
        ],
        fillGuidance:
          "Risks pour ce qui bloque. Priorities pour l’arbitrage. Actions si la réponse permet de reformuler une action plus simple.",
      },
    ],
    examples: [
      {
        label: "Temps disponible",
        weak: "Je vais essayer de le faire.",
        strong:
          "Je vais y consacrer 45 minutes le mardi matin et 45 minutes le jeudi matin, avant l’ouverture de mes réunions.",
      },
      {
        label: "Contraintes temporelles",
        weak: "Je n’ai pas beaucoup de temps.",
        strong:
          "Mes contraintes principales sont les réunions imprévues l’après-midi et les urgences opérationnelles en fin de journée.",
      },
      {
        label: "Rythme d’énergie",
        weak: "Je suis souvent fatigué.",
        strong:
          "J’ai plus d’énergie le matin entre 8h30 et 10h30 ; après 16h, je peux gérer des tâches simples mais pas des décisions importantes.",
      },
      {
        label: "Rituel d’exécution",
        weak: "Je vais essayer d’être régulier.",
        strong:
          "Chaque lundi matin, je vais choisir une action prioritaire et bloquer un créneau fixe pour avancer dessus avant les demandes externes.",
      },
      {
        label: "Risque de non-exécution",
        weak: "Je risque d’oublier.",
        strong:
          "Le risque principal est que les urgences prennent le dessus ; je vais donc inscrire le créneau dans mon agenda et prévenir mon équipe.",
      },
    ],
    checklist: [
      "Le temps disponible est réaliste.",
      "Les contraintes sont explicites.",
      "Les risques de non-exécution sont identifiés.",
      "Un rituel simple est défini.",
    ],
  },
  {
    id: "follow-up",
    type: "practice",
    title: "7. Suivre et ajuster",
    subtitle: "Transformer le coaching en progression continue.",
    objective:
      "S’assurer que les actions avancent réellement, que les recommandations restent pertinentes et que le worker reste en mouvement.",
    mindset:
      "Le suivi ne sert pas à contrôler le worker, mais à l’aider à apprendre, ajuster et continuer.",
    content: [
      "Revenir sur les actions décidées.",
      "Identifier ce qui a été fait, ce qui bloque et ce qui doit être simplifié.",
      "Relire les recommandations, artifacts et levers.",
      "Définir le prochain pas.",
    ],
    questions: [
      { text: "Qu’est-ce qui a avancé depuis la dernière session ?" },
      { text: "Qu’est-ce qui n’a pas avancé comme prévu ?" },
      { text: "Qu’est-ce qui a bloqué concrètement ?" },
      { text: "Qu’est-ce qui doit être simplifié ?" },
      { text: "Quelle action était trop large, trop floue ou trop ambitieuse ?" },
      { text: "Quelle recommandation reste pertinente aujourd’hui ?" },
      { text: "Quel levier ou support pourrait t’aider maintenant ?" },
      { text: "Qu’as-tu appris sur ta manière de travailler depuis la dernière session ?" },
      { text: "Quelle décision devons-nous ajuster ou confirmer ?" },
      { text: "Quel est le prochain petit pas concret à poser ?" },
    ],
    examples: [
      {
        label: "Suivi d’action",
        weak: "Je n’ai pas vraiment avancé.",
        strong:
          "Je n’ai pas avancé parce que l’action était trop large. Je peux la réduire à une première tâche de 30 minutes cette semaine.",
      },
      {
        label: "Identifier un blocage",
        weak: "Ça n’a pas marché.",
        strong:
          "Ça n’a pas marché parce que je n’avais pas réservé de créneau précis et que les urgences ont repris le dessus.",
      },
      {
        label: "Ajuster une action",
        weak: "Je vais réessayer.",
        strong:
          "Je vais réduire l’action initiale : au lieu de revoir toute mon organisation, je vais commencer par lister mes trois priorités du lundi.",
      },
      {
        label: "Capitaliser sur un progrès",
        weak: "Ça va un peu mieux.",
        strong:
          "Ça va mieux parce que j’ai protégé deux créneaux cette semaine et j’ai terminé une tâche importante avant qu’elle devienne urgente.",
      },
      {
        label: "Définir le prochain pas",
        weak: "Je continue comme ça.",
        strong:
          "Le prochain pas est de maintenir le rituel du lundi matin et d’ajouter une revue rapide le vendredi pour voir ce qui a réellement avancé.",
      },
    ],
    checklist: [
      "Le progrès est vérifié.",
      "Le blocage est compris.",
      "L’action est ajustée si nécessaire.",
      "Un prochain pas concret est défini.",
    ],
  },
];

function getTypeLabel(type: GuideSectionType): string {
  if (type === "stage") return "Étape";
  if (type === "canvas") return "Canvas";
  return "Pratique";
}

function getTypeStyle(type: GuideSectionType): {
  background: string;
  border: string;
  color: string;
  softBackground: string;
} {
  if (type === "stage") {
    return {
      background: "rgba(59,130,246,0.10)",
      border: "1px solid rgba(59,130,246,0.22)",
      color: "#1d4ed8",
      softBackground: "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(255,255,255,0.96))",
    };
  }

  if (type === "canvas") {
    return {
      background: "rgba(124,58,237,0.09)",
      border: "1px solid rgba(124,58,237,0.22)",
      color: "#6d28d9",
      softBackground: "linear-gradient(135deg, rgba(124,58,237,0.09), rgba(255,255,255,0.96))",
    };
  }

  return {
    background: "rgba(34,197,94,0.09)",
    border: "1px solid rgba(34,197,94,0.22)",
    color: "#15803d",
    softBackground: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(255,255,255,0.96))",
  };
}

function GuideTypeBadge({ type }: { type: GuideSectionType }) {
  const typeStyle = getTypeStyle(type);

  return (
    <span
      style={{
        borderRadius: 999,
        padding: "7px 10px",
        fontSize: 11,
        fontWeight: 900,
        background: typeStyle.background,
        border: typeStyle.border,
        color: typeStyle.color,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {getTypeLabel(type)}
    </span>
  );
}

function GuideTree({
  nodes,
  activeNodeId,
  onSelect,
}: {
  nodes: GuideNode[];
  activeNodeId: string;
  onSelect: (id: string) => void;
}) {
  const stages = nodes.filter((node) => node.type === "stage");
  const canvases = nodes.filter((node) => node.type === "canvas");
  const practices = nodes.filter((node) => node.type === "practice");

  const groups = [
    {
      title: "Parcours de coaching",
      items: stages,
    },
    {
      title: "Canvas à utiliser",
      items: canvases,
    },
    {
      title: "Suivi & pratique",
      items: practices,
    },
  ];

  return (
    <div
      className="card stack"
      style={{
        gap: 14,
        position: "sticky",
        top: 96,
        maxHeight: "calc(100vh - 120px)",
        overflow: "hidden",
      }}
    >
      <div className="stack" style={{ gap: 4 }}>
        <div className="section-title">Guide numérique</div>
        <div className="muted">
          Sélectionne une étape pour afficher son contenu, ses questions, ses exemples et sa
          check-list.
        </div>
      </div>

      <div
        className="stack"
        style={{
          gap: 14,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 4,
        }}
      >
        {groups.map((group) => (
          <div key={group.title} className="stack" style={{ gap: 8 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted-foreground, #64748b)",
                paddingLeft: 2,
              }}
            >
              {group.title}
            </div>

            <div className="stack" style={{ gap: 6 }}>
              {group.items.map((node) => {
                const isActive = node.id === activeNodeId;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => onSelect(node.id)}
                    className="card-soft"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      border: isActive
                        ? "1px solid rgba(37,99,235,0.35)"
                        : "1px solid var(--border)",
                      background: isActive ? "rgba(59,130,246,0.07)" : "rgba(255,255,255,0.78)",
                      padding: 12,
                      boxShadow: isActive ? "0 10px 28px rgba(37,99,235,0.10)" : "none",
                    }}
                  >
                    <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <GuideTypeBadge type={node.type} />
                    </div>

                    <div style={{ fontWeight: 850, lineHeight: 1.3 }}>{node.title}</div>

                    <div
                      className="muted"
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        lineHeight: 1.45,
                      }}
                    >
                      {node.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuideNodeContent({
  node,
  previousNode,
  nextNode,
  onSelect,
}: {
  node: GuideNode;
  previousNode: GuideNode | null;
  nextNode: GuideNode | null;
  onSelect: (id: string) => void;
}) {
  const typeStyle = getTypeStyle(node.type);

  return (
    <div className="stack" style={{ gap: 16, minWidth: 0 }}>
      <div
        className="card stack"
        style={{
          gap: 12,
          border: typeStyle.border,
          background: typeStyle.softBackground,
        }}
      >
        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <GuideTypeBadge type={node.type} />
            <span className="badge">{node.questions.length} questions</span>
            <span className="badge">{node.examples.length} examples</span>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {previousNode ? (
              <button
                className="button ghost"
                type="button"
                onClick={() => onSelect(previousNode.id)}
              >
                Previous
              </button>
            ) : null}

            {nextNode ? (
              <button className="button" type="button" onClick={() => onSelect(nextNode.id)}>
                Next
              </button>
            ) : null}
          </div>
        </div>

        <div className="section-title" style={{ fontSize: 28, lineHeight: 1.1 }}>
          {node.title}
        </div>

        <div className="muted" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 980 }}>
          {node.subtitle}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        <div className="card stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 16 }}>
            Objectif
          </div>
          <div className="muted" style={{ lineHeight: 1.65 }}>
            {node.objective}
          </div>
        </div>

        <div
          className="card stack"
          style={{
            gap: 8,
            border: "1px solid rgba(245,158,11,0.22)",
            background: "rgba(245,158,11,0.07)",
          }}
        >
          <div className="section-title" style={{ fontSize: 16 }}>
            Mindset coach
          </div>
          <div className="muted" style={{ lineHeight: 1.65 }}>
            {node.mindset}
          </div>
        </div>
      </div>

      <div className="card stack" style={{ gap: 12 }}>
        <div className="section-title">Contenu didactique</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          {node.content.map((item, index) => (
            <div
              key={`${node.id}-content-${index}`}
              className="card-soft"
              style={{
                lineHeight: 1.55,
                color: "var(--muted-foreground, #64748b)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="card stack" style={{ gap: 12 }}>
        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="section-title">Questions à poser</div>
          <span className="badge">{node.questions.length} questions</span>
        </div>

        <div className="stack" style={{ gap: 8 }}>
          {node.questions.map((question, index) => (
            <div
              key={`${node.id}-${index}-${question.text}`}
              className="card-soft"
              style={{
                display: "grid",
                gridTemplateColumns: "42px minmax(0, 1fr)",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  color: typeStyle.color,
                  background: typeStyle.background,
                  border: typeStyle.border,
                }}
              >
                {index + 1}
              </div>

              <div className="stack" style={{ gap: 8, minWidth: 0 }}>
                <div style={{ lineHeight: 1.55 }}>{question.text}</div>

                {question.canvasBlocks?.length ? (
                  <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                    {question.canvasBlocks.map((block) => (
                      <span
                        key={`${node.id}-${index}-${block}`}
                        style={{
                          borderRadius: 999,
                          padding: "6px 9px",
                          fontSize: 11,
                          fontWeight: 850,
                          background: "rgba(15,23,42,0.05)",
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                      >
                        À renseigner : {block}
                      </span>
                    ))}
                  </div>
                ) : null}

                {question.fillGuidance ? (
                  <div
                    className="muted"
                    style={{
                      lineHeight: 1.5,
                      fontSize: 13,
                      borderLeft: "3px solid rgba(59,130,246,0.35)",
                      paddingLeft: 10,
                    }}
                  >
                    {question.fillGuidance}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card stack" style={{ gap: 12 }}>
        <div className="section-title">Exemples illustratifs</div>

        <div className="stack" style={{ gap: 12 }}>
          {node.examples.map((example) => (
            <div key={example.label} className="card-soft stack" style={{ gap: 10 }}>
              <div className="section-title" style={{ fontSize: 16 }}>
                {example.label}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: example.weak
                    ? "repeat(auto-fit, minmax(260px, 1fr))"
                    : "1fr",
                  gap: 10,
                }}
              >
                {example.weak ? (
                  <div
                    style={{
                      borderRadius: 14,
                      padding: 12,
                      background: "rgba(239,68,68,0.07)",
                      border: "1px solid rgba(239,68,68,0.18)",
                    }}
                  >
                    <strong>Réponse trop vague</strong>
                    <div className="muted" style={{ marginTop: 6, lineHeight: 1.55 }}>
                      {example.weak}
                    </div>
                  </div>
                ) : null}

                <div
                  style={{
                    borderRadius: 14,
                    padding: 12,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.20)",
                  }}
                >
                  <strong>Réponse exploitable</strong>
                  <div className="muted" style={{ marginTop: 6, lineHeight: 1.55 }}>
                    {example.strong}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="card stack"
        style={{
          gap: 12,
          border: "1px solid rgba(34,197,94,0.22)",
          background: "rgba(34,197,94,0.06)",
        }}
      >
        <div className="section-title">Check-list de validation</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}
        >
          {node.checklist.map((item) => (
            <label
              key={item}
              className="card-soft row"
              style={{
                gap: 8,
                alignItems: "flex-start",
                cursor: "pointer",
              }}
            >
              <input type="checkbox" style={{ marginTop: 3 }} />
              <span className="muted" style={{ lineHeight: 1.45 }}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoachingGuideContent() {
  const [activeNodeId, setActiveNodeId] = useState(GUIDE_NODES[0].id);

  const activeNodeIndex = useMemo(() => {
    const index = GUIDE_NODES.findIndex((node) => node.id === activeNodeId);
    return index >= 0 ? index : 0;
  }, [activeNodeId]);

  const activeNode = GUIDE_NODES[activeNodeIndex] ?? GUIDE_NODES[0];
  const previousNode = activeNodeIndex > 0 ? GUIDE_NODES[activeNodeIndex - 1] : null;
  const nextNode =
    activeNodeIndex < GUIDE_NODES.length - 1 ? GUIDE_NODES[activeNodeIndex + 1] : null;

  const totalQuestions = useMemo(() => {
    return GUIDE_NODES.reduce((total, node) => total + node.questions.length, 0);
  }, []);

  const canvasCount = useMemo(() => {
    return GUIDE_NODES.filter((node) => node.type === "canvas").length;
  }, []);

  const progressPercent = Math.round(((activeNodeIndex + 1) / GUIDE_NODES.length) * 100);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div
        className="card stack"
        style={{
          gap: 14,
          border: "1px solid rgba(59,130,246,0.20)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))",
          color: "white",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -90,
            top: -90,
            width: 260,
            height: 260,
            borderRadius: 999,
            background: "rgba(59,130,246,0.22)",
            filter: "blur(4px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "45%",
            bottom: -120,
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "rgba(124,58,237,0.18)",
            filter: "blur(5px)",
          }}
        />

        <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
          <span
            style={{
              borderRadius: 999,
              padding: "8px 12px",
              background: "rgba(255,255,255,0.12)",
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Digital coaching guide
          </span>

          <span
            style={{
              borderRadius: 999,
              padding: "8px 12px",
              background: "rgba(59,130,246,0.32)",
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Organization enablement
          </span>
        </div>

        <div
          style={{
            fontSize: 34,
            lineHeight: 1.08,
            fontWeight: 950,
            position: "relative",
          }}
        >
          LeanWorker Coaching Guide
        </div>

        <div
          style={{
            maxWidth: 960,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.74)",
            position: "relative",
          }}
        >
          Un parcours simple et structuré pour aider l’Organization à mener un coaching worker :
          étapes, contenus, questions à poser, exemples de réponses et mindsets coach.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            position: "relative",
          }}
        >
          {[
            { label: "Étapes & pratiques", value: GUIDE_NODES.length },
            { label: "Canvas guides", value: canvasCount },
            { label: "Questions", value: totalQuestions },
            { label: "Progression", value: `${progressPercent}%` },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                borderRadius: 16,
                padding: 12,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
                {metric.label}
              </div>
              <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900 }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 360px) minmax(0, 1fr)",
          gap: 18,
          alignItems: "flex-start",
          minWidth: 0,
        }}
      >
        <GuideTree nodes={GUIDE_NODES} activeNodeId={activeNode.id} onSelect={setActiveNodeId} />

        <GuideNodeContent
          node={activeNode}
          previousNode={previousNode}
          nextNode={nextNode}
          onSelect={setActiveNodeId}
        />
      </div>
    </div>
  );
}

function AdminCoachingGuideContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const me = await getAdminMe();
        setAdmin(me);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin profile.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <AdminShell
      activeHref="/admin/coaching-guide"
      title="Coaching Guide"
      subtitle="Tree-based digital guide for organization-led worker coaching."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {error ? (
        <div className="card" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="card stack" style={{ gap: 10 }}>
          <div className="section-title">Loading coaching guide...</div>
          <div className="muted">Preparing the organization coaching enablement workspace.</div>
        </div>
      ) : (
        <CoachingGuideContent />
      )}
    </AdminShell>
  );
}

export default function AdminCoachingGuidePage() {
  return (
    <AdminGuard>
      <AdminCoachingGuideContent />
    </AdminGuard>
  );
}