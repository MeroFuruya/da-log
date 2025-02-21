import { Formatter, Params, Value } from '../index.js';

interface Colors {
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  reset: string;
}

function getColorPalette(): Colors {
  // if node process return the color palette
  if (typeof process === 'object') {
    return {
      red: '\u001b[31m',
      green: '\u001b[32m',
      yellow: '\u001b[33m',
      blue: '\u001b[34m',
      magenta: '\u001b[35m',
      cyan: '\u001b[36m',
      white: '\u001b[37m',
      reset: '\u001b[0m',
    };
  } else {
    // if not return an empty object
    return {
      blue: '',
      cyan: '',
      green: '',
      magenta: '',
      red: '',
      white: '',
      yellow: '',
      reset: '',
    } as Colors;
  }
}

const colors = getColorPalette();

function formatValue(value: Value): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string')
    return `${colors.yellow}'${value}'${colors.reset}`;
  if (typeof value === 'number')
    return `${colors.yellow}${value}${colors.reset}`;
  if (typeof value === 'boolean')
    return `${colors.magenta}${value}${colors.reset}`;
  if (value instanceof Error)
    return `${colors.red}${value.stack || value.message}${colors.reset}`;
  return JSON.stringify(value);
}

function formatParams(params: Params): string {
  return Object.entries(params)
    .map(([key, value]) =>
      [`${colors.green}${key}${colors.reset}=`, formatValue(value)].join(''),
    )
    .join(' ');
}

function formatLevel(level: string): string {
  switch (level) {
    case 'error':
      return `${colors.red}[${level.toLocaleUpperCase()}]${colors.reset}`;
    case 'warn':
      return `${colors.yellow}[${level.toLocaleUpperCase()}]${colors.reset}`;
    case 'log':
      return `${colors.green}[${level.toLocaleUpperCase()}]${colors.reset}`;
    case 'debug':
      return `${colors.cyan}[${level.toLocaleUpperCase()}]${colors.reset}`;
    default:
      return `[${level.toLocaleUpperCase()}]`;
  }
}

export function prettyFormatter(): Formatter {
  return (message) => {
    const timestamp = message.timestamp.toISOString();
    const level = formatLevel(message.level);
    const prefix = message.prefix.join('.');
    const params = formatParams(message.params);
    const formattedMessage = formatValue(message.message);
    return `${timestamp} ${level} ${prefix} ${params} ${formattedMessage}`;
  };
}
