import { Router } from 'express';
import ApplicationController from '../controllers/ApplicationController.js';
import ApplicationValidator from '../validations/application.js';
import authMiddleware from '../middlewares/authentication.js';
import authentication from '../middlewares/authentication.js';

const applicationRouter = Router();

applicationRouter.post(
  '/',
  authMiddleware.authLogin,
  ApplicationValidator.create,
  ApplicationController.createApplication,
);
applicationRouter.get(
  '/user/mine',
  authMiddleware.authLogin,
  ApplicationController.getApplicationByUser,
);
applicationRouter.get('/', ApplicationController.getApplications);
applicationRouter.get(
  '/:applicationId',
  ApplicationController.getApplication,
);
applicationRouter.patch(
  '/:applicationId',
  authentication.isAdmin,
  ApplicationController.decide,
);
applicationRouter.put(
  '/:applicationId',
  ApplicationValidator.update,
  ApplicationController.updateApplication,
);
applicationRouter.patch(
  '/membership/:applicationId',
  authentication.isAdmin,
  ApplicationController.editApplicationMembership,
);
applicationRouter.delete(
  '/:applicationId',
  authentication.isAdmin,
  ApplicationController.deleteApplication,
);

export default applicationRouter;
