export function ErrNotDefined(varName: string): ReferenceError {
  return new ReferenceError(
    `Uncaught ReferenceError: ${varName} is not defined`
  );
}

export function ErrNotSupport(syntax: string): SyntaxError {
  return new SyntaxError(`The Syntax '${syntax}' is not support`);
}

export function ErrDuplicateDeclard(varName: string): SyntaxError {
  return new SyntaxError(`Identifier '${varName}' has already been declared`);
}

export function ErrUnexpectedToken(token: string = ""): SyntaxError {
  return new SyntaxError(
    `Uncaught SyntaxError: Invalid or unexpected token '${token}'`
  );
}

export function ErrIsNot(name: string, type: string): TypeError {
  return new TypeError(`Uncaught TypeError: ${name} is not ${type}`);
}

export function ErrInvalidIterable(name): TypeError {
  return ErrIsNot(name, "iterable");
}

export function ErrNoSuper(): ReferenceError {
  return new ReferenceError(
    `Uncaught ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor`
  );
}

export function ErrIsNotFunction(name: string): ReferenceError {
  return new TypeError(`Uncaught TypeError: ${name} is not a function`);
}
