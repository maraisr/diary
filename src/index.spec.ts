import * as assert from 'uvu/assert';
import * as diary from '.';
import { enable } from '.';
import { describe } from '../test/helpers';
import { restoreAll, spy, spyOn } from 'nanospy';
import type { Reporter } from 'diary';

const levels = ['fatal', 'error', 'warn', 'debug', 'info', 'log'] as const;

describe('api', (it) => {
	it.after.each(() => {
		restoreAll();
	});

	it('exports', () => {
		[...levels, 'diary'].forEach((verb) => {
			assert.type(
				// @ts-ignore
				diary[verb],
				'function',
				`Expected diary to have #${verb} function`,
			);
		});
	});

	it('default diary should not be named', () => {
		const log_output = spyOn(console, 'info', () => {});

		diary.info('info');
		assert.equal(log_output.calls[0].join(''), 'ℹ info  info');
		diary.diary('named').info('info');
		assert.equal(log_output.calls[1].join(''), 'ℹ info  [named] info');
	});

	it('#error persist', () => {
		const reporter = spy<Reporter>();
		const scope = diary.diary('error', reporter);

		scope.error(new Error('some error'));

		assert.equal(reporter.callCount, 1);
		assert.equal(reporter.calls[0][0].messages[0].message, 'some error');
		assert.instance(reporter.calls[0][0].messages[0], Error);
	});

	it('should allow object logging', () => {
		const log_output = spyOn(console, 'info', () => {});

		diary.info('info');
		assert.equal(log_output.callCount, 1);
		assert.equal(log_output.calls[0][0], 'ℹ info  info');
		diary.info({ foo: 'bar' });

		assert.equal(log_output.calls[1][0], "ℹ info  { foo: 'bar' }");
	});
});

describe('allows', (it) => {
	it('should only allow some scopes', () => {
		const reporter = spy<Reporter>();
		const scopeA = diary.diary('scope:a', reporter);
		const scopeB = diary.diary('scope:b', reporter);

		enable('scope:a');

		scopeA.info('info a');
		scopeB.info('info b');
		scopeB.info('info b');
		scopeA.info('info a');

		assert.equal(
			reporter.calls.flatMap((i) => i[0].messages),
			['info a', 'info a'],
		);
	});

	it('should allow nested scopes', () => {
		const reporter = spy<Reporter>();
		const scopeA = diary.diary('scope:a', reporter);
		const scopeB = diary.diary('scope:b', reporter);

		enable('scope:*');

		scopeA.info('info a');
		scopeB.info('info b');

		assert.equal(
			reporter.calls.flatMap((i) => i[0].messages),
			['info a', 'info b'],
		);
	});

	it('should allow multiple allows per enable', () => {
		const reporter = spy<Reporter>();

		const scopeA = diary.diary('scope:a', reporter);
		const scopeB = diary.diary('scope:b', reporter);

		enable('scope:a,blah');

		scopeA.info('info a');
		scopeB.info('info b');

		enable('blah,scope:a');

		scopeA.info('info a');
		scopeB.info('info b');
		scopeB.info('info b');
		scopeA.info('info a');

		enable('foo,bar:*,scope:,scope:*');

		scopeA.info('info a');
		scopeB.info('info b');

		assert.equal(
			reporter.calls.flatMap((i) => i[0].messages),
			['info a', 'info a', 'info a', 'info a', 'info b'],
		);
	});
});

levels.forEach((level) => {
	describe(`level :: ${level}`, (it) => {
		it('should log something', () => {
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
	});
});
