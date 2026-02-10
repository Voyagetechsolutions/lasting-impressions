import express from 'express';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all custom requests (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('custom_requests')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get custom requests error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit custom request (public)
router.post('/', async (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, bead_type, quantity, color, size, description, budget } = req.body;

        if (!customer_name || !customer_email || !description) {
            return res.status(400).json({ error: 'Customer info and description are required' });
        }

        const { data, error } = await supabase
            .from('custom_requests')
            .insert({
                customer_name,
                customer_email,
                customer_phone,
                bead_type,
                quantity,
                color,
                size,
                description,
                budget
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create custom request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update custom request status (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('custom_requests')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update custom request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
