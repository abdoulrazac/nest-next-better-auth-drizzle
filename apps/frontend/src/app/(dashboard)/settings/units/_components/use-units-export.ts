// @ts-nocheck
"use client";

import { exportToCSV, exportToExcel } from "@/lib/export";

interface ExportRow {
  Code: string;
  Nom: string;
  Symbole: string;
  Type: string;
  Statut: string;
  "Créée le": string;
}

function toRows(units: any[]): ExportRow[] {
  return units.map((u) => ({
    Code: u.code ?? u.abbreviation ?? "",
    Nom: u.name ?? "",
    Symbole: u.abbreviation ?? "",
    Type: u.type ?? "",
    Statut: u.status === "INACTIVE" ? "Inactif" : "Actif",
    "Créée le": u.createdAt
      ? new Date(u.createdAt).toLocaleDateString("fr-FR")
      : "",
  }));
}

export function exportUnitsCSV(units: any[]) {
  const rows = toRows(units);
  exportToCSV(rows, `unites_${new Date().toISOString().slice(0, 10)}.csv`);
}

export async function exportUnitsExcel(units: any[]) {
  const rows = toRows(units);
  await exportToExcel(
    rows,
    "Unités",
    `unites_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

export async function exportUnitsPDF(units: any[]) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const rows = toRows(units);
  if (rows.length === 0) return;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Liste des unités", 14, 15);
  doc.setFontSize(9);
  doc.text(
    `Exporté le ${new Date().toLocaleDateString("fr-FR")} — ${rows.length} unité(s)`,
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
  doc.save(`unites_${new Date().toISOString().slice(0, 10)}.pdf`);
}
