import React from 'react';
import { useProcessFile } from './useProcessFile';
import './App.css';

const App: React.FC = () => {
  const { isProcessing, processedCount, totalCount, errorEmails, fileInputRef, handleFileSelect, handleDrop } = useProcessFile();

  return (
    <div
      className="app-container"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h1 className="app-title">Получение Ficto токенов</h1>

      <div className="form-container">
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

        {isProcessing && (
          <div className="progress-container">
            <p>Обработано: {processedCount} из {totalCount}</p>
            <div className="progress-bar">
              <div
                className="progress-bar-inner"
                style={{ width: `${totalCount ? (processedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="info-text">
        <p>Файлы будут сохранены в директорию загрузок с именами, соответствующими учреждениям</p>
      </div>

      {errorEmails.length > 0 && !isProcessing && (
        <div className="error-container">
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
