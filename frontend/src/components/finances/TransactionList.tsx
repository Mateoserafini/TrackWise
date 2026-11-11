'use client';

import React, { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { TransactionItem } from './TransactionItem';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Transaction } from '@/types/finance.types';

export interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onDeleteTransaction?: (id: string) => Promise<boolean>;
  onOpenCreateModal?: () => void;
  currency?: string;
}

export function TransactionList({
  transactions,
  isLoading = false,
  onDeleteTransaction,
  onOpenCreateModal,
  currency = 'USD',
}: TransactionListProps) {
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!selectedTxId || !onDeleteTransaction) return;
    setIsDeleting(true);
    try {
      await onDeleteTransaction(selectedTxId);
      setSelectedTxId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="w-6 h-6" />}
        tag="[FIN // NO_RECORDS]"
        title="Sin movimientos registrados"
        description="No hay transacciones registradas para este filtro o período. Agrega un gasto o ingreso para comenzar."
        actionLabel="Registrar Movimiento"
        onAction={onOpenCreateModal}
      />
    );
  }

  return (
    <>
      <div className="space-y-2.5">
        {transactions.map((tx) => (
          <TransactionItem
            key={tx.id}
            transaction={tx}
            onDelete={onDeleteTransaction ? (id) => setSelectedTxId(id) : undefined}
            currency={currency}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!selectedTxId}
        onClose={() => setSelectedTxId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Transacción"
        description="¿Estás seguro de que deseas eliminar este movimiento financiero? Esta acción recalculará los totales y no se puede deshacer."
        confirmLabel="Sí, eliminar"
        isLoading={isDeleting}
      />
    </>
  );
}
