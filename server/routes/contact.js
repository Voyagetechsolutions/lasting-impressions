import express from 'express';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all contact messages (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit contact form (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        const { data, error } = await supabase
            .from('contact_messages')
            .insert({ name, email, phone, message })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create contact message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update message status (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('contact_messages')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update contact message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete message (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete contact message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
