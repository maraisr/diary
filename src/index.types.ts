import {
	type Diary,
	type Reporter,
	type LogLevels,
	type LogEvent,
	diary,
	enable,
} from 'diary';

declare function assert<T>(thing: T): void;

let scope = diary('name');
enable('*');

assert<Diary>(scope);
assert<Function>(enable);

scope.info('string');
scope.info(1);
scope.info([]);
scope.info({});
scope.info('string', {});

scope.info(new Error());
scope.fatal(new Error());
scope.warn(new Error());

diary('name');

// @ts-expect-error
diary({});

const reporter: Reporter = (event) => {
	assert<LogEvent>(event);

	assert<string>(event.name);
	assert<unknown[]>(event.messages);
	assert<LogLevels>(event.level);

	assert<void>(event.blah); // allows other things
};

diary('name', reporter);
