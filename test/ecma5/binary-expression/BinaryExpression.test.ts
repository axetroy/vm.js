import test from "ava";
import vm from "../../../src/vm";

test("+", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 1 + 2;
  `,
    sandbox
  );
  t.deepEqual(num, 3);
});

test("+=", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
var a = 1;
var b = 2;
a += 2;
module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(num, 3);
});

test("-", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 2 - 1;
  `,
    sandbox
  );
  t.deepEqual(num, 1);
});

test("-=", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
var a = 1;
var b = 2;
a -= 2;
module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(num, -1);
});

test("*", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 2 * 1;
  `,
    sandbox
  );
  t.deepEqual(num, 2);
});

test("*=", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
var a = 1;
var b = 2;
a *= 2;
module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(num, 2);
});

test("/", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 2 / 1;
  `,
    sandbox
  );
  t.deepEqual(num, 2);
});

test("/=", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
var a = 1;
var b = 2;
a /= 2;
module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(num, 0.5);
});

test("%", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 2 % 1;
  `,
    sandbox
  );
  t.deepEqual(num, 0);
});

test("%=", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
var a = 1;
var b = 2;
a %= 2;
module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(num, 1);
});

test("**", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 2 ** 2;
  `,
    sandbox
  );
  t.deepEqual(num, 4);
});

test(">", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = 2 > 2;
  `,
    sandbox
  );
  t.deepEqual(output, false);
});

test(">=", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = 2 >= 2;
  `,
    sandbox
  );
  t.deepEqual(output, true);
});

test("<", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = 2 < 2;
  `,
    sandbox
  );
  t.deepEqual(output, false);
});

test("<=", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = 2 <= 2;
  `,
    sandbox
  );
  t.deepEqual(output, true);
});

test(">>", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = 2 >> 2;
  `,
    sandbox
  );
  t.deepEqual(output, 0);
});

test(">>>", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = 2 >>> 2;
  `,
    sandbox
  );
  t.deepEqual(output, 0);
});

test("<<", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = 2 << 2;
  `,
    sandbox
  );
  t.deepEqual(output, 8);
});

test("&", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = 2 & 2;
  `,
    sandbox
  );
  t.deepEqual(output, 2);
});

test("|", t => {
  const sandbox: any = vm.createContext({});

  const output: any = vm.runInContext(
    `
module.exports = 2 | 2;
  `,
    sandbox
  );
  t.deepEqual(output, 2);
});
