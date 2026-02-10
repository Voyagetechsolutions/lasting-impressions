import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  const action = req.query.action?.[0];

  switch (action) {
    case 'login':
      return handleLogin(req, res);
    case 'me':
      return handleMe(req, res);
    case 'register':
      return handleRegister(req, res);
    case 'customer-signup':
      return handleCustomerSignup(req, res);
    case 'customer-login':
      return handleCustomerLogin(req, res);
    case 'customer-me':
      return handleCustomerMe(req, res);
    default:
      return res.status(404).json({ error: 'Not found' });
  }
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function handleMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const users = await sql`SELECT id, email, name, role FROM users WHERE id = ${user.id} LIMIT 1`;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, 'admin')
      RETURNING id, email, name, role
    `;

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function handleCustomerSignup(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await sql`
      INSERT INTO users (email, password_hash, name, role, phone)
      VALUES (${email}, ${hashedPassword}, ${name}, 'customer', ${phone || null})
      RETURNING id, email, name, role, phone
    `;

    const token = jwt.sign(
      { id: newUser[0].id, email: newUser[0].email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: newUser[0],
    });
  } catch (error) {
    console.error('Customer signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function handleCustomerLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await sql`SELECT * FROM users WHERE email = ${email} AND role = 'customer' LIMIT 1`;

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function handleCustomerMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const users = await sql`SELECT id, email, name, role, phone FROM users WHERE id = ${user.id} AND role = 'customer' LIMIT 1`;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = users[0];

    // Fetch customer's orders
    const orders = await sql`SELECT * FROM orders WHERE customer_id = ${customer.id} ORDER BY created_at DESC`;

    // Fetch customer's bookings
    const bookings = await sql`SELECT * FROM bookings WHERE customer_id = ${customer.id} ORDER BY created_at DESC`;

    res.json({
      ...customer,
      orders: orders.map(order => ({
        id: order.id,
        items: order.items,
        total: parseFloat(order.total),
        status: order.status,
        shippingMethod: order.shipping_method,
        createdAt: order.created_at,
      })),
      bookings: bookings.map(booking => ({
        id: booking.id,
        className: booking.class_name,
        date: booking.date,
        time: booking.time,
        attendees: booking.attendees,
        totalPrice: parseFloat(booking.total_price),
        status: booking.status,
        createdAt: booking.created_at,
      })),
    });
  } catch (error) {
    console.error('Customer me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
