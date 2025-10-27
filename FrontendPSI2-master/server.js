const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 3000;

// Vite build output
const distPath = path.join(__dirname, 'dist');

app.use(compression());
app.use(express.static(distPath, { index: false, maxAge: '1h' }));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`React app serving on port ${port}`);
});

 