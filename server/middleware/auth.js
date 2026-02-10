import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

export async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Token verification failed:', error);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = {
            id: user.id,
            email: user.email,
        };

        next();
    } catch (err) {
        console.error('Auth verification error:', err);
        return res.status(500).json({ error: 'Authentication service error' });
    }
}
