const express = require('express');
const app = express();

app.use((_, res, next) => {
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.static('../build'));

const PORT = process.env.CLIENT_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});