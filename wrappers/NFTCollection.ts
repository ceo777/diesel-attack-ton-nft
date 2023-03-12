import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';
import { Slice } from 'ton';

export type NFTCollectionConfig = {
    owner_address: Address,
    next_item_index: number,
    // content: {collection_content: Cell, common_content: Cell}
    collection_content: Cell,
    common_content: Cell,
    nft_item_code: Cell,
    royalty_params: Cell
};

export function nftCollectionConfigToCell(config: NFTCollectionConfig): Cell {
    return beginCell()
        .storeAddress(config.owner_address)
        .storeUint(config.next_item_index, 64)
        .storeRef(beginCell()
            .storeRef(config.collection_content)
            .storeMaybeRef(config.common_content)
        )
        .storeRef(config.nft_item_code)
        .storeRef(config.royalty_params)
        .endCell();
}

export class NFTCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NFTCollection(address);
    }

    static createFromConfig(config: NFTCollectionConfig, code: Cell, workchain = 0) {
        const data = nftCollectionConfigToCell(config);
        const init = { code, data };
        return new NFTCollection(contractAddress(workchain, init), init);
    }

    async sendDeployCollection(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .endCell(),
        });
    }

    async sendDeployNFT(
        provider: ContractProvider,
        via: Sender,
        data: {
            value: bigint,
            queryID?: number,
            item_index: number,
            coins: bigint,
            nft_content: Cell
        }
    ) {
        await provider.internal(via, {
            value: data.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0, 4)  // flags
                .storeUint(1, 32)  // op code 1
                .storeUint(data.queryID ?? 0, 64)
                .storeUint(data.item_index, 64)
                .storeCoins(data.coins)
                .storeRef(data.nft_content)
                .endCell()
        });
    }

    async getCounter(provider: ContractProvider) {
        const result = await provider.get('get_counter', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }
}
