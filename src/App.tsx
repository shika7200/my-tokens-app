import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [errorEmails, setErrorEmails] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        alert('Пожалуйста, выберите файл в формате .xlsx');
      } else {
        await processFile(file);
      }
      e.dataTransfer.clearData();
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProcessedCount(0);
    setErrorEmails([]);
    try {
      // Чтение Excel-файла
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      setTotalCount(rows.length);
      console.log('Найдено строк:', rows.length);

      const resultsData: any[][] = [];
      for (const row of rows) {
        // Проверьте, что названия колонок соответствуют тому, что в вашем Excel
        const email: string = row["логин_ficto"] || row["Email"] || row["email"] || "";
        const password: string = row["пароль_ficto"] || row["Password"] || row["password"] || "";
        if (!email || !password) {
          console.warn(`Пропуск строки, отсутствуют данные: email="${email}" password="${password}"`);
          setProcessedCount(prev => prev + 1);
          setErrorEmails(prev => [...prev, email || "(неизвестный email)"]);
          continue;
        }
        console.log(`Обработка пользователя: ${email}`);
        try {
          // 1. Авторизация (login)
          const loginData = {
            email: email,
            password: password,
            remember_me: false,
            browser: {
              name: "chrome",
              version: "134.0.0",
              versionNumber: 134,
              mobile: false,
              os: "Windows 10"
            }
          };

          const loginRes = await axios.post('https://api.ficto.ru/client/auth/login', loginData);
          const { access_token, refresh_token } = loginRes.data;
          console.log(`Получены токены для ${email}:`, { access_token, refresh_token });

          // Запрос на grants
          const grantsRes = await axios.get('https://api.ficto.ru/client/grants?avalible=true&page=1', {
            headers: { Authorization: `Bearer ${access_token}` }
          });

          // Извлекаем uuid из свойства items
          let uuid = "";
          if (grantsRes.data && Array.isArray(grantsRes.data.items) && grantsRes.data.items.length > 0) {
            uuid = grantsRes.data.items[0].uuid;
          }
          if (!uuid) {
            throw new Error("UUID не найден");
          }
          console.log(`Получен uuid для ${email}:`, uuid);
          // 3. Получение 19 init_token из workspace
          const initTokens: string[] = [];
for (let i = 2; i <= 20; i++) {
  const workspaceRes = await axios.get(`https://api.ficto.ru/client/workspace/${uuid}/${i}`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const tokenValue = workspaceRes.data?.item?.init_token;
  if (!tokenValue) {
    console.warn(`Init token не найден для ${email} на запросе ${i}`);
    throw new Error(`Init token не найден для запроса ${i}`);
  }
  initTokens.push(tokenValue);
}
          console.log(`Получены init_token для ${email}:`, initTokens);

          resultsData.push([email, access_token, refresh_token, uuid, ...initTokens]);
        } catch (userError: any) {
          console.error(`Ошибка при обработке пользователя ${email}:`, userError);
          setErrorEmails(prev => [...prev, email]);
        } finally {
          setProcessedCount(prev => prev + 1);
        }
      }

      // Формирование выходного Excel-файла
      const headerRow = ["Email", "Access Token", "Refresh Token", "UUID"];
      for (let j = 2; j <= 20; j++) {
        headerRow.push(`Init Token ${j}`);
      }
      const outputData = [headerRow, ...resultsData];
      const outSheet = XLSX.utils.aoa_to_sheet(outputData);
      const outBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(outBook, outSheet, "Results");
      const dateStr = new Date().toISOString().slice(0, 10); // ГГГГ-ММ-ДД
      const outputFileName = `Результаты_${dateStr}.xlsx`;
      XLSX.writeFile(outBook, outputFileName);
      console.log("Файл сохранён как:", outputFileName);
    } catch (e: any) {
      console.error("Ошибка при обработке файла:", e);
      alert("Произошла ошибка при обработке файла. Проверьте консоль для деталей.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffc0cb',
      gap: '20px'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>Получение Ficto токенов</h1>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        width: '80%',
        maxWidth: '500px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="fileUpload" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Выберите Excel-файл:
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
            style={{ width: '100%' }}
            ref={fileInputRef}
          />
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            color: '#fff',
            backgroundColor: isProcessing ? '#aaa' : '#4CAF50',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            width: '100%',
          }}
        >
          {isProcessing ? 'Обработка...' : '🚀 Получить токены и uuid'}
        </button>

        {isProcessing && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Обработано: {processedCount} из {totalCount}</p>
            <div style={{
              height: '20px',
              backgroundColor: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden',
              marginTop: '10px'
            }}>
              <div style={{
                height: '100%',
                width: `${totalCount ? (processedCount / totalCount) * 100 : 0}%`,
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', color: '#555', fontSize: '14px', textAlign: 'center' }}>
        <p>Файлы будут сохранены в директорию загрузок с именами, соответствующими учреждениям</p>
      </div>

      {errorEmails.length > 0 && !isProcessing && (
        <div style={{ marginTop: '10px', color: 'red' }}>
          <p>Не удалось обработать следующие аккаунты:</p>
          <ul>
            {errorEmails.map(email => <li key={email}>{email || "(неизвестный email)"}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
