import test from "ava";
import {isImportDefaultSpecifier} from "babel-types";
import vm from "../src/vm";

test("ExportDeclaration-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  a: 1,
  b: 2
};

export default obj;
export {obj}
  `,
    sandbox
  );

  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
  t.deepEqual(obj.obj, {
    a: 1,
    b: 2
  });
});

test("ExportDeclaration-2", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  a: 1,
  b: 2
};

export {obj}
export default obj;
  `,
    sandbox
  );

  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
  t.deepEqual(obj.obj, {
    a: 1,
    b: 2
  });
});

test("ExportDeclaration-3", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  a: 1,
  b: 2
};

const c = obj.a;
const d = obj.b;

export {obj, c, d}
export default obj;
  `,
    sandbox
  );

  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
  t.deepEqual(obj.c, 1);
  t.deepEqual(obj.d, 2);
  t.deepEqual(obj.obj, {
    a: 1,
    b: 2
  });
});
