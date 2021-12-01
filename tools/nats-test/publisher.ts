// run with: node_modules/.bin/ts-node-dev --rs --notify false tools/nats-test/publisher.ts
import * as nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

(async function () {
  console.clear();
  const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222',
  });

  await new Promise<void>((resolve, reject) => {
    stan.once('connect', () => {
      console.log('Publisher connected to NATS server');
      resolve();
    });

    stan.once('error', (err) => {
      reject(err);
    });
  });

  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  const ticket = { id: '123', title: 'concert', price: 20 };
  stan.publish('ticket:created', JSON.stringify(ticket), (err, guid) => {
    console.log('event published', { guid });
  });

  process.on('SIGINT', () => stan.close());
  process.on('SIGTERM', () => stan.close());
})();
