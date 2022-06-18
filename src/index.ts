import type { Diary, Reporter, LogLevels, LogEvent } from 'diary';

const to_reg_exp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$');
let allows: RegExp[];

export const enable = (allows_query: string) => {
	allows = allows_query.split(/[\s,]+/).map(to_reg_exp);
};

// read `localstorage`/`env` for scope "name"s allowed to log
if (__TARGET__ !== 'worker') {
	enable(
		(__TARGET__ === 'node'
			? process.env.DEBUG
			: __TARGET__ === 'browser'
				? localStorage.getItem('DEBUG')
				: null
		) || 'a^',
	);
}

// ~ Logger

function logger(
	name: string,
	reporter: Reporter,
	level: LogLevels,
	message: Error | string,
	...extra: unknown[]
): void {
	if (!allows) return;

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

const loglevel_strings: Record<LogLevels, string> = /*#__PURE__*/ {
	fatal: '✗ fatal',
	error: '✗ error',
	warn: '‼ warn ',
	debug: '● debug',
	info: 'ℹ info ',
	log: '◆ log  ',
} as const;

export const default_reporter: Reporter = (event) => {
	let label = '';
	if (__TARGET__ === 'node') label = `${loglevel_strings[event.level]} `;
	if (event.name) label += `[${event.name}] `;

	if (__TARGET__ === 'node' && event.error instanceof Error && typeof event.error.stack !== 'undefined') {
		const m = event.error.stack.split('\n'); m.shift();
		event.message += "\n" + m.join('\n');
	}

	console[event.level === 'fatal' ? 'error' : event.level](label + event.message, ...event.extra);
};

// ~ Public api

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
