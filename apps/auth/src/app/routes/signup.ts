import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';

import { DatabaseConnectionError, RequestValidationError } from '../errors';

const router = Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be betweem 4 and 20 characters'),
  ],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }
    // eslint-disable-next-line no-console
    console.log('Creating a user');

    throw new DatabaseConnectionError();
    // res.send({});
  }
);

export { router as SignupRouter };
