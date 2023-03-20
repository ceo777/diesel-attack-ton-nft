import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';


const fastify : FastifyInstance = Fastify({
    logger: {
        level: 'info',
        file: './api.log'
    }
});

const home = async (request: FastifyRequest, reply: FastifyReply) => {
    return 'Diesel Attack NFT Game Backend API Server 2.1.8';
}

export default home;