import type { Reporter } from './logger';
import { sprintf } from './utils';

export const reporter: Reporter = ({ name, level, messages, ...rest }) => {
	if (typeof messages[0] === 'object') {
		return console.log(
			JSON.stringify({
				name,
				level,
				...messages,
				...rest,
			})
		);
	} else {
		const message = messages.shift() as string;
		return console.log(
			JSON.stringify({
				name,
				level,
				message: sprintf(message, ...messages),
				...rest,
			})
		);
	}
};
