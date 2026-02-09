import express from 'express';
import sql from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all bookings (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const bookings = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;

        // Transform to match frontend format
        const formattedBookings = bookings.map(booking => ({
            id: booking.id,
            classId: booking.class_id,
            className: booking.class_name,
            customer: {
                firstName: booking.customer_first_name,
                lastName: booking.customer_last_name,
                email: booking.customer_email,
                phone: booking.customer_phone,
            },
            date: booking.date,
            time: booking.time,
            attendees: booking.attendees,
            totalPrice: parseFloat(booking.total_price),
            status: booking.status,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at,
        }));

        res.json(formattedBookings);
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
        await sql`
      UPDATE classes
      SET spots_left = spots_left - ${attendees || 1}
      WHERE id = ${classId} AND spots_left >= ${attendees || 1}
    `;

        const newBooking = await sql`
      INSERT INTO bookings (
        class_id, class_name, customer_first_name, customer_last_name, 
        customer_email, customer_phone, date, time, attendees, total_price
      )
      VALUES (
        ${classId},
        ${className || null},
        ${customer.firstName},
        ${customer.lastName},
        ${customer.email},
        ${customer.phone || null},
        ${date || null},
        ${time || null},
        ${attendees || 1},
        ${totalPrice ? parseFloat(totalPrice) : null}
      )
      RETURNING *
    `;

        res.status(201).json(newBooking[0]);
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

        const updated = await sql`
      UPDATE bookings
      SET status = ${status},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

        if (updated.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(updated[0]);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
