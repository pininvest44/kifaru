
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static('public'));

const sleep = ms => new Promise(r => setTimeout(r, ms));

app.post('/api/bulk-stk', async (req, res) => {
  const { numbers, amount, reference } = req.body;
  const results = [];

  for (const phone of numbers) {
    try {
      const response = await axios.post(process.env.API_URL, {
        appId: process.env.APP_ID,
        phone,
        amount,
        accountReference: reference
      });

      results.push({ phone, success: true, response: response.data });
    } catch (e) {
      results.push({
        phone,
        success: false,
        error: e.response?.data || e.message
      });
    }

    await sleep(2000);
  }

  fs.appendFileSync(
    'stk-log.json',
    JSON.stringify({ timestamp: new Date(), results }) + "\n"
  );

  res.json({ success: true, total: results.length, results });
});

app.listen(process.env.PORT || 10000);
