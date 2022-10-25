import * as assert from 'uvu/assert';
import * as diary from '.';
import * as json from './json';
import { describe } from '../test/helpers';
import { restoreAll, spyOn } from 'nanospy';

describe('api', (it) => {
	it('should export', () => {
		assert.type(json.reporter, 'function');
	});
});

describe('output', (it) => {
	it.after.each(() => {
		restoreAll();
	});

	it('simple', () => {
		const log_output = spyOn(console, 'log', () => {});

		const scope = diary.diary('json', json.reporter);
		scope.info('foo %s', 'bar');

		assert.equal(log_output.callCount, 1);
		assert.equal(
			log_output.calls[0][0],
			'{"name":"json","level":"info","message":"foo bar"}',
		);
	});

	it('with rest', () => {
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
});
