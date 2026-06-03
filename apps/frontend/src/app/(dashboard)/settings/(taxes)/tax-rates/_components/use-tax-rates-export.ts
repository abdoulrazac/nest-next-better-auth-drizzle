// @ts-nocheck
"use client";

import { exportToCSV, exportToExcel } from "@/lib/export";

interface ExportRow {
  Code: string;
  Nom: string;
  Taux: string;
  Type: string;
  Statut: string;
  "Créée le": string;
}

function toRows(taxRates: any[]): ExportRow[] {
  return taxRates.map((t) => ({
    Code: t.code ?? t.type ?? "",
    Nom: t.label ?? t.name ?? "",
    Taux: t.rate != null ? `${Number(t.rate)}%` : "",
    Type: t.type ?? "",
    Statut: t.status === "INACTIVE" ? "Inactif" : "Actif",
    "Créée le": t.createdAt
      ? new Date(t.createdAt).toLocaleDateString("fr-FR")
      : "",
  }));
}

export function exportTaxRatesCSV(taxRates: any[]) {
  const rows = toRows(taxRates);
  exportToCSV(rows, `taux_tva_${new Date().toISOString().slice(0, 10)}.csv`);
}

export async function exportTaxRatesExcel(taxRates: any[]) {
  const rows = toRows(taxRates);
  await exportToExcel(
    rows,
    "Taux de TVA",
    `taux_tva_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

export async function exportTaxRatesPDF(taxRates: any[]) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const rows = toRows(taxRates);
  if (rows.length === 0) return;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Liste des taux de TVA", 14, 15);
  doc.setFontSize(9);
  doc.text(
    `Exporté le ${new Date().toLocaleDateString("fr-FR")} — ${rows.length} taux`,
    14,
    22,
  );
  const columns = Object.keys(rows[0] as ExportRow) as (keyof ExportRow)[];
  autoTable(doc, {
    startY: 28,
    head: [columns],
    body: rows.map((r) => columns.map((c) => r[c] ?? "")),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    margin: { left: 10, right: 10 },
  });
  doc.save(`taux_tva_${new Date().toISOString().slice(0, 10)}.pdf`);
}
