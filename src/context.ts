export interface Sandbox$ {
  [k: string]: any;
}

import g from "./global";

const defaultContext: Sandbox$ = {
  console,

  setTimeout,
  setInterval,

  clearTimeout,
  clearInterval,

  encodeURI,
  encodeURIComponent,
  decodeURI,
  decodeURIComponent,
  escape,
  unescape,

  Infinity,
  NaN,
  isFinite,
  isNaN,
  parseFloat,
  parseInt,
  Object,
  Boolean,
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
  Number,
  Math,
  Date,
  String,
  RegExp,
  Array,
  JSON,
  Promise
};

export default class Context {
  public global: any = g;
  constructor(externalContext: Sandbox$ = {}) {
    const ctx = Object.assign(defaultContext, externalContext);
    for (let attr in ctx) {
      this[attr] = ctx[attr];
    }
  }
}
