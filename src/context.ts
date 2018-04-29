export interface ISandBox {
  [k: string]: any;
}

declare const WebAssembly: any;

const UNDEFINED: string = "undefined";

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
if (typeof Promise !== UNDEFINED) {
  DEFAULT_CONTEXT.Promise = Promise;
}

if (typeof Proxy !== UNDEFINED) {
  DEFAULT_CONTEXT.Proxy = Proxy;
}

if (typeof Reflect !== UNDEFINED) {
  DEFAULT_CONTEXT.Reflect = Reflect;
}

if (typeof Symbol !== UNDEFINED) {
  DEFAULT_CONTEXT.Symbol = Symbol;
}

if (typeof Set !== UNDEFINED) {
  DEFAULT_CONTEXT.Set = Set;
}

if (typeof WeakSet !== UNDEFINED) {
  DEFAULT_CONTEXT.WeakSet = WeakSet;
}

if (typeof Map !== UNDEFINED) {
  DEFAULT_CONTEXT.Map = Map;
}

if (typeof WeakMap !== UNDEFINED) {
  DEFAULT_CONTEXT.WeakMap = WeakMap;
}

if (typeof ArrayBuffer !== UNDEFINED) {
  DEFAULT_CONTEXT.ArrayBuffer = ArrayBuffer;
}

if (typeof SharedArrayBuffer !== UNDEFINED) {
  DEFAULT_CONTEXT.ArrayBuffer = SharedArrayBuffer;
}

if (typeof DataView !== UNDEFINED) {
  DEFAULT_CONTEXT.ArrayBuffer = DataView;
}

if (typeof Atomics !== UNDEFINED) {
  DEFAULT_CONTEXT.Atomics = Atomics;
}

if (typeof Float32Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Float32Array = Float32Array;
}

if (typeof Float64Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Float64Array = Float64Array;
}

if (typeof Int16Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Int16Array = Int16Array;
}

if (typeof Int32Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Int32Array = Int32Array;
}

if (typeof Int8Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Int32Array = Int8Array;
}

if (typeof Intl !== UNDEFINED) {
  DEFAULT_CONTEXT.Intl = Intl;
}

if (typeof Uint16Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Uint16Array = Uint16Array;
}

if (typeof Uint32Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Uint32Array = Uint32Array;
}

if (typeof Uint32Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Uint32Array = Uint32Array;
}

if (typeof Uint8Array !== UNDEFINED) {
  DEFAULT_CONTEXT.Uint8Array = Uint8Array;
}

if (typeof Uint8ClampedArray !== UNDEFINED) {
  DEFAULT_CONTEXT.Uint8ClampedArray = Uint8ClampedArray;
}

if (typeof WebAssembly !== UNDEFINED) {
  DEFAULT_CONTEXT.WebAssembly = WebAssembly;
}

export class Context {
  constructor(externalContext: ISandBox = {}) {
    const ctx = { ...DEFAULT_CONTEXT, ...externalContext };
    for (const attr in ctx) {
      if (ctx.hasOwnProperty(attr)) {
        this[attr] = ctx[attr];
      }
    }
  }
}
