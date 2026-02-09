import bcrypt from 'bcryptjs';
import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, 'admin')
      RETURNING id, email, name, role
    `;

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
