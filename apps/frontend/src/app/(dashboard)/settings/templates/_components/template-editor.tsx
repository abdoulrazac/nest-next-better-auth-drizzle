// @ts-nocheck
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTemplateConfig } from "@/hooks/use-template-config";
import { TEMPLATE_TYPES, type TemplateType } from "@/lib/template";
import { Code, EyeIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

// ── Props ────────────────────────────────────────────

interface TemplateEditorProps {
  mode: "create" | "edit";
  initialName?: string;
  initialType?: TemplateType;
  initialContent?: string;
  isLoading?: boolean;
  onSubmit: (data: {
    name: string;
    type: TemplateType;
    content: string;
  }) => void;
  isSaving?: boolean;
}

// ── Component ────────────────────────────────────────

export function TemplateEditor({
  mode,
  initialName = "",
  initialType = "INVOICE_FV",
  initialContent = "",
  isLoading = false,
  onSubmit,
  isSaving = false,
}: TemplateEditorProps) {
  const [name, setName] = useState(initialName);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const tc = useTemplateConfig({ initialType, initialContent, mode });

  // Sync name from props (edit mode)
  useEffect(() => {
    if (initialName) setName(initialName);
  }, [initialName]);

  // Update preview
  useEffect(() => {
    const doc = previewRef.current?.contentDocument;
    if (doc) {
      doc.open();
      doc.write(tc.generatedHtml);
      doc.close();
    }
  }, [tc.generatedHtml]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), type: tc.type, content: tc.generatedHtml });
  };

  // ── Loading state ─────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <HugeiconsIcon
          icon={Loading03Icon}
          className="h-8 w-8 animate-spin text-muted-foreground"
        />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-50 flex-1">
          <Label htmlFor="template-name">Nom du modèle</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Facture personnalisée"
            className="mt-1"
          />
        </div>

        <div className="w-55">
          <Label>Type de document</Label>
          <Select
            value={tc.type}
            onValueChange={(v) => tc.handleTypeChange(v as TemplateType)}
            disabled={mode === "edit"}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TEMPLATE_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={tc.editorMode === "visual" ? "default" : "outline"}
            size="sm"
            onClick={
              tc.editorMode === "code" ? tc.switchToVisualMode : undefined
            }
          >
            <HugeiconsIcon icon={EyeIcon} className="mr-1 h-4 w-4" />
            Visuel
          </Button>
          <Button
            variant={tc.editorMode === "code" ? "default" : "outline"}
            size="sm"
            onClick={
              tc.editorMode === "visual" ? tc.switchToCodeMode : undefined
            }
          >
            <HugeiconsIcon icon={Code} className="mr-1 h-4 w-4" />
            Code
          </Button>
        </div>

        <Button onClick={handleSubmit} disabled={isSaving || !name.trim()}>
          {isSaving && (
            <HugeiconsIcon
              icon={Loading03Icon}
              className="mr-1 h-4 w-4 animate-spin"
            />
          )}
          {mode === "create" ? "Créer le modèle" : "Enregistrer"}
        </Button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left: Config panel or Code editor */}
        {tc.editorMode === "visual" ? (
          <ScrollArea className="w-96 shrink-0 rounded-lg border bg-card">
            <div className="p-4">
              <Accordion
                type="multiple"
                defaultValue={[
                  "appearance",
                  "recipient",
                  "dates",
                  "extra",
                  "columns",
                  "totals",
                  "sections",
                ]}
              >
                {/* ── Apparence ──────────────── */}
                <AccordionItem value="appearance">
                  <AccordionTrigger className="text-sm">
                    Apparence
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-1">
                      <div>
                        <Label className="text-xs">Titre du document</Label>
                        <Input
                          value={tc.config.title}
                          onChange={(e) =>
                            tc.updateConfig({ title: e.target.value })
                          }
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Couleur principale</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="color"
                            value={tc.config.primaryColor}
                            onChange={(e) =>
                              tc.updateConfig({ primaryColor: e.target.value })
                            }
                            className="h-8 w-10 cursor-pointer rounded border p-0.5"
                          />
                          <Input
                            value={tc.config.primaryColor}
                            onChange={(e) =>
                              tc.updateConfig({ primaryColor: e.target.value })
                            }
                            className="h-8 w-24 font-mono text-xs"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* ── Destinataire ────────────── */}
                <AccordionItem value="recipient">
                  <AccordionTrigger className="text-sm">
                    Destinataire
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-1">
                      <div>
                        <Label className="text-xs">Libellé de la section</Label>
                        <Input
                          value={tc.config.recipientLabel}
                          onChange={(e) =>
                            tc.updateConfig({ recipientLabel: e.target.value })
                          }
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type de destinataire</Label>
                        <Select
                          value={tc.config.recipientPrefix}
                          onValueChange={(v) =>
                            tc.updateConfig({ recipientPrefix: v })
                          }
                        >
                          <SelectTrigger className="mt-1 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="supplier">
                              Fournisseur
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* ── Dates ───────────────────── */}
                <AccordionItem value="dates">
                  <AccordionTrigger className="text-sm">Dates</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {tc.config.dates.map((date, i) => (
                        <div
                          key={date.field}
                          className="flex items-center gap-2"
                        >
                          <Input
                            value={date.label}
                            onChange={(e) =>
                              tc.updateDate(i, { label: e.target.value })
                            }
                            className="h-7 flex-1 text-xs"
                            placeholder="Libellé"
                          />
                          <Select
                            value={date.field}
                            onValueChange={(v) =>
                              tc.updateDate(i, { field: v })
                            }
                          >
                            <SelectTrigger className="h-7 w-40 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {tc.dateFields.map((f) => (
                                <SelectItem
                                  key={f.field}
                                  value={f.field}
                                  className="text-xs"
                                >
                                  {f.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <button
                            type="button"
                            onClick={() => tc.removeDate(i)}
                            className="shrink-0 rounded p-1 text-xs text-destructive hover:bg-destructive/10"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {tc.dateFields.length > tc.config.dates.length && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={tc.addDate}
                        >
                          + Ajouter une date
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* ── Extra fields ────────────── */}
                {tc.extraFieldOptions.length > 0 && (
                  <AccordionItem value="extra">
                    <AccordionTrigger className="text-sm">
                      Champs supplémentaires
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-1">
                        {(tc.config.extraFields ?? []).map((field, i) => (
                          <div
                            key={field.field}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                tc.updateExtraField(i, {
                                  label: e.target.value,
                                })
                              }
                              className="h-7 flex-1 text-xs"
                              placeholder="Libellé"
                            />
                            <Select
                              value={field.field}
                              onValueChange={(v) =>
                                tc.updateExtraField(i, { field: v })
                              }
                            >
                              <SelectTrigger className="h-7 w-40 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {tc.extraFieldOptions.map((f) => (
                                  <SelectItem
                                    key={f.field}
                                    value={f.field}
                                    className="text-xs"
                                  >
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <button
                              type="button"
                              onClick={() => tc.removeExtraField(i)}
                              className="shrink-0 rounded p-1 text-xs text-destructive hover:bg-destructive/10"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {tc.extraFieldOptions.length >
                          (tc.config.extraFields ?? []).length && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={tc.addExtraField}
                          >
                            + Ajouter un champ
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* ── Colonnes ────────────────── */}
                <AccordionItem value="columns">
                  <AccordionTrigger className="text-sm">
                    Colonnes du tableau
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {tc.config.columns.map((col, i) => (
                        <div
                          key={`col-${col.field}-${i}`}
                          className="flex items-start gap-1.5 rounded-md border p-2"
                        >
                          <div className="flex-1 space-y-1.5">
                            <Input
                              value={col.header}
                              onChange={(e) =>
                                tc.updateColumn(i, { header: e.target.value })
                              }
                              placeholder="En-tête"
                              className="h-7 text-xs"
                            />
                            <Select
                              value={col.field}
                              onValueChange={(v) =>
                                tc.updateColumn(i, { field: v })
                              }
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {tc.lineFields.map((f) => (
                                  <SelectItem
                                    key={f.field}
                                    value={f.field}
                                    className="text-xs"
                                  >
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-0.5 pt-0.5">
                            <button
                              type="button"
                              disabled={i === 0}
                              onClick={() => tc.moveColumn(i, -1)}
                              className="rounded px-1 text-[10px] leading-tight text-muted-foreground hover:bg-accent disabled:opacity-30"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={i === tc.config.columns.length - 1}
                              onClick={() => tc.moveColumn(i, 1)}
                              className="rounded px-1 text-[10px] leading-tight text-muted-foreground hover:bg-accent disabled:opacity-30"
                            >
                              ▼
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => tc.removeColumn(i)}
                            className="mt-1 shrink-0 rounded p-1 text-xs text-destructive hover:bg-destructive/10"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {tc.lineFields.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={tc.addColumn}
                        >
                          + Ajouter une colonne
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* ── Totaux ──────────────────── */}
                {tc.totalFields.length > 0 && (
                  <AccordionItem value="totals">
                    <AccordionTrigger className="text-sm">
                      Totaux
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-1">
                        {tc.config.totals.map((total, i) => (
                          <div
                            key={`total-${total.field}-${i}`}
                            className="flex items-start gap-1.5 rounded-md border p-2"
                          >
                            <div className="flex-1 space-y-1.5">
                              <Input
                                value={total.label}
                                onChange={(e) =>
                                  tc.updateTotal(i, { label: e.target.value })
                                }
                                placeholder="Libellé"
                                className="h-7 text-xs"
                              />
                              <Select
                                value={total.field}
                                onValueChange={(v) =>
                                  tc.updateTotal(i, { field: v })
                                }
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {tc.totalFields.map((f) => (
                                    <SelectItem
                                      key={f.field}
                                      value={f.field}
                                      className="text-xs"
                                    >
                                      {f.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-3 pt-0.5">
                                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Checkbox
                                    checked={total.bold ?? false}
                                    onCheckedChange={(v) =>
                                      tc.updateTotal(i, { bold: !!v })
                                    }
                                  />
                                  Gras
                                </label>
                                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Checkbox
                                    checked={total.highlight ?? false}
                                    onCheckedChange={(v) =>
                                      tc.updateTotal(i, { highlight: !!v })
                                    }
                                  />
                                  Surligné
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col gap-0.5 pt-0.5">
                              <button
                                type="button"
                                disabled={i === 0}
                                onClick={() => tc.moveTotal(i, -1)}
                                className="rounded px-1 text-[10px] leading-tight text-muted-foreground hover:bg-accent disabled:opacity-30"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={i === tc.config.totals.length - 1}
                                onClick={() => tc.moveTotal(i, 1)}
                                className="rounded px-1 text-[10px] leading-tight text-muted-foreground hover:bg-accent disabled:opacity-30"
                              >
                                ▼
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => tc.removeTotal(i)}
                              className="mt-1 shrink-0 rounded p-1 text-xs text-destructive hover:bg-destructive/10"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={tc.addTotal}
                        >
                          + Ajouter un total
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* ── Sections ────────────────── */}
                <AccordionItem value="sections">
                  <AccordionTrigger className="text-sm">
                    Sections facultatives
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Coordonnées bancaires</Label>
                        <Switch
                          size="sm"
                          checked={tc.config.showBank ?? false}
                          onCheckedChange={(v) =>
                            tc.updateConfig({ showBank: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Notes / commentaires</Label>
                        <Switch
                          size="sm"
                          checked={tc.config.showNotes ?? false}
                          onCheckedChange={(v) =>
                            tc.updateConfig({ showNotes: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Section DGI (QR code)</Label>
                        <Switch
                          size="sm"
                          checked={tc.config.showDgi ?? false}
                          onCheckedChange={(v) =>
                            tc.updateConfig({ showDgi: v })
                          }
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        ) : (
          /* Code editor */
          <div className="flex flex-1 flex-col rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-1.5">
              <HugeiconsIcon
                icon={Code}
                className="h-4 w-4 text-muted-foreground"
              />
              <span className="text-xs font-medium text-muted-foreground">
                Éditeur HTML
              </span>
            </div>
            <textarea
              value={tc.rawContent}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                tc.setRawContent(e.target.value)
              }
              className="flex-1 resize-none bg-background p-4 font-mono text-xs leading-relaxed outline-none"
              placeholder="Collez votre HTML ici..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview */}
        <div className="flex flex-1 flex-col rounded-lg border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-1.5">
            <HugeiconsIcon
              icon={EyeIcon}
              className="h-4 w-4 text-muted-foreground"
            />
            <span className="text-xs font-medium text-muted-foreground">
              Aperçu
            </span>
          </div>
          <div className="flex-1 overflow-auto bg-white p-2">
            <iframe
              ref={previewRef}
              title="Aperçu du template"
              className="h-full w-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
