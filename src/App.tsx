import React, { useState } from 'react';
import { useProcessFile } from './useProcessFile';
import './App.css';

const App: React.FC = () => {
  const { 
    isProcessing, 
    processedCount, 
    totalCount, 
    errorResults, // предполагается, что ошибки теперь приходят в виде [{ email, error }, ...]
    fileInputRef, 
    handleFileSelect, 
    handleDrop 
  } = useProcessFile();
  
  // Массив для хранения почт и паролей для экспорта
  const [credentials, setCredentials] = useState<{ email: string; password: string }[]>([]);

  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
  
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Ошибка запроса: ${response.statusText}`);
      }
  
      // Извлекаем имя файла из заголовка Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      const match = contentDisposition?.match(/filename="?([^"]+)"?/);
      if (!match || !match[1]) {
        throw new Error('Сервер не прислал имя файла в заголовке Content-Disposition');
      }
      const filename = match[1];
  
      // Получаем бинарное содержимое архива
      const blob = await response.blob();
  
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка скачивания архива:', error);
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  // Обработчик для добавления новой пары email/пароль
  const handleAddCredentials = () => {
    setCredentials([...credentials, { email: '', password: '' }]);
  };

  // Обработчик изменения данных
  const handleChangeCredentials = (index: number, field: 'email' | 'password', value: string) => {
    const updatedCredentials = [...credentials];
    updatedCredentials[index][field] = value;
    setCredentials(updatedCredentials);
  };

  return (
    <div
      className="app-container"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h1 className="app-title">Получение Ficto токенов</h1>

      <div className="form-container">
        {/* Секция загрузки файла */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="fileUpload" className="file-upload-label">
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
          className="action-button"
        >
          {isProcessing ? 'Обработка...' : '🚀 Получить токены и uuid'}
        </button>

        {/* Секция для ввода учетных данных для экспорта */}
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleAddCredentials} className="action-button">
            Добавить данные для экспорта
          </button>

          {credentials.map((cred, index) => (
            <div key={index} style={{ marginTop: '20px' }}>
              <label htmlFor={`emailInput_${index}`}>Email {index + 1}:</label>
              <input
                id={`emailInput_${index}`}
                type="email"
                placeholder="Введите email"
                value={cred.email}
                onChange={(e) => handleChangeCredentials(index, 'email', e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <label htmlFor={`passwordInput_${index}`}>Пароль {index + 1}:</label>
              <input
                id={`passwordInput_${index}`}
                type="password"
                placeholder="Введите пароль"
                value={cred.password}
                onChange={(e) => handleChangeCredentials(index, 'password', e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              />
            </div>
          ))}

          <button
            onClick={handleDownload}
            disabled={credentials.some((cred) => !cred.email || !cred.password)}
            className="action-button"
          >
            Скачать архивы
          </button>
        </div>

        {isProcessing && (
          <div className="progress-container">
            <p>
              Обработано: {processedCount} из {totalCount}
            </p>
            <div className="progress-bar">
              <div
                className="progress-bar-inner"
                style={{
                  width: `${totalCount ? (processedCount / totalCount) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="info-text">
        <p>
          Файлы будут сохранены в директорию загрузок с именами, соответствующими учреждениям
        </p>
      </div>

      {/* Вывод детальных ошибок для каждого аккаунта */}
      {errorResults.length > 0 && !isProcessing && (
        <div className="error-container">
          <p>Ошибки при обработке следующих аккаунтов:</p>
          <ul>
            {errorResults.map((errObj, index) => (
              <li key={index}>
                {errObj.email || '(неизвестный email)'}: {errObj.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
