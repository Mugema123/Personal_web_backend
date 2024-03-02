import { Router } from 'express';
import OltranzController from '../controllers/OltranzController.js';
import OltranzValidate from '../validations/oltranz.js';
import authMiddleware from '../middlewares/authentication.js';

const oltranzRouter = Router();

oltranzRouter.post(
  '/paymentrequest',
  authMiddleware.authLogin,
  OltranzValidate.requestPay,
  OltranzController.requestPay,
);

oltranzRouter.post(
  '/handleOltranzPaymentCallback',
  OltranzController.handleOltranzPaymentCallback,
);


export default oltranzRouter;
