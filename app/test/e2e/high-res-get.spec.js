/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const config = require('config');

const { getTestServer } = require('./utils/test-server');
const { mockValidateRequestWithApiKey } = require('./utils/mocks');

chai.should();

const requester = getTestServer();

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Get datasets tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
    });

    // it('Get data for a sensor that does not exist should return a 400', async () => {
    //     const response = await requester
    //         .get(`/api/v1/high-res/fake`);
    //
    //     response.status.should.equal(400);
    //     response.body.should.have.property('errors').and.be.an('array');
    //     response.body.errors[0].should.have.property('detail').and.equal(`Sensor not supported`);
    // });

    it('Get data for sentinel should return an error if the upstream sentinel account returns an error', async () => {
        mockValidateRequestWithApiKey({});
        const responseString = '<?xml version=\'1.0\' encoding="UTF-8"?>\n<ServiceExceptionReport version="1.3.0"\n\txmlns="http://www.opengis.net/ogc"\n\txmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n\txsi:schemaLocation="http://www.opengis.net/ogc http://schemas.opengis.net/wms/1.3.0/exceptions_1_3_0.xsd">\n\t<ServiceException>\n\t\t<![CDATA[ It looks like your Sentinel Hub account has expired. ]]>\n\t</ServiceException>\n</ServiceExceptionReport>';

        nock('http://services.sentinel-hub.com')
            .get(`/v1/wms/${config.get('apikeys.sentinel')}`)
            .reply(400, responseString);

        const response = await requester
            .get(`/api/v1/high-res/sentinel`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(400);
        response.text.should.equal(responseString);
    });

    it('Get data for sentinel should return a 200 and the upstream data (happy case)', async () => {
        mockValidateRequestWithApiKey({});
        const responseString = 'happy data';

        nock('http://services.sentinel-hub.com')
            .get(`/v1/wms/${config.get('apikeys.sentinel')}`)
            .reply(200, responseString);

        const response = await requester
            .get(`/api/v1/high-res/sentinel`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(200);
        response.text.should.equal(responseString);
    });

    it('Get data for landsat should return an error if the upstream landsat account returns an error', async () => {
        mockValidateRequestWithApiKey({});
        const responseString = '<?xml version=\'1.0\' encoding="UTF-8"?>\n<ServiceExceptionReport version="1.3.0"\n\txmlns="http://www.opengis.net/ogc"\n\txmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n\txsi:schemaLocation="http://www.opengis.net/ogc http://schemas.opengis.net/wms/1.3.0/exceptions_1_3_0.xsd">\n\t<ServiceException>\n\t\t<![CDATA[ It looks like your Sentinel Hub account has expired. ]]>\n\t</ServiceException>\n</ServiceExceptionReport>';

        nock('http://services-uswest2.sentinel-hub.com')
            .get(`/v1/wms/${config.get('apikeys.landsat')}`)
            .reply(400, responseString);

        const response = await requester
            .get(`/api/v1/high-res/landsat`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(400);
        response.text.should.equal(responseString);
    });

    it('Get data for landsat should return a 200 and the upstream data (happy case)', async () => {
        mockValidateRequestWithApiKey({});
        const responseString = 'happy data';

        nock('http://services-uswest2.sentinel-hub.com')
            .get(`/v1/wms/${config.get('apikeys.landsat')}`)
            .reply(200, responseString);

        const response = await requester
            .get(`/api/v1/high-res/landsat`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(200);
        response.text.should.equal(responseString);
    });

    afterEach(async () => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
