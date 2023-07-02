import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { checkIsLoggedIn } from '../controllers/middlewares/auth.middleware';

const router: Router = Router();

router.get('/', UserController.list);
router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.post('/email', UserController.sendEmailVerification);
router.post('/verify', UserController.verifyEmail);

router.use(checkIsLoggedIn);

router
  .route('/:id')
  .get(UserController.checkInformation)
  .post(UserController.editInformation);

export const userRouter = router;
