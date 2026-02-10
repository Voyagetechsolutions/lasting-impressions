import app from '../server/index.js';

// Export for Vercel serverless
export default async (req, res) => {
  return app(req, res);
};
