/**
 * Доменный модуль расчета тепловой карты продуктивности (Activity Heatmap)
 * Источник: Ticket 07, GLOSSARY.md
 */

import type { TimeLog, Activity } from './types';

export interface HeatmapDayData {
  dateKey: string; // YYYY-MM-DD
  date: Date;
  totalMinutes: number;
  level: 0 | 1 | 2 | 3 | 4;
  activityMinutes: Record<string, number>; // activityId -> minutes
  logsCount: number;
}

export interface HeatmapStats {
  totalActiveDays: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

export interface HeatmapWeek {
  weekIndex: number;
  days: Array<HeatmapDayData | null>; // 7 элементов: Пн (0) .. Вс (6)
  monthLabel?: string;
}

export interface CalculateHeatmapParams {
  timeLogs: TimeLog[];
  activities?: Activity[];
  filterActivityId?: string;
  endDate?: Date;
  numWeeks?: number; // По умолчанию 26 или 52
}

export interface CalculateHeatmapResult {
  grid: HeatmapWeek[];
  stats: HeatmapStats;
  dayMap: Map<string, HeatmapDayData>;
}

/**
 * Форматирует дату в строковый ключ YYYY-MM-DD с ведущими нулями
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Градация интенсивности (0..4) на основе затраченного времени:
 * 0: 0 мин (пусто)
 * 1: 1 - 30 мин
 * 2: 31 - 60 мин
 * 3: 61 - 120 мин
 * 4: > 120 мин (глубокая сессия)
 */
export function getHeatmapIntensity(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes <= 0) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  if (minutes <= 120) return 3;
  return 4;
}

/**
 * Вычисляет серии активных дней (текущую и максимальную) без штрафов за пропуски
 */
export function calculateStreaks(
  activeDays: Set<string>,
  anchorDate: Date = new Date()
): { currentStreak: number; longestStreak: number } {
  if (activeDays.size === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = Array.from(activeDays).sort();

  let longestStreak = 0;
  let currentStreakRun = 0;
  let prevTime: number | null = null;

  for (const dateStr of sortedDates) {
    const parts = dateStr.split('-').map(Number);
    const time = new Date(parts[0], parts[1] - 1, parts[2]).getTime();

    if (prevTime === null) {
      currentStreakRun = 1;
    } else {
      const diffDays = Math.round((time - prevTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreakRun += 1;
      } else if (diffDays > 1) {
        currentStreakRun = 1;
      }
    }

    if (currentStreakRun > longestStreak) {
      longestStreak = currentStreakRun;
    }

    prevTime = time;
  }

  // Расчет текущей серии от якорной даты (сегодня или вчера)
  const todayKey = formatDateKey(anchorDate);
  const yesterday = new Date(anchorDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  let currentStreak = 0;
  let checkDate = new Date(anchorDate);

  // Если сегодня активности не было, проверяем со вчерашнего дня
  if (!activeDays.has(todayKey) && activeDays.has(yesterdayKey)) {
    checkDate = yesterday;
  }

  while (activeDays.has(formatDateKey(checkDate))) {
    currentStreak += 1;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    currentStreak,
    longestStreak,
  };
}

const MONTH_NAMES = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек',
];

/**
 * Формирует сетку недель и агрегированную статистику для тепловой карты
 */
export function calculateHeatmapData(params: CalculateHeatmapParams): CalculateHeatmapResult {
  const {
    timeLogs,
    filterActivityId,
    endDate = new Date(),
    numWeeks = 32, // Оптимально для десктопа и планшета
  } = params;

  const dayMap = new Map<string, HeatmapDayData>();
  let totalMinutes = 0;

  // 1. Агрегация логов по дням
  for (const log of timeLogs) {
    if (filterActivityId && log.activityId !== filterActivityId) {
      continue;
    }

    const d = new Date(log.timestamp);
    const key = formatDateKey(d);

    let entry = dayMap.get(key);
    if (!entry) {
      entry = {
        dateKey: key,
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        totalMinutes: 0,
        level: 0,
        activityMinutes: {},
        logsCount: 0,
      };
      dayMap.set(key, entry);
    }

    entry.totalMinutes += log.durationMinutes;
    entry.logsCount += 1;
    entry.activityMinutes[log.activityId] =
      (entry.activityMinutes[log.activityId] ?? 0) + log.durationMinutes;
    entry.level = getHeatmapIntensity(entry.totalMinutes);

    totalMinutes += log.durationMinutes;
  }

  // 2. Определение активных дней и серий
  const activeDaysSet = new Set<string>();
  for (const [key, entry] of dayMap.entries()) {
    if (entry.totalMinutes > 0) {
      activeDaysSet.add(key);
    }
  }

  const streaks = calculateStreaks(activeDaysSet, endDate);

  // 3. Построение календарной сетки из numWeeks недель
  // Выравниваем конечную дату на конец недели (Воскресенье)
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const endDayOfWeek = (end.getDay() + 6) % 7; // 0 = Пн, 6 = Вс
  const endOfWeek = new Date(end);
  endOfWeek.setDate(end.getDate() + (6 - endDayOfWeek));

  const totalDays = numWeeks * 7;
  const startDate = new Date(endOfWeek);
  startDate.setDate(endOfWeek.getDate() - totalDays + 1);

  const grid: HeatmapWeek[] = [];
  let currentWeek: Array<HeatmapDayData | null> = [];
  let lastMonthLabel: string | undefined = undefined;

  for (let i = 0; i < totalDays; i++) {
    const currentDay = new Date(startDate);
    currentDay.setDate(startDate.getDate() + i);

    const key = formatDateKey(currentDay);
    const dayData = dayMap.get(key) ?? {
      dateKey: key,
      date: currentDay,
      totalMinutes: 0,
      level: 0,
      activityMinutes: {},
      logsCount: 0,
    };

    currentWeek.push(dayData);

    // Когда неделя заполнилась (7 дней)
    if (currentWeek.length === 7) {
      const firstDayOfWeek = currentWeek[0]!.date;
      const month = MONTH_NAMES[firstDayOfWeek.getMonth()];

      // Ставим метку месяца только если неделя начинает новый месяц
      let monthLabel: string | undefined = undefined;
      if (month !== lastMonthLabel) {
        monthLabel = month;
        lastMonthLabel = month;
      }

      grid.push({
        weekIndex: grid.length,
        days: currentWeek,
        monthLabel,
      });

      currentWeek = [];
    }
  }

  return {
    grid,
    stats: {
      totalActiveDays: activeDaysSet.size,
      totalMinutes,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
    },
    dayMap,
  };
}
