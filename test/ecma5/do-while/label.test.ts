import test from "ava";
import { ErrDuplicateDeclard } from "../../../src/error";
import vm from "../../../src/vm";

test("break with label", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 1;

doLoop:
do {
  a++;
  break doLoop;
} while (true);

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 2);
});

test("continue with label", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 1;

doLoop:
do {
  a++;
  continue doLoop;
} while (a<10);

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 10);
});
