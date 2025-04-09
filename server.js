const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const http = require('http'); // <-- Needed for server creation


const app = express();
const originalLog = console.log;
console.log = function (...args) {
  const message = args.join(' ');
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  originalLog.apply(console, args); // Keep logging to backend console
};

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// Middlewares
const HostAuth = require('./middlewares/hostAuth');
const fileDownloader = require('./middlewares/folderDownloader');
const uploadToEC2 = require('./middlewares/uploadToEC2');
const cmdHandler = require('./middlewares/cmdHandler');
const installNodeMiddleware = require('./middlewares/installNodeMiddleware');
const sshDir = require('./middlewares/sshDir');
const consoleLogger = require('./middlewares/consoleLogger');
const remove_node_modules = require('./middlewares/remove_node_modules');
const install_Node = require('./middlewares/install_Node');

// Set up multer storage to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json()); 
app.use(consoleLogger);

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));  // Use path.join for cross-platform compatibility
});

// Handle file upload at the /upload endpoint
app.post('/upload', upload.array('files[]'), sshDir , HostAuth, cmdHandler , installNodeMiddleware, fileDownloader ,remove_node_modules, uploadToEC2,install_Node , (req, res) => {
    // Your file handling logic here
    res.send('Files uploaded and processed successfully');
});

app.get('/message', (req, res) => {
  console.log('📩 Message received:', req.body);
  //res.send('✅ Received');
});

// Start the Express server on port 3000
server.listen(3000, () => {
    console.log('🚀 Server running on port 3000');
});
