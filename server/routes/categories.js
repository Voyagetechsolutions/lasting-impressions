import express from 'express';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { selectAll, insert, update, deleteRow } from '../db-helpers.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await selectAll(supabase, 'categories', 'name', true);
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

        const newCategory = await insert(supabase, 'categories', { name, description });
        res.status(201).json(newCategory);
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

        const updated = await update(supabase, 'categories', id, { name, description });
        res.json(updated);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete category (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await deleteRow(supabase, 'categories', id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
