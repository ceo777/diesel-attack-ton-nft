import Fastify, { FastifyInstance } from 'fastify';
import routes from './routes/api';
/**
* @type {import('fastify').FastifyInstance} Instance of Fastify
*/

const fastify : FastifyInstance = Fastify({
    logger: {
        level: 'info',
        file: './api.log'
    }
});


fastify.register(routes);

const start = async () => {
    try {
        // await fastify.listen({port});
        await fastify.listen({ port: 4000 });

        const address = fastify.server.address();
        const port = typeof address === 'string' ? address : address?.port;

        console.log(`Diesel Attack NFT Game Backend API Server is listening at localhost: ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();