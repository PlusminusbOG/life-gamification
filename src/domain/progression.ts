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

export interface LevelProgress {
  currentLevel: number;
  currentMinutes: number;
  nextLevel: number;
  minutesIntoLevel: number;
  minutesNeededForNextLevel: number;
  progressPercent: number;
}

export function getLevelProgress(totalMinutes: number): LevelProgress {
  const currentMinutes = Math.max(0, totalMinutes);
  const currentLevel = calculateLevel(currentMinutes);
  const nextLevel = currentLevel + 1;

  const currentLevelStartMinutes = Math.round(calculateHoursForLevel(currentLevel) * 60);
  const nextLevelStartMinutes = Math.round(calculateHoursForLevel(nextLevel) * 60);

  const span = Math.max(1, nextLevelStartMinutes - currentLevelStartMinutes);
  const earned = Math.max(0, currentMinutes - currentLevelStartMinutes);
  const progressPercent = Math.min(100, Math.round((earned / span) * 100));

  return {
    currentLevel,
    currentMinutes,
    nextLevel,
    minutesIntoLevel: earned,
    minutesNeededForNextLevel: span,
    progressPercent,
  };
}

export function getPantheonTier(level: number): PantheonTierInfo {
  if (level >= 100) {
    return {
      tier: 'Восходящий Бог',
      title: 'Владыка Олимпа',
      minLevel: 100,
      maxLevel: Infinity,
    };
  }
  if (level >= 81) {
    return {
      tier: 'Олимпиец',
      title: 'Мудрость Афины',
      minLevel: 81,
      maxLevel: 99,
    };
  }
  if (level >= 56) {
    return {
      tier: 'Титан Воли',
      title: 'Держатель Небосвода',
      minLevel: 56,
      maxLevel: 80,
    };
  }
  if (level >= 31) {
    return {
      tier: 'Полубог',
      title: 'Избранник Оракула',
      minLevel: 31,
      maxLevel: 55,
    };
  }
  if (level >= 11) {
    return {
      tier: 'Герой Эллады',
      title: 'Аргонавт',
      minLevel: 11,
      maxLevel: 30,
    };
  }
  return {
    tier: 'Смертный',
    title: 'Странник Итаки',
    minLevel: 1,
    maxLevel: 10,
  };
}
