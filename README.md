# vm.js

[![Build Status](https://travis-ci.org/axetroy/vm.js.svg?branch=master)](https://travis-ci.org/axetroy/vm.js)
[![Coverage Status](https://coveralls.io/repos/github/axetroy/vm.js/badge.svg?branch=master)](https://coveralls.io/github/axetroy/vm.js?branch=master)
![License](https://img.shields.io/badge/license-MIT-green.svg)
[![Prettier](https://img.shields.io/badge/Code%20Style-Prettier-green.svg)](https://github.com/prettier/prettier)
![Node](https://img.shields.io/badge/node-%3E=7.6-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/%40axetroy%2Fvm.svg)](https://badge.fury.io/js/%40axetroy%2Fvm)
![Size](https://github-size-badge.herokuapp.com/axetroy/vm.js.svg)

Run Javascript code in ECMAScript, without eval(), new Function(), setTimeout()...

It base on [https://github.com/bramblex/jsjs](https://github.com/bramblex/jsjs)

[Try it out](https://axetroy.github.io/vm.js)

## Usage

```javascript
import vm from "@axetroy/vm";

const sanbox = { console: console };

const context = vm.createContext(sanbox);

try {
  vm.runInContext(`console.log("Hello world");`, context);
} catch (err) {
  console.error(err);
}
```

## Support

* [x] ECMA5
* [x] ES2015
  * [x] Let and const
  * [x] Block scoping
  * [x] ES modules
  * [x] Arrow functions
  * [x] Class
  * [x] Computed properties
  * [x] Destructuring
  * [x] For of
  * [x] Function/Class name
  * [x] Literals
  * [x] Object super
  * [x] Default and rest parameters
  * [x] Shorthand properties
  * [x] Spread
  * [x] Template literals
  * [x] Lifting template literal restriction
  * [ ] Unicode-regex
  * [x] Generator function
* [ ] ES2016
  * [x] Exponentiation operator
* [ ] ES2017
  * [x] Trailing commas in function parameter lists and calls
  * [ ] Async functions
  * [ ] Shared memory and atomics
* [ ] ES2018
  * [ ] Asynchronous iteration
  * [ ] Promise.prototype.finally()
  * [ ] s (dotAll) flag for regular expressions
  * [ ] RegExp named capture groups
  * [ ] RegExp Unicode Property Escapes
* [ ] Experimental
  * [x] Object rest spread
  * [x] Class property
  * [x] [Do expressions](https://github.com/tc39/proposal-do-expressions)
  * [ ] [Optional catch binding](https://github.com/tc39/proposal-optional-catch-binding)
  * [ ] [Decorators](https://github.com/tc39/proposal-decorators)
  * [x] [Global](https://github.com/tc39/proposal-global)

## Test

I have written a lot of test case for this, look at [here](https://github.com/axetroy/vm.js/tree/master/test)

Now it still in development, got a lot of work to do and more detail to resolve.

I will release the first stable version of write 500 test case.

If you want to join it. welcome to PR.

### How to run a single test

```bash
npx tsc && npx ava ./build/test/ecma5/array/
```

### How to run the whole test

```bash
npm run test
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

| [<img src="https://avatars1.githubusercontent.com/u/9758711?v=3" width="100px;"/><br /><sub>Axetroy</sub>](http://axetroy.github.io)<br />[💻](https://github.com/axetroy/vm.js/commits?author=axetroy) 🔌 [⚠️](https://github.com/axetroy/vm.js/commits?author=axetroy) [🐛](https://github.com/axetroy/vm.js/issues?q=author%3Aaxetroy) 🎨 |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |


<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

The [MIT License](https://github.com/axetroy/vm.js/blob/master/LICENSE)
