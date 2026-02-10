import sql from '../_lib/db.js';
import { requireAuth, authenticate } from '../_lib/auth.js';

export default async function handler(req, res) {
  const id = req.query.params?.[0];

  if (id) {
    // Single order routes: /api/orders/:id
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = await requireAuth(req, res);
    if (!user) return;

    try {
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
  } else {
    // Collection routes: /api/orders
    switch (req.method) {
      case 'GET':
        return getOrders(req, res);
      case 'POST':
        return createOrder(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  }
}

async function getOrders(req, res) {
  const { customer_id } = req.query;

  // If customer_id is provided, authenticate the customer and return only their orders
  if (customer_id) {
    const user = await authenticate(req);
    if (!user || user.id !== customer_id) {
      return res.status(401).json({ error: 'Access denied' });
    }

    try {
      const orders = await sql`SELECT * FROM orders WHERE customer_id = ${customer_id} ORDER BY created_at DESC`;
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
      return res.json(formattedOrders);
    } catch (error) {
      console.error('Get customer orders error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Admin: return all orders
  const user = await requireAuth(req, res);
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
    const { customer, items, total, shippingMethod, shippingAddress, paymentMethod, customerId } = req.body;

    if (!customer || !items || !total) {
      return res.status(400).json({ error: 'Customer, items, and total are required' });
    }

    // If customerId is provided, verify the token matches
    let verifiedCustomerId = null;
    if (customerId) {
      const user = await authenticate(req);
      if (user && user.id === customerId) {
        verifiedCustomerId = customerId;
      }
    }

    const newOrder = await sql`
      INSERT INTO orders (
        customer_first_name, customer_last_name, customer_email, customer_phone,
        items, total, shipping_method, shipping_address, payment_method, customer_id
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
        ${paymentMethod || null},
        ${verifiedCustomerId}
      )
      RETURNING *
    `;

    res.status(201).json(newOrder[0]);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
