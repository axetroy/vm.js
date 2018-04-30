import test from "ava";
import vm from "../../../src/vm";

// babylon always in strict mode
// and strict mode disable with
test("not support yet", t => {
  const sandbox: any = vm.createContext({ console });

  t.throws(function() {
    vm.runInContext(
      `
function func(x, o) {
  with (o) {
    console.log(x);
  }
}
    `,
      sandbox
    );
  }, "'with' in strict mode (3:2)");
});
