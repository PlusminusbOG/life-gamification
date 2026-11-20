import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Zap } from 'lucide-react';
import type { Activity } from '../domain/types';

interface FocusStopwatchProps {
  activities: Activity[];
  onSaveTime: (input: {
    activityId: string;
    durationMinutes: number;
    notes?: string;
  }) => Promise<void>;
  initialActivityId?: string;
  className?: string;
}

export const FocusStopwatch: React.FC<FocusStopwatchProps> = ({
  activities,
  onSaveTime,
  initialActivityId,
  className = '',
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    initialActivityId || (activities[0]?.id ?? '')
  );
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);

  // Обновляем выбранное занятие при появлении списка активностей
  useEffect(() => {
    if (!selectedActivityId && activities.length > 0) {
      setSelectedActivityId(activities[0].id);
    }
  }, [activities, selectedActivityId]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (!selectedActivityId && activities.length > 0) {
      setSelectedActivityId(activities[0].id);
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const handleSave = async () => {
    if (!selectedActivityId) {
      setFeedback('Выберите занятие для сохранения времени');
      return;
    }

    if (seconds < 10) {
      setFeedback('Длительность фокуса слишком мала (менее 10 секунд)');
      return;
    }

    const calculatedMinutes = Math.max(1, Math.round(seconds / 60));

    try {
      setIsSaving(true);
      setFeedback(null);

      await onSaveTime({
        activityId: selectedActivityId,
        durationMinutes: calculatedMinutes,
        notes: notes.trim() || 'Секундомер фокуса',
      });

      const chosenAct = activities.find((a) => a.id === selectedActivityId);
      setFeedback(`Записано: +${calculatedMinutes} мин в «${chosenAct?.name ?? 'занятие'}»!`);
      setIsRunning(false);
      setSeconds(0);
      setNotes('');

      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Ошибка при сохранении времени');
    } finally {
      setIsSaving(false);
    }
  };

  const currentMinutesEarned = Math.max(1, Math.round(seconds / 60));
  const selectedActivity = activities.find((a) => a.id === selectedActivityId);

  return (
    <div
      data-testid="focus-stopwatch"
      className={`bg-slate-900/90 border-2 border-amber-600/50 rounded-2xl p-5 sm:p-6 shadow-xl ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <span>Секундомер живого фокуса</span>
              {isRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Замеряйте реальное время занятий и сохраняйте в несгораемый опыт
            </p>
          </div>
        </div>

        {/* Выбор активного занятия */}
        <div className="min-w-[200px]">
          {activities.length === 0 ? (
            <span className="text-xs text-amber-300">Сначала создайте занятие</span>
          ) : (
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-amber-500 disabled:opacity-70"
            >
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name} (Ур. {act.level})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Циферблат */}
      <div className="py-6 text-center">
        <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          {formatTime(seconds)}
        </div>
        <div className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-2">
          {isRunning ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Идет отсчет • +{currentMinutesEarned} мин опыта при сохранении</span>
            </span>
          ) : seconds > 0 ? (
            <span className="text-amber-400">
              Пауза • Накоплено {currentMinutesEarned} мин XP для «{selectedActivity?.name}»
            </span>
          ) : (
            <span>Готов к началу концентрации</span>
          )}
        </div>
      </div>

      {feedback && (
        <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 text-center animate-in fade-in">
          {feedback}
        </div>
      )}

      {/* Поле заметки (показывается при паузе/записи) */}
      {seconds > 0 && (
        <div className="mb-4">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Заметка к сессии фокуса (опционально)..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 outline-none"
          />
        </div>
      )}

      {/* Кнопки управления */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleStartPause}
          disabled={activities.length === 0}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-600/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
          } disabled:opacity-50`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Пауза</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{seconds > 0 ? 'Продолжить' : 'Начать фокус'}</span>
            </>
          )}
        </button>

        {seconds > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс</span>
          </button>
        )}

        {seconds > 0 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSaving ? 'Сохранение...' : 'Остановить и сохранить'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
