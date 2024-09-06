import type { Dict, Pretty, Props } from './utils.ts';

/**
 * TODO
 *
 * @module
 */

/**
 * The level to tag a log event with.
 *
 * Logging levels are a cornerstone of any logging system, they help declare importance of a log message.
 * Diary therefore treats this piece of metadata as a first-class citizen, however does not do anything special with them — and is forwarded directly to your {@link OnEmitFn}.
 *
 * A quick rundown of the levels:
 *
 * - `log` — is the default level, it is used for general logging.
 * - `debug` — is typically used during the debugging phase, and may not be present in production.
 * - `info` — is often used to represent a significant event in the system, like a user login.
 * - `warn` — is used to represent a potential problem in the system, like memory cache eviction shorter than its TTL.
 * - `error` — is used to represent a problem in the system, like a failure to cache something.
 * - `fatal` — is used to represent a catastrophic failure in the system, like a failure to connect to the database.
 */
export type Level = 'log' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * A representing container for a log event entry.
 *
 * Every {@link diary} logged event will be represented as a tuple, taking the shape of:
 *
 * ```ts
 * [level: Level, message: string, attributes?: Dict]
 * ```
 *
 * it has the intended design to be destructured for further consumption.
 *
 * @example Usage
 *
 * ```ts
 * const [level, message, attributes] = log_event;
 * if (level === 'fatal') exit(1);
 * stdout.write(`${message} ${JSON.stringify(attributes)}`);
 * ```
 */
export type LogEvent = Parameters<OnEmitFn>;

export interface OnEmitFn {
	(level: Level, message: string, props?: Dict | undefined): any;
}

export interface Diary<Ctx = unknown> {
	<const T extends string, Params extends Pretty<Omit<Props<T>, keyof Ctx>>>(
		level: Level,
		template: T,
		...args: keyof Params extends never ? [] : Params extends object ? [properties: Params] : []
	): void;
}

export function diary(onEmit: OnEmitFn): Diary<unknown> {
	return onEmit;
}
