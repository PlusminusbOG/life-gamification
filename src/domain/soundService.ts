/**
 * Сервис синтезированных звуковых эффектов на чистом Web Audio API
 * Работает 100% офлайн без внешних mp3/wav файлов, без задержек и трафика
 * Источник: Ticket 08
 */

const SOUND_STORAGE_KEY = 'life_gamification_sound_enabled';

let inMemorySoundEnabled = true;
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Проверяет, включен ли звук пользователем
 */
export function isSoundEnabled(): boolean {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const stored = localStorage.getItem(SOUND_STORAGE_KEY);
      if (stored !== null) {
        return stored !== 'false';
      }
    }
  } catch {
    // Безопасный fallback при блокировке хранилища
  }
  return inMemorySoundEnabled;
}

/**
 * Переключает и сохраняет состояние звука
 */
export function setSoundEnabled(enabled: boolean): void {
  inMemorySoundEnabled = enabled;
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
    }
  } catch {
    // Безопасный fallback
  }
}

/**
 * Воспроизводит тональный звук с экспоненциальным затуханием
 */
function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  peakGain = 0.2
): void {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {
    // Безопасный перехват в случае ограничений браузера
  }
}

/**
 * Победный звук завершения квеста (восходящее арпеджио C5 -> E5 -> G5 -> C6)
 */
export function playQuestCompleteSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const noteDuration = 0.12;

  notes.forEach((freq, idx) => {
    playTone(ctx, freq, now + idx * 0.08, noteDuration, 'triangle', 0.2);
  });
}

/**
 * Торжественная греческая фанфара при получении нового уровня героя
 */
export function playLevelUpSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Фанфара: D5, F#5, A5, D6 с аккордом
  const intro = [587.33, 739.99, 880.0];
  intro.forEach((freq, idx) => {
    playTone(ctx, freq, now + idx * 0.1, 0.18, 'triangle', 0.25);
  });

  // Финальный триумфальный мажорный аккорд
  const chordTime = now + 0.35;
  const chordNotes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
  chordNotes.forEach((freq) => {
    playTone(ctx, freq, chordTime, 0.6, 'sine', 0.15);
  });
}

/**
 * Небесный колокольный перезвон при открытии регалии Олимпа
 */
export function playAchievementSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playTone(ctx, 880, now, 0.3, 'sine', 0.2);
  playTone(ctx, 1318.51, now + 0.1, 0.5, 'sine', 0.25);
  playTone(ctx, 1760, now + 0.2, 0.8, 'triangle', 0.15);
}
