import { suite } from 'uvu';
import type { Test } from 'uvu';
import { enable } from '../src';

const noop: VoidFunction = () => {};

export const trap_console = (
	level: keyof typeof console | 'fatal',
	handler: Function = noop,
) => {
	if (level === 'fatal') level = 'error';
	const old = console[level];
	console[level] = handler;

	return () => (console[level] = old);
};

export const describe = (name: string, it: (t: Test) => void) => {
	const s = suite(name);
	s.before.each(() => {
		enable('*');
	});
	it(s);
	s.run();
};
