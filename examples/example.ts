import { type Diary, diary, type OnEmitFn } from '../mod.ts';
import { browser, plain, pretty } from '../output.console.ts';
import { interpolate } from '../utils.ts';

class User {
	id = 123;
	name = 'Actor';

	// Interpolate calls .toString() on anything it recieves
	toString() {
		return `[User id: ${this.id} name: ${this.name}]`;
	}
}

function example(oe: OnEmitFn) {
	let user = new User();

	// Example where you may want to create a standard logger and output fn for your application
	let createLogger = (ctx: {
		loggerName: string;
		pid: number;
	}): Diary<typeof ctx> => {
		return diary((level, message, props = {}) => {
			return oe(level, message, { ...ctx, ...props });
		});
	};

	// then use that in your code like this:
	let log = createLogger({ pid: Deno.pid, loggerName: 'example' });
	log('debug', 'hello from {loggerName} with {pid}');
	log('info', 'hello {user} with {pid}', { user });

	log('log', 'this is a log message');
	log('info', 'this is an info message');
	log('debug', 'this is a debug message');
	log('warn', 'this is a warning message');
	log('error', 'this is an error message');
	log('fatal', 'this is a fatal message');

	log('fatal', 'some {user} had an {error}', {
		user: 'Actor',
		error: new Error('boom!'),
	});

	log('info', 'this {user} exists', { user });
	log('info', 'we call that user {name} with {id}', user);

	log('info', 'we also have inherited props like {pid}', {
		...user,
		pid: Deno.pid,
	});

	log('info', 'this {user} can send more properties than we want', {
		user,
		pid: Deno.pid,
	});
}

console.log('============ PRETTY ============\n');
example(pretty);

console.log('\n\n============ PLAIN ============\n');
example(plain);

console.log('\n\n============ BROWSER ============');
console.log('NOTE: we omit the level, as that is presented in the DevTools.\n');
example(browser);

console.log('\n\n============ CLEF (custom) ============\n');
example((level, message, props) => {
	let event = {
		'@t': new Date().toISOString(),
		'@l': level,
		'@m': interpolate(message, props || {}),
		'@mt': message,
		...props,
	};

	console.log(JSON.stringify(event));
});
