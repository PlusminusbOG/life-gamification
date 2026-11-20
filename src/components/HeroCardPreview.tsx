import React from 'react';
import {
  Sparkles,
  Award,
  Hourglass,
  Trophy,
  Zap,
} from 'lucide-react';
import type { HeroCardPayload } from '../domain/heroCardExport';
import { MAX_PINNED_BADGES } from '../domain/heroCardExport';

export interface HeroCardPreviewProps {
  payload: HeroCardPayload;
  className?: string;
}

export const HeroCardPreview: React.FC<HeroCardPreviewProps> = ({
  payload,
  className = '',
}) => {
  const tierThemes = {
    god: {
      border: 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.35)]',
      avatarRing: 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]',
      badgeBg: 'bg-yellow-950/80 border-yellow-400 text-yellow-300',
      avatarEmoji: '👑',
    },
    olympian: {
      border: 'border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.3)]',
      avatarRing: 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.45)]',
      badgeBg: 'bg-sky-950/80 border-sky-400 text-sky-300',
      avatarEmoji: '🏛️',
    },
    titan: {
      border: 'border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.3)]',
      avatarRing: 'border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.4)]',
      badgeBg: 'bg-purple-950/80 border-purple-400 text-purple-300',
      avatarEmoji: '⚡',
    },
    demigod: {
      border: 'border-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.25)]',
      avatarRing: 'border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.35)]',
      badgeBg: 'bg-indigo-950/80 border-indigo-400 text-indigo-300',
      avatarEmoji: '🗡️',
    },
    hero: {
      border: 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)]',
      avatarRing: 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      badgeBg: 'bg-amber-950/80 border-amber-400 text-amber-300',
      avatarEmoji: '⚔️',
    },
    mortal: {
      border: 'border-amber-600/70 shadow-[0_0_20px_rgba(217,119,6,0.2)]',
      avatarRing: 'border-amber-600/70 shadow-[0_0_16px_rgba(217,119,6,0.25)]',
      badgeBg: 'bg-slate-900 border-amber-800 text-amber-200',
      avatarEmoji: '🏺',
    },
  };

  const theme = tierThemes[payload.tierCode] || tierThemes.mortal;

  // Рассчитываем слоты для 5 регалий
  const badgeSlots = [];
  for (let i = 0; i < MAX_PINNED_BADGES; i++) {
    badgeSlots.push(payload.pinnedBadges[i] || null);
  }

  const percentAch =
    payload.totalAchievementsCount > 0
      ? Math.round((payload.unlockedCount / payload.totalAchievementsCount) * 100)
      : 0;

  return (
    <div
      data-testid="hero-card-preview"
      className={`relative w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border-2 ${theme.border} p-5 sm:p-6 text-slate-100 overflow-hidden select-none ${className}`}
    >
      {/* Декоративное радиальное золотое свечение */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Верхний декоративный орнамент */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-400">
            Храм Достижений Олимпа • Геймификация Жизни
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">
          {payload.dateFormatted}
        </span>
      </div>

      {/* Основной контент: 2 колонки (Герой + Статистика) */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 mb-5">
        {/* Левая колонка: Профиль Героя */}
        <div className="bg-slate-900/80 rounded-xl border border-amber-500/40 p-4 flex flex-col items-center text-center relative shadow-inner">
          {/* Аватар */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 ${theme.avatarRing} bg-slate-950 flex items-center justify-center text-3xl sm:text-4xl relative mb-3`}
          >
            <span>{theme.avatarEmoji}</span>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-slate-950 border-2 border-slate-900">
              <Zap className="w-3 h-3 fill-current stroke-[2.5]" />
            </div>
          </div>

          {/* Ступень пантеона */}
          <div
            className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest border ${theme.badgeBg} mb-1.5`}
          >
            {payload.tier}
          </div>

          {/* Имя */}
          <h3 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight leading-snug">
            {payload.heroName}
          </h3>

          {/* Мифологический титул */}
          <div className="text-xs text-amber-300 font-medium flex items-center gap-1 mt-0.5 mb-3">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="italic">«{payload.title}»</span>
          </div>

          {/* Уровень */}
          <div className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-600/40 to-amber-700/40 border border-amber-400/50 text-amber-200 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>УРОВЕНЬ {payload.level}</span>
          </div>
        </div>

        {/* Правая колонка: Статистические плиты */}
        <div className="flex flex-col justify-between gap-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Часы */}
            <div className="bg-slate-900/80 rounded-xl border border-amber-500/30 p-3 shadow-inner">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                <Hourglass className="w-3 h-3 text-amber-400" />
                <span>Всего часов</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                {payload.totalHoursFormatted}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium mt-1">
                Несгораемый опыт
              </div>
            </div>

            {/* Регалии */}
            <div className="bg-slate-900/80 rounded-xl border border-sky-500/30 p-3 shadow-inner">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                <Trophy className="w-3 h-3 text-sky-400" />
                <span>Регалий Храма</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-sky-300">
                {payload.unlockedCount} / {payload.totalAchievementsCount}
              </div>
              <div className="text-[10px] text-sky-300/80 font-medium mt-1">
                Открыто {percentAch}% Олимпа
              </div>
            </div>
          </div>

          {/* Главное направление */}
          <div className="bg-slate-900/80 rounded-xl border border-amber-500/30 p-3.5 shadow-inner">
            <div className="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5 mb-1">
              <Zap className="w-3 h-3 fill-amber-400" />
              <span>Главное направление героя</span>
            </div>

            {payload.primaryActivity ? (
              <div>
                <div className="text-base sm:text-lg font-black text-slate-100">
                  {payload.primaryActivity.name}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Посвящено: <strong className="text-amber-300">{payload.primaryActivity.hours} ч</strong> • Уровень {payload.primaryActivity.level}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Пока нет записей времени в направлениях
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Нижняя секция: Витрина 5 избранных регалий */}
      <div className="pt-3 border-t border-slate-800">
        <div className="text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Избранные регалии Храма ({payload.pinnedBadges.length} из {MAX_PINNED_BADGES})</span>
          <span className="text-[10px] text-slate-500 font-normal">Витрина почета</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {badgeSlots.map((badge, idx) => {
            if (badge) {
              return (
                <div
                  key={badge.code}
                  className="bg-amber-950/30 border border-amber-500/60 rounded-xl p-2.5 flex items-center gap-2 shadow-sm"
                >
                  <div className="text-2xl shrink-0">{badge.icon}</div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-amber-200 truncate leading-tight">
                      {badge.title}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {badge.categoryTitle}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`empty-slot-${idx}`}
                className="bg-slate-950/50 border border-slate-800/80 border-dashed rounded-xl p-2.5 flex items-center justify-center text-center gap-1.5 opacity-60"
              >
                <span className="text-slate-600 text-sm">🏛️</span>
                <span className="text-[10px] text-slate-500 italic">
                  Свободная регалия
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Футер карточки */}
      <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
        <span className="italic">«Часы, посвященные пути, бессмертны и несгораемы»</span>
        <span className="font-mono text-slate-600">1200x630 Retina Card</span>
      </div>
    </div>
  );
};
