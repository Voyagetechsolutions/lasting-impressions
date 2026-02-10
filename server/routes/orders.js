import express from 'express';
import supabase from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all orders (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { email } = req.query;
        
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        
        if (email) {
            query = query.eq('customer_email', email);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create order (public - from checkout)
router.post('/', async (req, res) => {
    try {
        const { customer, items, total, shippingMethod, shippingAddress, paymentMethod } = req.body;

        if (!customer || !items || !total) {
            return res.status(400).json({ error: 'Customer, items, and total are required' });
        }

        const { data, error } = await supabase
            .from('orders')
            .insert({
                customer_first_name: customer.firstName,
                customer_last_name: customer.lastName,
                customer_email: customer.email,
                customer_phone: customer.phone,
                items,
                total: parseFloat(total),
                shipping_method: shippingMethod,
                shipping_address: shippingAddress,
                payment_method: paymentMethod
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
