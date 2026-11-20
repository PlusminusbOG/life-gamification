/**
 * Доменный модуль резервного копирования и суверенитета данных (JSON Backup & Restore)
 * Источник: Ticket 06, decisions/02-dexie-schema-and-export.md, GLOSSARY.md
 */

import { exportDB, importInto, peakImportFile } from 'dexie-export-import';
import type { LifeGamificationDB } from './db';

export interface BackupMetadata {
  databaseName: string;
  totalRows: number;
  tableCounts: Record<string, number>;
  schemaVersion?: number;
}

export interface ImportBackupOptions {
  mode: 'replace' | 'merge';
  onProgress?: (completedRows: number, totalRows: number) => void;
}

export interface ImportResult {
  databaseName: string;
  totalImportedRows: number;
  mode: 'replace' | 'merge';
}

/**
 * Генерирует стандартное имя файла для JSON-бэкапа
 */
export function generateBackupFilename(timestamp?: number): string {
  const ts = timestamp ?? Date.now();
  return `life-gamification-backup-${ts}.json`;
}

/**
 * Экспортирует полную базу данных Dexie в переносимый JSON Blob
 */
export async function exportDatabaseBackup(
  db: LifeGamificationDB,
  options: { prettyJson?: boolean } = { prettyJson: true }
): Promise<Blob> {
  return await exportDB(db, {
    prettyJson: options.prettyJson,
    numRowsPerChunk: 500,
  });
}

/**
 * Проверяет валидность файла резервной копии без изменения базы данных
 */
export async function validateBackupBlob(backupBlob: Blob): Promise<BackupMetadata> {
  try {
    const importMeta = await peakImportFile(backupBlob);
    if (!importMeta?.data?.tables) {
      throw new Error('Отсутствуют метаданные таблиц базы данных');
    }

    const tableCounts: Record<string, number> = {};
    let totalRows = 0;

    for (const table of importMeta.data.tables) {
      tableCounts[table.name] = table.rowCount;
      totalRows += table.rowCount;
    }

    return {
      databaseName: importMeta.data.databaseName,
      totalRows,
      tableCounts,
      schemaVersion: importMeta.data.databaseVersion,
    };
  } catch (error) {
    throw new Error(
      `Некорректный формат файла резервной копии: ${
        error instanceof Error ? error.message : 'Файл поврежден или не является валидным JSON'
      }`
    );
  }
}

/**
 * Импортирует резервную копию базы данных с выбранной стратегией разрешения конфликтов
 */
export async function importDatabaseBackup(
  db: LifeGamificationDB,
  backupBlob: Blob,
  options: ImportBackupOptions
): Promise<ImportResult> {
  // 1. Проверяем валидность файла
  const metadata = await validateBackupBlob(backupBlob);

  try {
    // 2. Выполняем импорт
    await importInto(db, backupBlob, {
      clearTablesBeforeImport: options.mode === 'replace',
      overwriteValues: true, // В режиме replace перезаписывает, в режиме merge обновляет совпадения
      acceptMissingTables: true,
      acceptVersionDiff: true,
      acceptNameDiff: true,
      progressCallback: (progress) => {
        if (options.onProgress && progress.totalRows) {
          options.onProgress(progress.completedRows, progress.totalRows);
        }
        return true;
      },
    });

    return {
      databaseName: metadata.databaseName,
      totalImportedRows: metadata.totalRows,
      mode: options.mode,
    };
  } catch (error) {
    throw new Error(
      `Ошибка при восстановлении базы данных: ${
        error instanceof Error ? error.message : 'Неизвестная ошибка IndexedDB'
      }`
    );
  }
}

/**
 * Инициирует скачивание резервной копии в браузере
 */
export function downloadBackupBlob(blob: Blob, filename?: string): void {
  const name = filename || generateBackupFilename();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
