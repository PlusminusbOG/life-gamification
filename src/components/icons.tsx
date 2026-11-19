import {
  BookOpen,
  Code,
  Dumbbell,
  Flame,
  Heart,
  Palette,
  Music,
  GraduationCap,
  Compass,
  Trophy,
  Sparkles,
  Zap,
  Sword,
  Target,
  Shield,
  type LucideIcon,
} from 'lucide-react';

export const ICON_OPTIONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'BookOpen', label: 'Чтение', icon: BookOpen },
  { name: 'Code', label: 'Кодинг', icon: Code },
  { name: 'Dumbbell', label: 'Спорт', icon: Dumbbell },
  { name: 'Flame', label: 'Фокус', icon: Flame },
  { name: 'Palette', label: 'Искусство', icon: Palette },
  { name: 'Music', label: 'Музыка', icon: Music },
  { name: 'GraduationCap', label: 'Учёба', icon: GraduationCap },
  { name: 'Compass', label: 'Поиск', icon: Compass },
  { name: 'Sword', label: 'Дисциплина', icon: Sword },
  { name: 'Target', label: 'Точность', icon: Target },
  { name: 'Shield', label: 'Стойкость', icon: Shield },
  { name: 'Zap', label: 'Энергия', icon: Zap },
  { name: 'Heart', label: 'Здоровье', icon: Heart },
  { name: 'Sparkles', label: 'Ремесло', icon: Sparkles },
  { name: 'Trophy', label: 'Триумф', icon: Trophy },
];

export const COLOR_OPTIONS: { name: string; hex: string; bgClass: string; textClass: string }[] = [
  { name: 'Янтарный', hex: '#f59e0b', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400' },
  { name: 'Изумрудный', hex: '#10b981', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' },
  { name: 'Небесный', hex: '#0284c7', bgClass: 'bg-sky-500/20', textClass: 'text-sky-400' },
  { name: 'Фиолетовый', hex: '#8b5cf6', bgClass: 'bg-violet-500/20', textClass: 'text-violet-400' },
  { name: 'Розовый', hex: '#f43f5e', bgClass: 'bg-rose-500/20', textClass: 'text-rose-400' },
  { name: 'Индиго', hex: '#6366f1', bgClass: 'bg-indigo-500/20', textClass: 'text-indigo-400' },
  { name: 'Бирюзовый', hex: '#14b8a6', bgClass: 'bg-teal-500/20', textClass: 'text-teal-400' },
  { name: 'Оранжевый', hex: '#f97316', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400' },
];

export function getIconComponent(iconName?: string): LucideIcon {
  const found = ICON_OPTIONS.find((item) => item.name === iconName);
  return found ? found.icon : Target;
}
