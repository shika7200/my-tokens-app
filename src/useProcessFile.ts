import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { processFile, ProcessFileCallbacks } from './processFile';

/**
 * Хук для обработки Excel-файла.
 *
 * Управляет состояниями загрузки, прогрессом и ошибками, а также предоставляет обработчики событий
 * для выбора файла через input и drag-and-drop.
 *
 * @returns {object} Объект со следующими свойствами:
 *   - {@link isProcessing} {boolean} - Флаг, указывающий, идёт ли обработка файла.
 *   - {@link processedCount} {number} - Количество обработанных строк.
 *   - {@link totalCount} {number} - Общее количество строк для обработки.
 *   - {@link errorEmails} {string[]} - Массив email-адресов, для которых произошли ошибки.
 *   - {@link fileInputRef} {React.RefObject<HTMLInputElement>} - Ref для input-элемента выбора файла.
 *   - {@link handleFileSelect} {(e: ChangeEvent<HTMLInputElement>) => Promise<void>} - Обработчик события выбора файла.
 *   - {@link handleDrop} {(e: DragEvent<HTMLDivElement>) => Promise<void>} - Обработчик события перетаскивания файла.
 */
export function useProcessFile() {
  /**
   * Флаг, указывающий, идёт ли обработка файла.
   * @type {boolean}
   */
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Количество строк, которые уже обработаны.
   * @type {number}
   */
  const [processedCount, setProcessedCount] = useState(0);
  
  /**
   * Общее количество строк в загруженном файле.
   * @type {number}
   */
  const [totalCount, setTotalCount] = useState(0);
  
  /**
   * Массив email-адресов, для которых произошли ошибки во время обработки.
   * @type {string[]}
   */
  const [errorEmails, setErrorEmails] = useState<string[]>([]);
  
  /**
   * Ссылка на input-элемент выбора файла.
   * @type {React.RefObject<HTMLInputElement>}
   */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Обработчик события выбора файла через input.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Событие изменения input.
   * @returns {Promise<void>}
   */
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcess(file);
    }
  };

  /**
   * Обработчик события перетаскивания файла (drag-and-drop).
   *
   * @param {DragEvent<HTMLDivElement>} e - Событие drop.
   * @returns {Promise<void>}
   */
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        alert('Пожалуйста, выберите файл в формате .xlsx');
      } else {
        await handleProcess(file);
      }
      e.dataTransfer.clearData();
    }
  };

  /**
   * Обрабатывает выбранный файл: сбрасывает состояния, вызывает processFile с нужными колбэками.
   *
   * @param {File} file - Файл в формате Excel.
   * @returns {Promise<void>}
   */
  const handleProcess = async (file: File) => {
    setIsProcessing(true);
    setProcessedCount(0);
    setErrorEmails([]);
    try {
      const callbacks: ProcessFileCallbacks = {
        onSetTotal: setTotalCount,
        onProgress: (processed) => setProcessedCount(processed),
        onError: (email) => setErrorEmails((prev) => [...prev, email])
      };
      await processFile(file, callbacks);
    } catch (e: any) {
      console.error("Ошибка при обработке файла:", e);
      alert("Произошла ошибка при обработке файла. Проверьте консоль для деталей.");
    } finally {
      setIsProcessing(false);
    }
  };

  return { 
    isProcessing,       // Флаг обработки
    processedCount,     // Количество обработанных строк
    totalCount,         // Общее количество строк
    errorEmails,        // Список email с ошибками
    fileInputRef,       // Ref на input выбора файла
    handleFileSelect,   // Обработчик выбора файла
    handleDrop          // Обработчик drag-and-drop
  };
}
