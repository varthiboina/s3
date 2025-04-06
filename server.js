const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

//Middlewares
const HostAuth = require('./middlewares/hostAuth');
const fileDownloader = require('./middlewares/folderDownloader');
const uploadToEC2 = require('./middlewares/uploadToEC2');
const cmdHandler = require('./middlewares/cmdHandler');
const installNodeMiddleware = require('./middlewares/installNodeMiddleware')

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json()); 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.array('files[]') , HostAuth, cmdHandler , installNodeMiddleware, fileDownloader , uploadToEC2 , (req, res) => {
    
});

app.listen(3000, () => {
    console.log('🚀 Server running on port 3000');
});
