import React from 'react';
import { Shield, Hourglass, Sparkles, Award } from 'lucide-react';
import type { UserProfile } from '../domain/types';
import { calculateLevel, getPantheonTier } from '../domain/progression';

interface HeaderProps {
  profile?: UserProfile;
  totalActivities: number;
}

export const Header: React.FC<HeaderProps> = ({ profile, totalActivities }) => {
  const totalHours = profile?.totalHours ?? 0;
  const totalMinutes = profile?.totalMinutes ?? Math.round(totalHours * 60);
  const heroLevel = calculateLevel(totalMinutes);
  const tierInfo = getPantheonTier(heroLevel);

  let tierColor = 'text-amber-300';
  let tierBorder = 'border-amber-500/30';

  if (tierInfo.tier === 'Восходящий Бог') {
    tierColor = 'text-yellow-300 animate-pulse';
    tierBorder = 'border-yellow-400/60 shadow-[0_0_15px_rgba(250,204,21,0.3)]';
  } else if (tierInfo.tier === 'Олимпиец') {
    tierColor = 'text-cyan-300';
    tierBorder = 'border-cyan-500/40';
  } else if (tierInfo.tier === 'Титан Воли') {
    tierColor = 'text-purple-300';
    tierBorder = 'border-purple-500/40';
  } else if (tierInfo.tier === 'Полубог') {
    tierColor = 'text-indigo-300';
    tierBorder = 'border-indigo-500/40';
  } else if (tierInfo.tier === 'Герой Эллады') {
    tierColor = 'text-amber-400';
    tierBorder = 'border-amber-500/40';
  }

  const formatActivityCount = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return `${count} активное занятие`;
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} активных занятия`;
    return `${count} активных занятий`;
  };

  return (
    <header className="relative bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-8 py-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Данные Героя */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border ${tierBorder} flex items-center justify-center text-amber-400 shadow-inner`}>
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
                {profile?.name ?? 'Герой Эллады'}
              </h1>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border bg-slate-800/80 ${tierColor} ${tierBorder}`}>
                {tierInfo.tier}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
              <span>{tierInfo.title}</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-amber-400/90 font-semibold">Ур. героя {heroLevel}</span>
              <span className="text-slate-600">•</span>
              <span>{formatActivityCount(totalActivities)}</span>
            </p>
          </div>
        </div>

        {/* Пожизненный накопительный счетчик часов */}
        <div className="flex items-center gap-6 bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Hourglass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Пожизненные часы
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                {totalHours.toFixed(1)} <span className="text-xs font-normal text-slate-500">ч</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-slate-800" />

          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400/90 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <Award className="w-4 h-4" />
            <span>Вечные и несгораемые</span>
          </div>
        </div>
      </div>
    </header>
  );
};
