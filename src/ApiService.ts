import axios from 'axios';
import { Buffer } from 'buffer';
import {
  SaveDataSection,
  SaveDataMapping,
  SaveDataResponse,
  DocumentResponse,
} from './apiService_types';

/**
 * Сервис для работы с API Ficto.
 */
export class ApiService {
  /**
   * Универсальный обработчик ошибок axios.
   * @param error — пойманная ошибка
   * @param context — описание контекста (например, "Ошибка авторизации")
   * @throws Error с подробным сообщением
   */
  private handleRequestError(error: any, context: string): never {
    let errorMsg = `${context}: `;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Подробная информация из ответа сервера
        errorMsg += `Статус ${error.response.status} – ${error.response.data?.message || JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // Ошибка при отправке запроса (нет ответа)
        errorMsg += 'Нет ответа от сервера';
      } else {
        // Другие ошибки
        errorMsg += error.message;
      }
    } else {
      errorMsg += 'Неизвестная ошибка';
    }
    throw new Error(errorMsg);
  }

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

    try {
      const response = await axios.post('https://api.ficto.ru/client/auth/login', loginData);
      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token
      };
    } catch (error) {
      this.handleRequestError(error, 'Ошибка авторизации');
    }
  }

  /**
   * Получает UUID гранта пользователя.
   *
   * @param access_token - Токен доступа.
   * @returns UUID гранта.
   * @throws Error, если UUID не найден или произошла ошибка запроса.
   */
  async getUuid(access_token: string): Promise<string> {
    try {
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
    } catch (error) {
      this.handleRequestError(error, 'Ошибка получения UUID');
    }
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

    try {
      for (let i = 2; i <= 20; i++) {
        const response = await axios.get(`https://api.ficto.ru/client/workspace/${uuid}/${i}`, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        const tokenValue = response.data?.item?.init_token;
        if (!tokenValue) {
          // Генерируем и выбрасываем ошибку с указанием номера запроса
          throw new Error(`Init token не найден для запроса ${i}`);
        }
        initTokens.push(tokenValue);
      }
      return initTokens;
    } catch (error) {
      this.handleRequestError(error, 'Ошибка получения init_tokens');
    }
  }

  // Аналогичным образом можно добавить обработку ошибок и в другие методы

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

    try {
      const response = await axios.post(url, data, {
        headers: { 'L-Token': token },
        responseType: 'arraybuffer'
      });
      return Buffer.from(response.data);
    } catch (error) {
      this.handleRequestError(error, `Ошибка экспорта таблицы (panelId: ${panelId})`);
    }
  }

  /**
   * Экспортирует XLSX файлы для каждого init_token.
   *
   * @param tokens Массив init_token.
   * @returns Массив XLSX файлов в формате Buffer.
   */
  async exportAllTables(tokens: string[]): Promise<Buffer[]> {
    try {
      const exportPromises = tokens.map((token, index) => {
        const panelId = index === 0 ? 3293 : (3253 + (index - 1) * 2);
        return this.exportTable(panelId, token);
      });
      return await Promise.all(exportPromises);
    } catch (error) {
      this.handleRequestError(error, 'Ошибка экспорта всех таблиц');
    }
  }

  /**
   * Сохраняет данные таблицы для заданного раздела.
   *
   * @param _section - Раздел для сохранения данных (используется только для типизации).
   * @param token - Токен авторизации (init_token).
   * @param data - Объект данных для сохранения, соответствующий выбранному разделу.
   * @returns Ответ сервера в формате JSON, например: { status: true }.
   */
  async saveData<K extends SaveDataSection>(
    _section: K,
    token: string,
    data: SaveDataMapping[K]
  ): Promise<SaveDataResponse> {
    const url = 'https://api.ficto.ru/client/layout/table/save-data';
    // Определяем тип элемента массива table
    type DataRow = typeof data.table[number];

    const payload = {
      params: { panel_id: data.panel_id },
      table: data.table.map((row: DataRow) => ({ ...row, panel_id: data.panel_id })),
      panel_id: data.panel_id
    };

    try {
      const response = await axios.post(url, payload, {
        headers: { 'L-Token': token }
      });
      return response.data;
    } catch (error) {
      this.handleRequestError(error, 'Ошибка сохранения данных');
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

    try {
      const response = await axios.post(url, data, {
        headers: { 'L-Token': token }
      });
      return response.data;
    } catch (error) {
      this.handleRequestError(error, 'Ошибка проверки статуса документа');
    }
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

    try {
      const response = await axios.post(url, data, {
        headers: { 'L-Token': token }
      });
      return response.data;
    } catch (error) {
      this.handleRequestError(error, `Ошибка отмены блокировки документа (buildId: ${buildId}, panelId: ${panelId})`);
    }
  }
}
