import axios from 'axios';
import { Buffer } from 'buffer';

/**
 * Сервис для работы с API Ficto.
 */
export class ApiService {
  /**
   * Выполняет авторизацию пользователя.
   */
  async login(email: string, password: string) {
    const loginData = {
      email,
      password,
      remember_me: false,
      browser: {
        name: "chrome",
        version: "134.0.0",
        versionNumber: 134,
        mobile: false,
        os: "Windows 10"
      }
    };
    const response = await axios.post('https://api.ficto.ru/client/auth/login', loginData);
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token
    };
  }

  /**
   * Получает UUID гранта пользователя.
   */
  async getUuid(access_token: string) {
    const response = await axios.get('https://api.ficto.ru/client/grants?avalible=true&page=1', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    let uuid = "";
    if (response.data && Array.isArray(response.data.items) && response.data.items.length > 0) {
      uuid = response.data.items[0].uuid;
    }
    if (!uuid) {
      throw new Error("UUID не найден");
    }
    return uuid;
  }

  /**
   * Получает 19 init_token для заданного UUID.
   */
  async getInitTokens(uuid: string, access_token: string) {
    const initTokens: string[] = [];
    for (let i = 2; i <= 20; i++) {
      const response = await axios.get(`https://api.ficto.ru/client/workspace/${uuid}/${i}`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const tokenValue = response.data?.item?.init_token;
      if (!tokenValue) {
        throw new Error(`Init token не найден для запроса ${i}`);
      }
      initTokens.push(tokenValue);
    }
    return initTokens;
  }

  /**
   * Экспортирует данные таблицы в формате XLSX для одного запроса.
   */
  async exportTable(panelId: number, token: string): Promise<Buffer> {
    const url = 'https://api.ficto.ru/client/layout/table/export';
    const data = {
      params: { panel_id: panelId },
      panel_id: panelId,
      token: token,
      separators: {}
    };

    const response = await axios.post(url, data, {
      headers: {
        'L-Token': token
      },
      responseType: 'arraybuffer'
    });

    const buffer: Buffer = Buffer.from(response.data);
    return buffer;
  }

/**
 * Экспортирует XLSX файлы для каждого init_token.
 * Для первого токена используется panel_id = 3293,
 * а для остальных вычисляется: panel_id = 3253 + (index * 2)
 * Например, первый токен – panel_id 3293, второй – 3255, третий – 3257 и т.д.
 *
 * @param tokens Массив init_token.
 * @returns Массив XLSX файлов в формате Buffer.
 */
async exportAllTables(tokens: string[]): Promise<Buffer[]> {
    const exportPromises = tokens.map((token, index) => {
      const panelId = index === 0 ? 3293 : (3253 + (index-1) * 2);
      return this.exportTable(panelId, token);
    });
    return await Promise.all(exportPromises);
  }
}
