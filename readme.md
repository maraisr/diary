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
- Browser compatible through `localStorage`

## ⚙️ Install

```sh
npm add diary
```

## 🚀 Usage

```ts
import { info, diary } from 'diary';

info('this important thing happened');
// ~> ℹ info  this important thing happened

const scopedDiary = diary('my-module', (event) => {
  if (event.level === 'error') {
    Sentry.captureException(event.error);
  }
});

scopedDiary.info('this other important thing happened');
// ~> ℹ info  [my-module] this other important thing happened
```

Controlling runtime emission of logs, using the code below as an example:

```ts
// example.js
import { diary } from 'diary';

const scopeA1 = diary('scopeA:one');
const scopeA2 = diary('scopeA:two');
const scopeB1 = diary('scopeB:one');
const scopeB2 = diary('scopeB:two');

scopeA1.info('message'); // won't log ✗
scopeA2.info('message'); // will log ✔
scopeB1.info('message'); // will log ✔
scopeB2.info('message'); // will log ✔
```

#### _browser_

```ts
localStorage.setItem('DEBUG', 'scopeA:two,scopeB:*');

// then your scripts
```

> 💡 Tip - Set this via the DevTools, then hit refresh. Saves you having to re-bundle.

#### _node_

```sh
DEBUG=scopeA:two,scopeB:* node example.js
```

#### _workers_

Create an [Environment Variable](https://developers.cloudflare.com/workers/platform/environments) with `DEBUG`.

> ⚠️ Specifically referencing the Cloudflare Workers

#### _programmatic_

```ts
import { diary, enable } from 'diary';

enable('scopeA:two,scopeB:*');

const scopeA1 = diary('scopeA:one');
const scopeA2 = diary('scopeA:two');
const scopeB1 = diary('scopeB:one');
const scopeB2 = diary('scopeB:two');

scopeA1.info('message'); // won't log ✗
scopeA2.info('message'); // will log ✔
scopeB1.info('message'); // will log ✔
scopeB2.info('message'); // will log ✔

enable('scopeA:*');

scopeA1.info('message'); // will log ✔
scopeA2.info('message'); // will log ✔
scopeB1.info('message'); // won't log ✗
scopeB2.info('message'); // won't log ✗
```

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

  message: string;
  extra: unknown[];
}
```

Errors (for `error` and `fatal`) there is also an `error: Error` property.

### _log functions_

A set of functions that map to `console.error`, `console.warn`, `console.debug`, `console.info` and `console.info`.
Aptly named;

- `fatal(message: string | Error, ...extra: any[])`
- `error(message: string | Error, ...extra: any[])`

  If an `Error` instance is sent, the error object will be accessible with the `error` property on the context, this is
  for both `fatal` and `error`.

- `warn(message: string, ...extra: any[])`
- `debug(message: string, ...extra: any[])`
- `info(message: string, ...extra: any[])`
- `log(message: string, ...extra: any[])`

All `extra` parameters are simply spread onto the console function, so node/browser's built-in formatters will format
any objects etc.

#### diary <small>(optional)</small>

Type: `Diary`

The result of a calling [diary](#diary-name-string);

### enable(query: string)

Type: `Function`

Opts certain log messages into being output. See more [here](#programmatic).

## 💨 Benchmark

```
Validation
✔ @graphile/logger
✔ bunyan
✔ debug
✔ diary
✔ pino
✔ roarr
✔ ulog
✔ winston

Benchmark
  @graphile/logger     x 21,417,769 ops/sec ±0.93% (88 runs sampled)
  bunyan               x    106,926 ops/sec ±0.51% (89 runs sampled)
  debug                x    211,093 ops/sec ±2.97% (87 runs sampled)
  diary                x  7,065,357 ops/sec ±1.19% (93 runs sampled)
  pino                 x     47,892 ops/sec ±2.23% (89 runs sampled)
  roarr                x    915,109 ops/sec ±1.28% (95 runs sampled)
  ulog                 x     25,188 ops/sec ±26.16% (18 runs sampled)
  winston              x     11,554 ops/sec ±10.20% (78 runs sampled)
```

> Ran with Node v16.2.0

## License

MIT © [Marais Rossouw](https://marais.io)
