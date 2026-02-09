import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      return updateMessage(req, res, id);
    case 'DELETE':
      return deleteMessage(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function updateMessage(req, res, id) {
  const user = requireAuth(req, res);
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
  const user = requireAuth(req, res);
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
