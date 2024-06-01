import { assertInstanceOf } from '@std/assert';
import * as lib from './using.ts';
import { assertSpyCall, spy } from '@std/testing/mock';
import { delay } from '@std/async';

Deno.test('api', () => {
	assertInstanceOf(lib.diary, Function);
});

Deno.test('calls onEmit', () => {
	let emit = spy();

	{
		using log = lib.diary(emit);
		log('info', 'hello {name}', { name: 'world' });
		log('debug', 'hello {name}', { name: 'world' });
	}

	assertSpyCall(emit, 0, {
		args: [
			[
				['info', 'hello {name}', { name: 'world' }],
				['debug', 'hello {name}', { name: 'world' }],
			],
		],
	});
});

Deno.test('allows async disposal', async () => {
	let emit = spy(() => delay(1));

	{
		await using log = lib.diary(emit);
		log('info', 'hello {name}', { name: 'world' });
		log('debug', 'hello {name}', { name: 'world' });
	}

	assertSpyCall(emit, 0, {
		args: [
			[
				['info', 'hello {name}', { name: 'world' }],
				['debug', 'hello {name}', { name: 'world' }],
			],
		],
	});
});
