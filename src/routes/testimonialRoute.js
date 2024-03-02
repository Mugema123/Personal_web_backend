import express from 'express';
import testimonialController from '../controllers/testimonialController.js';
import authentication from '../middlewares/authentication.js';

const router = express.Router();

router.post('/addTestimonial', testimonialController.addTestimonial);

router.get(
  '/getAllTestimonials',
  testimonialController.getAllTestimonials,
);

router.get(
  '/getSingleTestimonial',
  testimonialController.getSingleTestimonial,
);

router.patch(
  '/updateTestimonial',
  authentication.isAdmin,
  testimonialController.updateTestimonial,
);

router.patch(
  '/publish/:id',
  authentication.isAdmin,
  testimonialController.publishTestimonial,
);

router.delete(
  '/deleteTestimonial',
  authentication.isAdmin,
  testimonialController.deleteTestimonial,
);

export default router;
