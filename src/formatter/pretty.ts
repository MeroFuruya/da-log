import { Formatter, Params, Value } from '../index.js';

export interface PrettyOptions {
  colors: boolean | Colors;
  replaceNewline: boolean;
}

export interface Colors {
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  reset: string;
}

const emptyColors = {
  red: '',
  green: '',
  yellow: '',
  blue: '',
  magenta: '',
  cyan: '',
  white: '',
  reset: '',
};

const defaultColors = {
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',
  reset: '\u001b[0m',
};

function getColorPalette(): Colors {
  if (
    typeof process === 'object' &&
    'stdout' in process &&
    process.stdout.isTTY &&
    process.env.NO_COLOR === undefined
  )
    return defaultColors;
  else return emptyColors;
}

function parseOptions(options?: Partial<PrettyOptions>): PrettyOptions {
  return {
    colors: true,
    replaceNewline: true,
    ...options,
  };
}

export function pretty(options?: Partial<PrettyOptions>): Formatter {
  const _options = parseOptions(options);
  let colors: Colors;
  if (_options?.colors === false) colors = emptyColors;
  else if (_options?.colors && typeof _options?.colors !== 'boolean')
    colors = _options.colors;
  else colors = getColorPalette();

  function formatValue(value: Value): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string')
      return `${colors.yellow}'${_options.replaceNewline ? value.replace(/\n/g, '\\n') : value}'${colors.reset}`;

    if (typeof value === 'number')
      return `${colors.yellow}${value}${colors.reset}`;
    if (typeof value === 'boolean')
      return `${colors.magenta}${value}${colors.reset}`;
    if (value instanceof Date)
      return `${colors.cyan}${value.toISOString()}${colors.reset}`;
    if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
    if (value instanceof Map)
      return `{${[...value].map(([k, v]) => `${formatValue(k)}: ${formatValue(v)}`).join(', ')}}`;
    if (value instanceof Set)
      return `[${[...value].map(formatValue).join(', ')}]`;
    if (value instanceof Error)
      return `${colors.red}${value.stack || value.message}${colors.reset}`;
    if (typeof value === 'object')
      return `{${Object.entries(value)
        .map(
          ([k, v]) => `${colors.green}${k}${colors.reset}: ${formatValue(v)}`,
        )
        .join(', ')}}`;
    return `${colors.yellow}${new String(value)}${colors.reset}`;
  }

  function formatParams(params: Params): string {
    return Object.entries(params)
      .map(([key, value]) =>
        [`${colors.green}${key}${colors.reset}=`, formatValue(value)].join(''),
      )
      .join(' ');
  }

  function getLevelColor(level: string): string {
    switch (level) {
      case 'error':
        return colors.red;
      case 'warn':
        return colors.yellow;
      case 'log':
        return colors.green;
      case 'debug':
        return colors.cyan;
      case 'info':
        return colors.blue;
      default:
        return colors.reset;
    }
  }

  return (message) => {
    const timestamp = message.timestamp.toISOString();
    const levelColor = getLevelColor(message.level);
    const level = `${levelColor}[${message.level.toLocaleUpperCase()}]${colors.reset}`;
    const prefix = message.prefix.join('.');
    const params = formatParams(message.params);
    const formattedMessage =
      typeof message.message === 'string'
        ? `${levelColor}${message.message}${colors.reset}`
        : formatValue(message.message);
    return [timestamp, level, prefix, params, formattedMessage]
      .filter(Boolean)
      .join(' ');
  };
}

export const prettyFormatter = pretty;
