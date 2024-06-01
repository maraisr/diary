import type { LogEvent } from '../mod.ts';
import { diary } from '../stream.ts';
import { interpolate } from '../utils.ts';
import { log_journey } from './_journey.ts';

let log_file = await Deno.open('./log.log', {
	write: true,
	create: true,
	truncate: true,
});

let log_transform = new TransformStream<LogEvent, string>({
	transform([level, message, props = {}], controller) {
		controller.enqueue(`${Date.now()} [${level}] ${interpolate(message, props)}\n`);
	},
});

let log = diary((readable) => {
	let [a, b] = readable
		.pipeThrough(log_transform)
		.pipeThrough(new TextEncoderStream())
		.tee();

	a.pipeTo(log_file.writable);
	b.pipeTo(Deno.stdout.writable);
});

log_journey(log);
