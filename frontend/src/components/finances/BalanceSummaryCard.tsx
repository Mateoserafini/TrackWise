'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatters';

export interface BalanceSummaryProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  currency?: string;
}

export function BalanceSummaryCard({
  totalIncome,
  totalExpense,
  netBalance,
  currency = 'USD',
}: BalanceSummaryProps) {
  const isPositiveNet = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 01. Total Ingresos */}
      <Card
        indexTag="[01 // INFLOW]"
        className="border-emerald-500/20 bg-gradient-to-b from-raisin-900 to-raisin-950 hover:border-emerald-500/40"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs uppercase tracking-wider text-timberwolf-400">
            Ingresos del Mes
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="font-mono text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight">
          +{formatCurrency(totalIncome, currency)}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
          <span className="font-mono text-[10px] text-timberwolf-500 uppercase tracking-wider">
            Total acreditado
          </span>
        </div>
      </Card>

      {/* 02. Total Gastos */}
      <Card
        indexTag="[02 // OUTFLOW]"
        className="border-coral-500/20 bg-gradient-to-b from-raisin-900 to-raisin-950 hover:border-coral-500/40"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs uppercase tracking-wider text-timberwolf-400">
            Gastos del Mes
          </span>
          <div className="w-8 h-8 rounded-lg bg-coral-500/15 text-coral-400 flex items-center justify-center border border-coral-500/30">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="font-mono text-2xl lg:text-3xl font-extrabold text-coral-400 tracking-tight">
          -{formatCurrency(totalExpense, currency)}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-coral-500 shadow-[0_0_6px_#FC2626]" />
          <span className="font-mono text-[10px] text-timberwolf-500 uppercase tracking-wider">
            Total debitado
          </span>
        </div>
      </Card>

      {/* 03. Balance Neto */}
      <Card
        indexTag="[03 // NET_BALANCE]"
        className="border-timberwolf-300/20 bg-gradient-to-b from-raisin-900 to-raisin-950 hover:border-timberwolf-300/40"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs uppercase tracking-wider text-timberwolf-400">
            Balance Neto
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isPositiveNet
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-coral-500/15 text-coral-400 border-coral-500/30'
            }`}
          >
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div
          className={`font-mono text-2xl lg:text-3xl font-extrabold tracking-tight ${
            isPositiveNet ? 'text-timberwolf-100' : 'text-coral-400'
          }`}
        >
          {isPositiveNet ? '+' : ''}
          {formatCurrency(netBalance, currency)}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPositiveNet
                ? 'bg-emerald-400 shadow-[0_0_6px_#34D399]'
                : 'bg-coral-500 shadow-[0_0_6px_#FC2626]'
            }`}
          />
          <span className="font-mono text-[10px] text-timberwolf-500 uppercase tracking-wider">
            {isPositiveNet ? 'Superávit mensual' : 'Déficit del período'}
          </span>
        </div>
      </Card>
    </div>
  );
}
