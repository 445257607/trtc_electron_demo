export function isNumber(args: any) {
  return typeof args === 'number';
}

export function isString(args: any) {
  return typeof args === 'string';
}
export function isNull(args: any) {
  return args === null;
}

export function isUndefined(args: any) {
  return args === undefined;
}

export function isExist(args: any) {
  return !isNull(args) && !isUndefined(args);
}