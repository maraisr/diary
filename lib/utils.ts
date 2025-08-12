export type Props<T> = T extends `${string}{${infer S}}${infer Rest}`
	? { [K in S]: unknown } & Props<Rest>
	: unknown;

let CURLY = /{([\s\S]*?)}/g;
let cache: Record<string, any> = {};
export function interpolate<const T extends string, O extends Pretty<Props<T>>>(
	message: T,
	props: O,
	to_string: (v: Value<O> | undefined, key: string, props: O) => string = String,
): string {
	let kv = cache[message] ||= message.split(CURLY);
	let s, k, i = 0, len = kv.length - 1, v_cache: Dict = {};

	for (s = k = ''; i < len;) {
		s += kv[i++];
		k = kv[i++];
		// TODO: if the v_cache value is nullish, we don't reuse the cached value — and we should
		s += v_cache[k] || (v_cache[k] = to_string(props[k as keyof O] as Value<O>, k, props));
	}

	return s + kv[i];
}

// ---

type Value<T> = T extends Array<any> ? T[number]
	: T extends Record<any, any> ? T[keyof T]
	: unknown;

/* @internal */
export type Dict<T = unknown> = Record<string, T>;

/* @internal */
export type Pretty<T> = { [K in keyof T]: T[K] } & unknown;
