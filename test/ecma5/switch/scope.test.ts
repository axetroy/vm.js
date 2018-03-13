import test from "ava";
import { ErrDuplicateDeclard } from "../../../src/error";
import vm from "../../../src/vm";

test("var in switch block should cover the parent scope", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = "a";

switch (a) {
  case "a":
    var a = "b";
    break;
  case "b":
    break;
  default:
    break;
}

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, "b");
});

test("let in switch block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = "a";
var b;

switch (a) {
  case "a":
    let a = "b";
    b = a;
    break;
  case "b":
    break;
  default:
    break;
}

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, "a");
  t.deepEqual(obj.b, "b");
});

test("const in switch block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = "a";
var b;

switch (a) {
  case "a":
    const a = "b";
    b = a;
    break;
  case "b":
    break;
  default:
    break;
}

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, "a");
  t.deepEqual(obj.b, "b");
});

test("var in switch block and parent scope let some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
let a = "a";

switch (a) {
  case "a":
    var a = "b";
    break;
  case "b":
    break;
  default:
    break;
}
    `,
      sandbox
    );
  }, ErrDuplicateDeclard("a").message);
});

test("var in switch block and parent scope const some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
const a = "a";

switch (a) {
  case "a":
    var a = "b";
    break;
  case "b":
    break;
  default:
    break;
}
    `,
      sandbox
    );
  }, ErrDuplicateDeclard("a").message);
});

test("switch scope should share scope in each case", t => {
  const sandbox: any = vm.createContext({});

  const obj = vm.runInContext(
    `
const a = "a";
var b;
const obj = {};

switch (true) {
case true:
  let a = "b";
  obj.a = a;
case true:
  obj.b = a;
default:
  obj.default = a;
}

module.exports = obj;
  `,
    sandbox
  );

  t.deepEqual(obj.a, "b");
  t.deepEqual(obj.b, "b");
  t.deepEqual(obj.default, "b");
});
