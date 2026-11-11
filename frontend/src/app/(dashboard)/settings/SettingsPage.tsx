'use client';

import React, { useState } from 'react';
import {
  Download,
  FolderKanban,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { CategoryManagerModal } from '@/components/finances/CategoryManagerModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { financeService } from '@/services/financeService';
import { habitService } from '@/services/habitService';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const [txRes, habitsRes, catRes] = await Promise.all([
        financeService.getTransactions(),
        habitService.getHabits(),
        Promise.resolve({ success: true, data: categories }),
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user?.id,
          username: user?.username,
          email: user?.email,
        },
        transactions: txRes.success ? txRes.data : [],
        habits: habitsRes.success ? habitsRes.data : [],
        categories: catRes.success ? catRes.data : [],
      };

      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trackwise-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toastSuccess('Backup generado', 'Tus datos fueron exportados en formato JSON.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al exportar los datos';
      toastError('Error', msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-raisin-border">
        <span className="font-mono text-[10px] text-coral-400 font-bold uppercase tracking-widest bg-coral-500/10 px-2 py-0.5 rounded border border-coral-500/20">
          SYS // PREFERENCES
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-timberwolf-100 font-sans tracking-tight mt-1">
          Ajustes del Sistema
        </h1>
        <p className="text-xs sm:text-sm text-timberwolf-400">
          Gestiona tu perfil, preferencias de visualización, moneda y respaldos de datos.
        </p>
      </div>

      {/* 1. Perfil de Usuario */}
      <Card
        indexTag="[01 // IDENTITY]"
        title="Perfil de Usuario"
        subtitle="Datos vinculados a tu cuenta de TrackWise"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-raisin-850/80 border border-raisin-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-coral-500/20 border border-coral-500/40 text-coral-400 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-timberwolf-100">
                  {user?.username || 'Usuario'}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFICADO
                </span>
              </div>
              <p className="font-mono text-xs text-timberwolf-400 mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="font-mono text-[10px] text-timberwolf-500 uppercase tracking-wider">
            ID // {user?.id?.slice(0, 8)}...
          </div>
        </div>
      </Card>

      {/* 2. Categorías Financieras */}
      <Card
        indexTag="[02 // CATEGORIES]"
        title="Categorías Financieras"
        subtitle="Administra los iconos, nombres y colores de gastos e ingresos"
      >
        <div className="flex items-center justify-between p-4 rounded-xl bg-raisin-850/80 border border-raisin-border">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-timberwolf-100">
              {categories.length} Categorías activas
            </p>
            <p className="text-xs text-timberwolf-500 mt-0.5">
              Personaliza el catálogo de categorías del sistema y añade las tuyas.
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsCatModalOpen(true)}
            leftIcon={<FolderKanban className="w-4 h-4" />}
          >
            Abrir Gestor
          </Button>
        </div>
      </Card>

      {/* 3. Preferencias de Visualización y Moneda */}
      <Card
        indexTag="[03 // ENVIRONMENT]"
        title="Preferencias de Visualización"
        subtitle="Moneda por defecto y tema de la interfaz"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Moneda */}
          <div className="p-4 rounded-xl bg-raisin-850/80 border border-raisin-border space-y-2">
            <label className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider">
              Moneda Principal
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-raisin-900 border border-raisin-border text-xs rounded-xl px-3 py-2 text-timberwolf-100 focus:outline-none focus:border-coral-500"
            >
              <option value="USD">USD ($ - Dólar Estadounidense)</option>
              <option value="ARS">ARS ($ - Peso Argentino)</option>
              <option value="EUR">EUR (€ - Euro)</option>
            </select>
          </div>

          {/* Tema */}
          <div className="p-4 rounded-xl bg-raisin-850/80 border border-raisin-border space-y-2 flex flex-col justify-between">
            <span className="block font-mono text-xs font-medium text-timberwolf-300 uppercase tracking-wider">
              Tema Visual
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-timberwolf-400 font-mono">
                {theme === 'dark' ? 'Raisin Black (Oscuro)' : 'Modo Claro'}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleTheme}
                leftIcon={theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
              >
                Alternar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Exportación de Datos */}
      <Card
        indexTag="[04 // DATA_BACKUP]"
        title="Exportar Información Personal"
        subtitle="Descarga una copia completa de tus hábitos y transacciones en formato JSON"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-raisin-850/80 border border-raisin-border">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-timberwolf-100">
              Respaldo portable JSON
            </p>
            <p className="text-xs text-timberwolf-500 mt-0.5">
              Tus datos son 100% tuyos. Puedes exportar todo el historial en un archivo descargable.
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportData}
            isLoading={isExporting}
            leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
          >
            Exportar a JSON
          </Button>
        </div>
      </Card>

      {/* 5. Cierre de Sesión */}
      <Card
        indexTag="[05 // SESSION]"
        title="Sesión Actual"
        subtitle="Cierra la sesión activa en este navegador"
        className="border-coral-500/30"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-timberwolf-400">
            Al cerrar sesión se removerá el token JWT de este dispositivo.
          </p>
          <Button
            size="sm"
            variant="danger"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Cerrar Sesión
          </Button>
        </div>
      </Card>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        onCreateCategory={createCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
      />
    </div>
  );
}
