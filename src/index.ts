type LogFunc = (message?: string | Error, ...args: unknown[]) => void;
type LogHook = (event: LogEvent) => LogEvent | void;
type LogVerbs = 'error' | 'warn' | 'debug' | 'info' | 'log';
type DiaryInstance = Record<LogVerbs, LogFunc>;
type VerbLevels = keyof typeof verb_levels;
type VerbLevelValues = typeof verb_levels[VerbLevels];

export interface LogEvent {
	name: string;
	level: LogVerbs;
	message: string | Error;
	extra: unknown[];
}

const is_node = typeof process < 'u' && typeof process.stdout < 'u';
const verb_levels = { f: 60, e: 50, w: 40, i: 30, d: 20, l: 10 } as const;
const levels_symbol: Record<VerbLevels, string> = { f: '✗', e: '✗', w: '‼', i: 'ℹ', d: '●', l: '◆' } as const;

const global_ident = {} as DiaryInstance;
const hooks = new WeakMap<DiaryInstance, LogHook[]>([
	[global_ident, []]
]);

let active_level: VerbLevelValues = verb_levels.l;

export const setLevel = (level: LogVerbs) => {
	active_level = verb_levels[level[0] as VerbLevels];
};

const toRegExp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$');

const logger = (name: string, hook_ref: any) => {
	// TODO: hoist this to global side effect? do once
	// read `localstorage`/`env` for scope "name"s allowed to log
	const allows: RegExp[] = ((is_node ? process.env.DEBUG : localStorage.getItem('DEBUG')) || '').split(/[\s,]+/).map(toRegExp);

	return (level: LogVerbs): LogFunc => (
		message,
		...extra
	) => {
		// Check if `setLevel` prohibits processing this
		if (!(verb_levels[level[0] as VerbLevels] >= active_level)) return;

		// Is this "scope" allowed to log?
		if (!allows.some(x => x.test(name))) return;

		let r: LogEvent = { name, level, message, extra };

		// Handle errors specially
		if (r.level === 'error' && message instanceof Error) {
			r.message = message.message;
			r.extra.unshift(message);
		}

		// Loop through all middlewares
		for (let hook of [].concat(hooks.get(hook_ref), hooks.get(global_ident))) {
			if (!(r = hook(r))) return;
		}

		// Output

		let label = '';
		const write_fn = console[r.level] || console.log;

		if (is_node) label = `${levels_symbol[r.level[0] as VerbLevels]} ${r.level.padEnd(6, ' ')}`;
		if (r.name) label += `[${r.name}] `;

		write_fn(`${label}${message}`, ...r.extra);
	}
};

export const middleware = (
	handler: LogHook,
	diary_instance: DiaryInstance = global_ident,
) => {
	hooks.get(diary_instance).push(handler);
};

export function diary(name: string): DiaryInstance {
	const fns: DiaryInstance = { } as DiaryInstance;
	const logger_for = logger(name, fns);

	fns.error = logger_for('error');
	fns.warn = logger_for('warn');
	fns.debug = logger_for('debug');
	fns.info = logger_for('info');
	fns.log = logger_for('log');

	hooks.set(fns, []);

	return fns;
}

const default_diary = diary('');

export const warn = default_diary.warn;
export const error = default_diary.error;
export const debug = default_diary.debug;
export const info = default_diary.info;
export const log = default_diary.log;
