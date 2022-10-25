import * as assert from 'uvu/assert';
import { sprintf, compare } from './utils';
import { describe } from '../test/helpers';

describe('sprintf', (it) => {
	it('should format something basic', () => {
		assert.equal(sprintf('hello %s', 'world'), 'hello world');
	});

	it('should support strings', () => {
		assert.equal(sprintf('foo %s', { bar: 'baz' }), 'foo [object Object]');
		assert.equal(sprintf('foo %s', ['bar']), 'foo bar');
		assert.equal(sprintf('foo %s', ['bar', 'baz']), 'foo bar,baz');
	});

	it('should support object notation', () => {
		assert.equal(sprintf('foo %o', { bar: 'baz' }), 'foo {"bar":"baz"}');
		assert.equal(sprintf('foo %O', { bar: 'baz' }), 'foo {"bar":"baz"}');
		assert.equal(sprintf('foo %o', 'bar'), 'foo bar');
		assert.equal(sprintf('foo %o', ['bar', 'baz']), 'foo ["bar","baz"]');
	});

	it('should support integers', () => {
		assert.equal(sprintf('foo %i', 1), 'foo 1');
		assert.equal(sprintf('foo %i', 1.25), 'foo 1');
		assert.equal(sprintf('foo %d', 1.25), 'foo 1');
	});

	it('should support floats', () => {
		assert.equal(sprintf('foo %f', 1), 'foo 1');
		assert.equal(sprintf('foo %f', 1.25), 'foo 1.25');
		assert.equal(sprintf('foo %f', 1.25), 'foo 1.25');
	});

	it('should work when under supplied', () => {
		assert.equal(sprintf('foo %s %s', 'bar'), 'foo bar undefined');
		assert.equal(
			sprintf('foo %s with %o', 'bar', { bar: 'baz' }),
			'foo bar with {"bar":"baz"}',
		);
		// assert.equal(sprintf('foo %s with %o', 'bar', {"bar":"baz"}, 'test'), 'foo bar with {"bar":"baz"} test');
		assert.equal(
			sprintf('foo %o %s', { bar: 'baz' }),
			'foo {"bar":"baz"} undefined',
		);
	});

	it('should work, when over supplied', () => {
		assert.equal(sprintf('foo %s', 'bar', 'baz'), 'foo bar');
	});
});

describe('compare', (it) => {
	it('should compare when equal', () => {
		assert.equal(compare('log', 'log'), 0);
		assert.equal(compare('error', 'error'), 0);
	});

	it('should compare when less', () => {
		assert.equal(compare('error', 'fatal'), -1);
		assert.equal(compare('warn', 'error'), -1);
	});

	it('should compare when more', () => {
		assert.equal(compare('fatal', 'error'), 1);
		assert.equal(compare('info', 'log'), 1);
	});

	it('show be zero when level is _real_', () => {
		// @ts-ignore
		assert.equal(compare('what the', 'log'), 0);
		// @ts-ignore
		assert.equal(compare('what the', 'heck'), 0);
		// @ts-ignore
		assert.equal(compare('log', 'heck'), 0);
	});
});
