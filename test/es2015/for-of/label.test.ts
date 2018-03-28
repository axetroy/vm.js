import test from "ava";
import { ErrDuplicateDeclard } from "../../../src/error";
import vm from "../../../src/vm";

test("break with label", t => {
  const sandbox: any = vm.createContext({});

  const index: any = vm.runInContext(
    `
loop1:
for (var index of [0, 1, 2, 3]){
  if (index===2){
    break loop1;
  }
}

module.exports = index;
  `,
    sandbox
  );
  t.deepEqual(index, 2);
});

test("continue with label", t => {
  const sandbox: any = vm.createContext({});

  const list: any = vm.runInContext(
    `
var list = [];
loop1:
for (var index of [0, 1, 2, 3]){
  if (index%2 === 0){
    continue;
  }
  list.push(index);
}

module.exports = list;
  `,
    sandbox
  );
  t.deepEqual(list, [1, 3]);
});
