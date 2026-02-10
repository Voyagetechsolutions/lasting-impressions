import supabaseAdmin from '../_lib/supabase.js';
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

// Admin login — signs in via Supabase, checks role === 'admin'
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check that the user is an admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Admin /me endpoint
async function handleMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

// Admin register (requires existing admin auth)
async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'admin' },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Update profile role to admin
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin', name })
      .eq('id', data.user.id);

    res.status(201).json({
      id: data.user.id,
      email: data.user.email,
      name,
      role: 'admin',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Customer signup — public, no auth required
async function handleCustomerSignup(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'customer' },
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }
      return res.status(400).json({ error: error.message });
    }

    // Update profile with phone if provided
    if (phone) {
      await supabaseAdmin
        .from('profiles')
        .update({ phone })
        .eq('id', data.user.id);
    }

    // Sign in to get a session token
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      // User created but couldn't sign in — still return success
      return res.status(201).json({
        token: null,
        user: {
          id: data.user.id,
          email: data.user.email,
          name,
          role: 'customer',
          phone: phone || null,
        },
      });
    }

    res.status(201).json({
      token: signInData.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role: 'customer',
        phone: phone || null,
      },
    });
  } catch (error) {
    console.error('Customer signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Customer login
async function handleCustomerLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile || profile.role !== 'customer') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role: profile.role,
        phone: profile.phone,
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Customer /me — returns profile + orders + bookings
async function handleCustomerMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  if (user.role !== 'customer') {
    return res.status(403).json({ error: 'Customer access only' });
  }

  try {
    // Orders and bookings are in Neon — import sql dynamically
    const { default: sql } = await import('../_lib/db.js');

    const orders = await sql`SELECT * FROM orders WHERE customer_id = ${user.id} ORDER BY created_at DESC`;
    const bookings = await sql`SELECT * FROM bookings WHERE customer_id = ${user.id} ORDER BY created_at DESC`;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
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
