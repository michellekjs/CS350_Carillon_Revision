import { Router } from 'express';
import * as ChannelController from '../controllers/channel.controller';
import { checkIsLoggedIn } from '../controllers/middlewares/auth.middleware';

const router: Router = Router();

router.get('/', ChannelController.listChannel);

router.use(checkIsLoggedIn);

router
  .route('/')
  .post(ChannelController.createChannel)
  .delete(ChannelController.deleteChannel);

router.put('/:channelId/members/add', ChannelController.addMembers);
router.put('/:channelId/members/kick', ChannelController.kickMembers);
router.put(
  '/:channelId/description',
  ChannelController.changeChannelDescription,
);
router.put('/:channelId/owner', ChannelController.changeChannelAuthority);

export const channelRouter = router;
