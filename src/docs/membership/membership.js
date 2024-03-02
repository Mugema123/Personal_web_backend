import responses from '../default.responses.js';

const memberships = {
  '/api/memberships': {
    post: {
      tags: ['memberships'],
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
              title: 'JUNIOR',
              price: 5000,
              isCompany: false,
              isPopular: false,
              features: [
                {
                  title: 'Lorem ipsum',
                  isAvailable: true,
                },
                {
                  title: 'Lorem ipsum',
                  isAvailable: false,
                },
                {
                  title: 'Lorem ipsum',
                  isAvailable: false,
                },
              ],
            },
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
    get: {
      tags: ['memberships'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],

      summary: 'findAll',
      description:
        'Returns the filtered memberships according to the passed parameters',
      parameters: [
        {
          in: 'query',
          name: 'category',
          required: false,
          type: 'string',
          description: 'Allowed categories are: individual, company',
          schema: {
            example: 'individual',
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
  },
  '/api/memberships/{membershipId}': {
    get: {
      tags: ['memberships'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'findOne',
      parameters: [
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
    put: {
      tags: ['memberships'],
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
          name: 'membershipId',
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
              title: 'JUNIOR',
              price: 5000,
              isCompany: false,
              isPopular: false,
              features: [
                {
                  title: 'Lorem ipsum',
                  isAvailable: true,
                },
                {
                  title: 'Lorem ipsum',
                  isAvailable: false,
                },
                {
                  title: 'Lorem ipsum',
                  isAvailable: false,
                },
              ],
            },
          },
        },
      ],
      consumes: ['application/json'],
      responses,
    },
    delete: {
      tags: ['memberships'],
      //   security: [
      //     {
      //       JWT: [],
      //     },
      //   ],
      summary: 'delete',
      parameters: [
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

export default memberships;
