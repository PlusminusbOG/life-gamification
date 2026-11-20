/**
 * Декларативный движок несгораемых достижений (Храм Олимпа)
 * Источник: Ticket 04, GLOSSARY.md
 */

import type {
  Activity,
  TimeLog,
  Quest,
  Achievement,
  AchievementCategory,
} from './types';

export interface AchievementEvaluationState {
  totalHours: number;
  totalMinutes: number;
  completedQuestsCount: number;
  activities: Activity[];
  timeLogs: TimeLog[];
  completedQuests: Quest[];
}

export interface AchievementDefinition {
  code: string;
  title: string;
  titleEn: string;
  description: string;
  category: AchievementCategory;
  categoryTitle: string;
  icon: string;
  maxProgress: number;
  isSecret?: boolean;
  evaluate: (state: AchievementEvaluationState) => {
    isUnlocked: boolean;
    currentProgress: number;
  };
}

// Вспомогательная функция подсчета уникальных активных дней (без штрафа за пропуски)
export function countUniqueActiveDays(timeLogs: TimeLog[], completedQuests: Quest[]): number {
  const uniqueDays = new Set<string>();

  for (const log of timeLogs) {
    const d = new Date(log.timestamp);
    uniqueDays.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
  }

  for (const q of completedQuests) {
    if (q.completedAt) {
      const d = new Date(q.completedAt);
      uniqueDays.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    }
  }

  return uniqueDays.size;
}

// Вспомогательная функция проверки ночной сессии (между 00:00 и 05:00)
export function hasNightVigilSession(timeLogs: TimeLog[], completedQuests: Quest[]): boolean {
  const isNightHour = (ts: number) => {
    const h = new Date(ts).getHours();
    return h >= 0 && h < 5;
  };

  return (
    timeLogs.some((l) => isNightHour(l.timestamp)) ||
    completedQuests.some((q) => q.completedAt != null && isNightHour(q.completedAt))
  );
}

// Каталог стартовых греческих достижений
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // 1. Дары Кроноса (Gifts of Cronus)
  {
    code: 'CRONUS_10H',
    title: 'Спартанский щит',
    titleEn: 'Spartan Shield',
    description: '10 часов осознанной практики в жизни',
    category: 'cronus',
    categoryTitle: 'Дары Кроноса',
    icon: '🛡️',
    maxProgress: 10,
    evaluate: (s) => ({
      isUnlocked: s.totalHours >= 10,
      currentProgress: Math.min(10, Math.round(s.totalHours * 10) / 10),
    }),
  },
  {
    code: 'CRONUS_50H',
    title: 'Копье Ахилла',
    titleEn: 'Spear of Achilles',
    description: '50 часов преданности пути героя',
    category: 'cronus',
    categoryTitle: 'Дары Кроноса',
    icon: '🗡️',
    maxProgress: 50,
    evaluate: (s) => ({
      isUnlocked: s.totalHours >= 50,
      currentProgress: Math.min(50, Math.round(s.totalHours * 10) / 10),
    }),
  },
  {
    code: 'CRONUS_100H',
    title: 'Лавровый венок Олимпа',
    titleEn: 'Laurel Wreath of Olympus',
    description: '100 часов несгораемого опыта',
    category: 'cronus',
    categoryTitle: 'Дары Кроноса',
    icon: '🌿',
    maxProgress: 100,
    evaluate: (s) => ({
      isUnlocked: s.totalHours >= 100,
      currentProgress: Math.min(100, Math.round(s.totalHours * 10) / 10),
    }),
  },
  {
    code: 'CRONUS_350H',
    title: 'Молния Зевса',
    titleEn: "Zeus's Thunderbolt",
    description: '350 часов практики — достижение божественного пантеона',
    category: 'cronus',
    categoryTitle: 'Дары Кроноса',
    icon: '⚡',
    maxProgress: 350,
    evaluate: (s) => ({
      isUnlocked: s.totalHours >= 350,
      currentProgress: Math.min(350, Math.round(s.totalHours * 10) / 10),
    }),
  },

  // 2. Подвиги Геракла (Labors of Heracles)
  {
    code: 'HERACLES_1Q',
    title: 'Немейский лев',
    titleEn: 'Nemean Lion',
    description: 'Первый успешно завершенный подвиг (квест)',
    category: 'heracles',
    categoryTitle: 'Подвиги Геракла',
    icon: '🦁',
    maxProgress: 1,
    evaluate: (s) => ({
      isUnlocked: s.completedQuestsCount >= 1,
      currentProgress: Math.min(1, s.completedQuestsCount),
    }),
  },
  {
    code: 'HERACLES_10Q',
    title: 'Лернейская гидра',
    titleEn: 'Lernaean Hydra',
    description: '10 выполненных квестов',
    category: 'heracles',
    categoryTitle: 'Подвиги Геракла',
    icon: '🐍',
    maxProgress: 10,
    evaluate: (s) => ({
      isUnlocked: s.completedQuestsCount >= 10,
      currentProgress: Math.min(10, s.completedQuestsCount),
    }),
  },
  {
    code: 'HERACLES_50Q',
    title: 'Пояс Ипполиты',
    titleEn: 'Girdle of Hippolyta',
    description: '50 выполненных квестов',
    category: 'heracles',
    categoryTitle: 'Подвиги Геракла',
    icon: '🥋',
    maxProgress: 50,
    evaluate: (s) => ({
      isUnlocked: s.completedQuestsCount >= 50,
      currentProgress: Math.min(50, s.completedQuestsCount),
    }),
  },
  {
    code: 'HERACLES_100Q',
    title: 'Золотые яблоки Гесперид',
    titleEn: 'Golden Apples of Hesperides',
    description: '100 выполненных квестов',
    category: 'heracles',
    categoryTitle: 'Подвиги Геракла',
    icon: '🍏',
    maxProgress: 100,
    evaluate: (s) => ({
      isUnlocked: s.completedQuestsCount >= 100,
      currentProgress: Math.min(100, s.completedQuestsCount),
    }),
  },

  // 3. Нить Ариадны (Ariadne's Thread)
  {
    code: 'ARIADNE_3D',
    title: 'Нить Ариадны: 3 дня',
    titleEn: "Ariadne's Thread: 3 Days",
    description: '3 активных дня практики (пропуски не сжигают прогресс)',
    category: 'ariadne',
    categoryTitle: 'Нить Ариадны',
    icon: '🧵',
    maxProgress: 3,
    evaluate: (s) => {
      const days = countUniqueActiveDays(s.timeLogs, s.completedQuests);
      return {
        isUnlocked: days >= 3,
        currentProgress: Math.min(3, days),
      };
    },
  },
  {
    code: 'ARIADNE_7D',
    title: 'Нить Ариадны: 7 дней',
    titleEn: "Ariadne's Thread: 7 Days",
    description: '7 активных дней практики',
    category: 'ariadne',
    categoryTitle: 'Нить Ариадны',
    icon: '🧵',
    maxProgress: 7,
    evaluate: (s) => {
      const days = countUniqueActiveDays(s.timeLogs, s.completedQuests);
      return {
        isUnlocked: days >= 7,
        currentProgress: Math.min(7, days),
      };
    },
  },
  {
    code: 'ARIADNE_30D',
    title: 'Нить Ариадны: 30 дней',
    titleEn: "Ariadne's Thread: 30 Days",
    description: '30 активных дней практики в Храме Жизни',
    category: 'ariadne',
    categoryTitle: 'Нить Ариадны',
    icon: '🧵',
    maxProgress: 30,
    evaluate: (s) => {
      const days = countUniqueActiveDays(s.timeLogs, s.completedQuests);
      return {
        isUnlocked: days >= 30,
        currentProgress: Math.min(30, days),
      };
    },
  },

  // 4. Семь Муз (The Seven Muses)
  {
    code: 'MUSES_3_LVL5',
    title: 'Гармония Муз',
    titleEn: 'Harmony of the Muses',
    description: '3 разных занятия развиты до 5 уровня и выше',
    category: 'muses',
    categoryTitle: 'Семь Муз',
    icon: '🎭',
    maxProgress: 3,
    evaluate: (s) => {
      const count = s.activities.filter((a) => a.level >= 5).length;
      return {
        isUnlocked: count >= 3,
        currentProgress: Math.min(3, count),
      };
    },
  },

  // 5. Тайные достижения (Secret Achievements)
  {
    code: 'SECRET_NIGHT_OWL',
    title: 'Ночная Сова Афины',
    titleEn: "Athena's Owl Night Vigil",
    description: 'Глубокая концентрация под покровом ночи (сессия между 00:00 и 05:00)',
    category: 'secret',
    categoryTitle: 'Тайны Олимпа',
    icon: '🦉',
    maxProgress: 1,
    isSecret: true,
    evaluate: (s) => {
      const isNight = hasNightVigilSession(s.timeLogs, s.completedQuests);
      return {
        isUnlocked: isNight,
        currentProgress: isNight ? 1 : 0,
      };
    },
  },
];

export interface EvaluatedAchievement {
  code: string;
  isUnlocked: boolean;
  unlockedAt: number | null;
  currentProgress: number;
  maxProgress: number;
}

export interface AchievementEvaluationResult {
  evaluations: EvaluatedAchievement[];
  newlyUnlockedCodes: string[];
}

export function evaluateAchievementState(
  state: AchievementEvaluationState,
  existingMap: Record<string, Achievement>
): AchievementEvaluationResult {
  const evaluations: EvaluatedAchievement[] = [];
  const newlyUnlockedCodes: string[] = [];
  const now = Date.now();

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    const existing = existingMap[def.code];
    const { isUnlocked: predicateUnlocked, currentProgress } = def.evaluate(state);

    // Несгораемость: если уже было разблокировано ранее, статус сохраняется навсегда
    const isAlreadyUnlocked = existing?.unlockedAt != null;
    const isUnlocked = isAlreadyUnlocked || predicateUnlocked;

    let unlockedAt: number | null = null;
    if (isAlreadyUnlocked) {
      unlockedAt = existing.unlockedAt;
    } else if (predicateUnlocked) {
      unlockedAt = now;
      newlyUnlockedCodes.push(def.code);
    }

    // Прогресс никогда не деградирует
    const progress = Math.max(
      existing?.progress ?? 0,
      isUnlocked ? def.maxProgress : currentProgress
    );

    evaluations.push({
      code: def.code,
      isUnlocked,
      unlockedAt,
      currentProgress: progress,
      maxProgress: def.maxProgress,
    });
  }

  return {
    evaluations,
    newlyUnlockedCodes,
  };
}
