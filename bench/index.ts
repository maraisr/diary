// @ts-nocheck

import { suite } from '@marais/bench';
import bunyan from 'bunyan';
import debug from 'debug';
import pino from 'pino';
import fs from 'fs';
import { diary } from '../diary/node/index.js';

console.log('JIT');
await suite({
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

console.log('\nAOT');
await suite({
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
