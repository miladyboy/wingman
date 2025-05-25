import pino from "pino";

// Create logger with configurable level from environment
const logLevel = process.env.E2E_LOG_LEVEL || "info";

export const logger = pino({
  level: logLevel,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss.l",
      ignore: "pid,hostname",
      messageFormat: "[E2E] {msg}",
    },
  },
});

// Helper functions for common logging patterns
export const logStep = (step: string, details?: any) => {
  logger.info({ step, details }, step);
};

export const logError = (error: string, details?: any) => {
  logger.error({ error, details }, error);
};

export const logDebug = (message: string, details?: any) => {
  logger.debug({ details }, message);
};

export const logWorker = (
  parallelIndex: number,
  message: string,
  details?: any
) => {
  logger.info(
    { parallelIndex, details },
    `[Worker ${parallelIndex}] ${message}`
  );
};
