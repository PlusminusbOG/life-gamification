import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { db } from '../domain/db';
import {
  exportDatabaseBackup,
  importDatabaseBackup,
  validateBackupBlob,
  downloadBackupBlob,
  generateBackupFilename,
  type BackupMetadata,
} from '../domain/backupService';

export interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Состояние экспорта
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Состояние импорта
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<BackupMetadata | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setExportSuccessMessage(null);
      setImportSuccessMessage(null);
      setSelectedFile(null);
      setFileMetadata(null);
      setImportMode('replace');
    }
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Экспорт базы
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setErrorMessage(null);
      setExportSuccessMessage(null);

      const blob = await exportDatabaseBackup(db);
      const filename = generateBackupFilename();
      downloadBackupBlob(blob, filename);

      setExportSuccessMessage(`Резервная копия успешно создана и сохранена (${filename})!`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ошибка при экспорте резервной копии');
    } finally {
      setIsExporting(false);
    }
  };

  // Выбор файла для импорта
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      setImportSuccessMessage(null);
      setSelectedFile(file);

      // Валидация структуры файла
      const metadata = await validateBackupBlob(file);
      setFileMetadata(metadata);
    } catch (err) {
      setSelectedFile(null);
      setFileMetadata(null);
      setErrorMessage(err instanceof Error ? err.message : 'Некорректный файл резервной копии');
    }
  };

  // Выполнение импорта
  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setIsImporting(true);
      setErrorMessage(null);

      const result = await importDatabaseBackup(db, selectedFile, {
        mode: importMode,
      });

      setImportSuccessMessage(
        `База данных успешно восстановлена! Восстановлено записей: ${result.totalImportedRows} (Режим: ${
          result.mode === 'replace' ? 'Полная замена' : 'Объединение'
        }).`
      );

      setSelectedFile(null);
      setFileMetadata(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onRestoreSuccess?.();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ошибка при восстановлении базы данных');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      data-testid="backup-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl shadow-inner">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                <span>Суверенитет данных и Резервная копия</span>
              </h2>
              <p className="text-xs text-slate-400">
                IndexedDB • Полный переносимый JSON-бекап • 100% владение данными
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело модального окна */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Сообщение об ошибке */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/80 text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Сообщение об успешном экспорте */}
          {exportSuccessMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/80 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{exportSuccessMessage}</span>
            </div>
          )}

          {/* Сообщение об успешном импорте */}
          {importSuccessMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/80 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{importSuccessMessage}</span>
            </div>
          )}

          {/* Блок 1: Экспорт резервной копии */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-400" />
                <span>Создание резервной копии (Экспорт)</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                .JSON
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Скачайте полный снимок вашей базы данных: все занятия, накопленные несгораемые часы, записи времени, квесты и открытые регалии Храма Олимпа.
            </p>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isExporting ? 'Создание бекапа...' : 'Скачать резервную копию (JSON)'}</span>
            </button>
          </div>

          {/* Блок 2: Импорт и восстановление */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Восстановление базы из файла (Импорт)</span>
              </h3>
              <span className="text-[10px] font-mono text-sky-400 font-bold px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20">
                Lossless Restore
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Восстановите состояние приложения из сохраненного ранее JSON-файла резервной копии.
            </p>

            {/* Выбор файла */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-upload"
              />
              <label
                htmlFor="backup-file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>{selectedFile ? selectedFile.name : 'Выбрать файл резервной копии (.json)'}</span>
              </label>
            </div>

            {/* Выбор режима разрешения конфликтов */}
            <div className="pt-2 border-t border-slate-800 space-y-2 mb-4">
              <div className="text-xs font-bold text-slate-300">
                Режим восстановления:
              </div>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5 accent-amber-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>Полное восстановление (Replace)</span>
                    <span className="text-[10px] text-amber-500 font-normal">[Рекомендуется]</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Полностью очищает текущую базу и разворачивает точную копию из файла. Идеально для переноса на новое устройство или полного отката.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="mt-0.5 accent-sky-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-sky-300">
                    Объединение записей (Merge)
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Объединяет записи из файла с текущими данными. Существующие уникальные занятия и логи не удаляются, а совпадающие обновляются.
                  </div>
                </div>
              </label>
            </div>

            {/* Предпросмотр метаданных файла и запуск */}
            {fileMetadata && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/30 mb-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Файл валиден:</span>
                  <span className="font-mono text-sky-300 font-bold">
                    Всего записей: {fileMetadata.totalRows}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {Object.entries(fileMetadata.tableCounts).map(([tableName, count]) => (
                    <span
                      key={tableName}
                      className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      {tableName}: <strong>{count}</strong>
                    </span>
                  ))}
                </div>

                {/* Кнопка запуска импорта */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isImporting}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 shadow-md shadow-sky-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
                    <span>{isImporting ? 'Восстановление базы...' : 'Восстановить базу данных'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Подвал */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Все операции происходят локально в вашем браузере</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
