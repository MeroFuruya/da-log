export * as LogMethods from './methods/index';

const levels = ['error', 'warn', 'log', 'debug'] as const;
export type Level = (typeof levels)[number];
export type Value = string | Error | { [key: string]: Value };
export type Params = Record<string, Value>;
export type Prefix = string | string[];

export interface DaLog {
  error: (error: Value) => void;
  log: (message: Value) => void;
  warn: (message: Value) => void;
  debug: (message: Value) => void;
  prefix(prefix: string): DaLog;
  param(key: string, value: Value): DaLog;
}

export interface Message {
  level: Level;
  prefix: Prefix;
  params: Params;
  message: Value;
  timestamp: Date;
}

export interface LogMethod {
  (message: Message): void;
}

let enabledLevels: Level[] = [...levels];
let logMethods: LogMethod[] = [];

export function setLevel(level: Level | Level[]) {
  if (Array.isArray(level)) enabledLevels = level;
  else {
    enabledLevels = levels.slice(0, levels.indexOf(level) + 1);
  }
}

export function setOutputs(method: LogMethod | LogMethod[]) {
  if (!Array.isArray(method)) method = [method];
  logMethods = method;
}

export function createLogger() {
  return _createLogger([], {});
}

function _createLogger(prefix: string[], params: Params): DaLog {
  const log = (level: Level, message: Value) => {
    if (enabledLevels.includes(level)) {
      logMethods.forEach((method) =>
        method({
          level,
          prefix,
          params,
          message,
          timestamp: new Date(),
        }),
      );
    }
  };
  return {
    error: (error: Value) => log('error', error),
    log: (message: Value) => log('log', message),
    warn: (message: Value) => log('warn', message),
    debug: (message: Value) => log('debug', message),
    prefix: (prefix: string) => _createLogger([...prefix, prefix], params),
    param: (key: string, value: Value) =>
      _createLogger(prefix, { ...params, [key]: value }),
  };
}
