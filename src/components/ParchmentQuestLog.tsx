import React, { useState } from 'react';
import {
  Sword,
  Scroll,
  Timer,
  Plus,
  CheckCircle2,
  Trash2,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import type { Quest, Activity } from '../domain/types';
import { FocusStopwatch } from './FocusStopwatch';

interface ParchmentQuestLogProps {
  quests: Quest[];
  activities: Activity[];
  onCompleteQuest: (questId: string) => Promise<void>;
  onDeleteQuest: (questId: string) => Promise<void>;
  onOpenCreateQuest: (defaultIsToday: boolean) => void;
  onSaveStopwatchTime: (input: {
    activityId: string;
    durationMinutes: number;
    notes?: string;
  }) => Promise<void>;
  className?: string;
}

export const ParchmentQuestLog: React.FC<ParchmentQuestLogProps> = ({
  quests,
  activities,
  onCompleteQuest,
  onDeleteQuest,
  onOpenCreateQuest,
  onSaveStopwatchTime,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'backlog' | 'stopwatch'>('today');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

  // Квесты дня: активные с dueDate на сегодня, а также выполненные сегодня
  const todayQuests = quests.filter((q) => {
    if (q.status === 'completed' && q.completedAt) {
      return q.completedAt >= startOfDay && q.completedAt <= endOfDay;
    }
    return q.dueDate != null && q.dueDate >= startOfDay && q.dueDate <= endOfDay;
  });

  // Бэклог: активные без dueDate или на будущее, а также ранее выполненные
  const backlogQuests = quests.filter((q) => {
    if (q.status === 'completed') {
      return !q.completedAt || q.completedAt < startOfDay;
    }
    return q.dueDate == null || q.dueDate < startOfDay || q.dueDate > endOfDay;
  });

  const activeQuestsToDisplay = activeTab === 'today' ? todayQuests : backlogQuests;
  const currentActiveCount = activeQuestsToDisplay.filter((q) => q.status === 'active').length;

  const handleComplete = async (quest: Quest) => {
    try {
      setCompletingId(quest.id);
      await onCompleteQuest(quest.id);

      const linkedAct = activities.find((a) => a.id === quest.activityId);
      const actNote = linkedAct ? ` в «${linkedAct.name}»` : '';
      setCelebrationMessage(`⚔️ Подвиг «${quest.title}» свершен! +${quest.rewardMinutes} мин XP${actNote}!`);

      setTimeout(() => {
        setCelebrationMessage(null);
      }, 4000);
    } catch (err: unknown) {
      console.error('Ошибка завершения квеста:', err);
    } finally {
      setCompletingId(null);
    }
  };

  const formatRewardBadge = (mins: number) => {
    if (mins >= 60) {
      const hours = mins / 60;
      return `+${hours}ч XP`;
    }
    return `+${mins}м XP`;
  };

  return (
    <div
      data-testid="parchment-quest-log"
      className={`bg-slate-900/90 border-2 border-amber-600/60 rounded-3xl p-5 sm:p-7 shadow-2xl relative ${className}`}
    >
      {/* Шапка вкладок (Свиток походов) */}
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-6 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sword className="w-4 h-4 text-amber-400" />
            <span>Квесты дня</span>
            {todayQuests.filter((q) => q.status === 'active').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                {todayQuests.filter((q) => q.status === 'active').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('backlog')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'backlog'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Scroll className="w-4 h-4 text-amber-400" />
            <span>Бэклог</span>
            {backlogQuests.filter((q) => q.status === 'active').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-300 font-bold">
                {backlogQuests.filter((q) => q.status === 'active').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'stopwatch'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Timer className="w-4 h-4 text-amber-400" />
            <span>Секундомер</span>
          </button>
        </div>

        {activeTab !== 'stopwatch' && (
          <button
            onClick={() => onOpenCreateQuest(activeTab === 'today')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 active:scale-95 transition-all ml-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Новый подвиг</span>
          </button>
        )}
      </div>

      {/* Праздничное уведомление о завершении подвига */}
      {celebrationMessage && (
        <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border border-amber-400/50 text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-amber-500/10">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
          <span>{celebrationMessage}</span>
        </div>
      )}

      {/* Контент активной вкладки */}
      {activeTab === 'stopwatch' ? (
        <FocusStopwatch
          activities={activities}
          onSaveTime={onSaveStopwatchTime}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-2">
            <span>
              {activeTab === 'today'
                ? 'Подвиги, запланированные на сегодня:'
                : 'Список задач и долгосрочных подвигов:'}
            </span>
            <span className="font-mono text-amber-400/90 font-medium">
              {currentActiveCount} активных
            </span>
          </div>

          {activeQuestsToDisplay.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-3">
                <Scroll className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">
                {activeTab === 'today' ? 'На сегодня нет подвигов' : 'Бэклог пуст'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                {activeTab === 'today'
                  ? 'Добавьте квест на сегодня, чтобы заработать очки опыта для героя и занятий.'
                  : 'Запишите идеи и будущие подвиги сюда, чтобы вернуться к ним позже.'}
              </p>
              <button
                onClick={() => onOpenCreateQuest(activeTab === 'today')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-amber-300 hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать подвиг</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeQuestsToDisplay.map((quest) => {
                const isCompleted = quest.status === 'completed';
                const linkedAct = activities.find((a) => a.id === quest.activityId);

                return (
                  <div
                    key={quest.id}
                    data-testid="quest-item"
                    className={`group relative rounded-xl border-l-4 transition-all duration-200 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-slate-950/50 border-slate-700 opacity-60'
                        : 'bg-slate-950/80 border-amber-500 hover:border-amber-400 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="pt-0.5 text-amber-400">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Sword className="w-4 h-4 text-amber-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-semibold text-sm sm:text-base leading-snug break-words ${
                            isCompleted
                              ? 'line-through text-slate-400'
                              : 'text-slate-100 group-hover:text-amber-200 transition-colors'
                          }`}
                        >
                          {quest.title}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                          {/* Бейдж награды */}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                            {formatRewardBadge(quest.rewardMinutes)}
                          </span>

                          {/* Привязка к Занятию */}
                          {linkedAct ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                              <Layers className="w-3 h-3 text-amber-400" />
                              <span>{linkedAct.name}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">Общий опыт</span>
                          )}

                          {isCompleted && quest.completedAt && (
                            <span className="text-[11px] text-slate-500">
                              • Выполнен
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {!isCompleted ? (
                        <button
                          onClick={() => handleComplete(quest)}
                          disabled={completingId === quest.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{completingId === quest.id ? 'Зачисление...' : 'Завершить'}</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30">
                          Выполнен ✅
                        </span>
                      )}

                      <button
                        onClick={() => onDeleteQuest(quest.id)}
                        title="Удалить квест"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors opacity-70 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
