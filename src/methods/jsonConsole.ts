/* eslint-disable no-console */
import type { LogMethod, Message } from 'src/index';

// Add polyfill methods to the console object
if (typeof console.log === 'function') {
  if (typeof console.debug !== 'function') {
    console.debug = console.log.bind(console);
  }
  if (typeof console.error !== 'function') {
    console.error = console.log.bind(console);
  }
  if (typeof console.info !== 'function') {
    console.info = console.log.bind(console);
  }
  if (typeof console.warn !== 'function') {
    console.warn = console.log.bind(console);
  }
}

export const JsonConsoleLogger: LogMethod = (message: Message) => {
  console.log(JSON.stringify(message));
};
