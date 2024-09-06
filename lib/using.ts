import * as lib from 'diary';

export interface Diary extends lib.Diary {
	[Symbol.dispose](): void;
}

export function diary(flush: (events: lib.LogEvent[]) => any): Diary {
	const events: lib.LogEvent[] = [];

	let log = lib.diary(
		function () {
			events.push(Array.from(arguments) as lib.LogEvent);
		},
	) as Diary;
	log[Symbol.dispose] = function () {
		return flush(events);
	};

	return log;
}
