import {test, suite} from 'uvu';
import * as assert from 'uvu/assert';
import * as diary from './logger';
import * as json from './json';
import { restoreAll, spyOn } from 'nanospy';

test('api', () => {
	assert.type(json.reporter, 'function');
});

const output = suite('output');

output.before.each(() => {
	diary.enable('*');
	restoreAll();
});

output('simple', () => {
	const log_output = spyOn(console, 'log', () => {});

	const scope = diary.diary('json', json.reporter);
	scope.info('foo %s', 'bar');

	assert.equal(log_output.callCount, 1);
	assert.equal(
		log_output.calls[0][0],
		'{"name":"json","level":"info","message":"foo bar"}',
	);
});

output('with rest', () => {
	const log_output = spyOn(console, 'log', () => {});

	const scope = diary.diary('json', (event) => {
		event.context = { sequence: 0 };
		json.reporter(event);
	});

	scope.info('foo %s', 'bar');

	assert.equal(log_output.callCount, 1);
	assert.equal(
		log_output.calls[0][0],
		'{"name":"json","level":"info","message":"foo bar","context":{"sequence":0}}',
	);
});

output.run();
