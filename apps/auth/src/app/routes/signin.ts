import { Router } from 'express';

const router = Router();

router.post('/api/users/signin', (req, res) => {
  res.send('Hey there!');
});

export { router as SigninRouter };
