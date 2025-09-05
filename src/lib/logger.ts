import winston from "winston";

const level = (
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === "production" ? "info" : "debug")
).toLowerCase();

export const logger = winston.createLogger({
  level,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {
    env: process.env.NODE_ENV,
    service: "giant-auto-import",
  },
  transports: [new winston.transports.Console()],
});

export default logger;
