import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getMessages(req, res);
    case 'POST':
      return createMessage(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getMessages(req, res) {
  const user = requireAuth(req, res);
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
