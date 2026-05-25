"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { NUMERIC_FONT_FAMILY } from "@/lib/utils/typography";

const COLORS = ["#B8972E", "#D4AF37", "#8B6914", "#E5E0D8"];

interface PurchaseStatusChartProps {
  title: string;
  data: Array<{ name: string; value: number }>;
}

export function PurchaseStatusChart({ title, data }: PurchaseStatusChartProps) {
  return (
    <div className="rounded-card border border-border bg-surface-card p-4 shadow-card sm:p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontFamily: NUMERIC_FONT_FAMILY }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
