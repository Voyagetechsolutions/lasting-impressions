import sql from '../_lib/db.js';
import { requireAuth, authenticate } from '../_lib/auth.js';

export default async function handler(req, res) {
  const id = req.query.params?.[0];

  if (id) {
    // Single booking routes: /api/bookings/:id
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = requireAuth(req, res);
    if (!user) return;

    try {
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
  } else {
    // Collection routes: /api/bookings
    switch (req.method) {
      case 'GET':
        return getBookings(req, res);
      case 'POST':
        return createBooking(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  }
}

async function getBookings(req, res) {
  const { customer_id } = req.query;

  // If customer_id is provided, authenticate the customer and return only their bookings
  if (customer_id) {
    const user = authenticate(req);
    if (!user || user.id !== customer_id) {
      return res.status(401).json({ error: 'Access denied' });
    }

    try {
      const bookings = await sql`SELECT * FROM bookings WHERE customer_id = ${customer_id} ORDER BY created_at DESC`;
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
      return res.json(formattedBookings);
    } catch (error) {
      console.error('Get customer bookings error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Admin: return all bookings
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const bookings = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;

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
}

async function createBooking(req, res) {
  try {
    const { classId, className, customer, date, time, attendees, totalPrice, customerId } = req.body;

    if (!classId || !customer) {
      return res.status(400).json({ error: 'Class ID and customer info are required' });
    }

    // If customerId is provided, verify the token matches
    let verifiedCustomerId = null;
    if (customerId) {
      const user = authenticate(req);
      if (user && user.id === customerId) {
        verifiedCustomerId = customerId;
      }
    }

    await sql`
      UPDATE classes
      SET spots_left = spots_left - ${attendees || 1}
      WHERE id = ${classId} AND spots_left >= ${attendees || 1}
    `;

    const newBooking = await sql`
      INSERT INTO bookings (
        class_id, class_name, customer_first_name, customer_last_name,
        customer_email, customer_phone, date, time, attendees, total_price, customer_id
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
        ${totalPrice ? parseFloat(totalPrice) : null},
        ${verifiedCustomerId}
      )
      RETURNING *
    `;

    res.status(201).json(newBooking[0]);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
