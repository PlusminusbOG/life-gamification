import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { db } from './domain/db';
import { createGameEngineService } from './domain/gameEngineService';
import type { Activity, CreateActivityInput, CreateQuestInput } from './domain/types';
import { Header } from './components/Header';
import { HeroCharacterSheet } from './components/HeroCharacterSheet';
import { ParchmentQuestLog } from './components/ParchmentQuestLog';
import { ActivityCard } from './components/ActivityCard';
import { CreateActivityModal } from './components/CreateActivityModal';
import { CreateQuestModal } from './components/CreateQuestModal';
import { LogTimeModal } from './components/LogTimeModal';
import { RecentLogsList } from './components/RecentLogsList';

const gameService = createGameEngineService(db);

export function App() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateQuestOpen, setIsCreateQuestOpen] = useState(false);
  const [createQuestDefaultIsToday, setCreateQuestDefaultIsToday] = useState(true);
  const [selectedActivityForLog, setSelectedActivityForLog] = useState<Activity | null>(null);
  const [questLogTab, setQuestLogTab] = useState<'today' | 'backlog' | 'stopwatch' | 'temple'>('today');

  // Живые запросы из IndexedDB (Dexie)
  const profile = useLiveQuery(() => db.userProfile.get('me'));
  const activities = useLiveQuery(() => db.activities.orderBy('createdAt').toArray()) ?? [];
  const timeLogs = useLiveQuery(() => db.timeLogs.orderBy('timestamp').reverse().limit(30).toArray()) ?? [];
  const quests = useLiveQuery(async () => {
    const list = await db.quests.toArray();
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }) ?? [];

  // Живой запрос достижений с вычислением прогресса
  const achievements = useLiveQuery(() => gameService.getAchievements()) ?? [];

  // Инициализация синглтона профиля героя при первом запуске
  useEffect(() => {
    gameService.ensureProfile().catch(console.error);
    gameService.evaluateAndSaveAchievements().catch(console.error);
  }, []);

  const handleCreateActivity = async (input: CreateActivityInput) => {
    await gameService.createActivity(input);
  };

  const handleLogTime = async (input: {
    activityId: string;
    durationMinutes: number;
    notes?: string;
    timestamp?: number;
  }) => {
    await gameService.logTime(input);
  };

  const handleCreateQuest = async (input: CreateQuestInput) => {
    await gameService.createQuest(input);
  };

  const handleCompleteQuest = async (questId: string) => {
    await gameService.completeQuest(questId);
  };

  const handleDeleteQuest = async (questId: string) => {
    await gameService.deleteQuest(questId);
  };

  const handleOpenCreateQuest = (defaultIsToday: boolean) => {
    setCreateQuestDefaultIsToday(defaultIsToday);
    setIsCreateQuestOpen(true);
  };

  const unlockedAchCount = achievements.filter((a) => a.unlockedAt != null).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Шапка героя */}
      <Header profile={profile} totalActivities={activities.length} />

      {/* Основной контейнер: Сетка Variant B (Карточка Героя слева + Свиток квестов и активности справа) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">
          {/* Левая колонка: Карточка Героя (Hero Character Sheet - Variant B) */}
          <aside className="w-full lg:sticky lg:top-8 space-y-6">
            <HeroCharacterSheet
              profile={profile}
              totalActivities={activities.length}
              totalLogsCount={timeLogs.length}
              unlockedAchievementsCount={unlockedAchCount}
              totalAchievementsCount={achievements.length || 13}
              onOpenTemple={() => setQuestLogTab('temple')}
            />
          </aside>

          {/* Правая колонка: Свиток Квестов + Направления и активности + Логи */}
          <div className="space-y-8 min-w-0">
            {/* Свиток походов и квестов + Храм Достижений */}
            <section>
              <ParchmentQuestLog
                quests={quests}
                activities={activities}
                achievements={achievements}
                onCompleteQuest={handleCompleteQuest}
                onDeleteQuest={handleDeleteQuest}
                onOpenCreateQuest={handleOpenCreateQuest}
                onSaveStopwatchTime={handleLogTime}
                activeTab={questLogTab}
                onTabChange={setQuestLogTab}
              />
            </section>

            {/* Заголовок раздела активностей */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 pt-2 border-t border-slate-800/80">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>Направления и Занятия</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Отслеживайте время, посвященное важным сферам жизни. Часы никогда не сгорают и не уменьшаются.
                </p>
              </div>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Новое занятие</span>
              </button>
            </div>

            {/* Сетка занятий */}
            {activities.length === 0 ? (
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 border-dashed">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">Пока нет созданных занятий</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
                  Создайте первое занятие (например: Чтение, Бег, Программирование, Гитара), чтобы начать копить часы и открывать мифические ранги пантеона.
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/25 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Создать первое занятие</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onLogTime={(act) => setSelectedActivityForLog(act)}
                  />
                ))}
              </div>
            )}

            {/* История недавних логов времени */}
            <section className="pt-2">
              <RecentLogsList logs={timeLogs} activities={activities} />
            </section>
          </div>
        </div>
      </main>

      {/* Подвал */}
      <footer className="border-t border-slate-800/60 py-6 px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Локальная база IndexedDB (работает офлайн)</span>
        </div>
        <span className="hidden sm:inline text-slate-700">•</span>
        <span>Геймификация Жизни — Храм Достижений Олимпа</span>
      </footer>

      {/* Модальные окна */}
      <CreateActivityModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateActivity}
      />

      <CreateQuestModal
        isOpen={isCreateQuestOpen}
        onClose={() => setIsCreateQuestOpen(false)}
        onCreate={handleCreateQuest}
        activities={activities}
        defaultIsToday={createQuestDefaultIsToday}
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
