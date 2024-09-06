import type { Level } from 'diary';
import { interpolate } from 'diary/utils';

import { blue, bold, gray, magenta, red, yellow } from 'kleur/colors';

const LEVELS = {
	log: '◆ log   ' as const,
	debug: '● debug ' as const,
	info: 'ℹ info  ' as const,
	warn: '‼ warn  ' as const,
	error: '✗ error ' as const,
	fatal: '✗ fatal ' as const,
} as const;

function log(out: string, level: Level, message: string, props = {}): void {
	let args: unknown[] = [];
	out += interpolate(message, props, (value) => {
		args.push(value);
		return '%o';
	});

	console[level === 'fatal' ? 'error' : level](out, ...args);
}

export function browser(level: Level, message: string, props?: object | undefined): void {
	log('', level, message, props);
}

export function plain(level: Level, message: string, props?: object | undefined): void {
	log(LEVELS[level], level, message, props);
}

export function pretty(level: Level, message: string, props?: object | undefined): void {
	let l = LEVELS[level] as string;

	// deno-fmt-ignore
	switch (level) {
		case 'log': l = gray(l); break;
		case 'debug': l = magenta(l); break;
		case 'warn': l = yellow(l); break;
		case 'info': l = blue(l); break;
		case 'error': l = red(l); break;
		case 'fatal': l = bold(red(l)); break;
	}

	log(l, level, message, props);
}
