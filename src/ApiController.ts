import { Elysia } from 'elysia';

import { exportAllHandler } from './ExportAllHandler';
import { processAllUsers } from './ ProcessAllHandler';

const app = new Elysia();

// Обработчик preflight-запросов для любых путей
app.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
});

app.post('/api/processAll', async ({ body }) => {
  try {
    const parsedBody = await body;
    if (!Array.isArray(parsedBody)) {
      return new Response(
        JSON.stringify({ error: "Ожидается массив объектов" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*" 
          } 
        }
      );
    }
    const results = await processAllUsers(parsedBody);
    return new Response(JSON.stringify(results), {
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      }
    });
  }
});

app.post("/api/exportAll", async ({ body }) => {
  try {
    
    const requestBody = await body as {
      email: string;
      password: string;
      panel_id?: number;
    };
    
    const { zipContent, filename } = await exportAllHandler(requestBody);

    return new Response(zipContent, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "Content-Disposition",
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    console.error("Ошибка в API:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
});


app.listen(3000);

console.log("Server running on http://localhost:3000");
