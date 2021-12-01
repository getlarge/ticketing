// run with: node_modules/.bin/ts-node-dev --rs --notify false tools/nats-test/listener.ts
import * as nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

(async function () {
  console.clear();
  const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222',
  });

  await new Promise<void>((resolve, reject) => {
    stan.once('connect', () => {
      console.log('Listener connected to NATS server');
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

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable()
    .setDurableName('orders-subscriptions');

  // const subscription = stan.subscribe('ticket:create', options);
  const subscription = stan.subscribe(
    'ticket:updated',
    'orders-queue-group',
    options
  );
  subscription.on('message', (msg: nats.Message) => {
    console.log(msg.getSubject());
    const data = msg.getData();
    if (typeof data === 'string') {
      console.log(
        `Received event number ${msg.getSequence()}, with data : ${data}`
      );
    }
    msg.ack();
  });

  process.on('SIGINT', () => stan.close());
  process.on('SIGTERM', () => stan.close());
})();
