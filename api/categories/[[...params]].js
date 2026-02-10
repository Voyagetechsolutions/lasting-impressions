import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  const id = req.query.params?.[0];

  if (id) {
    // Single category routes: /api/categories/:id
    switch (req.method) {
      case 'PUT':
        return updateCategory(req, res, id);
      case 'DELETE':
        return deleteCategory(req, res, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } else {
    // Collection routes: /api/categories
    switch (req.method) {
      case 'GET':
        return getCategories(req, res);
      case 'POST':
        return createCategory(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  }
}

async function getCategories(req, res) {
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function createCategory(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const newCategory = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name}, ${description || null})
      RETURNING *
    `;

    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateCategory(req, res, id) {
  const user = await requireAuth(req, res);
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
  const user = await requireAuth(req, res);
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
