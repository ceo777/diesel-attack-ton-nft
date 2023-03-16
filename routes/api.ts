import home from '../controllers/home';
import mintNft from '../controllers/mintNft';
// import mintSbt from '../controllers/mintSbt';
import { FastifyInstance } from 'fastify';
/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */


async function routes(fastify: FastifyInstance, options: Object) {
    const nftOptions = {
        schema: {
            // mint-nft request should have a querystring with a `id` and `apikey` parameters
            querystring: {
                id: {type: 'string'},
                apikey: {type: 'string'}
            }
        }
    }
    const sbtOptions = {
        schema: {
            // mint-sbt request should have a querystring with a `id`, `level` and `apikey` parameters
            querystring: {
                id: {type: 'string'},
                level: {type: 'string'},
                apikey: {type: 'string'}
            }
        }
    }

    fastify.get('/', home);
    fastify.get('/mint-nft', nftOptions, mintNft);
    // fastify.get('/mint-sbt', sbtOptions, mintSbt);
}

export default routes;