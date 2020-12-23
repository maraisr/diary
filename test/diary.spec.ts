import { suite, Test, test } from 'uvu';
import * as assert from 'uvu/assert';

import * as diary from '../src';

const verbs = ['error', 'warn', 'debug', 'info', 'log'] as const;

const trap_console = (verb:keyof typeof console, handler: Function = () => {}) => {
	const old = console[verb];
	console[verb] = handler;
	return () => console[verb] = old;
}

const reset = (test: Test) => {
	test.after(() => {
		diary.setLevel('log');
	});
};

reset(test);

test('api', () => {
	[...verbs, 'diary', 'middleware'].forEach((verb) => {
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
	diary.middleware(({ name }) => {
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
	diary.middleware(logEvent => {
		events.push(logEvent);
	}, scope);
	scope.error(new Error('some error'));
	assert.equal(events[0].message, 'some error');
	assert.instance(events[0].extra[0], Error);
});

test('setLevel', () => {
	const infoTrap = trap_console('info');
	const errorTrap = trap_console('error');
	const scope = diary.diary('level');
	let events: any[] = [];
	diary.middleware(logEvent => {
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
})

test.run();

verbs.forEach(verb => {
	const verb_test = suite(verb);
	reset(verb_test);

	verb_test('should log something', () => {
		const scope = diary.diary(verb);
		let events: any[] = [];
		diary.middleware(logEvent => {
			events.push(logEvent);
		}, scope);
		scope[verb]('something');
		scope[verb]('something else');
		assert.equal(events, [{
			name: verb,
			level: verb,
			message: 'something',
			extra: [],
		}, {
			name: verb,
			level: verb,
			message: 'something else',
			extra: [],
		}]);
	});

	verb_test('should allow middleware to alter message', () => {
		const scope = diary.diary(verb);
		let events: any[] = [];
		diary.middleware(logEvent => {
			logEvent.message = 'altered';
			return logEvent;
		}, scope);
		diary.middleware(logEvent => {
			events.push(logEvent);
		}, scope);
		scope[verb]('something');
		scope[verb]('something else');
		assert.equal(events, [{
			name: verb,
			level: verb,
			message: 'altered',
			extra: [],
		}, {
			name: verb,
			level: verb,
			message: 'altered',
			extra: [],
		}]);
	});

	verb_test.run();
});
