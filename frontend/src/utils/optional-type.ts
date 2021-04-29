export type Optional<T> = undefined | T;
export type SingleCallback<T> = (param: T) => any;
export type GenericCallback = (...params: Array<any>) => any;