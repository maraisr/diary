import type { Dict, Pretty, Props } from './utils.ts';

export type Level = 'log' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogEvent = Parameters<OnEmitFn>;

export interface OnEmitFn {
	(level: Level, message: string, props?: Dict | undefined): any;
}

export interface Diary<Ctx = unknown> {
	<const T extends string, Params extends Pretty<Omit<Props<T>, keyof Ctx>>>(
		level: Level,
		template: T,
		...args: keyof Params extends never ? [] : Params extends object ? [properties: Params] : []
	): void;
}

export function diary(onEmit: OnEmitFn): Diary<unknown> {
	return onEmit;
}
