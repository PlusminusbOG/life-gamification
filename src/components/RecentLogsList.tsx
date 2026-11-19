import { History, Clock, FileText } from 'lucide-react';
import type { TimeLog, Activity } from '../domain/types';

interface RecentLogsListProps {
  logs: TimeLog[];
  activities: Activity[];
}

export const RecentLogsList: React.FC<RecentLogsListProps> = ({ logs, activities }) => {
  const activityMap = new Map<string, Activity>(activities.map((a) => [a.id, a]));

  const formatTimestamp = (epoch: number) => {
    const d = new Date(epoch);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Recent Time Logs
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {logs.length} Total {logs.length === 1 ? 'Log' : 'Logs'}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          No time logged yet. Record your first time log on any activity above to start accumulating lifetime hours!
        </div>
      ) : (
        <div className="mt-3 divide-y divide-slate-800/60 max-h-72 overflow-y-auto pr-1">
          {logs.map((log) => {
            const activity = activityMap.get(log.activityId);
            const color = activity?.color || '#f59e0b';
            const hours = (log.durationMinutes / 60).toFixed(1);

            return (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold text-slate-200">
                      {activity?.name ?? 'Unknown Activity'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  {log.notes && (
                    <div className="flex items-center gap-1.5 text-slate-400 pl-4 text-[11px]">
                      <FileText className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span className="italic">{log.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg flex-shrink-0">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>+{log.durationMinutes}m ({hours}h)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
