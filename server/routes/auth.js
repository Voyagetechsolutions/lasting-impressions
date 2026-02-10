import express from 'express';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current admin user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        res.json({
            id: req.user.id,
            email: req.user.email,
            name: req.user.user_metadata?.full_name || req.user.email.split('@')[0],
            role: 'admin'
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});







// Get current customer profile with orders and bookings
router.get('/customer-me', authenticateToken, async (req, res) => {
    try {
        const email = req.user.email;

        // Fetch customer orders by email
        const orders = await sql`
            SELECT id, items, total, status, shipping_method as "shippingMethod", created_at as "createdAt"
            FROM orders
            WHERE customer_email = ${email}
            ORDER BY created_at DESC
        `;

        // Fetch customer bookings by email
        const bookings = await sql`
            SELECT id, class_name as "className", date, time, attendees, total_price as "totalPrice", status, created_at as "createdAt"
            FROM bookings
            WHERE customer_email = ${email}
            ORDER BY created_at DESC
        `;

        res.json({
            id: req.user.id,
            email: email,
            name: req.user.user_metadata?.full_name || email.split('@')[0],
            role: 'customer',
            phone: req.user.user_metadata?.phone,
            orders,
            bookings,
        });
    } catch (error) {
        console.error('Get customer profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
