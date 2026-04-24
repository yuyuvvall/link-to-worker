import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const protocol = isProduction ? 'https' : 'http';
const port = isProduction
  ? process.env.HTTPS_PORT
  : process.env.HTTP_PORT;

const host = process.env.HOST || 'localhost';

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
        url: `${protocol}://${host}:${port}`,
      },
    ],
  },
  apis: ['src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);