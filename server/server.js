import express from 'express';
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running!',
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
