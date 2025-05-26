const express = require('express');
const cors = require('cors');
const path = require('path');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, '../public');

app.use(cors());
app.use(express.static(PUBLIC_DIR));
app.use(express.json());

// Routes
app.use('/', fileRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});