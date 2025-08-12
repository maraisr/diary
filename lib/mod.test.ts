import { assertInstanceOf } from '@std/assert';
import { assertSpyCall, spy } from '@std/testing/mock';

import type { Level } from 'diary';
import * as lib from 'diary';

Deno.test('api', () => {
	assertInstanceOf(lib.diary, Function);

	let emit = spy<lib.OnEmitFn>();
	let log = lib.diary(emit);
	assertInstanceOf(log, Function);
	log('debug', 'hello');
	log('info', 'hello {name}', { name: 'world' });
	// @ts-expect-error - wrong type "name" should be "foo"
	log('debug', 'hello {name}', { foo: 'world' });
});

Deno.test('calls onEmit', () => {
	let emit = spy();
	let log = lib.diary(emit);
	log('info', 'hello', { name: 'world' });
	assertSpyCall(emit, 0, {
		args: ['info', 'hello', { name: 'world' }],
	});
});

Deno.test('calls onEmit for every log', () => {
	let emit = spy();
	let log = lib.diary(emit);
	log('debug', 'debug message');
	log('info', 'hello', { name: 'world' });
	log('debug', 'hello {phrase}', { phrase: 'world' });

	assertSpyCall(emit, 0, {
		args: ['debug', 'debug message'],
	});
	assertSpyCall(emit, 1, {
		args: ['info', 'hello', { name: 'world' }],
	});
	assertSpyCall(emit, 2, {
		args: ['debug', 'hello {phrase}', { phrase: 'world' }],
	});
});

Deno.test('calls with correct level', () => {
	let emit = spy();
	let log = lib.diary(emit);

	let i = 0;
	for (let level of ['log', 'debug', 'info', 'warn', 'error', 'fatal']) {
		log(level as Level, 'hello', { name: 'world' });
		assertSpyCall(emit, i++, {
			args: [level, 'hello', { name: 'world' }],
		});
	}
});

Deno.test('should allow anything as prop value', () => {
	class Test {}

	let t = new Test();

	let emit = spy();
	let log = lib.diary(emit);
	log('info', 'hello {phrase}', { phrase: t });

	assertSpyCall(emit, 0, {
		args: ['info', 'hello {phrase}', { phrase: t }],
	});
});
