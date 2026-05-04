const fs = require('fs');
const path = require('path');

// Configuração de logging simples para produção
class Logger {
  constructor(filename = 'logs/app.log') {
    this.filename = path.join(__dirname, '..', filename);
    
    // Criar diretório de logs se não existir
    const dir = path.dirname(this.filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      message,
      ...metadata
    };

    const logEntry = JSON.stringify(entry);
    
    // Log em arquivo
    fs.appendFileSync(this.filename, logEntry + '\n');
    
    // Log em console também em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      const colors = {
        ERROR: '\x1b[31m',
        WARN: '\x1b[33m',
        INFO: '\x1b[36m',
        DEBUG: '\x1b[35m',
        RESET: '\x1b[0m'
      };
      
      console.log(
        `${colors[level] || colors.RESET}[${timestamp}] ${level}: ${message}${colors.RESET}`,
        metadata
      );
    }
  }

  error(message, error = null) {
    const metadata = {};
    if (error instanceof Error) {
      metadata.error = {
        message: error.message,
        stack: error.stack
      };
    }
    this.log('ERROR', message, metadata);
  }

  warn(message, metadata = {}) {
    this.log('WARN', message, metadata);
  }

  info(message, metadata = {}) {
    this.log('INFO', message, metadata);
  }

  debug(message, metadata = {}) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('DEBUG', message, metadata);
    }
  }
}

module.exports = new Logger();
