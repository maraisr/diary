/// <reference types="node" />

import { format } from 'node:util'

import { enable, diary as _diary, type LogEvent, type Diary, Reporter } from './logger';
import * as LEVELS from './levels';

enable(process.env.DEBUG || 'a^');

function reporter(event: LogEvent) {
	let label = `${LEVELS[event.level]} `;
	const fn = console[event.level === 'fatal' ? 'error' : event.level];

	if (event.name) label += `[${event.name}] `;

	let message: string;
	const maybe_error = event.messages[0];

	if (
		maybe_error instanceof Error &&
		typeof maybe_error.stack !== 'undefined'
	) {
		const m = maybe_error.stack.split('\n');
		m.shift();
		message = `${maybe_error.message}\n${m.join('\n')}`;
	} else {
		message = format(...event.messages);
	}

	return void fn(label + message);
}

export const diary = (name: string, onEmit: Reporter = reporter): Diary => _diary(name, onEmit);

const { fatal, error, warn, debug, info, log } = diary('', reporter);
export { fatal, error, warn, debug, info, log };
export type { Diary, LogEvent, LogLevels, Reporter } from './logger';
export { enable } from './logger';
