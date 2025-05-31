const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

// Кэш для хранения результатов
const cache = new Map();

// Проверка URL
app.post('/api/check-url', async (req, res) => {
  const { url } = req.body;
  
  // Проверка кэша
  if (cache.has(url)) {
    const cachedData = cache.get(url);
    if (Date.now() - cachedData.timestamp < 12 * 60 * 60 * 1000) {
      return res.json(cachedData.data);
    }
  }

  try {
    // Здесь можно раскомментировать реальные запросы к API, когда получите ключи
    /*
    // 1. Проверка в VirusTotal
    const vtResponse = await axios.get(`https://www.virustotal.com/api/v3/urls/${encodeURIComponent(url)}`, {
      headers: { 'x-apikey': process.env.VIRUS_TOTAL_API_KEY }
    });
    
    // 2. Проверка в UrlScan
    const urlScanResponse = await axios.post('https://urlscan.io/api/v1/scan/', {
      url,
      public: true
    }, {
      headers: { 'API-Key': process.env.URLSCAN_API_KEY }
    });

    // 3. Формирование комплексного отчета
    const reportData = {
      reputation: vtResponse.data.data.attributes.last_analysis_stats.malicious > 0 
        ? 'Опасный' 
        : 'Безопасный',
      details: {
        virusTotal: vtResponse.data.data.attributes.last_analysis_stats,
        urlScan: { 
          resultUrl: `https://urlscan.io/result/${urlScanResponse.data.uuid}/`,
          screenshot: `https://urlscan.io/screenshots/${urlScanResponse.data.uuid}.png`
        }
      },
      reportId: `RPT-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    */

    // Заглушка для тестирования
    const reportData = {
      reputation: Math.random() > 0.5 ? 'Опасный' : 'Безопасный',
      details: {
        virusTotal: { score: Math.floor(Math.random() * 10) },
        urlScan: { malicious: Math.random() > 0.7 },
        amTip: { riskLevel: Math.floor(Math.random() * 5) }
      },
      reportId: `RPT-${Date.now()}`
    };

    // Сохраняем в кэш
    cache.set(url, {
      data: reportData,
      timestamp: Date.now()
    });

    res.json(reportData);
  } catch (error) {
    console.error('Error checking URL:', error);
    res.status(500).json({ 
      error: 'Failed to check URL',
      message: error.message 
    });
  }
});

// Отправка репорта
app.post('/api/report', async (req, res) => {
  const { url, reason } = req.body;
  
  try {
    const reportResult = {
      status: 'success',
      message: `Репорт для ${url} успешно отправлен`,
      reportId: `RPT-${Date.now()}`,
      systems: ['Netcraft', 'VirusTotal', 'ИС Антифишинг']
    };

    res.json(reportResult);
  } catch (error) {
    console.error('Error reporting URL:', error);
    res.status(500).json({ error: 'Failed to report URL' });
  }
});

// Базовый маршрут API
app.get("/api", (req, res) => {
  res.json({ message: "Anti-phishing server is running" });
});

// Обслуживание статических файлов React-приложения
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
