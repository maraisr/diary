import { suite } from 'uvu';
import type { Test } from 'uvu';
import { enable } from '../../src/index';

export const describe = (name: string, it: (t: Test) => void) => {
	const s = suite(name);
	s.before.each(() => {
		enable('*');
	});
	it(s);
	s.run();
};
