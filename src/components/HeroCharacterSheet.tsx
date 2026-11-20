import React from 'react';
import { Shield, Sparkles, Hourglass, Zap, Award, Share2 } from 'lucide-react';
import type { UserProfile } from '../domain/types';
import {
  calculateLevel,
  getLevelProgress,
  getPantheonTier,
} from '../domain/progression';
import { XPProgressBar } from './XPProgressBar';

export interface HeroCharacterSheetProps {
  profile?: UserProfile;
  totalActivities?: number;
  totalLogsCount?: number;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  onOpenTemple?: () => void;
  onExportHeroCard?: () => void;
  className?: string;
}

export const HeroCharacterSheet: React.FC<HeroCharacterSheetProps> = ({
  profile,
  totalActivities = 0,
  totalLogsCount = 0,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 13,
  onOpenTemple,
  onExportHeroCard,
  className = '',
}) => {
  const totalMinutes = profile?.totalMinutes ?? 0;
  const totalHours = profile?.totalHours ?? Math.round((totalMinutes / 60) * 10) / 10;
  const currentLevel = calculateLevel(totalMinutes);
  const tierInfo = getPantheonTier(currentLevel);
  const progress = getLevelProgress(totalMinutes);
  const nextTierInfo = getPantheonTier(progress.nextLevel);

  // Оформление в зависимости от ступени пантеона
  const tierThemes = {
    god: {
      badgeBg: 'bg-amber-950/80 border-yellow-400/80 text-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.4)]',
      avatarRing: 'border-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.5)]',
      cardBorder: 'border-yellow-500/60 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(250,204,21,0.1)]',
      emblem: '⚡',
      avatarEmoji: '👑',
    },
    olympian: {
      badgeBg: 'bg-sky-950/80 border-sky-400/80 text-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.35)]',
      avatarRing: 'border-sky-400 shadow-[0_0_22px_rgba(56,189,248,0.4)]',
      cardBorder: 'border-sky-600/50 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_0_35px_rgba(56,189,248,0.08)]',
      emblem: '🏛️',
      avatarEmoji: '🏛️',
    },
    titan: {
      badgeBg: 'bg-purple-950/80 border-purple-400/80 text-purple-300 shadow-[0_0_16px_rgba(192,132,252,0.35)]',
      avatarRing: 'border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.4)]',
      cardBorder: 'border-purple-600/50 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_0_35px_rgba(192,132,252,0.08)]',
      emblem: '🪐',
      avatarEmoji: '⚡',
    },
    demigod: {
      badgeBg: 'bg-indigo-950/80 border-indigo-400/80 text-indigo-300 shadow-[0_0_14px_rgba(129,140,248,0.3)]',
      avatarRing: 'border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.35)]',
      cardBorder: 'border-indigo-600/50 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_0_35px_rgba(129,140,248,0.07)]',
      emblem: '🔱',
      avatarEmoji: '🗡️',
    },
    hero: {
      badgeBg: 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.3)]',
      avatarRing: 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      cardBorder: 'border-amber-600/60 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_0_35px_rgba(245,158,11,0.07)]',
      emblem: '⚔️',
      avatarEmoji: '🛡️',
    },
    mortal: {
      badgeBg: 'bg-slate-900 border-amber-800/80 text-amber-200/90 shadow-sm',
      avatarRing: 'border-amber-600/70 shadow-[0_0_16px_rgba(217,119,6,0.25)]',
      cardBorder: 'border-amber-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_0_30px_rgba(217,119,6,0.05)]',
      emblem: '🏺',
      avatarEmoji: '⛵',
    },
  };

  const theme = tierThemes[tierInfo.tierCode] ?? tierThemes.mortal;

  return (
    <div
      data-testid="hero-character-sheet"
      className={`relative bg-slate-900/95 rounded-2xl border-2 ${theme.cardBorder} p-6 sm:p-7 backdrop-blur-md overflow-hidden ${className}`}
    >
      {/* Декоративная греческая эмблема в верхнем правом углу */}
      <div className="absolute top-3 right-4 text-2xl select-none opacity-40 hover:opacity-100 transition-opacity">
        {theme.emblem}
      </div>

      {/* Греческий меандр/орнамент вверху карточки */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mb-5" />

      {/* Аватар в позолоченной греческой рамке */}
      <div className="flex flex-col items-center mb-5">
        <div
          data-testid="hero-avatar"
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 ${theme.avatarRing} bg-gradient-to-b from-slate-800 to-slate-950 flex items-center justify-center text-4xl sm:text-5xl select-none relative mb-3`}
        >
          <span>{theme.avatarEmoji}</span>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 text-slate-950 border-2 border-slate-900">
            <Zap className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
          </div>
        </div>

        {/* Ступень пантеона */}
        <div
          data-testid="pantheon-tier"
          className={`px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest border ${theme.badgeBg} mb-1.5`}
        >
          {tierInfo.tier}
        </div>

        {/* Имя героя */}
        <h2
          data-testid="hero-name"
          className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight"
        >
          {profile?.name ?? 'Герой Эллады'}
        </h2>

        {/* Мифологический титул */}
        <div
          data-testid="hero-title"
          className="text-xs sm:text-sm text-amber-300/90 font-medium flex items-center gap-1 mt-0.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>«{tierInfo.title}»</span>
        </div>

        {/* Бейдж уровня */}
        <div
          data-testid="hero-level"
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-900/30 border border-amber-400/40"
        >
          <Shield className="w-4 h-4 text-amber-300" />
          <span>УРОВЕНЬ {currentLevel}</span>
        </div>
      </div>

      {/* Полоса прогресса XP (Variant B) */}
      <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800/80 mb-5 shadow-inner">
        <XPProgressBar
          progress={progress}
          nextTitle={nextTierInfo.title !== tierInfo.title ? nextTierInfo.title : undefined}
        />
      </div>

      {/* Блок пожизненных часов и статистики */}
      <div className="border-t border-slate-800/80 pt-4 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 text-amber-400" />
            <span>Всего часов:</span>
          </span>
          <strong
            data-testid="hero-total-hours"
            className="text-sm font-bold font-mono text-amber-300"
          >
            {totalHours.toFixed(1)} ч
          </strong>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Активных занятий:</span>
          <span className="font-semibold text-slate-200">{totalActivities}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Записей времени:</span>
          <span className="font-semibold text-slate-200">{totalLogsCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Достижений в Храме:</span>
          {onOpenTemple ? (
            <button
              onClick={onOpenTemple}
              className="font-semibold font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {unlockedAchievementsCount} / {totalAchievementsCount}
            </button>
          ) : (
            <span className="font-semibold font-mono text-cyan-400">
              {unlockedAchievementsCount} / {totalAchievementsCount}
            </span>
          )}
        </div>
      </div>

      {/* Кнопка открытия витрины и экспорта карточки героя */}
      {onExportHeroCard && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={onExportHeroCard}
            data-testid="export-hero-card-button"
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Экспорт карточки героя</span>
          </button>
        </div>
      )}

      {/* Печать несгораемого опыта */}
      <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/90 font-medium">
        <Award className="w-3.5 h-3.5" />
        <span>Вечные и несгораемые часы Эллады</span>
      </div>
    </div>
  );
};
