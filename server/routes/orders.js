import express from 'express';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all orders (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;

        // Transform to match frontend format
        const formattedOrders = orders.map(order => ({
            id: order.id,
            customer: {
                firstName: order.customer_first_name,
                lastName: order.customer_last_name,
                email: order.customer_email,
                phone: order.customer_phone,
            },
            items: order.items,
            total: parseFloat(order.total),
            status: order.status,
            shippingMethod: order.shipping_method,
            shippingAddress: order.shipping_address,
            paymentMethod: order.payment_method,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
        }));

        res.json(formattedOrders);
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

        const newOrder = await sql`
      INSERT INTO orders (
        customer_first_name, customer_last_name, customer_email, customer_phone,
        items, total, shipping_method, shipping_address, payment_method
      )
      VALUES (
        ${customer.firstName},
        ${customer.lastName},
        ${customer.email},
        ${customer.phone || null},
        ${JSON.stringify(items)},
        ${parseFloat(total)},
        ${shippingMethod || null},
        ${shippingAddress ? JSON.stringify(shippingAddress) : null},
        ${paymentMethod || null}
      )
      RETURNING *
    `;

        res.status(201).json(newOrder[0]);
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

        const updated = await sql`
      UPDATE orders
      SET status = ${status},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        if (updated.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(updated[0]);
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
