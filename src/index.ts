import {UiApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {UiApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new UiApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Ping: ${url}/ping`);
  console.log(`Inspect: ${url}/inspect`);
  console.log(`Graph: ${url}/graph`);

  return app;
}
