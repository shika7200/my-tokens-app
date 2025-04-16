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
 * @returns Массив объектов с результатом для каждого пользователя.
 */
export async function processAllUsers(users: { email: string; password: string }[]): Promise<any[]> {
  const apiService = new ApiService();

  const userPromises = users.map(async (user) => {
    if (!user.email || !user.password) {
      return { email: user.email || null, error: "Отсутствует email или пароль" };  
    }

    try {
      const tokens = await apiService.login(user.email, user.password);
      
      // Получение UUID с дополнительным контекстом ошибки
      const uuid = await apiService.getUuid(tokens.access_token);
      
      // Получение init_tokens с дополнительным контекстом ошибки
      const initTokens = await apiService.getInitTokens(uuid, tokens.access_token);
      
      return {
        email: user.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        uuid,
        initTokens
      };
    } catch (error: any) {
      return { email: user.email, error: error.message || "Неизвестная ошибка" };
    }
  });

  // Дожидаемся завершения всех запросов
  return await Promise.all(userPromises);
}
