import { randomBytes } from 'node:crypto';
import * as nats from 'node-nats-streaming';

export class NatsStreamingPublisher {
  connection: nats.Stan;

  constructor(
    private options: {
      clusterId: string;
      clientId: string;
      connectOptions?: nats.StanOptions;
    }
  ) {}

  createConnection(
    clusterID: string,
    clientID: string,
    connectOptions?: nats.StanOptions
  ): Promise<nats.Stan> {
    const nc = nats.connect(
      clusterID,
      `${clientID}-${randomBytes(8).toString('hex')}`,
      connectOptions
    );
    return new Promise((resolve, reject) => {
      nc.on('connect', () => resolve(nc));
      nc.on('error', (err) => reject(err));
    });
  }

  async connect(): Promise<nats.Stan> {
    if (this.connection) {
      return Promise.resolve(this.connection);
    }
    this.connection = await this.createConnection(
      this.options.clusterId,
      this.options.clientId,
      this.options.connectOptions
    );
    return this.connection;
  }

  close(): void {
    this.connection.close();
    this.connection = null;
  }
}
