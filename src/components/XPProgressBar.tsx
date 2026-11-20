import React from 'react';
import type { LevelProgress } from '../domain/progression';
import { getLevelProgress } from '../domain/progression';

export interface XPProgressBarProps {
  progress?: LevelProgress;
  totalMinutes?: number;
  nextTitle?: string;
  className?: string;
  showLabels?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  progress: progressProp,
  totalMinutes,
  nextTitle,
  className = '',
  showLabels = true,
}) => {
  const progress: LevelProgress =
    progressProp ?? getLevelProgress(totalMinutes ?? 0);

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <span>Прогресс уровня</span>
            <span className="text-amber-400 font-mono font-bold">
              Ур. {progress.currentLevel} → {progress.nextLevel}
            </span>
          </span>
          <span className="text-amber-400 font-mono font-bold tracking-tight">
            {progress.progressPercent}%
          </span>
        </div>
      )}

      {/* Анимированный трек полосы прогресса */}
      <div className="h-3 w-full bg-slate-800/90 rounded-full p-0.5 border border-slate-700/60 overflow-hidden shadow-inner relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-500 ease-out relative"
          style={{ width: `${progress.progressPercent}%` }}
        >
          {/* Блик на полосе */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-full" />
        </div>
      </div>

      {showLabels && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">В уровне:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {progress.minutesIntoLevel} мин
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">До след. уровня:</span>
            <span className="font-mono text-amber-400 font-semibold">
              {progress.minutesRemainingToNextLevel} мин
            </span>
          </div>
        </div>
      )}

      {nextTitle && (
        <div className="text-[11px] text-slate-400 text-center pt-1 border-t border-slate-800/60 mt-1">
          <span>Следующий титул: </span>
          <span className="text-amber-300 font-medium">«{nextTitle}»</span>
        </div>
      )}
    </div>
  );
};
