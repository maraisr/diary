import {suite, test} from 'uvu';
import * as assert from 'uvu/assert';
import { restoreAll, spy, spyOn } from 'nanospy';

import * as diary from  './logger'
import type {Reporter} from './logger'

import * as GENERIC from './generic';
import * as NODE from './node';

const levels = ['fatal', 'error', 'warn', 'debug', 'info', 'log'] as const;

function before() {
	diary.enable('*');
	restoreAll();
}

test.before.each(before);

Object.entries({ generic: GENERIC, node: NODE }).forEach(([name, mod]) => {
	const s = suite(`mod :: ${name}`);
	s.before.each(before);

	s('exports', () => {
		[...levels, 'diary'].forEach((verb) => {
			assert.type(
				// @ts-ignore
				mod[verb],
				'function',
				`Expected diary to have #${verb} function`,
			);
		});
	});

	s.run();
});

test('should allow object logging', () => {
	const reporter = spy<Reporter>();
	const scope = diary.diary('error', reporter);

	scope.info('info');
	assert.equal(reporter.callCount, 1);
	assert.equal(reporter.calls[0][0], 'ℹ info  info');
	scope.info({ foo: 'bar' });

	assert.equal(reporter.calls[1][0], "ℹ info  { foo: 'bar' }");
});

const allows = suite('allows');
allows.before.each(before);

allows('should only allow some scopes', () => {
	const reporter = spy<Reporter>();
	const scopeA = diary.diary('scope:a', reporter);
	const scopeB = diary.diary('scope:b', reporter);

	diary.enable('scope:a');

	scopeA.info('info a');
	scopeB.info('info b');
	scopeB.info('info b');
	scopeA.info('info a');

	assert.equal(
		reporter.calls.flatMap((i) => i[0].messages),
		['info a', 'info a'],
	);
});

allows('should allow nested scopes', () => {
	const reporter = spy<Reporter>();
	const scopeA = diary.diary('scope:a', reporter);
	const scopeB = diary.diary('scope:b', reporter);

	diary.enable('scope:*');

	scopeA.info('info a');
	scopeB.info('info b');

	assert.equal(
		reporter.calls.flatMap((i) => i[0].messages),
		['info a', 'info b'],
	);
});

allows('should allow multiple allows per enable', () => {
	const reporter = spy<Reporter>();

	const scopeA = diary.diary('scope:a', reporter);
	const scopeB = diary.diary('scope:b', reporter);

	diary.enable('scope:a,blah');

	scopeA.info('info a');
	scopeB.info('info b');

	diary.enable('blah,scope:a');

	scopeA.info('info a');
	scopeB.info('info b');
	scopeB.info('info b');
	scopeA.info('info a');

	diary.enable('foo,bar:*,scope:,scope:*');

	scopeA.info('info a');
	scopeB.info('info b');

	assert.equal(
		reporter.calls.flatMap((i) => i[0].messages),
		['info a', 'info a', 'info a', 'info a', 'info b'],
	);
});

allows.run();

levels.forEach((level) => {
	const l = suite(`level :: ${level}`);
	l.before.each(before);

	l('should log something', () => {
		const reporter = spy<Reporter>();
		const scope = diary.diary(level, reporter);

		scope[level]('something');
		scope[level]('something else');
		scope[level]('object else', { foo: 'bar' });
		scope[level]({ foo: 'bar' });

		assert.equal(reporter.callCount, 4);

		assert.equal(
			reporter.calls.map((i) => i[0]),
			[
				{
					name: level,
					level: level,
					messages: ['something'],
				},
				{
					name: level,
					level: level,
					messages: ['something else'],
				},
				{
					name: level,
					level: level,
					messages: ['object else', { foo: 'bar' }],
				},
				{
					name: level,
					level: level,
					messages: [{ foo: 'bar' }],
				},
			],
		);
	});

	l.run();
});
