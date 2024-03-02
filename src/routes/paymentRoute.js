import express from 'express';
import paymentController from '../controllers/paymentController.js';
import authentication from '../middlewares/authentication.js';

const router = express.Router();

router.get(
  '/',
  authentication.isFinanceAdmin,
  paymentController.getAllPayments,
);

router.post(
  '/confirmPayment',
  authentication.authLogin,
  paymentController.confirmPayment,
);

router.post('/handlePaymentCallback', paymentController.handlePaymentCallback);

router.delete('/deletePayment', paymentController.deletePayment);

router.get(
  '/userPayments',
  authentication.authLogin,
  paymentController.getUserPayments,
);
router.get(
  '/getApplicationPayments/:applicationId',
  authentication.isFinanceAdmin,
  paymentController.getApplicationPayments,
);
router.put(
  '/decideOnPayments/:paymentId',
  authentication.isFinanceAdmin,
  paymentController.decideOnPayments,
);
router.put(
  '/hasACertificate',
  authentication.authLogin,
  paymentController.hasACertificate,
);

router.post(
  '/notify',
  authentication.isAdmin,
  paymentController.notifyUser,
);

export default router;
