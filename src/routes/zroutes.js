import { Router } from 'express';
import registerRoute from './registerRoute.js';
import loginRoute from './loginRoute.js';
import blogRoute from './blogRoute.js';
import projectsRoute from './projectsRoute.js';
import servicesRoute from './servicesRoute.js';
import skillsRoute from './skillsRoute.js';
import googleRoute from './googleRoute.js';
import contactRoute from "./contactRoute.js";
import aboutRoute from "./aboutRoute.js";
   
const routes = Router();

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to MUGEMA API!' });
});

routes.use('/auth', registerRoute);
routes.use('/auth', loginRoute);
routes.use('/auth', googleRoute);
routes.use('/posts', blogRoute);
routes.use('/projects', projectsRoute);
routes.use('/services', servicesRoute);
routes.use('/skills', skillsRoute);
routes.use("/messages", contactRoute);
routes.use("/about", aboutRoute);

export default routes;
 