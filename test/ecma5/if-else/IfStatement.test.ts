import test from "ava";
import vm from "../../../src/vm";

test("if", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  isTrue: false
};

if (true){
  obj.isTrue = true;
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.isTrue === "boolean");
  t.true(obj.isTrue);
});

test("if-else", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  isTrue: false
};

if (false){
  obj.isTrue = true;
}else{
  obj.isTrue = true;
}

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.isTrue === "boolean");
  t.true(obj.isTrue);
});

test("if else-else if", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  block: ''
};

if (false){
  obj.block = "if";
}else if(true){
  obj.block = "else if";
}

module.exports = obj;
  `,
    sandbox
  );

  t.deepEqual(obj.block, "else if");
});

test("if-else-else if-else", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  block: ''
};

if (false){
  obj.block = "if";
}else if(false){
  obj.block = "else if";
}else{
  obj.block = "else";
}

module.exports = obj;
  `,
    sandbox
  );

  t.deepEqual(obj.block, "else");
});
