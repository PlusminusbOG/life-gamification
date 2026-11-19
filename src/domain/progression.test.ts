import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  calculateHoursForLevel,
  getLevelProgress,
  getPantheonTier,
} from './progression';

describe('Progression Math Engine (decisions/01-progression-formula.md)', () => {
  it('returns level 1 for 0 or negative minutes', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(-10)).toBe(1);
  });

  it('yields rapid early level-ups (Level 2 at ~20m, Level 4 at 1h, Level 12 at 10h)', () => {
    // 20 minutes = 1/3 hour -> (1/3)^0.6 * 3 = ~1.55 -> floor = 1 -> Level 2
    expect(calculateLevel(20)).toBe(2);

    // 60 minutes = 1.0 hour -> 1^0.6 * 3 = 3 -> floor = 3 -> Level 4
    expect(calculateLevel(60)).toBe(4);

    // 10 hours = 600 minutes -> 10^0.6 * 3 = ~11.94 -> floor = 11 -> Level 12
    expect(calculateLevel(600)).toBe(12);

    // 100 hours = 6000 minutes -> 100^0.6 * 3 = ~47.5 -> floor = 47 -> Level 48
    expect(calculateLevel(6000)).toBe(48);

    // 350 hours = 21000 minutes -> 350^0.6 * 3 = ~100.8 -> floor = 100 -> Level 101
    expect(calculateLevel(21000)).toBe(101);
  });

  it('calculates hours required for target level inverse formula', () => {
    expect(calculateHoursForLevel(1)).toBe(0);
    const hoursForLvl4 = calculateHoursForLevel(4);
    // targetBonus = 3; (3/3)^(1/0.6) = 1.0 hour
    expect(Math.round(hoursForLvl4)).toBe(1);
  });

  it('calculates percentage progress to next level', () => {
    const progress0 = getLevelProgress(0);
    expect(progress0.currentLevel).toBe(1);
    expect(progress0.nextLevel).toBe(2);
    expect(progress0.progressPercent).toBeGreaterThanOrEqual(0);

    const progress60 = getLevelProgress(60);
    expect(progress60.currentLevel).toBe(4);
    expect(progress60.nextLevel).toBe(5);
  });

  it('maps level to Russian Greek Pantheon Tiers and Titles correctly', () => {
    // Level 1 -> Смертный, Странник Итаки
    const tier1 = getPantheonTier(1);
    expect(tier1.tier).toBe('Смертный');
    expect(tier1.title).toBe('Странник Итаки');

    // Level 15 -> Герой Эллады, Аргонавт
    const tier15 = getPantheonTier(15);
    expect(tier15.tier).toBe('Герой Эллады');
    expect(tier15.title).toBe('Аргонавт');

    // Level 40 -> Полубог, Избранник Оракула
    const tier40 = getPantheonTier(40);
    expect(tier40.tier).toBe('Полубог');
    expect(tier40.title).toBe('Избранник Оракула');

    // Level 60 -> Титан Воли, Держатель Небосвода
    const tier60 = getPantheonTier(60);
    expect(tier60.tier).toBe('Титан Воли');
    expect(tier60.title).toBe('Держатель Небосвода');

    // Level 85 -> Олимпиец, Мудрость Афины
    const tier85 = getPantheonTier(85);
    expect(tier85.tier).toBe('Олимпиец');
    expect(tier85.title).toBe('Мудрость Афины');

    // Level 100 -> Восходящий Бог, Владыка Олимпа
    const tier100 = getPantheonTier(100);
    expect(tier100.tier).toBe('Восходящий Бог');
    expect(tier100.title).toBe('Владыка Олимпа');
  });
});
