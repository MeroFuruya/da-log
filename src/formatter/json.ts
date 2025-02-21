import { Formatter } from '../index.js';

export function json(): Formatter {
  return (message) => JSON.stringify(message);
}
export const jsonFormatter = json;
