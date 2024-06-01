import { assertEquals } from '@std/assert';
import * as lib from './utils.ts';

Deno.test('api', () => {
	assertEquals(lib.interpolate('hello {name}', { name: 'world' }), 'hello world');
	// @ts-expect-error - wrong type "name" should be "foo"
	assertEquals(lib.interpolate('hello {name}', { foo: 'world' }), 'hello undefined');
});

Deno.test('the same key twice', () => {
	let s = lib.interpolate('hello {name} {name}', { name: 'world' });
	assertEquals(s, 'hello world world');
});

Deno.test('allows more than one value', () => {
	let s = lib.interpolate('hello {name}', { name: 'world', foo: 'bar' });
	assertEquals(s, 'hello world');
});

Deno.test('allows brackets to wrap a value', () => {
	let s = lib.interpolate('hello {name}', { name: '{world}' });
	assertEquals(s, 'hello {world}');
});

Deno.test('with a lot of replacements', () => {
	let s = lib.interpolate('hello {name} {name} {name} {name}', { name: 'world' });
	assertEquals(s, 'hello world world world world');
});

Deno.test('should allow spaces in the keys', () => {
	let s = lib.interpolate('hello {first name}', { 'first name': 'world' });
	assertEquals(s, 'hello world');
});

Deno.test('should allow multiple keys', () => {
	let s = lib.interpolate('a {phrase} b {name} c {phrase} d', { phrase: 'hello', name: 'world' });
	assertEquals(s, 'a hello b world c hello d');
});

// TODO: Maybe this should just "pick the next key??"
Deno.test('should allow zero-width keys to mean empty string', () => {
	let s = lib.interpolate('{name} {}', { name: 'world', '': 'test' });
	assertEquals(s, 'world test');
});

Deno.test('interpolates empty string', () => {
	assertEquals(lib.interpolate('', { name: 'world' }), '');
});

Deno.test('interpolates array as the value', () => {
	let s = lib.interpolate('{0} {1}', ['hello', 123]);
	assertEquals(s, 'hello 123');
});

Deno.test('interpolates with no matching keys', () => {
	// @ts-expect-error the key wont exist, that is the point
	assertEquals(lib.interpolate('hello {name}', { foo: 'bar' }), 'hello undefined');
});

Deno.test('interpolates with null values', () => {
	assertEquals(lib.interpolate('hello {name}', { name: null }), 'hello null');
});

Deno.test('interpolates with undefined values', () => {
	assertEquals(lib.interpolate('hello {name}', { name: undefined }), 'hello undefined');
});

Deno.test('interpolates with numeric values', () => {
	assertEquals(lib.interpolate('hello {name}', { name: 123 }), 'hello 123');
});

Deno.test('interpolates with boolean values', () => {
	assertEquals(lib.interpolate('hello {name}', { name: true }), 'hello true');
});

Deno.test('allows custom seralizer', () => {
	assertEquals(
		lib.interpolate('hello {name}', { name: 'world' }, (v) => v?.toUpperCase() ?? '?'),
		'hello WORLD',
	);
});

Deno.test('allows custom seralizer multiple', () => {
	assertEquals(
		lib.interpolate('hello {name} {name}', { name: 'world' }, (v) => v?.toUpperCase() ?? '?'),
		'hello WORLD WORLD',
	);
});

Deno.test('the value should be cached in the single interpolation', () => {
	let i = 0;
	let obj = {
		get name() {
			return i++;
		},
	};
	assertEquals(obj.name, 0);
	assertEquals(obj.name, 1);
	i = 0;
	assertEquals(lib.interpolate('{name} {name}', obj), '0 0');
	assertEquals(i, 1);
	assertEquals(lib.interpolate('{name} {name}', obj), '1 1');
	assertEquals(i, 2);
});

// props written between {} brackets
// Only valid names are allowed
// brackets can be escaped
// numbers are indexs for an array
