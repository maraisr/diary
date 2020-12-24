// This file is mainly to test certain scenarios that typical loggers export as first-class

import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import * as diary from '../src';
import { reset } from './helpers';

const as_json = suite('output::json');
reset(as_json);

as_json('middleware as json', () => {
	const events:any = [];

	const suite = diary.diary('json');
	diary.middleware(event => {
		event.message = JSON.stringify(event);
	}, suite);
	// The below two lines are just for the unit tests, typically you'd just output directly in the middleware
	diary.middleware(event => events.push(event.message), suite);
	diary.middleware(() => false, suite);

	suite.info('info a');
	suite.debug('debug a');

	assert.snapshot(events.join('\n'), `{"name":"json","level":"info","message":"info a","extra":[]}
{"name":"json","level":"debug","message":"debug a","extra":[]}`);
});

as_json.run();

const with_context = suite('with context');
reset(with_context);

with_context('context aot', () => {
	const events:any = [];

	const suite = diary.diary('json');
	let context = {foo: 'bar'};
	// Imagine this existing in some entrypoint
	diary.middleware(event => {
		event.extra.unshift(context);
	}, suite);
	diary.middleware(event => events.push(event), suite);
	diary.middleware(() => false, suite);

	suite.info('info a');
	suite.debug('debug a');

	assert.equal(events[0].extra[0], { foo: 'bar' });
	assert.equal(events[1].extra[0], { foo: 'bar' });
});

with_context.run();
