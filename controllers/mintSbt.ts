import * as process from 'process';
import {config as envConfig} from "dotenv";
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import DieselAttackSbt from '../wrappers/dieselAttackSbt';

envConfig({ path: "env/apikey.env" });

const fastify : FastifyInstance = Fastify({
    logger: {
        level: 'info',
        file: './api.log'
    }
});

const mintSbt = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Headers', 'Accept, X-Access-Token, X-Application-Name, X-Request-Sent-Time');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Origin', '*'); // TODO: to be edited later!
    const { id, reward, num, apikey } = request.query as any;
    let deployed: string | unknown;
    let response = {
        success: false,
        rewardType: reward,
        rewardNum: num,
        link: '',
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

    /*
    const collection = new DieselAttackSbt();
    await collection.connect();

    const msg = 'Deploying new SBT item for https://testnet.tonscan.org/nft/' + id;
    console.log(msg);
    fastify.log.info(msg);

    try {
        deployed = await collection.deployItem(id, reward as string, num as number);
        response.success = true;
        if (deployed) {
            response.link = 'https://tonscan.org/nft/' + deployed;
            fastify.log.info('Success! SBT has been minted on address: ' + response.link);
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
    */
    response.errorMsg = 'Sorry. SBT minting is not implemented yet.'

    return JSON.stringify(response);
}

export default mintSbt;