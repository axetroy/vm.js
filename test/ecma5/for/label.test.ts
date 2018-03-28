import test from "ava";
import vm from "../../../src/vm";

test("break with label", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
var num;

loop1:
for (var i=0;i<10;i++) {
  if (i===6){
    break loop1;
  }
  num = ++i;
}

module.exports = num;
  `,
    sandbox
  );
  t.true(typeof num === "number");
  t.deepEqual(num, 5);
});

test("nest for loop with label", t => {
  const sandbox: any = vm.createContext({});

  const { i, m }: any = vm.runInContext(
    `

loop1:
for (var i=0;i<3;i++) {
  loop2:
  for (var m=1;m<3;m++){
    if (m%2===0){
      break loop1;
    }
  }
}

module.exports = {i: i, m: m};
  `,
    sandbox
  );
  t.deepEqual(i, 0);
  t.deepEqual(m, 2);
});

test("endless for loop with label", t => {
  const sandbox: any = vm.createContext({});

  const { i, m, y }: any = vm.runInContext(
    `
loop1:
for (var i=0;i<3;i++) {
  loop2:
  for (var m=1;m<3;m++){
    if (m%2===0){
      break loop1;
    }
    loop3:
    for (var y = 1; y < 10; y++){
      if (y%5===0){
        break loop2;
      }
    }
  }
}

module.exports = {i: i, m: m, y: y};
  `,
    sandbox
  );
  t.deepEqual(i, 3);
  t.deepEqual(m, 1);
  t.deepEqual(y, 5);
});

test("continue with label", t => {
  const sandbox: any = vm.createContext({});

  const { i, m, y }: any = vm.runInContext(
    `
loop1:
for (var i=0;i<3;i++) {
  loop2:
  for (var m=1;m<3;m++){
    if (m%2===0){
      break loop1;
    }
    loop3:
    for (var y = 1; y < 10; y++){
      if (y%5===0){
        continue loop2; // skip loop2
      }
    }
  }
}

module.exports = {i: i, m: m, y: y};
  `,
    sandbox
  );
  t.deepEqual(i, 0);
  t.deepEqual(m, 2);
  t.deepEqual(y, 5);
});
