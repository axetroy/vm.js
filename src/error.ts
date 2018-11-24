export function ErrNotDefined(varName: string): ReferenceError {
  return new ReferenceError(`${varName} is not defined`);
}

export function ErrImplement(varName: string): SyntaxError {
  return new SyntaxError(`Not implement for '${varName}' syntax`);
}

export function ErrDuplicateDeclard(varName: string): SyntaxError {
  return new SyntaxError(`Identifier '${varName}' has already been declared`);
}

export function ErrIsNot(name: string, type: string): TypeError {
  return new TypeError(`${name} is not ${type}`);
}

export function ErrInvalidIterable(name): TypeError {
  return ErrIsNot(name, "iterable");
}

export function ErrNoSuper(): ReferenceError {
  return new ReferenceError(
    `Must call super constructor in derived class before accessing 'this' or returning from derived constructor`
  );
}

export function ErrIsNotFunction(name: string): ReferenceError {
  return new TypeError(`${name} is not a function`);
}

export function ErrCanNotReadProperty(
  property: string,
  target: string
): ReferenceError {
  return new TypeError(`Cannot read property '${property}' of ${target}`);
}
