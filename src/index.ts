type LogHook = (event: LogEvent) => void | false;
type LogFunc = (message?: string, ...args: unknown[]) => void;
type LogFuncWithError = (message?: string | Error, ...args: unknown[]) => void;
export type LogLevels = 'fatal' | 'error' | 'warn' | 'debug' | 'info' | 'log';
type ErrorLevels = Extract<LogLevels, 'fatal' | 'error'>;
export type Diary = Record<Exclude<LogLevels, ErrorLevels>, LogFunc> & Record<ErrorLevels, LogFuncWithError>;

type LogValues = typeof LEVELS[keyof typeof LEVELS];

export interface LogEvent {
	name: string;
	level: LogLevels;
	message: string;
	extra: unknown[];
}

const is_node = typeof process < 'u' && typeof process.stdout < 'u';

const hooks = new WeakMap<Diary, LogHook[]>();

const LEVELS = { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, log: 10 } as const;

let active_level: LogValues = LEVELS.log;
export const setLevel = (level: LogLevels) => {
	active_level = LEVELS[level];
};

// read `localstorage`/`env` for scope "name"s allowed to log
const toRegExp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$');
const allows: RegExp[] = ((is_node ? process.env.DEBUG : localStorage.getItem('DEBUG')) || '').split(/[\s,]+/).map(toRegExp);

const default_diary = diary('');

function logger(
	ctx: Diary,
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
	let _hooks = hooks.get(ctx);
	for (let i = 0; i < _hooks.length; i++) if (_hooks[i](r) === false) return;
	_hooks = hooks.get(default_diary);
	for (let i = 0; i < _hooks.length; i++) if (_hooks[i](r) === false) return;

	// output
	let label = '';
	if (is_node) label = `${symbol_label} `;
	if (name) label += `[${name}] `;

	if (level === 'fatal') level = 'error'; // there is no `console.fatal`
	(console[level] || console.log)(`${label}${r.message}`, ...r.extra);
}

export const middleware = (
	handler: LogHook,
	ctx: Diary = default_diary,
): VoidFunction => {
	const _hooks = hooks.get(ctx);
	return _hooks.splice.bind(_hooks, _hooks.push(handler) - 1, 1);
};

export function diary(name: string): Diary {
	const ctx = {} as Diary;
	ctx.fatal = logger.bind(0, ctx, name, 'fatal', '✗ fatal');
	ctx.error = logger.bind(0, ctx, name, 'error', '✗ error');
	ctx.warn = logger.bind(0, ctx, name, 'warn', '‼ warn ');
	ctx.debug = logger.bind(0, ctx, name, 'debug', '● debug');
	ctx.info = logger.bind(0, ctx, name, 'info', 'ℹ info ');
	ctx.log = logger.bind(0, ctx, name, 'log', '◆ log  ');
	hooks.set(ctx, []);
	return ctx;
}

export const fatal = default_diary.fatal;
export const error = default_diary.error;
export const warn = default_diary.warn;
export const debug = default_diary.debug;
export const info = default_diary.info;
export const log = default_diary.log;
