/**
 * Модуль праздничных микроанимаций (Confetti) и звуковых эффектов
 * Источник: Ticket 08
 */

import confetti from 'canvas-confetti';
import {
  playQuestCompleteSound,
  playLevelUpSound,
  playAchievementSound,
} from './soundService';

const GOLD_PALETTE = ['#f59e0b', '#fbbf24', '#fef08a', '#d97706', '#38bdf8', '#10b981'];

/**
 * Праздничный салют при завершении квеста
 */
export function triggerQuestCompleteCelebration(): void {
  playQuestCompleteSound();

  try {
    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: GOLD_PALETTE,
        disableForReducedMotion: true,
      });
    }
  } catch {
    // Безопасный перехват
  }
}

/**
 * Триумфальный двойной салют при повышении RPG-уровня героя
 */
export function triggerLevelUpCelebration(): void {
  playLevelUpSound();

  try {
    if (typeof window !== 'undefined') {
      // Левый залп
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0.1, y: 0.7 },
        colors: GOLD_PALETTE,
        disableForReducedMotion: true,
      });

      // Правый залп
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 0.9, y: 0.7 },
        colors: GOLD_PALETTE,
        disableForReducedMotion: true,
      });
    }
  } catch {
    // Безопасный перехват
  }
}

/**
 * Празднование разблокировки достижения в Храме
 */
export function triggerAchievementUnlockedCelebration(): void {
  playAchievementSound();

  try {
    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#a855f7', '#ec4899'],
        disableForReducedMotion: true,
      });
    }
  } catch {
    // Безопасный перехват
  }
}
