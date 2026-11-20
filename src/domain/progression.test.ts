import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  calculateHoursForLevel,
  calculateMinutesForLevel,
  getLevelProgress,
  getPantheonTier,
  GreekProgressionModule,
} from './progression';

describe('GreekProgressionModule & Math Engine (decisions/01-progression-formula.md)', () => {
  it('exports GreekProgressionModule object with all pure progression methods', () => {
    expect(GreekProgressionModule).toBeDefined();
    expect(typeof GreekProgressionModule.calculateLevel).toBe('function');
    expect(typeof GreekProgressionModule.calculateHoursForLevel).toBe('function');
    expect(typeof GreekProgressionModule.calculateMinutesForLevel).toBe('function');
    expect(typeof GreekProgressionModule.getLevelProgress).toBe('function');
    expect(typeof GreekProgressionModule.getPantheonTier).toBe('function');
  });

  it('returns level 1 for 0 or negative minutes', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(-10)).toBe(1);
    expect(GreekProgressionModule.calculateLevel(0)).toBe(1);
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

  it('calculates hours and minutes required for target level inverse formula', () => {
    expect(calculateHoursForLevel(1)).toBe(0);
    expect(calculateMinutesForLevel(1)).toBe(0);

    const hoursForLvl4 = calculateHoursForLevel(4);
    // targetBonus = 3; (3/3)^(1/0.6) = 1.0 hour = 60 minutes
    expect(Math.round(hoursForLvl4)).toBe(1);
    expect(calculateMinutesForLevel(4)).toBe(60);

    // Level 2 threshold is at minute 10
    const minForLvl2 = calculateMinutesForLevel(2);
    expect(minForLvl2).toBe(10);
    expect(calculateLevel(9)).toBe(1);
    expect(calculateLevel(10)).toBe(2);
  });

  it('calculates percentage progress and exact minutes earned and remaining', () => {
    // At 0 minutes
    const progress0 = getLevelProgress(0);
    expect(progress0.currentLevel).toBe(1);
    expect(progress0.nextLevel).toBe(2);
    expect(progress0.currentLevelStartMinutes).toBe(0);
    expect(progress0.nextLevelStartMinutes).toBe(10);
    expect(progress0.minutesIntoLevel).toBe(0);
    expect(progress0.minutesRemainingToNextLevel).toBe(10);
    expect(progress0.minutesNeededForNextLevel).toBe(10);
    expect(progress0.progressPercent).toBe(0);

    // At 20 minutes (Level 2: threshold min 10, next level 3 threshold min 31)
    const progress20 = getLevelProgress(20);
    expect(progress20.currentLevel).toBe(2);
    expect(progress20.nextLevel).toBe(3);
    expect(progress20.currentLevelStartMinutes).toBe(10);
    expect(progress20.nextLevelStartMinutes).toBe(31);
    expect(progress20.minutesIntoLevel).toBe(10);
    expect(progress20.minutesRemainingToNextLevel).toBe(11);
    expect(progress20.minutesNeededForNextLevel).toBe(21);
    expect(progress20.minutesIntoLevel + progress20.minutesRemainingToNextLevel).toBe(progress20.minutesNeededForNextLevel);
    expect(progress20.progressPercent).toBe(48); // 10/21 * 100 ~= 47.6 -> 48%
  });

  describe('Pantheon Tiers and Mythological Titles mapping across Levels 1 to 100+', () => {
    it('maps Mortal tier (1-10) with Wanderer of Ithaca, Spartan Hoplite, Seeker of the Golden Fleece', () => {
      // 1-4: Wanderer of Ithaca / Странник Итаки
      const lvl1 = getPantheonTier(1);
      expect(lvl1.tier).toBe('Смертный');
      expect(lvl1.tierEn).toBe('Mortal');
      expect(lvl1.title).toBe('Странник Итаки');
      expect(lvl1.titleEn).toBe('Wanderer of Ithaca');

      const lvl4 = getPantheonTier(4);
      expect(lvl4.title).toBe('Странник Итаки');

      // 5-7: Spartan Hoplite / Спартанский Гоплит
      const lvl5 = getPantheonTier(5);
      expect(lvl5.tier).toBe('Смертный');
      expect(lvl5.title).toBe('Спартанский Гоплит');
      expect(lvl5.titleEn).toBe('Spartan Hoplite');

      const lvl7 = getPantheonTier(7);
      expect(lvl7.title).toBe('Спартанский Гоплит');

      // 8-10: Seeker of the Golden Fleece / Искатель Золотого Руна
      const lvl8 = getPantheonTier(8);
      expect(lvl8.tier).toBe('Смертный');
      expect(lvl8.title).toBe('Искатель Золотого Руна');
      expect(lvl8.titleEn).toBe('Seeker of the Golden Fleece');

      const lvl10 = getPantheonTier(10);
      expect(lvl10.title).toBe('Искатель Золотого Руна');
    });

    it('maps Hero of Hellas tier (11-30) with Argonaut, Spartan Warrior, Slayer of the Minotaur, Hero of Troy', () => {
      // 11-14: Argonaut / Аргонавт
      const lvl11 = getPantheonTier(11);
      expect(lvl11.tier).toBe('Герой Эллады');
      expect(lvl11.tierEn).toBe('Hero of Hellas');
      expect(lvl11.title).toBe('Аргонавт');
      expect(lvl11.titleEn).toBe('Argonaut');

      // 15-19: Spartan Warrior / Спартанский Воитель
      const lvl15 = getPantheonTier(15);
      expect(lvl15.tier).toBe('Герой Эллады');
      expect(lvl15.title).toBe('Спартанский Воитель');
      expect(lvl15.titleEn).toBe('Spartan Warrior');

      // 20-24: Slayer of the Minotaur / Победитель Минотавра
      const lvl20 = getPantheonTier(20);
      expect(lvl20.tier).toBe('Герой Эллады');
      expect(lvl20.title).toBe('Победитель Минотавра');
      expect(lvl20.titleEn).toBe('Slayer of the Minotaur');

      // 25-30: Hero of Troy / Герой Трои
      const lvl25 = getPantheonTier(25);
      expect(lvl25.tier).toBe('Герой Эллады');
      expect(lvl25.title).toBe('Герой Трои');
      expect(lvl25.titleEn).toBe('Hero of Troy');

      const lvl30 = getPantheonTier(30);
      expect(lvl30.title).toBe('Герой Трои');
    });

    it('maps Demigod tier (31-55) with Chosen of the Oracle, Slayer of the Gorgon, Heir of Heracles', () => {
      // 31-39: Chosen of the Oracle / Избранник Оракула
      const lvl31 = getPantheonTier(31);
      expect(lvl31.tier).toBe('Полубог');
      expect(lvl31.tierEn).toBe('Demigod');
      expect(lvl31.title).toBe('Избранник Оракула');
      expect(lvl31.titleEn).toBe('Chosen of the Oracle');

      // 40-47: Slayer of the Gorgon / Победитель Горгоны
      const lvl40 = getPantheonTier(40);
      expect(lvl40.tier).toBe('Полубог');
      expect(lvl40.title).toBe('Победитель Горгоны');
      expect(lvl40.titleEn).toBe('Slayer of the Gorgon');

      // 48-55: Heir of Heracles / Наследник Геракла
      const lvl48 = getPantheonTier(48);
      expect(lvl48.tier).toBe('Полубог');
      expect(lvl48.title).toBe('Наследник Геракла');
      expect(lvl48.titleEn).toBe('Heir of Heracles');

      const lvl55 = getPantheonTier(55);
      expect(lvl55.title).toBe('Наследник Геракла');
    });

    it('maps Titan of Will tier (56-80) with Bearer of the Heavens, Bringer of Fire, Master of Time', () => {
      // 56-64: Bearer of the Heavens / Держатель Небосвода
      const lvl56 = getPantheonTier(56);
      expect(lvl56.tier).toBe('Титан Воли');
      expect(lvl56.tierEn).toBe('Titan of Will');
      expect(lvl56.title).toBe('Держатель Небосвода');
      expect(lvl56.titleEn).toBe('Bearer of the Heavens');

      // 65-72: Bringer of Fire / Дарующий Огонь
      const lvl65 = getPantheonTier(65);
      expect(lvl65.tier).toBe('Титан Воли');
      expect(lvl65.title).toBe('Дарующий Огонь');
      expect(lvl65.titleEn).toBe('Bringer of Fire');

      // 73-80: Master of Time / Владыка Времени
      const lvl73 = getPantheonTier(73);
      expect(lvl73.tier).toBe('Титан Воли');
      expect(lvl73.title).toBe('Владыка Времени');
      expect(lvl73.titleEn).toBe('Master of Time');

      const lvl80 = getPantheonTier(80);
      expect(lvl80.title).toBe('Владыка Времени');
    });

    it('maps Olympian tier (81-99) with Guardian of Olympus, Messenger Hermes, Light of Apollo, Wisdom of Athena', () => {
      // 81-84: Guardian of Olympus / Страж Олимпа
      const lvl81 = getPantheonTier(81);
      expect(lvl81.tier).toBe('Олимпиец');
      expect(lvl81.tierEn).toBe('Olympian');
      expect(lvl81.title).toBe('Страж Олимпа');
      expect(lvl81.titleEn).toBe('Guardian of Olympus');

      // 85-89: Messenger Hermes / Вестник Гермес
      const lvl85 = getPantheonTier(85);
      expect(lvl85.tier).toBe('Олимпиец');
      expect(lvl85.title).toBe('Вестник Гермес');
      expect(lvl85.titleEn).toBe('Messenger Hermes');

      // 90-94: Light of Apollo / Свет Аполлона
      const lvl90 = getPantheonTier(90);
      expect(lvl90.tier).toBe('Олимпиец');
      expect(lvl90.title).toBe('Свет Аполлона');
      expect(lvl90.titleEn).toBe('Light of Apollo');

      // 95-99: Wisdom of Athena / Мудрость Афины
      const lvl95 = getPantheonTier(95);
      expect(lvl95.tier).toBe('Олимпиец');
      expect(lvl95.title).toBe('Мудрость Афины');
      expect(lvl95.titleEn).toBe('Wisdom of Athena');

      const lvl99 = getPantheonTier(99);
      expect(lvl99.title).toBe('Мудрость Афины');
    });

    it('maps Ascendant God tier (100+) with Ruler of Olympus / Zeus', () => {
      const lvl100 = getPantheonTier(100);
      expect(lvl100.tier).toBe('Восходящий Бог');
      expect(lvl100.tierEn).toBe('Ascendant God');
      expect(lvl100.title).toBe('Владыка Олимпа');
      expect(lvl100.titleEn).toBe('Ruler of Olympus / Zeus');

      const lvl150 = getPantheonTier(150);
      expect(lvl150.tier).toBe('Восходящий Бог');
      expect(lvl150.title).toBe('Владыка Олимпа');
    });

    it('verifies smooth tier transitions at every boundary', () => {
      // Mortal -> Hero of Hellas (10 -> 11)
      expect(getPantheonTier(10).tier).toBe('Смертный');
      expect(getPantheonTier(11).tier).toBe('Герой Эллады');

      // Hero of Hellas -> Demigod (30 -> 31)
      expect(getPantheonTier(30).tier).toBe('Герой Эллады');
      expect(getPantheonTier(31).tier).toBe('Полубог');

      // Demigod -> Titan of Will (55 -> 56)
      expect(getPantheonTier(55).tier).toBe('Полубог');
      expect(getPantheonTier(56).tier).toBe('Титан Воли');

      // Titan of Will -> Olympian (80 -> 81)
      expect(getPantheonTier(80).tier).toBe('Титан Воли');
      expect(getPantheonTier(81).tier).toBe('Олимпиец');

      // Olympian -> Ascendant God (99 -> 100)
      expect(getPantheonTier(99).tier).toBe('Олимпиец');
      expect(getPantheonTier(100).tier).toBe('Восходящий Бог');
    });
  });
});
