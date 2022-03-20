// @ts-nocheck

import { Suite } from 'benchmark';
import bunyan from 'bunyan';
import debug from 'debug';
import pino from 'pino';
import fs from 'fs';
import { diary } from '../diary/node';

async function runner(name: string, candidates: Record<string, Function>) {
	const sorted_candidates = Object.entries(candidates).sort(([a], [b]) =>
		a.localeCompare(b),
	);

	// ~ Benchmarking

	const suite = new Suite();
	const previous = suite.add.bind(suite);
	suite.on('cycle', (e) => console.log('  ' + e.target));
	suite.add = (name, runner) => previous(name.padEnd(20), runner);

	console.log(`\nbenchmark :: ${name}`);
	for (const [name, fn] of sorted_candidates) {
		const instance = fn();
		suite.add(name, instance);
	}

	return new Promise((resolve) => {
		suite.on('complete', resolve);
		suite.run();
	});
}

runner('jit', {
	diary() {
		const ws = fs.createWriteStream('/dev/null');
		const sink = (event) => {
			ws.write(JSON.stringify(event));
		};

		return () => {
			const suite = diary('standard', sink);
			suite.info('info message');
		};
	},
	pino() {
		const sink = pino.destination({
			dest: '/dev/null',
			minLength: 0,
			sync: true,
		});

		return () => {
			const suite = pino(sink);
			suite.info('info message');
		};
	},
	bunyan() {
		const sink = fs.createWriteStream('/dev/null');

		return () => {
			const suite = bunyan.createLogger({
				name: 'standard',
				stream: sink,
			});
			suite.info('info message');
		};
	},
	debug() {
		const ws = fs.createWriteStream('/dev/null');
		const sink = (event) => {
			ws.write(event);
		};

		return () => {
			const suite = debug('standard');
			suite.enabled = true;
			suite.log = sink;
			suite('info message');
		};
	},
});

runner('aot', {
	diary() {
		const ws = fs.createWriteStream('/dev/null');
		const sink = (event) => {
			ws.write(JSON.stringify(event));
		};
		const suite = diary('standard', sink);

		return () => {
			suite.info('info message');
		};
	},
	pino() {
		const sink = pino.destination({
			dest: '/dev/null',
			minLength: 0,
			sync: true,
		});

		const suite = pino(sink);

		return () => {
			suite.info('info message');
		};
	},
	bunyan() {
		const sink = fs.createWriteStream('/dev/null');
		const suite = bunyan.createLogger({
			name: 'standard',
			stream: sink,
		});

		return () => {
			suite.info('info message');
		};
	},
	debug() {
		const ws = fs.createWriteStream('/dev/null');
		const sink = (event) => {
			ws.write(event);
		};

		const suite = debug('standard');
		suite.enabled = true;
		suite.log = sink;

		return () => {
			suite('info message');
		};
	},
});
