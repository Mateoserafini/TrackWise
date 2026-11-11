'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { HeatmapDay } from '@/types/habit.types';

export interface HabitHeatmapProps {
  data: HeatmapDay[];
  days?: number;
  className?: string;
}

export function HabitHeatmap({ data, days = 84, className }: HabitHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate date cells for the last `days` days ending today (usando estrictamente la zona horaria local)
  const calendarDays = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of data) {
      map.set(d.date, d.count);
    }

    const result: { date: string; count: number; dayOfWeek: number }[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    for (let i = days - 1; i >= 0; i--) {
      // Fecha en calendario local exacto, sin conversiones a UTC
      const d = new Date(currentYear, currentMonth, currentDate - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayNum}`;
      const count = map.get(dateStr) || 0;

      result.push({
        date: dateStr,
        count,
        dayOfWeek: d.getDay(), // 0 Sun, 1 Mon, ...
      });
    }

    return result;
  }, [data, days]);

  const totalCompletions = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  const activeDaysCount = useMemo(() => {
    return data.filter((d) => d.count > 0).length;
  }, [data]);

  // Group into columns of 7 days (weeks)
  const weeks = useMemo(() => {
    const list: typeof calendarDays[] = [];
    let currentWeek: typeof calendarDays = [];

    calendarDays.forEach((item, index) => {
      currentWeek.push(item);
      if (currentWeek.length === 7 || index === calendarDays.length - 1) {
        list.push(currentWeek);
        currentWeek = [];
      }
    });

    return list;
  }, [calendarDays]);

  // En pantallas móviles (< 1024px), deslizar automáticamente hacia la derecha (hoy) al cargar
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [weeks]);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-raisin-800/80 border-raisin-border hover:border-timberwolf-300/40';
    if (count === 1) return 'bg-emerald-950/60 border-emerald-500/40 hover:border-emerald-400';
    if (count === 2) return 'bg-emerald-700/80 border-emerald-400/60 hover:border-emerald-300';
    return 'bg-emerald-500 border-emerald-300 text-raisin-950 shadow-[0_0_8px_rgba(16,185,129,0.7)]';
  };

  return (
    <Card
      indexTag="[MATRIX // 90_DAYS]"
      title="Mapa de Consistencia"
      subtitle="Frecuencia de cumplimiento de hábitos"
      className={cn('w-full min-w-0 max-w-full overflow-hidden flex flex-col justify-between', className)}
      action={
        <div className="flex items-center gap-1.5 sm:gap-3 font-mono text-[10px] sm:text-xs text-timberwolf-400 flex-wrap justify-end">
          <div>
            <span className="text-emerald-400 font-bold">{totalCompletions}</span> check-ins
          </div>
          <span>•</span>
          <div>
            <span className="text-timberwolf-100 font-bold">{activeDaysCount}</span> días activos
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-2 w-full min-w-0 max-w-full overflow-hidden flex-1 flex flex-col justify-between">
        {/* Heatmap Grid con auto-scroll a las semanas más recientes */}
        <div
          ref={scrollContainerRef}
          className="w-full max-w-full overflow-x-auto min-w-0 pb-2 scrollbar-thin scroll-smooth"
        >
          <div className="flex gap-1.5 min-w-[460px] sm:min-w-[480px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
                {week.map((item) => (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => setHoveredDay({ date: item.date, count: item.count })}
                    onMouseEnter={() => setHoveredDay({ date: item.date, count: item.count })}
                    onMouseLeave={() => setHoveredDay(null)}
                    aria-label={`${formatDate(item.date)}: ${item.count} hábitos completados`}
                    className={`aspect-square w-full rounded-md border transition-all duration-150 cursor-pointer ${getIntensityClass(
                      item.count
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer & Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-3 border-t border-raisin-border shrink-0">
          {/* Tooltip detail bar */}
          <div className="font-mono text-xs text-timberwolf-300 min-h-[20px] text-center sm:text-left">
            {hoveredDay ? (
              <span className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-coral-400 font-bold">[{formatDate(hoveredDay.date)}]</span>
                <span>
                  {hoveredDay.count} {hoveredDay.count === 1 ? 'hábito cumplido' : 'hábitos cumplidos'}
                </span>
              </span>
            ) : (
              <span className="text-timberwolf-500">
                Pasa el mouse o toca una casilla para ver el detalle.
              </span>
            )}
          </div>

          {/* Scale */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-timberwolf-500 shrink-0">
            <span>Menos</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-raisin-800 border border-raisin-border" />
              <span className="w-3 h-3 rounded bg-emerald-950/60 border border-emerald-500/40" />
              <span className="w-3 h-3 rounded bg-emerald-700/80 border border-emerald-400/60" />
              <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-300 shadow-[0_0_6px_#10B981]" />
            </div>
            <span>Más</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
