import path from "path";
import winston from "winston";

const logDir = path.join(process.cwd(), "logs");

// --- Winston setup ---
const errorLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }),
  ),
  transports: [
    // Log errors to file
    new winston.transports.File({
      filename: path.join(logDir, "error-logs.log"),
      level: "error",
    }),
    // Log all info-level messages and above
    new winston.transports.File({
      filename: path.join(logDir, "all-logs.log"),
    }),
  ],
});

// Also log to console in dev
if (process.env.NODE_ENV !== "production") {
  errorLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

export default errorLogger;
