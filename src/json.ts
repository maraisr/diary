import type { Reporter } from 'diary';
import { sprintf } from 'diary/utils';

export const reporter: Reporter = ({ name, level, message, extra, ...rest }) =>
	console.log(
		JSON.stringify({
			name,
			level,
			message: sprintf(message, ...extra),
			...rest,
		}),
	);
