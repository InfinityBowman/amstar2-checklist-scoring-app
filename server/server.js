import express from 'express';
const app = express();

const PORT = process.env.PORT || 3000;

const callCounts = new Map();

app.get('/api/test', (req, res) => {
  const key = '/api/test';
  const count = callCounts.get(key) || 0;
  callCounts.set(key, count + 1);

  res.json({
    status: 'ok',
    message: 'Server is running!',
    calls: callCounts.get(key),
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
