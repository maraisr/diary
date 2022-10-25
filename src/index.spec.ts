import * as assert from 'uvu/assert';
import * as diary from '.';
import { enable } from '.';
import { describe, trap_console } from '../test/helpers';

const levels = ['fatal', 'error', 'warn', 'debug', 'info', 'log'] as const;

describe('api', (it) => {
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
		let result;
		const trap = trap_console('info', (...args: any) => {
			result = args.join('');
		});
		diary.info('info');
		assert.equal(result, 'ℹ info  info');
		diary.diary('named').info('info');
		assert.equal(result, 'ℹ info  [named] info');
		trap();
	});

	it('#error persist', () => {
		let events: any[] = [];
		const scope = diary.diary('error', (logEvent) => {
			events.push(logEvent);
		});
		const trap = trap_console('error');
		scope.error(new Error('some error'));
		assert.equal(events[0].messages[0].message, 'some error');
		assert.instance(events[0].messages[0], Error);
		trap();
	});

	it('should allow object logging', () => {
		let result;
		const trap = trap_console('info', (...args: any) => {
			result = args.join('');
		});
		diary.info('info');
		assert.equal(result, 'ℹ info  info');
		diary.info({ foo: 'bar' });
		assert.equal(result, "ℹ info  { foo: 'bar' }");
		trap();
	});
});

describe('allows', (it) => {
	it('should only allow some scopes', () => {
		let events: any[] = [];
		const scopeA = diary.diary(
			'scope:a',
			(ev) => (events = events.concat(ev.messages)),
		);
		const scopeB = diary.diary(
			'scope:b',
			(ev) => (events = events.concat(ev.messages)),
		);

		enable('scope:a');

		scopeA.info('info a');
		scopeB.info('info b');
		scopeB.info('info b');
		scopeA.info('info a');

		assert.equal(events, ['info a', 'info a']);

		enable('*');
	});

	it('should allow nested scopes', () => {
		let events: any[] = [];
		const scopeA = diary.diary(
			'scope:a',
			(ev) => (events = events.concat(ev.messages)),
		);
		const scopeB = diary.diary(
			'scope:b',
			(ev) => (events = events.concat(ev.messages)),
		);

		enable('scope:*');

		scopeA.info('info a');
		scopeB.info('info b');

		assert.equal(events, ['info a', 'info b']);
	});

	it('should allow multiple allows per enable', () => {
		let events: any[] = [];
		const scopeA = diary.diary(
			'scope:a',
			(ev) => (events = events.concat(ev.messages)),
		);
		const scopeB = diary.diary(
			'scope:b',
			(ev) => (events = events.concat(ev.messages)),
		);

		enable('scope:a,blah');

		scopeA.info('info a');
		scopeB.info('info b');

		assert.equal(events, ['info a']);

		events = [];
		enable('blah,scope:a');

		scopeA.info('info a');
		scopeB.info('info b');
		scopeB.info('info b');
		scopeA.info('info a');

		assert.equal(events, ['info a', 'info a']);

		events = [];
		enable('foo,bar:*,scope:,scope:*');

		scopeA.info('info a');
		scopeB.info('info b');

		assert.equal(events, ['info a', 'info b']);
	});
});

levels.forEach((level) => {
	describe(`level :: ${level}`, (it) => {
		let trap: Function;

		it.before(() => {
			trap = trap_console(level as any);
		});

		it.after(() => {
			trap();
		});

		it('should log something', () => {
			let events: any[] = [];
			const scope = diary.diary(level, (logEvent) => {
				events.push(logEvent);
			});

			scope[level]('something');
			scope[level]('something else');
			scope[level]('object else', { foo: 'bar' });
			scope[level]({ foo: 'bar' });
			assert.equal(events, [
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
			]);
		});
	});
});
