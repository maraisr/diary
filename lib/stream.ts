import * as lib from "diary";

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
