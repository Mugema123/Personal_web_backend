import responses from './default.responses.js';

const oltranz = {
  '/api/opay/paymentrequest': {
    post: {
      tags: ['pay'],
      security: [
        {
          JWT: [],
        },
      ],
      summary: 'request payment',
      parameters: [
        {
          in: 'query',
          name: 'applicationId',
          required: true,
          type: 'string',
          schema: {
            example: '',
          },
        },
        {
          in: 'body',
          name: 'payload',
          type: 'object',
          required: true,
          schema: {
            example: {
              telephoneNumber: '25078...',
              amount: 100,
              description: 'Pay',
            },
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
  },
};

export default oltranz;
