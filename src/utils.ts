import type { LogLevels } from './logger';

export const sprintf = (message: string, ...extra: unknown[]) =>
	message.replace(/(\s+)(%[Oodifs](?=[^a-z0-9A-Z]|$))/g, (_, ws, pattern) => {
		let v = extra.shift() as string | undefined;

		if (/[Oo]/.test(pattern) && typeof v === 'object') v = JSON.stringify(v);
		else if (/[di]/.test(pattern) && v) v = v.toString().replace(/\..*$/, '');

		return ws + v;
	});

const LEVELS: Record<LogLevels, number> = { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, log: 10 } as const;

/**
 * Returns if a log level is than its comparitor.
 *
 * @example
 *
 * ```js
 * compare("error", "fatal") === -1;
 * // Thus error is "less-than" fatal.
 * ```
 *
 * @param input the level youre trying to test
 * @param target the level youre wanting to compare too
 */
export const compare = (log_level: LogLevels, input: LogLevels) => {
	if (!(input in LEVELS) || !(log_level in LEVELS)) return 0;

	return LEVELS[input] === LEVELS[log_level]
		? 0
		: LEVELS[input] < LEVELS[log_level]
			? 1
			: -1;
};
