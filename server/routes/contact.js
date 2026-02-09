import express from 'express';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all contact messages (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const messages = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC`;
        res.json(messages);
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit contact form (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        const newMessage = await sql`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (${name}, ${email}, ${subject || null}, ${message})
      RETURNING *
    `;

        res.status(201).json(newMessage[0]);
    } catch (error) {
        console.error('Create contact message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark message as read (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isRead } = req.body;

        const updated = await sql`
      UPDATE contact_messages
      SET is_read = ${isRead !== undefined ? isRead : true},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        if (updated.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(updated[0]);
    } catch (error) {
        console.error('Update contact message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete message (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await sql`DELETE FROM contact_messages WHERE id = ${id} RETURNING *`;

        if (deleted.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete contact message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
