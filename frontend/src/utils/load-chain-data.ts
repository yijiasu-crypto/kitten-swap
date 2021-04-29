import contractData from '../contract_data.json';
import store from '../store';
import { chainDataSlice } from '../store/chain';

for (const chain of contractData.chains) {
  const { contracts , tokens } = chain;
  for (const contract of contracts) {
    store.dispatch(chainDataSlice.actions.addContract(contract));
  }
  for (const token of tokens) {
    store.dispatch(chainDataSlice.actions.addToken(token));
  }
}