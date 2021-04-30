import _ from 'lodash';
import contractData from '../contract_data.json';
import store from '../store';
import { chainDataSlice, fetchContractAbi, fetchContractInterface } from '../store/chain';

const { addContract, addToken } = chainDataSlice.actions;

for (const chain of contractData.chains) {
  const { contracts , tokens } = chain;
  for (const contract of contracts) {
    store.dispatch(addContract(contract));
    store.dispatch(fetchContractAbi(contract.interface));
  }
  for (const token of tokens) {
    store.dispatch(addToken(token));
  }

  const allInterfaces = _([...contracts, ...tokens])
    .map((e) => e.interface)
    .uniq()
    .toArray()
    .value();

  for (const contractInterface of allInterfaces) {
    store.dispatch(fetchContractInterface(contractInterface));
  }
}
