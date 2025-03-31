import { ApiService } from "./ApiService";

/**
 * Обрабатывает массив объектов с email и password.
 *
 * Для каждого элемента выполняется:
 * - Авторизация (login) с использованием ApiService.
 * - Получение uuid через getUuid.
 * - Получение 19 init_token через getInitTokens.
 *
 * Если для какого-либо пользователя возникает ошибка, в результат добавляется объект с полем error.
 *
 * @param users - Массив объектов, содержащих email и password.
 * @returns Массив объектов, где для каждого объекта присутствуют:
 *   { email, access_token, refresh_token, uuid, initTokens: string[] }
 *   либо { email, error } при ошибке.
 */
export async function processAllUsers(users: { email: string; password: string }[]): Promise<any[]> {
  const apiService = new ApiService();
  const results: any[] = [];

  for (const user of users) {
    if (!user.email || !user.password) {
      results.push({
        email: user.email || null,
        error: "Отсутствует email или пароль"
      });
      continue;
    }
    try {
      const tokens = await apiService.login(user.email, user.password);
      const uuid = await apiService.getUuid(tokens.access_token);
      const initTokens = await apiService.getInitTokens(uuid, tokens.access_token);
      results.push({
        email: user.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        uuid,
        initTokens
      });
    } catch (err: any) {
      results.push({
        email: user.email,
        error: err.message
      });
    }
  }
  return results;
}
