import test from "ava";
import vm from "../../../src/vm";
import { ErrDuplicateDeclard } from "../../../src/error";

test("DoWhileStatement var in do block should cover the parent scope", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 1;

do {
  var a = 2; // parent scope have a = 1, here is the child scope
} while (false);

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 2);
});

test("DoWhileStatement let in do block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

do {
  let a = 2;  // define in his own scope
  b = a;
} while (false)

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
});

test("DoWhileStatement const in do block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

do {
  const a = 2;  // define in his own scope
  b = a;
} while (false)

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
});

test("var in do block and parent scope const some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
let a = 1;  // define let var

do{
  var a = 2;  // define var, it should throw
}while(false)

module.exports = {a: a};
    `,
      sandbox
    );
  }, new ErrDuplicateDeclard("a").message);
});
