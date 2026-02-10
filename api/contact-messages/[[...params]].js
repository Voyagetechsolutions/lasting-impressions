import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  const id = req.query.params?.[0];

  if (id) {
    // Single message routes: /api/contact-messages/:id
    switch (req.method) {
      case 'PUT':
        return updateMessage(req, res, id);
      case 'DELETE':
        return deleteMessage(req, res, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } else {
    // Collection routes: /api/contact-messages
    switch (req.method) {
      case 'GET':
        return getMessages(req, res);
      case 'POST':
        return createMessage(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  }
}

async function getMessages(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const messages = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC`;
    res.json(messages);
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function createMessage(req, res) {
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
}

async function updateMessage(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
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
}

async function deleteMessage(req, res, id) {
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const deleted = await sql`DELETE FROM contact_messages WHERE id = ${id} RETURNING *`;

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
