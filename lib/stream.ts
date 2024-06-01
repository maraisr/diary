import * as lib from './mod.ts';

export function diary(
	cb: (r: ReadableStream<lib.LogEvent>) => any,
): lib.Diary {
	let stream = new TransformStream<lib.LogEvent, lib.LogEvent>();
	let writer = stream.writable.getWriter();
	cb(stream.readable);
	return lib.diary(
		function () {
			writer.write(Array.from(arguments) as lib.LogEvent);
		},
	);
}
