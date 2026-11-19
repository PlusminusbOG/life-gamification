import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { db } from './domain/db';
import { createGameEngineService } from './domain/gameEngineService';
import type { Activity, CreateActivityInput } from './domain/types';
import { Header } from './components/Header';
import { ActivityCard } from './components/ActivityCard';
import { CreateActivityModal } from './components/CreateActivityModal';
import { LogTimeModal } from './components/LogTimeModal';
import { RecentLogsList } from './components/RecentLogsList';

const gameService = createGameEngineService(db);

export function App() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedActivityForLog, setSelectedActivityForLog] = useState<Activity | null>(null);

  // Live queries from IndexedDB (Dexie)
  const profile = useLiveQuery(() => db.userProfile.get('me'));
  const activities = useLiveQuery(() => db.activities.orderBy('createdAt').toArray()) ?? [];
  const timeLogs = useLiveQuery(() => db.timeLogs.orderBy('timestamp').reverse().limit(30).toArray()) ?? [];

  // Initialize singleton user profile on mount if needed
  useEffect(() => {
    gameService.ensureProfile().catch(console.error);
  }, []);

  const handleCreateActivity = async (input: CreateActivityInput) => {
    await gameService.createActivity(input);
  };

  const handleLogTime = async (input: { activityId: string; durationMinutes: number; notes?: string }) => {
    await gameService.logTime(input);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Hero Banner */}
      <Header profile={profile} totalActivities={activities.length} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Section Header: Activities */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>Disciplines & Activities</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track focused time across your personal pursuits. Hours never decay or reset.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Activity</span>
          </button>
        </div>

        {/* Activities Grid */}
        {activities.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 border-dashed">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No Pursuits Created Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
              Create your first activity (e.g. Reading, Running, Coding, Guitar) to begin recording time and unlocking mythic Pantheon ranks.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create First Activity</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onLogTime={(act) => setSelectedActivityForLog(act)}
              />
            ))}
          </div>
        )}

        {/* Recent Activity Log History */}
        <section className="pt-4">
          <RecentLogsList logs={timeLogs} activities={activities} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local-First IndexedDB</span>
        </div>
        <span className="hidden sm:inline text-slate-700">•</span>
        <span>Life Gamification MVP — Tracer Bullet #01</span>
      </footer>

      {/* Modals */}
      <CreateActivityModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateActivity}
      />

      <LogTimeModal
        activity={selectedActivityForLog}
        isOpen={selectedActivityForLog !== null}
        onClose={() => setSelectedActivityForLog(null)}
        onLogTime={handleLogTime}
      />
    </div>
  );
}

export default App;
