# Diesel Attack NFT Game Backend API Server

Welcome to the cyberpunk post-apocalyptic world of Diesel Attack

https://dieselattack.com

Diesel Attack is a hardcore 2D-platformer with web3 economy based on utility NFTs and SBTs on [TON blockchain](https://ton.org). Desktop web version for now, mobile apps are coming soon.



![Diesel Attack NFT Game banner 1200x600](/docs/img/diesel-attack-banner_1200x600.jpg)

>To earn TON coins and collect NFTs and SBTs during the game you need a [TON Wallet](https://ton.org/en/wallets). 
>We never ask you for keys.


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

This is the source of the backend API server of the RPG 2D-sidescroller game Diesel Attack. It implements smart contracts on the TON blockchain to mint NFTs and SBTs for players during the game on the fly. 

When a game client app sends a request to the server using API, a player gets a new weapon or ship as NFT based on the weighted random algorithm. Also, players get SBTs for completing the levels and speedrun records. While they need to connect a TON wallet only once starting the game. And NFT and SBT minting operations are totally free for users.

### Tech stack

1. The game is developed on Unity, built with WebGL & deployed at https://play.dieselattack.com.
2. Smart contracts are used for on-chain data storage and for minting NFTs and SBTs on the fly, written in FunC. 
3. Backend API server is running on Fastify (Node.js framework) implementing Tonweb SDK. 
4. Orbs TON Access RPC network provides unrestricted decentralized access to the TON blockchain. 
5. Ton Connect 2.0 provides TON authorization in the game. 
6. NFTs and SBTs source images are hosted on IPFS using NFT.Storage. 
7. AWS EC2 & Route53 are used for both game and backend servers hosting & load balancing. 
8. TWA is to be used for voting functionality integration inside the Telegram app (to be implemented).

### Implemented functionality

- Unity WebGL client app (the game)
- Backend API server handling requests
- Smart contract minting NFTs on the fly
- TON Connect 2.0 Unity WebGL integration


### To be done

- Smart contract minting SBTs on the fly
- Smart contract storing players database completely on-chain
- Smart contract funding and distributing Prize Pool
- TWA dapp for voting and for quick access to leaderboard on-the-go
- iOS and Android client apps, mobile web version



## API Usage



### API methods

#### Status

Request:

`GET /v2/` returns greetings message (server status check)

Response:

`Diesel Attack NFT Game Backend API Server 2.1.8`

Production server endpoint:

https://api.dieselattack.com/v2/

#### Mint NFT

Request:

`GET /v2/mint-nft?id=<address>&apikey=<secret_token>` mints NFT for player and returns an id of the collectible (weapons for now) and a link to just minted nft on explorer. Where `<address>` is the player's TON wallet friendly address on the mainnet. And `<secret_token>` is a client app hashed secret token. The response time is less than 1 second.

Response:

`{ "success": <true/false>, "rewardType": <gun/ship/shield>,"rewardNum": <index>, "link": <just minted nft on blockchain explorer>, "errorMsg": <error message if any> }`

Production server endpoint:

https://api.dieselattack.com/v2/mint-nft?id=EQBiKxj6DSyPRnK4Rg92hRX03Anw5FOXfEbFj6uTnfyln8CS&apikey=e0965cbdf5ba6694039715cf642b44d9a007607294daf4579d8fff62a52016ba

>Until 31.03 you can check it out by yourself and mint NFT to your TON wallet. Just put your TON wallet address instead of `address`. No keys needed. Browse it and check your wallet NFT section.


#### Mint SBT

Request:

`GET /v2/mint-sbt?id=<address>&reward=<type>&num=<index>&apikey=<secret_token>` mints SBT for player and returns an id of the collectible and a link to just minted sbt on explorer. Where `<address>` is the player's TON wallet address on the mainnet, `<type>` is a type of the reward in the game,  `<index>` is an id of the reward. And `<secret_token>` is a client app hashed secret token.

Response:

`{ "success": <true/false>, "link": <just minted sbt on blockchain explorer>, "errorMsg": <error message if any> }`

Production server endpoint (not implemented yet):

https://api.dieselattack.com/v2/mint-sbt?id=EQBiKxj6DSyPRnK4Rg92hRX03Anw5FOXfEbFj6uTnfyln8CS&reward=level&num=1&apikey=e0965cbdf5ba6694039715cf642b44d9a007607294daf4579d8fff62a52016ba


### Security

:warning: Till the end of the [Hack-a-TONx w/ DoraHacks](https://dorahacks.io/hackathon/hack-a-tonx/detail) hackathon we left the possibility to check and mint NFT via API link for everyone intentionally.
But then server will not process requests with the temporal `Apikey`, only the game app one!

Temporal ApiKey (valid until 31.03.23): `e0965cbdf5ba6694039715cf642b44d9a007607294daf4579d8fff62a52016ba`

## Smart contracts addresses

Diesel Attack wallet official address: `dieselattack.ton` ([View on Tonscan](https://tonscan.org/address/dieselattack.ton))

Diesel Attack NFT Collection official address: `EQB4LidmxGVV2_73UBiAAyQ8nv30u1SRP5_qIpv6UZPG_DOB` ([View on Tonscan](https://tonscan.org/address/EQB4LidmxGVV2_73UBiAAyQ8nv30u1SRP5_qIpv6UZPG_DOB))

## How To Build

### Prerequisites

References to the original documentation:

- [Node.js](https://nodejs.org/en/download/package-manager/)
- [Yarn](https://yarnpkg.com/getting-started/install)


### Build the contract

>FunC smart contracts will be compiled and saved as HEX code into the `build` directory in project root. It must be created with appropriate access permissions before building.

1. Install all the dependencies:
    ```sh
    yarn
    ```

2. Build the smart-contract into WebAssembly:
    ```sh
    yarn build
    ```


### Deploy to the mainnet

> Credentials are stored in `env` directory in project root and used as environment variables. It must be created with appropriate access permissions before deploying.
> 
> It should contain the next files:
> 
> `apikey.env` with `APIKEY=""` in it - client app secret token.
> `wallet_key.env` with `SECRET_KEY=""` in it - contract owner wallet secret key in Base64 encoding.
>
> Server generates `api.log` file in project root directory. It must have appropriate access permissions.


1. Deploy the contract to the TON mainnet (workchain 0):
    ```sh
    yarn deploy
    ```

2. Run the server:
    ```sh
    yarn start
    ```

### Tests

- Run the smart contract test: (not implemented yet)
    ```sh
    yarn test
    ```
