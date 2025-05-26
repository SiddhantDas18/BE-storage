const express = require('express');
const cors = require('cors');
const path = require('path');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, '../public');


const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Length', 'Content-Type']
};

app.use(cors(corsOptions));
app.use(express.static(PUBLIC_DIR));
app.use(express.json());

// Routes
app.use('/', fileRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on all network interfaces at port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    // Get local IP address for easier access from other devices
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`Network: http://${net.address}:${PORT}`);
            }
        }
    }
});