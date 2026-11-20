import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Check,
  AlertCircle,
  Trophy,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { UserProfile, Activity, AchievementWithDetails } from '../domain/types';
import {
  MAX_PINNED_BADGES,
  buildHeroCardPayload,
  togglePinnedBadge,
  renderHeroCardToCanvas,
  downloadCanvasAsPng,
  generateHeroCardFilename,
} from '../domain/heroCardExport';
import { HeroCardPreview } from './HeroCardPreview';

export interface ExportHeroCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserProfile | null;
  activities: Activity[];
  achievements: AchievementWithDetails[];
  initialPinnedCodes?: string[];
  onSavePinnedCodes?: (pinnedCodes: string[]) => Promise<void>;
}

export const ExportHeroCardModal: React.FC<ExportHeroCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  activities,
  achievements,
  initialPinnedCodes,
  onSavePinnedCodes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pinnedCodes, setPinnedCodes] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Список только открытых достижений
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt != null);

  // Инициализация выбранных регалий при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setDownloadSuccess(false);

      if (initialPinnedCodes && initialPinnedCodes.length > 0) {
        setPinnedCodes(initialPinnedCodes.slice(0, MAX_PINNED_BADGES));
      } else if (profile?.pinnedBadgeCodes && profile.pinnedBadgeCodes.length > 0) {
        setPinnedCodes(profile.pinnedBadgeCodes.slice(0, MAX_PINNED_BADGES));
      } else if (unlockedAchievements.length > 0) {
        // По умолчанию выбираем первые до 5 открытых достижений
        setPinnedCodes(unlockedAchievements.slice(0, MAX_PINNED_BADGES).map((a) => a.code));
      } else {
        setPinnedCodes([]);
      }
    }
  }, [isOpen, profile?.pinnedBadgeCodes, initialPinnedCodes, achievements]);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleBadge = (code: string) => {
    const res = togglePinnedBadge(pinnedCodes, code, MAX_PINNED_BADGES);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setErrorMessage(null);
      setPinnedCodes(res.pinned);
      if (onSavePinnedCodes) {
        onSavePinnedCodes(res.pinned).catch(console.error);
      }
    }
  };

  const payload = buildHeroCardPayload({
    profile,
    activities,
    achievements,
    pinnedBadgeCodes: pinnedCodes,
  });

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      setIsDownloading(true);
      setErrorMessage(null);

      // Рендерим холст 1200x630 Retina
      renderHeroCardToCanvas(canvasRef.current, payload);

      const filename = generateHeroCardFilename();
      await downloadCanvasAsPng(canvasRef.current, filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ошибка при экспорте изображения');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      data-testid="export-hero-card-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl shadow-inner">
              👑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                <span>Экспорт Карточки Героя</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Храм Достижений Олимпа • Высокое разрешение 1200x630 Retina PNG
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело модального окна: Сетка из 2 частей */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Предупреждение / Сообщение об ошибке */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-950/60 border border-amber-500 text-amber-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Сообщение об успешном скачивании */}
          {downloadSuccess && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                Карточка Героя успешно сгенерирована и сохранена на ваше устройство!
              </span>
            </div>
          )}

          {/* Интерактивное превью в реальном времени */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Предпросмотр карточки (обновляется в реальном времени)
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                1200 × 630 px
              </span>
            </div>
            <HeroCardPreview payload={payload} />
          </div>

          {/* Секция выбора регалий */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Выберите регалии для витрины</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Отметьте до {MAX_PINNED_BADGES} открытых достижений, чтобы закрепить их на карточке
                </p>
              </div>

              {/* Счетчик выбора */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold">
                <span className="text-slate-400">Выбрано:</span>
                <span
                  className={
                    pinnedCodes.length === MAX_PINNED_BADGES
                      ? 'text-amber-400'
                      : 'text-slate-200'
                  }
                >
                  {pinnedCodes.length} из {MAX_PINNED_BADGES}
                </span>
              </div>
            </div>

            {/* Список открытых достижений */}
            {unlockedAchievements.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800/80 border-dashed text-center">
                <div className="text-3xl mb-2">🏛️</div>
                <h4 className="text-sm font-bold text-slate-300">
                  Пока нет открытых регалий в Храме
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Учитывайте время и завершайте квесты, чтобы разблокировать спартанские щиты, подвиги Геракла и нить Ариадны. Карточка героя доступна для скачивания уже сейчас!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {unlockedAchievements.map((ach) => {
                  const isChecked = pinnedCodes.includes(ach.code);
                  const isLimitReached = pinnedCodes.length >= MAX_PINNED_BADGES && !isChecked;

                  return (
                    <button
                      key={ach.code}
                      type="button"
                      onClick={() => handleToggleBadge(ach.code)}
                      className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/30'
                          : isLimitReached
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{ach.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-100 truncate">
                            {ach.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {ach.categoryTitle}
                          </div>
                        </div>
                      </div>

                      {/* Чекбокс индикатор */}
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                          isChecked
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Невидимый HTML5 Canvas для генерации 1200x630 Retina PNG */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={630}
          className="hidden"
          aria-hidden="true"
        />

        {/* Подвал модального окна с кнопками действий */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
            <span>✨</span>
            <span>Готово для отправки в соцсети, Telegram или печати</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Закрыть
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isDownloading ? 'Генерация...' : 'Скачать карточку (1200x630 PNG)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
