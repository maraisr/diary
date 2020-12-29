import { suite, test } from 'uvu';
import * as assert from 'uvu/assert';

import * as diary from '../src';
import { reset, trap_console } from './helpers';

const levels = ['fatal', 'error', 'warn', 'debug', 'info', 'log'] as const;

reset(test);

test('api', () => {
	[...levels, 'diary', 'before', 'after'].forEach((verb) => {
		assert.type(
			// @ts-expect-error
			diary[verb],
			'function',
			`Expected diary to have #${verb} function`,
		);
	});
});

test('should now share middleware between scopes', () => {
	const trap = trap_console('info');
	const scopeA = diary.diary('scopeA');
	const scopeB = diary.diary('scopeB');
	const who_ran = { scopeA: 0, scopeB: 0 };
	diary.after(({ name }) => {
		// @ts-expect-error
		++who_ran[name];
	}, scopeA);
	scopeA.info('info');
	scopeB.info('info');
	assert.equal(who_ran, { scopeA: 1, scopeB: 0 });
	trap();
});

test('default is unnamed', () => {
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

test('#error should have stack as extra', () => {
	const scope = diary.diary('error');
	let events: any[] = [];
	const trap = trap_console('error');
	diary.after(logEvent => {
		events.push(logEvent);
	}, scope);
	scope.error(new Error('some error'));
	assert.equal(events[0].message, 'some error');
	assert.instance(events[0].extra[0], Error);
	trap();
});

test('middleware should allow cleanup', () => {
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

test('should inherit global middleware', () => {
	const trap = trap_console('info');
	const scope = diary.diary('scoped');
	const ran = {global: 0, scoped: 0};
	const cleanups = [
		diary.after(() => {
			++ran.global;
		}),
		diary.after(() => {
			++ran.scoped;
		}, scope)
	];

	scope.info('info message');
	assert.equal(ran, {global: 1, scoped: 1});
	cleanups.forEach(x => x());
	trap();
})

test('setLevel', () => {
	const infoTrap = trap_console('info');
	const errorTrap = trap_console('error');
	const scope = diary.diary('level');
	let events: any[] = [];
	diary.after(logEvent => {
		events.push(logEvent);
	}, scope);
	scope.info('info a');
	scope.error('error a');
	diary.setLevel('error');
	scope.info('info b');
	scope.error('error b');

	assert.equal(events.length, 3);
	assert.equal(events.map(i => i.message), ['info a', 'error a', 'error b']);

	infoTrap();
	errorTrap();
});

test.run();

levels.forEach(level => {
	const level_test = suite(`level :: ${level}`);
	reset(level_test);

	let trap: Function;
	level_test.before(() => {
		trap = trap_console(level as any);
	});

	level_test.after(() => {
		trap();
	});

	level_test('should log something', () => {
		const scope = diary.diary(level);
		let events: any[] = [];
		diary.after(logEvent => {
			events.push(logEvent);
		}, scope);
		scope[level]('something');
		scope[level]('something else');
		assert.equal(events, [{
			name: level,
			level: level,
			message: 'something',
			extra: [],
		}, {
			name: level,
			level: level,
			message: 'something else',
			extra: [],
		}]);
	});

	level_test('should allow middleware to alter message', () => {
		const scope = diary.diary(level);
		let events: any[] = [];
		diary.after(logEvent => {
			logEvent.message = 'altered';
		}, scope);
		diary.after(logEvent => {
			events.push(logEvent);
		}, scope);
		scope[level]('something');
		scope[level]('something else');
		assert.equal(events, [{
			name: level,
			level: level,
			message: 'altered',
			extra: [],
		}, {
			name: level,
			level: level,
			message: 'altered',
			extra: [],
		}]);
	});

	level_test.run();
});

const filter = suite('filter');

filter('filter scope', () => {
	const infoTrap = trap_console('info');
	const scopeA = diary.diary('scopeA');
	const scopeB = diary.diary('scopeB');

	process.env.DEBUG = 'scopeA';

	let events: any[] = [];
	const cleanup = diary.after(logEvent => {
		events.push(logEvent.message);
	});

	scopeA.info('info a');
	scopeB.info('info b');

	assert.equal(events, ['info a']);

	infoTrap();
	cleanup();
});

filter('filter scope wildcard', () => {
	const infoTrap = trap_console('info');
	const scopeA = diary.diary('scope:a');
	const scopeB = diary.diary('scope:b');

	process.env.DEBUG = 'scope:*';

	let events: any[] = [];
	const cleanup = diary.after(logEvent => {
		events.push(logEvent.message);
	});

	scopeA.info('info a');
	scopeB.info('info b');

	assert.equal(events, ['info a', 'info b']);

	infoTrap();
	cleanup();
});

//filter.run();
