import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      return updateCategory(req, res, id);
    case 'DELETE':
      return deleteCategory(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function updateCategory(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const { name, description } = req.body;

    const updated = await sql`
      UPDATE categories
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function deleteCategory(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const deleted = await sql`DELETE FROM categories WHERE id = ${id} RETURNING *`;

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
