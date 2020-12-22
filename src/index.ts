import { bgRed, white } from 'kleur';

type LogFunc = (message?: string | Error, ...args: unknown[]) => void;
type LogHook = (event: LogEvent) => LogEvent | void;
type LogVerbs = 'fatal' | 'error' | 'warn' | 'debug' | 'info' | 'trace';
type DiaryInstance = ReturnType<typeof diary>;

export type LogEvent = {
	name: string;
	level: LogVerbs;
	message: string | Error;
	extra: unknown[];
};

const hooks = new WeakMap();

const verb_levels = { f: 60, e: 50, w: 40, i: 30, d: 20, t: 10 } as const;

const logger = (name: string, hook_ref: any) => (level: LogVerbs): LogFunc => (
	message,
	...extra
) => {
	let hook: LogHook,
		r: LogEvent | void = { name, level, message, extra };
	for (hook of hooks.get(hook_ref)) if (!(r = hook(r))) break;
};

export const middleware = (
	handler: LogHook,
	diary_instance: ReturnType<typeof diary> = log,
) => {
	let c_stack: any[] = hooks.get(diary_instance);
	if (!c_stack) (c_stack = []), hooks.set(diary_instance, c_stack);
	c_stack.unshift(handler);
};

export function diary(name: string = ''): Record<LogVerbs, LogFunc> {
	const fns: DiaryInstance = {};
	const logger_for = logger(name, fns);

	fns.fatal = logger_for('fatal');
	fns.error = logger_for('error');
	fns.warn = logger_for('warn');
	fns.debug = logger_for('debug');
	fns.info = logger_for('info');
	fns.trace = logger_for('trace');

	middleware((event) => {
		const name_str = name.length > 0 ? ` ${name} ` : '';
		let message = '',
			label = event.level as string,
			write_fn = console.log;

		switch (event.level) {
			case 'error':
			case 'fatal': {
				message =
					event.message instanceof Error
						? event.message.message
						: event.message;
				label = bgRed(white(` ${event.level} `));
			}
			default:
				write_fn(`[ ${label}${name_str} ] ${message}`, ...event.extra);
		}

		return;
	}, fns);

	return fns;
}

export const log = diary();

export const fatal = log.fatal.bind(log);
export const error = log.error.bind(log);
export const warn = log.warn.bind(log);
export const debug = log.debug.bind(log);
export const info = log.info.bind(log);
export const trace = log.trace.bind(log);
