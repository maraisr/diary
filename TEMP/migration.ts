import * as v4 from 'npm:diary@^0.4';
import * as v5 from '../lib/mod.ts';

let v4Events: any[] = [];
let v5Events: any[] = [];

{
	v4.enable('*');
	const log = v4.diary('v0.4', (event) => {
		v4Events.push(event);
	});

	log.log('hello %s', 'world', 'extra', 'props');
	log.debug('hello %s', 'world', 'extra', 'props');
	log.info('hello %s', 'world', 'extra', 'props');
	log.warn('hello %s', 'world', 'extra', 'props');
	log.error('hello %s', 'world', 'extra', 'props');
	log.fatal('hello %s', 'world', 'extra', 'props');
}

{
	const log = v5.diary((level, event, props) => {
		v5Events.push({ name: 'v0.5', level, messages: [event, props] });
	});

	log('debug', 'hello');
	log('log', 'hello {phrase}', { phrase: 'world', extra: ['extra', 'props'] });
	log('debug', 'hello {phrase}', { phrase: 'world', extra: ['extra', 'props'] });
	log('info', 'hello {phrase}', { phrase: 'world', extra: ['extra', 'props'] });
	log('warn', 'hello {phrase}', { phrase: 'world', extra: ['extra', 'props'] });
	log('error', 'hello {phrase}', { phrase: 'world', extra: ['extra', 'props'] });
	log('fatal', 'hello {phrase} the time is {time}', {
		phrase: 'world',
		extra: ['extra', 'props'],
		time: 123,
	});
}

console.log({
	v4Events,
	v5Events,
});
