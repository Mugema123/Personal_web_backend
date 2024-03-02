import { Router } from 'express';
import PublicationController from '../controllers/PublicationController.js';
import PublicationValidator from '../validations/publication.js';
import authentication from '../middlewares/authentication.js';

const publicationRouter = Router();

publicationRouter.post(
  '/',
  PublicationValidator.create,
  authentication.authLogin,
  PublicationController.create,
);
publicationRouter.get('/', PublicationController.getAll);
publicationRouter.get('/:id', PublicationController.getOne);
publicationRouter.patch(
  '/:id',
  PublicationValidator.update,
  authentication.isAdmin,
  PublicationController.update,
);
publicationRouter.delete(
  '/:id',
  authentication.isAdmin,
  PublicationController.delete,
);

export default publicationRouter;
