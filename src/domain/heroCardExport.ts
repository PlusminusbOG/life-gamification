/**
 * Доменный модуль экспорта Карточки Героя и витрины регалий (Hero Card Showcase & Export)
 * Источник: Ticket 05, GLOSSARY.md
 */

import type {
  Activity,
  UserProfile,
  AchievementWithDetails,
  PantheonTierCode,
} from './types';
import { calculateLevel, getPantheonTier } from './progression';

export const MAX_PINNED_BADGES = 5;

export interface PinnedBadgeInfo {
  code: string;
  title: string;
  icon: string;
  categoryTitle: string;
}

export interface PrimaryActivitySummary {
  name: string;
  hours: number;
  level: number;
}

export interface HeroCardPayload {
  heroName: string;
  tier: string;
  tierCode: PantheonTierCode;
  title: string;
  level: number;
  totalMinutes: number;
  totalHours: number;
  totalHoursFormatted: string;
  primaryActivity: PrimaryActivitySummary | null;
  pinnedBadges: PinnedBadgeInfo[];
  unlockedCount: number;
  totalAchievementsCount: number;
  dateFormatted: string;
}

export interface HeroCardPayloadInput {
  profile?: UserProfile | null;
  activities: Activity[];
  achievements: AchievementWithDetails[];
  pinnedBadgeCodes?: string[];
}

/**
 * Определяет главное занятие героя (с наибольшим количеством накопленных минут > 0).
 * Возвращает null, если список пуст или во всех занятиях 0 минут.
 */
export function getPrimaryActivity(activities: Activity[]): Activity | null {
  if (!activities || activities.length === 0) {
    return null;
  }

  const activeWithTime = activities.filter((a) => (a.totalMinutes ?? 0) > 0);
  if (activeWithTime.length === 0) {
    return null;
  }

  // Сортировка по убыванию минут, затем по уровню
  const sorted = [...activeWithTime].sort((a, b) => {
    if (b.totalMinutes !== a.totalMinutes) {
      return b.totalMinutes - a.totalMinutes;
    }
    return (b.level ?? 1) - (a.level ?? 1);
  });

  return sorted[0];
}

export interface TogglePinnedResult {
  pinned: string[];
  error?: string;
}

/**
 * Чистая функция добавления/удаления регалии из витрины избранных (максимум 5).
 * Если регалия уже выбрана — снимает выбор.
 * Если регалия не выбрана и лимит достигнут — возвращает ошибку с текущим списком.
 */
export function togglePinnedBadge(
  currentPinned: string[],
  badgeCode: string,
  maxLimit = MAX_PINNED_BADGES
): TogglePinnedResult {
  const isAlreadyPinned = currentPinned.includes(badgeCode);

  if (isAlreadyPinned) {
    return {
      pinned: currentPinned.filter((c) => c !== badgeCode),
    };
  }

  if (currentPinned.length >= maxLimit) {
    return {
      pinned: currentPinned,
      error: `Максимум ${maxLimit} регалий на карточке Героя`,
    };
  }

  return {
    pinned: [...currentPinned, badgeCode],
  };
}

/**
 * Формирует валидированный и обогащенный payload для карточки героя
 */
export function buildHeroCardPayload(input: HeroCardPayloadInput): HeroCardPayload {
  const { profile, activities, achievements, pinnedBadgeCodes = [] } = input;

  const totalMinutes = profile?.totalMinutes ?? 0;
  const totalHours = profile?.totalHours ?? Math.round((totalMinutes / 60) * 10) / 10;
  const level = calculateLevel(totalMinutes);
  const tierInfo = getPantheonTier(level);

  const heroName = profile?.name?.trim() || 'Герой Эллады';
  const totalHoursFormatted = `${totalHours.toFixed(1)} ч`;

  // Главное направление
  const primary = getPrimaryActivity(activities);
  const primaryActivity: PrimaryActivitySummary | null = primary
    ? {
        name: primary.name,
        hours: Math.round(((primary.totalMinutes ?? 0) / 60) * 10) / 10,
        level: primary.level ?? 1,
      }
    : null;

  // Карта открытых достижений
  const unlockedAchievementsMap = new Map<string, AchievementWithDetails>();
  let unlockedCount = 0;
  for (const ach of achievements) {
    if (ach.unlockedAt != null) {
      unlockedAchievementsMap.set(ach.code, ach);
      unlockedCount++;
    }
  }

  // Фильтруем избранные регалии: только существующие и открытые, максимум MAX_PINNED_BADGES
  const pinnedBadges: PinnedBadgeInfo[] = [];
  for (const code of pinnedBadgeCodes) {
    const ach = unlockedAchievementsMap.get(code);
    if (ach) {
      pinnedBadges.push({
        code: ach.code,
        title: ach.title,
        icon: ach.icon,
        categoryTitle: ach.categoryTitle,
      });
      if (pinnedBadges.length >= MAX_PINNED_BADGES) {
        break;
      }
    }
  }

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    heroName,
    tier: tierInfo.tier,
    tierCode: tierInfo.tierCode,
    title: tierInfo.title,
    level,
    totalMinutes,
    totalHours,
    totalHoursFormatted,
    primaryActivity,
    pinnedBadges,
    unlockedCount,
    totalAchievementsCount: achievements.length,
    dateFormatted,
  };
}

/**
 * Генерирует имя файла для экспортируемой карточки
 */
export function generateHeroCardFilename(timestamp?: number): string {
  const ts = timestamp ?? Date.now();
  return `hero-card-${ts}.png`;
}

/**
 * Вспомогательная функция рисования скругленного прямоугольника на Canvas 2D
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Рендерит карточку героя высокого разрешения 1200x630 Retina на HTML5 Canvas
 */
export function renderHeroCardToCanvas(
  canvas: HTMLCanvasElement,
  payload: HeroCardPayload
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1200;
  const height = 630;

  canvas.width = width;
  canvas.height = height;

  // 1. Глубокий градиентный фон (Dark Obsidian & Slate)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#0c1322');
  bgGrad.addColorStop(1, '#05070d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Радиальное золотистое свечение по центру
  const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, 550);
  radialGlow.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. Внешняя золотая рамка в греческом стиле
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Внутренняя тонкая золотая линия
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Декоративные греческие уголки
  const drawCorner = (cx: number, cy: number, signX: number, signY: number) => {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + signY * 20);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + signX * 20, cy);
    ctx.stroke();
  };
  drawCorner(26, 26, 1, 1);
  drawCorner(width - 26, 26, -1, 1);
  drawCorner(26, height - 26, 1, -1);
  drawCorner(width - 26, height - 26, -1, -1);

  // 3. Шапка карточки (Header)
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('ХРАМ ДОСТИЖЕНИЙ ОЛИМПА • ГЕЙМИФИКАЦИЯ ЖИЗНИ', 48, 55);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Эра Эллады • ${payload.dateFormatted}`, width - 48, 55);
  ctx.textAlign = 'left';

  // Разделительная линия под шапкой
  const sepGrad = ctx.createLinearGradient(48, 68, width - 48, 68);
  sepGrad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
  sepGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
  sepGrad.addColorStop(1, 'rgba(245, 158, 11, 0.6)');
  ctx.strokeStyle = sepGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, 68);
  ctx.lineTo(width - 48, 68);
  ctx.stroke();

  // 4. Левый блок: Паспорт Героя (Hero Identity Box)
  const heroBoxX = 48;
  const heroBoxY = 88;
  const heroBoxW = 460;
  const heroBoxH = 345;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  drawRoundedRect(ctx, heroBoxX, heroBoxY, heroBoxW, heroBoxH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Аватар героя
  const avatarCenterX = heroBoxX + 85;
  const avatarCenterY = heroBoxY + 95;
  const avatarRadius = 48;

  // Кольцо аватара
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 4, 0, Math.PI * 2);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Фон аватара
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Эмодзи аватара
  const tierEmojis: Record<PantheonTierCode, string> = {
    god: '👑',
    olympian: '🏛️',
    titan: '⚡',
    demigod: '🗡️',
    hero: '⚔️',
    mortal: '🏺',
  };
  const avatarEmoji = tierEmojis[payload.tierCode] || '🛡️';

  ctx.font = '44px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(avatarEmoji, avatarCenterX, avatarCenterY);

  // Имя и титул героя
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Бейдж ступени пантеона
  const tierPillX = heroBoxX + 155;
  const tierPillY = heroBoxY + 52;
  ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
  drawRoundedRect(ctx, tierPillX, tierPillY - 18, 180, 26, 13);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(`• ${payload.tier.toUpperCase()} •`, tierPillX + 14, tierPillY);

  // Имя героя
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  const truncatedName = payload.heroName.length > 18 ? payload.heroName.slice(0, 18) + '…' : payload.heroName;
  ctx.fillText(truncatedName, tierPillX, heroBoxY + 95);

  // Мифологический титул
  ctx.fillStyle = '#fde68a';
  ctx.font = 'italic 16px system-ui, -apple-system, sans-serif';
  ctx.fillText(`«${payload.title}»`, tierPillX, heroBoxY + 124);

  // Уровень Героя (Золотой блок)
  const levelBoxY = heroBoxY + 165;
  ctx.fillStyle = 'rgba(217, 119, 6, 0.2)';
  drawRoundedRect(ctx, heroBoxX + 24, levelBoxY, heroBoxW - 48, 50, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = '900 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(`🛡️ УРОВЕНЬ ${payload.level}`, heroBoxX + 44, levelBoxY + 32);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Несгораемый ранг', heroBoxX + heroBoxW - 44, levelBoxY + 32);
  ctx.textAlign = 'left';

  // Детализация под уровнем
  const detailY = heroBoxY + 245;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Всего времени:', heroBoxX + 28, detailY);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.fillText(payload.totalHoursFormatted, heroBoxX + 160, detailY);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Регалий Олимпа:', heroBoxX + 28, detailY + 32);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${payload.unlockedCount} из ${payload.totalAchievementsCount}`, heroBoxX + 160, detailY + 32);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Клятва Эллады:', heroBoxX + 28, detailY + 64);
  ctx.fillStyle = '#34d399';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Часы вечны и не деградируют', heroBoxX + 160, detailY + 64);

  // 5. Правый блок: Статистика и Главное занятие
  const statsBoxX = 530;
  const statsBoxW = width - 48 - statsBoxX;

  // Верхняя правая плашка 1: Всего часов практики
  const pill1W = (statsBoxW - 16) / 2;
  const pillH = 150;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  drawRoundedRect(ctx, statsBoxX, heroBoxY, pill1W, pillH, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('ПОЖИЗНЕННЫЕ ЧАСЫ', statsBoxX + 22, heroBoxY + 32);

  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 38px system-ui, -apple-system, sans-serif';
  ctx.fillText(payload.totalHoursFormatted, statsBoxX + 22, heroBoxY + 84);

  ctx.fillStyle = '#34d399';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText('⏳ Накоплено навсегда', statsBoxX + 22, heroBoxY + 120);

  // Верхняя правая плашка 2: Регалии Храма
  const pill2X = statsBoxX + pill1W + 16;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  drawRoundedRect(ctx, pill2X, heroBoxY, pill1W, pillH, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('РЕГАЛИИ В ХРАМЕ', pill2X + 22, heroBoxY + 32);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 38px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${payload.unlockedCount} / ${payload.totalAchievementsCount}`, pill2X + 22, heroBoxY + 84);

  const percentAch = payload.totalAchievementsCount > 0
    ? Math.round((payload.unlockedCount / payload.totalAchievementsCount) * 100)
    : 0;
  ctx.fillStyle = '#a5f3fc';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText(`🏆 Открыто ${percentAch}% пантеона`, pill2X + 22, heroBoxY + 120);

  // Нижняя правая плашка: Главное направление (Primary Activity)
  const primY = heroBoxY + pillH + 16;
  const primH = 179;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  drawRoundedRect(ctx, statsBoxX, primY, statsBoxW, primH, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('⚡ ГЛАВНОЕ НАПРАВЛЕНИЕ ГЕРОЯ', statsBoxX + 24, primY + 34);

  if (payload.primaryActivity) {
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(payload.primaryActivity.name, statsBoxX + 24, primY + 76);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '15px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `Посвящено: ${payload.primaryActivity.hours} ч  •  Уровень занятия: ${payload.primaryActivity.level}`,
      statsBoxX + 24,
      primY + 112
    );

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Непрерывное восхождение к мастерству титанов', statsBoxX + 24, primY + 146);
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('Пока нет записей времени в занятиях', statsBoxX + 24, primY + 80);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillText('Создайте занятие и начните путь героя Эллады', statsBoxX + 24, primY + 115);
  }

  // 6. Нижний ряд: Витрина Избранных Регалий (Badge Showcase)
  const badgeSectionY = 455;
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
  ctx.fillText('ИЗБРАННЫЕ РЕГАЛИИ ХРАМА (ДО 5 ЗНАКОВ ДОБЛЕСТИ)', 48, badgeSectionY);

  const slotW = (width - 96 - (MAX_PINNED_BADGES - 1) * 14) / MAX_PINNED_BADGES;
  const slotH = 92;
  const slotY = badgeSectionY + 14;

  for (let i = 0; i < MAX_PINNED_BADGES; i++) {
    const slotX = 48 + i * (slotW + 14);
    const badge = payload.pinnedBadges[i];

    if (badge) {
      // Заполненный слот регалии
      ctx.fillStyle = 'rgba(30, 27, 22, 0.85)';
      drawRoundedRect(ctx, slotX, slotY, slotW, slotH, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Иконка достижения
      ctx.font = '32px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badge.icon, slotX + 36, slotY + slotH / 2);

      // Текст названия и категории
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      const cleanTitle = badge.title.length > 14 ? badge.title.slice(0, 13) + '…' : badge.title;
      ctx.fillText(cleanTitle, slotX + 66, slotY + 38);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      const cleanCat = badge.categoryTitle.length > 15 ? badge.categoryTitle.slice(0, 14) + '…' : badge.categoryTitle;
      ctx.fillText(cleanCat, slotX + 66, slotY + 60);
    } else {
      // Пустой слот
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      drawRoundedRect(ctx, slotX, slotY, slotW, slotH, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '22px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏛️', slotX + 32, slotY + slotH / 2);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('Свободная', slotX + 58, slotY + 42);
      ctx.fillText('регалия', slotX + 58, slotY + 58);
    }
  }

  // 7. Подвал (Footer)
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 11px system-ui, -apple-system, sans-serif';
  ctx.fillText('«Часы, посвященные пути, бессмертны и несгораемы»', 48, height - 38);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#475569';
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.fillText('Life Gamification • 1200x630 Retina OpenGraph Card', width - 48, height - 38);
  ctx.textAlign = 'left';
}

/**
 * Скачивает сгенерированное изображение с холста Canvas в виде PNG файла
 */
export async function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename?: string
): Promise<void> {
  const name = filename || generateHeroCardFilename();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Не удалось сгенерировать PNG-изображение'));
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}
