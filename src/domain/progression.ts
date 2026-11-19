/**
 * Pure progression mathematical engine for Life Gamification
 * Reference: decisions/01-progression-formula.md
 * Formula: Level = 1 + floor( (totalMinutes / 60)^0.60 * 3.0 )
 */

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
