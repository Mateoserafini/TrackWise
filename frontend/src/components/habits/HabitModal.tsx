'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { WeekDaysSelector } from './WeekDaysSelector';
import { ColorPicker } from '@/components/common/ColorPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Habit, HabitInput } from '@/types/habit.types';

export interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: HabitInput) => Promise<boolean>;
  initialHabit?: Habit | null;
  isLoading?: boolean;
}

export function HabitModal({
  isOpen,
  onClose,
  onSubmit,
  initialHabit,
  isLoading = false,
}: HabitModalProps) {
  const isEditing = !!initialHabit;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [color, setColor] = useState('#10B981');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialHabit) {
        setName(initialHabit.name);
        setDescription(initialHabit.description || '');
        setDaysOfWeek(initialHabit.days_of_week || [0, 1, 2, 3, 4, 5, 6]);
        setColor(initialHabit.color || '#10B981');
      } else {
        setName('');
        setDescription('');
        setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
        setColor('#10B981');
      }
      setError(null);
    }
  }, [isOpen, initialHabit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del hábito es obligatorio');
      return;
    }

    if (daysOfWeek.length === 0) {
      setError('Selecciona al menos un día activo');
      return;
    }

    const ok = await onSubmit({
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      daysOfWeek,
      color,
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Hábito' : 'Nuevo Hábito Diario'}
      tag={isEditing ? '[CONFIG // HABIT_EDIT]' : '[STREAK // HABIT_NEW]'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nombre del hábito *"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="ej. Meditar 15 min, Tomar 2L de agua, Leer 20 págs..."
          error={error || undefined}
          autoFocus
          required
        />

        <Input
          label="Descripción o notas (Opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional: Detalle de rutina, recordatorios o meta..."
        />

        {/* Week Days Selector */}
        <div className="space-y-1.5">
          <label className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider">
            Días activos de la semana
          </label>
          <WeekDaysSelector selectedDays={daysOfWeek} onChange={setDaysOfWeek} />
        </div>

        {/* Color Picker */}
        <div className="space-y-1.5">
          <label className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider">
            Color de racha
          </label>
          <ColorPicker selectedColor={color} onSelectColor={setColor} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-raisin-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={!isEditing ? <Plus className="w-4 h-4" /> : undefined}
          >
            {isEditing ? 'Guardar Cambios' : 'Iniciar Hábito'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
