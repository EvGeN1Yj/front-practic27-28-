import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [reportData, setReportData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      setReportData(data);
      setHistory(prev => [{ url, ...data, timestamp: new Date() }, ...prev]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Антифишинговый модуль</h1>
      
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Введите URL для проверки"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Проверка...' : 'Проверить'}
        </button>
      </form>

      {reportData && (
        <div className="report">
          <h2>Результаты проверки: {url}</h2>
          <pre>{JSON.stringify(reportData, null, 2)}</pre>
        </div>
      )}

      <div className="history">
        <h2>История запросов</h2>
        {history.map((item, index) => (
          <div key={index} className="history-item">
            <p><strong>URL:</strong> {item.url}</p>
            <p><strong>Время:</strong> {item.timestamp.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
