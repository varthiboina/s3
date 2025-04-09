const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Multer storage configuration
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to handle folder downloads and file saving
const folderDownload = async (req, res, next) => {
    // Parse file paths from the request body
    const filePaths = JSON.parse(req.body.filePaths || '[]'); 

    // Loop through each uploaded file and process it
    req.files.forEach((file, index) => {
        const relativePath = filePaths[index];

        // Format the relative path for cross-platform compatibility
        let formattedRelativePath = relativePath
            .replace(/^\./, '') // Remove the first "."
            .replace(/^\/+/, '') // Remove leading slashes (if any)
            .replace(/\\/g, '/'); // Ensure backslashes are converted to forward slashes for Linux

        // Construct the full directory path using path.join
        const directoryPath = path.dirname(path.join(__dirname, formattedRelativePath));

        // Check if the directory exists, create it if not
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
            console.log(`✅ Directory created: ${directoryPath}`);
        }

        // Get the file name and construct the destination path
        const fileName = file.originalname;
        const destinationPath = path.join(directoryPath, fileName);

        // Write the file to the disk
        fs.writeFileSync(destinationPath, file.buffer);
        console.log(`✅ File saved: ${destinationPath}`);
    });

    // Send response back to the client
    res.json({ message: 'Directories created and files saved successfully!', filePaths });
    next();
};

// Export the middleware for use in the main application
module.exports = folderDownload;
