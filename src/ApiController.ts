import { Elysia } from 'elysia'
import { exportAllHandler } from './ExportAllHandler'

import { InputJson } from './apiService_types'
import { processAllUsers } from './ ProcessAllHandler'
import { FictioFill } from './fictioFill'


const app = new Elysia()

// Обработчик preflight-запросов для любых путей
app.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
})

// Эндпоинт для обработки всех пользователей
app.post('/api/processAll', async ({ body }) => {
  try {
    const parsedBody = (await body) as unknown
    if (!Array.isArray(parsedBody)) {
      return new Response(
        JSON.stringify({ error: 'Ожидается массив объектов' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }
    const results = await processAllUsers(parsedBody)
    return new Response(
      JSON.stringify(results),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Ошибка в /api/processAll:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})

// Эндпоинт для экспорта данных с запросом массива учетных данных
interface ExportRequest {
  email: string
  password: string
  panel_id?: number
}
app.post('/api/export', async ({ body }) => {
  try {
    const requestBody = (await body) as ExportRequest[]
    const { zipContent, filename } = await exportAllHandler(requestBody)
    return new Response(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Disposition',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Ошибка в /api/export:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})

// Эндпоинт для заполнения Ficto по inputJson
app.post('/api/fill', async ({ body }) => {
  try {
    const inputJson = (await body) as InputJson
    await FictioFill(inputJson)
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})


app.listen(3000)
console.log('Server running on http://localhost:3000')
