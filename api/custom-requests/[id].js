import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  try {
    const { status, quote } = req.body;

    const updated = await sql`
      UPDATE custom_requests
      SET status = COALESCE(${status}, status),
          quote = COALESCE(${quote ? JSON.stringify(quote) : null}, quote),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Update custom request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
