import { Buffer } from "buffer";
import JSZip from "jszip";
import { ApiService } from "./ApiService";

export async function exportAllHandler(requestBody: {
  email: string;
  password: string;
  panel_id?: number;
}): Promise<{ zipContent: Buffer; filename: string }> {
  const { email, password, panel_id = 3293 } = requestBody;

  if (!email || !password) {
    throw new Error("Необходимо указать email и password");
  }

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

  const safeEmail = email.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `${safeEmail}_export.zip`;

  return { zipContent, filename };
}
