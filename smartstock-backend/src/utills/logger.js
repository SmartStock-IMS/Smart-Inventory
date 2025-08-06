const fs = require('fs');
const path = require('path');

class Logger {
  static log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      meta,
    };

    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);

    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(logEntry);
    }
  }

  static info(message, meta = {}) {
    this.log('info', message, meta);
  }

  static error(message, meta = {}) {
    this.log('error', message, meta);
  }

  static warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  static debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta);
    }
  }

  static writeToFile(logEntry) {
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
}

module.exports = Logger;