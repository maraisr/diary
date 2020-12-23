import { Suite } from 'benchmark';
import { equal } from 'uvu/assert';
import { diary, middleware } from '../lib';
import debug from 'debug';
import pino from 'pino';
import winston from 'winston';

const trap_console = (verb: keyof typeof console) => {
	const old = console[verb];
	console[verb] = () => {};
	return () => (console[verb] = old);
};

trap_console('info');

async function runner(candidates: Record<string, Function>) {
	const bench = new Suite().on('cycle', (e) => {
		console.log('  ' + e.target);
	});

	console.log('\nValidation');
	for (const [name, fn] of Object.entries(candidates)) {
		const trap = trap_console('log');
		const result = fn();
		trap();
		try {
			equal(result.length, 1);
			console.log(`✔`, name);
		} catch (err) {
			console.log('✘', name, `(FAILED @ "${err.message}")`);
		}
	}

	console.log('\nBenchmark');
	const trap = trap_console('log');
	for (const [name, fn] of Object.entries(candidates)) {
		bench.add(name.padEnd(10), {
			fn,
		});
	}
	trap();

	return new Promise((resolve) => {
		bench.on('complete', resolve);
		bench.run();
	});
}

(async function () {
	await runner({
		diary() {
			const suite = diary('standard');
			let events: any[] = [];
			middleware((logEvent) => {
				events.push(logEvent);
				return logEvent;
			}, suite);
			suite.info('info message');
			return events;
		},
		debug() {
			const suite = debug('standard');
			suite.enabled = true;
			let events: any[] = [];
			suite.log = (message) => {
				events.push(message);
			};
			suite('info message');
			return events;
		},
		pino() {
			let events: any[] = [];
			const suite = pino({
				writable: true,
				write(message) {
					events.push(message);
				},
			});
			suite.info('info message');
			return events;
		},
		winston() {
			let events: any[] = [];
			const suite = winston.createLogger({
				transports: [
					new winston.transports.Console({
						log(info, next) {
							events.push(info);
							return next();
						},
					}),
				],
			});
			suite.info('info message');
			return events;
		},
	});
})();
