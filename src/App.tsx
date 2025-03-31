import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface Tokens {
  access_token: string;
  refresh_token: string;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcessFile = async () => {
    if (!file) {
      alert('Пожалуйста, выберите файл!');
      return;
    }

    setLoading(true);

    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      for (let i = 0; i < jsonData.length; i++) {
        const login = jsonData[i]['лигин_ficto'];
        const password = jsonData[i]['пароль_ficto'];

        try {
          const response = await fetch('/api/client/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: login,
              password: password,
              remember_me: false,
              browser: {
                name: 'chrome',
                version: '134.0.0',
                versionNumber: 134,
                mobile: false,
                os: 'Windows 10',
              },
            }),
          });

          const result = await response.json();

          if (result.status) {
            jsonData[i]['access_token'] = result.access_token;
            jsonData[i]['refresh_token'] = result.refresh_token;
          } else {
            jsonData[i]['access_token'] = 'Ошибка';
            jsonData[i]['refresh_token'] = 'Ошибка';
          }
        } catch (error) {
          jsonData[i]['access_token'] = 'Ошибка';
          jsonData[i]['refresh_token'] = 'Ошибка';
        }
      }

      const newWorksheet = XLSX.utils.json_to_sheet(jsonData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Обработано');

      XLSX.writeFile(newWorkbook, 'обработанные_токены.xlsx');

      setLoading(false);
      alert('Файл успешно обработан и скачан!');
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffc0cb',
        gap: '20px',
      }}
    >
      <input type="file" accept=".xlsx" onChange={handleFileUpload} />
      <button
        onClick={handleProcessFile}
        disabled={loading || !file}
        style={{
          padding: '12px 24px',
          fontSize: '18px',
          color: '#fff',
          backgroundColor: loading ? '#aaa' : '#4CAF50',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Обработка...' : '🚀 Получить токены'}
      </button>
    </div>
  );
};

export default App;
