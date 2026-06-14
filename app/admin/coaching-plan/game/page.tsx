// frontend/app/admin/coaching-plan/game/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { getAdminMe } from "@/lib/api";
import type { AdminMe } from "@/lib/types";

type GameImageKey =
  | "zipper_merge"
  | "road_code"
  | "driving_school"
  | "driving_license"
  | "car_configurator"
  | "route_map"
  | "car_road"
  | "driver"
  | "traffic_jam"
  | "gps_roadkill"
  | "open_road"
  | "direction_signs";

type CorrectionGroupTone = "red" | "orange" | "blue" | "purple";

type GameImage = {
  key: GameImageKey;
  title: string;
  coachLabel: string;
  imageSrc: string;
  correctOrder: number;
  correctionGroup: "clarification" | "apprentissage" | "configuration" | "pilotage";
};

type CorrectionGroup = {
  id: GameImage["correctionGroup"];
  orderLabel: string;
  title: string;
  tone: CorrectionGroupTone;
  explanation: string;
  imageKeys: GameImageKey[];
};

const GAME_IMAGES: GameImage[] = [
  {
    key: "zipper_merge",
    title: "Principe de la tirette",
    coachLabel: "Clarifier la règle du jeu",
    imageSrc: "/coaching-plan/game/zipper-merge.png",
    correctOrder: 1,
    correctionGroup: "clarification",
  },
  {
    key: "road_code",
    title: "Code de la route",
    coachLabel: "Apprendre les règles",
    imageSrc: "/coaching-plan/game/road-code.png",
    correctOrder: 2,
    correctionGroup: "apprentissage",
  },
  {
    key: "driving_school",
    title: "Auto-école",
    coachLabel: "Être accompagné dans l’apprentissage",
    imageSrc: "/coaching-plan/game/driving-school.png",
    correctOrder: 3,
    correctionGroup: "apprentissage",
  },
  {
    key: "driving_license",
    title: "Permis de conduire",
    coachLabel: "Obtenir l’autorisation de conduire",
    imageSrc: "/coaching-plan/game/driving-license.png",
    correctOrder: 4,
    correctionGroup: "apprentissage",
  },
  {
    key: "car_configurator",
    title: "Configuration du véhicule",
    coachLabel: "Choisir l’outil adapté",
    imageSrc: "/coaching-plan/game/car-configurator.png",
    correctOrder: 5,
    correctionGroup: "configuration",
  },
  {
    key: "route_map",
    title: "Carte du trajet",
    coachLabel: "Définir l’itinéraire",
    imageSrc: "/coaching-plan/game/route-map.png",
    correctOrder: 6,
    correctionGroup: "configuration",
  },
  {
    key: "car_road",
    title: "Voiture sur la route",
    coachLabel: "Entrer dans l’exécution",
    imageSrc: "/coaching-plan/game/car-road.png",
    correctOrder: 7,
    correctionGroup: "configuration",
  },
  {
    key: "driver",
    title: "Conducteur au volant",
    coachLabel: "Piloter activement",
    imageSrc: "/coaching-plan/game/driver.png",
    correctOrder: 8,
    correctionGroup: "pilotage",
  },
  {
    key: "traffic_jam",
    title: "Embouteillage",
    coachLabel: "Gérer les contraintes",
    imageSrc: "/coaching-plan/game/traffic-jam.png",
    correctOrder: 9,
    correctionGroup: "pilotage",
  },
  {
    key: "gps_roadkill",
    title: "GPS et alerte",
    coachLabel: "Lire les signaux du terrain",
    imageSrc: "/coaching-plan/game/gps-roadkill.png",
    correctOrder: 10,
    correctionGroup: "pilotage",
  },
  {
    key: "open_road",
    title: "Route ouverte",
    coachLabel: "Avancer avec trajectoire",
    imageSrc: "/coaching-plan/game/open-road.png",
    correctOrder: 11,
    correctionGroup: "pilotage",
  },
  {
    key: "direction_signs",
    title: "Panneaux directionnels",
    coachLabel: "Ajuster la direction",
    imageSrc: "/coaching-plan/game/direction-signs.png",
    correctOrder: 12,
    correctionGroup: "pilotage",
  },
];

const INITIAL_WORKER_ORDER: GameImageKey[] = [
  "road_code",
  "direction_signs",
  "gps_roadkill",
  "driver",
  "car_road",
  "traffic_jam",
  "open_road",
  "driving_school",
  "zipper_merge",
  "driving_license",
  "route_map",
  "car_configurator",
];

const CORRECTION_GROUPS: CorrectionGroup[] = [
  {
    id: "clarification",
    orderLabel: "0",
    title: "Clarification",
    tone: "red",
    explanation:
      "Avant de conduire, il faut comprendre la règle. Dans le coaching, cette étape correspond à la clarification de la situation du Worker, du cadre, des tensions et de l’intention de départ.",
    imageKeys: ["zipper_merge"],
  },
  {
    id: "apprentissage",
    orderLabel: "1",
    title: "Apprentissage",
    tone: "orange",
    explanation:
      "Le Worker doit ensuite apprendre les principes qui rendent l’action possible : règles, méthode, accompagnement et autorisation progressive à agir autrement.",
    imageKeys: ["road_code", "driving_school", "driving_license"],
  },
  {
    id: "configuration",
    orderLabel: "2",
    title: "Configuration",
    tone: "blue",
    explanation:
      "Une fois les bases comprises, il faut configurer le système : choisir le bon véhicule, définir la route et préparer les conditions d’exécution.",
    imageKeys: ["car_configurator", "route_map", "car_road"],
  },
  {
    id: "pilotage",
    orderLabel: "3",
    title: "Pilotage",
    tone: "purple",
    explanation:
      "Le coaching mène ensuite au pilotage réel : conduire, gérer les obstacles, lire les signaux, ajuster la trajectoire et continuer malgré les contraintes.",
    imageKeys: ["driver", "traffic_jam", "gps_roadkill", "open_road", "direction_signs"],
  },
];

function getToneStyle(tone: CorrectionGroupTone) {
  if (tone === "red") {
    return {
      accent: "#dc2626",
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.22)",
    };
  }

  if (tone === "orange") {
    return {
      accent: "#ea580c",
      background: "rgba(249,115,22,0.08)",
      border: "1px solid rgba(249,115,22,0.22)",
    };
  }

  if (tone === "blue") {
    return {
      accent: "#2563eb",
      background: "rgba(37,99,235,0.08)",
      border: "1px solid rgba(37,99,235,0.22)",
    };
  }

  return {
    accent: "#9333ea",
    background: "rgba(147,51,234,0.08)",
    border: "1px solid rgba(147,51,234,0.22)",
  };
}

function getImageByKey(key: GameImageKey): GameImage {
  return GAME_IMAGES.find((image) => image.key === key) ?? GAME_IMAGES[0];
}

function CoachingPlanBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "dark" | CorrectionGroupTone;
}) {
  const style =
    tone === "dark"
      ? {
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.14)",
          color: "rgba(255,255,255,0.88)",
        }
      : tone === "neutral"
        ? {
            background: "rgba(15,23,42,0.05)",
            border: "1px solid rgba(15,23,42,0.08)",
            color: "#334155",
          }
        : {
            background: getToneStyle(tone).background,
            border: getToneStyle(tone).border,
            color: getToneStyle(tone).accent,
          };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        borderRadius: 999,
        padding: "8px 11px",
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: "0.035em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function GameImageCard({
  image,
  index,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  image: GameImage;
  index: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <article
      className="card-soft stack"
      style={{
        gap: 10,
        padding: 12,
        borderRadius: 20,
        background: "rgba(255,255,255,0.82)",
        border: "1px solid rgba(15,23,42,0.08)",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 10",
          borderRadius: 16,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(226,232,240,0.90), rgba(248,250,252,0.96))",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <img
          src={image.imageSrc}
          alt={image.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 10,
            top: 10,
            width: 34,
            height: 34,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: "rgba(15,23,42,0.86)",
            color: "#ffffff",
            fontWeight: 950,
            boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
          }}
        >
          {index + 1}
        </div>
      </div>

      <div className="stack" style={{ gap: 4 }}>
        <strong>{image.title}</strong>
        <div className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>
          {image.coachLabel}
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <button
          className="button ghost"
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          style={{ minHeight: 34, borderRadius: 999, padding: "7px 10px" }}
        >
          Monter
        </button>

        <button
          className="button ghost"
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          style={{ minHeight: 34, borderRadius: 999, padding: "7px 10px" }}
        >
          Descendre
        </button>
      </div>
    </article>
  );
}

function CorrectionImageCard({ image }: { image: GameImage }) {
  return (
    <div
      className="stack"
      style={{
        gap: 7,
        width: "100%",
        maxWidth: 220,
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 10",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(15,23,42,0.10)",
          background: "#ffffff",
        }}
      >
        <img
          src={image.imageSrc}
          alt={image.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            background: "#ffffff",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 8,
            top: 8,
            width: 28,
            height: 28,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.94)",
            color: "#0f172a",
            fontWeight: 950,
            fontSize: 12,
            boxShadow: "0 8px 18px rgba(15,23,42,0.12)",
          }}
        >
          {image.correctOrder}
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 850, lineHeight: 1.25 }}>
        {image.title}
      </div>
    </div>
  );
}

function moveItem(items: GameImageKey[], fromIndex: number, toIndex: number): GameImageKey[] {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

function shuffleImages(): GameImageKey[] {
  const items = [...INITIAL_WORKER_ORDER];

  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}

function CoachingPlanGameContent() {
  const [workerOrder, setWorkerOrder] = useState<GameImageKey[]>(INITIAL_WORKER_ORDER);
  const [showCorrection, setShowCorrection] = useState(false);

  const orderedImages = useMemo(() => {
    return workerOrder.map(getImageByKey);
  }, [workerOrder]);

  const correctionImages = useMemo(() => {
    return [...GAME_IMAGES].sort((a, b) => a.correctOrder - b.correctOrder);
  }, []);

  const correctPositionCount = useMemo(() => {
    return workerOrder.filter((key, index) => {
      return getImageByKey(key).correctOrder === index + 1;
    }).length;
  }, [workerOrder]);

  function handleMove(index: number, direction: "up" | "down") {
    const nextIndex = direction === "up" ? index - 1 : index + 1;

    if (nextIndex < 0 || nextIndex >= workerOrder.length) return;

    setWorkerOrder((current) => moveItem(current, index, nextIndex));
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <section
        className="card stack"
        style={{
          gap: 16,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(239,68,68,0.20)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(127,29,29,0.90))",
          color: "#ffffff",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -110,
            top: -120,
            width: 310,
            height: 310,
            borderRadius: 999,
            background: "rgba(249,115,22,0.22)",
            filter: "blur(4px)",
          }}
        />

        <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
          <CoachingPlanBadge tone="dark">Coaching Plan</CoachingPlanBadge>
          <CoachingPlanBadge tone="dark">Section 1</CoachingPlanBadge>
          <CoachingPlanBadge tone="dark">Jeu pédagogique</CoachingPlanBadge>
        </div>

        <h1
          style={{
            margin: 0,
            maxWidth: 980,
            fontSize: 40,
            lineHeight: 1.04,
            fontWeight: 950,
            letterSpacing: "-0.065em",
            position: "relative",
          }}
        >
          Le jeu — ordonner les images pour comprendre la logique du coaching
        </h1>

        <p
          style={{
            maxWidth: 980,
            margin: 0,
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.76)",
            position: "relative",
          }}
        >
          Le coach montre 12 images au Worker et lui demande de proposer l’ordre logique. La
          correction permet ensuite d’expliquer que le coaching suit une progression structurée :
          clarification, apprentissage, configuration et pilotage.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            position: "relative",
          }}
        >
          {[
            { label: "Images", value: "12" },
            { label: "Étapes de correction", value: "4" },
            { label: "Bonne position", value: `${correctPositionCount}/12` },
            { label: "Finalité", value: "Engagement" },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                borderRadius: 18,
                padding: 14,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
                {metric.label}
              </div>
              <div style={{ marginTop: 5, fontSize: 22, fontWeight: 900 }}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card stack" style={{ gap: 14 }}>
        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="stack" style={{ gap: 5 }}>
            <div className="section-title">Consigne du jeu</div>
            <div className="muted" style={{ lineHeight: 1.65, maxWidth: 980 }}>
              Demandez au Worker : “Si ces images racontaient le parcours d’une personne qui doit
              apprendre à conduire et atteindre une destination, dans quel ordre les placerais-tu ?”
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button ghost"
              type="button"
              onClick={() => {
                setWorkerOrder(shuffleImages());
                setShowCorrection(false);
              }}
            >
              Mélanger
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() => {
                setWorkerOrder(INITIAL_WORKER_ORDER);
                setShowCorrection(false);
              }}
            >
              Réinitialiser
            </button>

            <button
              className="button"
              type="button"
              onClick={() => setShowCorrection((current) => !current)}
            >
              {showCorrection ? "Masquer la correction" : "Afficher la correction"}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 12,
          }}
        >
          {orderedImages.map((image, index) => (
            <GameImageCard
              key={image.key}
              image={image}
              index={index}
              canMoveUp={index > 0}
              canMoveDown={index < orderedImages.length - 1}
              onMoveUp={() => handleMove(index, "up")}
              onMoveDown={() => handleMove(index, "down")}
            />
          ))}
        </div>
      </section>

      {showCorrection ? (
        <>
          <section
            className="card stack"
            style={{
              gap: 16,
              border: "1px solid rgba(34,197,94,0.20)",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(255,255,255,0.96))",
            }}
          >
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 5 }}>
                <div className="section-title">Correction pédagogique</div>
                <div className="muted" style={{ lineHeight: 1.65, maxWidth: 1040 }}>
                  La correction ne sert pas seulement à donner “la bonne réponse”. Elle permet au
                  coach d’expliquer la structure du coaching et le chemin qui mène à l’engagement.
                </div>
              </div>

              <CoachingPlanBadge tone="neutral">Ordre réel</CoachingPlanBadge>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              {correctionImages.map((image) => (
                <CorrectionImageCard key={image.key} image={image} />
              ))}
            </div>
          </section>

          <section className="card stack" style={{ gap: 16 }}>
            <div className="section-title">Regroupement de la correction</div>

            <div className="stack" style={{ gap: 12 }}>
              {CORRECTION_GROUPS.map((group) => {
                const toneStyle = getToneStyle(group.tone);

                return (
                  <article
                    key={group.id}
                    className="card-soft stack"
                    style={{
                      gap: 12,
                      border: toneStyle.border,
                      background: toneStyle.background,
                    }}
                  >
                    <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                      <div className="row" style={{ gap: 10, alignItems: "center" }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 999,
                            display: "grid",
                            placeItems: "center",
                            background: "#ffffff",
                            border: toneStyle.border,
                            color: toneStyle.accent,
                            fontWeight: 950,
                          }}
                        >
                          {group.orderLabel}
                        </div>

                        <div>
                          <div
                            className="section-title"
                            style={{ fontSize: 19, color: toneStyle.accent }}
                          >
                            {group.title}
                          </div>
                        </div>
                      </div>

                      <CoachingPlanBadge tone={group.tone}>
                        {group.imageKeys.length} image(s)
                      </CoachingPlanBadge>
                    </div>

                    <div className="muted" style={{ lineHeight: 1.65 }}>
                      {group.explanation}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      {group.imageKeys.map((key) => (
                        <CorrectionImageCard key={key} image={getImageByKey(key)} />
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            className="card stack"
            style={{
              gap: 14,
              border: "1px solid rgba(34,197,94,0.22)",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(37,99,235,0.06))",
            }}
          >
            <CoachingPlanBadge tone="neutral">Engagement</CoachingPlanBadge>

            <div className="section-title">Message final à transmettre au Worker</div>

            <div className="muted" style={{ lineHeight: 1.75, maxWidth: 1080 }}>
              “Comme pour la conduite, on ne commence pas par piloter vite. On commence par
              clarifier les règles, apprendre, configurer son système, puis piloter avec attention.
              Le coaching LeanWorker fonctionne de la même manière : nous allons clarifier ta
              situation, apprendre à lire ton rapport au travail, configurer ton engagement, puis
              t’aider à piloter ta trajectoire professionnelle avec cohérence.”
            </div>

            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <Link className="button ghost" href="/admin/coaching-plan">
                Retour au Coaching Plan
              </Link>

              <Link className="button" href="/admin/coaching-plan/initiation">
                Continuer vers l’initiation
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function AdminCoachingPlanGameContent() {
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
      activeHref="/admin/coaching-plan/game"
      title="Coaching Plan — Le jeu"
      subtitle="Interactive first-session game to introduce the coaching journey through a driving metaphor."
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
          <div className="section-title">Loading coaching game...</div>
          <div className="muted">Preparing the first coaching plan section.</div>
        </div>
      ) : (
        <CoachingPlanGameContent />
      )}
    </AdminShell>
  );
}

export default function AdminCoachingPlanGamePage() {
  return (
    <AdminGuard>
      <AdminCoachingPlanGameContent />
    </AdminGuard>
  );
}