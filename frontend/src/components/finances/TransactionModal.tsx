'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Calendar, DollarSign, Plus } from 'lucide-react';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getTodayDateString } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Category } from '@/types/category.types';
import { TransactionInput, TransactionType } from '@/types/finance.types';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: TransactionInput) => Promise<boolean>;
  categories: Category[];
  isLoading?: boolean;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isLoading = false,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; categoryId?: string }>({});

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === 'BOTH' || c.type === type);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setDate(getTodayDateString());
      setErrors({});
      // Select first available category by default
      const first = categories.find((c) => c.type === 'BOTH' || c.type === type);
      if (first) {
        setCategoryId(first.id);
      }
    }
  }, [isOpen, type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { amount?: string; categoryId?: string } = {};

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Ingresa un monto válido mayor a 0';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Debes seleccionar una categoría';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await onSubmit({
      categoryId,
      type,
      amount: numAmount,
      date,
      description: description.trim() ? description.trim() : null,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Movimiento Financiero"
      tag="[RECORD // TX_NEW]"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-raisin-950 rounded-xl border border-raisin-border">
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={cn(
              'flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
              type === 'EXPENSE'
                ? 'bg-coral-500 text-white shadow-brutal border border-coral-400'
                : 'text-timberwolf-400 hover:text-timberwolf-200'
            )}
          >
            <ArrowDownRight className="w-4 h-4" />
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={cn(
              'flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
              type === 'INCOME'
                ? 'bg-emerald-500 text-white shadow-brutal border border-emerald-400'
                : 'text-timberwolf-400 hover:text-timberwolf-200'
            )}
          >
            <ArrowUpRight className="w-4 h-4" />
            Ingreso
          </button>
        </div>

        {/* Amount Input */}
        <Input
          label="Monto *"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
          }}
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={errors.amount}
          autoFocus
          required
        />

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider">
            Categoría *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-raisin-950/60 rounded-xl border border-raisin-border">
            {availableCategories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: undefined }));
                  }}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer truncate',
                    isSelected
                      ? 'border-coral-500 bg-raisin-800 text-timberwolf-100 shadow-[0_0_10px_rgba(252,38,38,0.3)]'
                      : 'border-raisin-border bg-raisin-900 text-timberwolf-400 hover:border-timberwolf-300/30 hover:text-timberwolf-200'
                  )}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                  >
                    <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs truncate font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
          {errors.categoryId && (
            <p className="font-mono text-xs text-coral-400 mt-1">⚠ {errors.categoryId}</p>
          )}
        </div>

        {/* Description Input (100% Opcional) */}
        <Input
          label="Descripción (Opcional)"
          type="text"
          placeholder="Opcional: ej. Almuerzo afuera, Café, Nafta..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          helperText="Si no escribes nada, se guardará con el nombre de la categoría."
        />

        {/* Date Input */}
        <Input
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          leftIcon={<Calendar className="w-4 h-4" />}
          required
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-raisin-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Guardar Movimiento
          </Button>
        </div>
      </form>
    </Modal>
  );
}
