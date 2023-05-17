<div align="center">
	<h1><img src="./shots/logo.png" alt="diary"/></h1>
	<p align="center"><code>npm add diary</code> makes logging simple</p>
	<hr />
	<span>
		<a href="https://github.com/maraisr/diary/actions/workflows/ci.yml">
			<img src="https://github.com/maraisr/diary/actions/workflows/ci.yml/badge.svg"/>
		</a>
		<a href="https://npm-stat.com/charts.html?package=diary">
			<img src="https://badgen.net/npm/dm/diary" alt="downloads"/>
		</a>
		<a href="https://bundlephobia.com/result?p=diary">
			<img src="https://badgen.net/bundlephobia/minzip/diary" alt="size"/>
		</a>
	</span>
</div>

## ⚡ Features

- No [dependencies](https://npm.anvaka.com/#/view/2d/diary)
- Outstanding [performance](#-benchmark)
- Support for [`debug`'s filter](https://www.npmjs.com/package/debug#wildcards)

## ⚙️ Install

```sh
npm add diary
```

## 🚀 Usage

```ts
import { info, diary, enable } from 'diary';

// 1️⃣ Choose to enable the emission of logs, or not.
enable('*');

// 2️⃣ log something
info('this important thing happened');
// ~> ℹ info  this important thing happened

// Maybe setup a scoped logger
const scopedDiary = diary('my-module', (event) => {
  if (event.level === 'error') {
    Sentry.captureException(event.error);
  }
});

// 3️⃣ log more things
scopedDiary.info('this other important thing happened');
// ~> ℹ info  [my-module] this other important thing happened
```

<details><summary>Node users</summary>

The `enable` function is executed for you from the `DEBUG` environment variable. And as a drop in replacement for
`debug`.

```shell
DEBUG=client:db,server:* node example.js
```

</details>

## 🔎 API

### diary(name: string, onEmit?: Reporter)

Returns: [log functions](#log-functions)

> A default diary is exported, accessible through simply importing any [log function](#log-functions).
>
> <details>
> <summary>Example of default diary</summary>
>
> ```ts
> import { info } from 'diary';
>
> info("i'll be logged under the default diary");
> ```
>
> </details>

#### name

Type: `string`

The name given to this _diary_—and will also be available in all logEvents.

#### onEmit <small>(optional)</small>

Type: `Reporter`

A reporter is run on every log message (provided its [enabled](#enablequery-string)). A reporter gets given the
`LogEvent` interface:

```ts
interface LogEvent {
  name: string;
  level: LogLevels;

  messages: any[];
}
```

> _Note_: you can attach any other context in middleware.
>
> <details><summary>Example</summary>
>
> ```ts
> import { diary, default_reporter } from 'diary';
> const scope = diary('scope', (event) => {
>   event.ts = new Date();
>   return default_reporter(event);
> });
> ```
>
> </details>

Errors (for `error` and `fatal`) there is also an `error: Error` property.

### _log functions_

A set of functions that map to `console.error`, `console.warn`, `console.debug`, `console.info` and `console.info`.
Aptly named;

`fatal`, `error`, `warn`, `debug`, `info`, and `log`. All of which follow the same api signature:

```ts
declare logFunction(message: object | Error | string, ...args: unknown[]): void;
```

All parameters are simply spread onto the function and reported. Node/browser's built-in formatters will format any
objects (by default).

```ts
info('hi there'); // ℹ info  hi there
info('hi %s', 'there'); // ℹ info  hi there
info('hi %j', { foo: 'bar' }); // ℹ info hi { "foo": "bar" }
info('hi %o', { foo: 'bar' }); // ℹ info hi { foo: 'bar' }
info({ foo: 'bar' }); // ℹ info { foo: 'bar' }
```

#### diary <small>(optional)</small>

Type: `Diary`

The result of a calling [diary](#diary-name-string);

### enable(query: string)

Type: `Function`

Opts certain log messages into being output. See more [here](#programmatic).

## 💨 Benchmark

> via the [`/bench`](/bench) directory with Node v18.10.0

```
JIT
✔ diary  ~ 1,418,275 ops/sec ± 0.21%
✔ pino   ~    46,952 ops/sec ± 0.02%
✔ bunyan ~     9,755 ops/sec ± 0.01%
✔ debug  ~   438,651 ops/sec ± 0.22%

AOT
✔ diary  ~ 1,575,156 ops/sec ± 0.28%
✔ pino   ~   280,462 ops/sec ± 0.03%
✔ bunyan ~   602,219 ops/sec ± 0.15%
✔ debug  ~ 1,303,441 ops/sec ± 0.23%
```

> AOT: The logger is setup a head of time, and ops/sec is the result of calling the log fn. Simulates long running
> process, with a single logger. JIT: The logger is setup right before the log fn is called per op. Simulates setting up
> a logger per request for example.

## Related

- [workers-logger](https://github.com/maraisr/workers-logger) — fast and effective logging for
  [Cloudflare Workers](https://workers.cloudflare.com/)

## License

MIT © [Marais Rossouw](https://marais.io)
