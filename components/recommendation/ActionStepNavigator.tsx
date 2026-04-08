"use client";

import { useMemo, useState } from "react";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import { BadgePill , SparkIcon} from "@/components/ui-flat-icons";

type Step = {
  title: string;
  content: string;
};

type Props = {
  primaryProblem?: string | null;
  actionTrack?: string | null;
  whyRecommended?: string | null;
  uiLanguage?: SupportedUiLanguage;
};

function prettify(value?: string | null): string {
  if (!value) return "";
  return value.replaceAll("_", " ");
}

export function ActionStepNavigator({
  primaryProblem,
  actionTrack,
  whyRecommended,
  uiLanguage = "en",
}: Props) {
  const steps = useMemo<Step[]>(() => {
    const list: Step[] = [];

    if (primaryProblem) {
      list.push({
        title: uiLanguage === "fr" ? "Blocage identifié" : "Identified blocker",
        content: primaryProblem,
      });
    }

    list.push({
      title: uiLanguage === "fr" ? "Si tu ne fais rien" : "If you don’t act",
      content:
        uiLanguage === "fr"
          ? "Ce point va continuer à ralentir ta progression et limiter tes opportunités."
          : "This will continue to slow your progress and limit your opportunities.",
    });

    if (actionTrack) {
      list.push({
        title: uiLanguage === "fr" ? "Action recommandée" : "Recommended action",
        content: prettify(actionTrack),
      });
    }

    if (whyRecommended) {
      list.push({
        title: uiLanguage === "fr" ? "Pourquoi c’est important" : "Why it matters",
        content: whyRecommended,
      });
    }

    return list;
  }, [primaryProblem, actionTrack, whyRecommended, uiLanguage]);

  const [index, setIndex] = useState(0);

  if (steps.length === 0) return null;

  const current = steps[index];

  return (
    <div className="stack" style={{ gap: 12 }}>
      {steps.length > 1 && (
        <div className="row space-between" style={{ alignItems: "center" }}>
          <BadgePill icon={<SparkIcon size={14} />}>
            {index + 1} / {steps.length}
          </BadgePill>

          <div className="row" style={{ gap: 8 }}>
            <button
              className="button ghost"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            >
              {uiLanguage === "fr" ? "Précédent" : "Previous"}
            </button>

            <button
              className="button ghost"
              disabled={index === steps.length - 1}
              onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))}
            >
              {uiLanguage === "fr" ? "Suivant" : "Next"}
            </button>
          </div>
        </div>
      )}

      <div className="card-soft">
        <strong>{current.title}</strong>
        <div className="muted">{current.content}</div>
      </div>
    </div>
  );
}