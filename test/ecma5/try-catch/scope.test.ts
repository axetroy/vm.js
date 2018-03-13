import test from "ava";
import { ErrDuplicateDeclard } from "../../../src/error";
import vm from "../../../src/vm";

test("var in try block should cover the parent scope", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 1;

try{
  var a = 2
}catch(err){

}

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 2);
});

test("var in catch block should cover the parent scope", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 1;

try{
  throw null;
}catch(err){
  var a = 2;
}

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 2);
});

test("let in try-catch block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

try{
  let a = 2;
  b = a;
}catch(err){
  
}

module.exports = { a: a, b: b };
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
});

test("const in try-catch block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

try{
  const a = 2;
  b = a;
}catch(err){
  
}

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
});

test("var in try-catch block and parent scope let some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
let a = 1;  // define let var

try{
  var a = 2;
}catch(err){
  throw err;
}


module.exports = {a: a};
    `,
      sandbox
    );
  }, ErrDuplicateDeclard("a").message);
});

test("var in try-catch block and parent scope const some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
const a = 1;  // define let var

try{
  var a = 2;
}catch(err){
  throw err;
}

module.exports = {a: a};
    `,
      sandbox
    );
  }, ErrDuplicateDeclard("a").message);
});
