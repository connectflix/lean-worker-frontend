"use client";

import type { ReactNode } from "react";

export type OrganizationCanvasPrintKind =
  | "engagement"
  | "purpose"
  | "time"
  | "significance";

const CANVAS_PRINT_LABELS: Record<OrganizationCanvasPrintKind, string> = {
  engagement: "Engagement Canvas",
  purpose: "Purpose Canvas",
  time: "Time Canvas",
  significance: "Significance Canvas",
};

type OrganizationCanvasPrintExportProps = {
  canvasKind: OrganizationCanvasPrintKind;
  workerName: string;
  printedAt: Date;
  children: ReactNode;
};

function formatPrintedAt(date: Date): string {
  return new Intl.DateTimeFormat("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getCanvasPrintLabel(canvasKind: OrganizationCanvasPrintKind): string {
  return CANVAS_PRINT_LABELS[canvasKind];
}

export function getCanvasCopyrightText(canvasKind: OrganizationCanvasPrintKind): string {
  return `${getCanvasPrintLabel(
    canvasKind,
  )} est un matériel proposé et détenu par Flixtalent. Tous droits réservés.`;
}

export function OrganizationCanvasPrintExport({
  canvasKind,
  workerName,
  printedAt,
  children,
}: OrganizationCanvasPrintExportProps) {
  const canvasLabel = getCanvasPrintLabel(canvasKind);

  return (
    <section
      className="organization-canvas-print-document"
      aria-label={`${canvasLabel} PDF export`}
    >
      <style jsx global>{`
        @media screen {
          .organization-canvas-print-only {
            display: none !important;
          }
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm;
          }

          html,
          body {
            width: 100%;
            min-height: 100%;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .organization-canvas-print-only,
          .organization-canvas-print-only * {
            visibility: visible !important;
          }

          .organization-canvas-print-only {
            display: block !important;
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            z-index: 999999 !important;
            overflow: hidden !important;
          }

          .organization-canvas-print-document {
            width: 287mm !important;
            height: 200mm !important;
            max-height: 200mm !important;
            min-height: 200mm !important;
            display: grid !important;
            grid-template-rows: auto 1fr auto !important;
            gap: 4mm !important;
            overflow: hidden !important;
            color: #0f172a !important;
            background: #ffffff !important;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif !important;
          }

          .organization-canvas-print-header {
            display: grid !important;
            grid-template-columns: 1fr auto !important;
            align-items: start !important;
            gap: 12px !important;
            padding: 0 0 4px 0 !important;
            border-bottom: 1px solid rgba(15, 23, 42, 0.12) !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .organization-canvas-print-title {
            margin: 0 !important;
            font-size: 16px !important;
            line-height: 1.05 !important;
            font-weight: 900 !important;
            letter-spacing: -0.04em !important;
            color: #0f172a !important;
          }

          .organization-canvas-print-meta {
            display: grid !important;
            grid-template-columns: auto 1fr !important;
            gap: 2px 8px !important;
            margin-top: 3px !important;
            font-size: 8px !important;
            line-height: 1.2 !important;
            color: #475569 !important;
          }

          .organization-canvas-print-meta strong {
            color: #0f172a !important;
            font-weight: 800 !important;
          }

          .organization-canvas-print-brand {
            text-align: right !important;
            font-size: 9px !important;
            font-weight: 900 !important;
            letter-spacing: -0.03em !important;
            color: #4f46e5 !important;
            white-space: nowrap !important;
          }

          .organization-canvas-print-body {
            min-height: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .organization-canvas-print-body .card-soft {
            box-shadow: none !important;
          }

          .organization-canvas-print-body textarea,
          .organization-canvas-print-body input,
          .organization-canvas-print-body select,
          .organization-canvas-print-body button {
            display: none !important;
          }

          .organization-canvas-print-footer {
            padding-top: 4px !important;
            border-top: 1px solid rgba(15, 23, 42, 0.12) !important;
            font-size: 7.5px !important;
            line-height: 1.2 !important;
            color: #475569 !important;
            text-align: center !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .organization-canvas-print-page-break {
            break-after: page !important;
          }
        }
      `}</style>

      <header className="organization-canvas-print-header">
        <div>
          <h1 className="organization-canvas-print-title">{canvasLabel}</h1>

          <div className="organization-canvas-print-meta">
            <strong>Worker</strong>
            <span>{workerName || "Worker non renseigné"}</span>

            <strong>Date d’impression</strong>
            <span>{formatPrintedAt(printedAt)}</span>
          </div>
        </div>

        <div className="organization-canvas-print-brand">Flixtalent</div>
      </header>

      <main className="organization-canvas-print-body">{children}</main>

      <footer className="organization-canvas-print-footer">
        {getCanvasCopyrightText(canvasKind)}
      </footer>
    </section>
  );
}