'use client';

import React, { useState } from 'react';
import { Plus, Settings2, Trash2 } from 'lucide-react';
import { ColorPicker } from '@/components/common/ColorPicker';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { IconPicker } from '@/components/common/IconPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { Category, CategoryInput, CategoryType } from '@/types/category.types';

export interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreateCategory: (input: CategoryInput) => Promise<boolean>;
  onUpdateCategory: (id: string, input: Partial<CategoryInput>) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isLoading = false,
}: CategoryManagerModalProps) {
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#FC2626');
  const [type, setType] = useState<CategoryType>('EXPENSE');
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const startCreate = () => {
    setSelectedCat(null);
    setIsCreating(true);
    setName('');
    setIcon('Tag');
    setColor('#FC2626');
    setType('EXPENSE');
  };

  const startEdit = (cat: Category) => {
    setSelectedCat(cat);
    setIsCreating(false);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setType(cat.type);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isCreating) {
      const ok = await onCreateCategory({
        name: name.trim(),
        icon,
        color,
        type,
      });
      if (ok) {
        setIsCreating(false);
        setSelectedCat(null);
      }
    } else if (selectedCat) {
      const ok = await onUpdateCategory(selectedCat.id, {
        name: name.trim(),
        icon,
        color,
        type,
      });
      if (ok) {
        setSelectedCat(null);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteCatId) return;
    const ok = await onDeleteCategory(deleteCatId);
    if (ok) {
      setDeleteCatId(null);
      if (selectedCat?.id === deleteCatId) {
        setSelectedCat(null);
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gestor de Categorías"
        tag="[CONFIG // CATEGORIES]"
        maxWidth="lg"
      >
        <div className="space-y-6">
          {!isCreating && !selectedCat ? (
            <>
              {/* Header with New Button */}
              <div className="flex items-center justify-between pb-2">
                <span className="font-mono text-xs uppercase tracking-wider text-timberwolf-400">
                  Categorías Disponibles ({categories.length})
                </span>
                <Button size="sm" variant="primary" onClick={startCreate} leftIcon={<Plus className="w-4 h-4" />}>
                  Nueva Categoría
                </Button>
              </div>

              {/* Grid of categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-raisin-850/80 border border-raisin-border hover:border-timberwolf-300/30 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                      >
                        <DynamicIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-timberwolf-100 block truncate">
                          {cat.name}
                        </span>
                        <span className="font-mono text-[9px] text-timberwolf-500 uppercase tracking-wider">
                          {cat.type === 'BOTH' ? 'Ambos' : cat.type === 'EXPENSE' ? 'Gasto' : 'Ingreso'}
                          {cat.is_default && ' • Sistema'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        title="Personalizar categoría"
                        className="p-1.5 rounded-lg text-timberwolf-400 hover:text-timberwolf-100 hover:bg-raisin-700 transition-colors cursor-pointer"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      {!cat.is_default && cat.user_id && (
                        <button
                          type="button"
                          onClick={() => setDeleteCatId(cat.id)}
                          title="Eliminar categoría"
                          className="p-1.5 rounded-lg text-timberwolf-500 hover:text-coral-400 hover:bg-raisin-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-raisin-border">
                <span className="font-mono text-xs uppercase tracking-wider text-coral-400 font-bold">
                  {isCreating ? '// CREAR NUEVA CATEGORÍA' : `// EDITAR: ${selectedCat?.name}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedCat(null);
                  }}
                  className="font-mono text-xs text-timberwolf-400 hover:text-timberwolf-100 cursor-pointer"
                >
                  Volver al listado
                </button>
              </div>

              <Input
                label="Nombre de la categoría *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Gimnasio, Software, Café..."
                required
                autoFocus
              />

              {/* Type selector */}
              <div className="space-y-1.5">
                <label className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider">
                  Aplica para
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EXPENSE', 'INCOME', 'BOTH'] as CategoryType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        'py-2 rounded-xl font-mono text-xs font-medium border uppercase tracking-wider transition-all cursor-pointer',
                        type === t
                          ? 'border-coral-500 bg-raisin-800 text-coral-400 shadow-[0_0_10px_rgba(252,38,38,0.25)]'
                          : 'border-raisin-border bg-raisin-900 text-timberwolf-400 hover:border-timberwolf-300/30'
                      )}
                    >
                      {t === 'EXPENSE' ? 'Gastos' : t === 'INCOME' ? 'Ingresos' : 'Ambos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-1.5">
                <label className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider">
                  Color distintivo
                </label>
                <ColorPicker selectedColor={color} onSelectColor={setColor} />
              </div>

              {/* Icon picker */}
              <div className="space-y-1.5">
                <label className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider">
                  Icono representativo
                </label>
                <IconPicker selectedIcon={icon} onSelectIcon={setIcon} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-raisin-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedCat(null);
                  }}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isLoading}>
                  {isCreating ? 'Crear Categoría' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Si tiene transacciones financieras asignadas, el servidor no permitirá borrarla."
        confirmLabel="Sí, eliminar"
        isLoading={isLoading}
      />
    </>
  );
}
