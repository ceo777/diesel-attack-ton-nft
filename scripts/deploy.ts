import DieselAttackNft from '../wrappers/dieselAttackNft';

export default async function deploy() {
    const nftCollection = new DieselAttackNft();
    await nftCollection.connect();
    await nftCollection.deployCollection();
    await nftCollection.getCollection();
}

deploy();