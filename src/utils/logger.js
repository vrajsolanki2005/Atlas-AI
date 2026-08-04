const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../../logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const atlasStream = fs.createWriteStream(path.join(logsDir, "atlas.log"), { flags: "a" });
const errorStream = fs.createWriteStream(path.join(logsDir, "error.log"), { flags: "a" });

function formatLine(level, message) {
  return `[${new Date().toISOString()}] [${level}] ${message}\n`;
}

const logger = {
  info(message) {
    const line = formatLine("INFO", message);
    process.stdout.write(line);
    atlasStream.write(line);
  },

  error(message, err) {
    const detail = err instanceof Error ? ` — ${err.message}` : "";
    const line = formatLine("ERROR", `${message}${detail}`);
    process.stderr.write(line);
    errorStream.write(line);
    atlasStream.write(line);
  },
};

module.exports = logger;
