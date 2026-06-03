// @ts-nocheck
"use client";

import { ErrorState, LoadingState } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { api } from "@/trpc/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  value: { label: "Volume", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function SettingsDashboardChart() {
  const { data, isLoading, isError, error, refetch } =
    api.settings.dashboard.getChart.useQuery({});
  const chartData = (data?.chartData ?? []) as Array<{
    label: string;
    value: number;
  }>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vue d'ensemble paramétrage</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState message="Chargement du graphique paramétrage..." />
        ) : isError ? (
          <ErrorState
            message={error?.message ?? "Impossible de charger le graphique."}
            onRetry={() => refetch()}
            compact
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={6} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
