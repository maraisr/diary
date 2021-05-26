import * as assert from 'uvu/assert';
import * as diary from '../src';
import { enable } from '../src';
import { describe, trap_console } from './helpers';

const levels = ['fatal', 'error', 'warn', 'debug', 'info', 'log'] as const;

describe('api', (it) => {
	it('exports', () => {
		[...levels, 'diary', 'before', 'after'].forEach((verb) => {
			assert.type(
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
		const scope = diary.diary('error');
		let events: any[] = [];
		const trap = trap_console('error');
		diary.after((logEvent) => {
			events.push(logEvent);
		}, scope);
		scope.error(new Error('some error'));
		assert.equal(events[0].message, 'some error');
		assert.instance(events[0].extra[0], Error);
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

	it('should run all handlers when enablement is false', () => {
		let events: any[] = [];
		const scopeA = diary.diary('scope:a', (ev) => events.push(ev.message));
		const scopeB = diary.diary('scope:b', (ev) => events.push(ev.message));

		const cleanup_a = diary.after(
			(ev) => void events.push(ev.message),
			scopeA,
		);
		const cleanup_b = diary.after(
			(ev) => void events.push(ev.message),
			scopeB,
		);

		enable('scope:a');

		scopeA.info('info a');
		scopeB.info('info b');

		assert.equal(events, ['info a', 'info a', 'info b']);

		cleanup_a();
		cleanup_b();
		enable('*');
	});
});

describe('hooks', (it) => {
	it('should not share hooks between diaries', () => {
		const trap = trap_console('info');
		const scopeA = diary.diary('scopeA');
		const scopeB = diary.diary('scopeB');
		const who_ran = { scopeA: 0, scopeB: 0 };
		diary.after(({ name }) => {
			++who_ran[name];
		}, scopeA);
		scopeA.info('info');
		scopeB.info('info');
		assert.equal(who_ran, { scopeA: 1, scopeB: 0 });
		trap();
	});

	it('should dispose hook when needed', () => {
		const trap = trap_console('info');
		const scope = diary.diary('');
		const called = { a: 0, b: 0 };
		const a = diary.after(() => {
			++called.a;
		}, scope);
		diary.after(() => {
			++called.b;
		}, scope);
		scope.info('info a');
		a();
		scope.info('info b');
		assert.equal(called, { a: 1, b: 2 });
		trap();
	});

	it('should inherit global middleware', () => {
		const trap = trap_console('info');
		const scope = diary.diary('scoped');
		const ran = { global: 0, scoped: 0 };
		const cleanups = [
			diary.after(() => {
				++ran.global;
			}),
			diary.after(() => {
				++ran.scoped;
			}, scope),
		];

		scope.info('info message');
		assert.equal(ran, { global: 1, scoped: 1 });
		cleanups.forEach((x) => x());
		trap();
	});

	it('should be able to alter message', () => {
		const trap = trap_console('log');
		const scope = diary.diary('');
		let events: any[] = [];
		diary.after((logEvent) => {
			logEvent.message = 'altered';
		}, scope);
		diary.after((logEvent) => {
			events.push(logEvent);
		}, scope);
		scope.log('something');
		scope.log('something else');
		assert.equal(events, [
			{
				name: '',
				level: 'log',
				message: 'altered',
				extra: [],
			},
			{
				name: '',
				level: 'log',
				message: 'altered',
				extra: [],
			},
		]);
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
			const scope = diary.diary(level);
			let events: any[] = [];
			diary.after((logEvent) => {
				events.push(logEvent);
			}, scope);
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
