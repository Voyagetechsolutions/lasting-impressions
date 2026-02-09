import jwt from 'jsonwebtoken';

export function authenticate(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(req, res) {
  const user = authenticate(req);
  if (!user) {
    res.status(401).json({ error: 'Access token required' });
    return null;
  }
  return user;
}
