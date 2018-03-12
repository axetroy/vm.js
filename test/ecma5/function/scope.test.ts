import test from "ava";
import vm from "../../../src/vm";
import { ErrDuplicateDeclard } from "../../../src/error";

test("function have it's own scope even with var", t => {
  const sandbox: any = vm.createContext({});

  const { get, getA }: any = vm.runInContext(
    `
var a = 1;

function get(){
  var a = 2; // function have it's own scope
  return a;
}

function getA(){
  return a;
}

module.exports = {get: get, getA: getA};
  `,
    sandbox
  );
  t.deepEqual(get(), 2);
  t.deepEqual(getA(), 1);
});

test("function have it's own scope even with let", t => {
  const sandbox: any = vm.createContext({});

  const { get, getA }: any = vm.runInContext(
    `
var a = 1;

function get(){
  let a = 2; // function have it's own scope
  return a;
}

function getA(){
  return a;
}

module.exports = {get: get, getA: getA};
  `,
    sandbox
  );
  t.deepEqual(get(), 2);
  t.deepEqual(getA(), 1);
});

test("function have it's own scope even with const", t => {
  const sandbox: any = vm.createContext({});

  const { get, getA }: any = vm.runInContext(
    `
var a = 1;

function get(){
  const a = 2; // function have it's own scope
  return a;
}

function getA(){
  return a;
}

module.exports = {get: get, getA: getA};
  `,
    sandbox
  );
  t.deepEqual(get(), 2);
  t.deepEqual(getA(), 1);
});

test("function scope can redeclare with var", t => {
  const sandbox: any = vm.createContext({});

  const { get, getA }: any = vm.runInContext(
    `
var a = 1;

function get(){
  var a = 2;
  var a = 3;
  return a;
}

function getA(){
  return a;
}

module.exports = {get: get, getA: getA};
  `,
    sandbox
  );
  t.deepEqual(get(), 3);
  t.deepEqual(getA(), 1);
});

test("function scope can not redeclare with let", t => {
  const sandbox: any = vm.createContext({});

  const { get }: any = vm.runInContext(
    `
var a = 1;

function get(){
  let a = 2;
  var a = 3;
  return a;
}

module.exports = {get: get};
  `,
    sandbox
  );
  t.throws(function() {
    get();
  }, new ErrDuplicateDeclard("a").message);
});

test("function scope can not redeclare with const", t => {
  const sandbox: any = vm.createContext({});

  const { get }: any = vm.runInContext(
    `
var a = 1;

function get(){
  const a = 2;
  var a = 3;
  return a;
}

module.exports = {get: get};
  `,
    sandbox
  );
  t.throws(function() {
    get();
  }, new ErrDuplicateDeclard("a").message);
});
