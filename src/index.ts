import type { Diary, Reporter, LogLevels } from 'diary';

const to_reg_exp = (x: string) => new RegExp(x.replace(/\*/g, '.*') + '$');
let allows: RegExp[];

export const enable = (allows_query: string) => {
	allows = allows_query.split(/[\s,]+/).map(to_reg_exp);
};

if (__TARGET__ === 'node') enable(process.env.DEBUG || 'a^');

// ~ Logger

function logger(
	name: string,
	reporter: Reporter,
	level: LogLevels,
	...messages: unknown[]
): void {
	if (!allows) return;

	let len = allows.length;

	// is this "scope" allowed to log?
	while (len-- > 0 && allows[len].test(name))
		return reporter({ name, level, messages });
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
	const fn = console[event.level === 'fatal' ? 'error' : event.level];

	if (__TARGET__ === 'node') label = `${loglevel_strings[event.level]} `;
	if (event.name) label += `[${event.name}] `;

	if (__TARGET__ === 'node') {
		let message = '';
		const maybe_error = event.messages[0];

		if (maybe_error instanceof Error && typeof maybe_error.stack !== 'undefined') {
			const m = maybe_error.stack.split('\n'); m.shift();
			message = `${maybe_error.message}\n${m.join('\n')}`;
		} else {
			message = _FORMAT(...event.messages);
		}

		return void fn(label + message);
	}

	if (typeof event.messages[0] === 'object') {
		return void fn(label, ...event.messages);
	} else {
		const message = event.messages.shift();
		return void fn(label + message, ...event.messages);
	}
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
