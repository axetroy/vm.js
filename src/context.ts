import { UNDEFINED } from "./constant";

export interface ISandBox {
  [k: string]: any;
}

declare const WebAssembly: any;

// ECMA standar refs: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects
export const DEFAULT_CONTEXT: ISandBox = {
  Function,
  Array,
  Boolean,
  clearInterval,
  clearTimeout,
  console,
  Date,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  Error,
  escape,
  eval,
  EvalError,
  Infinity,
  isFinite,
  isNaN,
  JSON,
  Math,
  NaN,
  Number,
  ["null"]: null,
  [UNDEFINED]: void 0,
  Object,
  parseFloat,
  parseInt,
  RangeError,
  ReferenceError,
  RegExp,
  setInterval,
  setTimeout,
  String,
  SyntaxError,
  TypeError,
  unescape,
  URIError
};

// need to polyfill by user
/* istanbul ignore if */
if (typeof Promise !== UNDEFINED) {
  DEFAULT_CONTEXT.Promise = Promise;
}

/* istanbul ignore if */
if (typeof Proxy !== UNDEFINED) {
  DEFAULT_CONTEXT.Proxy = Proxy;
}

/* istanbul ignore if */
if (typeof Reflect !== UNDEFINED) {
  DEFAULT_CONTEXT.Reflect = Reflect;
}

/* istanbul ignore if */
if (typeof Symbol !== UNDEFINED) {
  DEFAULT_CONTEXT.Symbol = Symbol;
}

/* istanbul ignore if */
if (typeof Set !== UNDEFINED) {
  DEFAULT_CONTEXT.Set = Set;
}

/* istanbul ignore if */
if (typeof WeakSet !== UNDEFINED) {
  DEFAULT_CONTEXT.WeakSet = WeakSet;
}

/* istanbul ignore if */
if (typeof Map !== UNDEFINED) {
  DEFAULT_CONTEXT.Map = Map;
}

/* istanbul ignore if */
if (typeof WeakMap !== UNDEFINED) {
  DEFAULT_CONTEXT.WeakMap = WeakMap;
}

/* istanbul ignore if */
if (typeof ArrayBuffer !== UNDEFINED) {
  DEFAULT_CONTEXT.ArrayBuffer = ArrayBuffer;
}

/* istanbul ignore if */
if (typeof SharedArrayBuffer !== UNDEFINED) {
  DEFAULT_CONTEXT.ArrayBuffer = SharedArrayBuffer;
}

/* istanbul ignore if */
if (typeof DataView !== UNDEFINED) {
  DEFAULT_CONTEXT.ArrayBuffer = DataView;
}

/* istanbul ignore if */
if (typeof Atomics !== UNDEFINED) {
  DEFAULT_CONTEXT.Atomics = Atomics;
}

/* istanbul ignore if */
if (typeof Float32Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Float32Array = Float32Array;
}

/* istanbul ignore if */
if (typeof Float64Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Float64Array = Float64Array;
}

/* istanbul ignore if */
if (typeof Int16Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Int16Array = Int16Array;
}

/* istanbul ignore if */
if (typeof Int32Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Int32Array = Int32Array;
}

/* istanbul ignore if */
if (typeof Int8Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Int32Array = Int8Array;
}

/* istanbul ignore if */
if (typeof Intl !== UNDEFINED) {
  DEFAULT_CONTEXT.Intl = Intl;
}

/* istanbul ignore if */
if (typeof Uint16Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Uint16Array = Uint16Array;
}

/* istanbul ignore if */
if (typeof Uint32Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Uint32Array = Uint32Array;
}

/* istanbul ignore if */
if (typeof Uint8Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Uint8Array = Uint8Array;
}

/* istanbul ignore if */
if (typeof Uint8ClampedArray !== UNDEFINED) {
  DEFAULT_CONTEXT.Uint8ClampedArray = Uint8ClampedArray;
}

/* istanbul ignore if */
if (typeof WebAssembly !== UNDEFINED) {
  DEFAULT_CONTEXT.WebAssembly = WebAssembly;
}

export class Context {
  constructor(externalContext: ISandBox = {}) {
    const ctx = { ...DEFAULT_CONTEXT, ...externalContext };
    for (const attr in ctx) {
      /* istanbul ignore next */
      if (ctx.hasOwnProperty(attr)) {
        this[attr] = ctx[attr];
      }
    }
  }
}
