import express from 'express';
import aboutController from '../controllers/aboutController.js';

const router = express.Router();

router.post('/addAbout', aboutController.addAbout);

router.get(
  '/getAboutContent',
  aboutController.getAboutContent,
);

router.patch(
  '/updateAbout',
  aboutController.updateAbout,
);

router.delete(
  '/deleteAbout',
  aboutController.deleteAbout,
);

export default router;
