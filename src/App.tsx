import React, { useState } from 'react';
import { useProcessFile } from './useProcessFile';
import './App.css';

const App: React.FC = () => {
  const { isProcessing, processedCount, totalCount, errorEmails, fileInputRef, handleFileSelect, handleDrop } = useProcessFile();
  
  // Новые стейты для email и пароля для запроса экспорта архива
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/exportAll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) // panel_id по умолчанию выставляется на сервере
      });
      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.statusText}`);
      }
      // Получаем архив как Blob
      const blob = await response.blob();
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка скачивания архива:', error);
    }
  };

  return (
    <div
      className="app-container"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h1 className="app-title">Получение Ficto токенов</h1>

      <div className="form-container">
        {/* Секция загрузки файла (без изменений) */}
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

        {/* Новая секция для ввода email и пароля */}
        <div style={{ marginTop: '20px' }}>
          <label htmlFor="emailInput">Email:</label>
          <input
            id="emailInput"
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <label htmlFor="passwordInput">Пароль:</label>
          <input
            id="passwordInput"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <button
            onClick={handleDownload}
            disabled={!email || !password}
            className="action-button"
          >
            Скачать архив с XLSX
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
          Файлы будут сохранены в директорию загрузок с именами, соответствующими
          учреждениям
        </p>
      </div>

      {errorEmails.length > 0 && !isProcessing && (
        <div className="error-container">
          <p>Не удалось обработать следующие аккаунты:</p>
          <ul>
            {errorEmails.map((email) => (
              <li key={email}>{email || '(неизвестный email)'}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
