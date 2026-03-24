import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 */

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Link To Worker Api',
      version: '1.0.0',
      description: 'Swagger of link to worker api',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['src/routes/*.ts'], 
};

export const specs = swaggerJsdoc(options);