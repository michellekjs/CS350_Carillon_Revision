import { Router } from 'express';
import * as ChatController from '../controllers/chat.controller';
import { memoryImageUploader } from '../util/multer';

const router: Router = Router();

router.get('/:id', ChatController.listMessages);
router.post('/file', memoryImageUploader.single('file'), ChatController.uploadImage)

export const chatRouter = router;
