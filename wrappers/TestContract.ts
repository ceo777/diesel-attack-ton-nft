import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type TestContractConfig = {};

export function testContractConfigToCell(config: TestContractConfig): Cell {
    return beginCell().endCell();
}

export class TestContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TestContract(address);
    }

    static createFromConfig(config: TestContractConfig, code: Cell, workchain = 0) {
        const data = testContractConfigToCell(config);
        const init = { code, data };
        return new TestContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
