import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as lib from './utils';

const sprintf = suite('sprintf');

sprintf('should format something basic', () => {
	assert.equal(lib.sprintf('hello %s', 'world'), 'hello world');
});

sprintf('should support strings', () => {
	assert.equal(lib.sprintf('foo %s', { bar: 'baz' }), 'foo [object Object]');
	assert.equal(lib.sprintf('foo %s', ['bar']), 'foo bar');
	assert.equal(lib.sprintf('foo %s', ['bar', 'baz']), 'foo bar,baz');
});

sprintf('should support object notation', () => {
	assert.equal(lib.sprintf('foo %o', { bar: 'baz' }), 'foo {"bar":"baz"}');
	assert.equal(lib.sprintf('foo %O', { bar: 'baz' }), 'foo {"bar":"baz"}');
	assert.equal(lib.sprintf('foo %o', 'bar'), 'foo bar');
	assert.equal(lib.sprintf('foo %o', ['bar', 'baz']), 'foo ["bar","baz"]');
});

sprintf('should support integers', () => {
	assert.equal(lib.sprintf('foo %i', 1), 'foo 1');
	assert.equal(lib.sprintf('foo %i', 1.25), 'foo 1');
	assert.equal(lib.sprintf('foo %d', 1.25), 'foo 1');
});

sprintf('should support floats', () => {
	assert.equal(lib.sprintf('foo %f', 1), 'foo 1');
	assert.equal(lib.sprintf('foo %f', 1.25), 'foo 1.25');
	assert.equal(lib.sprintf('foo %f', 1.25), 'foo 1.25');
});

sprintf('should work when under supplied', () => {
	assert.equal(lib.sprintf('foo %s %s', 'bar'), 'foo bar undefined');
	assert.equal(
		lib.sprintf('foo %s with %o', 'bar', { bar: 'baz' }),
		'foo bar with {"bar":"baz"}',
	);
	// assert.equal(lib.sprintf('foo %s with %o', 'bar', {"bar":"baz"}, 'test'), 'foo bar with {"bar":"baz"} test');
	assert.equal(
		lib.sprintf('foo %o %s', { bar: 'baz' }),
		'foo {"bar":"baz"} undefined',
	);
});

sprintf('should work, when over supplied', () => {
	assert.equal(lib.sprintf('foo %s', 'bar', 'baz'), 'foo bar');
});

const compare = suite('compare');

compare('should compare when equal', () => {
	assert.equal(lib.compare('log', 'log'), 0);
	assert.equal(lib.compare('error', 'error'), 0);
});

compare('should compare when less', () => {
	assert.equal(lib.compare('error', 'fatal'), -1);
	assert.equal(lib.compare('warn', 'error'), -1);
});

compare('should compare when more', () => {
	assert.equal(lib.compare('fatal', 'error'), 1);
	assert.equal(lib.compare('info', 'log'), 1);
});

compare('show be zero when level is _real_', () => {
	// @ts-ignore
	assert.equal(lib.compare('what the', 'log'), 0);
	// @ts-ignore
	assert.equal(lib.compare('what the', 'heck'), 0);
	// @ts-ignore
	assert.equal(lib.compare('log', 'heck'), 0);
});

sprintf.run();
compare.run();
