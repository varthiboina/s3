const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

const upload = multer({ storage: multer.memoryStorage() });
const folderDownload = async(req,res , next) => 
{
const filePaths = JSON.parse(req.body.filePaths || '[]'); 

    req.files.forEach((file, index) => {
        const relativePath = filePaths[index]; 


        let formattedRelativePath = relativePath
            .replace(/^\./, '') // Remove the first "."
            .replace(/\//g, '\\') // Convert "/" to "\"
            .replace(/^\\/, ''); // Remove the first "\" if present

        const directoryPath = path.dirname(path.join(__dirname, formattedRelativePath));

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
            console.log(`✅ Directory created: ${directoryPath}`);
        }

        const fileName = file.originalname; // Get only the filename
        const destinationPath = path.join(directoryPath, fileName);

        fs.writeFileSync(destinationPath, file.buffer);
        console.log(`✅ File saved: ${destinationPath}`);
    });

    res.json({ message: 'Directories created and files saved successfully!', filePaths });
    next();
}

module.exports = folderDownload;