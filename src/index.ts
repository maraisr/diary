type HookFn = (event: LogEvent) => void | false;
type HookPhases = { before: HookFn[], after: HookFn[] };
type MiddlewareFn = (handler: HookFn, context?: Diary)=> VoidFunction;
type LogFn = (message?: string, ...args: unknown[]) => void;
type LogFnAsError = (message?: string | Error, ...args: unknown[]) => void;
export type LogLevels = 'fatal' | 'error' | 'warn' | 'debug' | 'info' | 'log';
type ErrorLevels = Extract<LogLevels, 'fatal' | 'error'>;
export type Diary = Record<Exclude<LogLevels, ErrorLevels>, LogFn> & Record<ErrorLevels, LogFnAsError>;

type LogValues = typeof LEVELS[keyof typeof LEVELS];

export interface LogEvent {
	name: string;
	level: LogLevels;
	message: string;
	extra: unknown[];
	[other: string]: any;
}

const is_node = typeof process < 'u' && typeof process.stdout < 'u';

const LEVELS = { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, log: 10 } as const;

let active_level: LogValues = LEVELS.log;
export function setLevel(level: LogLevels): void {
	active_level = LEVELS[level];
}

// read `localstorage`/`env` for scope "name"s allowed to log
const toRegExp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$');
const allows: RegExp[] = ((is_node ? process.env.DEBUG : localStorage.getItem('DEBUG')) || '').split(/[\s,]+/).map(toRegExp);

const hooks = new WeakMap<Diary, HookPhases>(),
	default_diary = diary(''),
	global_hooks = hooks.get(default_diary);

function logger(
	c_hooks: HookPhases,
	name: string,
	level: LogLevels,
	symbol_label: string,
	message: Error | string,
	...extra: unknown[]
): void {
	// check if `setLevel` prohibits processing this
	if (LEVELS[level] < active_level) return;

	// is this "scope" allowed to log?
	for (let i = 0; i < allows.length; i++) if (allows[i].test(name)) break; else return;

	// handle errors specially
	if ((level === 'error' || level === 'fatal') && message instanceof Error) {
		extra.unshift(message);
		message = message.message;
	}

	// @ts-expect-error come on TypeScript, I've just `message` a string...
	let r: LogEvent = { name, level, message, extra };

	// loop through all middlewares
	let i = 0, j = 0, len = 0, arr, seq = [global_hooks.before, c_hooks.before, c_hooks.after, global_hooks.after];
	for (; i < seq.length; i++) {
		for (j = 0, arr = seq[i], len = arr.length; j < len;) {
			if (arr[j++](r) === false) return;
		}
	}

	// output
	let label = '';
	if (is_node) label = `${symbol_label} `;
	if (name) label += `[${name}] `;

	if (level === 'fatal') level = 'error'; // there is no `console.fatal`
	(console[level] || console.log)(`${label}${r.message}`, ...r.extra);
}

export function diary(name: string): Diary {
	const ctx = {} as Diary,
		_hooks: HookPhases = { before: [], after: [] };
	ctx.fatal = logger.bind(0, _hooks, name, 'fatal', '✗ fatal');
	ctx.error = logger.bind(0, _hooks, name, 'error', '✗ error');
	ctx.warn = logger.bind(0, _hooks, name, 'warn', '‼ warn ');
	ctx.debug = logger.bind(0, _hooks, name, 'debug', '● debug');
	ctx.info = logger.bind(0, _hooks, name, 'info', 'ℹ info ');
	ctx.log = logger.bind(0, _hooks, name, 'log', '◆ log  ');
	hooks.set(ctx, _hooks);
	return ctx;
}

const middleware = (
	phase: keyof HookPhases,
	handler: HookFn,
	ctx?: Diary,
) => {
	const _hooks = (ctx ? hooks.get(ctx) : global_hooks)[phase];
	return _hooks.splice.bind(_hooks, _hooks.push(handler) - 1, 1);
};

export const before:MiddlewareFn = middleware.bind(0, 'before');
export const after:MiddlewareFn = middleware.bind(0, 'after');

export const fatal = default_diary.fatal;
export const error = default_diary.error;
export const warn = default_diary.warn;
export const debug = default_diary.debug;
export const info = default_diary.info;
export const log = default_diary.log;
