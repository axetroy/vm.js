import test from "ava";
import vm from "../../src/vm";

test("Assignment should calculate the right expression first", t => {
  const sandbox: any = vm.createContext({});

  try {
    vm.runInContext(
      `
const a = 123;

a = b
      `,
      sandbox
    );
    t.fail("it should throw an error");
  } catch (err) {
    t.deepEqual(err.message, "b is not defined");
  }
});
