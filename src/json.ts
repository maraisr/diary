import type { Reporter } from './index';
import { sprintf } from './utils';

export const reporter: Reporter = ({ name, level, message, extra, ...rest }) =>
	console.log(JSON.stringify({
		name,
		level,
		message: sprintf(message, ...extra),
		...rest,
	}));
