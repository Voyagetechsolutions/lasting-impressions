import supabaseAdmin from './supabase.js';

export async function authenticate(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return null;

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    // Fetch profile for role info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      role: profile?.role || 'customer',
      name: profile?.name,
      phone: profile?.phone,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(req, res) {
  const user = await authenticate(req);
  if (!user) {
    res.status(401).json({ error: 'Access token required' });
    return null;
  }
  return user;
}

export async function requireAdmin(req, res) {
  const user = await authenticate(req);
  if (!user) {
    res.status(401).json({ error: 'Access token required' });
    return null;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return user;
}
