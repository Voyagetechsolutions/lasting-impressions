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
        const { classId, className, customer, date, time, attendees, totalPrice, bookingReference, notes, status } = req.body;

        if (!classId || !customer) {
            return res.status(400).json({ error: 'Class ID and customer info are required' });
        }

        // Fetch current spots_left
        const { data: classData, error: fetchError } = await supabase
            .from('classes')
            .select('spots_left')
            .eq('id', classId)
            .single();

        if (fetchError) throw fetchError;

        const numAttendees = attendees || 1;
        if (classData.spots_left < numAttendees) {
            return res.status(400).json({ error: 'Not enough spots available' });
        }

        // Decrease spots_left
        const { error: updateError } = await supabase
            .from('classes')
            .update({ spots_left: classData.spots_left - numAttendees })
            .eq('id', classId);

        if (updateError) throw updateError;

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                class_id: classId,
                class_name: className,
                booking_reference: bookingReference || null,
                customer_first_name: customer.firstName,
                customer_last_name: customer.lastName,
                customer_email: customer.email || null,
                customer_phone: customer.phone || null,
                date,
                time,
                attendees: numAttendees,
                total_price: totalPrice ? parseFloat(totalPrice) : null,
                notes: notes || null,
                status: status || 'PENDING_WHATSAPP_CONFIRMATION'
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
