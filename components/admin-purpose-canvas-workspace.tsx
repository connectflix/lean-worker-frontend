// components/admin-purpose-canvas-workspace.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createAdminWorkerPurposeCanvas,
  getAdminWorkerPurposeCanvases,
  updateAdminWorkerPurposeCanvas,
} from "@/lib/api";
import type {
  AdminWorker,
  AdminWorkerPurposeCanvas,
  AdminWorkerPurposeCanvasCreate,
  AdminWorkerPurposeCanvasUpdate,
} from "@/lib/types";

type SaveIndicator = "idle" | "typing" | "saving" | "saved" | "error";

type AdminWorkerPurposeCanvasNodeKey =
  | "travail"
  | "aspiration"
  | "inspiration"
  | "passion"
  | "vocation"
  | "formation";

type PurposeCanvasFormState = Record<AdminWorkerPurposeCanvasNodeKey, string>;

type PurposeCanvasRelationStatus = "pending" | "coherent" | "incoherent";

type PurposeCanvasRelation = {
  source_node_key: AdminWorkerPurposeCanvasNodeKey;
  target_node_key: AdminWorkerPurposeCanvasNodeKey;
  is_coherent: boolean;
  status: PurposeCanvasRelationStatus;
  rationale?: string | null;
};

const PURPOSE_NODE_DEFINITIONS: Array<{
  key: AdminWorkerPurposeCanvasNodeKey;
  title: string;
  subtitle: string;
  placeholder: string;
  x: number;
  y: number;
}> = [
  {
    key: "travail",
    title: "Travail",
    subtitle: "Ce que le worker fait, produit ou porte concrètement dans son activité",
    placeholder: "Ex: J’aide les équipes à structurer des situations complexes et à avancer.",
    x: 50,
    y: 8,
  },
  {
    key: "aspiration",
    title: "Aspiration",
    subtitle: "Ce vers quoi le worker souhaite évoluer ou tendre",
    placeholder: "Ex: Je veux évoluer vers un rôle plus stratégique, utile et aligné.",
    x: 85,
    y: 31,
  },
  {
    key: "inspiration",
    title: "Inspiration",
    subtitle: "Ce qui nourrit, influence ou élève sa manière de penser et d’agir",
    placeholder: "Ex: Je suis inspiré par les personnes qui transforment les difficultés en clarté.",
    x: 72,
    y: 75,
  },
  {
    key: "passion",
    title: "Passion",
    subtitle: "Ce qui donne de l’énergie, de l’élan et de l’envie",
    placeholder: "Ex: J’aime accompagner les personnes dans leurs transitions professionnelles.",
    x: 28,
    y: 75,
  },
  {
    key: "vocation",
    title: "Vocation",
    subtitle: "La contribution profonde que le worker sent devoir porter",
    placeholder: "Ex: Aider les personnes à retrouver confiance, direction et capacité d’action.",
    x: 15,
    y: 31,
  },
  {
    key: "formation",
    title: "Formation",
    subtitle: "Les apprentissages, acquis ou développements nécessaires pour soutenir le chemin",
    placeholder: "Ex: Développer mes compétences en leadership, coaching et stratégie.",
    x: 50,
    y: 45,
  },
];

const EMPTY_PURPOSE_FORM: PurposeCanvasFormState = {
  travail: "",
  aspiration: "",
  inspiration: "",
  passion: "",
  vocation: "",
  formation: "",
};

function formatSavedTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeText(value?: string | null): string {
  return value?.trim() || "";
}

function getNodeTitle(key: AdminWorkerPurposeCanvasNodeKey): string {
  return PURPOSE_NODE_DEFINITIONS.find((node) => node.key === key)?.title || key;
}

function tokenize(value: string): Set<string> {
  const stopWords = new Set([
    "avec",
    "dans",
    "pour",
    "plus",
    "bien",
    "être",
    "etre",
    "cette",
    "cela",
    "ceci",
    "mon",
    "mes",
    "nos",
    "vos",
    "leur",
    "leurs",
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "work",
    "role",
    "need",
    "needs",
  ]);

  return new Set(
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 4 && !stopWords.has(item)),
  );
}

function evaluateRelation(
  sourceValue: string,
  targetValue: string,
): Pick<PurposeCanvasRelation, "is_coherent" | "status" | "rationale"> {
  const source = normalizeText(sourceValue);
  const target = normalizeText(targetValue);

  if (!source || !target) {
    return {
      is_coherent: false,
      status: "pending",
      rationale: "Relation pending until both nodes are filled.",
    };
  }

  const sourceTokens = tokenize(source);
  const targetTokens = tokenize(target);
  const overlap = [...sourceTokens].filter((token) => targetTokens.has(token));

  if (overlap.length > 0) {
    return {
      is_coherent: true,
      status: "coherent",
      rationale: `Shared meaning detected through: ${overlap.slice(0, 4).join(", ")}.`,
    };
  }

  const sourceLower = source.toLowerCase();
  const targetLower = target.toLowerCase();

  if (sourceLower.includes(targetLower) || targetLower.includes(sourceLower)) {
    return {
      is_coherent: true,
      status: "coherent",
      rationale: "One statement reinforces or contains the other.",
    };
  }

  return {
    is_coherent: false,
    status: "incoherent",
    rationale: "No obvious coherence detected between both statements.",
  };
}

function buildRelationsFromForm(form: PurposeCanvasFormState): PurposeCanvasRelation[] {
  const relations: PurposeCanvasRelation[] = [];

  PURPOSE_NODE_DEFINITIONS.forEach((source, sourceIndex) => {
    PURPOSE_NODE_DEFINITIONS.slice(sourceIndex + 1).forEach((target) => {
      const evaluation = evaluateRelation(form[source.key], form[target.key]);

      relations.push({
        source_node_key: source.key,
        target_node_key: target.key,
        ...evaluation,
      });
    });
  });

  return relations;
}

function getCoherenceScore(relations: PurposeCanvasRelation[]): number {
  const evaluatedRelations = relations.filter((relation) => relation.status !== "pending");

  if (evaluatedRelations.length === 0) {
    return 0;
  }

  const coherentRelations = evaluatedRelations.filter((relation) => relation.is_coherent);

  return coherentRelations.length / evaluatedRelations.length;
}

function getCoherenceStatus(
  relations: PurposeCanvasRelation[],
  score: number,
): "not_evaluated" | "coherent" | "partially_coherent" | "incoherent" {
  const evaluatedRelations = relations.filter((relation) => relation.status !== "pending");

  if (evaluatedRelations.length === 0) {
    return "not_evaluated";
  }

  if (score >= 0.75) return "coherent";
  if (score >= 0.5) return "partially_coherent";
  return "incoherent";
}

function getCoherenceSummary(relations: PurposeCanvasRelation[], score: number): string | null {
  const evaluatedRelations = relations.filter((relation) => relation.status !== "pending");

  if (evaluatedRelations.length === 0) {
    return null;
  }

  const coherentCount = evaluatedRelations.filter((relation) => relation.is_coherent).length;
  const incoherentCount = evaluatedRelations.length - coherentCount;
  const percentage = Math.round(score * 100);

  return `Purpose Canvas coherence score: ${percentage}% (${coherentCount} coherent relation(s), ${incoherentCount} incoherent relation(s)).`;
}

function purposeFormFromCanvas(canvas: AdminWorkerPurposeCanvas): PurposeCanvasFormState {
  return {
    travail: canvas.travail_text || "",
    aspiration: canvas.aspiration_text || "",
    inspiration: canvas.inspiration_text || "",
    passion: canvas.passion_text || "",
    vocation: canvas.vocation_text || "",
    formation: canvas.formation_text || "",
  };
}

function convertRelationsForApi(
  relations: PurposeCanvasRelation[],
): Array<Record<string, unknown>> {
  return relations.map((relation) => ({
    from: relation.source_node_key,
    to: relation.target_node_key,
    source: relation.source_node_key,
    target: relation.target_node_key,
    source_node_key: relation.source_node_key,
    target_node_key: relation.target_node_key,
    source_label: getNodeTitle(relation.source_node_key),
    target_label: getNodeTitle(relation.target_node_key),
    status: relation.status,
    is_coherent: relation.is_coherent,
    reason: relation.rationale || null,
    rationale: relation.rationale || null,
  }));
}

function buildPurposePayload(
  form: PurposeCanvasFormState,
): Omit<AdminWorkerPurposeCanvasCreate, "worker_id"> {
  const relations = buildRelationsFromForm(form);
  const coherenceScore = getCoherenceScore(relations);

  return {
    travail_text: normalizeText(form.travail) || null,
    aspiration_text: normalizeText(form.aspiration) || null,
    inspiration_text: normalizeText(form.inspiration) || null,
    passion_text: normalizeText(form.passion) || null,
    vocation_text: normalizeText(form.vocation) || null,
    formation_text: normalizeText(form.formation) || null,
    coherence_score: coherenceScore,
    coherence_status: getCoherenceStatus(relations, coherenceScore),
    coherence_summary: getCoherenceSummary(relations, coherenceScore),
    relation_map_json: convertRelationsForApi(relations),
  };
}

function buildRelationKey(
  source: AdminWorkerPurposeCanvasNodeKey,
  target: AdminWorkerPurposeCanvasNodeKey,
): string {
  return [source, target].sort().join("__");
}

function getRelationColor(relation?: PurposeCanvasRelation | null): string {
  if (!relation || relation.status === "pending") return "rgba(100,116,139,0.35)";
  return relation.is_coherent ? "rgba(37,99,235,0.9)" : "rgba(220,38,38,0.9)";
}

function getRelationDash(relation?: PurposeCanvasRelation | null): string | undefined {
  if (!relation || relation.status === "pending") return "6 6";
  return undefined;
}

function getFilledNodeCount(form: PurposeCanvasFormState): number {
  return PURPOSE_NODE_DEFINITIONS.filter((node) => normalizeText(form[node.key])).length;
}

function SavePill({
  state,
  savedAt,
}: {
  state: SaveIndicator;
  savedAt: string | null;
}) {
  let label = "Idle";
  let color = "var(--muted-foreground, #64748b)";
  let background = "rgba(100,116,139,0.12)";

  if (state === "typing") {
    label = "Editing…";
    color = "#92400e";
    background = "rgba(245,158,11,0.14)";
  } else if (state === "saving") {
    label = "Saving…";
    color = "#1d4ed8";
    background = "rgba(59,130,246,0.14)";
  } else if (state === "saved") {
    label = savedAt ? `Saved ${savedAt}` : "Saved";
    color = "#15803d";
    background = "rgba(34,197,94,0.14)";
  } else if (state === "error") {
    label = "Save error";
    color = "#b91c1c";
    background = "rgba(239,68,68,0.14)";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color,
        background,
      }}
    >
      {label}
    </span>
  );
}

function CoherenceScoreCard({
  score,
  coherentCount,
  totalCount,
  filledNodeCount,
}: {
  score: number;
  coherentCount: number;
  totalCount: number;
  filledNodeCount: number;
}) {
  const normalizedScore = score > 1 ? score / 100 : score;
  const percentage = Math.round(normalizedScore * 100);

  let color = "#15803d";
  let background = "rgba(34,197,94,0.12)";

  if (percentage < 50) {
    color = "#b91c1c";
    background = "rgba(239,68,68,0.12)";
  } else if (percentage < 75) {
    color = "#b45309";
    background = "rgba(245,158,11,0.14)";
  }

  return (
    <div
      style={{
        borderRadius: 18,
        padding: 16,
        background,
        border: `1px solid ${color}33`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div className="muted">Global coherence</div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          color,
          letterSpacing: "-0.04em",
        }}
      >
        {percentage}%
      </div>

      <div className="muted">
        {coherentCount} coherent relation(s) / {totalCount} evaluated relation(s)
      </div>

      <div className="muted">{filledNodeCount}/6 node(s) filled</div>
    </div>
  );
}

function PurposeNodeEditor({
  title,
  subtitle,
  value,
  placeholder,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className="stack"
      style={{
        gap: 8,
        padding: 12,
        borderRadius: 16,
        border: "1px solid rgba(37,99,235,0.22)",
        background: "rgba(37,99,235,0.05)",
      }}
    >
      <div className="stack" style={{ gap: 2 }}>
        <strong>{title}</strong>
        <span className="muted" style={{ fontSize: 12 }}>
          {subtitle}
        </span>
      </div>

      <textarea
        className="textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        style={{
          resize: "vertical",
          background: "rgba(255,255,255,0.82)",
        }}
      />
    </label>
  );
}

function PurposeCanvasGraph({
  form,
  relations,
}: {
  form: PurposeCanvasFormState;
  relations: PurposeCanvasRelation[];
}) {
  const relationMap = useMemo(() => {
    const map = new Map<string, PurposeCanvasRelation>();

    relations.forEach((relation) => {
      map.set(buildRelationKey(relation.source_node_key, relation.target_node_key), relation);
    });

    return map;
  }, [relations]);

  const allPairs = useMemo(() => {
    const pairs: Array<{
      source: (typeof PURPOSE_NODE_DEFINITIONS)[number];
      target: (typeof PURPOSE_NODE_DEFINITIONS)[number];
      relation?: PurposeCanvasRelation;
    }> = [];

    PURPOSE_NODE_DEFINITIONS.forEach((source, sourceIndex) => {
      PURPOSE_NODE_DEFINITIONS.slice(sourceIndex + 1).forEach((target) => {
        pairs.push({
          source,
          target,
          relation: relationMap.get(buildRelationKey(source.key, target.key)),
        });
      });
    });

    return pairs;
  }, [relationMap]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: 560,
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(15,23,42,0.08)",
        background:
          "radial-gradient(circle at 50% 45%, rgba(59,130,246,0.09), transparent 35%), linear-gradient(135deg, rgba(248,250,252,1), rgba(239,246,255,0.92))",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        {allPairs.map(({ source, target, relation }) => {
          const sourceFilled = Boolean(normalizeText(form[source.key]));
          const targetFilled = Boolean(normalizeText(form[target.key]));
          const shouldShowStrongLine = sourceFilled && targetFilled;

          return (
            <line
              key={`${source.key}-${target.key}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={shouldShowStrongLine ? getRelationColor(relation) : "rgba(100,116,139,0.18)"}
              strokeWidth={shouldShowStrongLine ? 0.65 : 0.35}
              strokeDasharray={shouldShowStrongLine ? getRelationDash(relation) : "4 6"}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {PURPOSE_NODE_DEFINITIONS.map((node) => {
        const value = normalizeText(form[node.key]);
        const isFilled = Boolean(value);

        return (
          <div
            key={node.key}
            style={{
              position: "absolute",
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
              width: node.key === "formation" ? 190 : 178,
              minHeight: node.key === "formation" ? 130 : 116,
              borderRadius: 24,
              padding: 14,
              border: isFilled
                ? "2px solid rgba(37,99,235,0.72)"
                : "1px solid rgba(100,116,139,0.28)",
              background: isFilled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.82)",
              boxShadow: isFilled
                ? "0 18px 38px rgba(37,99,235,0.16)"
                : "0 10px 24px rgba(15,23,42,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: isFilled ? "#1d4ed8" : "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {node.title}
            </div>

            <div
              style={{
                fontSize: 12,
                lineHeight: 1.45,
                color: value ? "#0f172a" : "#64748b",
                whiteSpace: "pre-wrap",
              }}
            >
              {value || "Not filled yet"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdminPurposeCanvasWorkspace({
  workers,
  selectedWorkerId,
  fixedWorker = false,
  title = "Purpose Canvas",
  subtitle = "Fill the six purpose nodes and track relationship coherence in real time.",
}: {
  workers: AdminWorker[];
  selectedWorkerId?: number | null;
  fixedWorker?: boolean;
  title?: string;
  subtitle?: string;
}) {
  const [selectionWorkerId, setSelectionWorkerId] = useState<string>(
    selectedWorkerId ? String(selectedWorkerId) : "",
  );

  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingCanvasId, setEditingCanvasId] = useState<number | null>(null);
  const [editingCanvas, setEditingCanvas] = useState<AdminWorkerPurposeCanvas | null>(null);
  const [form, setForm] = useState<PurposeCanvasFormState>(EMPTY_PURPOSE_FORM);

  const [saveState, setSaveState] = useState<SaveIndicator>("idle");
  const [lastSavedAtLabel, setLastSavedAtLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutosaveRef = useRef<boolean>(true);

  useEffect(() => {
    if (selectedWorkerId && String(selectedWorkerId) !== selectionWorkerId) {
      setSelectionWorkerId(String(selectedWorkerId));
      resetCanvas(String(selectedWorkerId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkerId]);

  const selectedWorker = useMemo(() => {
    if (!selectionWorkerId) return null;
    return workers.find((worker) => worker.id === Number(selectionWorkerId)) ?? null;
  }, [selectionWorkerId, workers]);

  const relations = useMemo<PurposeCanvasRelation[]>(() => {
    return buildRelationsFromForm(form);
  }, [form]);

  const score = getCoherenceScore(relations);

  const coherentCount = relations.filter(
    (relation) => relation.status !== "pending" && relation.is_coherent,
  ).length;

  const totalCount = relations.filter((relation) => relation.status !== "pending").length;

  const filledNodeCount = getFilledNodeCount(form);

  function stampSavedNow() {
    setLastSavedAtLabel(formatSavedTime());
    setSaveState("saved");
  }

  function resetCanvas(workerId?: string) {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    setEditingCanvasId(null);
    setEditingCanvas(null);
    setForm(EMPTY_PURPOSE_FORM);
    setCanvasLoaded(false);
    setSaveState("idle");
    setLastSavedAtLabel(null);
    setError(null);
    skipNextAutosaveRef.current = true;

    if (workerId != null) {
      setSelectionWorkerId(workerId);
    }
  }

  async function handleLoadCanvas() {
    if (!selectionWorkerId) {
      setError("Please select a worker first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSaveState("idle");
    setLastSavedAtLabel(null);

    try {
      const workerId = Number(selectionWorkerId);
      const matches = await getAdminWorkerPurposeCanvases({ worker_id: workerId });
      const existing = matches[0] ?? null;

      if (existing) {
        setEditingCanvasId(existing.id);
        setEditingCanvas(existing);
        setForm(purposeFormFromCanvas(existing));
      } else {
        setEditingCanvasId(null);
        setEditingCanvas(null);
        setForm(EMPTY_PURPOSE_FORM);
      }

      setCanvasLoaded(true);
      skipNextAutosaveRef.current = true;
    } catch (err) {
      setCanvasLoaded(false);
      setEditingCanvasId(null);
      setEditingCanvas(null);
      setForm(EMPTY_PURPOSE_FORM);
      setError(err instanceof Error ? err.message : "Failed to load purpose canvas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCanvas(options?: { silent?: boolean }) {
    const silent = Boolean(options?.silent);

    if (!selectionWorkerId || !canvasLoaded) return;

    if (!silent) {
      setSaving(true);
    }

    setError(null);
    setSaveState("saving");

    try {
      if (editingCanvasId) {
        const payload: AdminWorkerPurposeCanvasUpdate = buildPurposePayload(form);
        const updated = await updateAdminWorkerPurposeCanvas(editingCanvasId, payload);
        setEditingCanvas(updated);
        setForm(purposeFormFromCanvas(updated));
        stampSavedNow();
      } else {
        const payload: AdminWorkerPurposeCanvasCreate = {
          worker_id: Number(selectionWorkerId),
          ...buildPurposePayload(form),
        };

        const created = await createAdminWorkerPurposeCanvas(payload);
        setEditingCanvasId(created.id);
        setEditingCanvas(created);
        setForm(purposeFormFromCanvas(created));
        stampSavedNow();
      }
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Failed to save purpose canvas.");
    } finally {
      if (!silent) {
        setSaving(false);
      }
    }
  }

  function patchField(key: AdminWorkerPurposeCanvasNodeKey, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    if (!canvasLoaded) return;
    if (!selectionWorkerId) return;

    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }

    setSaveState("typing");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      void handleSaveCanvas({ silent: true });
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, canvasLoaded, selectionWorkerId]);

  return (
    <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
      <div
        className="row space-between"
        style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">{title}</div>
          <div className="muted">{subtitle}</div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <SavePill state={saveState} savedAt={lastSavedAtLabel} />

          {canvasLoaded ? (
            <button
              className="button ghost"
              type="button"
              onClick={() => resetCanvas(selectionWorkerId)}
            >
              Clear canvas
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="card-soft" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : null}

      <div className="card-soft stack" style={{ gap: 12 }}>
        <div className="grid grid-3" style={{ alignItems: "end" }}>
          <label className="stack">
            <strong>Worker</strong>

            {fixedWorker ? (
              <input
                className="input"
                value={
                  selectedWorker
                    ? `#${selectedWorker.id} — ${selectedWorker.display_name}`
                    : selectionWorkerId
                      ? `Worker #${selectionWorkerId}`
                      : ""
                }
                disabled
                placeholder="Select a worker first"
              />
            ) : (
              <select
                className="select"
                value={selectionWorkerId}
                onChange={(event) => {
                  setSelectionWorkerId(event.target.value);
                  resetCanvas(event.target.value);
                }}
              >
                <option value="">Select a worker</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    #{worker.id} — {worker.display_name}
                  </option>
                ))}
              </select>
            )}
          </label>

          <div className="stack">
            <strong>Canvas status</strong>
            <div className="muted">
              {canvasLoaded
                ? editingCanvas
                  ? `Existing canvas #${editingCanvas.id}`
                  : "New canvas"
                : "No canvas loaded"}
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button"
              type="button"
              onClick={() => void handleLoadCanvas()}
              disabled={!selectionWorkerId || loading}
            >
              {loading ? "Loading..." : "Load canvas"}
            </button>

            {canvasLoaded ? (
              <button
                className="button"
                type="button"
                onClick={() => void handleSaveCanvas()}
                disabled={saving}
              >
                {saving ? "Saving..." : editingCanvasId ? "Save" : "Create"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {!canvasLoaded ? (
        <div className="card-soft">
          <div className="muted">
            No Purpose Canvas displayed yet. Select a worker, then click{" "}
            <strong>Load canvas</strong>.
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            <CoherenceScoreCard
              score={score}
              coherentCount={coherentCount}
              totalCount={totalCount}
              filledNodeCount={filledNodeCount}
            />

            <div className="card-soft stack" style={{ gap: 8 }}>
              <div className="section-title" style={{ fontSize: 15 }}>
                Relation colors
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge" style={{ borderColor: "rgba(37,99,235,0.35)" }}>
                  Blue = coherent
                </span>
                <span className="badge" style={{ borderColor: "rgba(220,38,38,0.35)" }}>
                  Red = incoherent
                </span>
                <span className="badge">Dashed = waiting for evaluation</span>
              </div>

              <div className="muted">
                Coherence is recalculated in real time and persisted when the canvas is saved.
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 8 }}>
              <div className="section-title" style={{ fontSize: 15 }}>
                Coach exploitation
              </div>

              <div className="muted">
                The six nodes are persisted and can be injected into the coach context for future
                personalization.
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <PurposeCanvasGraph form={form} relations={relations} />

            <div
              className="stack"
              style={{
                gap: 12,
                maxHeight: 560,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {PURPOSE_NODE_DEFINITIONS.map((node) => (
                <PurposeNodeEditor
                  key={node.key}
                  title={node.title}
                  subtitle={node.subtitle}
                  value={form[node.key]}
                  placeholder={node.placeholder}
                  onChange={(value) => patchField(node.key, value)}
                />
              ))}
            </div>
          </div>

          {relations.length > 0 ? (
            <div className="card-soft stack" style={{ gap: 10 }}>
              <div className="section-title" style={{ fontSize: 15 }}>
                Relation details
              </div>

              <div
                className="grid grid-3"
                style={{
                  alignItems: "stretch",
                }}
              >
                {relations.map((relation) => (
                  <div
                    key={`${relation.source_node_key}-${relation.target_node_key}`}
                    className="stack"
                    style={{
                      gap: 6,
                      borderRadius: 14,
                      padding: 12,
                      border:
                        relation.status === "pending"
                          ? "1px solid rgba(100,116,139,0.28)"
                          : relation.is_coherent
                            ? "1px solid rgba(37,99,235,0.28)"
                            : "1px solid rgba(220,38,38,0.28)",
                      background:
                        relation.status === "pending"
                          ? "rgba(100,116,139,0.06)"
                          : relation.is_coherent
                            ? "rgba(37,99,235,0.06)"
                            : "rgba(220,38,38,0.06)",
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>
                      {getNodeTitle(relation.source_node_key)} ↔{" "}
                      {getNodeTitle(relation.target_node_key)}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color:
                          relation.status === "pending"
                            ? "#64748b"
                            : relation.is_coherent
                              ? "#1d4ed8"
                              : "#b91c1c",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {relation.status === "pending"
                        ? "Pending"
                        : relation.is_coherent
                          ? "Coherent"
                          : "Incoherent"}
                    </div>

                    {relation.rationale ? (
                      <div className="muted">{relation.rationale}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}