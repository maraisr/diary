process.env.DEBUG = 'standard';
// @ts-ignore
process.env.ROARR_LOG = true; // for roarr

import { Suite } from 'benchmark';
import bunyan from 'bunyan';
import debug from 'debug';
import pino from 'pino';
import roarr, { ROARR } from 'roarr';
import ulog from 'ulog/full';
import { equal } from 'uvu/assert';
import winston from 'winston';
import { diary, middleware } from '../lib';

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

ROARR.write = () => {};

(async function () {
	await runner({
		diary() {
			const suite = diary('standard');
			let events: any[] = [];
			middleware((logEvent) => {
				events.push(logEvent);
			}, suite);
			suite.info('info message');
			return events;
		},
		ulog() {
			let events: any[] = [];
			ulog.use([
				{
					outputs: {
						custom: {
							log(...args) {
								events.push(args);
							},
						},
					},
				},
			]);
			const suite = ulog('standard');
			suite.output = 'custom';
			suite.info('info message');
			return events;
		},
		roarr() {
			let events: any[] = [];
			const suite = roarr.child((message) => {
				events.push(message);
			});
			suite.info('info message');
			return events;
		},
		bunyan() {
			let events: any[] = [];
			const suite = bunyan.createLogger({
				name: 'standard',
				stream: {
					write(message) {
						events.push(message);
					},
				},
			});
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
