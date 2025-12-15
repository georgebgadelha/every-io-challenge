export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  data?: Record<string, any>;
  context?: string;
}

class Logger {
  private logLevel: LogLevel;
  private context?: string;

  constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    this.context = 'App';
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = (process.env.LOG_LEVEL || 'info').toUpperCase();
    
    switch (level) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      case 'INFO':
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, levelName, message, data, context } = entry;
    
    let log = `[${timestamp}] [${levelName}]`;
    
    if (context) {
      log += ` [${context}]`;
    }
    
    log += ` ${message}`;
    
    if (data && Object.keys(data).length > 0) {
      log += ` ${JSON.stringify(data)}`;
    }
    
    return log;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>, context?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      levelName: LOG_LEVEL_NAMES[level],
      message,
      data,
      context: context || this.context,
    };

    const formatted = this.formatLog(entry);
    
    // Use appropriate console method based on level
    if (level === LogLevel.ERROR) {
      console.error(formatted);
    } else if (level === LogLevel.WARN) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  setContext(context: string): void {
    this.context = context;
  }

  debug(message: string, data?: Record<string, any>, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  info(message: string, data?: Record<string, any>, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  warn(message: string, data?: Record<string, any>, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  error(message: string, data?: Record<string, any>, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }
}

export default new Logger();
