import * as fs from "fs";
import * as path from "path";
import {config as envConfig} from "dotenv";
import TonWeb, { AddressType } from 'tonweb';
import { getHttpEndpoint } from "@orbs-network/ton-access";

envConfig({ path: "env/wallet_key.env" });

export class DieselAttackNft {
    protected tonweb!: TonWeb;
    protected NftCollection = TonWeb.token.nft.NftCollection;
    protected NftItem = TonWeb.token.nft.NftItem;

    protected BN = TonWeb.utils.BN;
    protected nftCollection!: any;
    // protected nftCollection!: typeof this.NftCollection;
    protected keyPair!: any;
    // protected keyPair!: TonWeb.utils.nacl.signProps.keyPair;
    protected wallet!: any;
    // protected wallet!: WalletV2ContractR1 | WalletV2ContractR2 | WalletV3ContractR1 | WalletV3ContractR2 | WalletV4ContractR1 | WalletV4ContractR2;
    protected walletAddress!: AddressType;
    public nftCollectionAddress = '';

    public async connect() {
        await this.connectToProvider()
        await this.getKeysFromSecretKey();
        await this.WalletInitialize();
        await this.nftCollectionInitialize();
    }
    protected async connectToProvider() {
        const endpoint = await getHttpEndpoint({
            network: "testnet" // TODO: mainnet!
        });
        this.tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
        if (!this.tonweb) {
            return console.log('Cannot connect to the Blockchain HTTP Provider.');
        }
        console.log('Successfully connected to the Blockchain HTTP Provider.');
    }

    protected async getKeysFromSecretKey() {
        const secret_key = process.env.SECRET_KEY;
        if (!secret_key) {
            return console.log(".env cannot be found or SECRET_KEY is empty.");
        }
        const key = TonWeb.utils.base64ToBytes(secret_key);

        this.keyPair = TonWeb.utils.nacl.sign.keyPair.fromSecretKey(key);
        if (!this.keyPair) {
            return console.log("Cannot retrieve wallet keyPair.");
        }
        console.log('KeyPair is successfully retrieved.');
    }

    protected async WalletInitialize() {
        const walletVersion = process.env.WALLET_VERSION;
        if (!walletVersion) {
            return console.log(".env cannot be found or WALLET_VERSION is empty.");
        }
        const WalletClass = this.tonweb.wallet.all['v4R2']; // TODO: get the wallet version from the .env

        this.wallet = new WalletClass(this.tonweb.provider, {
            publicKey: this.keyPair.publicKey,
            wc: 0
        });
        this.walletAddress = await this.wallet.getAddress();
        if (!this.walletAddress) {
            return console.log("Cannot initialize the wallet.");
        }
        console.log('Wallet is successfully initialized.');
        console.log('Wallet address:',this.walletAddress.toString(true, true, true));
    }

    protected async nftCollectionInitialize() {
        const address = new TonWeb.Address(this.walletAddress);
        const collectionJson = fs.readFileSync(path.resolve(__dirname, '../build/NFTCollection.compiled.json')).toString();
        const itemJson = fs.readFileSync(path.resolve(__dirname, '../build/NFTItem.compiled.json')).toString();
        const collectionCode = TonWeb.boc.Cell.oneFromBoc(JSON.parse(collectionJson).hex);
        const itemCode = JSON.parse(itemJson).hex;

        this.nftCollection = new this.NftCollection(this.tonweb.provider, {
            ownerAddress: address,
            collectionContentUri: 'https://dieselattack.com/metadata/nft/nft-collection.json',
            nftItemContentBaseUri: 'https://dieselattack.com/metadata/nft/',
            nftItemCodeHex: itemCode || this.NftItem.codeHex,
            royalty: 0.15,
            royaltyAddress: address,
            code: collectionCode || ''
        });
        this.nftCollectionAddress = (await this.nftCollection.getAddress()).toString(true, true, true);
        console.log('Collection address:', this.nftCollectionAddress);
    }

    public async deployCollection(){
        const seqno = (await this.wallet.methods.seqno().call()) || 0;
        console.log({seqno});
        const initState = (await this.nftCollection.createStateInit()).stateInit;

        console.log(
            await this.wallet.methods.transfer({
                secretKey: this.keyPair.secretKey,
                toAddress: this.nftCollectionAddress,
                amount: TonWeb.utils.toNano('0.3'),
                seqno: seqno,
                payload: '',
                sendMode: 3,
                stateInit: initState
            }).send()
        );

        // save address to .env
        fs.writeFile('env/nft_collection_address.env', 'CONTRACT_ADDRESS="' + this.nftCollectionAddress + '"', 'utf8', err => {
            if (err) {
                console.error(err);
            }
            console.log('NFT Collection is successfully deployed!');
            console.log("Contract address is saved to /env/nft_collection_address.env");
        });
    }

    public async deployItem(playerAddress: string, nftContent: string) {
        const data = await this.nftCollection.getCollectionData();
        const nextItemIndex: number = data.nextItemIndex;
        const recipientAddress: AddressType = new TonWeb.Address(playerAddress);
        const amount = TonWeb.utils.toNano('0.02');
        const seqno: number = (await this.wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        console.log(
            await this.wallet.methods.transfer({
                secretKey: this.keyPair.secretKey,
                toAddress: this.nftCollectionAddress,
                amount: amount,
                seqno: seqno,
                payload: await this.nftCollection.createMintBody({
                    amount,
                    itemIndex: nextItemIndex,
                    itemOwnerAddress: recipientAddress,
                    itemContentUri: nftContent + '.json'
                }),
                sendMode: 3,
            }).send()
        );
        console.log('NFT item is successfully deployed!');
    }

    public async getCollection() {
        const data = await this.nftCollection.getCollectionData();
        data.itemsCount = data.itemsCount.toString();
        data.ownerAddress = data.ownerAddress?.toString(true, true, true);
        console.log(data);
        const royaltyParams = await this.nftCollection.getRoyaltyParams();
        royaltyParams.royaltyAddress = royaltyParams.royaltyAddress.toString(true, true, true);
        console.log(royaltyParams);
        console.log('NFT Collection data is successfully retrieved.');

        return data;
    }

    public async getItem(nftIndex: number) {
        const index = new this.BN(nftIndex) || 0;
        const nftItemAddress: AddressType = await this.nftCollection.getNftItemAddressByIndex(index);
        const nftItem = new this.NftItem(this.tonweb.provider, {address: nftItemAddress});
        const data = await this.nftCollection.methods.getNftItemContent(nftItem);
        data.itemAddress = nftItemAddress.toString(true, true, true);
        data.itemIndex = data.itemIndex.toString();
        data.collectionAddress = data.collectionAddress.toString(true, true, true);
        data.ownerAddress = data.ownerAddress?.toString(true, true, true);
        console.log(data);

        return data;
    }
}

async function run() {
    const playerAddress = 'EQCaIiWWLBEKv234jlvayBLrY4d9L8_hZTpBUN-FWxOKHuwC';
    const nft = 'gun-1' // TODO: Gacha!
    const nftCollection = new DieselAttackNft();
    await nftCollection.connect();
    await nftCollection.deployCollection();
    await nftCollection.getCollection();
    await nftCollection.deployItem(playerAddress, nft);
    await nftCollection.getItem(3);
}

run();
