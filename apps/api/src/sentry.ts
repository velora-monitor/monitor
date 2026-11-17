import * as Sentry from "@sentry/node";

export type SentryClient = {
  enabled: boolean;
  captureException: (error: unknown) => void;
};

export type SentryInit = (options: { dsn: string }) => void;

const disabledSentry: SentryClient = {
  enabled: false,
  captureException() {},
};

export function initSentry(dsn: string | undefined, init: SentryInit = defaultInit): SentryClient {
  if (!dsn) {
    return disabledSentry;
  }

  init({ dsn });
  return {
    enabled: true,
    captureException(error) {
      Sentry.captureException(error);
    },
  };
}

function defaultInit(options: { dsn: string }) {
  Sentry.init({ dsn: options.dsn });
}
