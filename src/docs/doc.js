import applications from './membership/application.js';
import defaultPaths from './default.paths.js';
import memberships from './membership/membership.js';
import publications from './_publication.js';
import oltranz from './_oltranz.js';

const paths = {
  ...defaultPaths,
  ...memberships,
  ...applications,
  ...publications,
  ...oltranz,
};

const config = {
  swagger: '2.0',
  info: {
    version: '1.0.0.',
    title: 'RUPI APIs Documentation',
    description: '',
  },
  basePath: '/',
  schemes: ['http', 'https'],
  securityDefinitions: {
    JWT: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
    },
  },
  tags: [
    {
      name: 'RUPI APIs Documentation',
    },
  ],
  consumes: ['application/json'],
  produces: ['application/json'],
  paths,
};
export default config;
