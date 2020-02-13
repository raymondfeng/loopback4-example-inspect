// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {InspectApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {InspectApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new InspectApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Ping: ${url}/ping`);
  console.log(`Inspect: ${url}/inspect`);
  console.log(`SVG Graph: ${url}/graph`);
  console.log(`Graphviz DOT: ${url}/graph?format=dot`);
  console.log(`D3 Graph: ${url}/graph-d3.html`);

  return app;
}
