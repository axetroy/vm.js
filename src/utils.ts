export function defineFunctionName(func, name: string) {
  Object.defineProperty(func, "name", {
    value: name || "",
    writable: false,
    enumerable: false,
    configurable: true
  });
}

export function defineFunctionLength(func, length: number) {
  Object.defineProperty(func, "length", {
    value: length || 0,
    writable: false,
    enumerable: false,
    configurable: true
  });
}
