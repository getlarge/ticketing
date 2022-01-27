const localtunnel = require('localtunnel');

(async (argv) => {
  // connectionUrl will be https://local-ticketing.loca.lt
  const subdomain = argv[2] || 'local-ticketing';
  const port = argv[3] ? +argv[3] : 80;
  const tunnel = await localtunnel({ port, subdomain });
  console.log(
    `Tunnel will redirect requests from ${tunnel.url} to http://localhost:${port}`
  );

  tunnel.on('close', () => {
    console.log(`Tunnel closed`);
  });
  process.on('beforeExit', () => {
    tunnel.close();
  });
})(process.argv);
