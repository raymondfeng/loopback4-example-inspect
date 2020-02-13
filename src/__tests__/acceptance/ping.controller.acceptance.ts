// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect} from '@loopback/testlab';
import {InspectApplication} from '../..';
import {setupApplication} from './test-helper';

describe('PingController', () => {
  let app: InspectApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).to.containEql({greeting: 'Hello from LoopBack'});
  });

  it('invokes GET /inspect', async () => {
    const res = await client.get('/inspect').expect(200);
    expect(res.body).to.have.properties('name', 'bindings', 'parent');
  });

  it('invokes GET /inspect?includeParent=false', async () => {
    const res = await client.get('/inspect?includeParent=false').expect(200);
    expect(res.body).to.have.properties('name', 'bindings');
    expect(res.body).to.not.have.property('parent');
  });

  it('invokes GET /inspect?includeGraph=true', async () => {
    const res = await client.get('/inspect?includeGraph=true').expect(200);
    expect(res.body).to.have.properties('name', 'bindings', 'parent', 'graph');
  });

  it('invokes GET /graph', async () => {
    const res = await client.get('/graph').expect(200);
    expect(res.get('content-type')).to.match(/^image\/svg\+xml/);
  });

  it('invokes GET /graph?format=dot', async () => {
    const res = await client.get('/graph?format=dot').expect(200);
    expect(res.get('content-type')).to.match(/^text\/plain/);
    expect(res.text).to.match(/^digraph ContextGraph \{/);
  });
});
