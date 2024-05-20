/// <reference lib="dom" />

import { diary as _diary, type LogEvent, type Reporter, type Diary } from './logger';

function reporter(event: LogEvent) {
	let label = '';
	const fn = console[event.level === 'fatal' ? 'error' : event.level];

	if (event.name) label += `[${event.name}] `;

	if (typeof event.messages[0] === 'object') {
		return void fn(label, ...event.messages);
	} else {
		const message = event.messages.shift();
		return void fn(label + message, ...event.messages);
	}
}

export const diary = (name: string, onEmit: Reporter = reporter): Diary => _diary(name, onEmit);

const { fatal, error, warn, debug, info, log } = diary('', reporter);
export { fatal, error, warn, debug, info, log };
export type { Diary, LogEvent, LogLevels, Reporter } from './logger';
export { enable } from './logger';