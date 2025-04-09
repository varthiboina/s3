// middleware/logMiddleware.js
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Resolve log directory path relative to the project root
const logDir = path.join(__dirname, '../logs');  // Adjust this path based on your project structure
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Set up Winston logger
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(logDir, 'app.log') })
    ]
});

// Logging Middleware
const logMiddleware = (req, res, next) => {
    // Intercept console.log, console.warn, and console.error
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
        const message = args.join(' ');
        logger.info(message); // Log the message using Winston
        originalLog.apply(console, args); // Log to the console
    };

    console.warn = (...args) => {
        const message = args.join(' ');
        logger.warn(message); // Log the warning using Winston
        originalWarn.apply(console, args); // Log to the console
    };

    console.error = (...args) => {
        const message = args.join(' ');
        logger.error(message); // Log the error using Winston
        originalError.apply(console, args); // Log to the console
    };

    // Pass control to the next middleware or route handler
    next();
};

module.exports = logMiddleware;
