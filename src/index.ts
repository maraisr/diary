type LogHook = (event: LogEvent) => LogEvent | void;
type LogFunc = (message?: LogMessage, ...args: unknown[]) => void;
export type LogLevels = 'fatal' | 'error' | 'warn' | 'debug' | 'info' | 'log';
type DiaryInstance = Record<LogLevels, LogFunc>;
type LogMessage = Error | string;

type LogValues = typeof LEVELS[keyof typeof LEVELS];

export interface LogEvent {
	name: string;
	level: LogLevels;
	message: string | Error;
	extra: unknown[];
}

const is_node = typeof process < 'u' && typeof process.stdout < 'u';

const global_ident = {} as DiaryInstance;
const hooks = new WeakMap<DiaryInstance, LogHook[]>([
	[global_ident, []]
]);

const LEVELS = { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, log: 10 } as const;

let active_level: LogValues = LEVELS.log;
export const setLevel = (level: LogLevels) => {
	active_level = LEVELS[level];
};

// read `localstorage`/`env` for scope "name"s allowed to log
const toRegExp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$');
const allows: RegExp[] = ((is_node ? process.env.DEBUG : localStorage.getItem('DEBUG')) || '').split(/[\s,]+/).map(toRegExp);

function logger(
	ctx: DiaryInstance,
	name: string,
	level: LogLevels,
	symbol: string,
	message: LogMessage,
	...extra: unknown[]
): void {
	// Check if `setLevel` prohibits processing this
	if (LEVELS[level] < active_level) return;

	// Is this "scope" allowed to log?
	if (!allows.some(x => x.test(name))) return;

	let r: LogEvent = { name, level, message, extra };

	// Handle errors specially
	if ((r.level === 'error' || r.level === 'fatal') && message instanceof Error) {
		r.message = message.message;
		r.extra.unshift(message);
	}

	// Loop through all middlewares
	for (let hook of [].concat(hooks.get(ctx), hooks.get(global_ident))) {
		if (hook(r) === false) return;
	}

	// Output
	let label = '';
	if (is_node) label = `${symbol} ${level.padEnd(6, ' ')}`;
	if (name) label += `[${name}] `;

	if (level === 'fatal') level = 'error';
	(console[level] || console.log)(`${label}${message}`, ...r.extra);
}

export const middleware = (
	handler: LogHook,
	diary_instance: DiaryInstance = global_ident,
) => {
	hooks.get(diary_instance).push(handler);
};

export function diary(name: string): DiaryInstance {
	const ctx = {} as DiaryInstance;
	ctx.fatal = logger.bind(0, ctx, name, 'fatal', '✗');
	ctx.error = logger.bind(0, ctx, name, 'error', '✗');
	ctx.warn = logger.bind(0, ctx, name, 'warn', '‼');
	ctx.debug = logger.bind(0, ctx, name, 'debug', '●');
	ctx.info = logger.bind(0, ctx, name, 'info', 'ℹ');
	ctx.log = logger.bind(0, ctx, name, 'log', '◆');
	hooks.set(ctx, []);
	return ctx;
}

const default_diary = diary('');

export const fatal = default_diary.fatal;
export const error = default_diary.error;
export const warn = default_diary.warn;
export const debug = default_diary.debug;
export const info = default_diary.info;
export const log = default_diary.log;
