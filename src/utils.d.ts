import type { LogLevels } from 'diary';

export const sprintf = (message: string, ...extra: unknown[]) => string;

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
export const compare = (input: LogLevels, target: LogLevels) => boolean;
