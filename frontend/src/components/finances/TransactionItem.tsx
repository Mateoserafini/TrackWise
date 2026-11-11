'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Transaction } from '@/types/finance.types';

export interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  currency?: string;
}

export function TransactionItem({
  transaction,
  onDelete,
  currency = 'USD',
}: TransactionItemProps) {
  const isIncome = transaction.type === 'INCOME';
  const categoryColor = transaction.category_color || '#94A3B8';
  const categoryIcon = transaction.category_icon || 'Tag';
  const categoryName = transaction.category_name || 'General';

  return (
    <div className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-raisin-850/60 border border-raisin-border hover:border-timberwolf-300/30 hover:bg-raisin-850 transition-all duration-150">
      {/* Left: Icon & Info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: `${categoryColor}18`,
            borderColor: `${categoryColor}40`,
            color: categoryColor,
          }}
        >
          <DynamicIcon name={categoryIcon} className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs sm:text-sm text-timberwolf-100 truncate">
              {transaction.description ? transaction.description : categoryName}
            </span>
            {transaction.description && (
              <span
                className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.2 rounded border"
                style={{
                  backgroundColor: `${categoryColor}12`,
                  borderColor: `${categoryColor}30`,
                  color: categoryColor,
                }}
              >
                {categoryName}
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-timberwolf-500 mt-0.5">
            {formatDate(transaction.date)}
          </p>
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div className="flex items-center gap-3 shrink-0 pl-2">
        <div
          className={`font-mono text-xs sm:text-sm font-bold text-right tracking-tight ${
            isIncome ? 'text-emerald-400' : 'text-coral-400'
          }`}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(Number(transaction.amount), currency)}
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(transaction.id)}
            title="Eliminar movimiento"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-timberwolf-500 hover:text-coral-400 hover:bg-raisin-700 transition-all cursor-pointer"
            aria-label="Eliminar movimiento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
