import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getOrders(req, res);
    case 'POST':
      return createOrder(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getOrders(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;

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
}

async function createOrder(req, res) {
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
}
