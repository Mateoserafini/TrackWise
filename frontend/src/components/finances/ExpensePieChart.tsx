'use client';

import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatters';
import { CategoryExpenseSummary } from '@/types/finance.types';

export interface ExpensePieChartProps {
  data: CategoryExpenseSummary[];
  totalExpense: number;
  currency?: string;
}

export function ExpensePieChart({
  data,
  totalExpense,
  currency = 'USD',
}: ExpensePieChartProps) {
  if (!data || data.length === 0 || totalExpense <= 0) {
    return (
      <Card
        indexTag="[CHART // 01]"
        title="Desglose por Categoría"
        subtitle="Distribución porcentual de gastos"
      >
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-timberwolf-500">
          <p className="font-mono text-xs uppercase tracking-wider mb-1">
            Sin datos de gastos
          </p>
          <p className="text-xs text-timberwolf-600 max-w-xs">
            Registra gastos en el período para ver el desglose porcentual por categorías.
          </p>
        </div>
      </Card>
    );
  }

  // Format data for Recharts
  const chartData = data.map((item) => ({
    name: item.category_name,
    value: Number(item.total),
    color: item.category_color,
    icon: item.category_icon,
    percentage: item.percentage,
  }));

  return (
    <Card
      indexTag="[CHART // 01]"
      title="Desglose por Categoría"
      subtitle="Distribución porcentual de gastos"
    >
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Chart */}
        <div className="w-full lg:w-1/2 h-64 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0]!.payload;
                    return (
                      <div className="bg-raisin-950 border border-timberwolf-300/30 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="font-mono text-xs font-bold text-timberwolf-100">
                            {d.name}
                          </span>
                        </div>
                        <div className="font-mono text-sm font-extrabold text-coral-400">
                          {formatCurrency(d.value, currency)}
                        </div>
                        <span className="font-mono text-[10px] text-timberwolf-400">
                          {d.percentage}% del total
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="#161616"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-mono text-[9px] uppercase tracking-widest text-timberwolf-500">
              TOTAL GASTOS
            </span>
            <span className="font-mono text-sm font-bold text-timberwolf-100">
              {formatCurrency(totalExpense, currency)}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full lg:w-1/2 space-y-2 max-h-64 overflow-y-auto pr-1">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-lg bg-raisin-850/50 border border-raisin-border hover:border-timberwolf-300/20 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}25`, color: item.color }}
                >
                  <DynamicIcon name={item.icon} className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-timberwolf-200 truncate">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[11px] text-timberwolf-400">
                  {item.percentage}%
                </span>
                <span className="font-mono text-xs font-bold text-timberwolf-100">
                  {formatCurrency(item.value, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
