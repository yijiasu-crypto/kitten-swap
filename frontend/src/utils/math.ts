import BigNumber from "bignumber.js";

const toStringNumber = (num: string | number, decimals: number): string => {
  if (decimals > 18) {
    throw new Error('Invalid Decimal');
  }
  const bn = new BigNumber(num ? num : 0);
  return bn.multipliedBy(10 ** decimals).toFixed();
};

const fromStringNumber = (num: string, decimals: number, dp?: number): string => {
  if (decimals > 18) {
    throw new Error('Invalid Decimal');
  }

  const bn = new BigNumber(num ? num : 0);
  if (dp) {
    return bn.dividedBy(10 ** decimals).toFixed(dp).toString();
  }
  else {
    return bn.dividedBy(10 ** decimals).toString();
  }
};

const stringNumberCompare = (a: string, b: string): number => {
  if (a.length !== b.length) {
    return a.length < b.length ? -1 : 1;
  }
  else {
    return a.localeCompare(b);
  }
};

export { toStringNumber, fromStringNumber, stringNumberCompare };
