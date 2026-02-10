import express from 'express';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all classes (public)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('date', { ascending: true });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single class (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create class (protected)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, level, date, time, duration, price, max_participants, spots_left, image_url } = req.body;

        if (!title || !price) {
            return res.status(400).json({ error: 'Title and price are required' });
        }

        const { data, error } = await supabase
            .from('classes')
            .insert({
                title,
                description,
                level: level || 'Beginner',
                date,
                time,
                duration,
                price: parseFloat(price),
                max_participants: parseInt(max_participants) || 10,
                spots_left: parseInt(spots_left) || parseInt(max_participants) || 10,
                image_url
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update class (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('classes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete class (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
