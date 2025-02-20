import { describe, expect, it, jest } from '@jest/globals';
import { createLogger, setOutputs } from '../src';

describe('logger', () => {
  it('should create', () => {
    const logger = createLogger();
    expect(logger).toBeDefined();
  });

  it('should set a logger', () => {
    const output = () => {};
    expect(() => setOutputs(output)).not.toThrow();
  });

  it('should set multiple loggers', () => {
    const output = () => {};
    expect(() => setOutputs([output, output])).not.toThrow();
  });

  it('should log', () => {
    const output = jest.fn();
    setOutputs(output);
    const logger = createLogger();
    logger.log('test');
    expect(output).toHaveBeenCalled();
  });

  it('should log error', () => {
    const output = jest.fn();
    setOutputs(output);
    const logger = createLogger();
    logger.error('test');
    expect(output).toHaveBeenCalled();
  });

  it('should log warn', () => {
    const output = jest.fn();
    setOutputs(output);
    const logger = createLogger();
    logger.warn('test');
    expect(output).toHaveBeenCalled();
  });

  it('should log debug', () => {
    const output = jest.fn();
    setOutputs(output);
    const logger = createLogger();
    logger.debug('test');
    expect(output).toHaveBeenCalled();
  });

  it('should log with prefix', () => {
    const output = jest.fn();
    setOutputs(output);
    const logger = createLogger().prefix('test');
    logger.log('test');
    expect(output).toHaveBeenCalled();
  });

  it('should log with params', () => {
    const output = jest.fn();
    setOutputs(output);
    const logger = createLogger().param('test', 'test');
    logger.log('test');
    expect(output).toHaveBeenCalled();
  });

  it('should log with prefix and params', () => {
    const output = jest.fn();
    setOutputs(output);
    const logger = createLogger().prefix('test').param('test', 'test');
    logger.log('test');
    expect(output).toHaveBeenCalled();
  });

  it('should log with multiple loggers', () => {
    const output = jest.fn();
    const output2 = jest.fn();
    setOutputs([output, output2]);
    const logger = createLogger();
    logger.log('test');
    expect(output).toHaveBeenCalled();
    expect(output2).toHaveBeenCalled();
  });
});
