import { writeFile, readFile } from 'fs/promises';

interface DeploymentState {
  chainId: number;
  kittenSwapRouter: string,
  sushiAdapter: string,
  uniAdapter: string
}

const saveDeployState = async (state: DeploymentState) =>
  writeFile('./test_deployment.json', JSON.stringify(state)).catch(() => {});

const readDeployState = async (): Promise<DeploymentState | undefined> =>
  readFile('./test_deployment.json')
    .then((d) => JSON.parse(d.toString()))
    .catch(() => {});


export { saveDeployState, readDeployState };