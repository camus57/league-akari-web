// 简单的 CORS 代理服务器
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

// 代理腾讯 API
app.get('/proxy/tencent', async (req, res) => {
  try {
    const { cid, name } = req.query;
    const url = `https://apps.game.qq.com/cmc/zmMcnTargetContentList`;
    
    const response = await axios.get(url, {
      params: {
        r0: '133',
        page: '1',
        num: '10',
        target: '2',
        source: 'web_pc',
        cid,
        name
      },
      headers: {
        'Referer': 'https://lol.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 代理比赛列表
app.get('/proxy/matchlist', async (req, res) => {
  try {
    const { cid, uid } = req.query;
    const url = `https://apps.game.qq.com/cmc/matchlist`;
    
    const response = await axios.get(url, {
      params: {
        cid,
        uid,
        begidx: '0',
        cnt: '10'
      },
      headers: {
        'Referer': 'https://lol.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 代理排位信息
app.get('/proxy/rank', async (req, res) => {
  try {
    const { cid, uid } = req.query;
    const url = `https://apps.game.qq.com/cmc/rank`;
    
    const response = await axios.get(url, {
      params: {
        cid,
        uid
      },
      headers: {
        'Referer': 'https://lol.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
