import { ExcelService } from './ExcelService';

/**
 * Обрабатывает Excel-файл, собирает учетные данные и инициирует запрос на формирование архива архивов.
 *
 * @param file Файл в формате Excel.
 * @param callbacks Колбэки для обновления прогресса обработки.
 */
export async function processFile(
  file: File,
  callbacks: {
    onSetTotal: (total: number) => void;
    onProgress: (processed: number) => void;
    onError: (email: string) => void;
  }
): Promise<void> {
  const { onSetTotal, onProgress, onError } = callbacks;
  const excelService = new ExcelService();

  // Парсим файл и получаем строки
  const rows = await excelService.parseFile(file);
  onSetTotal(rows.length);
  console.log('Найдено строк:', rows.length);

  // Собираем массив учетных данных
  const credentials: { email: string; password: string }[] = [];
  let processed = 0;
  for (const row of rows) {
    const email: string =
      row["логин_ficto"] || row["Email"] || row["email"] || "";
    const password: string =
      row["пароль_ficto"] || row["Password"] || row["password"] || "";
    if (!email || !password) {
      console.warn(
        `Пропуск строки, отсутствуют данные: email="${email}" password="${password}"`
      );
      processed++;
      onProgress(processed);
      onError(email || "(неизвестный email)");
      continue;
    }
    credentials.push({ email, password });
    processed++;
    onProgress(processed);
  }

  // Отправляем массив учетных данных на API для формирования архива архивов
  try {
    const response = await fetch('http://localhost:3000/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.statusText}`);
    }

    // Извлекаем имя файла из заголовка
    const contentDisposition = response.headers.get('Content-Disposition');
    const match = contentDisposition?.match(/filename="?([^"]+)"?/);
    if (!match || !match[1]) {
      throw new Error('Сервер не прислал имя файла в заголовке Content-Disposition');
    }
    const filename = match[1];

    // Получаем бинарное содержимое архива
    const blob = await response.blob();

    // Создаём временную ссылку и инициируем скачивание
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    console.log("Архив успешно загружен");
  } catch (err: any) {
    console.error("Ошибка при экспорте архива:", err);
    alert(`Ошибка при экспорте архива: ${err.message}`);
    throw err;
  }
}
