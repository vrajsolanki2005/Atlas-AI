const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");

const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) =>
      stack
        ? `[${timestamp}] [${level.toUpperCase()}] ${message}\n${stack}`
        : `[${timestamp}] [${level.toUpperCase()}] ${message}`,
    ),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logsDir, "atlas.log") }),
    new transports.File({ filename: path.join(logsDir, "error.log"), level: "error" }),
  ],
});

module.exports = logger;
