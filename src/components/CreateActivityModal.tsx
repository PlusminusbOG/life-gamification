import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { ICON_OPTIONS, COLOR_OPTIONS } from './icons';
import type { CreateActivityInput } from '../domain/types';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateActivityInput) => Promise<void>;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');
  const [selectedColor, setSelectedColor] = useState('#f59e0b');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Пожалуйста, укажите название занятия');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      setName('');
      setSelectedIcon('BookOpen');
      setSelectedColor('#f59e0b');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Не удалось создать занятие');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Фоновое свечение */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: selectedColor }}
        />

        {/* Шапка модального окна */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Создать новое занятие</h2>
              <p className="text-xs text-slate-400">Постоянное жизненное направление, накапливающее пожизненный опыт</p>
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
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Название занятия */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Название занятия
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="например: Чтение книг, Классическая гитара, Подготовка к марафону..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
          </div>

          {/* Выбор цвета */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Цветовая тема
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center ${
                    selectedColor === c.hex ? 'scale-110 border-white shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor === c.hex && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор эмблемы */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Эмблема / Иконка
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-950/50 rounded-2xl border border-slate-800/80">
              {ICON_OPTIONS.map((item) => {
                const ItemIcon = item.icon;
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <ItemIcon className="w-5 h-5" />
                    <span className="text-[10px] truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Создание...' : 'Создать занятие'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
