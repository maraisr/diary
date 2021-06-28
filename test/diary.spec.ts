import * as assert from 'uvu/assert';
import * as diary from '../src';
import { enable, LogEvent } from '../src';
import { describe, trap_console } from './helpers';

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

	it('#error should have stack as extra', () => {
		let events: any[] = [];
		const scope = diary.diary('error', (logEvent) => {
			events.push(logEvent);
		});
		const trap = trap_console('error');
		scope.error(new Error('some error'));
		assert.equal(events[0].message, 'some error');
		assert.instance(events[0].error, Error);
		trap();
	});
});

describe('allows', (it) => {
	it('should only allow some scopes', () => {
		let events: any[] = [];
		const scopeA = diary.diary('scopeA', (ev) => events.push(ev.message));
		const scopeB = diary.diary('scopeB', (ev) => events.push(ev.message));

		enable('scopeA');

		scopeA.info('info a');
		scopeB.info('info b');

		assert.equal(events, ['info a']);

		enable('*');
	});

	it('should allow nested scopes', () => {
		let events: any[] = [];
		const scopeA = diary.diary('scope:a', (ev) => events.push(ev.message));
		const scopeB = diary.diary('scope:b', (ev) => events.push(ev.message));

		enable('scope:*');

		scopeA.info('info a');
		scopeB.info('info b');

		assert.equal(events, ['info a', 'info b']);

		enable('*');
	});
});

describe('inherits', (it) => {
	it('should inherit the scope', () => {
		const events = [];
		const eventReporter = (event: LogEvent) => {
			events.push(event);
		};
		const trap = trap_console('info');
		const scopeA = diary.diary('scopeA', eventReporter);
		const childScope = scopeA.diary('childScope', eventReporter);

		childScope.info('info childScope');

		assert.equal(events[0].name, 'scopeA:childScope');
		trap();
	});

	it('should inherit the reporter', () => {
		const events = [];
		const eventReporter = (event: LogEvent) => {
			events.push(event);
		};
		const trap = trap_console('info');
		const scopeA = diary.diary('scopeA', eventReporter);
		const childScope = scopeA.diary('childScope');

		childScope.info('info childScope');

		assert.equal(events.length, 1);
		trap();
	});

	it('should overwrite the reporter', () => {
		const events = [];
		const eventReporter = (event: LogEvent) => {
			events.push(event);
		};
		const noopReporter = (event: LogEvent) => {};
		const trap = trap_console('info');
		const scopeA = diary.diary('scopeA', eventReporter);
		const childScope = scopeA.diary('childScope', noopReporter);

		childScope.info('info childScope');

		assert.equal(events.length, 0);
		trap();
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
			assert.equal(events, [
				{
					name: level,
					level: level,
					message: 'something',
					extra: [],
				},
				{
					name: level,
					level: level,
					message: 'something else',
					extra: [],
				},
			]);
		});
	});
});
