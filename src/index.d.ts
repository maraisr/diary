export type Reporter = (event: LogEvent) => void;

interface LogFn {
    <T extends object>(message: T, ...args: unknown[]): void;
    <T extends Error>(message: T, ...args: unknown[]): void;
    (message: unknown, ...args: unknown[]): void;
    (message: string, ...args: unknown[]): void;
}

export type LogLevels = 'fatal' | 'error' | 'warn' | 'debug' | 'info' | 'log';

export type Diary = Record<LogLevels, LogFn>

export interface LogEvent {
    name: string;
    level: LogLevels;

    messages: unknown[];

    [other: string]: any;
}

/**
 * Creates a new diary logging instance.
 *
 * @example
 * ```ts
 * import { diary } from 'diary';
 *
 * const log = diary('my-fancy-app');
 *
 * log.info('app has started');
 * ```
 *
 * @param name A name to give this diary instance this can be unique to your application, or not.
 *     When logged, it'll exist after the level string, eg: `ℹ info [my-fancy-app] app has started`
 * @param onEmit The reporter that handles the output of the log messages
 */
export const diary: (name: string, onEmit?: Reporter) => Diary;

/**
 * Configure what logs to emit. Follows the colon delimited scheme.
 *
 * @example
 * ```ts
 * import { diary, enable } from 'diary';
 *
 * enable('scope:A');
 *
 * const scopeA = diary('scope:A');
 * const scopeB = diary('scope:B');
 *
 * scopeA.log('foo bar'); // => 'foo bar'
 * scopeB.log('foo bar'); // => na
 *
 * enable('scope:*');
 *
 * scopeA.log('foo bar'); // => 'foo bar'
 * scopeB.log('foo bar'); // => 'foo bar'
 * ```
 */
export const enable: (allows_query: string) => void;

export const default_reporter: Reporter;

export const fatal: LogFn;
export const error: LogFn;
export const warn: LogFn;
export const debug: LogFn;
export const info: LogFn;
export const log: LogFn;
