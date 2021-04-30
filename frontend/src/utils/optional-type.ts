export type Optional<T> = undefined | T;
export type SingleCallback<T> = (param: T) => any;
export type DoubleCallback<T, R> = (param1: T, param2: R) => any;
export type GenericCallback = (...params: Array<any>) => any;