import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/doc.js';
import registerRoute from './registerRoute.js';
import loginRoute from './loginRoute.js';
import blogRoute from './blogRoute.js';
import projectsRoute from './projectsRoute.js';
import servicesRoute from './servicesRoute.js';
import testimonialRoute from './testimonialRoute.js';
import staffRoute from './staffRoute.js';
import googleRoute from './googleRoute.js';
import paymentRoute from './paymentRoute.js';
import publicationRouter from './publicationRoute.js';
import oltranzRouter from './oltranzRoute.js';
import applicationRouter from './applicationRoute.js';
import certificateRoute from './certificateRoute.js';

const routes = Router();

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to RUPI API!' });
});

routes.use('/api-docs', swaggerUi.serve);
routes.get('/api-docs', swaggerUi.setup(swaggerDocument));

routes.use('/auth', registerRoute);
routes.use('/auth', loginRoute);
routes.use('/auth', googleRoute);
routes.use('/posts', blogRoute);
routes.use('/projects', projectsRoute);
routes.use('/services', servicesRoute);
routes.use('/testimonial', testimonialRoute);
routes.use('/staff', staffRoute);
routes.use('/certificate', certificateRoute);
routes.use('/payment', paymentRoute);
routes.use('/api/applications', applicationRouter);
routes.use('/api/publications', publicationRouter);
routes.use('/api/opay', oltranzRouter);

export default routes;
