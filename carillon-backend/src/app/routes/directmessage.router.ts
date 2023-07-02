import { Router } from 'express';
import * as DirectmessageController from '../controllers/directmessage.controller';
import { checkIsLoggedIn } from '../controllers/middlewares/auth.middleware';

const router: Router = Router();

router.get('/', DirectmessageController.listDirectmessage);

router.use(checkIsLoggedIn);

router
  .route('/')
  .post(DirectmessageController.createDirectmessage)
  .delete(DirectmessageController.deleteMessage);

router.put('/:directmessageId/members/add', DirectmessageController.addMembers);
router.put(
  '/:directmessageId/members/kick',
  DirectmessageController.kickMembers,
);

export const directmessageRouter = router;
