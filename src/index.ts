type DisposeFn = () => void;

type HookFn = (event: LogEvent) => void | false;
type HookPhases = { before: HookFn[], after: HookFn[] };
type MiddlewareFn = (handler: HookFn, context?: Diary) => DisposeFn;
export type Reporter = (event: LogEvent) => void;

type LogFn = (message?: string, ...args: unknown[]) => void;
type LogFnAsError = (message?: string | Error, ...args: unknown[]) => void;

export type LogLevels = 'fatal' | 'error' | 'warn' | 'debug' | 'info' | 'log';
type ErrorLevels = Extract<LogLevels, 'fatal' | 'error'>;

export type Diary = Record<Exclude<LogLevels, ErrorLevels>, LogFn> & Record<ErrorLevels, LogFnAsError>;

export interface LogEvent {
	name: string;
	level: LogLevels;

	message: string;
	extra: unknown[];

	[other: string]: any;
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
	let label = '', { level, name } = event;
	if (is_node) label = `${loglevel_strings[level]} `;
	if (name) label += `[${name}] `;

	if (level === 'fatal') level = 'error'; // there is no `console.fatal`
	(console[level] || console.log)(`${label}${event.message}`, ...event.extra);
};

const is_node = typeof process < 'u' && typeof process.stdout < 'u';

// read `localstorage`/`env` for scope "name"s allowed to log
const to_reg_exp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$');
let allows: RegExp[];
const hooks = new WeakMap<Diary, HookPhases>(),
	default_diary = diary(''),
	global_hooks = hooks.get(default_diary);

/**
 * TODO!!
 */
export const enable = (allows_query: string) => {
	allows = allows_query.split(/[\s,]+/).map(to_reg_exp);
};

enable((is_node ? process.env.DEBUG : localStorage.getItem('DEBUG')) || 'a^');

// ~ Logger

function logger(
	c_hooks: HookPhases,
	name: string,
	reporter: Reporter,
	level: LogLevels,
	message: Error | string,
	...extra: unknown[]
): void {
	// is this "scope" allowed to log?
	if (!allows.length) return;
	let i = 0;
	for (; i < allows.length; i++) if (allows[i].test(name)) break; else return;

	// handle errors specially
	if ((level === 'error' || level === 'fatal') && message instanceof Error) {
		extra.unshift(message);
		message = message.message;
	}

	let r: LogEvent = { name, level, message: message as string, extra };

	// pipe through middleware
	let j = 0, len = 0, arr, seq = [global_hooks.before, c_hooks.before, c_hooks.after, global_hooks.after];
	for (i = 0; i < seq.length; i++)
		for (j = 0, arr = seq[i], len = arr.length; j < len;)
			if (arr[j++](r) === false) return;

	// output
	reporter(r);
}

// ~ Public api

/**
 * Creates a new diary logging instance.
 *
 * Note: Giving this the same name as a previous diary instance will not inherit it's middleware.
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
 */
export function diary(name: string, onEmit?: Reporter): Diary {
	const ctx = {} as Diary,
		_hooks: HookPhases = { before: [], after: [] };
	onEmit = onEmit || default_reporter;

	ctx.fatal = logger.bind(0, _hooks, name, onEmit, 'fatal');
	ctx.error = logger.bind(0, _hooks, name, onEmit, 'error');
	ctx.warn = logger.bind(0, _hooks, name, onEmit, 'warn');
	ctx.debug = logger.bind(0, _hooks, name, onEmit, 'debug');
	ctx.info = logger.bind(0, _hooks, name, onEmit, 'info');
	ctx.log = logger.bind(0, _hooks, name, onEmit, 'log');
	hooks.set(ctx, _hooks);
	return ctx;
}

const middleware = (
	phase: keyof HookPhases,
	handler: HookFn,
	context?: Diary,
) => {
	const _hooks = (context ? hooks.get(context) : global_hooks)[phase];
	return _hooks.splice.bind(_hooks, _hooks.push(handler) - 1, 1);
};

/**
 * Middleware that's run's during the _before_ phase of middleware. When **NOT** passing the optional 2nd param
 * `context`, this middleware will be added to the _global_ stack, and ran before _all_ diaries.
 *
 * Middleware are ran with this sequence:
 * global before -> diary before -> diary after -> global after
 *
 * @example
 * ```ts
 * import { diary, info, before } from 'diary';
 *
 * const log = diary('scoped');
 * before(event => {
 *    event.context = {
 *        domainName: 'diary.com'
 *    };
 * });
 * before(event => {
 *     event.context.scopedValue = '✨';
 * }, log);
 *
 * info('info message'); // will have the context, but no sparkles.
 * log.info('second info message'); // will have the context as well as the sparkles.
 * ```
 *
 * @returns DisposeFn disposing this middleware from running any further.
 */
export const before: MiddlewareFn = middleware.bind(0, 'before');
/**
 * Middleware that's run's during the _after_ phase of middleware. When **NOT** passing the optional 2nd param
 * `context`, this middleware will be added to the _global_ stack, and ran after _all_ diaries.
 *
 * Middleware are ran with this sequence:
 * global before -> diary before -> diary after -> global after
 *
 * @example
 * ```ts
 * import { diary, info, after } from 'diary';
 *
 * const log = diary('scoped');
 * after(event => {
 *    fetch('/api/logger', {
 *        method: 'POST',
 *        body: JSON.stringify(event);
 *    });
 * });
 * after(event => {
 *    // Assuming you have the {@link before} defined above.
 *    event.message = `${event.context.domain} ${event.message}`;
 * }, log);
 *
 * info('info message'); // will just post
 * log.info('second info message'); // will post after the message was  altered.
 * ```
 *
 * @returns DisposeFn disposing this middleware from running any further.
 */
export const after: MiddlewareFn = middleware.bind(0, 'after');

export const fatal = default_diary.fatal;
export const error = default_diary.error;
export const warn = default_diary.warn;
export const debug = default_diary.debug;
export const info = default_diary.info;
export const log = default_diary.log;
