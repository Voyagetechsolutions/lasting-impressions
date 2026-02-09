import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const users = await sql`SELECT id, email, name, role FROM users WHERE id = ${req.user.id} LIMIT 1`;

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register new admin (protected - only existing admins can create new admins)
router.post('/register', authenticateToken, async (req, res) => {
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
});

export default router;
