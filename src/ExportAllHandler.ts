import { Buffer } from "buffer";
import JSZip from "jszip";
import { ApiService } from "./ApiService";

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

  // Для каждого объекта выполняем логику экспорта
  await Promise.all(
    requestBody.map(async (credentials) => {
      const { email, password, panel_id = 3293 } = credentials;

      if (!email || !password) {
        throw new Error("Необходимо указать email и password для всех элементов");
      }

      // Выполнение логики для каждого пользователя
      const tokens = await apiService.login(email, password);
      const uuid = await apiService.getUuid(tokens.access_token);
      const initTokens = await apiService.getInitTokens(uuid, tokens.access_token);
      const files: Buffer[] = await apiService.exportAllTables(initTokens, panel_id);

      // Создаём отдельный архив для текущего пользователя
      const userZip = new JSZip();
      files.forEach((fileBuffer, index) => {
        userZip.file(`export_${index + 1}.xlsm`, fileBuffer, { binary: true });
      });

      const userZipContent = await userZip.generateAsync({ type: "nodebuffer" });
      const safeEmail = email.replace(/[^a-z0-9]/gi, "_").toLowerCase();

      // Добавляем полученный архив в главный архив с именем, основанным на email
      mainZip.file(`${safeEmail}_export.zip`, userZipContent, { binary: true });
    })
  );

  const zipContent = await mainZip.generateAsync({ type: "nodebuffer" });
  const filename = "exports.zip";

  return { zipContent, filename };
}
