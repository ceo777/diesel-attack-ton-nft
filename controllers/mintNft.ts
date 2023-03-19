import * as process from 'process';
import {config as envConfig} from "dotenv";
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import DieselAttackNft from '../wrappers/dieselAttackNft';

envConfig({ path: "env/apikey.env" });

const fastify : FastifyInstance = Fastify({
    logger: {
        level: 'info',
        file: './api.log'
    }
});

function random(min: number, max: number) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

// the probability of each weapon: 35% 28% 20% 12% 5%
function gacha() {
    const rand: number = random(0, 100);
    switch (true) {
        case (rand < 35):
            console.log({rand});
            return 1;
        case (rand < 63):
            console.log({rand});
            return 2;
        case (rand < 83):
            console.log({rand});
            return 3;
        case (rand < 95):
            console.log({rand});
            return 4;
        case (rand < 100):
            console.log({rand});
            return 5;
    }
}

const mintNft = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Headers', 'Accept, X-Access-Token, X-Application-Name, X-Request-Sent-Time');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Origin', '*'); // TODO: to be edited later!
    const { id, apikey } = request.query as any;
    let deployed: string | unknown;
    let response = {
        success: false,
        rewardType: '',
        rewardNum: 0,
        link: '',
        errorMsg: ''
    }
    if (apikey !== process.env.APIKEY && apikey !== process.env.TEMP_KEY) {
        response.errorMsg = 'Incorrect ApiKey. You are not allowed to interact with the API server.';
        return JSON.stringify(response);
    }
    if (!id) {
        response.errorMsg = 'Incorrect player wallet address.';
        return JSON.stringify(response);
    }

    const collection = new DieselAttackNft();
    await collection.connect();
    const reward = gacha();
    const nft = 'gun-' + reward + '.json';

    const msg = 'Deploying new NFT item for https://tonscan.org/address/' + id;
    console.log(msg);
    fastify.log.info(msg);

    try {
        deployed = await collection.deployItem(id, nft);
        response.success = true;
        response.rewardType = 'gun';
        response.rewardNum = reward as number;
        if (deployed) {
            response.link = 'https://tonscan.org/nft/' + deployed;
            fastify.log.info('Success! NFT has been minted on address: ' + response.link);
        }
    } catch (err) {
        if (typeof err === "string") {
            response.errorMsg = err.toUpperCase();
        } else if (err instanceof Error) {
            response.errorMsg = err.message;
        }
        console.log(err);
        fastify.log.error(err);
    }

    return JSON.stringify(response);
}

export default mintNft;