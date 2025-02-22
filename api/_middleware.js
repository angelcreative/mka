import { createMiddleware } from '@vercel/edge';

export default createMiddleware({
  allowedMethods: ['POST'],
  cors: {
    origin: ['https://angelcreative.github.io'],
    methods: ['POST'],
    credentials: true
  }
}); 