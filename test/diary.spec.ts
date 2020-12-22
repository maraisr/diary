import { suite, test } from 'uvu';
import * as assert from 'uvu/assert';

import * as diary from '../src';

test('api', () => {
	['error', 'info', 'warn', 'debug', 'trace', 'diary', 'middleware'].forEach((verb) => {
		assert.type(
			diary[verb],
			'function',
			`Expected diary to have #${verb} function`,
		);
	});
});

test('for #info', () => {
	diary.trace('something info');
})

const middleware = suite('middleware');

middleware('intercept default', () => {
	let called = false;
	diary.middleware(event => {
		called = true;
		return event;
	});
	diary.fatal('in test');
	assert.ok(called);
});

middleware('intercept for custom', function tester() {
	const { middleware} = diary;

	const myScope = diary.diary('my-scope');

	let called = false;
	middleware(event => {
		called = true;
		return event;
	}, myScope);

	myScope.fatal(new Error('error thingo'));

	assert.ok(called);
});

test.run();
middleware.run();
