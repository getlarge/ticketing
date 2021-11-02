/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import { json } from 'body-parser';

const app = express();
app.use(json());

app.get('/api/users/currentuser', (req, res) => {
  res.send('Hi there!');
});

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
