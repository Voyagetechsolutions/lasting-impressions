import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getBookings(req, res);
    case 'POST':
      return createBooking(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getBookings(req, res) {
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
    const { classId, className, customer, date, time, attendees, totalPrice } = req.body;

    if (!classId || !customer) {
      return res.status(400).json({ error: 'Class ID and customer info are required' });
    }

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
}
