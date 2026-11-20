/**
 * Математический движок прогрессии Геймификации Жизни
 * Источник: decisions/01-progression-formula.md
 * Формула: Уровень = 1 + floor( (totalMinutes / 60)^0.60 * 3.0 )
 */

import type { PantheonTierInfo } from './types';

export function calculateLevel(totalMinutes: number): number {
  if (totalMinutes <= 0) return 1;
  const hours = totalMinutes / 60;
  const levelBonus = Math.floor(Math.pow(hours, 0.6) * 3.0);
  return 1 + levelBonus;
}

export function calculateHoursForLevel(targetLevel: number): number {
  if (targetLevel <= 1) return 0;
  const targetBonus = targetLevel - 1;
  return Math.pow(targetBonus / 3.0, 1 / 0.6);
}

export function calculateMinutesForLevel(targetLevel: number): number {
  if (targetLevel <= 1) return 0;
  const hours = calculateHoursForLevel(targetLevel);
  return Math.ceil(hours * 60);
}

export interface LevelProgress {
  currentLevel: number;
  currentMinutes: number;
  nextLevel: number;
  currentLevelStartMinutes: number;
  nextLevelStartMinutes: number;
  minutesIntoLevel: number;
  minutesRemainingToNextLevel: number;
  minutesNeededForNextLevel: number;
  progressPercent: number;
}

export function getLevelProgress(totalMinutes: number): LevelProgress {
  const currentMinutes = Math.max(0, Math.floor(totalMinutes));
  const currentLevel = calculateLevel(currentMinutes);
  const nextLevel = currentLevel + 1;

  const currentLevelStartMinutes = calculateMinutesForLevel(currentLevel);
  const nextLevelStartMinutes = calculateMinutesForLevel(nextLevel);

  const minutesNeededForNextLevel = Math.max(1, nextLevelStartMinutes - currentLevelStartMinutes);
  const minutesIntoLevel = Math.max(0, currentMinutes - currentLevelStartMinutes);
  const minutesRemainingToNextLevel = Math.max(0, nextLevelStartMinutes - currentMinutes);
  const progressPercent = Math.min(100, Math.max(0, Math.round((minutesIntoLevel / minutesNeededForNextLevel) * 100)));

  return {
    currentLevel,
    currentMinutes,
    nextLevel,
    currentLevelStartMinutes,
    nextLevelStartMinutes,
    minutesIntoLevel,
    minutesRemainingToNextLevel,
    minutesNeededForNextLevel,
    progressPercent,
  };
}

export function getPantheonTier(level: number): PantheonTierInfo {
  // 100+: Ascendant God / Восходящий Бог
  if (level >= 100) {
    return {
      tier: 'Восходящий Бог',
      tierEn: 'Ascendant God',
      tierCode: 'god',
      title: 'Владыка Олимпа',
      titleEn: 'Ruler of Olympus / Zeus',
      minLevel: 100,
      maxLevel: Infinity,
    };
  }

  // 81–99: Olympian / Олимпиец
  if (level >= 81) {
    let title = 'Страж Олимпа';
    let titleEn = 'Guardian of Olympus';
    if (level >= 95) {
      title = 'Мудрость Афины';
      titleEn = 'Wisdom of Athena';
    } else if (level >= 90) {
      title = 'Свет Аполлона';
      titleEn = 'Light of Apollo';
    } else if (level >= 85) {
      title = 'Вестник Гермес';
      titleEn = 'Messenger Hermes';
    }

    return {
      tier: 'Олимпиец',
      tierEn: 'Olympian',
      tierCode: 'olympian',
      title,
      titleEn,
      minLevel: 81,
      maxLevel: 99,
    };
  }

  // 56–80: Titan of Will / Титан Воли
  if (level >= 56) {
    let title = 'Держатель Небосвода';
    let titleEn = 'Bearer of the Heavens';
    if (level >= 73) {
      title = 'Владыка Времени';
      titleEn = 'Master of Time';
    } else if (level >= 65) {
      title = 'Дарующий Огонь';
      titleEn = 'Bringer of Fire';
    }

    return {
      tier: 'Титан Воли',
      tierEn: 'Titan of Will',
      tierCode: 'titan',
      title,
      titleEn,
      minLevel: 56,
      maxLevel: 80,
    };
  }

  // 31–55: Demigod / Полубог
  if (level >= 31) {
    let title = 'Избранник Оракула';
    let titleEn = 'Chosen of the Oracle';
    if (level >= 48) {
      title = 'Наследник Геракла';
      titleEn = 'Heir of Heracles';
    } else if (level >= 40) {
      title = 'Победитель Горгоны';
      titleEn = 'Slayer of the Gorgon';
    }

    return {
      tier: 'Полубог',
      tierEn: 'Demigod',
      tierCode: 'demigod',
      title,
      titleEn,
      minLevel: 31,
      maxLevel: 55,
    };
  }

  // 11–30: Hero of Hellas / Герой Эллады
  if (level >= 11) {
    let title = 'Аргонавт';
    let titleEn = 'Argonaut';
    if (level >= 25) {
      title = 'Герой Трои';
      titleEn = 'Hero of Troy';
    } else if (level >= 20) {
      title = 'Победитель Минотавра';
      titleEn = 'Slayer of the Minotaur';
    } else if (level >= 15) {
      title = 'Спартанский Воитель';
      titleEn = 'Spartan Warrior';
    }

    return {
      tier: 'Герой Эллады',
      tierEn: 'Hero of Hellas',
      tierCode: 'hero',
      title,
      titleEn,
      minLevel: 11,
      maxLevel: 30,
    };
  }

  // 1–10: Mortal / Смертный
  let title = 'Странник Итаки';
  let titleEn = 'Wanderer of Ithaca';
  if (level >= 8) {
    title = 'Искатель Золотого Руна';
    titleEn = 'Seeker of the Golden Fleece';
  } else if (level >= 5) {
    title = 'Спартанский Гоплит';
    titleEn = 'Spartan Hoplite';
  }

  return {
    tier: 'Смертный',
    tierEn: 'Mortal',
    tierCode: 'mortal',
    title,
    titleEn,
    minLevel: 1,
    maxLevel: 10,
  };
}

export const GreekProgressionModule = {
  calculateLevel,
  calculateHoursForLevel,
  calculateMinutesForLevel,
  getLevelProgress,
  getPantheonTier,
};
