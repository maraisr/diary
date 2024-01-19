<div align="center">

<samp>

# ![diary](./shots/logo.png)

</samp>

</div>

<div align="left">

**Dear diary, you make my logging so easy**

<a href="https://npm-stat.com/charts.html?package=diary">
  <img src="https://badgen.net/npm/dm/diary?color=black&label=npm%20downloads" alt="js downloads">
</a>
<a href="https://licenses.dev/npm/diary">
  <img src="https://licenses.dev/b/npm/diary?style=dark" alt="licenses" />
</a>
<a href="https://unpkg.com/diary/">
  <img src="https://img.badgesize.io/https://unpkg.com/diary/browser.mjs?compression=gzip&label=gzip&color=black" alt="gzip size" />
</a>
<a href="https://unpkg.com/diary/index.mjs">
  <img src="https://img.badgesize.io/https://unpkg.com/diary/browser.mjs?compression=brotli&label=brotli&color=black" alt="brotli size" />
</a>

<br>
<br>

<sup>

This is free to use software, but if you do like it, consisder supporting me ❤️

[![sponsor me](https://badgen.net/badge/icon/sponsor?icon=github&label&color=gray)](https://github.com/sponsors/maraisr)
[![buy me a coffee](https://badgen.net/badge/icon/buymeacoffee?icon=buymeacoffee&label&color=gray)](https://www.buymeacoffee.com/marais)

</sup>

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

> via the [`/bench`](/bench) directory with Node v20.2.0

```
JIT
✔ diary  ~ 1,434,414 ops/sec ± 0.16%
✔ pino   ~    47,264 ops/sec ± 0.02%
✔ bunyan ~     9,644 ops/sec ± 0.01%
✔ debug  ~   444,612 ops/sec ± 0.22%

AOT
✔ diary  ~ 1,542,796 ops/sec ± 0.29%
✔ pino   ~   281,232 ops/sec ± 0.03%
✔ bunyan ~   588,768 ops/sec ± 0.16%
✔ debug  ~ 1,287,846 ops/sec ± 0.24%
```

> AOT: The logger is setup a head of time, and ops/sec is the result of calling the log fn. Simulates long running
> process, with a single logger. JIT: The logger is setup right before the log fn is called per op. Simulates setting up
> a logger per request for example.

## Related

- [workers-logger](https://github.com/maraisr/workers-logger) — fast and effective logging for
  [Cloudflare Workers](https://workers.cloudflare.com/)

## License

MIT © [Marais Rossouw](https://marais.io)
