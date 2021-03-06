const Router = require('koa-router');
const request = require('request-promise');
const logger = require('logger');
const config = require('config');

const SENTINEL_URL = 'http://services.sentinel-hub.com/v1/wms/';
const LANDSAT_URL = 'http://services-uswest2.sentinel-hub.com/v1/wms/';

const router = new Router({
    prefix: '/high-res',
});

class HighResRouter {

    static async get(ctx) {
        logger.info('Obtaining tile');
        let uri = null;
        switch (ctx.params.sensor) {

            case 'sentinel':
                uri = `${SENTINEL_URL}${config.get('apikeys.sentinel')}`;
                break;
            case 'landsat':
                uri = `${LANDSAT_URL}${config.get('apikeys.landsat')}`;
                break;
            default:
                ctx.throw(400, 'Sensor not supported');

        }
        delete ctx.query.loggedUser;

        try {
            const response = await request({
                uri,
                method: 'GET',
                qs: ctx.query,
                resolveWithFullResponse: true
            });

            ctx.response.status = response.statusCode;
            ctx.set(response.headers);
            ctx.body = response.body;
        } catch (e) {
            ctx.response.status = e.statusCode;
            ctx.body = e.error;
        }

    }

}

router.get('/:sensor', HighResRouter.get);


module.exports = router;
