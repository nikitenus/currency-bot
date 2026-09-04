import { loadConfig } from './config/env.js';
import { createBot } from './composition.js';
import { createPoller } from './delivery/poller.js';

const config = loadConfig();
const bot = createBot(config);
const poller = createPoller({ botToken: config.botToken, ...bot });

await poller.start();
