import axios from 'axios';

/**
 * Сервис для работы с API Ficto.
 */
export class ApiService {
  /**
   * Выполняет авторизацию пользователя.
   *
   * @param email - Строка с email пользователя.
   * @param password - Строка с паролем пользователя.
   * @returns Объект с полями access_token и refresh_token.
   * @throws Ошибка, если авторизация не удалась.
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
   *
   * @param access_token - Строка с access token пользователя.
   * @returns Строка с UUID, полученным из списка грантов.
   * @throws Ошибка, если UUID не найден.
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
   *
   * @param uuid - Строка с UUID гранта.
   * @param access_token - Строка с access token пользователя.
   * @returns Массив из 19 init_token.
   * @throws Ошибка, если хотя бы один init_token не найден.
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
}
