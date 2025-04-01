import { Buffer } from "buffer";
import { ApiService } from "./ApiService";
import JSZip from "jszip";

export async function exportAllHandler(requestBody: any): Promise<Response> {
  const { email, password, panel_id = 3293 } = requestBody;

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Необходимо указать email и password' }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const apiService = new ApiService();

    const tokens = await apiService.login(email, password);
    const uuid = await apiService.getUuid(tokens.access_token);
    const initTokens = await apiService.getInitTokens(uuid, tokens.access_token);

    const files: Buffer[] = await apiService.exportAllTables(initTokens, panel_id);

    const zip = new JSZip();

    files.forEach((fileBuffer, index) => {
      zip.file(`export_${index + 2}.xlsm`, fileBuffer, { binary: true });
    });

    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    const safeEmail = email.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const archiveName = `${safeEmail}_export.zip`;

    return new Response(zipContent, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${archiveName}"`
      }
    });

  } catch (error: any) {
    // Добавьте вывод ошибки в консоль для анализа
    console.error('Ошибка в exportAllHandler:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
