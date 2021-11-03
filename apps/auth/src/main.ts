import 'express-async-errors';

import { json } from 'body-parser';
import * as express from 'express';

import { NotFoundError } from './app/errors';
import { errorHandler } from './app/middlewares/error-handler';
import {
  CurrentUserRouter,
  SigninRouter,
  SignoutRouter,
  SignupRouter,
} from './app/routes/';

const app = express();
app.use(json());

app.use(CurrentUserRouter);
app.use(SigninRouter);
app.use(SignoutRouter);
app.use(SignupRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
