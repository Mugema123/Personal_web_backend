import express from 'express';
import loginController from '../controllers/loginController.js';
import authentication from '../middlewares/authentication.js';

const router = express.Router();

router.post('/loginUser', loginController.loginUser);

router.get(
  '/loggedInUser',
  authentication.authLogin,
  loginController.loggedInUser,
);

router.post(
  '/logoutUser',
  authentication.authLogin,
  loginController.logoutUser,
);

router.post('/loginAdmin', loginController.loginAdmin);

router.post('/forgotPassword', loginController.forgotPassword);

router.get('/resetPassword', loginController.resetPassword);

router.put('/newPassword', loginController.newPassword);

router.post(
  '/emailRegisteredUsers',
  authentication.isAdmin,
  loginController.emailRegisteredUsers,
);

router.put(
  '/updateUser',
  authentication.authLogin,
  loginController.updateUser,
);

export default router;
