/**
 * Единые доменные модели Геймификации Жизни
 * Соответствует GLOSSARY.md и docs/research/02-dexie-schema-and-export.md
 */

export interface Activity {
  id: string; // UUID
  name: string; // Уникальное название занятия (например, "Чтение", "Бег", "Кодинг")
  totalMinutes: number; // Накопленные минуты (никогда не уменьшаются)
  level: number; // Рассчитанный RPG-уровень
  icon?: string; // Идентификатор иконки
  color?: string; // Hex или Tailwind цвет
  createdAt: number; // Метка времени создания (мс)
  updatedAt: number; // Метка времени обновления (мс)
}

export interface TimeLog {
  id: string; // UUID
  activityId: string; // Внешний ключ -> Activity.id
  durationMinutes: number; // Длительность в минутах
  timestamp: number; // Время завершения (мс)
  notes?: string; // Заметки / размышления
  createdAt: number; // Время создания записи (мс)
}

export interface UserProfile {
  id: string; // Ключ синглтона: 'me'
  name: string; // Имя героя (по умолчанию "Герой Эллады")
  totalMinutes: number; // Накопленные минуты героя (исключает погрешность float)
  totalHours: number; // Накопленные пожизненные часы героя (никогда не уменьшаются)
  createdAt: number; // Метка времени (мс)
  updatedAt: number; // Метка времени (мс)
}

export type PantheonTier =
  | 'Смертный'
  | 'Герой Эллады'
  | 'Полубог'
  | 'Титан Воли'
  | 'Олимпиец'
  | 'Восходящий Бог';

export type PantheonTierEn =
  | 'Mortal'
  | 'Hero of Hellas'
  | 'Demigod'
  | 'Titan of Will'
  | 'Olympian'
  | 'Ascendant God';

export type PantheonTierCode =
  | 'mortal'
  | 'hero'
  | 'demigod'
  | 'titan'
  | 'olympian'
  | 'god';

export interface PantheonTierInfo {
  tier: PantheonTier;
  tierEn: PantheonTierEn;
  tierCode: PantheonTierCode;
  title: string;
  titleEn: string;
  minLevel: number;
  maxLevel: number;
}

export interface HeroState {
  profile: UserProfile;
  activities: Activity[];
}

export interface CreateActivityInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface LogTimeInput {
  activityId: string;
  durationMinutes: number;
  notes?: string;
  timestamp?: number;
}
