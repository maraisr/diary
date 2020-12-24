import { Test } from 'uvu';
import * as diary from '../src';

const noop: VoidFunction = () => {};

export const trap_console = (
	level: keyof typeof console | 'fatal',
	handler: Function = noop,
) => {
	if (level === 'fatal') level = 'error';
	const old = console[level];
	console[level] = handler;
	// @ts-expect-error line above fixes it.
	return () => (console[level] = old);
};

export const reset = (test: Test) => {
	test.after(() => {
		diary.setLevel('log');
	});
};
