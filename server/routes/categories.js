import express from 'express';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create category (protected)
router.post('/', authenticateToken, async (req, res) => {
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
});

// Update category (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
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
});

// Delete category (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await sql`DELETE FROM categories WHERE id = ${id} RETURNING *`;

        if (deleted.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
