import * as fs from "fs";
import * as dotenv from "dotenv";
import { Address, toNano } from 'ton-core';
import { NFTCollection } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';

dotenv.config({ path: "env/wallet.env" });

export async function run(provider: NetworkProvider) {
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        return console.log(".env cannot be found or is empty");
    }

    const nftCollection = provider.open(
        NFTCollection.createFromConfig(
            {
                owner_address: Address.parse(mnemonic!),
                next_item_index: 1,
                collection_content: 'https://api.dieselattack.com/v2/metadata/nft/collection.json',
                common_content: '',
                nft_item_code: compile('NFTItem'),
                royalty_params: ''
            },
            await compile('NFTCollection')
        )
    );

    await nftCollection.sendDeployCollection(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(nftCollection.address);

    // save address to .env
    fs.writeFile('env/contract.env', 'CONTRACT_ADDRESS="' + nftCollection.address.toString() + '"', 'utf8', err => {
        if (err) {
            console.error(err);
        }
        console.log("Contract address is saved to /env/contract.env");
    });

}
