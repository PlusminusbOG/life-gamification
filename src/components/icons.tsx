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
  { name: 'BookOpen', label: 'Reading', icon: BookOpen },
  { name: 'Code', label: 'Coding', icon: Code },
  { name: 'Dumbbell', label: 'Fitness', icon: Dumbbell },
  { name: 'Flame', label: 'Focus', icon: Flame },
  { name: 'Palette', label: 'Art', icon: Palette },
  { name: 'Music', label: 'Music', icon: Music },
  { name: 'GraduationCap', label: 'Study', icon: GraduationCap },
  { name: 'Compass', label: 'Adventure', icon: Compass },
  { name: 'Sword', label: 'Discipline', icon: Sword },
  { name: 'Target', label: 'Precision', icon: Target },
  { name: 'Shield', label: 'Endurance', icon: Shield },
  { name: 'Zap', label: 'Energy', icon: Zap },
  { name: 'Heart', label: 'Wellness', icon: Heart },
  { name: 'Sparkles', label: 'Craft', icon: Sparkles },
  { name: 'Trophy', label: 'Mastery', icon: Trophy },
];

export const COLOR_OPTIONS: { name: string; hex: string; bgClass: string; textClass: string }[] = [
  { name: 'Amber', hex: '#f59e0b', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400' },
  { name: 'Emerald', hex: '#10b981', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' },
  { name: 'Sky', hex: '#0284c7', bgClass: 'bg-sky-500/20', textClass: 'text-sky-400' },
  { name: 'Violet', hex: '#8b5cf6', bgClass: 'bg-violet-500/20', textClass: 'text-violet-400' },
  { name: 'Rose', hex: '#f43f5e', bgClass: 'bg-rose-500/20', textClass: 'text-rose-400' },
  { name: 'Indigo', hex: '#6366f1', bgClass: 'bg-indigo-500/20', textClass: 'text-indigo-400' },
  { name: 'Teal', hex: '#14b8a6', bgClass: 'bg-teal-500/20', textClass: 'text-teal-400' },
  { name: 'Orange', hex: '#f97316', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400' },
];

export function getIconComponent(iconName?: string): LucideIcon {
  const found = ICON_OPTIONS.find((item) => item.name === iconName);
  return found ? found.icon : Target;
}
