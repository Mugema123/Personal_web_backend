import express from 'express';
import skillsController from '../controllers/skillsController.js';

const router = express.Router();

router.post('/addSkill', skillsController.addSkill);

router.get(
  '/getAllSkills',
  skillsController.getAllSkills,
);

router.get(
  '/getSingleSkill',
  skillsController.getSingleSkill,
);

router.patch(
  '/updateSkill',
  skillsController.updateSkill,
);

router.patch(
  '/publish/:id',
  skillsController.publishSkill,
);

router.delete(
  '/deleteSkill',
  skillsController.deleteSkill,
);

export default router;
