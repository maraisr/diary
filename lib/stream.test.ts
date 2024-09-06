import { assertEquals, assertInstanceOf } from '@std/assert';
import { delay } from '@std/async';

import * as stream from './stream.ts';
import * as lib from 'diary';

Deno.test('api', () => {
	assertInstanceOf(lib.diary, Function);
});

Deno.test('streams', async () => {
	let events: lib.LogEvent[] = [];
	let log = stream.diary(async (stream) => {
		assertInstanceOf(stream, ReadableStream);
		for await (let event of stream) events.push(event);
	});

	log('info', 'hello', { name: 'world' });
	log('debug', 'hello', { name: 'world' });

	await delay(1);

	assertEquals(events, [
		['info', 'hello', { name: 'world' }],
		['debug', 'hello', { name: 'world' }],
	]);
});
