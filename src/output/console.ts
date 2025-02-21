/* eslint-disable no-console */
import type { Output } from '../index.js';

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

function _console(): Output {
  return (message, formatter) => {
    let method;
    switch (message.level) {
      case 'error':
        method = console.error;
        break;
      case 'warn':
        method = console.warn;
        break;
      case 'log':
        method = console.log;
        break;
      case 'debug':
        method = console.debug;
        break;
      case 'info':
        method = console.info;
        break;
      default:
        method = console.log;
    }

    method(formatter(message));
  };
}

export { _console as console, _console as consoleOutput };
