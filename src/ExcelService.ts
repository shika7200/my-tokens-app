import * as XLSX from 'xlsx';

/**
 * Сервис для работы с Excel-файлами.
 */
export class ExcelService {
  /**
   * Парсит входной Excel-файл и возвращает массив строк.
   *
   * @param file - Файл в формате Excel.
   * @returns Массив объектов, где каждый объект представляет строку таблицы.
   */
  async parseFile(file: File): Promise<any[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    return rows;
  }

  /**
   * Формирует результирующую таблицу и сохраняет её в новый Excel-файл.
   *
   * @param resultsData - Двумерный массив с результатами, где первая строка содержит заголовки.
   */
  writeResults(resultsData: any[][]) {
    const headerRow = ["Email", "Access Token", "Refresh Token", "UUID"];
    for (let j = 1; j <= 20; j++) {
      headerRow.push(`Init Token ${j}`);
    }
    const outputData = [headerRow, ...resultsData];
    const outSheet = XLSX.utils.aoa_to_sheet(outputData);
    const outBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outBook, outSheet, "Results");
    const dateStr = new Date().toISOString().slice(0, 10); // Формат ГГГГ-ММ-ДД
    const outputFileName = `Результаты_${dateStr}.xlsx`;
    XLSX.writeFile(outBook, outputFileName);
  }
}
