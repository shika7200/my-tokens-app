#!/usr/bin/env bun

// file: saveDataWithLogging.js

// Обёртка для асинхронного исполнения
async function saveTableData() {
    const url = 'https://api.ficto.ru/client/layout/table/save-data';

    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'ru-RU,ru;q=0.9',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'L-Token': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJncmFudF9pZCI6MjMzLCJhcnRpY2xlX2lkIjozNzUxLCJvcmdfaWQiOjI5OTQ0LCJvcmdfdHlwZSI6bnVsbCwidWlkIjoxMTMxODcsImlhdCI6MTc0NTIxODQyNH0.PBnI2gcje3-pAxNsfF2Fku_C-2oL2bM4Hg4ZJLtlU5ziNzmLvaXLi1vBZnwxyjnTFi7I17nqLj8wz1fGQANhhcS6ClOe9LIhCmddTJgI2lly_-CjNZDUeNZN8JD30M6nCKXD-3D2RiXi75KLEr4x2jJY_K_TUSGVhMCymfODA3Edeq2OPz10HmSGt-c_VKJjCMty4gam4vnuP_4i4nzwe-JQP03Ced7ZFRNK18dyWfdhOF7L-KnSOuDncHXL08dvME_AhEBsPXZTUZTmp2BIwIiTMlYl0O1C7y3aLqXeU_4VsOB65SiudfQr2oTzISUpRHoSteKSqFt5DT8-P2dofVMhbV6azJpg_5UyejKUe8BADkVtLTHDAOVzVsYTaaEUljMG5zvziSqeAczlvquYrTVC_MlLJSWiac2-mJS6cv3hmZRM6DbWZuQDN2QP7nnIHpvuahm60FqSW35l5JuYDaiZsPHXwvr6qeCvdJ8xG2DJGR3lHSLQVDSOzg38hdJGMWBjhEZ1jt5fnRjUQsYREht4ls0tQPBFIg8fctChVym79QF8sTtPZRFww8x8TatsypKBuV4aDiUy-V16MTQtSfT6rlG6c_q03t-9ic9OeUz1Kfxr7E1By21XvLqtbiDKw3d1s1jo86TbsquhAhe4kNY2Mo1IQVTQCvTHz4PyJ_8',
      'Host': 'api.ficto.ru',
      'Origin': 'https://client.ficto.ru',
      'Referer': 'https://client.ficto.ru/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    };
  
    const body = {
      params: { panel_id: 3253 },
      table: [
        { panel_id: 3253, row_id: 56785, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56787, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56789, type_id: 2, columns: { "36715": 0,  "36717": 0 } },
        { panel_id: 3253, row_id: 56791, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56793, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56795, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56797, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56799, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56801, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56803, type_id: 2, columns: { "36715": 0,  "36717": 0 } },
        { panel_id: 3253, row_id: 56805, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56807, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56809, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56811, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56813, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56815, type_id: 2, columns: { "36715": 0,  "36717": 0 } },
        { panel_id: 3253, row_id: 56817, type_id: 2, columns: { "36715": 0,  "36717": 0 } },
        { panel_id: 3253, row_id: 56819, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56821, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56823, type_id: 2, columns: { "36715": 0,  "36717": 0 } },
        { panel_id: 3253, row_id: 56825, type_id: 2, columns: { "36715": 1,  "36717": 0 } },
        { panel_id: 3253, row_id: 56827, type_id: 2, columns: { "36715": 0,  "36717": 0 } },
        { panel_id: 3253, row_id: 56829, type_id: 2, columns: { "36715": 30 } },
        { panel_id: 3253, row_id: 56831, type_id: 2, columns: { "36715": 2  } },
        { panel_id: 3253, row_id: 56833, type_id: 2, columns: { "36715": 15 } },
        { panel_id: 3253, row_id: 56835, type_id: 2, columns: { "36715": 30 } },
        { panel_id: 3253, row_id: 56839, type_id: 2, columns: { "36715": 1  } }
      ],
      panel_id: 3253
    };

    // Логируем тело запроса и заголовки
    console.log('--- Request Headers ---');
    console.dir(headers, { depth: null });
    console.log('--- Request Body ---');
    console.log(JSON.stringify(body, null, 2));
  
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
  
      console.log('--- Fetch Response Status ---', res.status);
      const text = await res.text();
      try {
        console.log('--- Fetch Response JSON ---', JSON.parse(text));
      } catch {
        console.log('--- Fetch Response Text ---', text);
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
  saveTableData();
