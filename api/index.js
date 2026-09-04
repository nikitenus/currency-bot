import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

const app = buildApp(loadConfig());

export default async function handler(req, res) {
  await app.ready();
  app.server.emit('request', req, res);
}
