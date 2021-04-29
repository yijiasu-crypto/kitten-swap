import BigNumber from "bignumber.js";

const toStringNumber = (num: string | number, decimals: number): string => {
  if (decimals > 18) {
    throw new Error('Invalid Decimal');
  }
  const bn = new BigNumber(num ? num : 0);
  return bn.multipliedBy(10 ** decimals).toString();
};

const fromStringNumber = (num: string, decimals: number): string => {
  if (decimals > 18) {
    throw new Error('Invalid Decimal');
  }

  const bn = new BigNumber(num ? num : 0);
  return bn.dividedBy(10 ** decimals).toString();
};

export { toStringNumber, fromStringNumber };
