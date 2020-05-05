export function compileFn(fn: string, argKeys?: string[], isExpression: boolean = false, extractArg?: string) {
  if (isExpression) {
    fn = fn.indexOf('return') >= 0 ? fn : 'return(' + fn + ')';

    if (argKeys && extractArg && argKeys.indexOf(extractArg) >= 0) {
      fn = 'with(' + extractArg + '){' + fn + '}';
    }
  }

  let fnParams = argKeys;
  fnParams.push(fn);
  
  try {
    return new Function(...fnParams);
  }
  catch (e) {
    console.log((e as SyntaxError).message, fn);
  }
}

export function execFn(fn: string, args?: object, thisArg?: any, extractArg?: string) {
  return compileFn(fn, args ? Object.keys(args) : undefined, extractArg !== undefined, extractArg).apply(thisArg, Object.values(args));
}
