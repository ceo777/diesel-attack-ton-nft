import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { TestContract } from '../wrappers/TestContract';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('TestContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TestContract');
    });

    let blockchain: Blockchain;
    let testContract: SandboxContract<TestContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        testContract = blockchain.openContract(TestContract.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await testContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: testContract.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and testContract are ready to use
    });
});
