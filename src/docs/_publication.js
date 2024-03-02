import responses from './default.responses.js';

const publications = {
  '/api/publications': {
    post: {
      tags: ['publications'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'create membership',
      description: 'Ad a new membership',
      parameters: [
        {
          in: 'body',
          name: 'membership',
          required: true,
          schema: {
            example: {
              cover: '',
              name: '',
              link: '',
              title: '',
              description: '',
            },
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
    get: {
      tags: ['publications'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
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
      ],
      summary: 'findAll',
      description:
        'Returns the filtered publications according to the passed parameters',
      parameters: [],
      consumes: ['application/json'],
      responses,
    },
  },
  '/api/publications/{id}': {
    get: {
      tags: ['publications'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'findOne',
      parameters: [
        {
          in: 'path',
          name: 'id',
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
      tags: ['publications'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'update membership',
      description: 'update membership',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
        },
        {
          in: 'body',
          name: 'body',
          required: true,
          schema: {
            example: {
              cover: '',
              name: '',
              link: '',
              title: '',
              description: '',
            },
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
    delete: {
      tags: ['publications'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'delete',
      parameters: [
        {
          in: 'path',
          name: 'id',
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

export default publications;
