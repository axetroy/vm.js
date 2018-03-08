import test from "ava";
import {isImportDefaultSpecifier} from "babel-types";
import {parse} from "babylon";
import vm from "../../../src/vm";

test("ImportDeclaration-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
import {b, c, d, isImportDefaultSpecifier} from 'babel-types';

module.exports = {b, c, d, isImportDefaultSpecifier};
  `,
    sandbox
  );

  t.deepEqual(obj.b, undefined);
  t.deepEqual(obj.c, undefined);
  t.deepEqual(obj.d, undefined);
  t.deepEqual(obj.isImportDefaultSpecifier, isImportDefaultSpecifier);
});

test("ImportDeclaration-2", t => {
  const sandbox: any = vm.createContext({});

  const outputParser: any = vm.runInContext(
    `
import {parse} from "babylon";

module.exports = parse;
  `,
    sandbox
  );
  t.true(outputParser === parse);
});
