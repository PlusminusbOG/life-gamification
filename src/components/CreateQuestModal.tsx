import React, { useState } from 'react';
import { X, Sword, Sparkles, Calendar, Layers, Clock } from 'lucide-react';
import type { Activity, CreateQuestInput } from '../domain/types';

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateQuestInput) => Promise<void>;
  activities: Activity[];
  defaultIsToday?: boolean;
}

const XP_REWARDS = [
  { label: '+15м XP', value: 15, hint: 'Быстрый подвиг' },
  { label: '+30м XP', value: 30, hint: 'Стандартный квест' },
  { label: '+45м XP', value: 45, hint: 'Важный шаг' },
  { label: '+1ч XP', value: 60, hint: 'Большая задача' },
  { label: '+2ч XP', value: 120, hint: 'Эпический подвиг' },
];

export const CreateQuestModal: React.FC<CreateQuestModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  activities,
  defaultIsToday = true,
}) => {
  const [title, setTitle] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [rewardMinutes, setRewardMinutes] = useState<number>(30);
  const [targetScope, setTargetScope] = useState<'today' | 'backlog'>(
    defaultIsToday ? 'today' : 'backlog'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Введите название квеста');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const dueDate = targetScope === 'today' ? Date.now() : null;

      await onCreate({
        title: trimmed,
        activityId: selectedActivityId || undefined,
        rewardMinutes,
        dueDate,
      });

      setTitle('');
      setSelectedActivityId('');
      setRewardMinutes(30);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании квеста');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-600/60 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Заголовок модального окна */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Sword className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">
              Создать новый подвиг (квест)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Сформулируйте конкретную задачу и назначьте награду в опыте (XP)
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Название квеста */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Название подвига / квеста
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Прочитать 30 страниц книги по философии"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Привязка к Занятию (Activity) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Привязать к занятию (опционально)</span>
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-slate-200 outline-none transition-all"
            >
              <option value="">Без привязки (только общий опыт героя)</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name} (Ур. {act.level})
                </option>
              ))}
            </select>
          </div>

          {/* Выбор размера награды в XP */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Награда за выполнение</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {XP_REWARDS.map((rew) => {
                const isSelected = rewardMinutes === rew.value;
                return (
                  <button
                    key={rew.value}
                    type="button"
                    onClick={() => setRewardMinutes(rew.value)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs font-mono">{rew.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{rew.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Раздел: Сегодня или Бэклог */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Куда поместить квест</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTargetScope('today')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  targetScope === 'today'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚔️ Квесты дня (Сегодня)
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('backlog')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  targetScope === 'backlog'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                📜 Бэклог (На потом)
              </button>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Создание...' : 'Создать квест'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
