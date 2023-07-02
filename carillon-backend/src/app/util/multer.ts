import multer from 'multer';

const storage = multer.memoryStorage();

export const memoryImageUploader = multer({
  storage: storage,
});
