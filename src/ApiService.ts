import axios, { AxiosRequestConfig,} from 'axios';
import { Buffer } from 'buffer';
import {

  DocumentResponse,
  SaveDataRequestGeneric,
  SaveDataResponse,

} from './apiService_types';

/**
 * Сервис для работы с API Ficto.
 */
export class ApiService {
  /**
   * Выполняет авторизацию пользователя.
   *
   * @param email - Электронная почта пользователя.
   * @param password - Пароль пользователя.
   * @returns Объект с access_token и refresh_token.
   */
  async login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
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
   *
   * @param access_token - Токен доступа.
   * @returns UUID гранта.
   * @throws Error, если UUID не найден.
   */
  async getUuid(access_token: string): Promise<string> {
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
   *
   * @param uuid - UUID гранта.
   * @param access_token - Токен доступа.
   * @returns Массив init_token.
   * @throws Error, если init_token не найден для одного из запросов.
   */
  async getInitTokens(uuid: string, access_token: string): Promise<string[]> {
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
   *
   * @param panelId - Идентификатор панели.
   * @param token - Токен авторизации.
   * @returns XLSX-файл в виде Buffer.
   */
  async exportTable(panelId: number, token: string): Promise<Buffer> {
    const url = 'https://api.ficto.ru/client/layout/table/export';
    const data = {
      params: { panel_id: panelId },
      panel_id: panelId,
      token,
      separators: {}
    };

    const response = await axios.post(url, data, {
      headers: { 'L-Token': token },
      responseType: 'arraybuffer'
    });
    return Buffer.from(response.data);
  }

  /**
   * Экспортирует XLSX файлы для каждого init_token.
   * Для первого токена используется panel_id = 3293,
   * а для остальных вычисляется: panel_id = 3253 + (index * 2)
   *
   * @param tokens Массив init_token.
   * @returns Массив XLSX файлов в формате Buffer.
   */
  async exportAllTables(tokens: string[]): Promise<Buffer[]> {
    const exportPromises = tokens.map((token, index) => {
      const panelId = index === 0 ? 3293 : (3253 + (index - 1) * 2);
      return this.exportTable(panelId, token);
    });
    return await Promise.all(exportPromises);
  }
  /**
   * Сохраняет данные таблицы для любой секции.
   *
   * @param token - init_token для авторизации.
   * @param data - Объект вида { panel_id: number, table: Array<{ row_id, type_id, columns }> }.
   */
// после упрощения
async saveData(
  token: string,
  data: SaveDataRequestGeneric
): Promise<SaveDataResponse> {
  const url = 'https://api.ficto.ru/client/layout/table/save-data'

  // Тема заголовков — копия из вашего Bun-скрипта
  const headers: Record<string,string> = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'ru-RU,ru;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'L-Token': token,
    'Host': 'api.ficto.ru',
    'Origin': 'https://client.ficto.ru',
    'Referer': 'https://client.ficto.ru/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/134.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Content-Length': String(Buffer.byteLength(JSON.stringify(data), 'utf8')),
  }

  // Логируем перед запросом
  console.log('--- saveData: Request Headers ---')
  console.dir(headers, { depth: null })
  console.log('--- saveData: Request Body ---')
  console.log(JSON.stringify(data, null, 2))

  const config: AxiosRequestConfig = {
    headers,
    transformRequest: [(body) => JSON.stringify(body)],
    decompress: false,
  }

  try {
    const resp = await axios.post<SaveDataResponse>(url, data, config)

    // Логируем ответ
    console.log('--- saveData: Response Status ---', resp.status)
    console.log('--- saveData: Response Body ---', resp.data)

    return resp.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error('--- saveData: Error Status ---', err.response?.status)
      console.error('--- saveData: Error Body ---', err.response?.data)
    } else {
      console.error('--- saveData: Unexpected Error ---', err)
    }
    throw err
  }
}


  /**
   * Проверяет статус документа и формирует документ (отмена блокировки).
   *
   * @param panelId - Идентификатор панели документа.
   * @param token - Токен авторизации (init_token).
   * @returns Объект с информацией о документе, включая build_id.
   */
  async getDocumentStatus(panelId: number, token: string): Promise<DocumentResponse> {
    const url = 'https://api.ficto.ru/client/layout/documents/299/status';
    const data = { params: { panel_id: panelId }, fixation_params: {} };
    const response = await axios.post(url, data, {
      headers: { 'L-Token': token }
    });
    return response.data;
  }

  /**
   * Отменяет блокировку документа.
   *
   * @param buildId - Идентификатор сборки документа.
   * @param panelId - Идентификатор панели документа.
   * @param token - Токен авторизации (init_token).
   * @returns Ответ сервера в формате JSON.
   */
  async cancelDocumentLock(buildId: number, panelId: number, token: string): Promise<{ status: boolean }> {
    const url = 'https://api.ficto.ru/client/layout/documents/299/cancel';
    const data = { params: { build_id: buildId, panel_id: panelId }, fixation_params: {} };
    const response = await axios.post(url, data, {
      headers: { 'L-Token': token }
    });
    return response.data;
  }





  
}
