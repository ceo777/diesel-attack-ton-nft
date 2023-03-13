:warning: This is not the final version yet! Please be patient :)

# Diesel Attack NFT Game Backend API Server

Welcome to the cyberpunk post-apocalyptic world of Diesel Attack

![Diesel Attack NFT Game banner 960x498](/docs/img/diesel-attack-banner_960x498.jpg)


>To earn TON tokens and collect NFTs and SBTs during the game you need a [TON Wallet](https://ton.org/en/wallets). We never ask you for keys.


<details open="open">
<summary>Table of Contents</summary>

- [About](#about)
- [API Usage](#api-usage)
    - [API methods](#api-methods)
    - [Security](#security)
- [How To Build](#how-to-build)
    - [Prerequisites](#prerequisites)
    - [Build the contract](#build-the-contract)
    - [Deploy to the mainnet](#deploy-to-the-mainnet)
    - [Tests](#tests)



</details>

## About

This is the source of the backend API server of the RPG 2D-sidescroller game Diesel Attack. It implements smart contracts on the TON blockchain to mint NFTs and SBTs for players during the game on the fly. When a game client app sends a request to the server using API, a player gets a new weapon or ship as NFT based on the weighted random algorithm. Created on TON JS SDK. Smart contracts is written on FunC. NFT arts are hosted on IPFS. The server itself is running on Fastify (Node.js framework).

## API Usage



### API methods

#### Status

`GET /` returns greetings message (server status check)

Production server endpoint:

https://api.dieselattack.com/

#### Mint NFT

`GET /v2/mint-nft?id=<address>` mints NFT for player and returns a code of the collectible to a game client app. Where `<address>` is the player's TON wallet address on the mainnet. The response time is about 5-10 seconds.

Production server endpoint:

https://api.dieselattack.com/v2/mint-nft?id=EQBiKxj6DSyPRnK4Rg92hRX03Anw5FOXfEbFj6uTnfyln8CS


#### Mint SBT

`GET /v2/mint-sbt?id=<address>` mints SBT for player and returns a code of the collectible to a game client app. Where `<address>` is the player's TON wallet address on the mainnet. The response time is about 5-10 seconds.

Production server endpoint:

https://api.dieselattack.com/v2/mint-sbt?id=EQBiKxj6DSyPRnK4Rg92hRX03Anw5FOXfEbFj6uTnfyln8CS

>Until 31.03 you can check it by yourself and mint NFT to your TON wallet. Just put your TON wallet address instead of `address`, browse it and check your wallet NFT section.

Diesel Attack smart contract address: `EQAvPP48qHP2QmoEaiyFw97Y00jPtwObRMkFwl0yhu8FbEfP` ([See it on Tonscan](https://tonscan.org/address/EQAvPP48qHP2QmoEaiyFw97Y00jPtwObRMkFwl0yhu8FbEfP#transactions))

### Security

:warning: For the duration of the [Hack-a-TONx w/ DoraHacks](https://dorahacks.io/hackathon/hack-a-tonx/detail) hackathon we left the possibility to check and mint NFT via API link for everyone intentionally.
But then production server will process requests only with the secret `Apikey`:

`GET /v2/mint-nft?id=<address>&key=<secret_token>`

## How To Build

### Prerequisites

References to the original documentation:

- [Node.js](https://nodejs.org/en/download/package-manager/)
- [Yarn](https://yarnpkg.com/getting-started/install)

<details>
<summary>Installing the prerequisites</summary>
</details>


### Build the contract

1. Install all the dependencies:
    ```sh
    yarn
    ```

2. Build the smart-contract into WebAssembly:
    ```sh
    yarn build
    ```


### Deploy to the mainnet

1. Deploy the contract to the dev account:
    ```sh
    yarn deploy
    ```

2. Run the local server:
    ```sh
    yarn start
    ```


### Tests

- Run the testnet account test:
    ```sh
    yarn test
    ```

- Run the local server test:
    ```sh
    yarn test:server
    ```
