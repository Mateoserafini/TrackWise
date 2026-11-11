'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatters';
import { MonthlyComparison } from '@/types/finance.types';

export interface IncomeExpenseBarChartProps {
  data: MonthlyComparison[];
  currency?: string;
}

export function IncomeExpenseBarChart({ data, currency = 'USD' }: IncomeExpenseBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card
        indexTag="[CHART // 02]"
        title="Historial Mensual"
        subtitle="Comparativa de Ingresos vs Egresos"
      >
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-timberwolf-500">
          <p className="font-mono text-xs uppercase tracking-wider mb-1">
            Sin datos comparativos
          </p>
          <p className="text-xs text-timberwolf-600 max-w-xs">
            Registra transacciones para ver la evolución de tus finanzas en los últimos meses.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      indexTag="[CHART // 02]"
      title="Historial Mensual"
      subtitle="Comparativa de Ingresos vs Egresos"
    >
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
            <XAxis
              dataKey="period"
              stroke="#8C877D"
              fontSize={11}
              tickLine={false}
              fontFamily="monospace"
            />
            <YAxis
              stroke="#8C877D"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              fontFamily="monospace"
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-raisin-950 border border-timberwolf-300/30 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                      <p className="font-mono text-[11px] font-bold text-timberwolf-300 mb-2">
                        PERÍODO // {label}
                      </p>
                      {payload.map((entry) => (
                        <div
                          key={entry.dataKey}
                          className="flex items-center justify-between gap-4 text-xs font-mono py-0.5"
                        >
                          <span
                            className="font-medium"
                            style={{ color: entry.color }}
                          >
                            {entry.name}:
                          </span>
                          <span className="font-bold text-timberwolf-100">
                            {formatCurrency(Number(entry.value), currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
            />
            <Bar
              name="Ingresos"
              dataKey="income"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              name="Gastos"
              dataKey="expense"
              fill="#FC2626"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
