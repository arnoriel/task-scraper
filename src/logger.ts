import fs from 'fs';
import path from 'path';

const logDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'error.log');

export function logError(error: unknown) {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.stack || error.message : String(error);

  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry, { encoding: 'utf8' });
} 

export function logInfo(info: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${info}\n`;
  fs.appendFileSync(logFile, logEntry, { encoding: 'utf8' });
}
