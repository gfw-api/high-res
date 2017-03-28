const Router = require('koa-router');
const request = require('request');
const logger = require('logger');
const config = require('config');

const SENTINEL_URL = 'http://services.sentinel-hub.com/v1/wms/';
const LANDSAT_URL = 'http://services-uswest2.sentinel-hub.com/v1/wms/';

const router = new Router({
    prefix: '/high-res',
});

class HighResRouter {

    static get(ctx) {
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
        logger.info('query antes', ctx.query);
        delete ctx.query.loggedUser;
        logger.info('query despues', ctx.query);

        const req = request({
            uri,
            method: 'GET',
            qs: {
                SERVICE: ctx.query.SERVICE,
                REQUEST: ctx.query.REQUEST,
                LAYERS: ctx.query.LAYERS,
                BBOX: ctx.query.BBOX,
                MAXCC: ctx.query.MAXCC,
                CLOUDCORRECTION: ctx.query.CLOUDCORRECTION,
                WIDTH: ctx.query.WIDTH,
                HEIGHT: ctx.query.HEIGHT,
                FORMAT: ctx.query.FORMAT,
                TIME: ctx.query.TIME,
                CRS: ctx.query.CRS
            }
        });
        req.on('response', (response) => {
            ctx.response.status = response.statusCode;
            ctx.set(response.headers);
        });
        ctx.body = req;

    }

}

router.get('/:sensor', HighResRouter.get);


module.exports = router;
