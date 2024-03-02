import express from 'express';
import UserCreated from '../controllers/registerController.js';
import authentication from '../middlewares/authentication.js';

const router = express.Router();

router.post('/', UserCreated.createNewUser);
router.get('/', UserCreated.getAllUsers);
router.get('/verifyEmail', UserCreated.verifyEmail);
router.put(
  '/assignUserRole/:id',
  authentication.isSuperAdmin,
  UserCreated.assignUserRole,
);
router.put(
  '/updateAuthorInfo/:id',
  authentication.authLogin,
  UserCreated.addAauthorInfo,
);
router.get('/getSingleUser/:id', UserCreated.getUserById);
router.put(
  '/certificateMessageDisplayed',
  authentication.authLogin,
  UserCreated.certificateMessageDisplayed,
);
router.delete(
  '/deleteUser',
  authentication.isAdmin,
  UserCreated.deleteUser,
);

export default router;
