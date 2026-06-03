"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BalanceScaleIcon,
  Building01Icon,
  Location01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
interface CompanyData {
  name?: string | null;
  legalForm?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  ifu?: string | null;
  rccm?: string | null;
  logoUrl?: string | null;
}

interface Props {
  company?: CompanyData | null;
}

export function CompanyHeaderCard({ company }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Logo */}
          <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {company?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt={company.name ?? "Logo entreprise"}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <HugeiconsIcon
                  icon={Building01Icon}
                  className="size-10 text-muted-foreground/50"
                />
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate">
              {company?.name || "Entreprise sans nom"}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {company?.legalForm && (
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={BalanceScaleIcon} className="size-3.5" />
                  {company.legalForm}
                </span>
              )}
              {company?.city && (
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
                  {company.city}, {company.country}
                </span>
              )}
              {company?.email && (
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                  {company.email}
                </span>
              )}
            </div>
            {company?.ifu && (
              <p className="mt-2 text-xs text-muted-foreground">
                IFU : {company.ifu} | RCCM : {company.rccm}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
