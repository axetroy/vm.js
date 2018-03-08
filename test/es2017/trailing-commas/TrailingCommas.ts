import test from "ava";

import vm from "../../../src/vm";

test("TrailingCommas", t => {
  const sandbox: any = vm.createContext({});

  t.notThrows(function() {
    const num: any = vm.runInContext(
      `
function es8(var1, var2, var3,) {
  // ...
}

module.exports = es8;
    `,
      sandbox
    );
  });
});
