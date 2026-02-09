import express from 'express';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all custom requests (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const requests = await sql`SELECT * FROM custom_requests ORDER BY created_at DESC`;

        // Transform to match frontend format
        const formattedRequests = requests.map(request => ({
            id: request.id,
            customer: {
                firstName: request.customer_first_name,
                lastName: request.customer_last_name,
                email: request.customer_email,
                phone: request.customer_phone,
            },
            description: request.description,
            specifications: request.specifications || {},
            images: request.images || [],
            status: request.status,
            quote: request.quote,
            createdAt: request.created_at,
            updatedAt: request.updated_at,
        }));

        res.json(formattedRequests);
    } catch (error) {
        console.error('Get custom requests error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit custom request (public)
router.post('/', async (req, res) => {
    try {
        const { customer, description, specifications } = req.body;

        if (!customer || !description) {
            return res.status(400).json({ error: 'Customer info and description are required' });
        }

        const newRequest = await sql`
      INSERT INTO custom_requests (
        customer_first_name, customer_last_name, customer_email, customer_phone,
        description, specifications
      )
      VALUES (
        ${customer.firstName},
        ${customer.lastName},
        ${customer.email},
        ${customer.phone || null},
        ${description},
        ${specifications ? JSON.stringify(specifications) : null}
      )
      RETURNING *
    `;

        res.status(201).json(newRequest[0]);
    } catch (error) {
        console.error('Create custom request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update custom request status/quote (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, quote } = req.body;

        const updated = await sql`
      UPDATE custom_requests
      SET status = COALESCE(${status}, status),
          quote = COALESCE(${quote ? JSON.stringify(quote) : null}, quote),
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        if (updated.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json(updated[0]);
    } catch (error) {
        console.error('Update custom request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
