import React, { useState } from 'react';
import { X, Clock, FileText, Check, Plus } from 'lucide-react';
import type { Activity } from '../domain/types';
import { getIconComponent } from './icons';

interface LogTimeModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onLogTime: (input: { activityId: string; durationMinutes: number; notes?: string; timestamp?: number }) => Promise<void>;
}

const PRESET_DURATIONS = [
  { label: '+15м', minutes: 15 },
  { label: '+30м', minutes: 30 },
  { label: '+45м', minutes: 45 },
  { label: '+1ч', minutes: 60 },
  { label: '+1.5ч', minutes: 90 },
  { label: '+2ч', minutes: 120 },
];

export const LogTimeModal: React.FC<LogTimeModalProps> = ({
  activity,
  isOpen,
  onClose,
  onLogTime,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [customInput, setCustomInput] = useState<string>('30');
  const [dateTimeInput, setDateTimeInput] = useState<string>(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activity) return null;

  const Icon = getIconComponent(activity.icon);
  const cardColor = activity.color || '#f59e0b';

  const handlePresetSelect = (minutes: number) => {
    setDurationMinutes(minutes);
    setCustomInput(String(minutes));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setDurationMinutes(num);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (durationMinutes <= 0) {
      setError('Длительность должна быть больше нуля минут');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const chosenTimestamp = dateTimeInput ? new Date(dateTimeInput).getTime() : Date.now();

      await onLogTime({
        activityId: activity.id,
        durationMinutes,
        notes: notes.trim() || undefined,
        timestamp: chosenTimestamp,
      });
      setNotes('');
      setDurationMinutes(30);
      setCustomInput('30');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось записать время');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Фоновое свечение */}
        <div
          className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: cardColor }}
        />

        {/* Шапка модального окна */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
              style={{
                backgroundColor: `${cardColor}20`,
                borderColor: `${cardColor}40`,
                color: cardColor,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Запись времени: {activity.name}</h2>
              <p className="text-xs text-slate-400">Зафиксируйте завершенное время</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Быстрые кнопки пресетов */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Быстрый выбор длительности
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_DURATIONS.map((preset) => {
                const isSelected = durationMinutes === preset.minutes;
                return (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => handlePresetSelect(preset.minutes)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ручной ввод минут */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Длительность (в минутах)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1440"
                value={customInput}
                onChange={handleCustomChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono transition-all pr-14"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                мин
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>
                Примерно <strong className="text-amber-400 font-mono">{(durationMinutes / 60).toFixed(2)}</strong> ч
              </span>
            </div>
          </div>

          {/* Выбор времени завершения (post-factum) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Время завершения (задним числом)
            </label>
            <input
              type="datetime-local"
              value={dateTimeInput}
              onChange={(e) => setDateTimeInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
            />
          </div>

          {/* Заметки */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Заметки / Размышления (необязательно)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="О чем вы размышляли или что сделали за это время?"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
            />
          </div>

          {/* Действия */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Сохранение...' : 'Записать время'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
