export type Reporter = (event: LogEvent) => void;

interface LogFn {
    <T extends object>(message: T, ...args: unknown[]): void;
    <T extends Error>(message: T, ...args: unknown[]): void;
    (message: unknown, ...args: unknown[]): void;
    (message: string, ...args: unknown[]): void;
}

export type LogLevels = 'fatal' | 'error' | 'warn' | 'debug' | 'info' | 'log';

export interface LogEvent {
    name: string;
    level: LogLevels;

    messages: unknown[];

    [other: string]: any;
}

let allows: RegExp[] = [];

const to_reg_exp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$');

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
export const enable = (allows_query: string) => {
	allows = allows_query.split(/[\s,]+/).map(to_reg_exp);
};

const logger = (
	name: string,
	reporter: Reporter,
	level: LogLevels,
	...messages: unknown[]
): void => {
	for (let len = allows.length; len--;)
		if (allows[len].test(name)) return reporter({ name, level, messages });
};

export type Diary = Record<LogLevels, LogFn>;

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
export const diary = (name: string, onEmit?: Reporter): Diary => {
    return {
		fatal: logger.bind(0, name, onEmit, 'fatal'),
		error: logger.bind(0, name, onEmit, 'error'),
		warn: logger.bind(0, name, onEmit, 'warn'),
		debug: logger.bind(0, name, onEmit, 'debug'),
		info: logger.bind(0, name, onEmit, 'info'),
		log: logger.bind(0, name, onEmit, 'log'),
	};
};