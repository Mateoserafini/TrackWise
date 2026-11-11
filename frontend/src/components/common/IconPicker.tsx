'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { ALL_ICONS, ICON_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  className?: string;
}

export function IconPicker({ selectedIcon, onSelectIcon, className }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('Todos');

  const categories = useMemo(() => ['Todos', ...Object.keys(ICON_CATEGORIES)], []);

  const filteredIcons = useMemo(() => {
    let icons: string[] = [];
    if (activeTab === 'Todos') {
      icons = ALL_ICONS;
    } else {
      icons = (ICON_CATEGORIES as Record<string, string[]>)[activeTab] || [];
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      icons = icons.filter((name) => name.toLowerCase().includes(q));
    }

    return Array.from(new Set(icons));
  }, [activeTab, search]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Search className="w-4 h-4 text-timberwolf-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar icono..."
          className="w-full bg-raisin-850 border border-raisin-border text-xs rounded-xl pl-9 pr-3 py-2 text-timberwolf-100 placeholder:text-timberwolf-600 focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveTab(cat)}
            className={cn(
              'font-mono text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer uppercase tracking-wider',
              activeTab === cat
                ? 'bg-coral-500/20 text-coral-400 border-coral-500/50'
                : 'bg-raisin-850 text-timberwolf-400 border-raisin-border hover:border-timberwolf-400/40'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 bg-raisin-950/60 rounded-xl border border-raisin-border/80">
        {filteredIcons.map((iconName) => {
          const isSelected = selectedIcon === iconName;
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelectIcon(iconName)}
              title={iconName}
              className={cn(
                'h-10 w-full flex items-center justify-center rounded-lg border transition-all cursor-pointer group',
                isSelected
                  ? 'bg-coral-500 text-white border-coral-400 shadow-[0_0_12px_rgba(252,38,38,0.5)]'
                  : 'bg-raisin-900 text-timberwolf-300 border-raisin-border hover:border-timberwolf-300/40 hover:text-timberwolf-100 hover:bg-raisin-800'
              )}
            >
              <DynamicIcon name={iconName} className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
