import React, { useState } from 'react';
import {
  Trophy,
  Lock,
  CheckCircle2,
  Sparkles,
  Shield,
  Hourglass,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import type { AchievementWithDetails, AchievementCategory } from '../domain/types';

interface TempleOfAchievementsProps {
  achievements: AchievementWithDetails[];
  className?: string;
}

const CATEGORY_TABS: { key: AchievementCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'Все достижения', icon: '🏛️' },
  { key: 'cronus', label: 'Дары Кроноса', icon: '⏳' },
  { key: 'heracles', label: 'Подвиги Геракла', icon: '🦁' },
  { key: 'ariadne', label: 'Нить Ариадны', icon: '🧵' },
  { key: 'muses', label: 'Семь Муз', icon: '🎭' },
  { key: 'secret', label: 'Тайны Олимпа', icon: '🔒' },
];

export const TempleOfAchievements: React.FC<TempleOfAchievementsProps> = ({
  achievements,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const unlockedCount = achievements.filter((a) => a.unlockedAt != null).length;
  const totalCount = achievements.length;
  const totalPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = achievements.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const formatDate = (ts: number | null) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: AchievementCategory) => {
    switch (category) {
      case 'cronus':
        return <Hourglass className="w-3.5 h-3.5 text-amber-400" />;
      case 'heracles':
        return <Shield className="w-3.5 h-3.5 text-orange-400" />;
      case 'ariadne':
        return <Calendar className="w-3.5 h-3.5 text-cyan-400" />;
      case 'muses':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'secret':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div
      data-testid="temple-of-achievements"
      className={`bg-slate-900/90 border-2 border-amber-600/60 rounded-3xl p-5 sm:p-7 shadow-2xl ${className}`}
    >
      {/* Шапка Храма Достижений */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
            🏛️
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <span>Храм Достижений Олимпа</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Вечные несгораемые регалии за дисциплину, масштаб и верность пути
            </p>
          </div>
        </div>

        {/* Общий прогресс храма */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-2xl self-start sm:self-auto shadow-inner">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Открыто регалий
            </div>
            <div className="text-sm font-black text-amber-300 font-mono">
              {unlockedCount} из {totalCount} ({totalPercent}%)
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center text-xs font-black text-amber-400">
            {totalPercent}%
          </div>
        </div>
      </div>

      {/* Фильтр по категориям */}
      <div className="flex items-center gap-1.5 py-4 overflow-x-auto no-scrollbar border-b border-slate-800/80 mb-5">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = selectedCategory === tab.key;
          const countForTab =
            tab.key === 'all'
              ? achievements.length
              : achievements.filter((a) => a.category === tab.key).length;
          const unlockedForTab =
            tab.key === 'all'
              ? unlockedCount
              : achievements.filter((a) => a.category === tab.key && a.unlockedAt != null).length;

          return (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono text-slate-500 ml-0.5">
                ({unlockedForTab}/{countForTab})
              </span>
            </button>
          );
        })}
      </div>

      {/* Сетка достижений */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredAchievements.map((ach) => {
          const isUnlocked = ach.unlockedAt != null;
          const isSecretLocked = ach.isSecret && !isUnlocked;

          return (
            <div
              key={ach.code}
              data-testid="achievement-card"
              className={`relative rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-gradient-to-br from-slate-900 to-amber-950/20 border-amber-500/70 shadow-lg shadow-amber-950/30'
                  : isSecretLocked
                  ? 'bg-slate-950/50 border-slate-800/80 border-dashed opacity-75'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shadow-inner shrink-0 ${
                        isUnlocked
                          ? 'bg-amber-500/20 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                          : isSecretLocked
                          ? 'bg-slate-900 border-slate-800 text-slate-600'
                          : 'bg-slate-900 border-slate-800 opacity-60'
                      }`}
                    >
                      {isSecretLocked ? <Lock className="w-5 h-5 text-slate-500" /> : ach.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5">
                        {getCategoryIcon(ach.category)}
                        <span className="truncate">{ach.categoryTitle}</span>
                      </div>

                      <h4
                        className={`font-bold text-sm sm:text-base leading-snug truncate ${
                          isUnlocked
                            ? 'text-amber-200 font-extrabold'
                            : isSecretLocked
                            ? 'text-slate-400 italic'
                            : 'text-slate-300'
                        }`}
                      >
                        {isSecretLocked ? 'Скрытое достижение' : ach.title}
                      </h4>
                    </div>
                  </div>

                  {/* Бейдж статуса */}
                  {isUnlocked ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-400/50 text-amber-300">
                      <CheckCircle2 className="w-3 h-3 text-amber-400" />
                      <span>Открыто</span>
                    </span>
                  ) : isSecretLocked ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-500">
                      <HelpCircle className="w-3 h-3" />
                      <span>Тайна</span>
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs font-mono font-bold text-slate-500">
                      {ach.progress} / {ach.maxProgress}
                    </span>
                  )}
                </div>

                {/* Описание достижения */}
                <p className="text-xs text-slate-400 mt-1 mb-3">
                  {isSecretLocked ? 'Выполните тайное условие Олимпа для открытия' : ach.description}
                </p>
              </div>

              {/* Шкала прогресса или метка даты открытия */}
              <div>
                {isUnlocked ? (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-amber-300/80 font-medium">Бессмертная регалия</span>
                    <span>{formatDate(ach.unlockedAt)}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Прогресс</span>
                      <span>{ach.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${ach.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
