import * as winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, context, requestId, ...meta }) => {
    const ctx = context ? ` [${context}]` : '';
    const rid = requestId ? ` rid=${requestId}` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}${ctx}${rid} ${message}${extra}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
};
