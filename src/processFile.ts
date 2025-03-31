import { ExcelService } from './ExcelService';
import { ApiService } from './ApiService';

/**
 * Интерфейс для передачи колбэков обновления прогресса.
 */
export interface ProcessFileCallbacks {
  /**
   * Устанавливает общее количество строк для обработки.
   * @param total - Общее количество строк.
   */
  onSetTotal: (total: number) => void;
  /**
   * Вызывается при обновлении количества обработанных строк.
   * @param processed - Текущее количество обработанных строк.
   */
  onProgress: (processed: number) => void;
  /**
   * Вызывается при возникновении ошибки для конкретного email.
   * @param email - Email, для которого произошла ошибка.
   */
  onError: (email: string) => void;
}

/**
 * Обрабатывает Excel-файл, выполняет запросы к API и сохраняет результаты.
 *
 * @param file - Файл в формате Excel.
 * @param callbacks - Колбэки для обновления прогресса.
 * @returns Promise, который разрешается после завершения обработки.
 */
export async function processFile(
  file: File,
  callbacks: ProcessFileCallbacks
): Promise<void> {
  const { onSetTotal, onProgress, onError } = callbacks;
  const excelService = new ExcelService();
  const apiService = new ApiService();

  const rows = await excelService.parseFile(file);
  onSetTotal(rows.length);
  console.log('Найдено строк:', rows.length);

  const resultsData: any[][] = [];
  let processed = 0;
  for (const row of rows) {
    const email: string = row["логин_ficto"] || row["Email"] || row["email"] || "";
    const password: string = row["пароль_ficto"] || row["Password"] || row["password"] || "";
    if (!email || !password) {
      console.warn(`Пропуск строки, отсутствуют данные: email="${email}" password="${password}"`);
      processed++;
      onProgress(processed);
      onError(email || "(неизвестный email)");
      continue;
    }
    console.log(`Обработка пользователя: ${email}`);
    try {
      const { access_token, refresh_token } = await apiService.login(email, password);
      console.log(`Получены токены для ${email}:`, { access_token, refresh_token });
      const uuid = await apiService.getUuid(access_token);
      console.log(`Получен uuid для ${email}:`, uuid);
      const initTokens = await apiService.getInitTokens(uuid, access_token);
      console.log(`Получены init_token для ${email}:`, initTokens);
      resultsData.push([email, access_token, refresh_token, uuid, ...initTokens]);
    } catch (userError: any) {
      console.error(`Ошибка при обработке пользователя ${email}:`, userError);
      onError(email);
    } finally {
      processed++;
      onProgress(processed);
    }
  }
  excelService.writeResults(resultsData);
  console.log("Результирующий файл успешно сохранён");
}
