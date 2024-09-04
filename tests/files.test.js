const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Your Express app
const { expect } = chai;

chai.use(chaiHttp);

describe('Files API', () => {
  let token;

  before(async () => {
    // Authenticate and get token
    const res = await chai.request(app)
      .post('/connect')
      .set('Authorization', 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=');
    
    token = res.body.token;
  });

  it('should get file data with size', async () => {
    const res = await chai.request(app)
      .get('/files/5f1e8896c7ba06511e683b25/data?size=250')
      .set('x-token', token);

    expect(res).to.have.status(200);
    expect(res).to.have.header('content-type', 'image/png');
  });

  // Add more tests for other endpoints
});
