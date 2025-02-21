export * as Formatters from './formatter/index.js';
export * as Outputs from './output/index.js';

const levels = ['error', 'warn', 'log', 'info', 'debug'] as const;
export type Level = (typeof levels)[number];
export type Value = unknown;
export type Params = Record<string, Value>;
export type Prefix = string[];

export interface DaLog {
  error(error: Value): void;
  log(message: Value): void;
  info(message: Value): void;
  warn(message: Value): void;
  debug(message: Value): void;
  prefix(prefix: string): DaLog;
  param(key: string, value: Value): DaLog;
  params(params: Params): DaLog;
}

export interface Message {
  level: Level;
  prefix: Prefix;
  params: Params;
  message: Value;
  timestamp: Date;
}

export interface Formatter {
  (message: Message): string | Promise<string>;
}

export interface Output {
  (message: Message, formatter: Formatter): void;
}

export interface LogMethod {
  formatter: Formatter;
  output: Output;
}

let enabledLevels: Level[] = [...levels];
const logMethods: LogMethod[] = [];

export function setLevel(level: Level | Level[]) {
  if (Array.isArray(level)) enabledLevels = level;
  else {
    enabledLevels = levels.slice(0, levels.indexOf(level) + 1);
  }
}

export function addOutput(formatter: Formatter, output: Output) {
  logMethods.push({ formatter, output });
}

export function createLogger(prefix?: string): DaLog {
  if (prefix === undefined) return _createLogger([], {});
  return _createLogger([prefix], {});
}

function _createLogger(prefix: string[], params: Params): DaLog {
  const _log = (level: Level, message: Value) => {
    if (enabledLevels.includes(level)) {
      const messageObject = {
        level,
        prefix,
        params,
        message,
        timestamp: new Date(),
      };
      logMethods.forEach(async (method) => {
        method.output(messageObject, method.formatter);
      });
    }
  };
  return {
    error: (error: Value) => _log('error', error),
    log: (message: Value) => _log('log', message),
    warn: (message: Value) => _log('warn', message),
    info: (message: Value) => _log('info', message),
    debug: (message: Value) => _log('debug', message),
    prefix: (p: string) => _createLogger([...prefix, p], params),
    param: (key: string, value: Value) =>
      _createLogger(prefix, { ...params, [key]: value }),
    params: (p: Params) => _createLogger(prefix, { ...params, ...p }),
  };
}
