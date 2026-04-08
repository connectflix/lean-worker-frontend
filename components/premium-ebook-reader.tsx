"use client";

import { useEffect, useMemo, useState } from "react";
import { ClockIcon } from "@/components/ui-flat-icons";

type OutlineSection = {
  title?: string;
};

type ReaderSection = {
  id: string;
  title: string;
  content: string;
};

function normalizeLine(line: string): string {
  return line.replace(/\r/g, "").trimEnd();
}

function extractSectionsFromMarkdown(markdown: string): ReaderSection[] {
  const lines = markdown.split("\n").map(normalizeLine);

  const sections: ReaderSection[] = [];
  let currentTitle = "Introduction";
  let currentLines: string[] = [];

  function pushSection() {
    const content = currentLines.join("\n").trim();
    if (!content) return;

    sections.push({
      id: `section-${sections.length + 1}`,
      title: currentTitle,
      content,
    });
  }

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h1 = line.match(/^#\s+(.+)$/);

    if (h2 || h1) {
      pushSection();
      currentTitle = (h2?.[1] || h1?.[1] || "Section").trim();
      currentLines = [];
      continue;
    }

    currentLines.push(line);
  }

  pushSection();

  if (sections.length === 0) {
    return [
      {
        id: "section-1",
        title: "Guide",
        content: markdown.trim(),
      },
    ];
  }

  return sections;
}

function mergeOutlineWithSections(
  outlineSections: OutlineSection[] | undefined,
  markdownSections: ReaderSection[],
): ReaderSection[] {
  if (!outlineSections || outlineSections.length === 0) {
    return markdownSections;
  }

  return markdownSections.map((section, index) => ({
    ...section,
    title:
      outlineSections[index]?.title?.trim() ||
      section.title ||
      `Section ${index + 1}`,
  }));
}

function renderRichContent(content: string) {
  const lines = content.split("\n");

  const blocks: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

  function flushParagraph() {
    const text = paragraphBuffer.join(" ").trim();
    if (!text) return;
    blocks.push(
      <p key={`p-${blocks.length}`} className="ebook-paragraph">
        {text}
      </p>,
    );
    paragraphBuffer = [];
  }

  function flushList() {
    if (!listBuffer || listBuffer.items.length === 0) return;

    if (listBuffer.type === "ul") {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="ebook-list">
          {listBuffer.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>,
      );
    } else {
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="ebook-list ebook-list-ordered">
          {listBuffer.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>,
      );
    }

    listBuffer = null;
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="ebook-subheading">
          {h3[1].trim()}
        </h3>,
      );
      continue;
    }

    const bullet = line.match(/^-\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(bullet[1].trim());
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      if (!listBuffer || listBuffer.type !== "ol") {
        flushList();
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer.items.push(ordered[1].trim());
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function PremiumEbookReader({
  outlineSections,
  contentMarkdown,
  uiLanguage,
  storageKey,
}: {
  outlineSections?: OutlineSection[];
  contentMarkdown: string;
  uiLanguage: "fr" | "en";
  storageKey: string;
}) {
  const sections = useMemo(() => {
    const markdownSections = extractSectionsFromMarkdown(contentMarkdown || "");
    return mergeOutlineWithSections(outlineSections, markdownSections);
  }, [contentMarkdown, outlineSections]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as { activeIndex?: number };

      if (
        typeof parsed.activeIndex === "number" &&
        parsed.activeIndex >= 0 &&
        parsed.activeIndex < sections.length
      ) {
        setActiveIndex(parsed.activeIndex);
      }
    } catch {
      // ignore storage errors
    }
  }, [storageKey, sections.length]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ activeIndex }));
    } catch {
      // ignore storage errors
    }
  }, [storageKey, activeIndex]);

  const activeSection = sections[activeIndex] ?? null;
  const progress =
    sections.length > 0
      ? Math.round(((activeIndex + 1) / sections.length) * 100)
      : 0;

  const labels = {
    reading:
      uiLanguage === "fr" ? "Lecture du mini e-book" : "Mini e-book reading",
    section: uiLanguage === "fr" ? "Section" : "Section",
    previous: uiLanguage === "fr" ? "Précédent" : "Previous",
    next: uiLanguage === "fr" ? "Suivant" : "Next",
    progress: uiLanguage === "fr" ? "Progression" : "Progress",
  };

  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < sections.length - 1;

  return (
    <div className="ebook-inline-reader">
      <div className="ebook-inline-reader-topbar">
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <div className="section-title">{labels.reading}</div>
          <div className="muted">
            {labels.section} {Math.min(activeIndex + 1, Math.max(sections.length, 1))}/
            {Math.max(sections.length, 1)}
          </div>
        </div>

        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <ClockIcon size={14} />
          <span className="muted">
            {labels.progress} {progress}%
          </span>
        </div>
      </div>

      <div className="ebook-progress-track" aria-hidden="true">
        <div
          className="ebook-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="ebook-reader-frame">
        <div className="ebook-reader-screen">
          <div className="ebook-screen-content">
            {activeSection ? (
              <>
                <h3 className="ebook-page-title">{activeSection.title}</h3>
                <div className="ebook-content-body">
                  {renderRichContent(activeSection.content)}
                </div>
              </>
            ) : (
              <p className="ebook-paragraph">
                {uiLanguage === "fr"
                  ? "Le contenu du guide n’est pas encore disponible."
                  : "The guide content is not available yet."}
              </p>
            )}
          </div>
        </div>

        <div className="ebook-reader-controls">
          <button
            className="button ghost"
            type="button"
            disabled={!canGoPrevious}
            onClick={() => setActiveIndex((value) => Math.max(0, value - 1))}
          >
            {labels.previous}
          </button>

          <div className="muted ebook-reader-controls-status">
            {labels.section} {Math.min(activeIndex + 1, Math.max(sections.length, 1))}/
            {Math.max(sections.length, 1)}
          </div>

          <button
            className="button"
            type="button"
            disabled={!canGoNext}
            onClick={() =>
              setActiveIndex((value) =>
                Math.min(Math.max(sections.length - 1, 0), value + 1),
              )
            }
          >
            {labels.next}
          </button>
        </div>
      </div>
    </div>
  );
}