import pino from "pino";

export type AppLogger = {
  info: (bindings: Record<string, unknown>, message: string) => void;
  error: (bindings: Record<string, unknown>, message: string) => void;
};

export function createLogger(): AppLogger {
  const logger = pino({ level: "info" });
  return {
    info(bindings, message) {
      logger.info(bindings, message);
    },
    error(bindings, message) {
      logger.error(bindings, message);
    },
  };
}
