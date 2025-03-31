import { Elysia } from 'elysia';
import { processAllUsers } from './ ProcessAllHandler';


/**
 * Контроллер API на основе Elysia.js.
 *
 * Эндпоинты:
 *

 * POST /api/processAll
 *   - Принимает тело запроса в формате JSON, представляющее массив объектов с полями:
 *       - email: string — email пользователя.
 *       - password: string — пароль пользователя.
 *   - Для каждого элемента выполняет обработку через функцию processAllUsers.
 *   - Возвращает массив объектов с результатами обработки.
 */
new Elysia()
  
  .post('/api/processAll', async ({ body }) => {
    try {
      const parsedBody = await body;
      if (!Array.isArray(parsedBody)) {
        return new Response(
          JSON.stringify({ error: "Ожидается массив объектов" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const results = await processAllUsers(parsedBody);
      return new Response(
        JSON.stringify(results),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  })
  .listen(3000);

console.log("Server running on http://localhost:3000");
