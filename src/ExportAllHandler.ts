import { Buffer } from "buffer";
import JSZip from "jszip";
import { ApiService } from "./ApiService";
import { ExcelService } from "./ExcelService";

export async function exportAllHandler(
  requestBody: {
    email: string;
    password: string;
    panel_id?: number;
  }[]
): Promise<{ zipContent: Buffer; filename: string }> {
  if (!Array.isArray(requestBody) || requestBody.length === 0) {
    throw new Error("Должен быть передан массив с данными");
  }

  const mainZip = new JSZip();
  const apiService = new ApiService();
  const excelService = new ExcelService();

  // Для каждого объекта выполняем логику экспорта
  await Promise.all(
    requestBody.map(async (credentials) => {
      const { email, password } = credentials;

      if (!email || !password) {
        console.error("Пропуск учетной записи - отсутствует email или password");
        return; // Пропускаем эту учетку
      }

      try {
        // Выполнение логики для каждого пользователя
        const tokens = await apiService.login(email, password);
        const uuid = await apiService.getUuid(tokens.access_token);
        const initTokens = await apiService.getInitTokens(uuid, tokens.access_token);
     

        // Создаём отдельный архив для текущего пользователя
        const userZip = new JSZip();
       

        // Создаём дополнительный xlsx-отчёт с init токенами
        const reportBuffer: Buffer = excelService.createInitTokensReport(email, initTokens);
        userZip.file(`init_tokens_report.xlsx`, reportBuffer, { binary: true });

        const userZipContent = await userZip.generateAsync({ type: "nodebuffer" });
        const safeEmail = email.replace(/[^a-z0-9]/gi, "_").toLowerCase();

        // Добавляем полученный архив в главный архив с именем, основанным на email
        mainZip.file(`${safeEmail}_export.zip`, userZipContent, { binary: true });
      } catch (error) {
        console.error(`Ошибка обработки учетной записи ${email}:`, error);
        // Пропускаем эту учетку, продолжая обработку остальных
        return;
      }
    })
  );

  const zipContent = await mainZip.generateAsync({ type: "nodebuffer" });
  const filename = "exports.zip";

  return { zipContent, filename };
}
