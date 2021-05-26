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
- Middleware to pipe into Sentry or alike

## ⚙️ Install

```sh
npm add diary
```

## 🚀 Usage

```ts
import { info, diary, after } from 'diary';

after((logEvent) => {
  if (logEvent.level === 'error') {
    Sentry.captureException(logEvent.extra[0]);
  }
});

info('this important thing happened');
// ~> ℹ info  this important thing happened

const scopedDiary = diary('my-module');
scopedDiary.info('this other important thing happened');
// ~> ℹ info  [my-module] this other important thing happened
```

Controlling runtime emission of logs:

### _browser_

```ts
import { diary } from 'diary';

localStorage.setItem('DEBUG', 'scopeA:two,scopeB:*');

const scopeA1 = diary('scopeA:one');
const scopeA2 = diary('scopeA:two');
const scopeB1 = diary('scopeB:one');
const scopeB2 = diary('scopeB:two');

scopeA1.info('message'); // won't log ✗
scopeA2.info('message'); // will log ✔
scopeB1.info('message'); // will log ✔
scopeB2.info('message'); // will log ✔
```

#### _node_

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

> `$ DEBUG=scopeA:two,scopeB:* node example.js`

#### _~ programmatic_

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

### diary(name: string)

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

The name given to this _diary_, will appear in the middleware under the `name` property as well as in console messages.

### _log functions_

A set of functions that map to `console.error`, `console.warn`, `console.debug`, `console.info` and `console.info`.
Aptly named;

- `fatal(message: string|Error, ...extra: any[])`
- `error(message: string|Error, ...extra: any[])`

  If an `Error` instance is sent, the error object will be accessible through the first item in the `extra`'s array in a
  middleware. This is for both `fatal` and `error`.

- `warn(message: string, ...extra: any[])`
- `debug(message: string, ...extra: any[])`
- `info(message: string, ...extra: any[])`
- `log(message: string, ...extra: any[])`

All `extra` parameters are simply spread onto the console function, so node/browser's built-in formatters will format
any objects etc.

## {before,after}(callback: function, diary?: Diary)

Returns: `Dispose`

Middlewares are function handlers that run for every [log function](#log-functions). They allow for modifying the log
event object, or simply returning `false` to bailout. Executing in a _forwards_ direction, meaning middlewares will be
run sequentially as they were defined.

When the return is called, it will remove the middleware from the diary instance.

#### handler

Type: `Function`

Which gets given a single argument of:

```ts
interface LogEvent {
  name: string;
  level: LogLevels;
  message: string;
  extra: unknown[];
}
```

<details>
<summary>Example</summary>

```ts
import { before, after, info } from 'diary';

before((logEvent) => {
  logEvent.context = {
    hello: 'world',
  };
});

after((logEvent) => {
  if (logEvent.level === 'error') {
    fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({
        error: logEvent.extra[0],
        context: logEvent.context,
      }),
    });
  }
});

info('something informative');
```

> This method isn't a Promise, so won't be awaited. It's a fire and forget kinda deal.

</details>

#### diary <small>(optional)</small>

Type: `Diary`

The result of a calling [diary](#diary-name-string);

A middleware without the optional second parameter, will run for all diaries.

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
  @graphile/logger     x 21,752,928 ops/sec ±1.21% (92 runs sampled)
  bunyan               x 117,223 ops/sec ±0.26% (93 runs sampled)
  debug                x 234,245 ops/sec ±1.16% (90 runs sampled)
  diary                x 808,195 ops/sec ±1.96% (82 runs sampled)
  pino                 x 49,953 ops/sec ±0.71% (94 runs sampled)
  roarr                x 809,954 ops/sec ±1.52% (92 runs sampled)
  ulog                 x 23,824 ops/sec ±24.29% (18 runs sampled)
  winston              x 12,104 ops/sec ±4.96% (85 runs sampled)
```

> Ran with Node v16.0.0

## License

MIT © [Marais Rossouw](https://marais.io)
