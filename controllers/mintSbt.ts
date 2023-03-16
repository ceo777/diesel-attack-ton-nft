import * as process from 'process';
import {config as envConfig} from "dotenv";
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import DieselAttackSbt from '../scripts/dieselAttackSbt';

envConfig({ path: "env/apikey.env" });

const fastify : FastifyInstance = Fastify({
    logger: {
        level: 'info',
        file: './api.log'
    }
});

const mintSbt = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, level, apikey } = request.query as any;
    let deployed: string | unknown;
    let response = {
        success: false,
        rewardType: 'level',
        rewardNum: level,
        errorMsg: ''
    }
    if (apikey !== process.env.APIKEY && apikey !== process.env.TEMP_KEY) {
        response.errorMsg = 'Incorrect ApiKey. You are not allowed to interact with the API server';
        return JSON.stringify(response);
    }
    if (!id) {
        response.errorMsg = 'Incorrect player wallet address.';
        return JSON.stringify(response);
    }

    const collection = new DieselAttackSbt();
    await collection.connect();
    const sbt = level;

    const msg = 'Deploying new SBT item for https://testnet.tonscan.org/nft/' + id;
    console.log(msg);
    fastify.log.info(msg);

    try {
        deployed = await collection.deployItem(id, sbt);
        response.success = true;
        if (deployed) {
            console.log('Success! SBT has been minted on address: https://testnet.tonscan.org/nft/' + deployed);
            fastify.log.info('Success! SBT has been minted for on address: https://testnet.tonscan.org/nft/' + deployed);
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

export default mintSbt;