import { toNano } from 'ton-core';
import { TestContract } from '../wrappers/TestContract';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const testContract = provider.open(TestContract.createFromConfig({}, await compile('TestContract')));

    await testContract.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(testContract.address);

    // run methods on `testContract`
}
