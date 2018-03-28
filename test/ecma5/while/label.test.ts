import test from "ava";
import { ErrDuplicateDeclard } from "../../../src/error";
import vm from "../../../src/vm";

test("break with label", t => {
  const sandbox: any = vm.createContext({});

  const i: any = vm.runInContext(
    `
var i = 1;
loop1:
while(true){
  i++;
  break loop1;
}

module.exports = i;
  `,
    sandbox
  );
  t.deepEqual(i, 2);
});

test("continue with label", t => {
  const sandbox: any = vm.createContext({});

  const { i, arr }: any = vm.runInContext(
    `
var i = 10;
var arr = [];
loop1:
while(i > 0){
  if (i % 2 === 1){
    i--;    
    continue; 
  }
  arr.push(i);  
  i--;  
}

module.exports = {i, arr};
  `,
    sandbox
  );
  t.deepEqual(i, 0);
  t.deepEqual(arr, [10, 8, 6, 4, 2]);
});
