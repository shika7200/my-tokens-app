import { Elysia } from 'elysia';
import { ApiService } from './ApiService';

const apiService = new ApiService();

/**
 * Контроллер API на основе Elysia.js.
 *
 * Эндпоинт:
 * POST /api/processAll
 *   - Принимает тело запроса в формате JSON, представляющее массив объектов с полями:
 *       - email: string — email пользователя.
 *       - password: string — пароль пользователя.
 *
 *   - Для каждого элемента выполняет:
 *       - Авторизацию (login),
 *       - Получение uuid,
 *       - Получение 19 init_token.
 *
 *   - Возвращает массив объектов, где для каждого элемента присутствует:
 *       {
 *         email,
 *         access_token,
 *         refresh_token,
 *         uuid,
 *         initTokens: string[]
 *       }
 *     либо объект с полем error, если произошла ошибка.
 */
new Elysia()
  .post('/api/processAll', async ({ body }) => {
    // Проверяем, что тело запроса является массивом объектов
    if (!Array.isArray(body)) {
      return new Response(
        JSON.stringify({ error: "Ожидается массив объектов" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const results: any[] = [];
    for (const item of body) {
      if (!item.email || !item.password) {
        results.push({
          email: item.email || null,
          error: "Отсутствует email или пароль"
        });
        continue;
      }
      try {
        const tokens = await apiService.login(item.email, item.password);
        const uuid = await apiService.getUuid(tokens.access_token);
        const initTokens = await apiService.getInitTokens(uuid, tokens.access_token);
        results.push({
          email: item.email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          uuid,
          initTokens
        });
      } catch (err: any) {
        results.push({
          email: item.email,
          error: err.message
        });
      }
    }
    return new Response(
      JSON.stringify(results),
      { headers: { "Content-Type": "application/json" } }
    );
  })
  .listen(3000);

console.log("Server running on http://localhost:3000");
