import { Plus, Clock, Trophy } from 'lucide-react';
import type { Activity } from '../domain/types';
import { getLevelProgress } from '../domain/progression';
import { getIconComponent } from './icons';

interface ActivityCardProps {
  activity: Activity;
  onLogTime: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onLogTime }) => {
  const Icon = getIconComponent(activity.icon);
  const progress = getLevelProgress(activity.totalMinutes);
  const totalHours = (activity.totalMinutes / 60).toFixed(1);

  const cardColor = activity.color || '#f59e0b';

  return (
    <div className="relative group bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-4 right-4 h-1 rounded-t-full opacity-80"
        style={{ backgroundColor: cardColor }}
      />

      <div>
        {/* Header: Icon, Name, Level badge */}
        <div className="flex items-start justify-between gap-3 mt-1">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105"
              style={{
                backgroundColor: `${cardColor}15`,
                borderColor: `${cardColor}40`,
                color: cardColor,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base group-hover:text-amber-300 transition-colors">
                {activity.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono font-medium text-slate-300">{totalHours} hrs</span>
                <span className="text-slate-600">•</span>
                <span>{activity.totalMinutes} mins total</span>
              </div>
            </div>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl text-xs font-bold font-mono">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Lvl {activity.level}</span>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-medium text-slate-300">
              Level {progress.currentLevel}
            </span>
            <span className="text-slate-400 font-mono">
              {progress.progressPercent}% to Lvl {progress.nextLevel}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress.progressPercent}%`,
                backgroundColor: cardColor,
              }}
            />
          </div>

          <div className="text-[11px] text-slate-500 text-right">
            {progress.minutesNeededForNextLevel - progress.minutesIntoLevel} mins to next level
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Permanent XP
        </span>
        <button
          onClick={() => onLogTime(activity)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-all duration-150 active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Time</span>
        </button>
      </div>
    </div>
  );
};
