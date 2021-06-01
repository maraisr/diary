export type Reporter = (event: LogEvent) => void;

type LogFn = (message?: string, ...args: unknown[]) => void;
type LogFnAsError = (message?: string | Error, ...args: unknown[]) => void;

export type LogLevels = 'fatal' | 'error' | 'warn' | 'debug' | 'info' | 'log';
type ErrorLevels = Extract<LogLevels, 'fatal' | 'error'>;

export type Diary = Record<Exclude<LogLevels, ErrorLevels>, LogFn> & Record<ErrorLevels, LogFnAsError>;

type LogEventBase = {
	name: string;
	level: LogLevels;

	message: string;
	extra: unknown[];
	error: never;

	[other: string]: any;
}

export type LogEvent =
	| { level: 'error', error: Error } & Omit<LogEventBase, 'error'>
	| { level: 'fatal', error: Error } & Omit<LogEventBase, 'error'>
	| LogEventBase;

const is_node = typeof process < 'u' && typeof process.stdout < 'u';

const to_reg_exp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$');
let allows: RegExp[];

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

// read `localstorage`/`env` for scope "name"s allowed to log
enable((is_node ? process.env.DEBUG : localStorage.getItem('DEBUG')) || 'a^');

// ~ Logger

function logger(
	name: string,
	reporter: Reporter,
	level: LogLevels,
	message: Error | string,
	...extra: unknown[]
): void {
	let len = allows.length;

	// is this "scope" allowed to log?
	while (len-- > 0) {
		if (allows[len].test(name)) {
			const log_event = {
				name, level, extra,
				message: message as string,
			} as LogEvent;

			if ((level === 'error' || level === 'fatal') && message instanceof Error) {
				log_event.error = message;
				log_event.message = message.message;
			}

			return reporter(log_event);
		}
	}
}

// ~ Reporter

const loglevel_strings: Record<LogLevels, string> = {
	fatal: '✗ fatal',
	error: '✗ error',
	warn: '‼ warn ',
	debug: '● debug',
	info: 'ℹ info ',
	log: '◆ log  ',
} as const;

const default_reporter: Reporter = (event) => {
	let label = '';
	if (is_node) label = `${loglevel_strings[event.level]} `;
	if (event.name) label += `[${event.name}] `;

	console[event.level === 'fatal' ? 'error' : event.level](label + event.message, ...event.extra);
};

// ~ Public api

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
 * @param name A name to give this diary instance this can be unique to your application, or not. When logged, it'll
 *     exist after the level string, eg: `ℹ info [my-fancy-app] app has started`
 * @param onEmit The reporter that handles the output of the log messages
 */
export function diary(name: string, onEmit?: Reporter): Diary {
	onEmit = onEmit || default_reporter;

	return {
		fatal: logger.bind(0, name, onEmit, 'fatal'),
		error: logger.bind(0, name, onEmit, 'error'),
		warn: logger.bind(0, name, onEmit, 'warn'),
		debug: logger.bind(0, name, onEmit, 'debug'),
		info: logger.bind(0, name, onEmit, 'info'),
		log: logger.bind(0, name, onEmit, 'log'),
	};
}

const default_diary = diary('');

export const fatal = default_diary.fatal;
export const error = default_diary.error;
export const warn = default_diary.warn;
export const debug = default_diary.debug;
export const info = default_diary.info;
export const log = default_diary.log;
export const defaultReporter = default_reporter;