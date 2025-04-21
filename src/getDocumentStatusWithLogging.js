#!/usr/bin/env bun

// file: getDocumentStatusWithLogging.js

// Обёртка для асинхронного исполнения
async function checkDocumentStatus() {
    const panelId = 3289; // замените на нужный panel_id
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJncmFudF9pZCI6MjMzLCJhcnRpY2xlX2lkIjozNzg3LCJvcmdfaWQiOjI5OTQ0LCJvcmdfdHlwZSI6bnVsbCwidWlkIjoxMTMxODcsImlhdCI6MTc0NTIzNzU1NH0.COaNCW3OigjGdNxb9hhg8EHxdPnYHAv6G46ULe3Bn9_ChMvEzOt08Ze7uD639fqs1_tEBxOJPx9w9NDQs3_R65_t3tE03wqFRBVdBIIPSRtetWzTByaZDxOoXqIp16flW8XTr29orRIPm7ATw8dX5r2Jxv3l7RUdVg58pGm-LtSMvD74_9MOQrr3fsgokDQOarT5Zub2zChoAiNB2egI1ZA-xbmcVuc0LPrh7APqqn8pUXPDiX1Xn7P-2f2B8X-axLg1lbwinK1ZSZf779grB5xGf0hSDU8UtHpyd-ZVEYhfbVrQanUrxlMShbEoT0A8TcIJCzfCPT2jWAT5nqnxuxjQ-SRXB23_dEyH_YNNz01QKs_QXEvKw2UPw7qz_ej0kfou15gW4BE7ggkcdjgBs87vu2Qiz7v6QYDy5ckpzEixGfroznVvVgeQHaoehefIGEZMW6gItong9WsEZYTNQSbE_whbDteK9q2yT9HO6QF7DSgxU84btxAYneK4_S6IiE7L1QCa_J1T5UzOKMJuSX1fGo6ssG7lY8uOk9sSAjhFGBKQptzXAvAK8rh5AHCGYEcp3iK41XOTU6lSvwDXpevXNiJWC5eThTXe9SOPMtDWEJkTBPTTVy4HbVU42GXiCZJ7CsIoqQ4pzV5_v1wxF7u0p5uUmDoQ544o7PfMoUA'; // замените на ваш init_token
  
    const url = `https://api.ficto.ru/client/layout/documents/299/status`;
  
    const headers = {
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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    };
  
    const body = {
      params: { panel_id: panelId },
      fixation_params: {}
    };
  
    // Логируем заголовки и тело запроса
    console.log('--- Request Headers ---');
    console.dir(headers, { depth: null });
    console.log('--- Request Body ---');
    console.log(JSON.stringify(body, null, 2));
  
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
  
      console.log('--- Response Status ---', res.status);
      const text = await res.text();
      try {
        console.log('--- Response JSON ---', JSON.parse(text));
      } catch {
        console.log('--- Response Text ---', text);
      }
  
      if (!res.ok) {
        console.error('Ошибка HTTP:', res.status);
        process.exit(1);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      process.exit(1);
    }
  }
  
  // Запуск
  checkDocumentStatus();
  