import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Flame,
  Trophy,
  Filter,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { TimeLog, Activity } from '../domain/types';
import {
  calculateHeatmapData,
  type HeatmapDayData,
} from '../domain/heatmap';

export interface ActivityHeatmapProps {
  timeLogs: TimeLog[];
  activities: Activity[];
  endDate?: Date;
  numWeeks?: number;
  className?: string;
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-slate-950/70 border-slate-800/90 hover:border-slate-600',
  1: 'bg-amber-950/70 border-amber-900/80 hover:border-amber-700',
  2: 'bg-amber-700/80 border-amber-600/90 hover:border-amber-500',
  3: 'bg-amber-500 border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.35)] hover:border-amber-300',
  4: 'bg-yellow-400 border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.55)] hover:border-yellow-200',
};

const DAY_LABELS = ['Пн', '', 'Ср', '', 'Пт', '', ''];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  timeLogs,
  activities,
  endDate,
  numWeeks = 32,
  className = '',
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('all');
  const [hoveredDay, setHoveredDay] = useState<HeatmapDayData | null>(null);

  const activitiesMap = useMemo(() => {
    return new Map(activities.map((a) => [a.id, a]));
  }, [activities]);

  const { grid, stats } = useMemo(() => {
    return calculateHeatmapData({
      timeLogs,
      activities,
      filterActivityId: selectedActivityId === 'all' ? undefined : selectedActivityId,
      endDate,
      numWeeks,
    });
  }, [timeLogs, activities, selectedActivityId, endDate, numWeeks]);

  const totalHours = Math.round((stats.totalMinutes / 60) * 10) / 10;

  const formatDateRu = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} мин`;
    if (m === 0) return `${h} ч`;
    return `${h} ч ${m} мин`;
  };

  return (
    <div
      data-testid="activity-heatmap"
      className={`bg-slate-900/90 border-2 border-amber-600/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative ${className}`}
    >
      {/* Шапка тепловой карты */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
            🏛️
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <span>Летопись Подвигов</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Тепловая карта продуктивности • Ежедневная плотность практики в стиле GitHub
            </p>
          </div>
        </div>

        {/* Фильтр по направлению */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Все занятия</option>
            {activities.map((act) => (
              <option key={act.id} value={act.id}>
                {act.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Статистические показатели */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-800/80 text-xs">
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Активных дней</span>
          </div>
          <div className="text-lg font-black text-amber-300 font-mono">
            {stats.totalActiveDays}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Часов за период</span>
          </div>
          <div className="text-lg font-black text-sky-300 font-mono">
            {totalHours.toFixed(1)} ч
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Текущая серия</span>
          </div>
          <div className="text-lg font-black text-orange-400 font-mono">
            {stats.currentStreak} дн.
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Рекорд серии</span>
          </div>
          <div className="text-lg font-black text-yellow-300 font-mono">
            {stats.longestStreak} дн.
          </div>
        </div>
      </div>

      {/* Календарная сетка тепловой карты */}
      <div className="pt-4 overflow-x-auto no-scrollbar">
        <div className="min-w-fit">
          {/* Строка месяцев над сеткой */}
          <div className="flex text-[10px] font-mono text-slate-400 h-4 mb-1 pl-6">
            {grid.map((week) => (
              <div key={`m-${week.weekIndex}`} className="w-3.5 mr-1 shrink-0 text-left">
                {week.monthLabel && <span>{week.monthLabel}</span>}
              </div>
            ))}
          </div>

          {/* Сетка дней (7 строк) */}
          <div className="flex">
            {/* Метки дней недели слева */}
            <div className="flex flex-col gap-1 pr-2 text-[9px] font-mono text-slate-500 justify-between select-none">
              {DAY_LABELS.map((label, idx) => (
                <div key={idx} className="h-3.5 flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Колонки недель */}
            <div className="flex gap-1">
              {grid.map((week) => (
                <div key={week.weekIndex} className="flex flex-col gap-1 shrink-0">
                  {week.days.map((day, dayIdx) => {
                    if (!day) {
                      return <div key={dayIdx} className="w-3.5 h-3.5 opacity-0" />;
                    }

                    const colorClass = LEVEL_COLORS[day.level] || LEVEL_COLORS[0];

                    return (
                      <div
                        key={day.dateKey}
                        tabIndex={0}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onFocus={() => setHoveredDay(day)}
                        onBlur={() => setHoveredDay(null)}
                        className={`w-3.5 h-3.5 rounded-sm border transition-all duration-150 cursor-pointer ${colorClass}`}
                        aria-label={`${day.dateKey}: ${formatMinutes(day.totalMinutes)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Детальный всплывающий тултип / плашка при наведении */}
      <div className="min-h-12 mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {hoveredDay ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="font-bold text-amber-300">
              {formatDateRu(hoveredDay.date)}:
            </div>
            {hoveredDay.totalMinutes > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-slate-100 font-mono">
                  {formatMinutes(hoveredDay.totalMinutes)}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  {Object.entries(hoveredDay.activityMinutes).map(([actId, mins], i) => {
                    const actName = activitiesMap.get(actId)?.name || 'Занятие';
                    return (
                      <span key={actId}>
                        {i > 0 && ', '}
                        {actName}: <strong className="text-amber-200">{mins} мин</strong>
                      </span>
                    );
                  })}
                </span>
              </div>
            ) : (
              <span className="text-slate-500 italic">Нет записей практики в этот день</span>
            )}
          </div>
        ) : (
          <div className="text-slate-500 text-xs italic">
            Наведите курсор на ячейку дня, чтобы увидеть подробности
          </div>
        )}

        {/* Легенда интенсивности */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium self-end sm:self-auto">
          <span>Меньше</span>
          <div className="w-3 h-3 rounded-sm bg-slate-950/70 border border-slate-800" title="0 мин" />
          <div className="w-3 h-3 rounded-sm bg-amber-950/70 border border-amber-900" title="1-30 мин" />
          <div className="w-3 h-3 rounded-sm bg-amber-700/80 border border-amber-600" title="31-60 мин" />
          <div className="w-3 h-3 rounded-sm bg-amber-500 border border-amber-400" title="61-120 мин" />
          <div className="w-3 h-3 rounded-sm bg-yellow-400 border border-yellow-300" title="120+ мин" />
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
};
