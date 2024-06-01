import { assertInstanceOf } from '@std/assert';
import { assertSpyCall, stub } from '@std/testing/mock';

import * as lib from './output.console.ts';

Deno.test('api', () => {
	assertInstanceOf(lib.browser, Function);
	assertInstanceOf(lib.plain, Function);
	assertInstanceOf(lib.pretty, Function);
});

Deno.test('browser :: interpolates values', () => {
	let log = stub(console, 'log');
	lib.browser('log', 'hello {phrase}', { phrase: 'world' });

	assertSpyCall(log, 0, {
		args: ['hello %o', 'world'],
	});

	log.restore();
});

Deno.test('browser :: calls console.log', () => {
	let log = stub(console, 'log');
	lib.browser('log', 'hello', { name: 'world' });
	assertSpyCall(log, 0, {
		args: ['hello'],
	});

	log.restore();
});

Deno.test('browser :: see the value as an argument', () => {
	class T {}
	let t = new T();
	let log = stub(console, 'log');
	lib.browser('log', 'hello {T}', { T: t });
	assertSpyCall(log, 0, {
		args: ['hello %o', t],
	});

	log.restore();
});

Deno.test('browser :: ignores unused values', () => {
	let log = stub(console, 'log');
	lib.browser('log', 'log {phrase}', { phrase: 'world', foo: 'bar' });
	assertSpyCall(log, 0, {
		args: ['log %o', 'world'],
	});

	log.restore();
});

Deno.test('browser :: if no props given still log', () => {
	let log = stub(console, 'log');
	lib.browser('log', 'hello');
	assertSpyCall(log, 0, {
		args: ['hello'],
	});

	log.restore();
});

Deno.test('plain :: includes level', () => {
	let log = stub(console, 'log');
	lib.plain('log', 'log {phrase}', { phrase: 'world' });
	assertSpyCall(log, 0, {
		args: ['◆ log   log %o', 'world'],
	});

	log.restore();
});
