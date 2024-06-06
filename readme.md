<br>

<div align="center">

<a href="https://git.new/log" aria-label="diary">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset=".github/logo_dark.svg">
        <img alt="diary logo" src=".github/logo_light.svg">
    </picture>
</a>

[![npm downloads](https://badgen.net/npm/dw/diary?color=black&label=npm%20downloads)](https://npm-stat.com/charts.html?package=diary)
[![size](https://badgen.net/bundlephobia/minzip/diary?color=black)](https://bundlephobia.com/package/diary)
[![licenses](https://licenses.dev/b/npm/diary?style=dark)](https://licenses.dev/npm/diary)

<br>

<sup>

This is free to use software, but if you do like it, consisder supporting me ❤️

[![sponsor me](https://badgen.net/badge/icon/sponsor?icon=github&label&color=grey)](https://github.com/sponsors/maraisr)
[![buy me a coffee](https://badgen.net/badge/icon/buy%20me%20a%20coffee?icon=buymeacoffee&label&color=grey)](https://www.buymeacoffee.com/marais)

</sup>

</div>

## ⚙️ Install

```shell
npm add diary
```

_Avaliable on [jsr](https://jsr.io/@mr/log), [NPM](https://npmjs.com/package/diary) and
[deno.land](https://deno.land/x/diary)_

## 🚀 Usage

```ts
import { diary } from 'diary';
import { pretty } from 'diary/output.console';

let user = { name: 'marais', type: 'admin' };

// 1️⃣ create a diary
let log = diary(pretty);

// 2️⃣ log something
log('info', '{name} is now {type}', user);
// ~> ℹ info marais is now admin

// 💡 log message as completely typesafe
log('debug', '{name} was created {at}', user);
//                                ^? Error: 'at' is not defined
```

</details>

Diary is an expressive structured logging library.

:construction: Talk about structured logging

:construction: Talk about fragments vs sentences

:construction: Talk about onEmit

:construction: Show /using and /stream

:construction: Complete examples

:construction: What does production look like?

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

> AOT: The logger is setup a head of time, and ops/sec is the result of calling the log fn.
> Simulates long running process, with a single logger. JIT: The logger is setup right before the
> log fn is called per op. Simulates setting up a logger per request for example.

## License

MIT © [Marais Rossouw](https://marais.io)
