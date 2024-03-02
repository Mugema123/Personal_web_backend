import responses from '../default.responses.js';

const applications = {
  '/api/applications': {
    post: {
      tags: ['applications'],
      security: [
        {
          JWT: [],
        },
      ],
      summary: 'create application',
      description: 'Ad a new application',
      parameters: [
        {
          in: 'body',
          name: 'application',
          required: true,
          schema: {
            example: {
              category: 'individual',
              information: {
                plan: 'junior',
              },
            },
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
    get: {
      tags: ['applications'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'findAll',
      description:
        'Returns the filtered applications according to the passed parameters',
      parameters: [
        {
          in: 'query',
          name: 'page',
          required: false,
          type: 'integer',
          schema: {
            example: 1,
          },
        },
        {
          in: 'query',
          name: 'limit',
          required: false,
          type: 'integer',
          schema: {
            example: 10,
          },
        },
        {
          in: 'query',
          name: 'plan',
          type: 'string',
          description: 'Application plan: allowed values: junior,...',
          required: false,
          schema: {
            example: '',
          },
        },
        {
          in: 'query',
          name: 'category',
          type: 'string',
          description:
            'Application plan: allowed values: company, individual',
          required: false,
          schema: {
            example: '',
          },
        },
        {
          in: 'query',
          name: 'sortBy',
          description:
            'Sort applictions by recent or oldest: allowed values: recent, oldest',
          type: 'string',
          required: false,
          schema: {
            example: 'recent',
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
  },
  '/api/applications/{applicationId}': {
    get: {
      tags: ['applications'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'findOne',
      parameters: [
        {
          in: 'path',
          name: 'applicationId',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
    put: {
      tags: ['applications'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'update application',
      description: 'update application',
      parameters: [
        {
          in: 'path',
          name: 'applicationId',
          required: true,
          schema: {
            type: 'string',
          },
        },
        {
          in: 'body',
          name: 'application',
          required: true,
          schema: {
            example: {
              category: 'individual',
              information: {
                plan: 'junior',
                email: '',
              },
            },
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
    delete: {
      tags: ['applications'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'delete',
      parameters: [
        {
          in: 'path',
          name: 'applicationId',
          required: true,
          schema: {
            type: 'string',
          },
        },
        {
          in: 'path',
          name: 'membershipId',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
  },
};

export default applications;
