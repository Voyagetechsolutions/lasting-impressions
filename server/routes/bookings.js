import express from 'express';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all bookings (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { email } = req.query;
        
        let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
        
        if (email) {
            query = query.eq('customer_email', email);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create booking (public - from class booking form)
router.post('/', async (req, res) => {
    try {
        const { classId, className, customer, date, time, attendees, totalPrice } = req.body;

        if (!classId || !customer) {
            return res.status(400).json({ error: 'Class ID and customer info are required' });
        }

        // Decrease spots_left in the class
        const { error: updateError } = await supabase
            .from('classes')
            .update({ spots_left: supabase.raw('spots_left - ?', [attendees || 1]) })
            .eq('id', classId)
            .gte('spots_left', attendees || 1);

        if (updateError) throw updateError;

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                class_id: classId,
                class_name: className,
                customer_first_name: customer.firstName,
                customer_last_name: customer.lastName,
                customer_email: customer.email,
                customer_phone: customer.phone,
                date,
                time,
                attendees: attendees || 1,
                total_price: totalPrice ? parseFloat(totalPrice) : null
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update booking status (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
