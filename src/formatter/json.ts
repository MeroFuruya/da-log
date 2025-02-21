import { Formatter } from '../index.js';

export function jsonFormatter(): Formatter {
  return (message) => JSON.stringify(message);
}
